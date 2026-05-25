import { forwardRef } from 'react';
import { Pressable, type PressableProps, type View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { pressHaptic, SPRING_SNAPPY, useDelightEnabled } from '@/lib/delight';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends PressableProps {
  haptic?: boolean;
  scaleTo?: number;
  className?: string;
}

export const PressableScale = forwardRef<View, PressableScaleProps>(function PressableScale(
  {
    haptic = true,
    scaleTo = 0.96,
    onPressIn,
    onPressOut,
    disabled,
    children,
    style,
    ...rest
  },
  ref,
) {
  const delight = useDelightEnabled();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      ref={ref}
      {...rest}
      disabled={disabled}
      onPressIn={(ev) => {
        if (!disabled) {
          if (delight) {
            scale.value = withSpring(scaleTo, SPRING_SNAPPY);
          }
          if (haptic) pressHaptic();
        }
        onPressIn?.(ev);
      }}
      onPressOut={(ev) => {
        if (delight) {
          scale.value = withSpring(1, SPRING_SNAPPY);
        }
        onPressOut?.(ev);
      }}
      style={[animatedStyle, style]}>
      {children}
    </AnimatedPressable>
  );
});
