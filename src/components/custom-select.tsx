"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";

export type SelectOption = {
  label: string;
  value: string;
};

type Props = {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  width?: number | string;
};

export function CustomSelect({ options, value, onChange, placeholder, label, width = "100%" }: Props) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!open) return;
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const el = menuRef.current;
    if (!el) return;
    el.style.position = "fixed";
    el.style.top = `${rect.bottom + 6}px`;
    el.style.left = `${rect.left}px`;
    el.style.right = "auto";
    el.style.width = `${rect.width}px`;
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node | null;
      const insideTrigger = triggerRef.current?.contains(target) ?? false;
      const insideMenu = menuRef.current?.contains(target) ?? false;
      if (!insideTrigger && !insideMenu) setOpen(false);
    };
    const handler2 = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", handler2);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", handler2);
    };
  }, []);

  const isLight = theme === "light";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7, width, position: "relative" }} ref={ref}>
      {label ? <label style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, letterSpacing: 0.1 }}>{label}</label> : null}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          background: "var(--input-bg)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          padding: "0.6rem 0.75rem",
          borderRadius: 10,
          fontSize: 14,
          cursor: "pointer",
          textAlign: "left",
          minHeight: 42,
          width: "100%",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLButtonElement).style.background = isLight ? "#f1f5f9" : "#0b0b14";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLButtonElement).style.background = "var(--input-bg)";
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected ? selected.label : <span style={{ color: "var(--text-muted)" }}>{placeholder ?? "Select"}</span>}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
            opacity: 0.85,
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="listbox"
          className="dropdown-enter"
          style={{
            zIndex: 120,
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: theme === "dark" ? "0 18px 45px rgba(0,0,0,0.55)" : "0 12px 30px rgba(0,0,0,0.12)",
            padding: 6,
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  padding: "0.6rem 0.75rem",
                  borderRadius: 9,
                  cursor: "pointer",
                  fontSize: 14,
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  background: active ? "linear-gradient(180deg, rgba(124,58,237,0.18), rgba(99,102,241,0.14))" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  transition: "background 0.15s ease, color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <span style={{ lineHeight: 1.45, wordBreak: "break-word", overflowWrap: "break-word" }}>{opt.label}</span>
                {active && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                      boxShadow: "0 0 0 3px rgba(124,58,237,0.25)",
                      flexShrink: 0,
                      marginTop: 3,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
