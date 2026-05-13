import { router } from 'expo-router';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';

import type { SessionRow } from '@/db/schema';
import { formatCoords } from '@/lib/geo';
import { relativeFromNow } from '@/lib/time';

interface SessionListItemProps {
  session: SessionRow;
}

export function SessionListItem({ session }: SessionListItemProps) {
  const isActive = session.endedAt === null;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/session/[id]', params: { id: session.id } })}
      className="flex-row items-center gap-3 px-4 py-3 active:bg-brand-50 dark:active:bg-brand-800">
      {session.photoLocalUri ? (
        <Image
          source={{ uri: session.photoLocalUri }}
          className="w-14 h-14 rounded-xl"
          resizeMode="cover"
        />
      ) : (
        <View className="w-14 h-14 rounded-xl bg-brand-50 dark:bg-brand-800 items-center justify-center">
          <MapPin color="#0E7C66" size={24} />
        </View>
      )}
      <View className="flex-1">
        <Text
          className="text-base font-semibold text-ink dark:text-ink-inverse"
          numberOfLines={1}>
          {session.note ?? formatCoords({ latitude: session.latitude, longitude: session.longitude })}
        </Text>
        <Text className="text-xs text-ink-muted mt-0.5">
          {relativeFromNow(session.parkedAt)}
          {isActive ? ' · Active' : ''}
        </Text>
      </View>
      <ChevronRight color="#9AAAA4" size={20} />
    </Pressable>
  );
}
