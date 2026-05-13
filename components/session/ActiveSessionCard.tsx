import { router } from 'expo-router';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';

import { ExpirationTimer } from '@/components/session/ExpirationTimer';
import { Card } from '@/components/ui/Card';
import { formatCoords } from '@/lib/geo';
import { relativeFromNow } from '@/lib/time';
import type { ActiveSessionView } from '@/types/session';

interface ActiveSessionCardProps {
  session: ActiveSessionView;
}

export function ActiveSessionCard({ session }: ActiveSessionCardProps) {
  return (
    <Pressable onPress={() => router.push('/find')} accessibilityRole="button">
      <Card>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs uppercase tracking-wide text-brand-500 font-bold">
            Currently Parked
          </Text>
          <ChevronRight color="#5C6B66" size={20} />
        </View>

        {session.photoLocalUri ? (
          <Image
            source={{ uri: session.photoLocalUri }}
            className="w-full h-40 rounded-xl mb-3"
            resizeMode="cover"
          />
        ) : null}

        <View className="flex-row items-center gap-2 mb-2">
          <MapPin color="#0E7C66" size={18} />
          <Text className="text-base font-semibold text-ink dark:text-ink-inverse">
            {session.note ?? formatCoords(session)}
          </Text>
        </View>
        <Text className="text-sm text-ink-muted">Parked {relativeFromNow(session.parkedAt)}</Text>

        {session.expiresAt ? (
          <View className="mt-3 flex-row">
            <ExpirationTimer expiresAt={session.expiresAt} compact />
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}
