import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView,
  Platform, StatusBar, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { useNotesStore } from '../../store/notesStore';
import { useTheme } from '../../store/themeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { strings } from '../../i18n/strings';
import { Svg, Path } from 'react-native-svg';
import { wordCount, markdownToHtml, stripMarkdown } from '../../utils/markdown';
import { useAiStore } from '../../store/aiStore';
import { AiService } from '../../services/aiService';
import { ThemedModal } from '../../components/ui/ThemedModal';
import { Alert } from 'react-native';

export default function NewNoteScreen() {
  const router = useRouter();
  const theme = useTheme();
  const settings = useSettingsStore(); // to get fonts & language
  const { colors, font, radius, shadow } = theme;
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

  const ai = useAiStore();

  const richText = useRef<RichEditor>(null);
  const scrollRef = useRef<ScrollView>(null);

  const handleDone = useCallback(async () => {
    const html = await richText.current?.getContentHtml();
    if (title.trim() || (html && html.trim())) {
      addNote({ title: title.trim(), body: html || '', tag: tag.trim(), pinned: false });
    }
    router.back();
  }, [title, tag, addNote, router]);

  const insertHindiPunctuation = (char: string) => {
    richText.current?.insertText(char);
  };

  const handleAiTitle = async () => {
    setShowAiModal(false);
    try {
      if (!bodyText.trim()) return;
      setIsGenerating(true);
      const generatedTitle = await AiService.getSmartTitle(bodyText.trim());
      setTitle(generatedTitle);
    } catch (e: any) {
      Alert.alert("Spark AI Error", e.message || "Failed to generate title.");
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
      Alert.alert("Spark AI Error", e.message || "Failed to summarize note.");
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
      Alert.alert("Spark AI Error", e.message || "Failed to generate content.");
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
      Alert.alert("Spark AI Error", e.message || "Failed to format content.");
    } finally {
      setIsGenerating(false);
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
    tagInput: { flex: 1, fontFamily: font.mono, fontSize: 13, color: colors.inkMid, padding: 0 },

    bottomBar: { backgroundColor: colors.bgRaised, borderTopWidth: 1, borderTopColor: colors.strokeDim + '66', paddingHorizontal: 20, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    bottomBarText: { fontFamily: font.mono, fontSize: 11, color: colors.inkDim },

    // Toolbar custom
    toolbarRoot: {
      backgroundColor: colors.bgRaised,
      borderTopWidth: 1.5,
      borderTopColor: colors.stroke,
    }
  }), [colors, font, radius, shadow]);

  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase();
  const wc = wordCount(bodyText);

  return (
    <View style={s.root}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.circleBtn} hitSlop={12}>
          <Svg viewBox="0 0 20 20" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={1.8} strokeLinecap="round">
            <Path d="M15 10H5M10 5l-5 5 5 5" />
          </Svg>
        </Pressable>
        <View style={s.headerMid}>
          <Text style={s.headerDate}>{dateStr}</Text>
          {isGenerating && <Text style={{ fontFamily: font.mono, fontSize: 9, color: colors.accent, marginTop: 2 }}>✨ {loc.editor.thinking}</Text>}
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
            onChangeText={setTitle}
            multiline blurOnSubmit returnKeyType="next"
          />

          <View style={s.editorContainer}>
            <RichEditor
              ref={richText}
              initialContentHTML=""
              placeholder={loc.editor.bodyPlaceholder}
              // @ts-ignore
              androidHardwareAccelerationDisabled={true}
              editorStyle={{
                backgroundColor: colors.bg,
                color: colors.inkMid,
                placeholderColor: colors.inkDim,
                // Apply dynamic settings fonts globally to editor via CSS
                cssText: `
                  body { font-family: '${font.sans}', -apple-system, Roboto, Helvetica, Arial, sans-serif; font-size: ${16 * settings.fontSize}px; line-height: 1.8; padding: 0; margin: 0; background-color: ${colors.bg}; color: ${colors.inkMid}; }
                  h1 { font-family: '${font.sansBold}', -apple-system, Roboto, Helvetica, Arial, sans-serif !important; font-weight: 900 !important; font-size: 2em !important; color: ${colors.ink}; }
                  h2 { font-family: '${font.sansBold}', -apple-system, Roboto, Helvetica, Arial, sans-serif !important; font-weight: 800 !important; font-size: 1.6em !important; color: ${colors.ink}; }
                  blockquote { border-left: 4px solid ${colors.accent}; padding-left: 12px; font-style: italic; color: ${colors.inkDim}; }
                `
              }}
              onChange={(html) => {
                // Strip HTML roughly to estimate word count without saving to state unnecessarily
                const stripped = html.replace(/<[^>]*>?/gm, ' ');
                setBodyText(stripped);
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
              placeholderTextColor={colors.inkDim}
              value={tag}
              onChangeText={(t) => setTag(t.replace(/\s/g, ''))}
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
            'insertPurnaViram',
            'insertDoublePurnaViram'
          ]}
          iconMap={{
            [actions.heading1]: () => <Text style={{ color: colors.ink, fontWeight: 'bold' }}>H1</Text>,
            [actions.heading2]: () => <Text style={{ color: colors.ink, fontWeight: 'bold' }}>H2</Text>,
            'insertPurnaViram': () => <Text style={{ color: colors.accent, fontWeight: 'bold' }}>।</Text>,
            'insertDoublePurnaViram': () => <Text style={{ color: colors.accent, fontWeight: 'bold' }}>॥</Text>,
          }}
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
              <Text style={{ fontFamily: font.sansSemi, fontSize: 11, color: colors.accent }}>{isGenerating ? '...' : '✨ Spark AI'}</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>

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

    </View>
  );
}
