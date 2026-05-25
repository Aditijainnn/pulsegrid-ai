export const colors = {
  bgPrimary: "#050816",
  bgSecondary: "#0B1020",
  card: "rgba(15,20,35,0.72)",
  textPrimary: "#EAF1FF",
  textSecondary: "#94A3B8",
  accentBlue: "#5B8CFF",
  accentGreen: "#00D2A8",
  accentRed: "#FF5C7A",
  border: "rgba(255,255,255,0.08)",
} as const;

export const severityColor = {
  low: colors.accentGreen,
  medium: "#FFC857",
  high: "#FF9B5A",
  critical: colors.accentRed,
} as const;