import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

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

const variantClasses: Record<Variant, { container: string; label: string }> = {
  primary: {
    container: 'bg-brand-500 active:bg-brand-600',
    label: 'text-white font-semibold',
  },
  secondary: {
    container: 'bg-brand-50 dark:bg-brand-800 active:bg-brand-100',
    label: 'text-brand-700 dark:text-brand-100 font-semibold',
  },
  ghost: {
    container: 'bg-transparent active:bg-brand-50 dark:active:bg-brand-800',
    label: 'text-brand-500 dark:text-brand-300 font-semibold',
  },
  danger: {
    container: 'bg-danger active:opacity-80',
    label: 'text-white font-semibold',
  },
};

const sizeClasses: Record<Size, { container: string; label: string }> = {
  sm: { container: 'py-2 px-3 rounded-xl min-h-[36px]', label: 'text-sm' },
  md: { container: 'py-3 px-4 rounded-2xl min-h-[48px]', label: 'text-base' },
  lg: { container: 'py-4 px-5 rounded-2xl min-h-[56px]', label: 'text-base' },
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
  const v = variantClasses[variant];
  const s = sizeClasses[size];
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || loading ? 'opacity-50' : '';
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
      style={[animatedStyle, style]}
      className={`${v.container} ${s.container} ${widthClass} ${disabledClass} flex-row items-center justify-center gap-2`}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#0E7C66' : '#FFFFFF'} />
      ) : (
        <>
          {leadingIcon ? <View>{leadingIcon}</View> : null}
          <Text className={`${v.label} ${s.label}`}>{label}</Text>
          {trailingIcon ? <View>{trailingIcon}</View> : null}
        </>
      )}
    </AnimatedPressable>
  );
}
