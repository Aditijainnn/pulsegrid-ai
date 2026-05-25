import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  children: ReactNode;
}

export function GlowButton({
  children,
  variant = "primary",
  className = "",
  ...rest
}: Props) {
  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "text-[#050816] bg-[var(--accent-blue)] hover:brightness-110"
      : "text-[var(--color-foreground)] border border-[var(--color-border)] hover:bg-white/5";
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${styles} ${className}`}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {variant === "primary" && (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full"
          style={{
            boxShadow: "0 0 24px rgba(91,140,255,0.4)",
          }}
        />
      )}
      {children}
    </motion.button>
  );
}