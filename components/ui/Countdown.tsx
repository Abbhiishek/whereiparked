import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Midnight } from '@/constants/design';

interface CountdownProps {
  remainingSec: number;
  totalSec: number;
  mode?: 'digits' | 'ring' | 'clock';
}

/**
 * Big countdown display in three flavors (matches design tweaks panel):
 *   - digits: huge HH:MM with seconds tick
 *   - ring: 168px progress ring with HH:MM in the center
 *   - clock: time-of-day expiry (e.g. 4:32 pm)
 */
export function Countdown({ remainingSec, totalSec, mode = 'digits' }: CountdownProps) {
  const hours = Math.max(0, Math.floor(remainingSec / 3600));
  const mins = Math.max(0, Math.floor((remainingSec % 3600) / 60));
  const secs = Math.max(0, Math.floor(remainingSec % 60));
  const pct = totalSec > 0 ? Math.max(0, Math.min(1, remainingSec / totalSec)) : 0;
  const isUrgent = remainingSec < 600;
  const isWarn = remainingSec < 1800 && !isUrgent;
  const color = isUrgent ? Midnight.urgent : isWarn ? Midnight.accent : Midnight.safe;

  const HHMM = `${hours}:${String(mins).padStart(2, '0')}`;
  const SS = String(secs).padStart(2, '0');

  if (mode === 'ring') {
    const R = 64;
    const C = 2 * Math.PI * R;
    return (
      <View
        style={{
          width: 168,
          height: 168,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Svg width={168} height={168} style={{ position: 'absolute' }}>
          <Circle
            cx={84}
            cy={84}
            r={R}
            stroke={Midnight.surface3}
            strokeWidth={10}
            fill="none"
          />
          <Circle
            cx={84}
            cy={84}
            r={R}
            stroke={color}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${C} ${C}`}
            strokeDashoffset={C * (1 - pct)}
            transform={`rotate(-90 84 84)`}
          />
        </Svg>
        <Text
          style={{
            fontWeight: '700',
            fontSize: 42,
            color: Midnight.text,
            letterSpacing: -1,
          }}>
          {HHMM}
        </Text>
        <Text
          style={{
            fontSize: 11,
            fontWeight: '500',
            color: Midnight.textMute,
            marginTop: 6,
            letterSpacing: 1.4,
          }}>
          {hours > 0 ? 'H : M' : `M : S — ${SS}`}
        </Text>
      </View>
    );
  }

  if (mode === 'clock') {
    const now = new Date();
    const exp = new Date(now.getTime() + remainingSec * 1000);
    let h = exp.getHours();
    const m = exp.getMinutes();
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    if (h === 0) h = 12;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <Text
          style={{
            fontWeight: '700',
            fontSize: 72,
            color: Midnight.text,
            letterSpacing: -3,
            lineHeight: 72,
          }}>
          {h}:{String(m).padStart(2, '0')}
        </Text>
        <Text
          style={{
            fontWeight: '500',
            fontSize: 22,
            color,
            marginLeft: 6,
            marginBottom: 6,
          }}>
          {ampm}
        </Text>
      </View>
    );
  }

  // digits (default)
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      <Text
        style={{
          fontWeight: '700',
          fontSize: 76,
          color: Midnight.text,
          letterSpacing: -3.5,
          lineHeight: 76,
        }}>
        {HHMM}
      </Text>
      <Text
        style={{
          fontSize: 22,
          color,
          fontWeight: '600',
          marginLeft: 6,
          marginBottom: 8,
        }}>
        {SS}″
      </Text>
    </View>
  );
}
