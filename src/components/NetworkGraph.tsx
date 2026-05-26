import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useInfraData } from "@/hooks/useInfraData";
import { ScanBeam } from "./ScanBeam";
import { useAppStore } from "@/store/useAppStore";
import { Cpu, Database, Globe, HardDrive, Server, Zap } from "lucide-react";
import type { NodeType, WorkloadNode } from "@/types/infra";

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  "node-0": { x: 18, y: 24 },
  "node-1": { x: 50, y: 50 },
  "node-2": { x: 82, y: 24 },
  "node-3": { x: 82, y: 74 },
  "node-4": { x: 18, y: 74 },
  "node-5": { x: 50, y: 80 },
  "node-6": { x: 50, y: 18 },
  "node-7": { x: 10, y: 50 },
};

const ICONS: Record<NodeType, typeof Cpu> = {
  gpu: Zap,
  api: Globe,
  compute: Server,
  storage: HardDrive,
  db: Database,
};

function statusColor(s: WorkloadNode["status"]) {
  if (s === "critical") return "#FF5C7A";
  if (s === "warning") return "#FFC857";
  return "#00D2A8";
}

export function NetworkGraph() {
  const { data, isLoading, isError, refetch } = useInfraData();
  const scanning = useAppStore((s) => s.scanning);

  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];

  // Sub-tick drift: shimmer the metrics between fetches so the graph
  // visibly "breathes" every second instead of waiting on the 5s poll.
  const [drift, setDrift] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setDrift((d) => d + 1), 1200);
    return () => window.clearInterval(id);
  }, []);

  const liveNodes = useMemo(
    () =>
      nodes.map((n) => {
        const wobble = Math.sin((drift + n.id.length) * 0.9) * 4;
        const wobble2 = Math.cos((drift + n.id.length) * 0.7) * 3;
        return {
          ...n,
          cpuLive: Math.max(3, Math.min(99, Math.round(n.cpuUsage + wobble))),
          memLive: Math.max(5, Math.min(99, Math.round(n.memoryUsage + wobble2))),
        };
      }),
    [nodes, drift],
  );

  const lines = useMemo(() => {
    return edges
      .map((e) => {
        const a = NODE_POSITIONS[e.from];
        const b = NODE_POSITIONS[e.to];
        if (!a || !b) return null;
        return { ...e, a, b };
      })
      .filter(Boolean) as Array<{
      from: string;
      to: string;
      intensity: number;
      a: { x: number; y: number };
      b: { x: number; y: number };
    }>;
  }, [edges]);

  return (
    <div className="relative h-[340px] w-full overflow-hidden rounded-2xl glass sm:h-[360px] xl:h-[390px]">
      {/* layered backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(91,140,255,0.10), transparent 60%)",
        }}
      />
      <ScanBeam active={scanning} />

      {/* header */}
      <div className="absolute left-4 right-4 top-4 flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent-green)] node-pulse" />
          <span className="uppercase tracking-wider">Live topology</span>
        </div>
        <div className="tabular-nums">
          {data ? new Date(data.scannedAt).toLocaleTimeString() : "—"}
        </div>
      </div>

      {/* SVG layer */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5B8CFF" stopOpacity="0.04" />
            <stop offset="50%" stopColor="#5B8CFF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#00D2A8" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="pulseDot">
            <stop offset="0%" stopColor="#EAF1FF" stopOpacity="1" />
            <stop offset="60%" stopColor="#5B8CFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#5B8CFF" stopOpacity="0" />
          </radialGradient>
        </defs>
        {lines.map((l) => (
          <g key={`${l.from}-${l.to}`}>
            <line
              x1={l.a.x}
              y1={l.a.y}
              x2={l.b.x}
              y2={l.b.y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={0.25}
            />
            <line
              x1={l.a.x}
              y1={l.a.y}
              x2={l.b.x}
              y2={l.b.y}
              stroke="url(#edge)"
              strokeWidth={Math.max(0.35, l.intensity * 0.6)}
              className="flow-line"
              vectorEffect="non-scaling-stroke"
            />
            {/* Traveling traffic pulse */}
            <circle r={Math.max(0.6, l.intensity * 1.1)} fill="url(#pulseDot)">
              <animate
                attributeName="cx"
                values={`${l.a.x};${l.b.x}`}
                dur={`${2.6 - l.intensity * 1.2}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${l.a.y};${l.b.y}`}
                dur={`${2.6 - l.intensity * 1.2}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur={`${2.6 - l.intensity * 1.2}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}
      </svg>

      {/* nodes */}
      {liveNodes.map((n) => {
        const pos = NODE_POSITIONS[n.id];
        if (!pos) return null;
        const Icon = ICONS[n.type];
        const color = statusColor(n.status);
        return (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full node-pulse"
                style={{
                  boxShadow: `0 0 20px ${color}cc`,
                  background: `radial-gradient(circle, ${color}44, transparent 70%)`,
                }}
              />
              <div
                className="relative grid h-11 w-11 place-items-center rounded-full border"
                style={{
                  background: "rgba(10,14,28,0.85)",
                  borderColor: `${color}77`,
                }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
                <span
                  className="status-blink absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
                  style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                />
              </div>
              {/* Always-visible live CPU readout */}
              <div
                className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[var(--bg-secondary)]/80 px-1.5 py-0.5 text-[9px] font-medium tabular-nums"
                style={{ color }}
              >
                {n.cpuLive}%
              </div>
            </div>
            <div className="pointer-events-none absolute left-1/2 top-full mt-7 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[var(--bg-secondary)]/95 px-2 py-1 text-[10px] text-[var(--color-foreground)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-10">
              <div className="font-medium">{n.label}</div>
              <div className="text-[var(--color-muted-foreground)]">
                CPU {n.cpuLive}% · MEM {n.memLive}% · ↓{n.trafficIn}kb/s
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* states */}
      {isLoading && !data && (
        <div className="absolute inset-0 grid place-items-center text-xs text-[var(--color-muted-foreground)]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-ping rounded-full bg-[var(--accent-blue)]" />
            Initializing topology…
          </div>
        </div>
      )}
      {isError && (
        <div className="absolute inset-0 grid place-items-center text-xs">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
            <div className="mb-2 text-[var(--accent-red)]">
              Could not reach control plane
            </div>
            <button
              onClick={() => refetch()}
              className="rounded-md border border-white/10 px-3 py-1.5 text-[var(--color-foreground)] hover:bg-white/5"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
