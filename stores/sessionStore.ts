import { create } from 'zustand';

import type { SessionDraft } from '@/types/session';

interface SessionState {
  activeSessionId: string | null;
  draft: SessionDraft | null;
  setActiveSessionId: (id: string | null) => void;
  setDraft: (draft: SessionDraft | null) => void;
  patchDraft: (patch: Partial<SessionDraft>) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSessionId: null,
  draft: null,
  setActiveSessionId: (id) => set({ activeSessionId: id }),
  setDraft: (draft) => set({ draft }),
  patchDraft: (patch) => {
    const current = get().draft;
    if (!current) return;
    set({ draft: { ...current, ...patch } });
  },
}));
