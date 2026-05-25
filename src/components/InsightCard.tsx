import { motion } from "framer-motion";
import { AlertTriangle, ArrowUpRight, X } from "lucide-react";
import type { Alert } from "@/types/infra";
import { severityColor } from "@/tokens/colors";
import { useAppStore } from "@/store/useAppStore";

export function InsightCard({ alert, index }: { alert: Alert; index: number }) {
  const dismiss = useAppStore((s) => s.dismissAlert);
  const color = severityColor[alert.severity];
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: -18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.28 } }}
      transition={{ duration: 0.45, delay: index * 0.04, type: "spring", stiffness: 220, damping: 26 }}
      whileHover={{ y: -2, rotateX: 1.5, rotateY: -1.5 }}
      className="group relative overflow-hidden rounded-2xl glass p-5"
      style={{
        transformStyle: "preserve-3d",
        background: `linear-gradient(180deg, color-mix(in srgb, ${color} 5%, transparent), rgba(255,255,255,0.015)), color-mix(in srgb, var(--bg-secondary) 70%, transparent)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 30px -20px ${color}66`,
      }}
    >
      <span
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}cc, transparent)`,
        }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="grid h-9 w-9 place-items-center rounded-lg"
            style={{
              background: `color-mix(in srgb, ${color} 18%, transparent)`,
              color,
            }}
          >
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{alert.title}</h3>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {alert.service}
            </p>
          </div>
        </div>
        <button
          aria-label="Dismiss"
          onClick={() => dismiss(alert.id)}
          className="rounded-md p-1 text-[var(--color-muted-foreground)] hover:bg-white/5 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-3 text-sm text-[var(--color-foreground)]/85">
        {alert.description}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Potential savings
          </div>
          <div
            className="mt-0.5 text-lg font-semibold tabular-nums"
            style={{ color: "var(--accent-green)" }}
          >
            ${alert.savings.toLocaleString()}
            <span className="text-xs text-[var(--color-muted-foreground)]">
              /mo
            </span>
          </div>
        </div>
        <span
          className="rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider"
          style={{
            borderColor: `${color}55`,
            color,
            background: `color-mix(in srgb, ${color} 10%, transparent)`,
          }}
        >
          {alert.severity}
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-[var(--color-muted-foreground)]">
        <span className="font-medium text-[var(--accent-blue)]">AI rec ·</span>{" "}
        {alert.recommendation}
      </div>

      <button className="mt-4 inline-flex items-center gap-1.5 text-xs text-[var(--accent-blue)] hover:text-white">
        Apply optimization <ArrowUpRight className="h-3.5 w-3.5" />
      </button>
    </motion.article>
  );
}

export function InsightCardSkeleton() {
  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-lg bg-white/5" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
          <div className="h-2.5 w-1/3 animate-pulse rounded bg-white/5" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-2.5 w-full animate-pulse rounded bg-white/5" />
        <div className="h-2.5 w-3/4 animate-pulse rounded bg-white/5" />
      </div>
      <div className="mt-5 h-8 w-1/3 animate-pulse rounded bg-white/5" />
    </div>
  );
}
