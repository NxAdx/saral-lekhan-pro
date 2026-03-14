import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView,
  Platform, StatusBar, ScrollView, BackHandler
} from 'react-native';
import { useRouter } from 'expo-router';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { useNotesStore } from '../../store/notesStore';
import { useTheme } from '../../store/themeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { strings } from '../../i18n/strings';
import { Svg, Path, Circle, Rect } from 'react-native-svg';
import { wordCount, markdownToHtml, stripMarkdown } from '../../utils/markdown';
import { useAiStore } from '../../store/aiStore';
import { AiService } from '../../services/aiService';
import { ThemedModal } from '../../components/ui/ThemedModal';
import { SparkLoadingModal } from '../../components/ui/SparkLoadingModal';
import { useTypography } from '../../store/typographyStore';
import { SparkGenerationPhase } from '../../types/spark';
import { useRuntimeUxFlagsStore } from '../../store/runtimeUxFlagsStore';
import * as ImagePicker from 'expo-image-picker';
import { imageUriToDataUri } from '../../utils/editorMedia';

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
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [appAlert, setAppAlert] = useState<{ visible: boolean; title: string; subtitle: string }>({ visible: false, title: '', subtitle: '' });
  const noteId = useRef<number | null>(null);

  const ai = useAiStore();
  const sparkLoadingModalEnabled = useRuntimeUxFlagsStore((s) => s.flags.spark_loading_modal_v1);
  const sparkLoadingAnimationEnabled = useRuntimeUxFlagsStore((s) => s.flags.spark_loading_animation_v1);

  const richText = useRef<RichEditor>(null);
  const scrollRef = useRef<ScrollView>(null);
  const editorListBreakoutScript = useMemo(() => `
    document.addEventListener('keydown', function(e) {
      if (e.key !== 'Enter') return;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      let node = range.startContainer;
      while (node && node.nodeName !== 'LI' && node.nodeName !== 'BLOCKQUOTE' && node.nodeName !== 'BODY') {
        node = node.parentNode;
      }
      if (node && (node.nodeName === 'LI' || node.nodeName === 'BLOCKQUOTE') && node.textContent.trim() === '') {
        e.preventDefault();
        document.execCommand('outdent', false, null);
      }
    });
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

    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [isDirty, settings.autoSave]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // @ts-ignore - Pell exposes injectJavascript on the ref.
      richText.current?.injectJavascript(editorListBreakoutScript);
    }, 800);

    return () => clearTimeout(timer);
  }, [editorListBreakoutScript]);

  const handleSave = useCallback(async () => {
    const html = await richText.current?.getContentHtml();
    if (title.trim() || (html && html.trim())) {
      if (noteId.current) {
        useNotesStore.getState().updateNote(noteId.current, { title: title.trim(), body: html || '', tag: tag.trim() });
      } else {
        const id = addNote({ title: title.trim(), body: html || '', tag: tag.trim(), pinned: false });
        noteId.current = id;
      }
      setIsDirty(false);
    }
  }, [title, tag, addNote]);

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
      }
    } catch (error: any) {
      setAppAlert({
        visible: true,
        title: 'Image Error',
        subtitle: error?.message || 'Could not load the selected image.',
      });
    }
  };

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
    circleBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: colors.stroke, backgroundColor: colors.bgRaised, justifyContent: 'center', alignItems: 'center', ...shadow.gentle, shadowColor: colors.shadow },
    headerMid: { flex: 1, alignItems: 'center' },
    headerDate: { fontFamily: font.mono, fontSize: 11, color: colors.inkDim },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    doneBtn: { backgroundColor: colors.accent, paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, ...shadow.gentle, shadowColor: colors.accentDark },
    doneBtnActive: { transform: [{ translateY: 2 }], shadowOffset: { width: 0, height: 1 }, elevation: 1 },
    doneBtnText: { fontFamily: font.sansSemi, fontSize: 13, color: colors.white },

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

    // Toolbar custom
    toolbarRoot: {
      backgroundColor: colors.bgRaised,
      borderTopWidth: 1.5,
      borderTopColor: colors.stroke,
      paddingHorizontal: 6,
      paddingVertical: 4,
    },
    toolbarItem: {
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 2,
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
          <Pressable onPress={handleDone} style={({ pressed }) => [s.doneBtn, pressed && s.doneBtnActive]} hitSlop={8}>
            <Text style={s.doneBtnText}>{loc.editor.done}</Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
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
              ref={richText}
              initialContentHTML=""
              placeholder={loc.editor.bodyPlaceholder}
              editorStyle={{
                backgroundColor: colors.bg,
                color: colors.inkMid,
                placeholderColor: colors.inkDim,
                // Apply dynamic settings fonts globally to editor via CSS
                cssText: `
                  body { font-family: '${font.sans}', -apple-system, Roboto, Helvetica, Arial, sans-serif; font-size: ${16 * theme.fontSize}px; line-height: ${Math.round(26 * theme.fontSize)}px; padding: 0; margin: 0; background-color: ${colors.bg}; color: ${colors.inkMid}; }
                  h1 { font-family: '${font.sansBold}', -apple-system, Roboto, Helvetica, Arial, sans-serif !important; font-weight: 900 !important; font-size: ${32 * theme.fontSize}px !important; color: ${colors.ink}; line-height: ${Math.round(40 * theme.fontSize)}px !important; margin-top: 10px; margin-bottom: 10px; }
                  h2 { font-family: '${font.sansBold}', -apple-system, Roboto, Helvetica, Arial, sans-serif !important; font-weight: 800 !important; font-size: ${24 * theme.fontSize}px !important; color: ${colors.ink}; line-height: ${Math.round(32 * theme.fontSize)}px !important; margin-top: 8px; margin-bottom: 8px; }
                  blockquote { border-left: 4px solid ${colors.accent}; padding-left: 12px; font-style: italic; color: ${colors.inkDim}; margin: 10px 0; }
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
                const stripped = html.replace(/<[^>]*>?/gm, ' ');
                setBodyText(stripped);
                setIsDirty(true);
                if (settings.autoSave && (title.trim() || stripped.trim())) {
                  if (noteId.current) {
                    useNotesStore.getState().updateNote(noteId.current, { title, body: html, tag });
                  } else {
                    const id = addNote({ title, body: html, tag, pinned: false });
                    noteId.current = id;
                  }
                }
              }}
              onHeightChange={(h) => {
                setEditorHeight(Math.max(400, h + 100));
              }}
              scrollEnabled={false}
              useContainer={false}
            />
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

        {/* Dynamic Rich Toolbar */}
        <RichToolbar
          editor={richText}
          style={s.toolbarRoot}
          iconTint={colors.ink}
          selectedIconTint={colors.accent}
          disabledIconTint={colors.inkDim}
          iconSize={18}
          iconGap={24}
          itemStyle={s.toolbarItem}
          selectedButtonStyle={{ backgroundColor: colors.accent + '18' }}
          unselectedButtonStyle={{ backgroundColor: 'transparent' }}
          actions={[
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.checkboxList,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.heading1,
            actions.heading2,
            actions.blockquote,
            actions.undo,
            actions.redo,
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
            [actions.checkboxList]: ({ tintColor }: any) => (
              <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={tintColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Rect x="4" y="4" width="16" height="16" rx="3" />
                <Path d="M8 12l3 3l5 -6" />
              </Svg>
            ),
            'insertPurnaViram': () => <Text style={{ color: colors.accent, fontWeight: 'bold' }}>{'\u0964'}</Text>,
            'insertDoublePurnaViram': () => <Text style={{ color: colors.accent, fontWeight: 'bold' }}>{'\u0965'}</Text>,
          }}
          onInsertLink={() => setShowLinkModal(true)}
          onPressAddImage={() => setShowImageModal(true)}
          insertPurnaViram={() => insertHindiPunctuation('\u0964')}
          insertDoublePurnaViram={() => insertHindiPunctuation('\u0965')}
        />

        <View style={s.bottomBar}>
          <Text style={s.bottomBarText}>{bodyText.trim().length} {loc.editor.chars} | {wc} {loc.editor.words}</Text>
          {Boolean(ai.geminiApiKey) ? (
            <Pressable
              onPress={() => {
                if (!isGenerating) setShowAiModal(true);
              }}
              disabled={isGenerating}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accent + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, opacity: isGenerating ? 0.5 : 1 }}
            >
              <Svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke={colors.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                <Path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z" />
              </Svg>
              <Text style={{ fontFamily: font.sansSemi, fontSize: 11, color: colors.accent }}>
                {isGenerating && !sparkLoadingModalEnabled ? '...' : (loc.featureDiscovery.sparkAi || 'Spark AI')}
              </Text>
            </Pressable>
          ) : null}
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
              style={{ backgroundColor: colors.bg, padding: 14, borderRadius: radius.md, color: colors.ink, fontFamily: font.sans, borderWidth: 1.5, borderColor: colors.strokeDim }}
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
          { label: loc.editor.enterUrl, style: 'cancel', onPress: () => { /* Simplified */ } },
        ]}
        customContent={
          <View style={{ gap: 12, marginTop: 8 }}>
            <TextInput
              style={{ backgroundColor: colors.bg, padding: 14, borderRadius: radius.md, color: colors.ink, fontFamily: font.sans, borderWidth: 1.5, borderColor: colors.strokeDim }}
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
