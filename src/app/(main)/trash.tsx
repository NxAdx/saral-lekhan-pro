import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Svg, Path, Line, Polyline, Circle } from 'react-native-svg';
import { useNotesStore } from '../../store/notesStore';
import { useThemeStore, useTheme } from '../../store/themeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { strings } from '../../i18n/strings';
import { BentoCard } from '../../components/ui/BentoCard';
import { ThemedModal } from '../../components/ui/ThemedModal';

export default function TrashScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { colors, font, shadow } = theme;
    const lang = useSettingsStore(s => s.language);
    const loc = strings[lang] || strings['En'];

    const getDeletedNotes = useNotesStore((s) => s.getDeletedNotes);
    const restoreNote = useNotesStore((s) => s.restoreNote);
    const permanentlyDeleteNote = useNotesStore((s) => s.permanentlyDeleteNote);

    const deletedNotes = getDeletedNotes();

    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedActionId, setSelectedActionId] = useState<number | null>(null);

    const handleNotePress = (id: number) => {
        setSelectedActionId(id);
        setShowActionModal(true);
    };

    const handleRestore = () => {
        if (selectedActionId !== null) restoreNote(selectedActionId);
    };

    const handlePermanentDelete = () => {
        if (selectedActionId !== null) permanentlyDeleteNote(selectedActionId);
    };

    const s = useMemo(() => StyleSheet.create({
        root: {
            flex: 1,
            backgroundColor: colors.bg,
            paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.strokeDim,
        },
        backBtn: { marginRight: 16, padding: 4 },
        title: { fontFamily: font.sansBold, fontSize: 22 * theme.fontSize, color: colors.ink },

        listContent: { paddingBottom: 100, paddingTop: 16 },
        noteContainer: { paddingHorizontal: 20 },

        empty: { paddingTop: 60, alignItems: 'center' },
        emptyTitle: { fontFamily: font.sansSemi, fontSize: 16 * theme.fontSize, color: colors.inkMid, marginBottom: 6 },
        emptySub: { fontFamily: font.mono, fontSize: 12 * theme.fontSize, color: colors.inkDim },
    }), [colors, font, theme.fontSize]);

    return (
        <View style={s.root}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} translucent={false} />

            <View style={s.header}>
                <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
                    <Svg viewBox="0 0 24 24" width={24} height={24}>
                        <Line x1="19" y1="12" x2="5" y2="12" stroke={colors.ink} strokeWidth={2.5} strokeLinecap="round" />
                        <Polyline points="12 19 5 12 12 5" stroke={colors.ink} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </Svg>
                </Pressable>
                <Text style={s.title}>{loc.trash}</Text>
            </View>

            <FlatList
                data={deletedNotes}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={s.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={s.noteContainer}>
                        <BentoCard
                            title={item.title}
                            preview={item.body}
                            date={new Date(item.updated_at).toLocaleDateString()}
                            tag={item.tag || undefined}
                            onPress={() => handleNotePress(item.id)}
                        />
                    </View>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                ListEmptyComponent={
                    <View style={s.empty}>
                        <Text style={s.emptyTitle}>{loc.trashEmpty}</Text>
                        <Text style={s.emptySub}>{loc.trashEmptySub}</Text>
                    </View>
                }
            />

            <ThemedModal
                visible={showActionModal}
                title={loc.trash}
                onClose={() => setShowActionModal(false)}
                actions={[
                    {
                        label: loc.restore,
                        style: 'default',
                        onPress: handleRestore
                    },
                    {
                        label: loc.deleteForever,
                        style: 'destructive',
                        onPress: handlePermanentDelete
                    },
                    {
                        label: loc.editor.cancel,
                        style: 'cancel',
                        onPress: () => setShowActionModal(false)
                    }
                ]}
            />
        </View>
    );
}
