import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { presetById } from '../data/presets';
import { decodeScenario } from '../lib/share';
import { DEFAULT_CONTAINER, DEFAULT_URL } from './defaults';
import type { ContainerConfig, UrlParams } from './types';

export type LogKind = 'load' | 'src' | 'focus' | 'message' | 'popup' | 'resize' | 'info' | 'warn';

export interface LogEntry {
  id: number;
  at: number;
  kind: LogKind;
  text: string;
  frame?: string;
}

interface LabState {
  url: UrlParams;
  container: ContainerConfig;
  presetId: string | null;
  open: boolean;
  reloadKey: number;
  checks: Record<string, boolean[]>;
  log: LogEntry[];
  setUrl: (patch: Partial<UrlParams>) => void;
  setContainer: (patch: Partial<ContainerConfig>) => void;
  applyPreset: (id: string) => void;
  setOpen: (open: boolean) => void;
  reload: () => void;
  toggleCheck: (presetId: string, index: number) => void;
  resetChecks: (presetId: string) => void;
  addLog: (kind: LogKind, text: string, frame?: string) => void;
  clearLog: () => void;
  resetAll: () => void;
}

const FIRST_PRESET = 'bullhorn-conversation';
let logSeq = 0;
const MAX_LOG = 300;

/** localStorage can throw (private windows, blocked storage). Never let that break the app. */
const safeStorage = createJSONStorage(() => ({
  getItem: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
}));

export const useLab = create<LabState>()(
  persist(
    (set, get) => ({
      url: { ...DEFAULT_URL, ...presetById(FIRST_PRESET)?.url },
      container: { ...DEFAULT_CONTAINER, ...presetById(FIRST_PRESET)?.container },
      presetId: FIRST_PRESET,
      open: true,
      reloadKey: 0,
      checks: {},
      log: [],
      setUrl: (patch) => set((s) => ({ url: { ...s.url, ...patch } })),
      setContainer: (patch) => set((s) => ({ container: { ...s.container, ...patch } })),
      applyPreset: (id) => {
        const preset = presetById(id);
        if (!preset) return;
        const { url } = get();
        set({
          presetId: id,
          open: true,
          // Keep the ids and environment people typed; presets only describe the shape.
          url: {
            ...DEFAULT_URL,
            envId: url.envId,
            customOrigin: url.customOrigin,
            conversationId: url.conversationId,
            phoneNumber: url.phoneNumber,
            textNumberId: url.textNumberId,
            ...preset.url,
          },
          container: { ...DEFAULT_CONTAINER, ...preset.container },
        });
        get().addLog('info', `Preset: ${preset.title}`);
      },
      setOpen: (open) => set({ open }),
      reload: () => set((s) => ({ reloadKey: s.reloadKey + 1 })),
      toggleCheck: (presetId, index) =>
        set((s) => {
          const list = [...(s.checks[presetId] ?? [])];
          list[index] = !list[index];
          return { checks: { ...s.checks, [presetId]: list } };
        }),
      resetChecks: (presetId) =>
        set((s) => ({ checks: { ...s.checks, [presetId]: [] } })),
      addLog: (kind, text, frame) =>
        set((s) => {
          const head = s.log[0];
          // StrictMode runs effects twice in dev; drop identical back-to-back entries.
          if (head && head.kind === kind && head.text === text && head.frame === frame && Date.now() - head.at < 100)
            return s;
          return { log: [{ id: ++logSeq, at: Date.now(), kind, text, frame }, ...s.log].slice(0, MAX_LOG) };
        }),
      clearLog: () => set({ log: [] }),
      resetAll: () =>
        set({ url: DEFAULT_URL, container: DEFAULT_CONTAINER, presetId: null, checks: {}, log: [] }),
    }),
    {
      name: 'tea-embed-lab',
      version: 1,
      storage: safeStorage,
      partialize: (s) => ({
        // Never persist SSO tokens: they are single-use credentials.
        url: { ...s.url, ssoValue: '' },
        container: s.container,
        presetId: s.presetId,
        checks: s.checks,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<LabState>;
        return {
          ...current,
          ...p,
          url: { ...current.url, ...p.url },
          container: { ...current.container, ...p.container },
        };
      },
    },
  ),
);

/** A shared link (#s=…) wins over what is stored locally. */
export function hydrateFromHash() {
  const shared = decodeScenario(location.hash);
  if (!shared) return;
  useLab.setState({
    presetId: shared.presetId ?? null,
    url: { ...DEFAULT_URL, ...shared.url },
    container: { ...DEFAULT_CONTAINER, ...shared.container },
    open: true,
  });
  history.replaceState(null, '', location.pathname + location.search);
  useLab.getState().addLog('info', 'Loaded a shared scenario from the link');
}
