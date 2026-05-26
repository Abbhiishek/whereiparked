import { router } from 'expo-router';
import { Check, ChevronLeft, ChevronRight, Home, MapPin, RefreshCw, X } from 'lucide-react-native';
import { nanoid } from 'nanoid/non-secure';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhotoCapture } from '@/components/session/PhotoCapture';
import { VoiceRecorder } from '@/components/session/VoiceRecorder';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MapIllustration } from '@/components/ui/MapIllustration';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Midnight } from '@/constants/design';
import { APP_CONFIG } from '@/constants/config';
import { insertSession, updateSession } from '@/db/queries/sessions';
import { useLocation } from '@/hooks/useLocation';
import { successHaptic } from '@/lib/delight';
import { formatCoords } from '@/lib/geo';
import { createLogger } from '@/lib/logger';
import { scheduleExpirationReminder } from '@/services/notifications/scheduler';
import { useSettingsStore } from '@/stores/settingsStore';

const log = createLogger('save');

const STEPS = ['Location', 'Capture', 'Expiry'] as const;
const DURATION_PRESETS = [30, 60, 120, 240, 480];
const REMINDER_PRESETS = [5, 15, 30, 60];

export default function SaveScreen() {
  const sessionId = useState(() => nanoid())[0];
  const { coords, isCapturing, error: locationError } = useLocation(true);
  const defaultReminder = useSettingsStore((s) => s.defaultReminderMinutes);

  const [step, setStep] = useState(0);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [voice, setVoice] = useState<{ uri: string; durationSec: number } | null>(null);
  const [note, setNote] = useState('');
  const [durationMin, setDurationMin] = useState(120);
  const [reminderMin, setReminderMin] = useState<number>(defaultReminder);
  const [autoExtend, setAutoExtend] = useState(false);
  const [saving, setSaving] = useState(false);

  const expiresAt = useMemo(() => new Date(Date.now() + durationMin * 60_000), [durationMin]);

  async function handleSave() {
    if (!coords) {
      Alert.alert('Waiting for location', 'Hold on a second while we lock onto GPS.');
      return;
    }
    setSaving(true);
    try {
      const now = new Date();
      const session = await insertSession({
        id: sessionId,
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

      const reminderId = await scheduleExpirationReminder({
        sessionId: session.id,
        expiresAt,
        leadMinutes: reminderMin,
      });
      if (reminderId) {
        await updateSession(session.id, { reminderNotificationId: reminderId });
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

  const titles = [
    'Confirm where you parked',
    'Help future you find it',
    "Set how long you're staying",
  ];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: Midnight.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingTop: 12,
          paddingBottom: 14,
        }}>
        <Pressable
          onPress={() => (step > 0 ? setStep((s) => s - 1) : router.back())}
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            backgroundColor: Midnight.surface2,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {step > 0 ? (
            <ChevronLeft color={Midnight.text} size={20} />
          ) : (
            <X color={Midnight.text} size={20} />
          )}
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 6 }}>
          {STEPS.map((s, i) => (
            <View
              key={s}
              style={{
                width: i === step ? 24 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i <= step ? Midnight.accent : Midnight.surface3,
              }}
            />
          ))}
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled">
        <Text
          style={{
            fontSize: 11,
            fontWeight: '600',
            color: Midnight.textMute,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}>
          Step {step + 1} of {STEPS.length}
        </Text>
        <Text
          style={{
            fontSize: 30,
            fontWeight: '700',
            color: Midnight.text,
            letterSpacing: -0.7,
            marginBottom: 22,
            lineHeight: 34,
          }}>
          {titles[step]}
        </Text>

        {step === 0 ? (
          <LocationStep
            coords={coords}
            isCapturing={isCapturing}
            error={locationError}
          />
        ) : null}

        {step === 1 ? (
          <CaptureStep
            sessionId={sessionId}
            photoUri={photoUri}
            onPhoto={setPhotoUri}
            voice={voice}
            onVoice={setVoice}
            note={note}
            onNote={setNote}
          />
        ) : null}

        {step === 2 ? (
          <ExpiryStep
            durationMin={durationMin}
            onDuration={setDurationMin}
            reminderMin={reminderMin}
            onReminder={setReminderMin}
            autoExtend={autoExtend}
            onAutoExtend={setAutoExtend}
          />
        ) : null}
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 8,
          borderTopWidth: 1,
          borderTopColor: Midnight.border,
          backgroundColor: Midnight.bg,
        }}>
        {step < STEPS.length - 1 ? (
          <Button
            label="Continue"
            onPress={() => setStep((s) => s + 1)}
            size="lg"
            trailingIcon={<ChevronRight color={Midnight.accentInk} size={20} />}
          />
        ) : (
          <Button
            label={saving ? 'Saving...' : 'Save parking spot'}
            onPress={handleSave}
            loading={saving}
            disabled={!coords}
            size="lg"
            leadingIcon={<Check color={Midnight.accentInk} size={20} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Step 0: Location ────────────────────────────────────────────────
function LocationStep({
  coords,
  isCapturing,
  error,
}: {
  coords: { latitude: number; longitude: number; accuracy: number | null } | null;
  isCapturing: boolean;
  error: string | null;
}) {
  return (
    <View style={{ gap: 16 }}>
      <View
        style={{
          height: 280,
          borderRadius: 22,
          overflow: 'hidden',
          position: 'relative',
        }}>
        <MapIllustration
          label={
            coords?.accuracy
              ? `GPS · ±${Math.round(coords.accuracy)} m`
              : isCapturing
                ? 'Locking on…'
                : 'GPS'
          }
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: -24,
            marginTop: -48,
          }}>
          <MapPin color={Midnight.accent} size={48} strokeWidth={2.5} />
        </View>
      </View>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: Midnight.accent + '20',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MapPin color={Midnight.accent} size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: Midnight.text }}>
              {coords
                ? `${coords.latitude.toFixed(5)}° N`
                : isCapturing
                  ? 'Getting location…'
                  : 'No location yet'}
            </Text>
            <Text style={{ fontSize: 13, color: Midnight.textMute, marginTop: 2 }}>
              {coords
                ? `${coords.longitude.toFixed(5)}° W`
                : (error ?? 'Hold on a moment…')}
            </Text>
            {coords ? (
              <Text
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: Midnight.textDim,
                  marginTop: 6,
                  letterSpacing: 0.3,
                }}>
                {formatCoords(coords)}
              </Text>
            ) : null}
          </View>
        </View>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: Midnight.surface3,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Home color={Midnight.text} size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: Midnight.text }}>
              Garage / multi-level?
            </Text>
            <Text style={{ fontSize: 12, color: Midnight.textMute, marginTop: 2 }}>
              Add details in the next step
            </Text>
          </View>
          <ChevronRight color={Midnight.textMute} size={18} />
        </View>
      </Card>
    </View>
  );
}

// ─── Step 1: Capture ─────────────────────────────────────────────────
function CaptureStep({
  sessionId,
  photoUri,
  onPhoto,
  voice,
  onVoice,
  note,
  onNote,
}: {
  sessionId: string;
  photoUri: string | null;
  onPhoto: (uri: string | null) => void;
  voice: { uri: string; durationSec: number } | null;
  onVoice: (voice: { uri: string; durationSec: number } | null) => void;
  note: string;
  onNote: (value: string) => void;
}) {
  return (
    <View style={{ gap: 22 }}>
      <View>
        <SectionLabel>Photo</SectionLabel>
        <PhotoCapture uri={photoUri} onChange={onPhoto} />
      </View>

      <View>
        <SectionLabel>
          {voice ? 'Voice memo · recorded' : 'Voice memo'}
        </SectionLabel>
        <VoiceRecorder
          uri={voice?.uri ?? null}
          durationSec={voice?.durationSec ?? null}
          sessionId={sessionId}
          onChange={onVoice}
        />
      </View>

      <View>
        <SectionLabel>Quick note</SectionLabel>
        <TextInput
          value={note}
          onChangeText={onNote}
          placeholder="Level 2, near elevator B. Yellow line near pillar #14."
          placeholderTextColor={Midnight.textDim}
          multiline
          maxLength={APP_CONFIG.maxNoteChars}
          style={{
            backgroundColor: Midnight.surface3,
            color: Midnight.text,
            borderWidth: 1,
            borderColor: Midnight.border,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 14,
            lineHeight: 20,
            minHeight: 90,
            textAlignVertical: 'top',
          }}
        />
        <Text
          style={{
            fontSize: 11,
            color: Midnight.textDim,
            textAlign: 'right',
            marginTop: 4,
          }}>
          {note.length}/{APP_CONFIG.maxNoteChars}
        </Text>
      </View>
    </View>
  );
}

// ─── Step 2: Expiry ──────────────────────────────────────────────────
function ExpiryStep({
  durationMin,
  onDuration,
  reminderMin,
  onReminder,
  autoExtend,
  onAutoExtend,
}: {
  durationMin: number;
  onDuration: (m: number) => void;
  reminderMin: number;
  onReminder: (m: number) => void;
  autoExtend: boolean;
  onAutoExtend: (v: boolean) => void;
}) {
  const hours = Math.floor(durationMin / 60);
  const mins = durationMin % 60;
  return (
    <View style={{ gap: 22 }}>
      <View>
        <SectionLabel>How long</SectionLabel>
        <Card pad={20}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
            <Text
              style={{
                fontSize: 56,
                fontWeight: '700',
                color: Midnight.text,
                letterSpacing: -2,
                lineHeight: 56,
              }}>
              {hours}
            </Text>
            <Text
              style={{
                fontSize: 18,
                color: Midnight.textMute,
                fontWeight: '500',
                marginBottom: 6,
              }}>
              h
            </Text>
            <Text
              style={{
                fontSize: 56,
                fontWeight: '700',
                color: Midnight.text,
                letterSpacing: -2,
                lineHeight: 56,
                marginLeft: 10,
              }}>
              {mins}
            </Text>
            <Text
              style={{
                fontSize: 18,
                color: Midnight.textMute,
                fontWeight: '500',
                marginBottom: 6,
              }}>
              m
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
            {DURATION_PRESETS.map((m) => {
              const active = durationMin === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => onDuration(m)}
                  style={{
                    borderWidth: 1,
                    borderColor: active ? Midnight.accent : Midnight.border,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 999,
                    backgroundColor: active ? Midnight.accent : 'transparent',
                  }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: active ? Midnight.accentInk : Midnight.text,
                    }}>
                    {m < 60 ? `${m}m` : `${m / 60}h`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      </View>

      <View>
        <SectionLabel>Remind me before</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {REMINDER_PRESETS.map((m) => {
            const active = reminderMin === m;
            return (
              <Pressable
                key={m}
                onPress={() => onReminder(m)}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: active ? Midnight.accent : Midnight.border,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: active ? Midnight.accent : Midnight.surface2,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: active ? Midnight.accentInk : Midnight.text,
                  }}>
                  {m}m
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={() => onAutoExtend(!autoExtend)}
        style={{
          borderWidth: 1,
          borderColor: Midnight.border,
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 14,
          backgroundColor: Midnight.surface2,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: autoExtend ? Midnight.accent + '25' : Midnight.surface3,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <RefreshCw
            color={autoExtend ? Midnight.accent : Midnight.textMute}
            size={18}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: Midnight.text }}>
            Smart auto-extend
          </Text>
          <Text style={{ fontSize: 12, color: Midnight.textMute, marginTop: 2 }}>
            If you&apos;re &gt;10 min away when timer ends
          </Text>
        </View>
        <View
          style={{
            width: 36,
            height: 22,
            borderRadius: 11,
            padding: 2,
            backgroundColor: autoExtend ? Midnight.accent : Midnight.surface3,
            justifyContent: 'center',
          }}>
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#fff',
              transform: [{ translateX: autoExtend ? 14 : 0 }],
            }}
          />
        </View>
      </Pressable>
    </View>
  );
}
