"use client";

import { useEffect, useState } from "react";
import { inputStyle, labelStyle, card, primaryButton, noticeStyle } from "../shared-ui";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("openrouter/owl-alpha");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()).then((d) => {
        setModel(d.model ?? "openrouter/owl-alpha");
      }),
      fetch("/api/templates").then((r) => r.json()),
    ])
      .then(([, templatesData]) => {
        setTemplates(templatesData.templates ?? {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ apiKey, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan konfigurasi.");
      setMessage("Tersimpan! Kamu bisa langsung coba Generate.");
      setApiKey("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan konfigurasi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.2, color: "var(--text-primary)" }}>Settings</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>Kelola konfigurasi OpenRouter kamu.</p>
      </div>

      <form
        onSubmit={handleSave}
        style={{
          ...card,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <label style={labelStyle}>OpenRouter API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="input-hover"
            style={{ ...inputStyle }}
            placeholder="sk-..."
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <label style={labelStyle}>Model ID</label>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="openrouter/owl-alpha"
            className="input-hover"
            style={{ ...inputStyle }}
          />
        </div>
        <button
          type="submit"
          disabled={saving || loading}
          className="hover-lift"
          style={{
            ...primaryButton,
            opacity: saving || loading ? 0.65 : 1,
            cursor: saving || loading ? "not-allowed" : "pointer",
            boxShadow: saving || loading ? "none" : "0 14px 30px rgba(99,102,241,0.25)",
            transition: "opacity 0.2s ease, transform 0.15s ease",
          }}
        >
          {saving ? "Saving..." : "Simpan konfigurasi"}
        </button>
      </form>

      <div style={{ marginTop: 18, color: "var(--text-muted)", fontSize: 12, lineHeight: 1.5 }}>
        Konfigurasi ini disimpan secara lokal di repo database. Untuk keamanan, tetap waspadai saat menyimpan kredensial.
      </div>

      {error && <div style={noticeStyle("#3a2020", "#ffb3b3", "#ffd9d9")}>{error}</div>}
      {message && <div style={noticeStyle("#132a1a", "#8ce99a", "#cdffcc")}>{message}</div>}

      <div className="hover-lift" style={{ marginTop: 18, ...card, background: "var(--elevated)", border: "1px solid var(--border-subtle)" }}>
        <div style={{ fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>Saved templates</div>
        <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          {Object.keys(templates).length ? `${Object.keys(templates).length} template(s) available` : "No templates yet."}
        </div>
      </div>
    </div>
  );
}
