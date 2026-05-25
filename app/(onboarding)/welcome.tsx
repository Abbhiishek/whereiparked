import { router } from 'expo-router';
import { MapPin, Mic, Camera as CameraIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { EntryFade } from '@/components/ui/EntryFade';
import { PressableScale } from '@/components/ui/PressableScale';
import { SPRING_GENTLE, useDelightEnabled } from '@/lib/delight';

const FEATURES = [
  {
    Icon: MapPin,
    title: 'One tap to save',
    description: 'GPS captured the moment you park. Works underground.',
  },
  {
    Icon: CameraIcon,
    title: 'Snap the spot',
    description: 'Photo of pillar B7 or row 14 — your call. Optional.',
  },
  {
    Icon: Mic,
    title: 'Voice notes work',
    description: 'Hands full of bags? Just talk to your phone.',
  },
] as const;

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark">
      <View className="flex-1 px-6 py-12 justify-between">
        <EntryFade>
          <View className="mt-12">
            <Text className="text-3xl font-bold text-ink dark:text-ink-inverse mb-2">
              Welcome to ParkSpot
            </Text>
            <Text className="text-base text-ink-muted">
              Three quick things and you&apos;re ready to never lose your car again.
            </Text>
          </View>
        </EntryFade>

        <View className="gap-6">
          {FEATURES.map((feature, idx) => (
            <EntryFade key={feature.title} delay={120 + idx * 90}>
              <FeatureRow
                icon={<feature.Icon color="#0E7C66" size={28} />}
                title={feature.title}
                description={feature.description}
                index={idx}
              />
            </EntryFade>
          ))}
        </View>

        <EntryFade delay={400}>
          <PressableScale
            onPress={() => router.push('/(onboarding)/permissions')}
            accessibilityRole="button"
            className="bg-brand-500 active:bg-brand-600 rounded-2xl py-4 items-center justify-center min-h-[56px]">
            <Text className="text-white font-semibold text-base">Get started</Text>
          </PressableScale>
        </EntryFade>
      </View>
    </SafeAreaView>
  );
}

interface FeatureRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

function FeatureRow({ icon, title, description, index }: FeatureRowProps) {
  const delight = useDelightEnabled();
  const iconScale = useSharedValue(delight ? 0.6 : 1);

  useEffect(() => {
    if (!delight) {
      iconScale.value = 1;
      return;
    }
    iconScale.value = withDelay(180 + index * 90, withSpring(1, SPRING_GENTLE));
  }, [delight, index, iconScale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <View className="flex-row items-start gap-4">
      <Animated.View
        style={iconStyle}
        className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-800 items-center justify-center">
        {icon}
      </Animated.View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink dark:text-ink-inverse">{title}</Text>
        <Text className="text-sm text-ink-muted mt-0.5">{description}</Text>
      </View>
    </View>
  );
}
