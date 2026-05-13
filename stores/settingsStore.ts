import { create } from 'zustand';

import { APP_CONFIG } from '@/constants/config';
import { getJsonPreference, setJsonPreference } from '@/lib/preferences';

type Units = 'metric' | 'imperial';
type ThemePref = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'settings';

interface SettingsShape {
  defaultReminderMinutes: number;
  units: Units;
  retentionDays: number;
  themePref: ThemePref;
}

const defaults: SettingsShape = {
  defaultReminderMinutes: APP_CONFIG.defaultReminderMinutes,
  units: 'metric',
  retentionDays: APP_CONFIG.defaultRetentionDays,
  themePref: 'system',
};

function readSync(): SettingsShape {
  return getJsonPreference<SettingsShape>(STORAGE_KEY, defaults);
}

function persist(state: SettingsShape): void {
  setJsonPreference(STORAGE_KEY, state);
}

interface SettingsState extends SettingsShape {
  setDefaultReminderMinutes: (minutes: number) => void;
  setUnits: (units: Units) => void;
  setRetentionDays: (days: number) => void;
  setThemePref: (theme: ThemePref) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...readSync(),
  setDefaultReminderMinutes: (defaultReminderMinutes) => {
    set({ defaultReminderMinutes });
    persist({ ...stripActions(get()), defaultReminderMinutes });
  },
  setUnits: (units) => {
    set({ units });
    persist({ ...stripActions(get()), units });
  },
  setRetentionDays: (retentionDays) => {
    set({ retentionDays });
    persist({ ...stripActions(get()), retentionDays });
  },
  setThemePref: (themePref) => {
    set({ themePref });
    persist({ ...stripActions(get()), themePref });
  },
}));

function stripActions(state: SettingsState): SettingsShape {
  return {
    defaultReminderMinutes: state.defaultReminderMinutes,
    units: state.units,
    retentionDays: state.retentionDays,
    themePref: state.themePref,
  };
}
