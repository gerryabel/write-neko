export type Theme = "dark" | "light";

const dark: Record<string, string> = {
  bg: "#050508",
  surface: "#0c0c14",
  elevated: "#09090e",
  sidebar: "#06060b",
  textPrimary: "#e5e5e5",
  textSecondary: "#c8c8d0",
  textMuted: "#6e6e7a",
  border: "rgba(255,255,255,0.10)",
  borderSubtle: "rgba(255,255,255,0.07)",
  inputBg: "#09090e",
  cardBg: "#0c0c14",
  buttonGhost: "#0f0f15",
};

const light: Record<string, string> = {
  bg: "#f8fafc",
  surface: "#ffffff",
  elevated: "#f1f5f9",
  sidebar: "#ffffff",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  border: "#e2e8f0",
  borderSubtle: "#f1f5f9",
  inputBg: "#ffffff",
  cardBg: "#ffffff",
  buttonGhost: "#f1f5f9",
};

export const palette = (theme: Theme) => (theme === "dark" ? dark : light);
