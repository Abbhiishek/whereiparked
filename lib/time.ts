import { differenceInMinutes, formatDistanceToNowStrict } from 'date-fns';

export function relativeFromNow(date: Date): string {
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Expired';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${seconds}s`;
}

export function minutesUntil(target: Date): number {
  return differenceInMinutes(target, new Date());
}
