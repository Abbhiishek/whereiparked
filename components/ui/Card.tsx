import type { ReactNode } from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';

import { Midnight } from '@/constants/design';

interface CardProps extends ViewProps {
  children: ReactNode;
  pad?: number;
  tone?: 'surface' | 'surface2' | 'surface3';
  className?: string;
  style?: ViewStyle | ViewStyle[];
}

const toneColor = {
  surface: Midnight.surface,
  surface2: Midnight.surface2,
  surface3: Midnight.surface3,
};

export function Card({
  children,
  pad = 16,
  tone = 'surface2',
  className = '',
  style,
  ...rest
}: CardProps) {
  return (
    <View
      {...rest}
      className={className}
      style={[
        {
          backgroundColor: toneColor[tone],
          borderRadius: 18,
          padding: pad,
          borderWidth: 1,
          borderColor: Midnight.border,
        },
        style as ViewStyle,
      ]}>
      {children}
    </View>
  );
}
