import { Text, TextInput, View } from 'react-native';

import { APP_CONFIG } from '@/constants/config';

interface NoteFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function NoteField({ value, onChange }: NoteFieldProps) {
  return (
    <View>
      <Text className="text-sm font-medium text-ink dark:text-ink-inverse mb-2">Note</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Level 3, Pillar B7..."
        placeholderTextColor="#9AAAA4"
        multiline
        maxLength={APP_CONFIG.maxNoteChars}
        className="bg-surface dark:bg-brand-800 rounded-2xl px-4 py-3 text-base text-ink dark:text-ink-inverse min-h-[80px]"
        style={{ textAlignVertical: 'top' }}
      />
      <Text className="text-xs text-ink-muted text-right mt-1">
        {value.length}/{APP_CONFIG.maxNoteChars}
      </Text>
    </View>
  );
}
