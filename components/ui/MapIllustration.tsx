import { Text, View } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

import { Midnight } from '@/constants/design';

/**
 * Stylized vector map — a bold cartographic illustration in the Midnight
 * palette. Not real geography; a deterministic background used behind the
 * active-parking sheet and the navigate flow.
 *
 * Mirrors `map.jsx` from the design bundle.
 */

interface MapIllustrationProps {
  pin?: { x: number; y: number };
  you?: { x: number; y: number };
  showPath?: boolean;
  rotation?: number;
  label?: string | null;
}

const VB = { w: 412, h: 700 };

const GEOM = {
  avenues: [
    { x1: -40, y1: 120, x2: 460, y2: 260, w: 28 },
    { x1: -40, y1: 360, x2: 460, y2: 480, w: 22 },
    { x1: -40, y1: 560, x2: 460, y2: 680, w: 24 },
  ],
  verticals: [
    { x1: 80, y1: -20, x2: 130, y2: 720, w: 14 },
    { x1: 220, y1: -20, x2: 250, y2: 720, w: 18 },
    { x1: 330, y1: -20, x2: 360, y2: 720, w: 12 },
  ],
  small: [
    { x1: -20, y1: 80, x2: 440, y2: 180, w: 6 },
    { x1: -20, y1: 200, x2: 440, y2: 320, w: 6 },
    { x1: -20, y1: 460, x2: 440, y2: 560, w: 6 },
    { x1: -20, y1: 640, x2: 440, y2: 720, w: 5 },
    { x1: 50, y1: -10, x2: 80, y2: 720, w: 4 },
    { x1: 160, y1: -10, x2: 190, y2: 720, w: 5 },
    { x1: 290, y1: -10, x2: 320, y2: 720, w: 4 },
    { x1: 380, y1: -10, x2: 400, y2: 720, w: 4 },
  ],
  water:
    'M 320 600 Q 360 580 412 600 L 412 700 L 300 700 Q 280 660 320 600 Z',
  park: 'M 40 260 L 150 240 L 180 320 L 100 360 L 30 340 Z',
  buildings: [
    { x: 200, y: 180, w: 40, h: 50 },
    { x: 248, y: 175, w: 32, h: 58 },
    { x: 285, y: 188, w: 36, h: 44 },
    { x: 60, y: 420, w: 40, h: 36 },
    { x: 108, y: 415, w: 28, h: 44 },
    { x: 270, y: 380, w: 50, h: 60 },
    { x: 328, y: 388, w: 30, h: 52 },
  ],
};

export function MapIllustration({
  pin = { x: 200, y: 380 },
  you = { x: 100, y: 600 },
  showPath = false,
  rotation = -8,
  label,
}: MapIllustrationProps) {
  const pathD = (() => {
    const ax = you.x;
    const ay = you.y;
    const bx = pin.x;
    const by = pin.y;
    const pts: [number, number][] = [
      [ax, ay],
      [ax, ay - 60],
      [ax + 60, ay - 60],
      [ax + 60, by + 40],
      [bx, by + 40],
      [bx, by + 6],
    ];
    return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  })();

  return (
    <View
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: Midnight.mapBg,
        overflow: 'hidden',
      }}>
      <Svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={{
          transform: [{ rotate: `${rotation}deg` }],
        }}>
        <Rect x="-50" y="-50" width="520" height="800" fill={Midnight.mapBg} />
        <Path d={GEOM.park} fill={Midnight.mapPark} opacity={0.75} />
        <Path d={GEOM.water} fill={Midnight.mapWater} />

        <G fill={Midnight.mapInk} opacity={0.55}>
          <Rect x={-10} y={-10} width={220} height={190} />
          <Rect x={240} y={-10} width={200} height={200} />
          <Rect x={-10} y={220} width={40} height={200} />
          <Rect x={200} y={240} width={120} height={120} />
          <Rect x={-10} y={480} width={180} height={160} />
          <Rect x={200} y={500} width={220} height={140} />
        </G>

        {GEOM.small.map((r, i) => (
          <Line
            key={`s${i}`}
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
            stroke={Midnight.mapRoad}
            strokeWidth={r.w}
            strokeLinecap="round"
          />
        ))}
        {GEOM.verticals.map((r, i) => (
          <Line
            key={`v${i}`}
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
            stroke={Midnight.mapRoadHi}
            strokeWidth={r.w}
            strokeLinecap="round"
          />
        ))}
        {GEOM.avenues.map((r, i) => (
          <Line
            key={`a${i}`}
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
            stroke={Midnight.mapRoadHi}
            strokeWidth={r.w}
            strokeLinecap="round"
          />
        ))}

        <G>
          {GEOM.buildings.map((b, i) => (
            <Rect
              key={i}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              fill={Midnight.surface2}
              stroke={Midnight.border}
              strokeWidth={0.5}
              rx={2}
            />
          ))}
        </G>

        {showPath ? (
          <Path
            d={pathD}
            fill="none"
            stroke={Midnight.accent}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="0.5 9"
          />
        ) : null}

        <G translateX={you.x} translateY={you.y}>
          <Circle r={18} fill={Midnight.accent} opacity={0.18} />
          <Circle r={7} fill={Midnight.bg} stroke="#3B82F6" strokeWidth={3} />
          <Circle r={3.5} fill="#3B82F6" />
        </G>

        <G translateX={pin.x} translateY={pin.y}>
          <Ellipse cx={0} cy={6} rx={14} ry={3.5} fill="#000" opacity={0.35} />
          <G translateX={0} translateY={-34}>
            <Path
              d="M 0 40 L -10 24 A 14 14 0 1 1 10 24 Z"
              fill={Midnight.accent}
              stroke={Midnight.accentInk}
              strokeWidth={2}
            />
            <Circle cx={0} cy={14} r={9} fill={Midnight.accentInk} />
            <SvgText
              x={0}
              y={18.5}
              textAnchor="middle"
              fontWeight="700"
              fontSize={14}
              fill={Midnight.accent}>
              P
            </SvgText>
          </G>
        </G>
      </Svg>

      {label ? (
        <View
          style={{
            position: 'absolute',
            left: 12,
            top: 12,
            paddingVertical: 7,
            paddingHorizontal: 10,
            borderRadius: 999,
            backgroundColor: Midnight.surface,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            borderWidth: 1,
            borderColor: Midnight.border,
          }}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: Midnight.accent,
            }}
          />
          <Text
            style={{ color: Midnight.text, fontSize: 12, fontWeight: '500' }}>
            {label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
