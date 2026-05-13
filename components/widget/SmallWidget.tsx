import { FlexWidget, IconWidget, TextWidget } from 'react-native-android-widget';

import type { WidgetState } from '@/types/widget';

import { DEEP_LINKS } from '@/constants/config';

interface SmallWidgetProps {
  state: WidgetState;
}

export function SmallWidget({ state }: SmallWidgetProps) {
  const isActive = state.kind === 'active';
  const label = isActive ? 'Find Car' : 'Park Here';
  const bg = isActive ? '#0E7C66' : '#FFB020';
  const link = isActive ? DEEP_LINKS.widgetFind : DEEP_LINKS.widgetSave;

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: bg,
        borderRadius: 24,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
      }}
      clickAction="OPEN_URI"
      clickActionData={{ uri: link }}>
      <IconWidget
        font="material"
        icon={isActive ? 'navigation' : 'add_location'}
        size={28}
        style={{ color: '#FFFFFF' }}
      />
      <TextWidget
        text={label}
        style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginTop: 4 }}
      />
    </FlexWidget>
  );
}
