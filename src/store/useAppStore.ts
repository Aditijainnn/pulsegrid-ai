import { create } from "zustand";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import type { Alert } from "@/types/infra";

interface AppState {
  tick: number;
  scanning: boolean;
  alerts: Alert[];
  dismissedIds: string[];
  savingsHistory: { t: number; v: number }[];
  startScan: () => void;
  bumpTick: () => void;
  mergeAlerts: (incoming: Alert[]) => void;
  injectAlert: () => void;
  dismissAlert: (id: string) => void;
  pushSavings: (v: number) => void;
}

const SYNTH_TEMPLATES = [
  { title: "Traffic anomaly detected", service: "Edge Worker", type: "api", base: 320, rec: "Throttle abusive client IPs at edge." },
  { title: "Idle GPU spike", service: "Inference Service", type: "gpu", base: 1420, rec: "Scale GPU replicas to zero between batches." },
  { title: "Memory leak suspected", service: "Compute Pod EU-1", type: "compute", base: 480, rec: "Restart pod and add memory limit guard." },
  { title: "Cold storage churn", service: "Object Storage", type: "storage", base: 210, rec: "Move rarely accessed objects to archive tier." },
  { title: "Query pool saturated", service: "Vector DB", type: "db", base: 540, rec: "Increase pgbouncer pool and add read replica." },
] as const;

const SEVERITIES: Alert["severity"][] = ["medium", "high", "critical"];

export const useAppStore = create<AppState>((set, get) => ({
  tick: 0,
  scanning: false,
  alerts: storage.get<Alert[]>(STORAGE_KEYS.alerts, []),
  dismissedIds: storage.get<string[]>(STORAGE_KEYS.dismissed, []),
  savingsHistory: storage.get<{ t: number; v: number }[]>(
    STORAGE_KEYS.savingsHistory,
    [],
  ),

  startScan: () => {
    set({ scanning: true, tick: get().tick + 1 });
    window.setTimeout(() => set({ scanning: false }), 2400);
  },
  bumpTick: () => set({ tick: get().tick + 1 }),

  mergeAlerts: (incoming) => {
    const existing = get().alerts;
    const byKey = new Map<string, Alert>();
    for (const a of existing) byKey.set(a.service + ":" + a.title, a);
    for (const a of incoming) byKey.set(a.service + ":" + a.title, { ...a });
    const next = Array.from(byKey.values()).slice(-20);
    storage.set(STORAGE_KEYS.alerts, next);
    set({ alerts: next });
  },

  injectAlert: () => {
    const tpl = SYNTH_TEMPLATES[Math.floor(Math.random() * SYNTH_TEMPLATES.length)];
    const sev = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
    const drift = Math.round((Math.random() - 0.3) * tpl.base * 0.5);
    const synthetic: Alert = {
      id: `synth-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: tpl.title,
      description: `Detected on ${tpl.service} · ${Math.round(8 + Math.random() * 40)}% utilization over last 5m.`,
      service: tpl.service,
      severity: sev,
      savings: Math.max(80, tpl.base + drift),
      recommendation: tpl.rec,
      confidence: 0.72 + Math.random() * 0.25,
      createdAt: Date.now(),
    };
    const next = [synthetic, ...get().alerts].slice(0, 24);
    storage.set(STORAGE_KEYS.alerts, next);
    set({ alerts: next });
  },

  dismissAlert: (id) => {
    const next = Array.from(new Set([...get().dismissedIds, id]));
    storage.set(STORAGE_KEYS.dismissed, next);
    set({ dismissedIds: next });
  },

  pushSavings: (v) => {
    const hist = [...get().savingsHistory, { t: Date.now(), v }].slice(-60);
    storage.set(STORAGE_KEYS.savingsHistory, hist);
    set({ savingsHistory: hist });
  },
}));
