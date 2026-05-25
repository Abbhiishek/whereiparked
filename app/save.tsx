import { router } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { nanoid } from 'nanoid/non-secure';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExpirationPicker } from '@/components/session/ExpirationPicker';
import { NoteField } from '@/components/session/NoteField';
import { PhotoCapture } from '@/components/session/PhotoCapture';
import { VoiceRecorder } from '@/components/session/VoiceRecorder';
import { Button } from '@/components/ui/Button';
import { LocationLockIndicator } from '@/components/ui/LocationLockIndicator';
import { insertSession, updateSession } from '@/db/queries/sessions';
import { useLocation } from '@/hooks/useLocation';
import { successHaptic } from '@/lib/delight';
import { formatCoords } from '@/lib/geo';
import { createLogger } from '@/lib/logger';
import { scheduleExpirationReminder } from '@/services/notifications/scheduler';
import { useSettingsStore } from '@/stores/settingsStore';

const log = createLogger('save');

export default function SaveScreen() {
  const sessionIdRef = useState(() => nanoid())[0];
  const { coords, isCapturing, error: locationError } = useLocation(true);
  const defaultReminder = useSettingsStore((s) => s.defaultReminderMinutes);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [voice, setVoice] = useState<{ uri: string; durationSec: number } | null>(null);
  const [note, setNote] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(defaultReminder);
  const [saving, setSaving] = useState(false);

  const expiresAt = useMemo(() => {
    if (!reminderMinutes) return null;
    return new Date(Date.now() + reminderMinutes * 60 * 1000);
  }, [reminderMinutes]);

  async function handleSave() {
    if (!coords) {
      Alert.alert('Waiting for location', 'Hold on a second while we lock onto GPS.');
      return;
    }
    setSaving(true);
    try {
      const now = new Date();
      const session = await insertSession({
        id: sessionIdRef,
        parkedAt: now,
        expiresAt,
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracyM: coords.accuracy ?? null,
        note: note.trim() || null,
        photoLocalUri: photoUri,
        voiceLocalUri: voice?.uri ?? null,
        voiceDurationSec: voice?.durationSec ?? null,
        clientUpdatedAt: now,
      });

      if (expiresAt) {
        const reminderId = await scheduleExpirationReminder({
          sessionId: session.id,
          expiresAt,
          leadMinutes: 5,
        });
        if (reminderId) {
          await updateSession(session.id, { reminderNotificationId: reminderId });
        }
      }

      successHaptic();
      router.replace('/(tabs)');
    } catch (err) {
      log.error('Save failed', err);
      Alert.alert('Could not save', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-white dark:bg-surface-dark">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}>
        <View className="bg-brand-50 dark:bg-brand-800 rounded-2xl p-4 flex-row items-start gap-3">
          <MapPin color="#0E7C66" size={24} />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-brand-700 dark:text-brand-100">
              {isCapturing && !coords ? 'Getting location...' : 'Location captured'}
            </Text>
            <Text className="text-xs text-ink-muted mt-0.5">
              {coords
                ? `${formatCoords(coords)}${coords.accuracy ? ` · ±${Math.round(coords.accuracy)}m` : ''}`
                : locationError ?? 'Hold on a moment...'}
            </Text>
          </View>
          {isCapturing && !coords ? <LocationLockIndicator /> : null}
        </View>

        <PhotoCapture uri={photoUri} onChange={setPhotoUri} />
        <VoiceRecorder
          uri={voice?.uri ?? null}
          durationSec={voice?.durationSec ?? null}
          sessionId={sessionIdRef}
          onChange={setVoice}
        />
        <NoteField value={note} onChange={setNote} />
        <ExpirationPicker selectedMinutes={reminderMinutes} onChange={setReminderMinutes} />

        <Button
          label={saving ? 'Saving...' : 'Save parking spot'}
          onPress={handleSave}
          loading={saving}
          disabled={!coords}
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
