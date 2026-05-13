import * as Notifications from 'expo-notifications';

import { createLogger } from '@/lib/logger';

const log = createLogger('notifications.scheduler');

const REMINDER_CATEGORY = 'parking-reminder';

export async function configureNotifications(): Promise<void> {
  await Notifications.setNotificationCategoryAsync(REMINDER_CATEGORY, [
    {
      identifier: 'extend-30',
      buttonTitle: 'Extend 30 min',
      options: { opensAppToForeground: false },
    },
    {
      identifier: 'leaving-now',
      buttonTitle: 'Leaving now',
      options: { opensAppToForeground: true },
    },
    {
      identifier: 'snooze-5',
      buttonTitle: 'Snooze 5 min',
      options: { opensAppToForeground: false },
    },
  ]);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

interface ScheduleArgs {
  sessionId: string;
  expiresAt: Date;
  leadMinutes: number;
}

export async function scheduleExpirationReminder({
  sessionId,
  expiresAt,
  leadMinutes,
}: ScheduleArgs): Promise<string | null> {
  const triggerDate = new Date(expiresAt.getTime() - leadMinutes * 60 * 1000);
  if (triggerDate.getTime() <= Date.now()) {
    log.warn('Skipping reminder: trigger time already passed', { triggerDate });
    return null;
  }
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Parking expires soon',
        body: `Your parking expires in ${leadMinutes} minutes.`,
        categoryIdentifier: REMINDER_CATEGORY,
        data: { sessionId, kind: 'expiration-reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return id;
  } catch (err) {
    log.error('Failed to schedule reminder', err);
    return null;
  }
}

export async function cancelExpirationReminder(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    log.warn('Failed to cancel reminder', err);
  }
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
