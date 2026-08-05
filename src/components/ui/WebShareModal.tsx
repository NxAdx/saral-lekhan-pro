import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Clipboard } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../store/themeStore';
import { ThemedModal } from './ThemedModal';
import { startWebShareServer, stopWebShareServer, getWebShareServerUrl } from '../../utils/webServer';

interface WebShareModalProps {
  visible: boolean;
  onClose: () => void;
  onShowToast: (message: string) => void;
}

export function WebShareModal({ visible, onClose, onShowToast }: WebShareModalProps) {
  const { colors, font, radius } = useTheme();
  const [isRunning, setIsRunning] = useState(false);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      checkStatus();
    }
  }, [visible]);

  const checkStatus = async () => {
    const url = await getWebShareServerUrl();
    if (url) {
      setServerUrl(url);
      setIsRunning(true);
    } else {
      setIsRunning(false);
      setServerUrl(null);
    }
  };

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isRunning) {
        await stopWebShareServer();
        setIsRunning(false);
        setServerUrl(null);
        onShowToast('Web Share server stopped');
      } else {
        const url = await startWebShareServer(8085);
        if (url) {
          setServerUrl(url);
          setIsRunning(true);
          onShowToast('Web Share server running!');
        } else {
          onShowToast('Failed to start server. Ensure WiFi is connected.');
        }
      }
    } catch (e) {
      onShowToast('Error changing Web Share state');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    if (serverUrl && Clipboard) {
      try {
        Clipboard.setString(serverUrl);
        onShowToast('URL copied to clipboard!');
      } catch (e) {
        onShowToast('Please long-press URL to copy');
      }
    }
  };

  const customContent = (
    <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
      <View
        style={{
          backgroundColor: colors.bg,
          borderRadius: radius.md,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.strokeDim,
          alignItems: 'center',
          marginVertical: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: isRunning ? '#10b981' : '#6b7280',
            }}
          />
          <Text style={{ fontFamily: font.sansSemi, fontSize: 14, color: isRunning ? '#10b981' : colors.inkDim }}>
            {isRunning ? 'Running on Local WiFi' : 'Server Stopped'}
          </Text>
        </View>

        {isRunning && serverUrl ? (
          <Pressable
            onPress={handleCopyUrl}
            style={{
              backgroundColor: colors.accentBg,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: radius.sm,
              borderWidth: 1,
              borderColor: colors.accent,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: 6,
            }}
            accessibilityLabel="Copy Web Share URL"
          >
            <Text selectable={true} style={{ fontFamily: font.sansBold, fontSize: 16, color: colors.accent }}>{serverUrl}</Text>
            <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" />
              <Path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
            </Svg>
          </Pressable>
        ) : (
          <Text style={{ fontFamily: font.sans, fontSize: 13, color: colors.inkMid, textAlign: 'center', marginTop: 4 }}>
            Start the server to generate a secure local WiFi address for PC browser editing.
          </Text>
        )}
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={{ fontFamily: font.sansBold, fontSize: 14, color: colors.ink, marginBottom: 4 }}>How to use:</Text>
        <Text style={{ fontFamily: font.sans, fontSize: 13, color: colors.inkMid, lineHeight: 18 }}>
          1. Connect both your phone and PC/tablet to the same WiFi network.{'\n'}
          2. Tap &quot;Start Server&quot; and open the URL in any PC browser.{'\n'}
          3. Enjoy full-screen viewing, editing, and copying with real-time mobile sync!
        </Text>
      </View>

      <Pressable
        onPress={handleToggle}
        disabled={loading}
        style={{
          backgroundColor: isRunning ? '#ef4444' : colors.accent,
          paddingVertical: 12,
          borderRadius: radius.md,
          alignItems: 'center',
          marginTop: 20,
          opacity: loading ? 0.6 : 1,
        }}
        accessibilityLabel={isRunning ? 'Stop Web Share Server' : 'Start Web Share Server'}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ fontFamily: font.sansBold, fontSize: 15, color: '#ffffff' }}>
            {isRunning ? 'Stop Server' : 'Start Server'}
          </Text>
        )}
      </Pressable>
    </View>
  );

  return (
    <ThemedModal
      visible={visible}
      title="Local Web Share"
      subtitle="Edit notes on your computer browser"
      customContent={customContent}
      actions={[
        {
          label: 'Close',
          onPress: onClose,
          style: 'default',
        },
      ]}
      onClose={onClose}
    />
  );
}
