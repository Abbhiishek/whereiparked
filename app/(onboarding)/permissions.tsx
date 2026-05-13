import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Bell, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOnboardingStore } from '@/stores/onboardingStore';

export default function PermissionsScreen() {
  const [step, setStep] = useState<'location' | 'notifications' | 'done'>('location');
  const [working, setWorking] = useState(false);
  const setLocationGranted = useOnboardingStore((s) => s.setLocationGranted);
  const setNotificationsGranted = useOnboardingStore((s) => s.setNotificationsGranted);

  async function requestLocation() {
    setWorking(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationGranted(status === 'granted');
    setWorking(false);
    setStep('notifications');
  }

  async function requestNotifications() {
    setWorking(true);
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationsGranted(status === 'granted');
    setWorking(false);
    setStep('done');
    router.replace('/(onboarding)/done');
  }

  if (step === 'location') {
    return (
      <PermissionPrompt
        icon={<MapPin color="#0E7C66" size={56} />}
        title="Allow location access"
        description="ParkSpot uses your phone's GPS to remember exactly where you parked. We never track you in the background."
        cta={working ? 'Requesting...' : 'Allow location'}
        onPress={requestLocation}
        disabled={working}
      />
    );
  }

  return (
    <PermissionPrompt
      icon={<Bell color="#0E7C66" size={56} />}
      title="Get parking reminders"
      description="We'll notify you before your meter runs out. No spam, no marketing — just the reminders you set."
      cta={working ? 'Requesting...' : 'Allow notifications'}
      onPress={requestNotifications}
      disabled={working}
    />
  );
}

function PermissionPrompt({
  icon,
  title,
  description,
  cta,
  onPress,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark">
      <View className="flex-1 px-6 py-12 justify-between">
        <View className="flex-1 items-center justify-center">
          <View className="w-28 h-28 rounded-full bg-brand-50 dark:bg-brand-800 items-center justify-center mb-8">
            {icon}
          </View>
          <Text className="text-2xl font-bold text-ink dark:text-ink-inverse text-center mb-3">
            {title}
          </Text>
          <Text className="text-base text-ink-muted text-center leading-6 px-4">
            {description}
          </Text>
        </View>
        <Pressable
          onPress={onPress}
          disabled={disabled}
          className="bg-brand-500 active:bg-brand-600 rounded-2xl py-4 items-center justify-center min-h-[56px]">
          {disabled ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">{cta}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
