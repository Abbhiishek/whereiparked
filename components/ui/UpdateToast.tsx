import { Sparkles, X } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Midnight } from '@/constants/design';
import { useDelightEnabled } from '@/lib/delight';

interface UpdateToastProps {
  visible: boolean;
  onApply: () => void;
  onDismiss: () => void;
}

/**
 * Slide-in banner shown when a new OTA bundle has finished downloading.
 * Tapping "Restart" reloads into the new bundle immediately; dismissing
 * defers it to the next cold start.
 */
export function UpdateToast({ visible, onApply, onDismiss }: UpdateToastProps) {
  const delight = useDelightEnabled();
  const progress = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (!delight) {
      progress.value = visible ? 1 : 0;
      return;
    }
    progress.value = withTiming(visible ? 1 : 0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible, delight, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -16 }],
  }));

  if (!visible) return null;

  return (
    <SafeAreaView
      edges={['top']}
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
      }}>
      <Animated.View
        style={[
          {
            marginHorizontal: 12,
            marginTop: 8,
            backgroundColor: Midnight.surface,
            borderWidth: 1,
            borderColor: Midnight.border,
            borderRadius: 18,
            paddingVertical: 12,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            shadowColor: '#000',
            shadowOpacity: 0.4,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 12 },
            elevation: 8,
          },
          animatedStyle,
        ]}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: Midnight.accent + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Sparkles color={Midnight.accent} size={20} />
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Midnight.text }}>
            Update ready
          </Text>
          <Text style={{ fontSize: 11, color: Midnight.textMute, marginTop: 1 }}>
            Restart to apply the latest version.
          </Text>
        </View>

        <Pressable
          onPress={onApply}
          hitSlop={6}
          style={({ pressed }) => ({
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 10,
            backgroundColor: Midnight.accent,
            opacity: pressed ? 0.85 : 1,
          })}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: Midnight.accentInk }}>
            Restart
          </Text>
        </Pressable>

        <Pressable
          onPress={onDismiss}
          hitSlop={8}
          style={({ pressed }) => ({ padding: 4, opacity: pressed ? 0.6 : 1 })}>
          <X color={Midnight.textMute} size={16} />
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
