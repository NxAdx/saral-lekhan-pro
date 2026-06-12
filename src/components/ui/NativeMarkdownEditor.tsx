import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text, ScrollView, TextInputSelectionChangeEventData } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Feather } from '@expo/vector-icons';

interface NativeMarkdownEditorProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  minHeight?: number;
  theme: any;
  loc: any;
  isEditMode: boolean;
}

export interface NativeMarkdownEditorRef {
  insertTextAtCursor: (text: string) => void;
  insertMarkdown: (prefix: string, suffix?: string) => void;
  getCursorPosition: () => number;
}

export const NativeMarkdownEditor = forwardRef<NativeMarkdownEditorRef, NativeMarkdownEditorProps>(({
  value, onChange, placeholder, minHeight, theme, loc, isEditMode
}, ref) => {
  const { colors, font } = theme;
  const inputRef = useRef<TextInput>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  useImperativeHandle(ref, () => ({
    insertTextAtCursor: (text: string) => {
      const newText = value.substring(0, selection.start) + text + value.substring(selection.end);
      onChange(newText);
      setTimeout(() => {
        setSelection({ start: selection.start + text.length, end: selection.start + text.length });
        inputRef.current?.focus();
      }, 50);
    },
    insertMarkdown: (prefix: string, suffix: string = '') => {
      const selectedText = value.substring(selection.start, selection.end);
      const newText = value.substring(0, selection.start) + prefix + selectedText + suffix + value.substring(selection.end);
      onChange(newText);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    },
    getCursorPosition: () => selection.start
  }));

  const handleSelectionChange = (e: { nativeEvent: TextInputSelectionChangeEventData }) => {
    setSelection(e.nativeEvent.selection);
  };

  const markdownStyles = {
    body: { color: colors.ink, fontSize: 16, lineHeight: 26 },
    heading1: { fontFamily: font.sansBold, fontSize: 28, lineHeight: 36, marginTop: 20, marginBottom: 10, color: colors.ink },
    heading2: { fontFamily: font.sansBold, fontSize: 22, lineHeight: 30, marginTop: 18, marginBottom: 8, color: colors.ink },
    heading3: { fontFamily: font.sansBold, fontSize: 18, lineHeight: 26, marginTop: 14, marginBottom: 6, color: colors.ink },
    paragraph: { marginTop: 0, marginBottom: 12 },
    strong: { fontFamily: font.sansBold },
    em: { fontStyle: 'italic' as const },
    s: { textDecorationLine: 'line-through' as const },
    list_item: { marginBottom: 6 },
    ordered_list: { marginBottom: 12 },
    bullet_list: { marginBottom: 12 },
    blockquote: { borderLeftWidth: 4, borderLeftColor: colors.accent, paddingLeft: 16, paddingVertical: 8, backgroundColor: colors.bgRaised, borderRadius: 4, opacity: 0.9 },
    code_inline: { backgroundColor: colors.bgRaised, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontFamily: font.mono, fontSize: 14 },
    code_block: { backgroundColor: colors.bgRaised, padding: 16, borderRadius: 8, fontFamily: font.mono, fontSize: 14 },
    fence: { backgroundColor: colors.bgRaised, padding: 16, borderRadius: 8, fontFamily: font.mono, fontSize: 14 },
    hr: { backgroundColor: colors.strokeDim, height: 1, marginVertical: 16 },
    link: { color: colors.accent, textDecorationLine: 'underline' as const },
  };

  return (
    <View style={{ flex: 1, minHeight }}>
      {isEditMode ? (
        <TextInput
          ref={inputRef}
          style={[s.input, { color: colors.ink, minHeight, fontFamily: font.sans, backgroundColor: colors.bg }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.inkDim}
          multiline
          textAlignVertical="top"
          onSelectionChange={handleSelectionChange}
        />
      ) : (
        <View style={{ flex: 1, padding: 16 }}>
          {value ? (
            <Markdown style={markdownStyles}>
              {value}
            </Markdown>
          ) : (
            <Text style={{ color: colors.inkDim, fontSize: 16 }}>{placeholder || ''}</Text>
          )}
        </View>
      )}
    </View>
  );
});

export const MarkdownToolbar = ({ onInsert, theme }: { onInsert: (prefix: string, suffix?: string) => void, theme: any }) => {
  const { colors } = theme;
  return (
    <View style={[s.toolbar, { backgroundColor: colors.bg, borderTopColor: colors.strokeDim }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={s.toolbarContent}>
        <ToolbarButton onPress={() => onInsert('**', '**')} icon={<Feather name="bold" size={20} color={colors.ink} />} />
        <ToolbarButton onPress={() => onInsert('*', '*')} icon={<Feather name="italic" size={20} color={colors.ink} />} />
        <ToolbarButton onPress={() => onInsert('~~', '~~')} icon={<Feather name="trash-2" size={20} color={colors.ink} />} />
        <ToolbarButton onPress={() => onInsert('# ', '')} icon={<Feather name="type" size={20} color={colors.ink} />} />
        <ToolbarButton onPress={() => onInsert('- ', '')} icon={<Feather name="list" size={20} color={colors.ink} />} />
        <ToolbarButton onPress={() => onInsert('> ', '')} icon={<Feather name="message-square" size={20} color={colors.ink} />} />
        <ToolbarButton onPress={() => onInsert('```\n', '\n```')} icon={<Feather name="code" size={20} color={colors.ink} />} />
        <ToolbarButton onPress={() => onInsert('---')} icon={<Feather name="minus" size={20} color={colors.ink} />} />
        <ToolbarButton onPress={() => onInsert('\u0964')} icon={<Text style={{ color: colors.accent, fontWeight: 'bold' }}>{'\u0964'}</Text>} />
        <ToolbarButton onPress={() => onInsert('\u0965')} icon={<Text style={{ color: colors.accent, fontWeight: 'bold' }}>{'\u0965'}</Text>} />
      </ScrollView>
    </View>
  );
};

const ToolbarButton = ({ onPress, icon }: { onPress: () => void, icon: React.ReactNode }) => (
  <Pressable onPress={onPress} style={s.toolbarBtn}>
    {icon}
  </Pressable>
);

const s = StyleSheet.create({
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  toolbar: {
    borderTopWidth: 1,
    height: 48,
  },
  toolbarContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  toolbarBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  }
});
