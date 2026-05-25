import { router } from 'expo-router';
import { MapPin, Plus } from 'lucide-react-native';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { ActiveSessionCard } from '@/components/session/ActiveSessionCard';
import { EntryFade } from '@/components/ui/EntryFade';
import { PressableScale } from '@/components/ui/PressableScale';
import { useActiveSession } from '@/hooks/useActiveSession';
import { useDelightEnabled } from '@/lib/delight';

export default function HomeScreen() {
  const active = useActiveSession();
  const delight = useDelightEnabled();
  const breath = useSharedValue(1);

  useEffect(() => {
    if (!delight || active) {
      breath.value = 1;
      return;
    }
    breath.value = withRepeat(
      withTiming(1.02, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(breath);
  }, [delight, active, breath]);

  const breathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value }],
  }));

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <EntryFade>
          <View>
            <Text className="text-3xl font-bold text-ink dark:text-ink-inverse">ParkSpot</Text>
            <Text className="text-base text-ink-muted mt-1">
              {active ? 'Tap your saved spot to navigate back.' : 'Saved any parking spots yet?'}
            </Text>
          </View>
        </EntryFade>

        {active ? (
          <ActiveSessionCard session={active} />
        ) : (
          <EntryFade delay={80}>
            <Animated.View style={breathStyle}>
              <PressableScale
                onPress={() => router.push('/save')}
                scaleTo={0.97}
                accessibilityRole="button"
                accessibilityLabel="Park here"
                className="bg-brand-500 active:bg-brand-600 rounded-3xl p-8 items-center justify-center min-h-[180px]">
                <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-3">
                  <Plus color="#FFFFFF" size={36} strokeWidth={3} />
                </View>
                <Text className="text-white text-2xl font-bold">Park Here</Text>
                <Text className="text-white/80 text-sm mt-1">One tap to remember this spot</Text>
              </PressableScale>
            </Animated.View>
          </EntryFade>
        )}

        {active ? (
          <EntryFade delay={120}>
            <PressableScale
              onPress={() => router.push('/save')}
              scaleTo={0.97}
              className="self-start flex-row items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-800">
              <MapPin color="#0E7C66" size={18} />
              <Text className="text-brand-700 dark:text-brand-100 font-medium">
                Park somewhere new
              </Text>
            </PressableScale>
          </EntryFade>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
