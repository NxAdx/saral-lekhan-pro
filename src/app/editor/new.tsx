import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView,
  Platform, StatusBar, ScrollView, BackHandler, Keyboard, LayoutAnimation
} from 'react-native';
import { useRouter } from 'expo-router';
import { NativeMarkdownEditor, NativeMarkdownEditorRef } from '../../components/ui/NativeMarkdownEditor';
import { htmlToMarkdown } from '../../utils/htmlToMarkdown';
import { useNotesStore } from '../../store/notesStore';
import { useTheme } from '../../store/themeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { strings } from '../../i18n/strings';
import { wordCount, markdownToHtml, stripMarkdown } from '../../utils/markdown';
import { Svg, Path, Circle, Rect, Polyline } from 'react-native-svg';
import { useAiStore } from '../../store/aiStore';
import { AiService } from '../../services/aiService';
import { ThemedModal } from '../../components/ui/ThemedModal';
import { SparkLoadingModal } from '../../components/ui/SparkLoadingModal';
import { useTypography } from '../../store/typographyStore';
import { SparkGenerationPhase } from '../../types/spark';
import { useRuntimeUxFlagsStore } from '../../store/runtimeUxFlagsStore';
import * as ImagePicker from 'expo-image-picker';
import { imageUriToDataUri } from '../../utils/editorMedia';
import { buildEditorCss } from '../../utils/editorCssTemplate';
import { ChecklistEditor } from '../../components/ui/ChecklistEditor';
import { NoteType, ChecklistItem, textToChecklistItems, checklistItemsToText } from '../../types/note';

export default function NewNoteScreen() {
  const router = useRouter();
  const theme = useTheme();
  const settings = useSettingsStore(); // to get fonts & language
  const { colors, font, radius, shadow } = theme;
  const type = useTypography();
  const loc = strings[settings.language] || strings['En'];

  const addNote = useNotesStore((s) => s.addNote);

  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');

  const [bodyText, setBodyText] = useState(''); // Text representation for word count

  // Phase 4: Checklist mode state
  const [noteType, setNoteType] = useState<NoteType>('text');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  const [showAiModal, setShowAiModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<SparkGenerationPhase>('idle');
  const [editorHeight, setEditorHeight] = useState<number>(400);
  const [isDirty, setIsDirty] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showFindReplaceModal, setShowFindReplaceModal] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [appAlert, setAppAlert] = useState<{ visible: boolean; title: string; subtitle: string }>({ visible: false, title: '', subtitle: '' });
  const noteId = useRef<number | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const ai = useAiStore();
  const sparkLoadingModalEnabled = useRuntimeUxFlagsStore((s) => s.flags.spark_loading_modal_v1);
  const sparkLoadingAnimationEnabled = useRuntimeUxFlagsStore((s) => s.flags.spark_loading_animation_v1);

  const richText = useRef<NativeMarkdownEditorRef>(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const editorListBreakoutScript = useMemo(() => `
    (function() {
      if (window.__breakoutListenerAdded) return;
      window.__breakoutListenerAdded = true;
      document.addEventListener('beforeinput', function(e) {
        if (e.inputType !== 'insertParagraph') return;
        var selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        var range = selection.getRangeAt(0);
        var node = range.startContainer;
        while (node && node.nodeName !== 'LI' && node.nodeName !== 'BLOCKQUOTE' && node.nodeName !== 'BODY') {
          node = node.parentNode;
        }
        if (node && node.nodeName === 'BLOCKQUOTE' && node.textContent.trim() === '') {
          e.preventDefault();
          document.execCommand('formatBlock', false, 'div');
        } else if (node && node.nodeName === 'LI' && node.textContent.trim() === '') {
          e.preventDefault();
          document.execCommand('outdent', false, null);
        }
      });
    })();
    true;
  `, []);
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
    const onBackPress = () => {
      if (isDirty && !settings.autoSave) {
        setShowExitModal(true);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [isDirty, settings.autoSave]);

  // Track keyboard height so we can add extra padding to the ScrollView,
  // ensuring content at the bottom remains visible above the toolbar+keyboard.
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = (e: any) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(e.endCoordinates.height);
    };
    const onHide = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(0);
    };
    const sub1 = Keyboard.addListener(showEvent, onShow);
    const sub2 = Keyboard.addListener(hideEvent, onHide);
    return () => { sub1.remove(); sub2.remove(); };
  }, []);

  

  const handleSave = useCallback(async () => {
    let html = '';
    if (noteType === 'text') {
      html = (bodyText) || '';
    } else {
      const markdown = checklistItemsToText(checklistItems);
      html = markdownToHtml(markdown);
    }
    
    if (title.trim() || html.trim()) {
      if (noteId.current) {
        useNotesStore.getState().updateNote(noteId.current, { 
          title: title.trim(), 
          body: html, 
          tag: tag.trim(),
          folder_name: null,
          note_type: noteType,
          checklist_items: noteType === 'checklist' ? checklistItems : null
        });
      } else {
        const id = addNote({ 
          title: title.trim(), 
          body: html, 
          tag: tag.trim(), 
          pinned: false,
          folder_name: null,
          note_type: noteType,
          checklist_items: noteType === 'checklist' ? checklistItems : null
        });
        noteId.current = id;
      }
      setIsDirty(false);
    }
  }, [title, tag, addNote, noteType, checklistItems]);

  const handleDone = useCallback(async () => {
    Keyboard.dismiss();
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

  const insertHindiPunctuation = (char: string) => {
    richText.current?.insertTextAtCursor(char);
  };

  const handleInsertLink = () => {
    if (linkUrl.trim()) {
      richText.current?.insertTextAtCursor(`[Link](${'linkUrl.trim()'})`);
      setLinkUrl('');
      setShowLinkModal(false);
    }
  };

  const handleInsertImage = () => {
    if (imageUrl.trim()) {
      richText.current?.insertTextAtCursor(`![Image](${'imageUrl.trim()'.replace(/\s*trim\(\)/, '')})`);
      setImageUrl('');
      setShowImageModal(false);
    }
  };

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
        richText.current?.insertTextAtCursor(`![Image](${'dataUri'.replace(/\s*trim\(\)/, '')})`);
        setShowImageModal(false);
      }
    } catch (error: any) {
      setAppAlert({
        visible: true,
        title: 'Image Error',
        subtitle: error?.message || 'Could not load the selected image.',
      });
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
          var event = new Event('input', { bubbles: true });
          document.body.dispatchEvent(event);
        }
        return found;
      })();
    `;
    // @ts-ignore
    
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
    
    setIsDirty(true);
  }, [findText, replaceText]);

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
      richText.current?.insertTextAtCursor(`\n\n${output}\n`);
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
      setBodyText(output);
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
    circleBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: colors.stroke, backgroundColor: colors.bgRaised, justifyContent: 'center', alignItems: 'center', ...shadow.gentle, shadowColor: colors.shadow },
    headerMid: { flex: 1, alignItems: 'center' },
    headerDate: { fontFamily: font.mono, fontSize: 11, color: colors.inkDim },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    doneBtn: { backgroundColor: colors.accent, paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, ...shadow.gentle, shadowColor: colors.accentDark },
    doneBtnActive: { transform: [{ translateY: 2 }], shadowOffset: { width: 0, height: 1 }, elevation: 1 },
    doneBtnText: { fontFamily: font.sansSemi, fontSize: 13, color: colors.white },

    scroll: { flex: 1 },
    content: { paddingHorizontal: 24, paddingTop: 24 },
    titleInput: { fontFamily: font.display, fontSize: 26 * theme.fontSize, fontWeight: '700', color: colors.ink, marginBottom: 16, padding: 0, lineHeight: 34 * theme.fontSize },

    // Rich Editor specific
    editorContainer: { minHeight: 400, flex: 1 },

    tagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.strokeDim + '55' },
    tagHash: { fontFamily: font.mono, fontSize: 14, color: colors.accent, marginRight: 4 },
    tagInput: { ...type.bodyLarge, fontFamily: font.sans, color: colors.inkMid, flex: 1, padding: 0 },
    folderIcon: { marginRight: 6, opacity: 0.7 },

    bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.strokeDim },
    bottomBarText: { ...type.labelMedium, fontFamily: font.mono, color: colors.inkDim },

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
  }), [colors, font, radius, shadow]);

  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase();
  const wc = wordCount(bodyText);

  return (
    <View style={s.root}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

      <View style={s.header}>
        <Pressable onPress={handleBack} style={s.circleBtn} hitSlop={12}>
          <Svg viewBox="0 0 20 20" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={1.8} strokeLinecap="round">
            <Path d="M15 10H5M10 5l-5 5 5 5" />
          </Svg>
        </Pressable>
        <View style={s.headerMid}>
          <Text style={s.headerDate}>{dateStr}</Text>
          {isGenerating && !sparkLoadingModalEnabled && (
            <Text style={{ fontFamily: font.mono, fontSize: 9, color: colors.accent, marginTop: 2 }}>
              {loc.editor.thinking || loc.editor.aiLoadingGenerating}
            </Text>
          )}
        </View>
        <View style={s.headerRight}>
          <Pressable 
            onPress={async () => {
              if (noteType === 'text') {
                const html = bodyText || '';
                const items = textToChecklistItems(stripMarkdown(html));
                setChecklistItems(items);
                setNoteType('checklist');
              } else {
                const markdown = checklistItemsToText(checklistItems);
                setBodyText(markdownToHtml(markdown));
                setNoteType('text');
              }
              setIsDirty(true);
            }} 
            style={s.circleBtn} 
            hitSlop={12}
          >
            {noteType === 'text' ? (
              <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Polyline points="9 11 12 14 22 4" />
                <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </Svg>
            ) : (
              <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M4 6h16M4 12h16M4 18h7" />
              </Svg>
            )}
          </Pressable>
          <Pressable onPress={handleDone} style={({ pressed }) => [s.doneBtn, pressed && s.doneBtnActive]} hitSlop={8}>
            <Text style={s.doneBtnText}>{loc.editor.done}</Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView ref={scrollRef} style={s.scroll} contentContainerStyle={[s.content, { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 60 : 160 }]} keyboardShouldPersistTaps="handled">
          <TextInput
            style={s.titleInput}
            placeholder={loc.editor.titlePlaceholder}
            placeholderTextColor={colors.inkDim}
            value={title}
            onChangeText={(t) => { setTitle(t); setIsDirty(true); }}
            multiline blurOnSubmit returnKeyType="next"
          />

          <View style={[s.editorContainer, { minHeight: editorHeight }]}>
            {noteType === 'text' ? (
              <NativeMarkdownEditor
                    ref={richText}
                    value={bodyText}
                    onChange={(text) => {
                      setBodyText(text);
                      setIsDirty(true);
                      
                    }}
                    placeholder={loc.editor.bodyPlaceholder}
                    minHeight={editorHeight}
                    theme={theme}
                    loc={loc}
                    isEditMode={isEditMode}
                  />
            ) : (
              <ChecklistEditor
                items={checklistItems}
                onChange={(items) => {
                  setChecklistItems(items);
                  setIsDirty(true);
                  if (settings.autoSave) {
                    if (noteId.current) {
                      useNotesStore.getState().updateNote(noteId.current, { note_type: 'checklist', checklist_items: items, folder_name: null });
                    } else {
                      const id = addNote({ title, body: '', tag, pinned: false, note_type: 'checklist', checklist_items: items, folder_name: null });
                      noteId.current = id;
                    }
                  }
                }}
              />
            )}
          </View>


          <View style={s.tagRow}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
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
            
          </View>
        </ScrollView>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.strokeDim }}>
            <Pressable
              onPress={() => {
                if (!ai.geminiApiKey) {
                    setAppAlert({ visible: true, title: "Spark AI", subtitle: "Please add your Gemini API Key in Settings to use Spark AI features." });
                    return;
                }
                if (!isGenerating) setShowAiModal(true);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Boolean(ai.geminiApiKey) ? colors.accentBg : 'transparent', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Boolean(ai.geminiApiKey) ? colors.accent : colors.strokeDim }}
            >
              <Svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke={Boolean(ai.geminiApiKey) ? colors.accent : colors.inkDim} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z" />
              </Svg>
              <Text style={{ fontFamily: font.sansSemi, fontSize: 13, color: Boolean(ai.geminiApiKey) ? colors.accent : colors.inkDim, includeFontPadding: false }}>Spark AI</Text>
            </Pressable>

            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
              {/* Undo/Redo handled natively by keyboard now */}
              
              <Pressable onPress={() => setShowFindReplaceModal(true)} hitSlop={12}>
                  <Svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={colors.inkMid} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <Circle cx="10" cy="10" r="7" />
                      <Path d="M21 21l-6-6" />
                  </Svg>
              </Pressable>
            </View>
          </View>

        

        <View style={s.bottomBar}>
          <Text style={s.bottomBarText}>{bodyText.trim().length} {loc.editor.chars} | {wc} {loc.editor.words}</Text>
        </View>
      </KeyboardAvoidingView>

      <SparkLoadingModal
        visible={sparkLoadingModalEnabled && isGenerating}
        phase={generationPhase}
        title={loc.editor.aiLoadingTitle}
        phaseLabel={aiPhaseLabel}
        hintText={loc.editor.aiLoadingPleaseWait}
        enableAnimation={sparkLoadingAnimationEnabled}
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
              richText.current?.insertTextAtCursor(`\n\n> **${loc.plusFeatures.aiSummaryPrefix}**\n> ${summaryText.split('\n').join('\n> ')}\n\n`);
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
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: font.sansSemi, fontSize: 13, color: colors.inkMid }}>URL</Text>
            <TextInput
              style={{ backgroundColor: colors.bg, height: 48, paddingHorizontal: 14, borderRadius: radius.md, color: colors.ink, fontFamily: font.sans, fontSize: 14, borderWidth: 1.5, borderColor: colors.strokeDim }}
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
              <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={colors.ink} strokeWidth={2}>
                <Rect x="3" y="3" width="18" height="18" rx="2" />
                <Circle cx="8.5" cy="8.5" r="1.5" />
                <Path d="M21 15l-5-5L5 21" />
              </Svg>
            )
          },
          { label: loc.editor.enterUrl, style: 'cancel', onPress: () => { } },
        ]}
        customContent={
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: font.sansSemi, fontSize: 13, color: colors.inkMid }}>Image URL</Text>
            <TextInput
              style={{ backgroundColor: colors.bg, height: 48, paddingHorizontal: 14, borderRadius: radius.md, color: colors.ink, fontFamily: font.sans, fontSize: 14, borderWidth: 1.5, borderColor: colors.strokeDim }}
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
        title={loc.editor.findAndReplace || 'Find & Replace'}
        onClose={() => setShowFindReplaceModal(false)}
        actions={[
          {
            label: loc.editor.replaceAll || 'Replace All',
            style: 'default',
            onPress: handleReplaceAll
          },
          {
            label: loc.editor.replace || 'Replace',
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
          <View style={{ gap: 14 }}>
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: font.sansSemi, fontSize: 13, color: colors.inkMid }}>{loc.editor.findPlaceholder}</Text>
              <TextInput
                style={{ backgroundColor: colors.bg, height: 48, paddingHorizontal: 14, borderRadius: radius.md, color: colors.ink, fontFamily: font.sans, fontSize: 14, borderWidth: 1.5, borderColor: colors.strokeDim }}
                placeholder={loc.editor.findPlaceholder}
                placeholderTextColor={colors.inkDim}
                value={findText}
                onChangeText={setFindText}
                autoFocus
              />
            </View>
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: font.sansSemi, fontSize: 13, color: colors.inkMid }}>{loc.editor.replacePlaceholder}</Text>
              <TextInput
                style={{ backgroundColor: colors.bg, height: 48, paddingHorizontal: 14, borderRadius: radius.md, color: colors.ink, fontFamily: font.sans, fontSize: 14, borderWidth: 1.5, borderColor: colors.strokeDim }}
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
