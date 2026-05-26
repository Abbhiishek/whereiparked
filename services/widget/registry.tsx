import {
  registerWidgetTaskHandler,
  type WidgetTaskHandlerProps,
} from 'react-native-android-widget';

import { MediumWidget } from '@/components/widget/MediumWidget';
import { SmallWidget } from '@/components/widget/SmallWidget';
import { createLogger } from '@/lib/logger';

import { loadWidgetState } from './update';

const log = createLogger('widget.registry');

async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  const widgetInfo = props.widgetInfo;
  const isMedium = (widgetInfo.width ?? 0) >= 180;

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      try {
        const state = await loadWidgetState();
        props.renderWidget(
          isMedium ? <MediumWidget state={state} /> : <SmallWidget state={state} />,
        );
      } catch (err) {
        log.warn('Widget task handler failed', err);
        props.renderWidget(
          isMedium ? (
            <MediumWidget state={{ kind: 'empty' }} />
          ) : (
            <SmallWidget state={{ kind: 'empty' }} />
          ),
        );
      }
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
