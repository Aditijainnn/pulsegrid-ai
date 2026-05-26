import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  CloudLightning,
  Command,
  Cpu,
  Download,
  Gauge,
  LayoutDashboard,
  Pause,
  Play,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { NetworkGraph } from "@/components/NetworkGraph";
import { useAlerts } from "@/hooks/useAlerts";
import { useInfraData } from "@/hooks/useInfraData";
import { useSavings } from "@/hooks/useSavings";
import { useAppStore } from "@/store/useAppStore";
import { severityColor } from "@/tokens/colors";
import type { Alert, Severity, WorkloadNode } from "@/types/infra";

export const Route = createFileRoute("/")({
  component: Index,
});

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "incidents", label: "Incidents", icon: Bell },
  { id: "topology", label: "Topology", icon: CloudLightning },
  { id: "savings", label: "Savings", icon: CircleDollarSign },
] as const;

type NavId = (typeof navItems)[number]["id"];
type SeverityFilter = "all" | Severity;

function Index() {
  const { alerts, isLoading: alertsLoading, isError: alertsError, refetch } =
    useAlerts();
  const { data: infra, isLoading: infraLoading, refetch: refetchInfra } =
    useInfraData();
  const { data: savings, refetch: refetchSavings } = useSavings();
  const bumpTick = useAppStore((s) => s.bumpTick);
  const startScan = useAppStore((s) => s.startScan);
  const scanning = useAppStore((s) => s.scanning);
  const injectAlert = useAppStore((s) => s.injectAlert);
  const dismissAlert = useAppStore((s) => s.dismissAlert);
  const savingsHistory = useAppStore((s) => s.savingsHistory);

  const [activeNav, setActiveNav] = useState<NavId>("overview");
  const [liveMode, setLiveMode] = useState(true);
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] =
    useState<SeverityFilter>("all");
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [exportedAt, setExportedAt] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!liveMode) return;
    const id = window.setInterval(() => bumpTick(), 5000);
    return () => window.clearInterval(id);
  }, [bumpTick, liveMode]);

  useEffect(() => {
    if (!liveMode) return;
    const id = window.setInterval(() => injectAlert(), 8000);
    return () => window.clearInterval(id);
  }, [injectAlert, liveMode]);

  const liveAlerts = hydrated ? alerts : [];
  const liveSavings = hydrated ? savings : undefined;
  const liveHistory = hydrated ? savingsHistory : [];
  const nodes = hydrated ? (infra?.nodes ?? []) : [];
  const criticalNodes = nodes.filter((node) => node.status === "critical");
  const avgCpu = average(nodes.map((node) => node.cpuUsage));
  const avgMem = average(nodes.map((node) => node.memoryUsage));
  const openSavings = liveAlerts
    .filter((alert) => !appliedIds.includes(alert.id))
    .reduce((total, alert) => total + alert.savings, 0);

  const filteredAlerts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return liveAlerts.filter((alert) => {
      const matchesSeverity =
        severityFilter === "all" || alert.severity === severityFilter;
      const matchesQuery =
        !needle ||
        `${alert.title} ${alert.service} ${alert.recommendation}`
          .toLowerCase()
          .includes(needle);
      return matchesSeverity && matchesQuery;
    });
  }, [liveAlerts, query, severityFilter]);

  const chartData = useMemo(() => {
    if (!hydrated) return [];
    const source = liveHistory.length
      ? liveHistory
      : [{ t: 0, v: liveSavings?.monthlySavings ?? 0 }];
    return source.slice(-12).map((point) => ({
      time: new Date(point.t).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      savings: point.v,
    }));
  }, [hydrated, liveSavings?.monthlySavings, liveHistory]);

  const handleScan = () => {
    startScan();
    refetch();
    refetchInfra();
    refetchSavings();
  };

  const handleExport = () => {
    const report = {
      exportedAt: new Date().toISOString(),
      monthlySavings: liveSavings?.monthlySavings ?? 0,
      projectedAnnual: liveSavings?.projectedAnnual ?? 0,
      optimizationConfidence: liveSavings?.optimizationConfidence ?? 0,
      alerts: filteredAlerts,
      nodes,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pulsegrid-report.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setExportedAt(Date.now());
  };

  const applyAlert = (alert: Alert) => {
    setAppliedIds((ids) => Array.from(new Set([...ids, alert.id])));
  };

  const jumpTo = (target: NavId) => {
    setActiveNav(target);
    const id = target === "overview" ? "dashboard-overview" : target;
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-[#1f2024] text-[#f6f7fb]">
      <div className="stitch-shell">
        <aside className="stitch-sidebar">
          <div className="flex items-center gap-3 px-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#8ab4f8] text-[#121316]">
              <Command className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">PulseGrid AI</div>
              <div className="text-xs text-[#aeb4c1]">Control plane</div>
            </div>
          </div>

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => jumpTo(item.id)}
                  className={`stitch-nav-item ${active ? "is-active" : ""}`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[28px] border border-white/10 bg-[#292b31] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-[#aeb4c1]">
                Live stream
              </span>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  liveMode ? "bg-[#81c995]" : "bg-[#fdd663]"
                }`}
              />
            </div>
            <button
              onClick={() => setLiveMode((value) => !value)}
              className="stitch-soft-button w-full justify-center"
            >
              {liveMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {liveMode ? "Pause updates" : "Resume updates"}
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="stitch-topbar">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#aeb4c1]">
                <span>Workspace</span>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Atomity production</span>
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal">
                Infrastructure intelligence
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="stitch-search">
                <Search className="h-4 w-4 text-[#aeb4c1]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search services"
                />
                {query && (
                  <button aria-label="Clear search" onClick={() => setQuery("")}>
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                className="stitch-icon-button"
                onClick={handleExport}
                aria-label="Export report"
              >
                <Download className="h-5 w-5" />
              </button>
              <button className="stitch-primary-button" onClick={handleScan}>
                <RefreshCw
                  className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`}
                />
                {scanning ? "Scanning" : "Run scan"}
              </button>
            </div>
          </header>

          <main className="stitch-main">
            <section className="stitch-hero-panel" id="dashboard-overview">
              <div>
                <div className="stitch-eyebrow">
                  <Sparkles className="h-4 w-4" />
                  AI optimization engine
                </div>
                <h2 className="mt-4 max-w-3xl text-[44px] font-semibold leading-[1.04] tracking-normal max-md:text-3xl">
                  Detect waste, prioritize risk, and apply fixes in real time.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#c8ceda]">
                  PulseGrid AI watches Kubernetes services, traffic, storage,
                  and GPU pools, then turns infrastructure drift into
                  actionable savings.
                </p>
              </div>
              <div className="stitch-status-stack">
                <StatusPill
                  label={liveMode ? "Live polling" : "Polling paused"}
                  tone={liveMode ? "green" : "amber"}
                />
                <StatusPill
                  label={`${liveAlerts.length} active insights`}
                  tone={liveAlerts.length > 0 ? "blue" : "green"}
                />
                <StatusPill
                  label={`${criticalNodes.length} critical nodes`}
                  tone={criticalNodes.length > 0 ? "red" : "green"}
                />
              </div>
            </section>

            <section className="stitch-metrics-grid">
              <MetricCard
                icon={CircleDollarSign}
                label="Monthly savings"
                value={`$${(liveSavings?.monthlySavings ?? 0).toLocaleString()}`}
                detail={`$${(liveSavings?.projectedAnnual ?? 0).toLocaleString()} annualized`}
                tone="green"
              />
              <MetricCard
                icon={ShieldCheck}
                label="Confidence"
                value={`${liveSavings?.optimizationConfidence ?? 0}%`}
                detail="SLO-aware recommendations"
                tone="blue"
              />
              <MetricCard
                icon={Cpu}
                label="Average CPU"
                value={`${avgCpu}%`}
                detail={`${avgMem}% avg memory`}
                tone="amber"
              />
              <MetricCard
                icon={AlertTriangle}
                label="Open exposure"
                value={`$${openSavings.toLocaleString()}`}
                detail={`${appliedIds.length} fixes applied`}
                tone="red"
              />
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_420px]">
              <div className="stitch-panel" id="topology">
                <PanelHeader
                  icon={CloudLightning}
                  title="Live topology"
                  action={
                    <span className="text-xs text-[#aeb4c1]">
                      {infraLoading
                        ? "Syncing..."
                        : infra
                          ? new Date(infra.scannedAt).toLocaleTimeString()
                          : "Waiting"}
                    </span>
                  }
                />
                <div className="mt-4 overflow-hidden rounded-[28px] border border-white/10">
                  <NetworkGraph />
                </div>
              </div>

              <div className="stitch-panel" id="savings">
                <PanelHeader
                  icon={BarChart3}
                  title="Savings trend"
                  action={
                    exportedAt ? (
                      <span className="text-xs text-[#81c995]">Exported</span>
                    ) : null
                  }
                />
                <div className="mt-5 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="savingsArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#81c995" stopOpacity={0.55} />
                          <stop offset="95%" stopColor="#81c995" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: "#aeb4c1", fontSize: 11 }} />
                      <YAxis hide domain={["dataMin - 200", "dataMax + 300"]} />
                      <Tooltip
                        contentStyle={{
                          background: "#292b31",
                          border: "1px solid rgba(255,255,255,.12)",
                          borderRadius: 18,
                          color: "#f6f7fb",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="savings"
                        stroke="#81c995"
                        strokeWidth={3}
                        fill="url(#savingsArea)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <NodeList nodes={nodes} />
              </div>
            </section>

            <section className="stitch-panel" id="incidents">
              <PanelHeader
                icon={Bell}
                title="Optimization queue"
                action={
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSeverityFilter("all")}
                      className={`stitch-filter ${severityFilter === "all" ? "is-active" : ""}`}
                    >
                      All
                    </button>
                    {(["critical", "high", "medium", "low"] as Severity[]).map(
                      (severity) => (
                        <button
                          key={severity}
                          onClick={() => setSeverityFilter(severity)}
                          className={`stitch-filter ${
                            severityFilter === severity ? "is-active" : ""
                          }`}
                        >
                          {severity}
                        </button>
                      ),
                    )}
                    <SlidersHorizontal className="h-4 w-4 text-[#aeb4c1]" />
                  </div>
                }
              />

              {alertsError && (
                <div className="mt-4 rounded-[24px] border border-[#f28b82]/30 bg-[#f28b82]/10 p-4 text-sm text-[#f6aea9]">
                  Insights could not be refreshed.
                  <button onClick={() => refetch()} className="ml-2 underline">
                    Retry
                  </button>
                </div>
              )}

              <div className="mt-4 overflow-hidden rounded-[28px] border border-white/10">
                <div className="stitch-table-row stitch-table-head">
                  <span>Service</span>
                  <span>Severity</span>
                  <span>Savings</span>
                  <span>Confidence</span>
                  <span>Action</span>
                </div>
                {alertsLoading && liveAlerts.length === 0 && (
                  <div className="p-6 text-sm text-[#aeb4c1]">
                    Loading live insights...
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {filteredAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      className="stitch-table-row"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: severityColor[alert.severity] }}
                          />
                          <span className="truncate font-medium">{alert.title}</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-[#aeb4c1]">
                          {alert.service} · {alert.recommendation}
                        </p>
                      </div>
                      <span className="capitalize">{alert.severity}</span>
                      <span className="font-medium text-[#81c995]">
                        ${alert.savings.toLocaleString()}/mo
                      </span>
                      <span>{Math.round(alert.confidence * 100)}%</span>
                      <div className="flex items-center gap-2">
                        <button
                          className={`stitch-apply-button ${
                            appliedIds.includes(alert.id) ? "is-done" : ""
                          }`}
                          onClick={() => applyAlert(alert)}
                          disabled={appliedIds.includes(alert.id)}
                        >
                          {appliedIds.includes(alert.id) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                          {appliedIds.includes(alert.id) ? "Applied" : "Apply"}
                        </button>
                        <button
                          aria-label={`Dismiss ${alert.title}`}
                          className="stitch-icon-button small"
                          onClick={() => dismissAlert(alert.id)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {!alertsLoading && filteredAlerts.length === 0 && (
                  <div className="p-6 text-sm text-[#aeb4c1]">
                    No insights match the current filters.
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "blue" | "amber" | "red";
}) {
  return (
    <span className={`stitch-status-pill tone-${tone}`}>
      <span />
      {label}
    </span>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
  tone: "green" | "blue" | "amber" | "red";
}) {
  return (
    <div className={`stitch-metric-card tone-${tone}`}>
      <div className="flex items-start justify-between">
        <div className="stitch-metric-icon">
          <Icon className="h-5 w-5" />
        </div>
        <Gauge className="h-4 w-4 text-[#aeb4c1]" />
      </div>
      <div className="mt-6 text-sm text-[#aeb4c1]">{label}</div>
      <div className="mt-1 text-3xl font-semibold tracking-normal">{value}</div>
      <div className="mt-2 text-xs text-[#aeb4c1]">{detail}</div>
    </div>
  );
}

function PanelHeader({
  icon: Icon,
  title,
  action,
}: {
  icon: typeof Activity;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.06] text-[#8ab4f8]">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function NodeList({ nodes }: { nodes: WorkloadNode[] }) {
  return (
    <div className="mt-6 space-y-2">
      {nodes.slice(0, 5).map((node) => (
        <div key={node.id} className="stitch-node-row">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white/[0.06]">
              <Server className="h-4 w-4 text-[#8ab4f8]" />
            </div>
            <div>
              <div className="text-sm font-medium">{node.label}</div>
              <div className="text-xs capitalize text-[#aeb4c1]">{node.type}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`stitch-node-status ${node.status}`} />
            <span className="text-xs tabular-nums text-[#aeb4c1]">
              {node.cpuUsage}% CPU
            </span>
          </div>
        </div>
      ))}
      {nodes.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-[#aeb4c1]">
          <CheckCircle2 className="h-4 w-4" />
          Waiting for topology data
        </div>
      )}
    </div>
  );
}
