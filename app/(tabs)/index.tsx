import { router } from 'expo-router';
import { MapPin, Plus } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActiveSessionCard } from '@/components/session/ActiveSessionCard';
import { useActiveSession } from '@/hooks/useActiveSession';

export default function HomeScreen() {
  const active = useActiveSession();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <View>
          <Text className="text-3xl font-bold text-ink dark:text-ink-inverse">ParkSpot</Text>
          <Text className="text-base text-ink-muted mt-1">
            {active ? "Tap your saved spot to navigate back." : 'Saved any parking spots yet?'}
          </Text>
        </View>

        {active ? (
          <ActiveSessionCard session={active} />
        ) : (
          <Pressable
            onPress={() => router.push('/save')}
            className="bg-brand-500 active:bg-brand-600 rounded-3xl p-8 items-center justify-center min-h-[180px]"
            accessibilityRole="button"
            accessibilityLabel="Park here">
            <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-3">
              <Plus color="#FFFFFF" size={36} strokeWidth={3} />
            </View>
            <Text className="text-white text-2xl font-bold">Park Here</Text>
            <Text className="text-white/80 text-sm mt-1">One tap to remember this spot</Text>
          </Pressable>
        )}

        {active ? (
          <Pressable
            onPress={() => router.push('/save')}
            className="self-start flex-row items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-800">
            <MapPin color="#0E7C66" size={18} />
            <Text className="text-brand-700 dark:text-brand-100 font-medium">Park somewhere new</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
