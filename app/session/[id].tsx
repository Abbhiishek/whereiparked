import { useLocalSearchParams } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VoicePlayer } from '@/components/session/VoicePlayer';
import { Card } from '@/components/ui/Card';
import { getSessionById } from '@/db/queries/sessions';
import type { SessionRow } from '@/db/schema';
import { formatCoords } from '@/lib/geo';
import { relativeFromNow } from '@/lib/time';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<SessionRow | null>(null);

  useEffect(() => {
    if (!id) return;
    getSessionById(id).then(setSession);
  }, [id]);

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark">
        <View className="flex-1 items-center justify-center">
          <Text className="text-ink-muted">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-white dark:bg-surface-dark">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        {session.photoLocalUri ? (
          <Image
            source={{ uri: session.photoLocalUri }}
            className="w-full h-64 rounded-2xl"
            resizeMode="cover"
          />
        ) : null}

        <Card>
          <View className="flex-row items-start gap-3">
            <MapPin color="#FFC542" size={24} />
            <View className="flex-1">
              {session.note ? (
                <Text className="text-base text-ink dark:text-ink-inverse mb-1">
                  {session.note}
                </Text>
              ) : null}
              <Text className="text-sm text-ink-muted">{formatCoords(session)}</Text>
              <Text className="text-xs text-ink-muted mt-1">
                Parked {relativeFromNow(session.parkedAt)}
                {session.endedAt
                  ? ` · Ended ${relativeFromNow(session.endedAt)}`
                  : ' · Still active'}
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
      </ScrollView>
    </SafeAreaView>
  );
}
