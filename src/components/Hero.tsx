import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { GlowButton } from "./GlowButton";
import { useAppStore } from "@/store/useAppStore";

export function Hero() {
  const startScan = useAppStore((s) => s.startScan);
  return (
    <section className="relative px-5 pt-20 pb-16 sm:px-6 md:pt-36 md:pb-28">
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-[var(--color-muted-foreground)]"
        >
          <Sparkles className="h-3.5 w-3.5 text-[var(--accent-blue)]" />
          <span>Atomity PulseGrid AI · Live Kubernetes intelligence</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="text-balance font-semibold tracking-tight"
          style={{
            fontSize: "clamp(2.4rem, 6vw, 5rem)",
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
          }}
        >
          Detect cloud waste{" "}
          <span
            style={{
              background:
                "linear-gradient(90deg, #EAF1FF 0%, #5B8CFF 55%, #00D2A8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            before it burns cash.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 max-w-2xl text-balance text-base md:text-lg text-[var(--color-muted-foreground)]"
        >
          AI powered Kubernetes optimization with real-time infrastructure
          intelligence. Surface idle workloads, leaky pipelines, and
          overprovisioned clusters in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <GlowButton
            onClick={() => {
              startScan();
              const el = document.getElementById("scan");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            Start AI Scan <ArrowRight className="h-4 w-4" />
          </GlowButton>
          <a
            href="#scan"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-[var(--color-muted-foreground)] hover:text-white hover:bg-white/5 transition-colors"
          >
            <ShieldCheck className="h-4 w-4" />
            View live infrastructure
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 grid w-full max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] text-left"
        >
          {[
            { k: "Clusters", v: "128" },
            { k: "Avg. Waste Found", v: "31%" },
            { k: "Mean Time to Insight", v: "2.4s" },
          ].map((s) => (
            <div key={s.k} className="bg-[var(--bg-secondary)]/60 px-5 py-4">
              <div className="text-xs uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {s.k}
              </div>
              <div className="mt-1 text-xl font-semibold">{s.v}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
