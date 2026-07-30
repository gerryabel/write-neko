"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";

const NAV = [
  { href: "/generate", label: "Generate", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ) },
  { href: "/rewrite", label: "Rewrite", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  ) },
  { href: "/history", label: "History", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ) },
  { href: "/settings", label: "Settings", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36 19.78 17.36M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64 19.78 6.46" />
    </svg>
  ) },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: 230,
        borderRight: "1px solid var(--border)",
        background: "var(--sidebar)",
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
        padding: "1.2rem 0.75rem",
        zIndex: 30,
        boxShadow: "inset -1px 0 0 var(--border-subtle)",
      }}
    >
      <div style={{ marginBottom: 18, padding: "0 0.25rem", position: "relative", paddingRight: 44 }}>
        <div style={{ fontSize: 16, fontWeight: 600, display: "inline-flex", alignItems: "flex-end", gap: 10 }}>
          <span
            aria-hidden
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: "linear-gradient(135deg,#7c3aed,#6366f1,#3b82f6)",
              color: "#ffffff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 800,
              lineHeight: 1,
              boxShadow: "0 0 0 4px rgba(124,58,237,0.18)",
            }}
          >
            N
          </span>
          <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 5 }}>
            <span style={{ fontFamily: "var(--font-geist-sans)", fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1, fontSize: 15 }}>Write </span>
            <span style={{ fontFamily: "var(--font-brand)", fontWeight: 400, letterSpacing: "0.02em", lineHeight: 1.1, fontSize: 20, display: "inline-block" }}>Neko</span>
          </span>
        </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 11, padding: "0 0.25rem" }}>
                AI-powered writing assistant
              </div>
              <div aria-hidden style={{ position: "absolute", right: 2, top: 18, width: 90, height: 10, borderRadius: 999, background: "linear-gradient(90deg, rgba(124,58,237,0.12), rgba(59,130,246,0.10), rgba(16,185,129,0.08))", filter: "blur(6px)" }} />
        <button
          onClick={toggleTheme}
          className="btn-subtle"
          aria-label="Toggle theme"
          style={{
            position: "absolute",
            right: 2,
            top: 2,
            background: "var(--button-ghost)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            width: 34,
            height: 34,
            borderRadius: 9,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          {theme === "dark" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV.map((item) => {
          const active = pathname === item.href || (pathname?.startsWith(item.href) ?? false);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "animate-fade-in" : ""}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0.65rem 0.75rem",
                borderRadius: 10,
                textDecoration: "none",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                background: active ? "linear-gradient(180deg, rgba(124,58,237,0.18), rgba(99,102,241,0.18))" : "transparent",
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                boxShadow: active ? "inset 0 0 0 1px var(--border)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "var(--button-ghost)";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateX(2px)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateX(0)";
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", padding: "0 0.1rem", lineHeight: 1.5, wordBreak: "break-word" }}>
          Write Neko v0.2-alpha
          <br />
          Powered by OpenRouter
          <br />
          Build 2026.07.04
        </div>
      </div>
    </aside>
  );
}
