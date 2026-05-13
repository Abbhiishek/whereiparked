import { create } from 'zustand';

import { getJsonPreference, setJsonPreference } from '@/lib/preferences';

const STORAGE_KEY = 'onboarding';

interface OnboardingShape {
  hasCompletedOnboarding: boolean;
  hasGrantedLocation: boolean;
  hasGrantedNotifications: boolean;
}

const defaults: OnboardingShape = {
  hasCompletedOnboarding: false,
  hasGrantedLocation: false,
  hasGrantedNotifications: false,
};

function readSync(): OnboardingShape {
  return getJsonPreference<OnboardingShape>(STORAGE_KEY, defaults);
}

function persist(state: OnboardingShape): void {
  setJsonPreference(STORAGE_KEY, state);
}

interface OnboardingState extends OnboardingShape {
  setCompleted: (value: boolean) => void;
  setLocationGranted: (value: boolean) => void;
  setNotificationsGranted: (value: boolean) => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...readSync(),
  setCompleted: (hasCompletedOnboarding) => {
    set({ hasCompletedOnboarding });
    persist({ ...stripActions(get()), hasCompletedOnboarding });
  },
  setLocationGranted: (hasGrantedLocation) => {
    set({ hasGrantedLocation });
    persist({ ...stripActions(get()), hasGrantedLocation });
  },
  setNotificationsGranted: (hasGrantedNotifications) => {
    set({ hasGrantedNotifications });
    persist({ ...stripActions(get()), hasGrantedNotifications });
  },
}));

function stripActions(state: OnboardingState): OnboardingShape {
  return {
    hasCompletedOnboarding: state.hasCompletedOnboarding,
    hasGrantedLocation: state.hasGrantedLocation,
    hasGrantedNotifications: state.hasGrantedNotifications,
  };
}
