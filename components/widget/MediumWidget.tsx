import { FlexWidget, IconWidget, TextWidget } from 'react-native-android-widget';

import { DEEP_LINKS } from '@/constants/config';
import type { WidgetState } from '@/types/widget';

interface MediumWidgetProps {
  state: WidgetState;
}

export function MediumWidget({ state }: MediumWidgetProps) {
  if (state.kind === 'empty') {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#FFB020',
          borderRadius: 24,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
        }}
        clickAction="OPEN_URI"
        clickActionData={{ uri: DEEP_LINKS.widgetSave }}>
        <IconWidget font="material" icon="add_location" size={36} style={{ color: '#FFFFFF' }} />
        <FlexWidget
          style={{
            flex: 1,
            marginLeft: 12,
            flexDirection: 'column',
          }}>
          <TextWidget
            text="Park Here"
            style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}
          />
          <TextWidget
            text="Tap to save your spot"
            style={{ color: '#FFFFFF', fontSize: 12 }}
          />
        </FlexWidget>
      </FlexWidget>
    );
  }

  const note = state.note?.trim();

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#0E7C66',
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
      }}
      clickAction="OPEN_URI"
      clickActionData={{ uri: DEEP_LINKS.widgetFind }}>
      <FlexWidget
        style={{
          width: 64,
          height: 64,
          backgroundColor: '#0B6253',
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <IconWidget
          font="material"
          icon="local_parking"
          size={32}
          style={{ color: '#FFFFFF' }}
        />
      </FlexWidget>
      <FlexWidget
        style={{
          flex: 1,
          marginLeft: 12,
          flexDirection: 'column',
        }}>
        <TextWidget
          text="Find My Car"
          style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}
        />
        <TextWidget
          text={note ?? 'Saved spot'}
          style={{ color: '#C3E4D9', fontSize: 12 }}
          truncate="END"
          maxLines={2}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
