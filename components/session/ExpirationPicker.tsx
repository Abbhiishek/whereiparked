import { Clock } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

interface ExpirationPickerProps {
  selectedMinutes: number | null;
  onChange: (minutes: number | null) => void;
}

const PRESETS: { label: string; minutes: number | null }[] = [
  { label: 'No timer', minutes: null },
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '1 hr', minutes: 60 },
  { label: '2 hr', minutes: 120 },
  { label: '4 hr', minutes: 240 },
];

export function ExpirationPicker({ selectedMinutes, onChange }: ExpirationPickerProps) {
  return (
    <View>
      <View className="flex-row items-center gap-2 mb-2">
        <Clock color="#0E7C66" size={18} />
        <Text className="text-sm font-medium text-ink dark:text-ink-inverse">
          Reminder before expiry
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const active = selectedMinutes === preset.minutes;
          return (
            <Pressable
              key={preset.label}
              onPress={() => onChange(preset.minutes)}
              className={`px-4 py-2 rounded-full border ${
                active
                  ? 'bg-brand-500 border-brand-500'
                  : 'bg-white dark:bg-brand-800 border-gray-200 dark:border-brand-700'
              }`}>
              <Text
                className={`text-sm font-medium ${
                  active ? 'text-white' : 'text-ink dark:text-ink-inverse'
                }`}>
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
