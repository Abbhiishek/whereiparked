import { router } from 'expo-router';
import { ChevronRight, Clock } from 'lucide-react-native';
import { useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';

import { EntryFade } from '@/components/ui/EntryFade';
import { PulsingPin } from '@/components/ui/PulsingPin';
import { Midnight } from '@/constants/design';
import { useRecentSessions } from '@/hooks/useRecentSessions';
import { formatDistance } from '@/lib/geo';
import { relativeFromNow } from '@/lib/time';
import type { Session } from '@/types/session';

export default function HistoryScreen() {
  const sessions = useRecentSessions();

  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const totalMs = sessions.reduce((acc, s) => {
      const end = s.endedAt?.getTime() ?? s.expiresAt?.getTime() ?? s.parkedAt.getTime();
      return acc + Math.max(0, end - s.parkedAt.getTime());
    }, 0);
    const totalHours = Math.round(totalMs / 3_600_000);
    return [
      { value: String(totalSessions), label: 'sessions' },
      { value: `${totalHours}h`, label: 'parked' },
      { value: '—', label: 'meter spent' },
    ];
  }, [sessions]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Midnight.bg }}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={
          <View>
            <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14 }}>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: '700',
                  color: Midnight.text,
                  letterSpacing: -0.7,
                  marginBottom: 4,
                }}>
                Past parks
              </Text>
              <Text style={{ fontSize: 13, color: Midnight.textMute }}>
                {sessions.length} spots · last 30 days
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                paddingHorizontal: 16,
                paddingBottom: 18,
              }}>
              {stats.map((s, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                    backgroundColor: Midnight.surface2,
                    borderWidth: 1,
                    borderColor: Midnight.border,
                  }}>
                  <Text
                    style={{
                      fontSize: 26,
                      fontWeight: '700',
                      color: Midnight.text,
                      letterSpacing: -0.5,
                    }}>
                    {s.value}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: Midnight.textMute,
                      marginTop: 6,
                      letterSpacing: 0.4,
                      textTransform: 'uppercase',
                    }}>
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        }
        renderItem={({ item, index }) => <HistoryRow session={item} index={index} />}
        ListEmptyComponent={
          <EntryFade>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 96,
                paddingHorizontal: 24,
              }}>
              <PulsingPin periodMs={2600} maxScale={1.08}>
                <Clock color={Midnight.textMute} size={48} />
              </PulsingPin>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: Midnight.text,
                  marginTop: 12,
                }}>
                No parking spots yet
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: Midnight.textMute,
                  textAlign: 'center',
                  marginTop: 4,
                }}>
                Tap &ldquo;Mark this spot&rdquo; on the home tab the next time you park.
              </Text>
            </View>
          </EntryFade>
        }
      />
    </SafeAreaView>
  );
}

function HistoryRow({ session, index }: { session: Session; index: number }) {
  const duration = (() => {
    const end =
      session.endedAt?.getTime() ?? session.expiresAt?.getTime() ?? Date.now();
    const ms = Math.max(0, end - session.parkedAt.getTime());
    const hours = Math.floor(ms / 3_600_000);
    const mins = Math.floor((ms % 3_600_000) / 60_000);
    if (hours > 0) return `${hours}h ${String(mins).padStart(2, '0')}m`;
    return `${mins}m`;
  })();

  const accuracy =
    typeof session.accuracyM === 'number'
      ? `±${formatDistance(session.accuracyM)}`
      : null;
  const title =
    session.note?.split('\n')[0]?.slice(0, 48) ||
    `${session.latitude.toFixed(5)}, ${session.longitude.toFixed(5)}`;

  return (
    <Pressable
      onPress={() => router.push(`/session/${session.id}` as never)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 10,
        marginHorizontal: 16,
        borderRadius: 16,
        backgroundColor: Midnight.surface2,
        borderWidth: 1,
        borderColor: Midnight.border,
      }}>
      <MiniMapThumb index={index} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 14, fontWeight: '500', color: Midnight.text }}>
          {title}
        </Text>
        <Text style={{ fontSize: 12, color: Midnight.textMute, marginTop: 2 }}>
          {relativeFromNow(session.parkedAt)} · {duration}
        </Text>
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
          {accuracy ? <Tag>{accuracy}</Tag> : null}
          {session.photoLocalUri ? <Tag>photo</Tag> : null}
          {session.voiceLocalUri ? <Tag>voice</Tag> : null}
        </View>
      </View>
      <ChevronRight color={Midnight.textDim} size={18} />
    </Pressable>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
        backgroundColor: Midnight.surface3,
      }}>
      <Text
        style={{
          fontSize: 10,
          fontWeight: '500',
          color: Midnight.textMute,
          letterSpacing: 0.3,
        }}>
        {children}
      </Text>
    </View>
  );
}

function MiniMapThumb({ index }: { index: number }) {
  // A deterministic vector thumbnail so each list row looks distinct without
  // needing real tiles.
  return (
    <View
      style={{
        width: 72,
        height: 72,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: Midnight.mapBg,
      }}>
      <Svg viewBox="0 0 80 80" width={72} height={72}>
        <Rect width={80} height={80} fill={Midnight.mapBg} />
        <Line x1={-5} y1={20} x2={85} y2={40} stroke={Midnight.mapRoad} strokeWidth={6} />
        <Line x1={-5} y1={55} x2={85} y2={70} stroke={Midnight.mapRoad} strokeWidth={5} />
        <Line
          x1={20 + ((index * 7) % 40)}
          y1={-5}
          x2={20 + ((index * 7) % 40)}
          y2={85}
          stroke={Midnight.mapRoadHi}
          strokeWidth={4}
        />
        <Circle
          cx={36 + ((index * 5) % 14)}
          cy={30 + ((index * 3) % 14)}
          r={9}
          fill={Midnight.accent}
        />
        <SvgText
          x={36 + ((index * 5) % 14)}
          y={33 + ((index * 3) % 14)}
          textAnchor="middle"
          fontWeight="700"
          fontSize={10}
          fill={Midnight.accentInk}>
          P
        </SvgText>
      </Svg>
    </View>
  );
}
