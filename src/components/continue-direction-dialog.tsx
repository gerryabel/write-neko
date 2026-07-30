"use client";

import { useEffect, useRef } from "react";

type Direction = "continue" | "shorter" | "longer";

type Props = {
  open: boolean;
  value?: Direction;
  onSelect: (value: Direction) => void;
  onCancel: () => void;
};

const OPTIONS: { value: Direction; label: string }[] = [
  { value: "continue", label: "Continue" },
  { value: "shorter", label: "Shorter" },
  { value: "longer", label: "Longer" },
];

export function ContinueDirectionDialog({ open, onSelect, onCancel }: Props) {
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  useEffect(() => {
    if (open) setTimeout(() => firstRef.current?.focus(), 0);
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,0.55)",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "1.1rem 1.25rem",
          boxShadow: "0 22px 50px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Continue writing direction</div>
        <div style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.5 }}>Pilih mode penulisan lanjutan.</div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {OPTIONS.map((item) => {
            return (
              <button
                type="button"
                key={item.value}
                ref={OPTIONS[0].value === item.value ? firstRef : undefined}
                onClick={() => onSelect(item.value)}
                className="btn-subtle"
                style={{
                  background: "transparent",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "0.65rem 0.85rem",
                  cursor: "pointer",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} className="btn-subtle" style={{ background: "var(--button-ghost)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: "0.55rem 0.9rem", cursor: "pointer", fontSize: 14 }}>Batal</button>
        </div>
      </div>
    </div>
  );
}
