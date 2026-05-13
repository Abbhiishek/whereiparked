import * as Linking from 'expo-linking';

export type DeepLinkRoute =
  | { kind: 'widget-save' }
  | { kind: 'widget-find' }
  | { kind: 'auth-callback'; url: string }
  | { kind: 'unknown'; url: string };

export function parseDeepLink(url: string): DeepLinkRoute {
  const parsed = Linking.parse(url);
  const path = parsed.path?.replace(/^\/+|\/+$/g, '') ?? '';
  if (path === 'widget/save') return { kind: 'widget-save' };
  if (path === 'widget/find') return { kind: 'widget-find' };
  if (path.startsWith('auth/callback')) return { kind: 'auth-callback', url };
  return { kind: 'unknown', url };
}
