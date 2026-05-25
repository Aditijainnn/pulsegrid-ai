import { motion } from "framer-motion";

export function ConfidenceMeter({ value }: { value: number }) {
  const radius = 56;
  const c = 2 * Math.PI * radius;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex items-center gap-5 rounded-2xl glass p-5">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="10"
            fill="none"
          />
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            stroke="url(#cgrad)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="cgrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5B8CFF" />
              <stop offset="100%" stopColor="#00D2A8" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-3xl font-semibold tabular-nums">{value}%</div>
        </div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-[var(--color-muted-foreground)]">
          Optimization confidence
        </div>
        <div className="mt-1 max-w-xs text-sm text-[var(--color-foreground)]/80">
          Atomity PulseGrid AI is highly confident these recommendations will not
          impact production SLOs.
        </div>
      </div>
    </div>
  );
}