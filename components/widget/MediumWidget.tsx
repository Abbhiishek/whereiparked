import { FlexWidget, IconWidget, TextWidget } from 'react-native-android-widget';

import { DEEP_LINKS } from '@/constants/config';
import { relativeFromNow } from '@/lib/time';
import type { WidgetState } from '@/types/widget';

interface MediumWidgetProps {
  state: WidgetState;
}

const COLOR_BRAND = '#0E7C66';
const COLOR_BRAND_DARK = '#0B6253';
const COLOR_BRAND_TINT = '#C3E4D9';
const COLOR_ACCENT = '#FFB020';
const COLOR_WHITE = '#FFFFFF';
const COLOR_MUTED_BG = '#F2F4F3';
const COLOR_MUTED_TEXT = '#5C6B66';

export function MediumWidget({ state }: MediumWidgetProps) {
  if (state.kind === 'empty') {
    return <EmptyMedium />;
  }

  if (state.kind === 'last-ended') {
    return <LastEndedMedium state={state} />;
  }

  return <ActiveMedium state={state} />;
}

function EmptyMedium() {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: COLOR_ACCENT,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
      }}
      clickAction="OPEN_URI"
      clickActionData={{ uri: DEEP_LINKS.widgetQuickSave }}>
      <IconWidget font="material" icon="add_location" size={36} style={{ color: COLOR_WHITE }} />
      <FlexWidget style={{ flex: 1, marginLeft: 12, flexDirection: 'column' }}>
        <TextWidget
          text="Park Here"
          style={{ color: COLOR_WHITE, fontSize: 18, fontWeight: '700' }}
        />
        <TextWidget
          text="Tap once to save this spot"
          style={{ color: COLOR_WHITE, fontSize: 12 }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

function LastEndedMedium({
  state,
}: {
  state: Extract<WidgetState, { kind: 'last-ended' }>;
}) {
  const subtitle = state.note?.trim()
    ? state.note.trim()
    : `Last parked ${relativeFromNow(new Date(state.parkedAtIso))}`;
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: COLOR_MUTED_BG,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
      }}
      clickAction="OPEN_URI"
      clickActionData={{ uri: DEEP_LINKS.widgetQuickSave }}>
      <FlexWidget
        style={{
          width: 56,
          height: 56,
          backgroundColor: COLOR_ACCENT,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <IconWidget font="material" icon="add_location" size={28} style={{ color: COLOR_WHITE }} />
      </FlexWidget>
      <FlexWidget style={{ flex: 1, marginLeft: 12, flexDirection: 'column' }}>
        <TextWidget
          text="Park Here"
          style={{ color: COLOR_BRAND_DARK, fontSize: 16, fontWeight: '700' }}
        />
        <TextWidget
          text={subtitle}
          style={{ color: COLOR_MUTED_TEXT, fontSize: 12 }}
          truncate="END"
          maxLines={2}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

function ActiveMedium({
  state,
}: {
  state: Extract<WidgetState, { kind: 'active' }>;
}) {
  const parkedAgo = relativeFromNow(new Date(state.parkedAtIso));
  const note = state.note?.trim();
  const subtitle = note ? note : `Parked ${parkedAgo}`;

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: COLOR_BRAND,
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
          backgroundColor: COLOR_BRAND_DARK,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <IconWidget
          font="material"
          icon="local_parking"
          size={32}
          style={{ color: COLOR_WHITE }}
        />
      </FlexWidget>
      <FlexWidget style={{ flex: 1, marginLeft: 12, flexDirection: 'column' }}>
        <TextWidget
          text="Find My Car"
          style={{ color: COLOR_WHITE, fontSize: 16, fontWeight: '700' }}
        />
        <TextWidget
          text={subtitle}
          style={{ color: COLOR_BRAND_TINT, fontSize: 12 }}
          truncate="END"
          maxLines={2}
        />
        {note ? (
          <TextWidget
            text={parkedAgo}
            style={{ color: COLOR_BRAND_TINT, fontSize: 11, marginTop: 2 }}
          />
        ) : null}
      </FlexWidget>
    </FlexWidget>
  );
}
