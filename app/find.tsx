import { router } from 'expo-router';
import { Check, ChevronLeft, Navigation, Share2, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { MapIllustration } from '@/components/ui/MapIllustration';
import { Midnight } from '@/constants/design';
import { markSessionEnded } from '@/db/queries/sessions';
import { useActiveSession } from '@/hooks/useActiveSession';
import { useLocation } from '@/hooks/useLocation';
import { successHaptic } from '@/lib/delight';
import { formatDistance, haversineMeters, walkingEtaMinutes } from '@/lib/geo';
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
  const distanceLabel = distanceMeters !== null ? formatDistance(distanceMeters, units) : '—';
  const etaMinutes = distanceMeters !== null ? walkingEtaMinutes(distanceMeters) : 0;

  const arrived = distanceMeters !== null && distanceMeters < 15;
  const headline = session.note?.split('\n')[0]?.slice(0, 48) || `${session.latitude.toFixed(5)}° N`;

  async function endSession() {
    if (!session) return;
    setEnding(true);
    try {
      const ended = await markSessionEnded(session.id);
      if (ended?.reminderNotificationId) {
        await cancelExpirationReminder(ended.reminderNotificationId);
      }
      successHaptic();
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Could not end session', 'Please try again.');
    } finally {
      setEnding(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: Midnight.bg }}>
      {/* Map fills the space behind */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <MapIllustration
          pin={{ x: 220, y: 220 }}
          you={{ x: 110, y: 540 }}
          showPath
          label={null}
        />
      </View>

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Top bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 12,
            paddingTop: 12,
          }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: Midnight.surface,
              borderWidth: 1,
              borderColor: Midnight.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ChevronLeft color={Midnight.text} size={20} />
          </Pressable>

          <View
            style={{
              flex: 1,
              backgroundColor: Midnight.surface,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderWidth: 1,
              borderColor: Midnight.border,
            }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: Midnight.accent + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Navigation color={Midnight.accent} size={20} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: Midnight.text }}>
                Walking to your car
              </Text>
              <Text style={{ fontSize: 12, color: Midnight.textMute }} numberOfLines={1}>
                {headline}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* Bottom panel */}
        <View
          style={{
            backgroundColor: Midnight.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderTopWidth: 1,
            borderTopColor: Midnight.border,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 18,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text
                  style={{
                    fontSize: 56,
                    fontWeight: '700',
                    color: Midnight.text,
                    letterSpacing: -2,
                    lineHeight: 56,
                  }}>
                  {distanceLabel.split(' ')[0] ?? '—'}
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    color: Midnight.textMute,
                    fontWeight: '500',
                    marginLeft: 6,
                    marginBottom: 4,
                  }}>
                  {distanceLabel.split(' ')[1] ?? ''}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: Midnight.textMute,
                  marginTop: 4,
                  letterSpacing: 0.4,
                }}>
                {arrived
                  ? "You've arrived"
                  : etaMinutes > 0
                    ? `~${etaMinutes} min walk`
                    : 'Getting your position…'}
              </Text>
            </View>
          </View>

          {/* Direction strip */}
          <View
            style={{
              backgroundColor: Midnight.surface2,
              borderRadius: 14,
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: Midnight.border,
            }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: Midnight.accent,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ rotate: '30deg' }],
              }}>
              <Navigation color={Midnight.accentInk} size={22} strokeWidth={2.4} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: Midnight.text }}>
                {arrived ? 'Arrive at your car' : 'Head toward the pin'}
              </Text>
              <Text style={{ fontSize: 12, color: Midnight.textMute, marginTop: 2 }}>
                {distanceMeters !== null
                  ? `${formatDistance(distanceMeters, units)} away`
                  : 'Locating…'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button
                label={arrived ? 'I found my car' : 'Share ETA'}
                variant="secondary"
                leadingIcon={
                  arrived ? (
                    <Check color={Midnight.text} size={18} />
                  ) : (
                    <Share2 color={Midnight.text} size={18} />
                  )
                }
                onPress={arrived ? endSession : undefined}
                loading={ending}
              />
            </View>
            <Button
              label="Stop"
              variant="ghost"
              fullWidth={false}
              leadingIcon={<X color={Midnight.text} size={18} />}
              onPress={() => router.back()}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
