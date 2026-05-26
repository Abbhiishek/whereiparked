import { Download, Info, Sparkles, Trash2 } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clearAllSessions } from '@/db/queries/sessions';
import { exportSessionsAsJson } from '@/services/exportJson';
import { refreshWidget } from '@/services/widget/update';
import { useSettingsStore } from '@/stores/settingsStore';

const REMINDER_OPTIONS = [5, 10, 15, 30] as const;
const RETENTION_OPTIONS = [7, 30, 90, 365] as const;

export default function SettingsScreen() {
  const defaultReminderMinutes = useSettingsStore((s) => s.defaultReminderMinutes);
  const setDefaultReminderMinutes = useSettingsStore((s) => s.setDefaultReminderMinutes);
  const units = useSettingsStore((s) => s.units);
  const setUnits = useSettingsStore((s) => s.setUnits);
  const retentionDays = useSettingsStore((s) => s.retentionDays);
  const setRetentionDays = useSettingsStore((s) => s.setRetentionDays);
  const delightEnabled = useSettingsStore((s) => s.delightEnabled);
  const setDelightEnabled = useSettingsStore((s) => s.setDelightEnabled);

  function handleWipe() {
    Alert.alert(
      'Delete all parking history',
      'This permanently removes every saved spot, photo, and voice note from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllSessions();
            await refreshWidget().catch(() => {});
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-surface-dark">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
        <Section title="Reminders">
          <Text className="text-sm text-ink-muted px-4 pt-3 mb-2">
            Notify me this many minutes before parking expires
          </Text>
          <ChipRow<number>
            options={REMINDER_OPTIONS}
            selected={defaultReminderMinutes}
            onSelect={setDefaultReminderMinutes}
            renderLabel={(v) => `${v} min`}
          />
        </Section>

        <Section title="Units">
          <ChipRow<'metric' | 'imperial'>
            options={['metric', 'imperial'] as const}
            selected={units}
            onSelect={setUnits}
            renderLabel={(v) => (v === 'metric' ? 'Metric (m, km)' : 'Imperial (ft, mi)')}
          />
        </Section>

        <Section title="History retention">
          <Text className="text-sm text-ink-muted px-4 pt-3 mb-2">
            Auto-delete spots older than
          </Text>
          <ChipRow<number>
            options={RETENTION_OPTIONS}
            selected={retentionDays}
            onSelect={setRetentionDays}
            renderLabel={(v) => `${v} days`}
          />
        </Section>

        <Section title="Feel">
          <View className="flex-row items-center gap-3 px-4 py-3">
            <Sparkles color="#0E7C66" size={20} />
            <View className="flex-1">
              <Text className="text-base font-medium text-ink dark:text-ink-inverse">
                Motion & haptics
              </Text>
              <Text className="text-xs text-ink-muted mt-0.5">
                Springy buttons, gentle pulses, and tap feedback. Off respects accessibility
                settings only.
              </Text>
            </View>
            <Switch
              value={delightEnabled}
              onValueChange={setDelightEnabled}
              trackColor={{ false: '#9AAAA4', true: '#0E7C66' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Section>

        <Section title="Data">
          <ActionRow
            icon={<Download color="#0E7C66" size={20} />}
            label="Export my data"
            onPress={() => exportSessionsAsJson()}
          />
          <ActionRow
            icon={<Trash2 color="#D14343" size={20} />}
            label="Delete all history"
            onPress={handleWipe}
            danger
          />
        </Section>

        <Section title="About">
          <View className="px-4 py-3 flex-row items-start gap-3">
            <Info color="#5C6B66" size={20} />
            <View className="flex-1">
              <Text className="text-sm font-medium text-ink dark:text-ink-inverse">
                Local only — your data never leaves this device.
              </Text>
              <Text className="text-xs text-ink-muted mt-1">
                ParkSpot stores everything in on-device storage. No accounts, no cloud, no
                tracking. Uninstall the app to wipe everything.
              </Text>
            </View>
          </View>
        </Section>

        <Text className="text-xs text-ink-muted text-center mt-4">ParkSpot v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-2">
        {title}
      </Text>
      <View className="bg-surface dark:bg-brand-800 rounded-2xl overflow-hidden">{children}</View>
    </View>
  );
}

function ChipRow<T>({
  options,
  selected,
  onSelect,
  renderLabel,
}: {
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  renderLabel: (value: T) => string;
}) {
  return (
    <View className="flex-row flex-wrap gap-2 px-4 pb-4 pt-2">
      {options.map((option) => {
        const active = option === selected;
        return (
          <Pressable
            key={String(option)}
            onPress={() => onSelect(option)}
            className={`px-4 py-2 rounded-full border ${
              active
                ? 'bg-brand-500 border-brand-500'
                : 'bg-white dark:bg-brand-700 border-gray-200 dark:border-brand-600'
            }`}>
            <Text
              className={`text-sm font-medium ${
                active ? 'text-white' : 'text-ink dark:text-ink-inverse'
              }`}>
              {renderLabel(option)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ActionRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3 active:opacity-60">
      {icon}
      <Text
        className={`text-base font-medium ${danger ? 'text-danger' : 'text-ink dark:text-ink-inverse'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
