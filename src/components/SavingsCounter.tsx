import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";

export function SavingsCounter({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());
  const [pulseKey, setPulseKey] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    if (value !== prev.current) {
      prev.current = value;
      setPulseKey((k) => k + 1);
    }
    const controls = animate(mv, value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [value, mv]);

  return (
    <div className="relative overflow-hidden rounded-3xl glass p-8 md:p-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 30%, rgba(0,210,168,0.14), transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(91,140,255,0.10), transparent 60%)",
        }}
      />
      <div className="relative flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[var(--color-muted-foreground)]">
          <TrendingUp className="h-3.5 w-3.5 text-[var(--accent-green)]" />
          Potential monthly savings
        </div>
        <div
          key={pulseKey}
          className="mt-6 font-semibold tabular-nums tracking-tight savings-pulse"
          style={{
            fontSize: "clamp(2.5rem, 9vw, 7rem)",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            textShadow: "0 0 40px rgba(0,210,168,0.25)",
          }}
        >
          <span style={{ color: "var(--accent-green)" }}>$</span>
          <motion.span>{rounded}</motion.span>
          <span className="text-[var(--color-muted-foreground)] text-2xl ml-2">
            /mo
          </span>
        </div>
        <p className="mt-4 max-w-md text-sm text-[var(--color-muted-foreground)]">
          Aggregated across detected idle workloads, overprovisioned clusters,
          and cold storage. Updates every 5s.
        </p>
      </div>
    </div>
  );
}
