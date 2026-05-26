import { router } from 'expo-router';
import { ChevronDown, List, MapPin, Navigation, Plus, Settings, Target } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

import { Button } from '@/components/ui/Button';
import { Countdown } from '@/components/ui/Countdown';
import { MapIllustration } from '@/components/ui/MapIllustration';
import { PhotoSlot } from '@/components/ui/PhotoSlot';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Midnight } from '@/constants/design';
import { markSessionEnded } from '@/db/queries/sessions';
import { useActiveSession } from '@/hooks/useActiveSession';
import { formatCoords } from '@/lib/geo';
import { relativeFromNow } from '@/lib/time';
import type { ActiveSessionView } from '@/types/session';

export default function HomeScreen() {
  const active = useActiveSession();

  return (
    <View style={{ flex: 1, backgroundColor: Midnight.bg }}>
      {active ? <HomeActive session={active} /> : <HomeEmpty />}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Empty state — no active parking
// ─────────────────────────────────────────────────────────────────────
function HomeEmpty() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          position: 'absolute',
          top: 12,
          right: 14,
          flexDirection: 'row',
          gap: 8,
          zIndex: 2,
        }}>
        <HeaderIconButton icon={<Settings color={Midnight.text} size={20} />} onPress={() => router.push('/(tabs)/settings')} />
      </View>

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 28,
          gap: 28,
        }}>
        <EmptyLogo />
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: Midnight.text,
              letterSpacing: -0.5,
              textAlign: 'center',
            }}>
            Where&apos;s your car?
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: Midnight.textMute,
              textAlign: 'center',
              lineHeight: 22,
              maxWidth: 280,
            }}>
            Drop a pin the moment you park. Photos, notes &amp; timers keep your future self sane.
          </Text>
        </View>
      </View>

      <View style={{ padding: 18, paddingBottom: 24 }}>
        <Button
          label="Mark this spot"
          leadingIcon={<MapPin color={Midnight.accentInk} size={20} />}
          onPress={() => router.push('/save')}
          size="lg"
        />
        <Text
          style={{
            marginTop: 12,
            textAlign: 'center',
            fontSize: 12,
            color: Midnight.textDim,
          }}>
          or open the app within 30 seconds of switching off your engine
        </Text>
      </View>
    </SafeAreaView>
  );
}

function EmptyLogo() {
  return (
    <Svg viewBox="0 0 200 220" width={200} height={220}>
      <Circle cx={100} cy={180} r={62} fill="none" stroke={Midnight.border} strokeWidth={1} />
      <Circle cx={100} cy={180} r={42} fill="none" stroke={Midnight.border} strokeWidth={1} />
      <Circle cx={100} cy={180} r={24} fill="none" stroke={Midnight.border} strokeWidth={1} />
      <G translateX={100} translateY={20}>
        <Path
          d="M 0 160 L -32 80 A 44 44 0 1 1 32 80 Z"
          fill={Midnight.accent}
          stroke={Midnight.accentInk}
          strokeWidth={3}
        />
        <Circle cx={0} cy={50} r={28} fill={Midnight.accentInk} />
        <SvgText x={0} y={62} textAnchor="middle" fontWeight="700" fontSize={38} fill={Midnight.accent}>
          P
        </SvgText>
      </G>
      <G translateX={160} translateY={40} stroke={Midnight.accent} strokeWidth={2} strokeLinecap="round">
        <Path d="M0 -10 V 10" />
        <Path d="M -10 0 H 10" />
      </G>
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Active state — map + bottom sheet
// ─────────────────────────────────────────────────────────────────────
function HomeActive({ session }: { session: ActiveSessionView }) {
  const [tick, setTick] = useState(() => Date.now());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const expiresAtMs = session.expiresAt?.getTime() ?? null;
  const parkedAtMs = session.parkedAt.getTime();
  const totalSec = expiresAtMs ? Math.max(1, Math.floor((expiresAtMs - parkedAtMs) / 1000)) : 0;
  const remainingSec = expiresAtMs ? Math.max(0, Math.floor((expiresAtMs - tick) / 1000)) : 0;
  const isUrgent = remainingSec > 0 && remainingSec < 600;

  return (
    <View style={{ flex: 1, backgroundColor: Midnight.bg }}>
      {/* Map fills the space behind the sheet */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <MapIllustration
          pin={{ x: 200, y: 360 }}
          you={{ x: 110, y: 580 }}
          label={shortAddress(session)}
        />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 8,
            paddingHorizontal: 14,
            paddingTop: 12,
          }}>
          <HeaderIconButton icon={<Target color={Midnight.text} size={20} />} onPress={() => {}} />
          <HeaderIconButton
            icon={<Settings color={Midnight.text} size={20} />}
            onPress={() => router.push('/(tabs)/settings')}
          />
        </View>

        <View style={{ flex: 1 }} />

        <View
          style={{
            paddingHorizontal: 14,
            paddingBottom: 12,
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}>
          <HeaderIconButton
            size={56}
            icon={<Navigation color={Midnight.text} size={24} />}
            onPress={() => router.push('/find')}
          />
        </View>

        <View
          style={{
            backgroundColor: Midnight.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderTopWidth: 1,
            borderColor: Midnight.border,
            paddingHorizontal: 18,
            paddingTop: 14,
            paddingBottom: 18,
          }}>
          <Pressable onPress={() => setExpanded((s) => !s)} hitSlop={12}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: Midnight.textDim,
                alignSelf: 'center',
                marginBottom: 14,
              }}
            />
          </Pressable>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 9,
                  borderRadius: 6,
                  backgroundColor: Midnight.accent,
                }}>
                <Text
                  style={{
                    color: Midnight.accentInk,
                    fontSize: 11,
                    fontWeight: '700',
                    letterSpacing: 1.5,
                  }}>
                  PARKED
                </Text>
              </View>
              <Text style={{ color: Midnight.textMute, fontSize: 13 }}>
                {relativeFromNow(session.parkedAt)}
              </Text>
            </View>
            <Pressable
              onPress={() => setExpanded((s) => !s)}
              hitSlop={8}
              style={{ padding: 4 }}>
              {expanded ? (
                <ChevronDown color={Midnight.textMute} size={20} />
              ) : (
                <List color={Midnight.textMute} size={20} />
              )}
            </Pressable>
          </View>

          {expiresAtMs ? (
            <View style={{ marginBottom: 4 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: Midnight.textMute,
                    letterSpacing: 1.4,
                    textTransform: 'uppercase',
                  }}>
                  Time remaining
                </Text>
                {isUrgent ? (
                  <View
                    style={{
                      paddingVertical: 2,
                      paddingHorizontal: 6,
                      borderRadius: 4,
                      backgroundColor: Midnight.urgent,
                    }}>
                    <Text style={{ color: '#fff', fontSize: 9, letterSpacing: 1, fontWeight: '700' }}>
                      URGENT
                    </Text>
                  </View>
                ) : null}
              </View>
              <Countdown remainingSec={remainingSec} totalSec={totalSec} />
            </View>
          ) : (
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: Midnight.textMute,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
              No expiry set
            </Text>
          )}

          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 14, color: Midnight.text, fontWeight: '500' }}>
              {shortAddress(session)}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: Midnight.textDim,
                marginTop: 4,
                letterSpacing: 0.3,
                fontFamily: 'monospace',
              }}>
              {formatCoords(session)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Find my car"
                variant="primary"
                leadingIcon={<Navigation color={Midnight.accentInk} size={18} />}
                onPress={() => router.push('/find')}
              />
            </View>
            <Button
              label="Extend"
              variant="secondary"
              fullWidth={false}
              leadingIcon={<Plus color={Midnight.text} size={18} />}
            />
          </View>

          {expanded ? (
            <View style={{ marginTop: 22, gap: 18 }}>
              <View>
                <SectionLabel>Photo</SectionLabel>
                <PhotoSlot
                  label={session.photoLocalUri ? 'spot photo' : 'no photo'}
                  height={120}
                />
              </View>

              {session.note ? (
                <View>
                  <SectionLabel>Note</SectionLabel>
                  <View
                    style={{
                      backgroundColor: Midnight.surface3,
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderRadius: 14,
                    }}>
                    <Text style={{ fontSize: 14, color: Midnight.text, lineHeight: 21 }}>
                      {session.note}
                    </Text>
                  </View>
                </View>
              ) : null}

              <Pressable
                onPress={async () => {
                  await markSessionEnded(session.id);
                }}
                style={{
                  alignSelf: 'flex-end',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  padding: 8,
                }}>
                <Text style={{ color: Midnight.urgent, fontSize: 13, fontWeight: '500' }}>
                  End parking
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Bits
// ─────────────────────────────────────────────────────────────────────
function HeaderIconButton({
  icon,
  onPress,
  size = 44,
}: {
  icon: React.ReactNode;
  onPress?: () => void;
  size?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2.5,
        backgroundColor: Midnight.surface,
        borderWidth: 1,
        borderColor: Midnight.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {icon}
    </Pressable>
  );
}

function shortAddress(session: { latitude: number; longitude: number; note: string | null }) {
  if (session.note) {
    const firstLine = session.note.split('\n')[0]?.trim();
    if (firstLine) return firstLine.slice(0, 48);
  }
  return `${session.latitude.toFixed(5)}° N`;
}
