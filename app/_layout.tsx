import '../global.css';
import 'react-native-reanimated';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useMigrations } from '@/db/migrate';
import { parseDeepLink } from '@/lib/deeplink';
import { createLogger } from '@/lib/logger';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useActiveSession } from '@/hooks/useActiveSession';
import { configureNotifications } from '@/services/notifications/scheduler';
import { registerNotificationResponseHandler } from '@/services/notifications/handlers';
import { refreshWidget } from '@/services/widget/update';
import { useOnboardingStore } from '@/stores/onboardingStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

const log = createLogger('root');

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
    [],
  );

  const { success: migrationsReady, error: migrationsError } = useMigrations();
  // onboardingStore is hydrated synchronously from MMKV at module load,
  // so this value is correct on the very first render — no flicker.
  const hasOnboarded = useOnboardingStore((s) => s.hasCompletedOnboarding);

  useEffect(() => {
    if (!migrationsReady) return;
    configureNotifications().catch((err) => log.warn('Notification configure failed', err));
    const removeNotifHandler = registerNotificationResponseHandler();
    return () => removeNotifHandler();
  }, [migrationsReady]);

  useEffect(() => {
    if (!migrationsReady) return;
    const handleUrl = (url: string) => {
      const parsed = parseDeepLink(url);
      if (parsed.kind === 'widget-save') {
        router.push({ pathname: '/save', params: parsed.auto ? { auto: '1' } : {} });
      } else if (parsed.kind === 'widget-find') {
        router.push('/find');
      }
    };
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });
    return () => sub.remove();
  }, [migrationsReady]);

  useEffect(() => {
    if (migrationsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [migrationsReady]);

  if (migrationsError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#D14343', fontSize: 16, textAlign: 'center' }}>
          Database error: {migrationsError.message}
        </Text>
      </View>
    );
  }

  if (!migrationsReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0E7C66" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootEffects />
            <Stack
              screenOptions={{ headerShown: false }}
              initialRouteName={hasOnboarded ? '(tabs)' : '(onboarding)'}>
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="save"
                options={{
                  presentation: 'modal',
                  headerShown: true,
                  title: 'Park Here',
                }}
              />
              <Stack.Screen name="find" options={{ headerShown: true, title: 'Find My Car' }} />
              <Stack.Screen
                name="session/[id]"
                options={{ headerShown: true, title: 'Session' }}
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootEffects() {
  const active = useActiveSession();
  // Use primitive values for the dep array so the effect only fires on
  // meaningful changes — Date objects from useLiveQuery have a new identity
  // every render even when the underlying timestamp is unchanged.
  const parkedAtMs = active?.parkedAt?.getTime() ?? null;
  useEffect(() => {
    refreshWidget().catch(() => {});
  }, [active?.id, parkedAtMs, active?.note, active?.photoLocalUri]);
  return null;
}
