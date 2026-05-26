import { requestWidgetUpdate } from 'react-native-android-widget';

import { MediumWidget } from '@/components/widget/MediumWidget';
import { SmallWidget } from '@/components/widget/SmallWidget';
import { getActiveSession, getLastEndedSession } from '@/db/queries/sessions';
import { createLogger } from '@/lib/logger';
import { type WidgetState, WIDGET_NAME } from '@/types/widget';

const log = createLogger('widget.update');

export async function loadWidgetState(): Promise<WidgetState> {
  const active = await getActiveSession();
  if (active) {
    return {
      kind: 'active',
      parkedAtIso: active.parkedAt.toISOString(),
      latitude: active.latitude,
      longitude: active.longitude,
      note: active.note ?? null,
      photoLocalUri: active.photoLocalUri ?? null,
      expiresAtIso: active.expiresAt ? active.expiresAt.toISOString() : null,
    };
  }
  const last = await getLastEndedSession();
  if (last?.endedAt) {
    return {
      kind: 'last-ended',
      parkedAtIso: last.parkedAt.toISOString(),
      endedAtIso: last.endedAt.toISOString(),
      latitude: last.latitude,
      longitude: last.longitude,
      note: last.note ?? null,
      photoLocalUri: last.photoLocalUri ?? null,
    };
  }
  return { kind: 'empty' };
}

export async function refreshWidget(): Promise<void> {
  try {
    const state = await loadWidgetState();
    requestWidgetUpdate({
      widgetName: WIDGET_NAME,
      renderWidget: (info) => {
        const isMedium = (info.width ?? 0) >= 180;
        return isMedium ? <MediumWidget state={state} /> : <SmallWidget state={state} />;
      },
    });
  } catch (err) {
    log.warn('Failed to refresh widget', err);
  }
}
