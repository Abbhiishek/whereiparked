import * as Haptics from 'expo-haptics';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useSettingsStore } from '@/stores/settingsStore';

export const SPRING_SNAPPY = { damping: 18, stiffness: 320, mass: 0.6 } as const;
export const SPRING_GENTLE = { damping: 22, stiffness: 140, mass: 0.9 } as const;

export function useDelightEnabled(): boolean {
  const enabled = useSettingsStore((s) => s.delightEnabled);
  const reduceMotion = useReduceMotion();
  return enabled && !reduceMotion;
}

export function useHapticsEnabled(): boolean {
  return useSettingsStore((s) => s.delightEnabled);
}

function isDelightEnabledSync(): boolean {
  return useSettingsStore.getState().delightEnabled;
}

export function pressHaptic(): void {
  if (!isDelightEnabledSync()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function successHaptic(): void {
  if (!isDelightEnabledSync()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function warningHaptic(): void {
  if (!isDelightEnabledSync()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
