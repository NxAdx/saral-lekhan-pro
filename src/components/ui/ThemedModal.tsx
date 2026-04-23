import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Platform, ScrollView } from 'react-native';
import { useTheme } from '../../store/themeStore';

interface ModalAction {
    label: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
    icon?: React.ReactNode;
}

interface ThemedModalProps {
    visible: boolean;
    title: string;
    subtitle?: string;
    actions: ModalAction[];
    onClose: () => void;
}

export const ThemedModal: React.FC<ThemedModalProps> = ({ visible, title, subtitle, actions, onClose }) => {
    const { colors, font, radius, shadow, fontSize } = useTheme();

    const s = useMemo(() => StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
        },
        container: {
            width: '100%',
            maxWidth: 400,
            backgroundColor: colors.bgRaised,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.strokeDim,
            overflow: 'hidden',
            ...shadow.soft,
            shadowColor: colors.shadow,
        },
        header: {
            padding: 24,
            paddingBottom: 16,
            alignItems: 'center',
        },
        title: {
            fontFamily: font.sansBold,
            fontSize: 20 * fontSize,
            color: colors.ink,
            textAlign: 'center',
            marginBottom: subtitle ? 8 : 0,
        },
        subtitle: {
            fontFamily: font.sans,
            fontSize: 14 * fontSize,
            color: colors.inkDim,
            textAlign: 'center',
        },
        actionsContainer: {
            paddingHorizontal: 16,
            paddingBottom: 16,
            gap: 8,
        },
        btn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: radius.md,
            backgroundColor: colors.bgDeep,
            gap: 8,
        },
        btnCancel: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.strokeDim,
        },
        btnDestructive: {
            backgroundColor: colors.accentBg,
            borderWidth: 1,
            borderColor: colors.accentDim,
        },
        btnLabel: {
            fontFamily: font.sansSemi,
            fontSize: 15 * fontSize,
            color: colors.ink,
        },
        btnLabelCancel: {
            color: colors.inkMid,
        },
        btnLabelDestructive: {
            color: colors.accentDark,
        }
    }), [colors, font, radius, shadow, subtitle, fontSize]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <Pressable style={s.overlay} onPress={onClose}>
                <Pressable style={s.container} onPress={(e) => e.stopPropagation()}>
                    <View style={s.header}>
                        <Text style={s.title}>{title}</Text>
                        {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
                    </View>
                    <ScrollView contentContainerStyle={s.actionsContainer} bounces={false}>
                        {actions.map((act, i) => {
                            const isCancel = act.style === 'cancel';
                            const isDestructive = act.style === 'destructive';
                            return (
                                <Pressable
                                    key={i}
                                    style={[s.btn, isCancel && s.btnCancel, isDestructive && s.btnDestructive]}
                                    onPress={() => {
                                        act.onPress();
                                        onClose();
                                    }}
                                >
                                    {act.icon}
                                    <Text style={[s.btnLabel, isCancel && s.btnLabelCancel, isDestructive && s.btnLabelDestructive]}>
                                        {act.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
};
