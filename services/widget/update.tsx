import { requestWidgetUpdate } from 'react-native-android-widget';

import { MediumWidget } from '@/components/widget/MediumWidget';
import { SmallWidget } from '@/components/widget/SmallWidget';
import { getActiveSession } from '@/db/queries/sessions';
import { createLogger } from '@/lib/logger';
import { type WidgetState, WIDGET_NAME } from '@/types/widget';

const log = createLogger('widget.update');

export async function refreshWidget(): Promise<void> {
  try {
    const active = await getActiveSession();
    const state: WidgetState = active
      ? {
          kind: 'active',
          parkedAtIso: active.parkedAt.toISOString(),
          latitude: active.latitude,
          longitude: active.longitude,
          note: active.note ?? null,
          photoLocalUri: active.photoLocalUri ?? null,
          expiresAtIso: active.expiresAt ? active.expiresAt.toISOString() : null,
        }
      : { kind: 'empty' };

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
