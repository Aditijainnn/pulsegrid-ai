import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GridBackground } from "@/components/GridBackground";
import { FloatingParticles } from "@/components/FloatingParticles";
import { Hero } from "@/components/Hero";
import { NetworkGraph } from "@/components/NetworkGraph";
import {
  InsightCard,
  InsightCardSkeleton,
} from "@/components/InsightCard";
import { SavingsCounter } from "@/components/SavingsCounter";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { Timeline } from "@/components/Timeline";
import { GlowButton } from "@/components/GlowButton";
import { useAlerts } from "@/hooks/useAlerts";
import { useSavings } from "@/hooks/useSavings";
import { useAppStore } from "@/store/useAppStore";
import { Activity, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { alerts, isLoading: alertsLoading, isError: alertsError, refetch } =
    useAlerts();
  const { data: savings } = useSavings();
  const bumpTick = useAppStore((s) => s.bumpTick);
  const scanning = useAppStore((s) => s.scanning);
  const injectAlert = useAppStore((s) => s.injectAlert);

  // Heartbeat: simulate continuous "real-time" stream every 5s.
  useEffect(() => {
    const id = window.setInterval(() => bumpTick(), 5000);
    return () => window.clearInterval(id);
  }, [bumpTick]);

  // Synthetic incident stream — new alert slides in every 8s.
  useEffect(() => {
    const id = window.setInterval(() => injectAlert(), 8000);
    return () => window.clearInterval(id);
  }, [injectAlert]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GridBackground />
      <FloatingParticles />

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-white/5 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]">
              <Activity className="h-4 w-4" />
            </div>
            <div className="text-sm font-semibold tracking-tight">
              Atomity PulseGrid<span className="text-[var(--color-muted-foreground)]"> · AI</span>
            </div>
          </div>
          <nav className="hidden gap-6 text-xs text-[var(--color-muted-foreground)] md:flex">
            <a href="#scan" className="hover:text-white">Live Scan</a>
            <a href="#savings" className="hover:text-white">Savings</a>
            <a href="#confidence" className="hover:text-white">Confidence</a>
          </nav>
          <a
            href="#scan"
            className="text-xs text-[var(--color-muted-foreground)] hover:text-white"
          >
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${scanning ? "bg-[var(--accent-blue)]" : "bg-[var(--accent-green)]"} node-pulse`} />
              {scanning ? "Scanning…" : "Live"}
            </span>
          </a>
        </div>
      </header>

      <main>
        <Hero />

        {/* Live scan section */}
        <section id="scan" className="relative px-6 pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--accent-blue)]">
                  Live Scan
                </div>
                <h2
                  className="mt-2 font-semibold tracking-tight"
                  style={{
                    fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Real-time infrastructure intelligence
                </h2>
                <p className="mt-2 max-w-xl text-sm text-[var(--color-muted-foreground)]">
                  Atomity PulseGrid AI continuously polls workloads, traces traffic
                  flows, and surfaces cost leaks the moment they appear.
                </p>
              </div>
              <GlowButton variant="ghost" onClick={() => bumpTick()}>
                Trigger rescan <ArrowRight className="h-4 w-4" />
              </GlowButton>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
              <NetworkGraph />

              <div className="space-y-4">
                {alertsLoading && alerts.length === 0 && (
                  <>
                    <InsightCardSkeleton />
                    <InsightCardSkeleton />
                    <InsightCardSkeleton />
                  </>
                )}
                {alertsError && (
                  <div className="rounded-2xl glass p-5 text-sm">
                    <div className="text-[var(--accent-red)]">
                      We hit a snag fetching insights.
                    </div>
                    <button
                      onClick={() => refetch()}
                      className="mt-3 rounded-md border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
                    >
                      Retry
                    </button>
                  </div>
                )}
                <AnimatePresence mode="popLayout" initial={false}>
                  {alerts.slice(0, 4).map((a, i) => (
                    <InsightCard key={a.id} alert={a} index={i} />
                  ))}
                </AnimatePresence>
                {!alertsLoading && alerts.length === 0 && !alertsError && (
                  <div className="rounded-2xl glass p-6 text-sm text-[var(--color-muted-foreground)]">
                    All workloads optimized. Nothing to flag right now.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Savings */}
        <section id="savings" className="px-6 pb-24">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <SavingsCounter value={savings?.monthlySavings ?? 0} />
            </motion.div>
            <div className="mt-4 text-center text-xs text-[var(--color-muted-foreground)]">
              Projected annual savings:{" "}
              <span className="text-[var(--accent-green)] tabular-nums">
                ${((savings?.projectedAnnual ?? 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        {/* Confidence + timeline */}
        <section id="confidence" className="px-6 pb-32">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1fr]">
            <ConfidenceMeter value={savings?.optimizationConfidence ?? 0} />
            <Timeline />
          </div>

          <div className="mx-auto mt-16 max-w-3xl rounded-3xl glass p-8 text-center">
            <h3
              className="font-semibold tracking-tight"
              style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", letterSpacing: "-0.02em" }}
            >
              Stop paying for idle compute.
            </h3>
            <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
              Plug Atomity PulseGrid AI into your Kubernetes control plane and start
              recovering budget in minutes.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <GlowButton onClick={() => bumpTick()}>
                Run another scan <ArrowRight className="h-4 w-4" />
              </GlowButton>
              <a
                href="#scan"
                className="text-xs text-[var(--color-muted-foreground)] hover:text-white"
              >
                Back to live view
              </a>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5 px-6 py-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-muted-foreground)]">
            <span>Atomity PulseGrid AI · Kubernetes cost intelligence</span>
            <span>© {new Date().getFullYear()} AJ</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
