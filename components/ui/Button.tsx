import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Midnight } from '@/constants/design';
import { pressHaptic, SPRING_SNAPPY, useDelightEnabled } from '@/lib/delight';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  haptic?: boolean;
}

const variantStyle: Record<Variant, { bg: string; fg: string }> = {
  primary: { bg: Midnight.accent, fg: Midnight.accentInk },
  secondary: { bg: Midnight.surface3, fg: Midnight.text },
  ghost: { bg: 'transparent', fg: Midnight.text },
  danger: { bg: 'transparent', fg: Midnight.urgent },
};

const sizeStyle: Record<
  Size,
  { h: number; padH: number; fs: number; radius: number }
> = {
  sm: { h: 36, padH: 14, fs: 13, radius: 12 },
  md: { h: 52, padH: 18, fs: 15, radius: 14 },
  lg: { h: 56, padH: 20, fs: 16, radius: 16 },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading,
  leadingIcon,
  trailingIcon,
  fullWidth = true,
  disabled,
  haptic,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: ButtonProps) {
  const v = variantStyle[variant];
  const s = sizeStyle[size];
  const delight = useDelightEnabled();
  const scale = useSharedValue(1);
  const hapticDefault = variant === 'primary' || variant === 'danger';
  const enableHaptic = haptic ?? hapticDefault;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled || loading}
      accessibilityRole="button"
      onPressIn={(ev) => {
        if (!(disabled || loading)) {
          if (delight) scale.value = withSpring(0.96, SPRING_SNAPPY);
          if (enableHaptic) pressHaptic();
        }
        onPressIn?.(ev);
      }}
      onPressOut={(ev) => {
        if (delight) scale.value = withSpring(1, SPRING_SNAPPY);
        onPressOut?.(ev);
      }}
      style={[
        animatedStyle,
        {
          height: s.h,
          paddingHorizontal: s.padH,
          borderRadius: s.radius,
          backgroundColor: v.bg,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled || loading ? 0.5 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {leadingIcon ? <View>{leadingIcon}</View> : null}
          <Text
            style={{
              color: v.fg,
              fontSize: s.fs,
              fontWeight: '600',
              letterSpacing: 0.1,
            }}>
            {label}
          </Text>
          {trailingIcon ? <View>{trailingIcon}</View> : null}
        </>
      )}
    </AnimatedPressable>
  );
}
