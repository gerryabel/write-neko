import { useState } from "react";

export const themeVars = {
  bg: "var(--background)",
  foreground: "var(--foreground)",
  surface: "var(--surface)",
  elevated: "var(--elevated)",
  sidebar: "var(--sidebar)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  border: "var(--border)",
  borderSubtle: "var(--border-subtle)",
  inputBg: "var(--input-bg)",
  cardBg: "var(--card-bg)",
  buttonGhost: "var(--button-ghost)",
  disabledBg: "var(--disabled-bg)",
} as const;

export const card: React.CSSProperties = {
  background: "var(--card-bg)",
  padding: 16,
  borderRadius: 14,
  border: "1px solid var(--border-subtle)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
};

export const inputStyle: React.CSSProperties = {
  background: "var(--input-bg)",
  color: "var(--text-primary)",
  border: "1px solid var(--border)",
  padding: "0.6rem 0.75rem",
  borderRadius: 10,
  outline: "none",
  fontSize: 14,
};

export const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none",
  backgroundImage:
    "linear-gradient(45deg, transparent 48%, var(--text-muted) 49%, var(--text-muted) 51%, transparent 52%)",
  backgroundSize: "10px 10px",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 36,
  cursor: "pointer",
};

export const labelStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: 0.1,
};

export const subtleText: React.CSSProperties = {
  color: "var(--text-muted)",
};

export const primaryButton: React.CSSProperties = {
  background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.10)",
  padding: "0.7rem 1.1rem",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
  transition: "transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease",
  boxShadow: "0 12px 28px rgba(99,102,241,0.25)",
};

export const ghostButton: React.CSSProperties = {
  background: "var(--button-ghost)",
  color: "var(--text-primary)",
  border: "1px solid var(--border)",
  padding: "0.55rem 0.8rem",
  borderRadius: 10,
  cursor: "pointer",
  fontSize: 13,
  transition: "background 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
};

export const filterActiveButton: React.CSSProperties = {
  ...primaryButton,
  padding: "0.55rem 0.8rem",
  fontSize: 13,
  lineHeight: 1,
};

export const filterInactiveButton: React.CSSProperties = {
  ...ghostButton,
};

export const dangerButton: React.CSSProperties = {
  ...primaryButton,
  background: "linear-gradient(180deg, rgba(127,29,29,0.85), rgba(185,28,28,0.85))",
  border: "1px solid rgba(239,68,68,0.35)",
  color: "#fecaca",
  boxShadow: "0 0 18px rgba(239,68,68,0.18)",
};

export const navItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  padding: "0.6rem 0.7rem",
  borderRadius: 9,
  background: "transparent",
  color: "var(--text-secondary)",
  border: "1px solid transparent",
  textDecoration: "none",
  fontSize: 14,
  cursor: "pointer",
  transition: "background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.15s ease",
};

export const navItemActiveStyle: React.CSSProperties = {
  ...navItemStyle,
  background: "linear-gradient(180deg, rgba(124,58,237,0.15), rgba(99,102,241,0.10))",
  color: "var(--text-primary)",
  border: "1px solid var(--border)",
  boxShadow: "0 0 0 1px rgba(124,58,237,0.08)",
};

export const articleItemStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--border-subtle)",
  padding: "0.7rem 0.75rem",
  borderRadius: 9,
  color: "var(--text-primary)",
  textAlign: "left",
  cursor: "pointer",
  fontSize: 14,
  outline: "none",
  width: "100%",
  transition: "background 0.2s ease, border-color 0.2s ease, transform 0.15s ease",
};

export const articleItemActiveStyle: React.CSSProperties = {
  ...articleItemStyle,
  background: "var(--border)",
  border: "1px solid var(--border)",
  boxShadow: "0 0 0 1px rgba(124,58,237,0.10)",
};

export const cardHoverStyle: React.CSSProperties = {
  transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
};

export function noticeStyle(bg: string, border: string, text: string): React.CSSProperties {
  return { background: bg, border: `1px solid ${border}`, color: text, padding: "0.9rem 1rem", borderRadius: 10, marginTop: 14 };
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="btn-subtle"
      style={{
        background: "var(--button-ghost)",
        color: "var(--text-primary)",
        border: "1px solid var(--border)",
        padding: "0.55rem 0.8rem",
        borderRadius: 9,
        cursor: "pointer",
        fontSize: 13,
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function DownloadButton({ filename, content }: { filename: string; content: string }) {
  const ext = filename.endsWith(".txt") ? ".txt" : ".md";
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  return (
    <a
      href={url}
      download={filename}
      className="btn-subtle"
      style={{
        background: "var(--button-ghost)",
        color: "var(--text-primary)",
        border: "1px solid var(--border)",
        padding: "0.55rem 0.8rem",
        borderRadius: 9,
        cursor: "pointer",
        fontSize: 13,
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      Download {ext}
    </a>
  );
}

export function MarkdownRenderer({ text }: { text?: string }) {
  const safeText = text ?? "";
  const lines = safeText.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { out.push(<br key={`n${i}`} />); i += 1; continue; }
    if (line.trim().startsWith("# ")) { out.push(<h1 key={i} style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: "8px 0" }}>{line.trim().slice(2)}</h1>); i += 1; continue; }
    if (line.trim().startsWith("## ")) { out.push(<h2 key={i} style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "8px 0" }}>{line.trim().slice(3)}</h2>); i += 1; continue; }
    if (line.trim().startsWith("- ")) {
      const group: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) { group.push(lines[i].trim().slice(2)); i += 1; }
      out.push(<ul key={`g${i}`} style={{ paddingLeft: 18, marginTop: 6, marginBottom: 6, display: "flex", flexDirection: "column", gap: 6 }}>{group.map((it, idx) => (<li key={idx} style={{ color: "var(--text-secondary)" }}>{it}</li>))}</ul>);
      continue;
    }
    out.push(<p key={`p${i}`} style={{ margin: "6px 0", color: "var(--text-secondary)" }}>{line}</p>);
    i += 1;
  }
  return <>{out}</>;
}

export function SeoAnalyzer({ text, title, keywords }: { text: string; title: string; keywords: string }) {
  const [score, setScore] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/seo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, keywords, title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal analisis SEO.");
      setScore(data.score);
      setSuggestions(data.suggestions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal analisis SEO.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        ...card,
        marginTop: 18,
      }}
      className="hover-lift"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>SEO Suggestions</div>
        <button
          type="button"
          onClick={analyze}
          disabled={loading}
          className="btn-subtle"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)",
            color: "#fff",
            border: "1px solid var(--border)",
            padding: "0.45rem 0.8rem",
            borderRadius: 9,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>
      {error && <div style={{ ...noticeStyle("var(--button-ghost)", "var(--border)", "var(--text-primary)"), marginTop: 10, borderLeft: "4px solid #ef4444" }}>{error}</div>}
      {score !== null && (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Score: {score}/100</div>
          <ul style={{ paddingLeft: 18, marginTop: 8, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
            {suggestions.map((s, idx) => (<li key={idx} style={{ color: "var(--text-secondary)", fontSize: 13, wordBreak: "break-word", overflowWrap: "break-word", lineHeight: 1.55 }}>{s}</li>))}
          </ul>
        </div>
      )}
    </div>
  );
}
