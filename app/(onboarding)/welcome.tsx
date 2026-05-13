import { router } from 'expo-router';
import { MapPin, Mic, Camera as CameraIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark">
      <View className="flex-1 px-6 py-12 justify-between">
        <View className="mt-12">
          <Text className="text-3xl font-bold text-ink dark:text-ink-inverse mb-2">
            Welcome to ParkSpot
          </Text>
          <Text className="text-base text-ink-muted">
            Three quick things and you&apos;re ready to never lose your car again.
          </Text>
        </View>

        <View className="gap-6">
          <FeatureRow
            icon={<MapPin color="#0E7C66" size={28} />}
            title="One tap to save"
            description="GPS captured the moment you park. Works underground."
          />
          <FeatureRow
            icon={<CameraIcon color="#0E7C66" size={28} />}
            title="Snap the spot"
            description="Photo of pillar B7 or row 14 — your call. Optional."
          />
          <FeatureRow
            icon={<Mic color="#0E7C66" size={28} />}
            title="Voice notes work"
            description="Hands full of bags? Just talk to your phone."
          />
        </View>

        <Pressable
          onPress={() => router.push('/(onboarding)/permissions')}
          className="bg-brand-500 active:bg-brand-600 rounded-2xl py-4 items-center justify-center min-h-[56px]"
          accessibilityRole="button">
          <Text className="text-white font-semibold text-base">Get started</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row items-start gap-4">
      <View className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-800 items-center justify-center">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink dark:text-ink-inverse">{title}</Text>
        <Text className="text-sm text-ink-muted mt-0.5">{description}</Text>
      </View>
    </View>
  );
}
