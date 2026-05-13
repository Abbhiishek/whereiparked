import { Navigation } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { Coords } from '@/lib/geo';
import { openWalkingNavigation } from '@/lib/intents';

interface NavigateBackCTAProps {
  target: Coords;
  distanceLabel: string;
  etaMinutes: number;
}

export function NavigateBackCTA({ target, distanceLabel, etaMinutes }: NavigateBackCTAProps) {
  return (
    <Pressable
      onPress={() => openWalkingNavigation(target)}
      className="bg-brand-500 active:bg-brand-600 rounded-3xl py-5 px-6"
      accessibilityRole="button"
      accessibilityLabel={`Navigate back, ${distanceLabel} away, about ${etaMinutes} minutes walking`}>
      <View className="flex-row items-center justify-center gap-3">
        <Navigation color="#FFFFFF" size={28} fill="#FFFFFF" />
        <Text className="text-white text-xl font-bold">Navigate Me Back</Text>
      </View>
      <Text className="text-white/80 text-center mt-1 text-sm">
        {distanceLabel} · ~{etaMinutes} min walk
      </Text>
    </Pressable>
  );
}
