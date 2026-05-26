import { Text, View, type ViewStyle } from 'react-native';

import { Midnight } from '@/constants/design';

interface PhotoSlotProps {
  label?: string;
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

/**
 * Striped placeholder used in lieu of a real photo while designing flows
 * (or when a session was saved without one).
 */
export function PhotoSlot({
  label = 'photo',
  width = '100%',
  height = 120,
  radius = 14,
  style,
}: PhotoSlotProps) {
  return (
    <View
      style={[
        {
          width: width as number,
          height,
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: Midnight.surface3,
          borderWidth: 1,
          borderColor: Midnight.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}>
      <Text
        style={{
          fontSize: 10,
          color: Midnight.textMute,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}>
        {label}
      </Text>
    </View>
  );
}
