import { Audio } from 'expo-av';
import { Pause, Play } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { createLogger } from '@/lib/logger';
import { formatMmSs } from '@/lib/time';

const log = createLogger('VoicePlayer');

interface VoicePlayerProps {
  uri: string;
  durationSec: number | null;
}

export function VoicePlayer({ uri, durationSec }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  async function toggle() {
    try {
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync({ uri });
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            setIsPlaying(false);
            sound.setPositionAsync(0).catch(() => {});
          }
        });
      }
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.replayAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      log.error('toggle playback failed', err);
    }
  }

  return (
    <Pressable
      onPress={toggle}
      className="bg-brand-50 dark:bg-brand-800 rounded-2xl px-4 py-3 flex-row items-center gap-3">
      <View className="w-10 h-10 rounded-full bg-brand-500 items-center justify-center">
        {isPlaying ? (
          <Pause color="#FFFFFF" size={20} fill="#FFFFFF" />
        ) : (
          <Play color="#FFFFFF" size={20} fill="#FFFFFF" />
        )}
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-brand-700 dark:text-brand-100">Voice note</Text>
        {durationSec !== null && durationSec > 0 ? (
          <Text className="text-xs text-ink-muted" style={{ fontVariant: ['tabular-nums'] }}>
            {formatMmSs(durationSec)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
