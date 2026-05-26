import { Download, Info, Sparkles, Trash2 } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Midnight } from '@/constants/design';
import { clearAllSessions } from '@/db/queries/sessions';
import { exportSessionsAsJson } from '@/services/exportJson';
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
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Midnight.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 40 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: '700',
            color: Midnight.text,
            letterSpacing: -0.7,
            marginBottom: 4,
          }}>
          Settings
        </Text>

        <Section title="Reminders">
          <Text style={hint}>Notify me this many minutes before parking expires</Text>
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
          <Text style={hint}>Auto-delete spots older than</Text>
          <ChipRow<number>
            options={RETENTION_OPTIONS}
            selected={retentionDays}
            onSelect={setRetentionDays}
            renderLabel={(v) => `${v} days`}
          />
        </Section>

        <Section title="Feel">
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}>
            <Sparkles color={Midnight.accent} size={20} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: Midnight.text }}>
                Motion &amp; haptics
              </Text>
              <Text style={{ fontSize: 12, color: Midnight.textMute, marginTop: 2 }}>
                Springy buttons, gentle pulses, and tap feedback.
              </Text>
            </View>
            <Switch
              value={delightEnabled}
              onValueChange={setDelightEnabled}
              trackColor={{ false: Midnight.surface3, true: Midnight.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Section>

        <Section title="Data">
          <ActionRow
            icon={<Download color={Midnight.accent} size={20} />}
            label="Export my data"
            onPress={() => exportSessionsAsJson()}
          />
          <View style={{ height: 1, backgroundColor: Midnight.border, marginHorizontal: 16 }} />
          <ActionRow
            icon={<Trash2 color={Midnight.urgent} size={20} />}
            label="Delete all history"
            onPress={handleWipe}
            danger
          />
        </Section>

        <Section title="About">
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}>
            <Info color={Midnight.textMute} size={20} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: Midnight.text }}>
                Local only — your data never leaves this device.
              </Text>
              <Text style={{ fontSize: 12, color: Midnight.textMute, marginTop: 4 }}>
                ParkSpot stores everything in on-device storage. No accounts, no cloud, no
                tracking. Uninstall the app to wipe everything.
              </Text>
            </View>
          </View>
        </Section>

        <Text
          style={{
            fontSize: 11,
            color: Midnight.textDim,
            textAlign: 'center',
            marginTop: 8,
          }}>
          ParkSpot v1.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const hint = {
  fontSize: 13,
  color: Midnight.textMute,
  paddingHorizontal: 16,
  paddingTop: 12,
  marginBottom: 2,
} as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          color: Midnight.textMute,
          marginBottom: 8,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
        }}>
        {title}
      </Text>
      <View
        style={{
          backgroundColor: Midnight.surface2,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: Midnight.border,
          overflow: 'hidden',
        }}>
        {children}
      </View>
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
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
      }}>
      {options.map((option) => {
        const active = option === selected;
        return (
          <Pressable
            key={String(option)}
            onPress={() => onSelect(option)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: active ? Midnight.accent : Midnight.border,
              backgroundColor: active ? Midnight.accent : Midnight.surface3,
            }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '500',
                color: active ? Midnight.accentInk : Midnight.text,
              }}>
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
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        opacity: pressed ? 0.6 : 1,
      })}>
      {icon}
      <Text
        style={{
          fontSize: 15,
          fontWeight: '500',
          color: danger ? Midnight.urgent : Midnight.text,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}
