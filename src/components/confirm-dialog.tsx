"use client";

import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title = "Konfirmasi",
  description = "",
  confirmText = "Hapus",
  cancelText = "Batal",
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  useEffect(() => {
    if (open) {
      setTimeout(() => confirmRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  const isDanger = tone === "danger";

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
          maxWidth: 420,
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "1.1rem 1.25rem",
          boxShadow: "0 22px 50px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{title}</div>
        {description ? (
          <div style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.5 }}>{description}</div>
        ) : null}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            className="btn-subtle"
            style={{
              background: "var(--button-ghost)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "0.55rem 0.9rem",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            style={{
              background: isDanger
                ? "linear-gradient(180deg, rgba(127,29,29,0.85), rgba(185,28,28,0.85))"
                : "linear-gradient(180deg, rgba(124,58,237,0.85), rgba(99,102,241,0.8))",
              color: isDanger ? "#fecaca" : "var(--text-primary)",
              border: isDanger ? "1px solid rgba(239,68,68,0.35)" : "1px solid transparent",
              borderRadius: 10,
              padding: "0.55rem 0.9rem",
              cursor: "pointer",
              fontSize: 14,
              boxShadow: isDanger ? "0 0 18px rgba(239,68,68,0.18)" : "0 10px 24px rgba(99,102,241,0.25)",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
