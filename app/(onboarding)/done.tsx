import { router } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOnboardingStore } from '@/stores/onboardingStore';

export default function OnboardingDoneScreen() {
  const setCompleted = useOnboardingStore((s) => s.setCompleted);

  function finish() {
    setCompleted(true);
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark">
      <View className="flex-1 px-6 py-12 justify-between">
        <View className="flex-1 items-center justify-center">
          <CheckCircle2 color="#FFC542" size={96} strokeWidth={2.2} />
          <Text className="text-3xl font-bold text-ink dark:text-ink-inverse text-center mt-6 mb-3">
            You&apos;re all set
          </Text>
          <Text className="text-base text-ink-muted text-center leading-6 px-4">
            Pin the ParkSpot widget to your home screen so saving a parking spot is one tap away —
            even when ParkSpot isn&apos;t open.
          </Text>
        </View>
        <Pressable
          onPress={finish}
          className="bg-brand-500 active:bg-brand-600 rounded-2xl py-4 items-center justify-center min-h-[56px]">
          <Text className="text-white font-semibold text-base">Go to ParkSpot</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
