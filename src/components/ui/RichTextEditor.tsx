import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { useTheme } from '../../store/themeStore';
import { buildEditorCss } from '../../utils/editorCssTemplate';

interface RichTextEditorProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  minHeight?: number;
  theme: any;
  loc: any;
  isEditMode: boolean;
}

export interface RichTextEditorRef {
  insertTextAtCursor: (text: string) => void;
  insertMarkdown: (prefix: string, suffix?: string) => void;
  getCursorPosition: () => number;
  insertImage: (url: string) => void;
  insertLink: (title: string, url: string) => void;
  getContentHtml: () => Promise<string>;
  setContentHTML: (html: string) => void;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({
  value, onChange, placeholder, minHeight, theme, loc, isEditMode
}, ref) => {
  const { colors, font } = theme;
  const richText = useRef<RichEditor>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [editorHeight, setEditorHeight] = useState(minHeight || 400);

  useImperativeHandle(ref, () => {
    return richText.current as any;
  });

  // Map old icons
  const iconMap: Record<string, any> = {
    [actions.setBold]: ({ tintColor }: any) => <Text style={{ color: tintColor, fontWeight: 'bold' }}>B</Text>,
    [actions.setItalic]: ({ tintColor }: any) => <Text style={{ color: tintColor, fontStyle: 'italic' }}>I</Text>,
    [actions.insertBulletsList]: ({ tintColor }: any) => <Text style={{ color: tintColor }}>•</Text>,
    [actions.insertOrderedList]: ({ tintColor }: any) => <Text style={{ color: tintColor }}>1.</Text>,
    [actions.insertLink]: ({ tintColor }: any) => <Text style={{ color: tintColor }}>🔗</Text>,
  };

  return (
    <View style={{ flex: 1, minHeight }}>
      {isEditMode ? (
        <>
          <RichEditor
            ref={richText}
            initialContentHTML={value}
            placeholder={placeholder}
            editorInitializedCallback={() => setEditorReady(true)}
            editorStyle={{
              backgroundColor: colors.bg,
              color: colors.inkMid,
              placeholderColor: colors.inkDim,
              cssText: buildEditorCss({
                fontSans: font.sans, fontSansBold: font.sansBold, fontSansSemi: font.sansSemi, fontMono: font.mono,
                fontSize: theme.fontSize || 1,
                colorBg: colors.bg, colorBgRaised: colors.bgRaised, colorInk: colors.ink,
                colorInkMid: colors.inkMid, colorInkDim: colors.inkDim, colorAccent: colors.accent, colorStroke: colors.stroke,
              }),
            }}
            onChange={onChange}
            useContainer={false}
            scrollEnabled={false}
            onHeightChange={(h) => setEditorHeight(Math.max(minHeight || 400, h + 100))}
          />
        </>
      ) : (
        <View style={{ flex: 1, minHeight: editorHeight, opacity: 0.9 }} pointerEvents="none">
          <RichEditor
            initialContentHTML={value}
            editorStyle={{
              backgroundColor: colors.bg,
              color: colors.ink,
              cssText: buildEditorCss({
                fontSans: font.sans, fontSansBold: font.sansBold, fontSansSemi: font.sansSemi, fontMono: font.mono,
                fontSize: theme.fontSize || 1,
                colorBg: colors.bg, colorBgRaised: colors.bgRaised, colorInk: colors.ink,
                colorInkMid: colors.inkMid, colorInkDim: colors.inkDim, colorAccent: colors.accent, colorStroke: colors.stroke,
              }),
            }}
            useContainer={false}
            scrollEnabled={false}
            disabled={true}
          />
        </View>
      )}
    </View>
  );
});

import { Text, StyleSheet } from 'react-native';
import { Svg, Path, Rect, Circle } from 'react-native-svg';

export const MarkdownToolbar = ({ editorRef, theme, onInsertPurnaViram, onInsertDoublePurnaViram }: { editorRef: React.RefObject<RichEditor | any>, theme: any, onInsertPurnaViram?: () => void, onInsertDoublePurnaViram?: () => void }) => {
  const { colors, font } = theme;
  return (
    <View style={[s.toolbarRoot, { backgroundColor: colors.bgRaised, borderTopColor: colors.stroke }]}>
      <RichToolbar
        editor={editorRef}
        iconTint={colors.ink}
        selectedIconTint={colors.accent}
        disabledIconTint={colors.inkDim}
        iconSize={18}
        iconGap={24}
        style={{ backgroundColor: 'transparent', height: 44 }}
        itemStyle={s.toolbarItem}
        flatContainerStyle={{ paddingBottom: 4 }}
        selectedButtonStyle={{ backgroundColor: 'transparent', borderBottomWidth: 2.5, borderBottomColor: colors.accent }}
        unselectedButtonStyle={{ backgroundColor: 'transparent' }}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.line,
          actions.code,
          actions.heading1,
          actions.heading2,
          actions.blockquote,
          actions.insertLink,
          actions.insertImage,
          'insertPurnaViram',
          'insertDoublePurnaViram'
        ]}
        onPressAddImage={() => {}}
        insertLink={() => {}}
        insertImage={() => {}}
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
          [actions.line]: ({ tintColor }: any) => (
            <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={tintColor} strokeWidth={2} strokeLinecap="round">
              <Path d="M5 12h14" />
            </Svg>
          ),
          [actions.code]: ({ tintColor }: any) => (
            <Text style={{ color: tintColor, fontFamily: font?.mono || 'monospace', fontSize: 13, fontWeight: '700', includeFontPadding: false }}>
              {'</>'}
            </Text>
          ),
          'insertPurnaViram': () => <Text style={{ color: colors.accent, fontWeight: 'bold' }}>{'\u0964'}</Text>,
          'insertDoublePurnaViram': () => <Text style={{ color: colors.accent, fontWeight: 'bold' }}>{'\u0965'}</Text>,
        }}
        insertPurnaViram={onInsertPurnaViram}
        insertDoublePurnaViram={onInsertDoublePurnaViram}
      />
    </View>
  );
};

const s = StyleSheet.create({
  toolbarRoot: {
    borderTopWidth: 1.5,
    paddingHorizontal: 6,
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
});

