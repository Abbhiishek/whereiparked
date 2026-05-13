import { Linking, Platform } from 'react-native';

import type { Coords } from './geo';

const WALKING_HTTPS = 'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=';

function geoIntent(c: Coords): string {
  return `geo:${c.latitude},${c.longitude}?q=${c.latitude},${c.longitude}(Parking)`;
}

function httpsFallback(c: Coords): string {
  return `${WALKING_HTTPS}${c.latitude},${c.longitude}`;
}

export async function openWalkingNavigation(target: Coords): Promise<void> {
  if (Platform.OS === 'android') {
    const intent = geoIntent(target);
    if (await Linking.canOpenURL(intent)) {
      await Linking.openURL(intent);
      return;
    }
  }
  await Linking.openURL(httpsFallback(target));
}

export function buildWalkingMapsUrl(target: Coords): string {
  return Platform.OS === 'android' ? geoIntent(target) : httpsFallback(target);
}
