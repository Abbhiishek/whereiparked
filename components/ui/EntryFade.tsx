import { type ReactNode, useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useDelightEnabled } from '@/lib/delight';

interface EntryFadeProps {
  children: ReactNode;
  delay?: number;
  translateY?: number;
  durationMs?: number;
}

export function EntryFade({
  children,
  delay = 0,
  translateY = 8,
  durationMs = 220,
}: EntryFadeProps) {
  const delight = useDelightEnabled();
  const progress = useSharedValue(delight ? 0 : 1);

  useEffect(() => {
    if (!delight) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: durationMs, easing: Easing.out(Easing.quad) }),
    );
  }, [delight, delay, durationMs, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * translateY }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
