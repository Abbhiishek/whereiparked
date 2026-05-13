import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { getSessionById, updateSession } from '@/db/queries/sessions';
import { createLogger } from '@/lib/logger';

import { cancelExpirationReminder, scheduleExpirationReminder } from './scheduler';

const log = createLogger('notifications.handlers');

export function registerNotificationResponseHandler(): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener(async (response) => {
    const data = response.notification.request.content.data as {
      sessionId?: string;
      kind?: string;
    };
    if (!data?.sessionId) return;
    const action = response.actionIdentifier;

    if (action === 'extend-30') {
      const session = await getSessionById(data.sessionId);
      if (!session) return;
      const newExpires = new Date((session.expiresAt?.getTime() ?? Date.now()) + 30 * 60 * 1000);
      if (session.reminderNotificationId) {
        await cancelExpirationReminder(session.reminderNotificationId);
      }
      const newReminderId = await scheduleExpirationReminder({
        sessionId: session.id,
        expiresAt: newExpires,
        leadMinutes: 5,
      });
      await updateSession(session.id, {
        expiresAt: newExpires,
        reminderNotificationId: newReminderId,
      });
      return;
    }

    if (action === 'snooze-5') {
      const newReminderId = await scheduleExpirationReminder({
        sessionId: data.sessionId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        leadMinutes: 0,
      });
      await updateSession(data.sessionId, { reminderNotificationId: newReminderId });
      return;
    }

    if (action === 'leaving-now' || action === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      try {
        router.push('/find');
      } catch (err) {
        log.warn('Could not route to /find', err);
      }
    }
  });
  return () => sub.remove();
}
