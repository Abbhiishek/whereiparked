import { FlexWidget, IconWidget, TextWidget } from 'react-native-android-widget';

import { DEEP_LINKS } from '@/constants/config';
import type { WidgetState } from '@/types/widget';

interface SmallWidgetProps {
  state: WidgetState;
}

type HexColor = `#${string}`;

const COLOR_BRAND: HexColor = '#0E7C66';
const COLOR_ACCENT: HexColor = '#FFB020';
const COLOR_WHITE: HexColor = '#FFFFFF';
const COLOR_MUTED_BG: HexColor = '#F2F4F3';
const COLOR_MUTED_TEXT: HexColor = '#5C6B66';

export function SmallWidget({ state }: SmallWidgetProps) {
  if (state.kind === 'active') {
    return (
      <Tile
        bg={COLOR_BRAND}
        textColor={COLOR_WHITE}
        icon="navigation"
        label="Find Car"
        link={DEEP_LINKS.widgetFind}
      />
    );
  }

  if (state.kind === 'last-ended') {
    // Muted look — still single-tap save, with a hint that last spot exists.
    return (
      <Tile
        bg={COLOR_MUTED_BG}
        textColor={COLOR_MUTED_TEXT}
        iconColor={COLOR_BRAND}
        icon="add_location"
        label="Park Here"
        link={DEEP_LINKS.widgetQuickSave}
      />
    );
  }

  return (
    <Tile
      bg={COLOR_ACCENT}
      textColor={COLOR_WHITE}
      icon="add_location"
      label="Park Here"
      link={DEEP_LINKS.widgetQuickSave}
    />
  );
}

interface TileProps {
  bg: HexColor;
  textColor: HexColor;
  iconColor?: HexColor;
  icon: string;
  label: string;
  link: string;
}

function Tile({ bg, textColor, iconColor, icon, label, link }: TileProps) {
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
        icon={icon}
        size={28}
        style={{ color: iconColor ?? textColor }}
      />
      <TextWidget
        text={label}
        style={{ color: textColor, fontSize: 12, fontWeight: '700', marginTop: 4 }}
      />
    </FlexWidget>
  );
}
