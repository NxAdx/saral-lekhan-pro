import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ThemedModal } from './ThemedModal';
import { useTheme } from '../../store/themeStore';
import { useTypography } from '../../store/typographyStore';
import { strings } from '../../i18n/strings';
import { useSettingsStore } from '../../store/settingsStore';
import { Svg, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

interface TableBuilderModalProps {
  visible: boolean;
  onClose: () => void;
  onInsert: (html: string) => void;
}

export function TableBuilderModal({ visible, onClose, onInsert }: TableBuilderModalProps) {
  const theme = useTheme();
  const type = useTypography();
  const settings = useSettingsStore();
  const loc = strings[settings.language] || strings['En'];
  const { colors, font, radius } = theme;

  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  const handleInsert = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    let html = `<br><table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%; border-color: ${colors.stroke};">`;
    
    // Generate Header
    html += `<thead><tr style="background-color: ${colors.bgRaised};">`;
    for (let c = 0; c < cols; c++) {
      html += `<th><br></th>`;
    }
    html += `</tr></thead>`;

    // Generate Body
    html += `<tbody>`;
    for (let r = 0; r < rows - 1; r++) { // -1 because header is a row visually
      html += `<tr>`;
      for (let c = 0; c < cols; c++) {
        html += `<td><br></td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table><br>`;

    onInsert(html);
  };

  const s = StyleSheet.create({
    title: { ...type.titleLarge, fontFamily: font.sansBold, color: colors.ink, marginBottom: 24, textAlign: 'center' },
    stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    stepperLabel: { ...type.bodyLarge, fontFamily: font.sansMed, color: colors.inkMid },
    stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    stepperBtn: { 
      width: 40, height: 40, borderRadius: 20, 
      backgroundColor: colors.bgRaised, 
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: colors.strokeDim 
    },
    stepperValue: { ...type.titleLarge, fontFamily: font.sansSemi, color: colors.ink, width: 30, textAlign: 'center' },
    insertBtn: { 
      backgroundColor: colors.accent, paddingVertical: 14, borderRadius: radius.lg, 
      alignItems: 'center', marginTop: 12 
    },
    insertBtnText: { ...type.bodyLarge, fontFamily: font.sansSemi, color: colors.bg }
  });

  return (
    <ThemedModal 
      visible={visible} 
      onClose={onClose} 
      title="Insert Table"
      actions={[]}
      customContent={
        <View style={{ gap: 20, paddingTop: 10 }}>
          <View style={s.stepperRow}>
            <Text style={s.stepperLabel}>Rows</Text>
            <View style={s.stepperControls}>
              <Pressable 
                style={s.stepperBtn} hitSlop={theme.hitSlop}
                onPress={() => { Haptics.selectionAsync(); setRows(Math.max(2, rows - 1)); }}
              >
                <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M5 12h14" />
                </Svg>
              </Pressable>
              <Text style={s.stepperValue}>{rows}</Text>
              <Pressable 
                style={s.stepperBtn} hitSlop={theme.hitSlop}
                onPress={() => { Haptics.selectionAsync(); setRows(Math.min(10, rows + 1)); }}
              >
                <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M12 5v14M5 12h14" />
                </Svg>
              </Pressable>
            </View>
          </View>

          <View style={s.stepperRow}>
            <Text style={s.stepperLabel}>Columns</Text>
            <View style={s.stepperControls}>
              <Pressable 
                style={s.stepperBtn} hitSlop={theme.hitSlop}
                onPress={() => { Haptics.selectionAsync(); setCols(Math.max(1, cols - 1)); }}
              >
                <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M5 12h14" />
                </Svg>
              </Pressable>
              <Text style={s.stepperValue}>{cols}</Text>
              <Pressable 
                style={s.stepperBtn} hitSlop={theme.hitSlop}
                onPress={() => { Haptics.selectionAsync(); setCols(Math.min(10, cols + 1)); }}
              >
                <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M12 5v14M5 12h14" />
                </Svg>
              </Pressable>
            </View>
          </View>

          <Pressable style={s.insertBtn} onPress={handleInsert}>
            <Text style={s.insertBtnText}>Insert Table</Text>
          </Pressable>
        </View>
      }
    />
  );
}
