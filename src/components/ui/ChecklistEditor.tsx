import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Keyboard } from 'react-native';
import { ChecklistItem } from '../../types/note';
import { useTheme } from '../../store/themeStore';
import { log } from '../../utils/Logger';

// A simple SVG checkmark
const CheckIcon = ({ color }: { color: string }) => (
  <View style={[styles.checkboxInner, { backgroundColor: color }]} />
);

// A simple SVG delete icon (X)
const DeleteIcon = ({ color }: { color: string }) => (
  <Text style={{ color, fontSize: 16, fontWeight: 'bold' }}>✕</Text>
);

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  readOnly?: boolean;
}

export function ChecklistEditor({ items, onChange, readOnly = false }: ChecklistEditorProps) {
  const { colors, font } = useTheme();
  
  // Local state for the "Add new item" input
  const [newItemText, setNewItemText] = useState('');

  const toggleCheck = (id: string) => {
    if (readOnly) return;
    onChange(
      items.map(item =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  const updateText = (id: string, newText: string) => {
    if (readOnly) return;
    onChange(
      items.map(item =>
        item.id === id ? { ...item, text: newText } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    if (readOnly) return;
    onChange(items.filter(item => item.id !== id));
  };

  const handleAddItem = () => {
    if (readOnly || !newItemText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: `cli_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      text: newItemText.trim(),
      isChecked: false,
      order: items.length > 0 ? Math.max(...items.map(i => i.order)) + 1 : 0,
    };
    
    onChange([...items, newItem]);
    setNewItemText('');
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    if (readOnly) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    // Swap elements
    const temp = newItems[index];
    newItems[index] = newItems[newIndex];
    newItems[newIndex] = temp;

    // Fix ordering
    onChange(newItems.map((item, i) => ({ ...item, order: i })));
  };

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={item.id} style={styles.itemRow}>
          <TouchableOpacity 
            style={[styles.checkbox, { borderColor: colors.ink }]}
            onPress={() => toggleCheck(item.id)}
            disabled={readOnly}
          >
            {item.isChecked && <CheckIcon color={colors.accent} />}
          </TouchableOpacity>

          <TextInput
            style={[
              styles.itemInput, 
              { color: colors.ink, fontFamily: font.sans },
              item.isChecked && { color: colors.inkDim, textDecorationLine: 'line-through' }
            ]}
            value={item.text}
            onChangeText={(t) => updateText(item.id, t)}
            editable={!readOnly}
            multiline
            blurOnSubmit={true}
            onSubmitEditing={Keyboard.dismiss}
          />

          {!readOnly && (
            <View style={styles.controls}>
              {index > 0 && (
                <TouchableOpacity onPress={() => moveItem(index, -1)} style={styles.iconBtn}>
                  <Text style={{ color: colors.inkDim, fontSize: 18 }}>↑</Text>
                </TouchableOpacity>
              )}
              {index < items.length - 1 && (
                <TouchableOpacity onPress={() => moveItem(index, 1)} style={styles.iconBtn}>
                  <Text style={{ color: colors.inkDim, fontSize: 18 }}>↓</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.iconBtn}>
                <DeleteIcon color={'#ff4444'} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}

      {!readOnly && (
        <View style={[styles.itemRow, styles.addRow]}>
          <View style={[styles.checkbox, { borderColor: 'transparent' }]} />
          <TextInput
            style={[styles.itemInput, { color: colors.ink, fontFamily: font.sans }]}
            value={newItemText}
            onChangeText={setNewItemText}
            placeholder="Add item..."
            placeholderTextColor={colors.inkDim}
            onSubmitEditing={handleAddItem}
            returnKeyType="done"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addRow: {
    marginTop: 8,
    opacity: 0.8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  itemInput: {
    flex: 1,
    fontSize: 18,
    padding: 0,
    margin: 0,
    minHeight: 24,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
    marginLeft: 4,
  }
});
