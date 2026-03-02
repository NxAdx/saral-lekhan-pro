import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Platform, ScrollView } from 'react-native';
import { useTheme } from '../../store/themeStore';
import { useTypography } from '../../store/typographyStore';
import { sharedTokens } from '../../tokens';

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
    customContent?: React.ReactNode;
    actions: ModalAction[];
    onClose: () => void;
}

export const ThemedModal = ({ visible, title, subtitle, onClose, actions, customContent }: ThemedModalProps) => {
    const theme = useTheme();
    const { colors, font, radius, shadow } = theme;
    const type = useTypography();

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
            ...type.titleLarge,
            fontFamily: font.sansBold,
            color: colors.ink,
            textAlign: 'center',
            marginBottom: subtitle ? 8 : 0,
        },
        subtitle: {
            ...type.labelMedium,
            fontFamily: font.sans,
            color: colors.inkMid,
            textAlign: 'center',
            marginBottom: 24,
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
            borderWidth: 1.5,
            borderColor: colors.stroke,
            gap: 8,
            ...shadow.hard,
            shadowColor: colors.shadow,
        },
        btnCancel: {
            backgroundColor: colors.bgRaised,
            borderColor: colors.strokeDim,
        },
        btnDestructive: {
            backgroundColor: colors.accentBg,
            borderColor: colors.accent,
        },
        btnLabel: {
            ...type.labelMedium,
            fontFamily: font.sansSemi,
            color: colors.ink,
        },
        btnLabelCancel: {
            color: colors.inkMid,
        },
        btnLabelDestructive: {
            color: theme.isDark ? colors.white : '#FFFFFF',
        }
    }), [colors, font, radius, shadow, subtitle, type]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <Pressable style={s.overlay} onPress={onClose}>
                <Pressable style={s.container} onPress={(e) => e.stopPropagation()}>
                    <View style={s.header}>
                        <Text style={s.title}>{title}</Text>
                        {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
                        {!!customContent && <View style={{ width: '100%', marginTop: 16 }}>{customContent}</View>}
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
