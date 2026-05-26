import '../global.css';
import 'react-native-reanimated';

import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Midnight } from '@/constants/design';

import { useMigrations } from '@/db/migrate';
import { parseDeepLink } from '@/lib/deeplink';
import { createLogger } from '@/lib/logger';
import { useActiveSession } from '@/hooks/useActiveSession';
import { configureNotifications } from '@/services/notifications/scheduler';
import { registerNotificationResponseHandler } from '@/services/notifications/handlers';
import { refreshWidget } from '@/services/widget/update';
import { useOnboardingStore } from '@/stores/onboardingStore';

const MidnightNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Midnight.bg,
    card: Midnight.surface,
    text: Midnight.text,
    border: Midnight.border,
    primary: Midnight.accent,
    notification: Midnight.urgent,
  },
};

SplashScreen.preventAutoHideAsync().catch(() => {});

const log = createLogger('root');

export default function RootLayout() {
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
      if (parsed.kind === 'widget-save') router.push('/save');
      else if (parsed.kind === 'widget-find') router.push('/find');
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
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          backgroundColor: Midnight.bg,
        }}>
        <Text style={{ color: Midnight.urgent, fontSize: 16, textAlign: 'center' }}>
          Database error: {migrationsError.message}
        </Text>
      </View>
    );
  }

  if (!migrationsReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Midnight.bg,
        }}>
        <ActivityIndicator size="large" color={Midnight.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Midnight.bg }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={MidnightNavTheme}>
            <RootEffects />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Midnight.bg },
              }}
              initialRouteName={hasOnboarded ? '(tabs)' : '(onboarding)'}>
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="save"
                options={{
                  presentation: 'modal',
                  headerShown: false,
                }}
              />
              <Stack.Screen name="find" options={{ headerShown: false }} />
              <Stack.Screen
                name="session/[id]"
                options={{
                  headerShown: true,
                  title: 'Session',
                  headerStyle: { backgroundColor: Midnight.bg },
                  headerTintColor: Midnight.text,
                }}
              />
            </Stack>
            <StatusBar style="light" />
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
