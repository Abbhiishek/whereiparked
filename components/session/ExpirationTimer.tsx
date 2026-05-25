import { Clock, Plus } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useDelightEnabled } from '@/lib/delight';
import { formatCountdown } from '@/lib/time';

interface ExpirationTimerProps {
  expiresAt: Date | null;
  onPress?: () => void;
  compact?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ExpirationTimer({ expiresAt, onPress, compact }: ExpirationTimerProps) {
  const [now, setNow] = useState(() => Date.now());
  const delight = useDelightEnabled();
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const wasExpiredRef = useRef(false);

  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const remainingMs = expiresAt ? expiresAt.getTime() - now : 0;
  const isExpired = !!expiresAt && remainingMs <= 0;
  const isWarning = !!expiresAt && remainingMs > 0 && remainingMs < 5 * 60 * 1000;

  useEffect(() => {
    if (!delight) {
      opacity.value = 1;
      return;
    }
    if (isWarning) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 700, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(opacity);
      opacity.value = withTiming(1, { duration: 200 });
    }
    return () => cancelAnimation(opacity);
  }, [delight, isWarning, opacity]);

  useEffect(() => {
    if (!delight) return;
    if (isExpired && !wasExpiredRef.current) {
      translateX.value = withSequence(
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(-2, { duration: 50 }),
        withTiming(2, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
    wasExpiredRef.current = isExpired;
  }, [delight, isExpired, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  if (!expiresAt) {
    return (
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-2 px-3 py-2 rounded-full border border-dashed border-brand-300">
        <Plus color="#0E7C66" size={16} />
        <Text className="text-sm text-brand-500 font-medium">Set timer</Text>
      </Pressable>
    );
  }

  const containerClass = isExpired
    ? 'bg-danger/10 border-danger'
    : isWarning
      ? 'bg-accent/10 border-accent'
      : 'bg-brand-50 dark:bg-brand-800 border-brand-200 dark:border-brand-700';
  const textClass = isExpired ? 'text-danger' : isWarning ? 'text-accent-dark' : 'text-brand-700 dark:text-brand-100';

  return (
    <AnimatedPressable
      onPress={onPress}
      style={animatedStyle}
      className={`flex-row items-center gap-2 px-3 py-2 rounded-full border ${containerClass}`}>
      <Clock color={isExpired ? '#D14343' : isWarning ? '#CC8C19' : '#0E7C66'} size={16} />
      <Text className={`text-sm font-semibold ${textClass}`}>
        {compact ? formatCountdown(remainingMs) : `Expires in ${formatCountdown(remainingMs)}`}
      </Text>
    </AnimatedPressable>
  );
}
