import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
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
import { SparkLoadingModal } from '../../components/ui/SparkLoadingModal';
import { useAiStore } from '../../store/aiStore';
import { useRuntimeUxFlagsStore } from '../../store/runtimeUxFlagsStore';
import { useTypography } from '../../store/typographyStore';
import { AiService } from '../../services/aiService';
import { SparkGenerationPhase } from '../../types/spark';
import * as ImagePicker from 'expo-image-picker';
import { log } from '../../utils/Logger';
import { imageUriToDataUri, normalizeEditorHtmlImages } from '../../utils/editorMedia';

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
  const [showFontModal, setShowFontModal] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<SparkGenerationPhase>('idle');
  const [isDirty, setIsDirty] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showFindReplaceModal, setShowFindReplaceModal] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [appAlert, setAppAlert] = useState<{ visible: boolean; title: string; subtitle: string }>({ visible: false, title: '', subtitle: '' });
  const ai = useAiStore();
  const sparkLoadingModalEnabled = useRuntimeUxFlagsStore((s) => s.flags.spark_loading_modal_v1);
  const sparkLoadingAnimationEnabled = useRuntimeUxFlagsStore((s) => s.flags.spark_loading_animation_v1);

  const richText = useRef<RichEditor>(null);
  const scrollRef = useRef<ScrollView>(null);
  const isMounted = useRef(false);
  const isApplyingInitialContent = useRef(false);
  const [editorHeight, setEditorHeight] = useState<number>(400);
  const [editorReady, setEditorReady] = useState(false);
  const finishGeneration = useCallback(
    (nextPhase: SparkGenerationPhase) => {
      setGenerationPhase(nextPhase);
      const holdMs = sparkLoadingModalEnabled ? 220 : 0;
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationPhase('idle');
      }, holdMs);
    },
    [sparkLoadingModalEnabled]
  );

  const aiPhaseLabel = useMemo(() => {
    switch (generationPhase) {
      case 'preparing':
        return loc.editor.aiLoadingPreparing;
      case 'generating':
        return loc.editor.aiLoadingGenerating;
      case 'applying':
        return loc.editor.aiLoadingApplying;
      case 'done':
        return loc.editor.done;
      case 'error':
        return loc.editor.aiLoadingError;
      default:
        return loc.editor.aiLoadingGenerating;
    }
  }, [generationPhase, loc.editor]);

  useEffect(() => {
    isMounted.current = true;
    log.info(`Opening note: ${id}`);
    setEditorReady(false);

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

  useEffect(() => {
    if (!editorReady || !note) return;

    let cancelled = false;

    const applyEditorContent = async () => {
      const normalizedHtml = await normalizeEditorHtmlImages(note.body || '');
      if (cancelled) return;

      isApplyingInitialContent.current = true;
      richText.current?.setContentHTML(normalizedHtml);
      setBodyText(stripMarkdown(normalizedHtml));

      if (normalizedHtml !== note.body) {
        updateNote(note.id, { body: normalizedHtml });
      }

      setTimeout(() => {
        if (!cancelled) {
          isApplyingInitialContent.current = false;
        }
      }, 250);
    };

    applyEditorContent().catch((error) => {
      log.warn('Failed to normalize editor images on load.', error as any);
      isApplyingInitialContent.current = false;
    });

    return () => {
      cancelled = true;
    };
  }, [editorReady, note?.id]);

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

  const handleReplace = useCallback(() => {
    if (!findText.trim()) return;
    // Walk text nodes and replace first match
    const findStr = findText.trim();
    const repStr = replaceText;
    const script = `
      (function() {
        var found = false;
        function walk(node) {
          if (node.nodeType === 3) {
            var index = node.data.indexOf(${JSON.stringify(findStr)});
            if (index !== -1 && !found) {
              node.data = node.data.substring(0, index) + ${JSON.stringify(repStr)} + node.data.substring(index + ${JSON.stringify(findStr)}.length);
              found = true;
              return;
            }
          } else if (node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
            for (var i = 0; i < node.childNodes.length; i++) {
              walk(node.childNodes[i]);
              if (found) return;
            }
          }
        }
        walk(document.body);
        if (found) {
          // Trigger change event to notify RN
          var event = new Event('input', { bubbles: true });
          document.body.dispatchEvent(event);
        }
        return found;
      })();
    `;
    // @ts-ignore
    richText.current?.injectJavascript(script);
    setIsDirty(true);
  }, [findText, replaceText]);

  const handleReplaceAll = useCallback(() => {
    if (!findText.trim()) return;
    const findStr = findText.trim();
    const repStr = replaceText;
    const script = `
      (function() {
        function escapeRegExp(string) {
          return string.replace(/[.*+?^$\${}()|[\\]\\\\]/g, '\\\\$&');
        }
        var count = 0;
        function walk(node) {
          if (node.nodeType === 3) {
            var regex = new RegExp(escapeRegExp(${JSON.stringify(findStr)}), 'g');
            if (regex.test(node.data)) {
              node.data = node.data.replace(regex, ${JSON.stringify(repStr)});
              count++;
            }
          } else if (node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
            for (var i = 0; i < node.childNodes.length; i++) {
              walk(node.childNodes[i]);
            }
          }
        }
        walk(document.body);
        if (count > 0) {
          var event = new Event('input', { bubbles: true });
          document.body.dispatchEvent(event);
        }
        return count;
      })();
    `;
    // @ts-ignore
    richText.current?.injectJavascript(script);
    setIsDirty(true);
  }, [findText, replaceText]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.45,
        base64: true,
      });

      if (!result.canceled && result.assets[0].uri) {
        const asset = result.assets[0];
        const dataUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : await imageUriToDataUri(asset.uri);
        richText.current?.insertImage(dataUri);
        setShowImageModal(false);
        log.info("Image inserted as Base64 data URI");
      }
    } catch (e) {
      console.error("Failed to pick image", e);
      setAppAlert({ visible: true, title: "Error", subtitle: "Could not load image." });
    }
  };

  const handlePrint = useCallback(async () => {
    try {
      if (!note) return;
      setShowExportModal(false);
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
      await Print.printAsync({ html: htmlContent });
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

  const handleAiTitle = async () => {
    if (isGenerating) return;
    if (!bodyText.trim()) return;
    setShowAiModal(false);
    let didSucceed = false;
    try {
      setGenerationPhase('preparing');
      setIsGenerating(true);
      setGenerationPhase('generating');
      const generatedTitle = await AiService.getSmartTitle(bodyText.trim());
      setGenerationPhase('applying');
      setTitle(generatedTitle);
      didSucceed = true;
    } catch (e: any) {
      setGenerationPhase('error');
      setAppAlert({ visible: true, title: "Spark AI Error", subtitle: e.message || "Failed to generate title." });
    } finally {
      finishGeneration(didSucceed ? 'done' : 'error');
    }
  };

  const handleAiSummary = async () => {
    if (isGenerating) return;
    if (!bodyText.trim()) return;
    setShowAiModal(false);
    let didSucceed = false;
    try {
      setGenerationPhase('preparing');
      setIsGenerating(true);
      setGenerationPhase('generating');
      const summary = await AiService.getSummarization(bodyText.trim());
      setGenerationPhase('applying');
      setSummaryText(summary);
      setShowSummaryModal(true);
      didSucceed = true;
    } catch (e: any) {
      setGenerationPhase('error');
      setAppAlert({ visible: true, title: "Spark AI Error", subtitle: e.message || "Failed to summarize note." });
    } finally {
      finishGeneration(didSucceed ? 'done' : 'error');
    }
  };

  const handleCustomAiPrompt = async () => {
    if (isGenerating) return;
    if (!aiPrompt.trim()) return;
    setShowPromptModal(false);
    let didSucceed = false;
    try {
      setGenerationPhase('preparing');
      setIsGenerating(true);
      setGenerationPhase('generating');
      const output = await AiService.getDynamicGeneration(aiPrompt.trim());
      setGenerationPhase('applying');
      richText.current?.insertHTML(`<br><br>${markdownToHtml(output)}<br>`);
      setAiPrompt('');
      didSucceed = true;
    } catch (e: any) {
      setGenerationPhase('error');
      setAppAlert({ visible: true, title: "Spark AI Error", subtitle: e.message || "Failed to generate content." });
    } finally {
      finishGeneration(didSucceed ? 'done' : 'error');
    }
  };

  const handleAiFormat = async () => {
    if (isGenerating) return;
    if (!bodyText.trim()) return;
    setShowAiModal(false);
    let didSucceed = false;
    try {
      setGenerationPhase('preparing');
      setIsGenerating(true);
      setGenerationPhase('generating');
      const output = await AiService.getFormatNote(bodyText.trim());
      setGenerationPhase('applying');
      richText.current?.setContentHTML(markdownToHtml(output));
      didSucceed = true;
    } catch (e: any) {
      setGenerationPhase('error');
      setAppAlert({ visible: true, title: "Spark AI Error", subtitle: e.message || "Failed to format content." });
    } finally {
      finishGeneration(didSucceed ? 'done' : 'error');
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
      paddingHorizontal: 6,
      paddingTop: 0,
      paddingBottom: 4,
      height: 44,
    },
    toolbarItem: {
      height: 36,
      minHeight: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 2,
      marginVertical: 0,
    },
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
          {isGenerating && !sparkLoadingModalEnabled && (
            <Text style={[s.savedBadge, { color: colors.accent }]}>
              {loc.editor.thinking || loc.editor.aiLoadingGenerating}
            </Text>
          )}
        </View>

        <View style={s.headerRight}>
          <Pressable onPress={() => setShowFontModal(true)} style={s.circleBtn} hitSlop={12}>
            <Text style={{ fontFamily: font.sansBold, fontSize: 16, color: colors.ink, includeFontPadding: false }}>Aa</Text>
          </Pressable>
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
          <Pressable onPress={handleDone} style={({ pressed }) => [s.doneBtn, pressed && s.doneBtnActive]} hitSlop={8} testID="editor-done-button">
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
                testID="editor-title-input"
              />

              <View style={[s.editorContainer, { minHeight: editorHeight }]}>
                <RichEditor
                  key={id}
                  ref={richText}
                  initialContentHTML=""
                  placeholder={loc.editor.bodyPlaceholder}
                  editorInitializedCallback={() => setEditorReady(true)}
                  editorStyle={{
                    backgroundColor: colors.bg,
                    color: colors.inkMid,
                    placeholderColor: colors.inkDim,
                    cssText: `
                  body { font-family: '${font.sans}', -apple-system, Roboto, Helvetica, Arial, sans-serif; font-size: ${16 * theme.fontSize}px; line-height: ${Math.round(26 * theme.fontSize)}px; padding: 0; margin: 0; background-color: ${colors.bg}; color: ${colors.inkMid}; }
                    h1 { font-family: '${font.sansBold}', -apple-system, Roboto, Helvetica, Arial, sans-serif !important; font-weight: 900 !important; font-size: ${32 * theme.fontSize}px !important; color: ${colors.ink}; line-height: ${Math.round(40 * theme.fontSize)}px !important; margin-top: 10px; margin-bottom: 10px; }
                    h2 { font-family: '${font.sansBold}', -apple-system, Roboto, Helvetica, Arial, sans-serif !important; font-weight: 800 !important; font-size: ${24 * theme.fontSize}px !important; color: ${colors.ink}; line-height: ${Math.round(32 * theme.fontSize)}px !important; margin-top: 8px; margin-bottom: 8px; }
                    blockquote { border-left: 4px solid ${colors.accent}; padding-left: 12px; font-style: italic; color: ${colors.inkDim}; margin: 10px 0; }
                    pre { position: relative; background-color: ${colors.bgRaised}; border: 1px solid ${colors.stroke}; border-left: 4px solid ${colors.accent}; color: ${colors.ink}; padding: 38px 16px 14px; border-radius: 16px; font-family: '${font.mono}', monospace; font-size: ${14 * theme.fontSize}px; line-height: ${Math.round(22 * theme.fontSize)}px; white-space: pre-wrap; overflow-x: auto; }
                    pre::before { content: 'CODE'; position: absolute; top: 10px; left: 12px; color: ${colors.accent}; background-color: ${colors.accent}18; border: 1px solid ${colors.accent}44; border-radius: 999px; padding: 3px 8px; font-family: 'Poppins-SemiBold'; font-size: ${10 * theme.fontSize}px; letter-spacing: 1px; }
                    code { background-color: ${colors.bgRaised}; color: ${colors.ink}; border-radius: 6px; padding: 2px 4px; font-family: '${font.mono}', monospace; font-size: ${14 * theme.fontSize}px; }
                    pre code { display: block; background: transparent; padding: 0; border-radius: 0; color: inherit; white-space: pre-wrap; }
                    hr { border: 0; border-top: 1px solid ${colors.stroke}; margin: 20px 0; }
                    ul, ol { padding-left: 20px; font-size: 1em !important; margin: 10px 0; }
                    li { font-size: 1em !important; margin: 6px 0; }
                    .x-todo { padding-left: 0 !important; margin: 12px 0; }
                    .x-todo li { list-style: none; display: flex; align-items: flex-start; gap: 10px; padding-left: 0; }
                    .x-todo-box { position: static !important; left: 0 !important; display: inline-flex; width: 20px; min-width: 20px; height: 20px; align-items: center; justify-content: center; margin-top: 3px; }
                    .x-todo-box input { position: static !important; width: 18px; height: 18px; margin: 0; accent-color: ${colors.accent}; }
                    img { display: block; max-width: 100%; height: auto; border-radius: 16px; margin: 12px 0; }
                  `
                  }}
                  onChange={(html) => {
                    if (!isMounted.current || isApplyingInitialContent.current) return;
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
            iconSize={18}
            iconGap={24}
            itemStyle={s.toolbarItem}
            flatContainerStyle={{ paddingBottom: 4 }}
            selectedButtonStyle={{ backgroundColor: 'transparent', borderBottomWidth: 2.5, borderBottomColor: colors.accent }}
            unselectedButtonStyle={{ backgroundColor: 'transparent' }}
            actions={[
              'sparkAi',
              actions.setBold,
              actions.setItalic,
              actions.setUnderline,
              actions.checkboxList,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.line,
              actions.code,
              actions.heading1,
              actions.heading2,
              actions.blockquote,
              actions.undo,
              actions.redo,
              actions.insertLink,
              actions.insertImage,
              'findReplace',
              'insertPurnaViram',
              'insertDoublePurnaViram'
            ]}
            iconMap={{
              'sparkAi': ({ tintColor }: any) => (
                <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={Boolean(ai.geminiApiKey) ? colors.accent : colors.inkDim} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z" />
                </Svg>
              ),
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
              [actions.checkboxList]: ({ tintColor }: any) => (
                <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={tintColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Rect x="4" y="4" width="16" height="16" rx="3" />
                  <Path d="M8 12l3 3l5 -6" />
                </Svg>
              ),
              [actions.line]: ({ tintColor }: any) => (
                <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={tintColor} strokeWidth={2} strokeLinecap="round">
                  <Path d="M5 12h14" />
                </Svg>
              ),
              [actions.code]: ({ tintColor }: any) => (
                <Text style={{ color: tintColor, fontFamily: font.mono, fontSize: 13, fontWeight: '700', includeFontPadding: false }}>
                  {'</>'}
                </Text>
              ),
              'findReplace': ({ tintColor }: any) => (
                <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={tintColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Circle cx="10" cy="10" r="7" />
                  <Path d="M21 21l-6-6" />
                </Svg>
              ),
              'insertPurnaViram': () => <Text style={{ color: colors.accent, fontWeight: 'bold' }}>{'\u0964'}</Text>,
              'insertDoublePurnaViram': () => <Text style={{ color: colors.accent, fontWeight: 'bold' }}>{'\u0965'}</Text>,
            }}
            sparkAi={() => {
                if (!ai.geminiApiKey) {
                    setAppAlert({ visible: true, title: "Spark AI", subtitle: "Please add your Gemini API Key in Settings to use Spark AI features." });
                    return;
                }
                if (!isGenerating) setShowAiModal(true);
            }}
            onInsertLink={() => setShowLinkModal(true)}
            onPressAddImage={() => setShowImageModal(true)}
            findReplace={() => setShowFindReplaceModal(true)}
            insertPurnaViram={() => insertHindiPunctuation('\u0964')}
            insertDoublePurnaViram={() => insertHindiPunctuation('\u0965')}
          />

          <View style={s.bottomBar}>
            <Text style={s.bottomBarText}>{bodyText.trim().length} {loc.editor.chars} | {wc} {loc.editor.words}</Text>
          </View>
        </KeyboardAvoidingView>
      </View>

      <SparkLoadingModal
        visible={sparkLoadingModalEnabled && isGenerating}
        phase={generationPhase}
        title={loc.editor.aiLoadingTitle}
        phaseLabel={aiPhaseLabel}
        hintText={loc.editor.aiLoadingPleaseWait}
        enableAnimation={sparkLoadingAnimationEnabled}
      />

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
        visible={showFontModal}
        title={loc.settingsScreen.textSize}
        subtitle={loc.settingsScreen.textSizeSub}
        onClose={() => setShowFontModal(false)}
        actions={[
          { label: loc.settingsScreen.reset, style: "default", onPress: () => { settings.setFontSize(1.0); setShowFontModal(false); } },
          { label: loc.settingsScreen.ok, style: "default", onPress: () => setShowFontModal(false) }
        ]}
        customContent={
          <View>
            <View style={{ paddingBottom: 8, marginTop: 16 }}>
              <View style={{ height: 4, backgroundColor: colors.accentBg, borderRadius: 2, marginHorizontal: 20, marginBottom: 12 }}>
                <View style={{
                  height: 4, borderRadius: 2, backgroundColor: colors.accent,
                  width: `${((settings.fontSize - 0.8) / (1.4 - 0.8)) * 100}%`
                }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                {[0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4].map((step) => {
                  const isActive = Math.abs(settings.fontSize - step) < 0.05;
                  const idx = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4].indexOf(step);
                  const btnSize = 28 + idx * 3;
                  return (
                    <Pressable
                      key={step}
                      onPress={() => settings.setFontSize(step)}
                      style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}
                    >
                      <View style={{
                        width: btnSize, height: btnSize, borderRadius: btnSize / 2,
                        backgroundColor: isActive ? colors.accent : colors.accentBg,
                        justifyContent: 'center', alignItems: 'center',
                      }}>
                        <Text style={{
                          fontFamily: font.sansBold,
                          fontSize: 9 + idx * 1.5,
                          color: isActive ? colors.white : colors.accent,
                          includeFontPadding: false,
                        }}>A</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        }
      />

      <ThemedModal
        visible={showExportModal}
        title={loc.exportOptions}
        onClose={() => setShowExportModal(false)}
        actions={[
          {
            label: (loc as any).print || "Print",
            style: 'default',
            icon: (
              <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M7 8V4h10v4" />
                <Path d="M7 16h10v4H7z" />
                <Path d="M6 12h.01" />
                <Path d="M6 16H5a2 2 0 0 1 -2 -2v-2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-1" />
              </Svg>
            ),
            onPress: handlePrint
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
              if (isGenerating) return;
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
              fontSize: 14 * theme.fontSize,
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
            <Text style={{ fontFamily: font.sans, fontSize: 14 * theme.fontSize, color: colors.inkMid, lineHeight: 22 * theme.fontSize }}>
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
        visible={showFindReplaceModal}
        title={loc.editor.findReplace}
        onClose={() => setShowFindReplaceModal(false)}
        actions={[
          {
            label: loc.editor.replaceAll,
            style: 'default',
            onPress: handleReplaceAll
          },
          {
            label: loc.editor.replace,
            style: 'default',
            onPress: handleReplace
          },
          {
            label: loc.editor.cancel,
            style: 'cancel',
            onPress: () => setShowFindReplaceModal(false)
          }
        ]}
        customContent={
          <View style={{ gap: 16 }}>
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: font.sansSemi, fontSize: 13, color: colors.inkMid }}>{loc.editor.findPlaceholder}</Text>
              <TextInput
                style={{ backgroundColor: colors.bg, height: 52, paddingHorizontal: 16, borderRadius: radius.md, color: colors.ink, fontFamily: font.sans, borderWidth: 1.5, borderColor: colors.strokeDim }}
                placeholder={loc.editor.findPlaceholder}
                placeholderTextColor={colors.inkDim}
                value={findText}
                onChangeText={setFindText}
                autoFocus
              />
            </View>
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: font.sansSemi, fontSize: 13, color: colors.inkMid }}>{loc.editor.replacePlaceholder}</Text>
              <TextInput
                style={{ backgroundColor: colors.bg, height: 52, paddingHorizontal: 16, borderRadius: radius.md, color: colors.ink, fontFamily: font.sans, borderWidth: 1.5, borderColor: colors.strokeDim }}
                placeholder={loc.editor.replacePlaceholder}
                placeholderTextColor={colors.inkDim}
                value={replaceText}
                onChangeText={setReplaceText}
              />
            </View>
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


