import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { createLogger } from '@/lib/logger';

const log = createLogger('useLocation');

interface LocationState {
  coords: Location.LocationObjectCoords | null;
  permission: Location.PermissionStatus | null;
  isCapturing: boolean;
  error: string | null;
}

export function useLocation(autoStart = true) {
  const [state, setState] = useState<LocationState>({
    coords: null,
    permission: null,
    isCapturing: false,
    error: null,
  });

  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setState((prev) => ({ ...prev, permission: status }));
    return status;
  }, []);

  const capture = useCallback(async () => {
    setState((prev) => ({ ...prev, isCapturing: true, error: null }));
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const next = await requestPermission();
        if (next !== 'granted') {
          setState((prev) => ({
            ...prev,
            isCapturing: false,
            error: 'Location permission denied',
          }));
          return null;
        }
      }

      const last = await Location.getLastKnownPositionAsync({
        maxAge: 60_000,
      });
      if (last?.coords) {
        setState((prev) => ({ ...prev, coords: last.coords }));
      }

      const fresh = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 10_000)),
      ]);

      if (fresh && 'coords' in fresh) {
        setState((prev) => ({ ...prev, coords: fresh.coords, isCapturing: false }));
        return fresh.coords;
      }

      setState((prev) => ({ ...prev, isCapturing: false }));
      return last?.coords ?? null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get location';
      log.error('Location capture failed', err);
      setState((prev) => ({ ...prev, isCapturing: false, error: message }));
      return null;
    }
  }, [requestPermission]);

  useEffect(() => {
    if (autoStart) {
      capture();
    }
  }, [autoStart, capture]);

  return { ...state, capture, requestPermission };
}
