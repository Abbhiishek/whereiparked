import { Tabs } from 'expo-router';
import { Clock, Home, Settings } from 'lucide-react-native';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SPRING_SNAPPY, useDelightEnabled } from '@/lib/delight';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.tabIconSelected,
        tabBarInactiveTintColor: palette.tabIconDefault,
        tabBarStyle: {
          backgroundColor: palette.background,
          borderTopColor: palette.border,
        },
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.text,
        headerShadowVisible: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused}>
              <Home color={color} size={size} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused}>
              <Clock color={color} size={size} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused}>
              <Settings color={color} size={size} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  const delight = useDelightEnabled();
  const scale = useSharedValue(focused ? 1.12 : 1);

  useEffect(() => {
    if (!delight) {
      scale.value = 1;
      return;
    }
    scale.value = withSpring(focused ? 1.12 : 1, SPRING_SNAPPY);
  }, [delight, focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
