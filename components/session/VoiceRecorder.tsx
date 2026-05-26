import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Mic, Square, Trash2, Play, Pause } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { APP_CONFIG } from '@/constants/config';
import { createLogger } from '@/lib/logger';

const log = createLogger('VoiceRecorder');

interface VoiceRecorderProps {
  uri: string | null;
  durationSec: number | null;
  sessionId: string;
  onChange: (value: { uri: string; durationSec: number } | null) => void;
}

export function VoiceRecorder({ uri, durationSec, sessionId, onChange }: VoiceRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackRef = useRef<Audio.Sound | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
      if (playbackRef.current) {
        playbackRef.current.unloadAsync().catch(() => {});
      }
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [recording]);

  async function startRecording() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
      setElapsed(0);
      tickRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= APP_CONFIG.maxVoiceNoteSeconds) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      log.error('startRecording failed', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    try {
      await recording.stopAndUnloadAsync();
      const tmpUri = recording.getURI();
      if (!tmpUri) {
        log.warn('Recording produced no URI');
        return;
      }
      const targetDir = `${FileSystem.documentDirectory}sessions/${sessionId}/`;
      await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
      const ext = tmpUri.split('.').pop() ?? 'm4a';
      const targetUri = `${targetDir}voice.${ext}`;
      await FileSystem.moveAsync({ from: tmpUri, to: targetUri });
      onChange({ uri: targetUri, durationSec: elapsed });
    } catch (err) {
      log.error('stopRecording failed', err);
    } finally {
      setRecording(null);
    }
  }

  async function togglePlay() {
    if (!uri) return;
    try {
      if (!playbackRef.current) {
        const { sound } = await Audio.Sound.createAsync({ uri });
        playbackRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            setIsPlaying(false);
            sound.setPositionAsync(0).catch(() => {});
          }
        });
      }
      if (isPlaying) {
        await playbackRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await playbackRef.current.replayAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      log.error('togglePlay failed', err);
    }
  }

  async function clear() {
    if (playbackRef.current) {
      await playbackRef.current.unloadAsync().catch(() => {});
      playbackRef.current = null;
      setIsPlaying(false);
    }
    onChange(null);
  }

  if (recording) {
    return (
      <View className="bg-danger/10 rounded-2xl px-4 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-3 h-3 rounded-full bg-danger" />
          <Text className="text-base font-semibold text-danger">Recording... {elapsed}s</Text>
        </View>
        <Pressable
          onPress={stopRecording}
          className="bg-danger rounded-full px-4 py-2 flex-row items-center gap-2">
          <Square color="#FFFFFF" size={16} fill="#FFFFFF" />
          <Text className="text-white font-semibold">Stop</Text>
        </Pressable>
      </View>
    );
  }

  if (uri) {
    return (
      <View className="bg-brand-50 dark:bg-brand-800 rounded-2xl px-4 py-3 flex-row items-center justify-between">
        <Pressable onPress={togglePlay} className="flex-row items-center gap-3 flex-1">
          <View className="w-10 h-10 rounded-full bg-brand-500 items-center justify-center">
            {isPlaying ? <Pause color="#FFFFFF" size={20} fill="#FFFFFF" /> : <Play color="#FFFFFF" size={20} fill="#FFFFFF" />}
          </View>
          <Text className="text-base font-medium text-brand-700 dark:text-brand-100">
            Voice note · {durationSec ?? 0}s
          </Text>
        </Pressable>
        <Pressable onPress={clear} className="p-2">
          <Trash2 color="#FF6B58" size={20} />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={startRecording}
      className="border-2 border-dashed border-brand-200 dark:border-brand-700 rounded-2xl py-6 items-center justify-center bg-brand-50/50 dark:bg-brand-900 flex-row gap-3">
      <Mic color="#FFC542" size={24} />
      <Text className="text-base text-brand-600 dark:text-brand-200 font-medium">
        Tap to record voice note
      </Text>
    </Pressable>
  );
}
