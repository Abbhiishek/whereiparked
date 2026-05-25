import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useDelightEnabled } from '@/lib/delight';

const DOT_SIZE = 6;
const GAP = 4;
const COLOR = '#0E7C66';

interface LocationLockIndicatorProps {
  size?: number;
}

export function LocationLockIndicator({ size = DOT_SIZE }: LocationLockIndicatorProps) {
  const delight = useDelightEnabled();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: GAP }}>
      <Dot size={size} delayMs={0} animated={delight} />
      <Dot size={size} delayMs={150} animated={delight} />
      <Dot size={size} delayMs={300} animated={delight} />
    </View>
  );
}

function Dot({ size, delayMs, animated }: { size: number; delayMs: number; animated: boolean }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    if (!animated) {
      opacity.value = 0.6;
      return;
    }
    opacity.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 350, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.3, { duration: 550, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(opacity);
  }, [animated, delayMs, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={COLOR} />
      </Svg>
    </Animated.View>
  );
}
