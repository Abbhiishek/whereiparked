import { type ReactNode, useEffect } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useDelightEnabled } from '@/lib/delight';

interface PulsingPinProps {
  children: ReactNode;
  periodMs?: number;
  maxScale?: number;
}

export function PulsingPin({ children, periodMs = 1800, maxScale = 1.06 }: PulsingPinProps) {
  const delight = useDelightEnabled();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!delight) {
      scale.value = 1;
      return;
    }
    scale.value = withRepeat(
      withTiming(maxScale, { duration: periodMs / 2, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(scale);
  }, [delight, maxScale, periodMs, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
