import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable, Alert,
  KeyboardAvoidingView, Platform, StatusBar, ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { useNotesStore } from '../../store/notesStore';
import { useTheme } from '../../store/themeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { strings } from '../../i18n/strings';
import { wordCount } from '../../utils/markdown';
import { Svg, Path, Circle } from 'react-native-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { ThemedModal } from '../../components/ui/ThemedModal';

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const theme = useTheme();
  const settings = useSettingsStore(); // to get fonts & language
  const { colors, font, radius, shadow } = theme;
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

  const richText = useRef<RichEditor>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setTag(note.tag || '');
      // We set the initial body into the RichEditor component via prop, rather than state
      const stripped = note.body.replace(/<[^>]*>?/gm, ' ');
      setBodyText(stripped || '');
    }
  }, [note?.id]);

  const showSaved = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, []);

  const handleDone = useCallback(async () => {
    const html = await richText.current?.getContentHtml();
    if (note) {
      updateNote(note.id, { title: title.trim(), body: html?.trim() || '', tag: tag.trim() });
      showSaved();
    }
    router.back();
  }, [note, title, tag, updateNote, router, showSaved]);

  const handleDelete = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const insertHindiPunctuation = (char: string) => {
    richText.current?.insertText(char);
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

  const handleExportMenu = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const s = useMemo(() => StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.strokeDim + '44' },
    circleBtn: {
      width: 36, height: 36, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.stroke,
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

    scroll: { flex: 1 },
    content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 60 },
    titleInput: { fontFamily: font.display, fontSize: 26, fontWeight: '700', color: colors.ink, marginBottom: 16, padding: 0, lineHeight: 34 },

    // Rich Editor specific
    editorContainer: { minHeight: 400, flex: 1 },

    tagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.strokeDim + '55' },
    tagHash: { fontFamily: font.mono, fontSize: 14, color: colors.accent, marginRight: 4 },
    tagInput: { flex: 1, fontFamily: font.mono, fontSize: 13, color: colors.inkMid, padding: 0 },

    bottomBar: { backgroundColor: colors.bgRaised, borderTopWidth: 1, borderTopColor: colors.strokeDim + '66', paddingHorizontal: 20, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    bottomBarText: { fontFamily: font.mono, fontSize: 11, color: colors.inkDim },

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
        <Pressable onPress={() => router.back()} style={s.circleBtn} hitSlop={12}>
          <Svg viewBox="0 0 20 20" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={1.8} strokeLinecap="round">
            <Path d="M15 10H5M10 5l-5 5 5 5" />
          </Svg>
        </Pressable>
        <View style={s.headerMid}>
          <Text style={s.headerDate}>{dateStr}</Text>
          {saved && <Text style={s.savedBadge}>{loc.editor.saved}</Text>}
        </View>
        <View style={s.headerRight}>
          <Pressable onPress={handleExportMenu} style={s.circleBtn} hitSlop={12}>
            <Svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round">
              <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
            </Svg>
          </Pressable>
          <Pressable onPress={handleDelete} style={s.circleBtn} hitSlop={12}>
            <Svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round">
              <Path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
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
                onChangeText={setTitle}
                multiline blurOnSubmit returnKeyType="next"
              />

              <View style={s.editorContainer}>
                <RichEditor
                  ref={richText}
                  initialContentHTML={note.body}
                  placeholder={loc.editor.bodyPlaceholder}
                  // @ts-ignore
                  androidHardwareAccelerationDisabled={true}
                  editorStyle={{
                    backgroundColor: colors.bg,
                    color: colors.inkMid,
                    placeholderColor: colors.inkDim,
                    // Apply dynamic settings fonts globally to editor via CSS
                    cssText: `
                  body { font-family: '${settings.fontFamily}', -apple-system, Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.8; padding: 0; margin: 0; }
                  h1 { font-family: '${font.sansBold}', -apple-system, Roboto, Helvetica, Arial, sans-serif !important; font-weight: 900 !important; font-size: 2em !important; color: ${colors.ink}; }
                  h2 { font-family: '${font.sansBold}', -apple-system, Roboto, Helvetica, Arial, sans-serif !important; font-weight: 800 !important; font-size: 1.6em !important; color: ${colors.ink}; }
                  blockquote { border-left: 4px solid ${colors.accent}; padding-left: 12px; font-style: italic; color: ${colors.inkDim}; }
                `
                  }}
                  onChange={(html) => {
                    const stripped = html.replace(/<[^>]*>?/gm, ' ');
                    setBodyText(stripped);
                  }}
                  scrollEnabled={false}
                  useContainer={false}
                />
              </View>

            </View>

            <View style={s.tagRow}>
              <Text style={s.tagHash}>#</Text>
              <TextInput
                style={s.tagInput}
                placeholder="tag (Hit enter to add)"
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
            onPress: handleExportPDF
          },
          {
            label: loc.editor.cancel,
            style: 'cancel',
            onPress: () => setShowExportModal(false)
          }
        ]}
      />

    </View>
  );
}
