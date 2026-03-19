import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { useTheme } from '../../store/themeStore';
import { MonetizationService } from '../../services/monetizationService';
import { Svg, Path, Circle } from 'react-native-svg';
import { BlurView } from 'expo-blur';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ visible, onClose }) => {
  const { colors, font, radius, shadow, isDark } = useTheme();
  const [loading, setLoading] = React.useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    // In a real app, we'd fetch offerings and let user choose.
    // For now, we'll try to find the standard 'pro' package.
    const offerings = await MonetizationService.getOfferings();
    if (offerings.length > 0) {
      const success = await MonetizationService.purchasePackage(offerings[0]);
      if (success) onClose();
    }
    setLoading(false);
  };

  const FeatureItem = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <View style={s.featItem}>
      <View style={s.featIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={s.featTitle}>{title}</Text>
        <Text style={s.featDesc}>{desc}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
        <View style={s.container}>
          <View style={s.handle} />

          <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            <View style={s.bentoHero}>
                <Text style={s.tag}>PREMIUM</Text>
                <Text style={s.heroTitle}>Saral Lekhan Plus</Text>
                <Text style={s.heroSub}>Unlock the full potential of your notes with pro intelligence and aesthetics.</Text>
            </View>

            <View style={s.featuresGrid}>
                <FeatureItem
                    title="Spark AI Advanced"
                    desc="Summarize, format, and generate smart titles for your notes with Gemini."
                    icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={2}><Path d="M12 2l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" /><Path d="M6 6l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" /></Svg>}
                />
                <FeatureItem
                    title="Pro Palettes"
                    desc="Unlock 10+ premium themes including Midnight, Forest, and Sunset."
                    icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={2}><Path d="M12 21a9 9 0 1 1 0-18c4.97 0 9 3.582 9 8 0 1.06-.474 2.056-1.33 2.87-.855.816-1.302 1.905-1.125 3.13.25 1.743-1.428 3-3.045 3z" /><Circle cx="7.5" cy="10.5" r=".5" fill={colors.accent} /><Circle cx="12" cy="7.5" r=".5" fill={colors.accent} /><Circle cx="16.5" cy="10.5" r=".5" fill={colors.accent} /></Svg>}
                />
                <FeatureItem
                    title="Cloud Precision"
                    desc="Automatic Google Drive sync and version history (Coming Soon)."
                    icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={2}><Path d="M7 18a4.6 4.4 0 0 1 0-9 5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1" /><Path d="M9 15l3 3 3-3" /><Path d="M12 12l0 6" /></Svg>}
                />
            </View>

            <Pressable
                onPress={handleSubscribe}
                style={({ pressed }) => [s.buyBtn, { opacity: pressed || loading ? 0.8 : 1 }]}
                disabled={loading}
            >
                <Text style={s.buyBtnText}>{loading ? "Processing..." : "Upgrade to Pro"}</Text>
            </Pressable>

            <Pressable onPress={onClose} style={s.cancelBtn}>
                <Text style={s.cancelBtnText}>Maybe Later</Text>
            </Pressable>

            <Text style={s.footer}>Secured with RevenueCat. Restore purchases anytime in settings.</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    container: {
        maxHeight: '85%',
        backgroundColor: '#D9D7D2', // Root background for Saral Lekhan
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 8,
    },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'center', marginBottom: 16 },
    content: { padding: 24, paddingBottom: 64 },
    bentoHero: {
        padding: 24,
        borderRadius: 24,
        backgroundColor: '#F5F3EF',
        borderWidth: 1.5,
        borderColor: '#2B2926',
        marginBottom: 20,
    },
    tag: { fontSize: 10, fontFamily: 'Hind-Bold', color: '#C14E28', letterSpacing: 1, marginBottom: 8 },
    heroTitle: { fontSize: 32, fontFamily: 'Hind-Bold', color: '#1C1A17', marginBottom: 8 },
    heroSub: { fontSize: 16, fontFamily: 'Hind', color: '#5A5751', lineHeight: 22 },

    featuresGrid: { gap: 12, marginBottom: 32 },
    featItem: {
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(43,41,38,0.05)',
    },
    featIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F2D5C8', justifyContent: 'center', alignItems: 'center' },
    featTitle: { fontSize: 16, fontFamily: 'Hind-Medium', color: '#1C1A17' },
    featDesc: { fontSize: 13, fontFamily: 'Hind', color: '#8E8B85', marginTop: 2 },

    buyBtn: {
        backgroundColor: '#C14E28',
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    buyBtnText: { color: '#F5F3EF', fontSize: 18, fontFamily: 'Hind-Bold' },
    cancelBtn: { paddingVertical: 12, alignItems: 'center' },
    cancelBtnText: { color: '#8E8B85', fontSize: 14, fontFamily: 'Hind-Medium' },
    footer: { textAlign: 'center', fontSize: 10, color: '#8E8B85', marginTop: 20, fontFamily: 'Hind' },
});
