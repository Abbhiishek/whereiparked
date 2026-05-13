import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: ReactNode;
}

export function Card({ children, className = '', ...rest }: CardProps & { className?: string }) {
  return (
    <View
      {...rest}
      className={`bg-white dark:bg-brand-800 rounded-2xl p-4 border border-gray-100 dark:border-brand-700 ${className}`}>
      {children}
    </View>
  );
}
