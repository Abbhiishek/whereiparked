import {
  registerWidgetTaskHandler,
  type WidgetTaskHandlerProps,
} from 'react-native-android-widget';
import { desc, isNull } from 'drizzle-orm';

import { MediumWidget } from '@/components/widget/MediumWidget';
import { SmallWidget } from '@/components/widget/SmallWidget';
import { db } from '@/db/client';
import { sessions } from '@/db/schema';
import { createLogger } from '@/lib/logger';
import { type WidgetState } from '@/types/widget';

const log = createLogger('widget.registry');

async function loadState(): Promise<WidgetState> {
  try {
    const rows = await db
      .select()
      .from(sessions)
      .where(isNull(sessions.endedAt))
      .orderBy(desc(sessions.parkedAt))
      .limit(1);
    const row = rows[0];
    if (!row) return { kind: 'empty' };
    return {
      kind: 'active',
      parkedAtIso: row.parkedAt.toISOString(),
      latitude: row.latitude,
      longitude: row.longitude,
      note: row.note ?? null,
      photoLocalUri: row.photoLocalUri ?? null,
      expiresAtIso: row.expiresAt ? row.expiresAt.toISOString() : null,
    };
  } catch (err) {
    log.warn('Widget state load failed', err);
    return { kind: 'empty' };
  }
}

async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  const widgetInfo = props.widgetInfo;
  const widgetName = widgetInfo.widgetName as 'ParkSpotWidget';
  const state = await loadState();
  const isMedium = (widgetInfo.width ?? 0) >= 180;

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      props.renderWidget(
        isMedium ? <MediumWidget state={state} /> : <SmallWidget state={state} />,
      );
      break;
    }
    case 'WIDGET_DELETED':
    default:
      break;
  }
}

export function registerWidget(): void {
  registerWidgetTaskHandler(widgetTaskHandler);
}
