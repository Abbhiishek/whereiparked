import { router } from 'expo-router';
import { CheckCircle2, MapPin } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExpirationTimer } from '@/components/session/ExpirationTimer';
import { NavigateBackCTA } from '@/components/session/NavigateBackCTA';
import { VoicePlayer } from '@/components/session/VoicePlayer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { markSessionEnded } from '@/db/queries/sessions';
import { useActiveSession } from '@/hooks/useActiveSession';
import { useLocation } from '@/hooks/useLocation';
import { formatCoords, formatDistance, haversineMeters, walkingEtaMinutes } from '@/lib/geo';
import { relativeFromNow } from '@/lib/time';
import { cancelExpirationReminder } from '@/services/notifications/scheduler';
import { useSettingsStore } from '@/stores/settingsStore';

export default function FindScreen() {
  const session = useActiveSession();
  const units = useSettingsStore((s) => s.units);
  const { coords } = useLocation(true);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    if (!session) {
      router.replace('/(tabs)');
    }
  }, [session]);

  if (!session) return null;

  const distanceMeters = coords
    ? haversineMeters(
        { latitude: coords.latitude, longitude: coords.longitude },
        { latitude: session.latitude, longitude: session.longitude },
      )
    : null;
  const distanceLabel = distanceMeters !== null ? formatDistance(distanceMeters, units) : '...';
  const etaMinutes = distanceMeters !== null ? walkingEtaMinutes(distanceMeters) : 0;

  async function endSession() {
    if (!session) return;
    const sessionId = session.id;
    setEnding(true);
    try {
      const ended = await markSessionEnded(sessionId);
      if (ended?.reminderNotificationId) {
        await cancelExpirationReminder(ended.reminderNotificationId);
      }
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Could not end session', 'Please try again.');
    } finally {
      setEnding(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-white dark:bg-surface-dark">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}>
        {session.photoLocalUri ? (
          <Image
            source={{ uri: session.photoLocalUri }}
            className="w-full h-72 rounded-2xl"
            resizeMode="cover"
          />
        ) : null}

        <Card>
          <View className="flex-row items-start gap-3">
            <MapPin color="#0E7C66" size={24} />
            <View className="flex-1">
              <Text className="text-base font-semibold text-ink dark:text-ink-inverse mb-1">
                Your parking spot
              </Text>
              {session.note ? (
                <Text className="text-base text-ink dark:text-ink-inverse mb-1">
                  {session.note}
                </Text>
              ) : null}
              <Text className="text-sm text-ink-muted">{formatCoords(session)}</Text>
              {session.accuracyM ? (
                <Text className="text-xs text-ink-muted mt-1">
                  ±{Math.round(session.accuracyM)}m accuracy
                </Text>
              ) : null}
              <Text className="text-sm text-ink-muted mt-1">
                Parked {relativeFromNow(session.parkedAt)}
              </Text>
            </View>
          </View>
        </Card>

        {session.voiceLocalUri ? (
          <VoicePlayer
            uri={session.voiceLocalUri}
            durationSec={session.voiceDurationSec ?? null}
          />
        ) : null}

        {session.expiresAt ? (
          <View className="self-start">
            <ExpirationTimer expiresAt={session.expiresAt} />
          </View>
        ) : null}

        <NavigateBackCTA
          target={{ latitude: session.latitude, longitude: session.longitude }}
          distanceLabel={distanceLabel}
          etaMinutes={etaMinutes}
        />

        <Button
          label={ending ? 'Ending session...' : 'I found my car'}
          variant="secondary"
          size="lg"
          loading={ending}
          onPress={endSession}
          leadingIcon={<CheckCircle2 color="#0E7C66" size={20} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
