import { motion } from "framer-motion";
import { Activity, ShieldAlert, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function Timeline() {
  const alerts = useAppStore((s) => s.alerts).slice(-6).reverse();
  const scans = useAppStore((s) => s.savingsHistory).slice(-6).reverse();

  const items = [
    ...alerts.map((a) => ({
      id: "a-" + a.id,
      at: a.createdAt,
      kind: "incident" as const,
      label: `${a.title} — ${a.service}`,
    })),
    ...scans.map((s, i) => ({
      id: "s-" + i + "-" + s.t,
      at: s.t,
      kind: "scan" as const,
      label: `Scan completed · $${s.v.toLocaleString()}/mo identified`,
    })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 8);

  return (
    <div className="rounded-2xl glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Activity</h3>
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
          last 24h
        </span>
      </div>
      <ol className="relative space-y-3 border-l border-white/10 pl-4">
        {items.length === 0 && (
          <li className="text-xs text-[var(--color-muted-foreground)]">
            Waiting for first scan…
          </li>
        )}
        {items.map((it, i) => {
          const Icon =
            it.kind === "incident"
              ? ShieldAlert
              : it.kind === "scan"
                ? Activity
                : Sparkles;
          const color =
            it.kind === "incident" ? "#FF9B5A" : "var(--accent-blue)";
          return (
            <motion.li
              key={it.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="relative"
            >
              <span
                className="absolute -left-[21px] top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full"
                style={{
                  background: "var(--bg-secondary)",
                  boxShadow: `0 0 0 2px ${color}55`,
                }}
              >
                <Icon className="h-2 w-2" style={{ color }} />
              </span>
              <div className="text-xs text-[var(--color-foreground)]/85">
                {it.label}
              </div>
              <div className="text-[10px] text-[var(--color-muted-foreground)]">
                {new Date(it.at).toLocaleTimeString()}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}