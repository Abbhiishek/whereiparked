import { Tabs } from 'expo-router';
import { Clock, Home, Settings } from 'lucide-react-native';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { HapticTab } from '@/components/haptic-tab';
import { Midnight } from '@/constants/design';
import { SPRING_SNAPPY, useDelightEnabled } from '@/lib/delight';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Midnight.text,
        tabBarInactiveTintColor: Midnight.textDim,
        tabBarStyle: {
          backgroundColor: Midnight.surface,
          borderTopColor: Midnight.border,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 0.2,
        },
        headerStyle: { backgroundColor: Midnight.bg },
        headerTintColor: Midnight.text,
        headerShadowVisible: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Now',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused}>
              <Home color={color} size={size} strokeWidth={focused ? 2.1 : 1.7} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Past',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused}>
              <Clock color={color} size={size} strokeWidth={focused ? 2.1 : 1.7} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused}>
              <Settings color={color} size={size} strokeWidth={focused ? 2.1 : 1.7} />
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
