import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text, ScrollView, TextInputSelectionChangeEventData } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Svg, Path, Circle, Rect } from 'react-native-svg';

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

  const insertSyntax = (prefix: string, suffix: string = '') => {
    const selectedText = value.substring(selection.start, selection.end);
    const newText = value.substring(0, selection.start) + prefix + selectedText + suffix + value.substring(selection.end);
    onChange(newText);
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const renderToolbar = () => {
    if (!isEditMode) return null;
    return (
      <View style={[s.toolbar, { backgroundColor: colors.bg, borderTopColor: colors.strokeDim }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={s.toolbarContent}>
          <ToolbarButton onPress={() => insertSyntax('**', '**')} icon={
            <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
              <Path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
            </Svg>
          } />
          <ToolbarButton onPress={() => insertSyntax('*', '*')} icon={
            <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M19 4h-9" />
              <Path d="M14 20H5" />
              <Path d="M15 4L9 20" />
            </Svg>
          } />
          <ToolbarButton onPress={() => insertSyntax('~~', '~~')} icon={
            <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M16 4H9a3 3 0 0 0-2.83 4" />
              <Path d="M14 12a4 4 0 0 1 0 8H6" />
              <Path d="M4 12h16" />
            </Svg>
          } />
          <ToolbarButton onPress={() => insertSyntax('# ')} icon={
            <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M4 12h8" />
              <Path d="M4 18V6" />
              <Path d="M12 18V6" />
              <Path d="M21 18v-8l-2 2" />
            </Svg>
          } />
          <ToolbarButton onPress={() => insertSyntax('## ')} icon={
            <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M4 12h8" />
              <Path d="M4 18V6" />
              <Path d="M12 18V6" />
              <Path d="M21 18h-4c0-4 4-3 4-6a2 2 0 0 0-4-1" />
            </Svg>
          } />
          <ToolbarButton onPress={() => insertSyntax('- ')} icon={
            <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M9 6h11M9 12h11M9 18h11M5 6v.01M5 12v.01M5 18v.01" />
            </Svg>
          } />
          <ToolbarButton onPress={() => insertSyntax('1. ')} icon={
            <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M10 6h10M10 12h10M10 18h10M4 6h1v4M4 10h2M4 16h2v2h-2z" />
            </Svg>
          } />
          <ToolbarButton onPress={() => insertSyntax('- [ ] ')} icon={
            <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Rect x="4" y="4" width="16" height="16" rx="3" />
              <Path d="M8 12l3 3l5 -6" />
            </Svg>
          } />
          <ToolbarButton onPress={() => insertSyntax('> ')} icon={
            <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
              <Path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
            </Svg>
          } />
          <ToolbarButton onPress={() => insertSyntax('```\n', '\n```')} icon={
            <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
            </Svg>
          } />
          <ToolbarButton onPress={() => insertSyntax('---')} icon={
             <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
               <Path d="M5 12h14" />
             </Svg>
          } />
          <ToolbarButton onPress={() => insertSyntax('\u0964')} icon={<Text style={{ color: colors.accent, fontWeight: 'bold' }}>{'\u0964'}</Text>} />
          <ToolbarButton onPress={() => insertSyntax('\u0965')} icon={<Text style={{ color: colors.accent, fontWeight: 'bold' }}>{'\u0965'}</Text>} />
        </ScrollView>
      </View>
    );
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
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Markdown style={{
            body: { color: colors.ink, fontFamily: font.sans, fontSize: 16, lineHeight: 24 },
            heading1: { fontFamily: font.sansBold, fontSize: 32, marginTop: 16, marginBottom: 8, color: colors.ink },
            heading2: { fontFamily: font.sansBold, fontSize: 24, marginTop: 16, marginBottom: 8, color: colors.ink },
            paragraph: { marginTop: 0, marginBottom: 16 },
            list_item: { marginBottom: 8 },
            blockquote: { borderLeftWidth: 4, borderLeftColor: colors.accent, paddingLeft: 16, opacity: 0.8 },
            code_block: { backgroundColor: colors.bgRaised, padding: 16, borderRadius: 8, fontFamily: font.mono }
          }}>
            {value || placeholder || ''}
          </Markdown>
        </ScrollView>
      )}
    </View>
  );
});

export const MarkdownToolbar = ({ onInsert, theme }: { onInsert: (prefix: string, suffix?: string) => void, theme: any }) => {
  const { colors } = theme;
  return (
    <View style={[s.toolbar, { backgroundColor: colors.bg, borderTopColor: colors.strokeDim }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={s.toolbarContent}>
        <ToolbarButton onPress={() => onInsert('**', '**')} icon={
          <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
            <Path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          </Svg>
        } />
        <ToolbarButton onPress={() => onInsert('*', '*')} icon={
          <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M19 4L10 20" />
            <Path d="M15 4H9" />
            <Path d="M15 20H9" />
          </Svg>
        } />
        <ToolbarButton onPress={() => onInsert('~~', '~~')} icon={
          <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M16 4H9a3 3 0 0 0 -2.83 4" />
            <Path d="M14 12a4 4 0 0 1 0 8H6" />
            <Path d="M4 12h16" />
          </Svg>
        } />
        <ToolbarButton onPress={() => onInsert('# ', '')} icon={
           <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
             <Path d="M4 9h16" />
             <Path d="M4 15h16" />
             <Path d="M10 3l-2 18" />
             <Path d="M16 3l-2 18" />
           </Svg>
        } />
        <ToolbarButton onPress={() => onInsert('- ', '')} icon={
          <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M9 6l11 0" />
            <Path d="M9 12l11 0" />
            <Path d="M9 18l11 0" />
            <Path d="M5 6l0 .01" />
            <Path d="M5 12l0 .01" />
            <Path d="M5 18l0 .01" />
          </Svg>
        } />
        <ToolbarButton onPress={() => onInsert('> ', '')} icon={
          <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M10 21h-4a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-4" />
            <Path d="M15 11l-3 -3l-3 3" />
            <Path d="M12 8v7" />
          </Svg>
        } />
        <ToolbarButton onPress={() => onInsert('```\n', '\n```')} icon={
          <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
          </Svg>
        } />
        <ToolbarButton onPress={() => onInsert('---')} icon={
           <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
             <Path d="M5 12h14" />
           </Svg>
        } />
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
