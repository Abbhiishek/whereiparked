import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Midnight } from '@/constants/design';

interface SectionLabelProps {
  children: ReactNode;
  action?: ReactNode;
}

/** Eyebrow heading used inside cards and bottom sheets. */
export function SectionLabel({ children, action }: SectionLabelProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: Midnight.textMute,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
        }}>
        {children}
      </Text>
      {action}
    </View>
  );
}
