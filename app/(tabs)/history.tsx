import { Clock } from 'lucide-react-native';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SessionListItem } from '@/components/history/SessionListItem';
import { useRecentSessions } from '@/hooks/useRecentSessions';

export default function HistoryScreen() {
  const sessions = useRecentSessions();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-surface-dark">
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SessionListItem session={item} />}
        contentContainerStyle={{ paddingBottom: 40 }}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-gray-100 dark:bg-brand-800 ml-20" />
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-24 px-6">
            <Clock color="#9AAAA4" size={48} />
            <Text className="text-base font-semibold text-ink dark:text-ink-inverse mt-3">
              No parking spots yet
            </Text>
            <Text className="text-sm text-ink-muted text-center mt-1">
              Tap &quot;Park Here&quot; on the home tab the next time you park.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
