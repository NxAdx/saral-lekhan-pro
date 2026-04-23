import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../store/themeStore';

interface Props { text: string; style?: object }

type Span = { text: string; bold?: boolean; italic?: boolean; underline?: boolean };

function parseInline(line: string): Span[] {
    const result: Span[] = [];
    const re = /(\*\*([^*]+)\*\*|__([^_]+)__|_([^_]+)_)/g;
    let last = 0;
    let m: RegExpExecArray | null;

    while ((m = re.exec(line)) !== null) {
        if (m.index > last) result.push({ text: line.slice(last, m.index) });
        if (m[0].startsWith('**')) result.push({ text: m[2], bold: true });
        else if (m[0].startsWith('__')) result.push({ text: m[3], underline: true });
        else result.push({ text: m[4], italic: true });
        last = re.lastIndex;
    }
    if (last < line.length) result.push({ text: line.slice(last) });
    if (result.length === 0) result.push({ text: line });
    return result;
}

export function MarkdownText({ text, style }: Props) {
    const theme = useTheme();
    const { colors, font, fontSize } = theme;

    const st = useMemo(() => StyleSheet.create({
        root: {},
        h1: { fontFamily: font.display, fontSize: 24 * fontSize, fontWeight: '700', color: colors.ink, lineHeight: 32 * fontSize, marginTop: 8, marginBottom: 6 },
        h2: { fontFamily: font.sansBold, fontSize: 18 * fontSize, color: colors.ink, lineHeight: 26 * fontSize, marginTop: 6, marginBottom: 4 },
        para: { fontFamily: font.sans, fontSize: 16 * fontSize, color: colors.inkMid, lineHeight: 28 * fontSize, marginBottom: 2 },
        inline: { fontFamily: font.sans, fontSize: 16 * fontSize, color: colors.inkMid },
        bold: { fontFamily: font.sansBold, color: colors.ink },
        italic: { fontStyle: 'italic' },
        ul: { textDecorationLine: 'underline' },
        listRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
        bullet: { fontFamily: font.sans, fontSize: 16 * fontSize, color: colors.accent, lineHeight: 28 * fontSize, width: 20 * fontSize },
        numLabel: { fontFamily: font.mono, fontSize: 14 * fontSize, color: colors.inkDim, lineHeight: 28 * fontSize, minWidth: 24 * fontSize },
        gap: { height: 10 * fontSize },
    }), [colors, font, fontSize]);

    const renderLine = (line: string, idx: number): React.ReactElement => {
        const trimmed = line.trimStart();

        const h1 = trimmed.match(/^#\s+(.+)/);
        if (h1) return <Text key={idx} style={st.h1}>{h1[1].trim()}</Text>;

        const h2 = trimmed.match(/^##\s+(.+)/);
        if (h2) return <Text key={idx} style={st.h2}>{h2[1].trim()}</Text>;

        const bullet = trimmed.match(/^[•\-\*]\s+(.*)/);
        if (bullet) return (
            <View key={idx} style={st.listRow}>
                <Text style={st.bullet}>•</Text>
                <Text style={st.para}>
                    {parseInline(bullet[1]).map((s, i) => (
                        <Text key={i} style={[st.inline, s.bold && st.bold, s.italic && st.italic, s.underline && st.ul]}>{s.text}</Text>
                    ))}
                </Text>
            </View>
        );

        const num = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (num) return (
            <View key={idx} style={st.listRow}>
                <Text style={st.numLabel}>{num[1]}.</Text>
                <Text style={st.para}>
                    {parseInline(num[2]).map((s, i) => (
                        <Text key={i} style={[st.inline, s.bold && st.bold, s.italic && st.italic, s.underline && st.ul]}>{s.text}</Text>
                    ))}
                </Text>
            </View>
        );

        if (trimmed === '') return <View key={idx} style={st.gap} />;

        const spans = parseInline(line);
        return (
            <Text key={idx} style={st.para}>
                {spans.map((s, i) => (
                    <Text key={i} style={[st.inline, s.bold && st.bold, s.italic && st.italic, s.underline && st.ul]}>
                        {s.text}
                    </Text>
                ))}
            </Text>
        );
    };

    return (
        <View style={[st.root, style]}>
            {text.split('\n').map((line, i) => renderLine(line, i))}
        </View>
    );
}
