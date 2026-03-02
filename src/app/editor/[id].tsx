import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable, Alert,
  KeyboardAvoidingView, Platform, StatusBar, ScrollView, BackHandler,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { useNotesStore } from '../../store/notesStore';
import { useTheme } from '../../store/themeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { strings } from '../../i18n/strings';
import { wordCount, markdownToHtml, stripMarkdown } from '../../utils/markdown';
import { Svg, Path, Circle, Rect } from 'react-native-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { ThemedModal } from '../../components/ui/ThemedModal';
import { useAiStore } from '../../store/aiStore';
import { useTypography } from '../../store/typographyStore';
import { AiService } from '../../services/aiService';
import * as ImagePicker from 'expo-image-picker';
import { log } from '../../utils/Logger';

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const theme = useTheme();
  const settings = useSettingsStore(); // to get fonts & language
  const { colors, font, radius, shadow } = theme;
  const type = useTypography();
  const loc = strings[settings.language] || strings['En'];

  const notes = useNotesStore((s) => s.notes);
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const note = notes.find((n) => String(n.id) === id);

  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [bodyText, setBodyText] = useState(''); // Text representation for word count

  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [appAlert, setAppAlert] = useState<{ visible: boolean; title: string; subtitle: string }>({ visible: false, title: '', subtitle: '' });
  const ai = useAiStore();

  const richText = useRef<RichEditor>(null);
  const scrollRef = useRef<ScrollView>(null);
  const isMounted = useRef(false);
  const [editorHeight, setEditorHeight] = useState<number>(400);

  useEffect(() => {
    isMounted.current = true;
    log.info(`Opening note: ${id}`);

    if (note) {
      setTitle(note.title);
      setTag(note.tag || '');
      const stripped = note.body.replace(/<[^>]*>?/gm, ' ');
      setBodyText(stripped || '');
    }

    // Inject List & Quote Breakout Script
    const script = `
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            let node = range.startContainer;
            while (node && node.nodeName !== 'LI' && node.nodeName !== 'BLOCKQUOTE' && node.nodeName !== 'BODY') { 
              node = node.parentNode; 
            }
            if (node && (node.nodeName === 'LI' || node.nodeName === 'BLOCKQUOTE') && node.textContent.trim() === '') {
              e.preventDefault();
              document.execCommand('outdent', false, null);
            }
          }
        }
      });
      true;
    `;

    const timer = setTimeout(() => {
      if (isMounted.current) {
        // @ts-ignore - Pell library uses lowercase 's'
        richText.current?.injectJavascript(script);
      }
    }, 800);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
  }, [id, note?.id]);

  const showSaved = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if (isDirty && !settings.autoSave) {
        setShowExitModal(true);
        return true;
      }
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [isDirty, settings.autoSave]);

  const handleSave = useCallback(async () => {
    const html = await richText.current?.getContentHtml();
    if (note) {
      updateNote(note.id, { title: title.trim(), body: html?.trim() || '', tag: tag.trim() });
      setIsDirty(false);
      showSaved();
    }
  }, [note, title, tag, updateNote, showSaved]);

  const handleDone = useCallback(async () => {
    await handleSave();
    router.back();
  }, [handleSave, router]);

  const handleBack = useCallback(() => {
    if (isDirty && !settings.autoSave) {
      setShowExitModal(true);
    } else {
      router.back();
    }
  }, [isDirty, settings.autoSave, router]);

  const handleDelete = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const insertHindiPunctuation = (char: string) => {
    richText.current?.insertText(char);
  };

  const handleInsertLink = () => {
    if (linkUrl.trim()) {
      richText.current?.insertLink(title || 'Link', linkUrl.trim());
      setLinkUrl('');
      setShowLinkModal(false);
    }
  };

  const handleInsertImage = () => {
    if (imageUrl.trim()) {
      richText.current?.insertImage(imageUrl.trim());
      setImageUrl('');
      setShowImageModal(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7, // Slightly lower for performance with base64
      });

      if (!result.canceled && result.assets[0].uri) {
        const uri = result.assets[0].uri;

        // Read file as Base64 to ensure persistence and compatibility
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        const type = uri.split('.').pop() || 'png';
        const dataUri = `data:image/${type};base64,${base64}`;

        richText.current?.insertImage(dataUri);
        setShowImageModal(false);
        log.info("Image inserted as Base64 data URI");
      }
    } catch (e) {
      console.error("Failed to pick image", e);
      setAppAlert({ visible: true, title: "Error", subtitle: "Could not load image." });
    }
  };

  const handleExportPDF = useCallback(async () => {
    try {
      if (!note) return;
      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <title>${note.title || 'Note'}</title>
            <style>
              body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.8; font-size: 16px; }
              h1 { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; font-size: 32px; margin-bottom: 24px; color: #000; font-weight: 800; }
              h2 { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; font-size: 24px; margin-top: 24px; margin-bottom: 12px; font-weight: 700; color: #222; }
              blockquote { border-left: 4px solid #C14E28; padding-left: 16px; font-style: italic; color: #555; background: #f9f9f9; padding: 12px 16px; margin: 16px 0; border-radius: 4px; }
              ul, ol { margin-top: 10px; margin-bottom: 10px; padding-left: 24px; }
              li { margin-bottom: 6px; }
            </style>
          </head>
          <body>
            <h1>${note.title}</h1>
            <div>${note.body}</div>
          </body>
        </html>
      `;
      // By supplying the filename, some OS share dialogs will use it
      const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });

      // Create a friendly name
      const safeTitle = (note.title || 'Untitled_Note').replace(/[^a-zA-Z0-9 -]/g, '').trim().replace(/ /g, '_');
      const newUri = `${FileSystem.cacheDirectory}${safeTitle}.pdf`;
      await FileSystem.copyAsync({ from: uri, to: newUri });

      // Provide an explicit UTI and title for the Share dialog
      await Sharing.shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: safeTitle });
    } catch (e) {
      console.warn(e);
    }
  }, [note]);

  const handleExportTextFile = useCallback(async (ext: 'txt' | 'md') => {
    try {
      if (!note) return;
      setShowExportModal(false);
      const safeTitle = (note.title || 'Untitled_Note').replace(/[^a-zA-Z0-9 -]/g, '').trim().replace(/ /g, '_');
      const filename = `${safeTitle}.${ext}`;
      const newUri = `${FileSystem.cacheDirectory}${filename}`;
      // Basic export: TXT gets unformatted plain text, MD gets the rich HTML (unless we add a Turndown parser)
      const content = ext === 'txt' ? bodyText : note.body;
      await FileSystem.writeAsStringAsync(newUri, content);
      await Sharing.shareAsync(newUri, { dialogTitle: safeTitle });
    } catch (e) {
      console.warn(e);
    }
  }, [note, bodyText]);

  const handleExportMenu = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const handleAiTitle = async () => {
    setShowAiModal(false);
    try {
      if (!bodyText.trim()) return;
      setIsGenerating(true);
      const generatedTitle = await AiService.getSmartTitle(bodyText.trim());
      setTitle(generatedTitle);
    } catch (e: any) {
      setAppAlert({ visible: true, title: "Spark AI Error", subtitle: e.message || "Failed to generate title." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiSummary = async () => {
    setShowAiModal(false);
    try {
      if (!bodyText.trim()) return;
      setIsGenerating(true);
      const summary = await AiService.getSummarization(bodyText.trim());
      setSummaryText(summary);
      setShowSummaryModal(true);
    } catch (e: any) {
      setAppAlert({ visible: true, title: "Spark AI Error", subtitle: e.message || "Failed to summarize note." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomAiPrompt = async () => {
    if (!aiPrompt.trim()) return;
    setShowPromptModal(false);
    try {
      setIsGenerating(true);
      const output = await AiService.getDynamicGeneration(aiPrompt.trim());
      richText.current?.insertHTML(`<br><br>${markdownToHtml(output)}<br>`);
      setAiPrompt('');
    } catch (e: any) {
      setAppAlert({ visible: true, title: "Spark AI Error", subtitle: e.message || "Failed to generate content." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiFormat = async () => {
    setShowAiModal(false);
    try {
      if (!bodyText.trim()) return;
      setIsGenerating(true);
      const output = await AiService.getFormatNote(bodyText.trim());
      richText.current?.setContentHTML(markdownToHtml(output));
    } catch (e: any) {
      setAppAlert({ visible: true, title: "Spark AI Error", subtitle: e.message || "Failed to format content." });
    } finally {
      setIsGenerating(false);
    }
  };

  const s = useMemo(() => StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.strokeDim + '44' },
    circleBtn: {
      width: 38, height: 38, borderRadius: 99, borderWidth: 1.5, borderColor: colors.stroke,
      backgroundColor: colors.bgRaised, justifyContent: 'center', alignItems: 'center',
      ...shadow.gentle, shadowColor: colors.shadow
    },
    circleBtnActive: { backgroundColor: colors.accent, borderColor: colors.accentDark },
    headerMid: { flex: 1, alignItems: 'center' },
    headerDate: { fontFamily: font.mono, fontSize: 11, color: colors.inkDim },
    savedBadge: { fontFamily: font.mono, fontSize: 9, color: colors.accent, marginTop: 2 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    doneBtn: { backgroundColor: colors.accent, paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, ...shadow.gentle, shadowColor: colors.accentDark },
    doneBtnActive: { transform: [{ translateY: 2 }], shadowOffset: { width: 0, height: 1 }, elevation: 1 },
    doneBtnText: { fontFamily: font.sansSemi, fontSize: 13, color: colors.white },
    exportBtnText: { color: colors.white }, // High contrast for share/export

    scroll: { flex: 1 },
    content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 60 },
    titleInput: { fontFamily: font.display, fontSize: 26 * theme.fontSize, fontWeight: '700', color: colors.ink, marginBottom: 16, padding: 0, lineHeight: 34 * theme.fontSize },

    // Rich Editor specific
    editorContainer: { minHeight: 400, flex: 1 },

    tagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.strokeDim + '55' },
    tagHash: { fontFamily: font.mono, fontSize: 14, color: colors.accent, marginRight: 4 },
    tagInput: { ...type.bodyLarge, fontFamily: font.sans, color: colors.inkMid, flex: 1, padding: 0 },
    bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.strokeDim },
    bottomBarText: { ...type.labelMedium, fontFamily: font.mono, color: colors.inkDim },

    notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    notFoundText: { fontFamily: font.sansSemi, fontSize: 14, color: colors.inkMid },

    // Toolbar custom
    toolbarRoot: {
      backgroundColor: colors.bgRaised,
      borderTopWidth: 1.5,
      borderTopColor: colors.stroke,
    }
  }), [colors, font, shadow, radius]);

  if (!note) {
    return (
      <View style={s.root}>
        <View style={s.notFound}>
          <Pressable onPress={() => router.back()} style={s.circleBtn} hitSlop={12}>
            <Svg viewBox="0 0 20 20" width={20} height={20} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round">
              <Path d="M15 10H5M10 5l-5 5 5 5" />
            </Svg>
          </Pressable>
          <Text style={s.notFoundText}>{loc.editor.notFound}</Text>
        </View>
      </View>
    );
  }

  const dateStr = new Date(note.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase();
  const wc = wordCount(bodyText);

  return (
    <View style={s.root}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

      <View style={s.header}>
        <Pressable onPress={handleBack} style={s.circleBtn} hitSlop={12}>
          <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M5 12l14 0" />
            <Path d="M5 12l6 6" />
            <Path d="M5 12l6 -6" />
          </Svg>
        </Pressable>

        <View style={s.headerMid}>
          <Text style={s.headerDate}>{dateStr}</Text>
          {saved && <Text style={s.savedBadge}>{loc.editor.saved}</Text>}
          {isGenerating && <Text style={[s.savedBadge, { color: colors.accent }]}>✨ {loc.editor.thinking}</Text>}
        </View>

        <View style={s.headerRight}>
          <Pressable onPress={() => setShowExportModal(true)} style={s.circleBtn} hitSlop={12}>
            <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <Path d="M11.5 21h-4.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v5m-5 6h7m-3 -3l3 3l-3 3" />
            </Svg>
          </Pressable>
          <Pressable onPress={handleDelete} style={s.circleBtn} hitSlop={12}>
            <Svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M4 7l16 0" />
              <Path d="M10 11l0 6" />
              <Path d="M14 11l0 6" />
              <Path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
              <Path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </Svg>
          </Pressable>
          <Pressable onPress={handleDone} style={({ pressed }) => [s.doneBtn, pressed && s.doneBtnActive]} hitSlop={8}>
            <Text style={s.doneBtnText}>{loc.editor.done}</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView ref={scrollRef} style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
            <View style={{ backgroundColor: colors.bg, padding: 8, borderRadius: radius.lg }}>
              <TextInput
                style={s.titleInput}
                placeholder={loc.editor.titlePlaceholder}
                placeholderTextColor={colors.inkDim}
                value={title}
                onChangeText={(t) => { setTitle(t); setIsDirty(true); }}
                multiline blurOnSubmit returnKeyType="next"
              />

              <View style={[s.editorContainer, { minHeight: editorHeight }]}>
                <RichEditor
                  key={id}
                  ref={richText}
                  initialContentHTML={note.body}
                  placeholder={loc.editor.bodyPlaceholder}
                  // @ts-ignore
                  androidHardwareAccelerationDisabled={true}
                  editorStyle={{
                    backgroundColor: colors.bg,
                    color: colors.inkMid,
                    placeholderColor: colors.inkDim,
                    cssText: `
                  body { font-family: '${font.sans}', -apple-system, Roboto, Helvetica, Arial, sans-serif; font-size: ${16 * settings.fontSize}px; line-height: 1.6; padding: 0; margin: 0; background-color: ${colors.bg}; color: ${colors.inkMid}; }
                  h1 { font-family: '${font.sansBold}', -apple-system, Roboto, Helvetica, Arial, sans-serif !important; font-weight: 900 !important; font-size: ${32 * settings.fontSize}px !important; color: ${colors.ink}; margin-top: 10px; margin-bottom: 10px; }
                  h2 { font-family: '${font.sansBold}', -apple-system, Roboto, Helvetica, Arial, sans-serif !important; font-weight: 800 !important; font-size: ${24 * settings.fontSize}px !important; color: ${colors.ink}; margin-top: 8px; margin-bottom: 8px; }
                  blockquote { border-left: 4px solid ${colors.accent}; padding-left: 12px; font-style: italic; color: ${colors.inkDim}; margin: 10px 0; }
                  ul, ol { padding-left: 20px; font-size: 1em !important; }
                  li { font-size: 1em !important; }
                  img { max-width: 100%; height: auto; border-radius: 12px; margin: 10px 0; }
                `
                  }}
                  onChange={(html) => {
                    if (!isMounted.current) return;
                    const stripped = html.replace(/<[^>]*>?/gm, ' ');
                    setBodyText(stripped);
                    setIsDirty(true);
                    if (settings.autoSave) {
                      updateNote(Number(id), { title, body: html, tag });
                    }
                  }}
                  scrollEnabled={false}
                  useContainer={false}
                  onCursorPosition={(y) => {
                    scrollRef.current?.scrollTo({ y: Math.max(0, y - 50), animated: true });
                  }}
                  onHeightChange={(h) => {
                    setEditorHeight(Math.max(400, h + 100));
                  }}
                />
              </View>
            </View>

            <View style={s.tagRow}>
              <Text style={s.tagHash}>#</Text>
              <TextInput
                style={s.tagInput}
                placeholder={loc.editor.tagPlaceholder}
                placeholderTextColor={colors.inkDim + '88'}
                value={tag}
                onChangeText={(t) => { setTag(t.replace(/\s/g, '')); setIsDirty(true); }}
                autoCapitalize="none"
                onFocus={() => { setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300); }}
              />
            </View>
          </ScrollView>

          <RichToolbar
            editor={richText}
            style={s.toolbarRoot}
            iconTint={colors.ink}
            selectedIconTint={colors.accent}
            disabledIconTint={colors.inkDim}
            actions={[
              actions.undo,
              actions.redo,
              actions.setBold,
              actions.setItalic,
              actions.setUnderline,
              actions.heading1,
              actions.heading2,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.blockquote,
              actions.insertLink,
              actions.insertImage,
              'insertPurnaViram',
              'insertDoublePurnaViram'
            ]}
            iconMap={{
              [actions.heading1]: () => <Text style={{ color: colors.ink, fontWeight: 'bold' }}>H1</Text>,
              [actions.heading2]: () => <Text style={{ color: colors.ink, fontWeight: 'bold' }}>H2</Text>,
              [actions.insertLink]: ({ tintColor }: any) => (
                <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={tintColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </Svg>
              ),
              [actions.insertImage]: ({ tintColor }: any) => (
                <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={tintColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <Circle cx="8.5" cy="8.5" r="1.5" />
                  <Path d="M21 15l-5-5L5 21" />
                </Svg>
              ),
              'insertPurnaViram': () => <Text style={{ color: colors.accent, fontWeight: 'bold' }}>।</Text>,
              'insertDoublePurnaViram': () => <Text style={{ color: colors.accent, fontWeight: 'bold' }}>॥</Text>,
            }}
            onInsertLink={() => setShowLinkModal(true)}
            onPressAddImage={() => setShowImageModal(true)}
            insertPurnaViram={() => insertHindiPunctuation('।')}
            insertDoublePurnaViram={() => insertHindiPunctuation('॥')}
          />

          <View style={s.bottomBar}>
            <Text style={s.bottomBarText}>{bodyText.trim().length} {loc.editor.chars} · {wc} {loc.editor.words}</Text>
            {ai.geminiApiKey && (
              <Pressable
                onPress={() => setShowAiModal(true)}
                disabled={isGenerating}
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accent + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, opacity: isGenerating ? 0.5 : 1 }}
              >
                <Svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke={colors.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <Path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z" />
                </Svg>
                <Text style={{ fontFamily: font.sansSemi, fontSize: 11, color: colors.accent }}>{isGenerating ? '...' : 'Spark AI'}</Text>
              </Pressable>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>

      <ThemedModal
        visible={showDeleteModal}
        title={loc.editor.deleteNote}
        subtitle={loc.editor.deleteNoteSub}
        onClose={() => setShowDeleteModal(false)}
        actions={[
          {
            label: loc.editor.delete,
            style: 'destructive',
            onPress: () => { if (note) { deleteNote(note.id); router.back(); } }
          },
          {
            label: loc.editor.cancel,
            style: 'cancel',
            onPress: () => setShowDeleteModal(false)
          }
        ]}
      />

      <ThemedModal
        visible={showExportModal}
        title={loc.exportOptions}
        onClose={() => setShowExportModal(false)}
        actions={[
          {
            label: loc.exportPdf,
            style: 'default',
            icon: (
              <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <Path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                <Path d="M9 15l2 2l4 -4" />
              </Svg>
            ),
            onPress: handleExportPDF
          },
          {
            label: loc.exportMd || "Save as MD",
            style: 'default',
            icon: (
              <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <Path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                <Path d="M10 12l4 4m0 -4l-4 4" />
              </Svg>
            ),
            onPress: () => handleExportTextFile('md')
          },
          {
            label: loc.editor.cancel,
            style: 'cancel',
            onPress: () => setShowExportModal(false)
          }
        ]}
      />

      <ThemedModal
        visible={showAiModal}
        title={loc.plusFeatures.aiDialogTitle}
        subtitle={loc.plusFeatures.aiDialogSub}
        onClose={() => setShowAiModal(false)}
        actions={[
          {
            label: loc.plusFeatures.aiFormat,
            style: 'default',
            onPress: handleAiFormat
          },
          {
            label: loc.plusFeatures.aiSmartTitle,
            style: 'default',
            onPress: handleAiTitle
          },
          {
            label: loc.plusFeatures.aiSummarize,
            style: 'default',
            onPress: handleAiSummary
          },
          {
            label: loc.plusFeatures.aiWriteForMe,
            style: 'default',
            onPress: () => {
              setShowAiModal(false);
              setTimeout(() => setShowPromptModal(true), 300);
            }
          },
          {
            label: loc.editor.cancel,
            style: 'cancel',
            onPress: () => setShowAiModal(false)
          }
        ]}
      />

      <ThemedModal
        visible={showPromptModal}
        title={loc.plusFeatures.aiWriteTitle}
        subtitle={loc.plusFeatures.aiWriteSub}
        onClose={() => setShowPromptModal(false)}
        customContent={
          <TextInput
            style={{
              padding: 12,
              borderRadius: radius.md,
              backgroundColor: colors.bg,
              color: colors.ink,
              fontFamily: font.sans,
              fontSize: 14 * settings.fontSize,
              borderWidth: 1,
              borderColor: colors.strokeDim,
              minHeight: 80,
              textAlignVertical: 'top'
            }}
            placeholder={loc.plusFeatures.aiWritePlaceholder}
            placeholderTextColor={colors.inkDim}
            value={aiPrompt}
            onChangeText={setAiPrompt}
            multiline
            autoFocus
          />
        }
        actions={[
          {
            label: loc.plusFeatures.aiGenerateBtn,
            style: 'default',
            onPress: handleCustomAiPrompt
          },
          {
            label: loc.editor.cancel,
            style: 'cancel',
            onPress: () => setShowPromptModal(false)
          }
        ]}
      />

      <ThemedModal
        visible={showSummaryModal}
        title={loc.plusFeatures.aiSummaryTitle}
        onClose={() => setShowSummaryModal(false)}
        customContent={
          <ScrollView style={{ maxHeight: 300, backgroundColor: colors.bg, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.strokeDim }}>
            <Text style={{ fontFamily: font.sans, fontSize: 14 * settings.fontSize, color: colors.inkMid, lineHeight: 22 * settings.fontSize }}>
              {stripMarkdown(summaryText)}
            </Text>
          </ScrollView>
        }
        actions={[
          {
            label: loc.settingsScreen.ok,
            style: 'default',
            onPress: () => setShowSummaryModal(false)
          },
          {
            label: loc.plusFeatures.aiSummaryInsert,
            style: 'cancel',
            onPress: () => {
              richText.current?.insertHTML(`<br><br><blockquote><b>${loc.plusFeatures.aiSummaryPrefix}</b><br>${markdownToHtml(summaryText)}</blockquote><br>`);
              setShowSummaryModal(false);
            }
          }
        ]}
      />

      <ThemedModal
        visible={showExitModal}
        title={loc.editor.unsavedChanges}
        subtitle={loc.editor.unsavedChangesSub}
        onClose={() => setShowExitModal(false)}
        actions={[
          {
            label: loc.editor.save,
            style: 'default',
            onPress: handleDone
          },
          {
            label: loc.editor.discard,
            style: 'destructive',
            onPress: () => router.back()
          },
          {
            label: loc.editor.cancel,
            style: 'cancel',
            onPress: () => setShowExitModal(false)
          }
        ]}
      />

      <ThemedModal
        visible={showLinkModal}
        title={loc.editor.insertLink}
        onClose={() => setShowLinkModal(false)}
        actions={[
          { label: loc.editor.save, style: 'default', onPress: handleInsertLink },
          { label: loc.editor.cancel, style: 'cancel', onPress: () => setShowLinkModal(false) }
        ]}
        customContent={
          <View style={{ gap: 12 }}>
            <Text style={{ fontFamily: font.sans, fontSize: 13, color: colors.inkMid }}>{loc.editor.linkUrl}</Text>
            <TextInput
              style={{ backgroundColor: colors.bg, height: 52, paddingHorizontal: 16, borderRadius: radius.md, color: colors.ink, fontFamily: font.sans, borderWidth: 1.5, borderColor: colors.strokeDim }}
              placeholder="https://..."
              placeholderTextColor={colors.inkDim}
              value={linkUrl}
              onChangeText={setLinkUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        }
      />

      <ThemedModal
        visible={showImageModal}
        title={loc.editor.selectSource}
        onClose={() => setShowImageModal(false)}
        actions={[
          {
            label: loc.editor.pickGallery, style: 'default', onPress: handlePickImage, icon: (
              <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M15 8h.01" />
                <Path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z" />
                <Path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" />
                <Path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />
              </Svg>
            )
          },
          { label: loc.editor.enterUrl, style: 'cancel', onPress: () => { /* Handle toggle to URL input if needed, but keeping it simple with direct actions */ } },
        ]}
        customContent={
          <View style={{ gap: 12, marginTop: 8 }}>
            <TextInput
              style={{ backgroundColor: colors.bg, height: 52, paddingHorizontal: 16, borderRadius: radius.md, color: colors.ink, fontFamily: font.sans, borderWidth: 1.5, borderColor: colors.strokeDim }}
              placeholder={loc.editor.imageUrl}
              placeholderTextColor={colors.inkDim}
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleInsertImage}
            />
          </View>
        }
      />

      <ThemedModal
        visible={appAlert.visible}
        title={appAlert.title}
        subtitle={appAlert.subtitle}
        onClose={() => setAppAlert(prev => ({ ...prev, visible: false }))}
        actions={[
          {
            label: loc.settingsScreen.ok,
            style: 'default',
            onPress: () => setAppAlert(prev => ({ ...prev, visible: false }))
          }
        ]}
      />
    </View>
  );
}
