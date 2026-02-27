import React, { useRef } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Animated, Pressable } from 'react-native';

interface HardShadowProps {
    children: React.ReactNode;
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    radius?: number;
    /** Style applied to the outer wrapper (sets margin, alignSelf, etc.) */
    style?: StyleProp<ViewStyle>;
    /** Style applied to the front content layer (background, border, padding) */
    frontStyle?: StyleProp<ViewStyle>;
    onPress?: () => void;
    disabled?: boolean;
    hitSlop?: number;
}

export function HardShadow({
    children,
    shadowColor,
    shadowOffset,
    radius = 0,
    style,
    frontStyle,
    onPress,
    disabled,
    hitSlop,
}: HardShadowProps) {
    const pressedVal = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
        Animated.timing(pressedVal, { toValue: 1, duration: 80, useNativeDriver: true }).start();
    };
    const handlePressOut = () => {
        Animated.timing(pressedVal, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    };

    return (
        // Outer wrapper — sizes to content (no flex), extra space for shadow bleed
        <View style={[
            s.wrapper,
            // add space below/right for shadow offset so it's not clipped
            {
                paddingBottom: shadowOffset.height,
                paddingRight: shadowOffset.width,
            },
            style,
        ]}>
            {/* Shadow layer — sits at bottom-right behind content */}
            <View
                style={[
                    s.shadowLayer,
                    {
                        backgroundColor: shadowColor,
                        borderRadius: radius,
                        // Positioned to peek out from behind content
                        top: shadowOffset.height,
                        left: shadowOffset.width,
                        right: 0,
                        bottom: 0,
                    },
                ]}
            />

            {/* Content / foreground layer */}
            <Animated.View
                style={[
                    s.frontLayer,
                    { borderRadius: radius },
                    frontStyle,
                    {
                        transform: [
                            { translateY: pressedVal.interpolate({ inputRange: [0, 1], outputRange: [0, shadowOffset.height] }) },
                            { translateX: pressedVal.interpolate({ inputRange: [0, 1], outputRange: [0, shadowOffset.width] }) },
                        ],
                    },
                ]}
            >
                <Pressable
                    onPress={onPress}
                    onPressIn={onPress ? handlePressIn : undefined}
                    onPressOut={onPress ? handlePressOut : undefined}
                    disabled={disabled}
                    hitSlop={hitSlop}
                    style={s.pressable}
                >
                    {children}
                </Pressable>
            </Animated.View>
        </View>
    );
}

const s = StyleSheet.create({
    wrapper: {
        // Key: no flex, sizes to content
        alignSelf: 'flex-start',
        position: 'relative',
    },
    shadowLayer: {
        position: 'absolute',
    },
    frontLayer: {
        // No flex — sizes to content from children
    },
    pressable: {
        // No flex — sizes to children
    },
});
