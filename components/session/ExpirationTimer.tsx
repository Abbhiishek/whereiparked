import { Clock, Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';

import { formatCountdown } from '@/lib/time';

interface ExpirationTimerProps {
  expiresAt: Date | null;
  onPress?: () => void;
  compact?: boolean;
}

export function ExpirationTimer({ expiresAt, onPress, compact }: ExpirationTimerProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) {
    return (
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-2 px-3 py-2 rounded-full border border-dashed border-brand-300">
        <Plus color="#0E7C66" size={16} />
        <Text className="text-sm text-brand-500 font-medium">Set timer</Text>
      </Pressable>
    );
  }

  const remainingMs = expiresAt.getTime() - now;
  const isExpired = remainingMs <= 0;
  const isWarning = remainingMs > 0 && remainingMs < 5 * 60 * 1000;
  const containerClass = isExpired
    ? 'bg-danger/10 border-danger'
    : isWarning
      ? 'bg-accent/10 border-accent'
      : 'bg-brand-50 dark:bg-brand-800 border-brand-200 dark:border-brand-700';
  const textClass = isExpired ? 'text-danger' : isWarning ? 'text-accent-dark' : 'text-brand-700 dark:text-brand-100';

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-2 px-3 py-2 rounded-full border ${containerClass}`}>
      <Clock color={isExpired ? '#D14343' : isWarning ? '#CC8C19' : '#0E7C66'} size={16} />
      <Text className={`text-sm font-semibold ${textClass}`}>
        {compact ? formatCountdown(remainingMs) : `Expires in ${formatCountdown(remainingMs)}`}
      </Text>
    </Pressable>
  );
}
