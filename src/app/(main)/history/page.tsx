"use client";

import { useEffect, useRef, useState } from "react";
import { CopyButton, DownloadButton, MarkdownRenderer, noticeStyle, SeoAnalyzer, inputStyle, labelStyle, card, primaryButton, filterInactiveButton, filterActiveButton, articleItemStyle, articleItemActiveStyle } from "../shared-ui";
import { ContinueDirectionDialog } from "@/components/continue-direction-dialog";

type Article = {
  id: string;
  judul: string;
  tone: string;
  kata_kunci: string;
  created_at: string;
  jenis: string;
  body: string;
  favorite?: number;
};

export default function HistoryPage() {
  const [items, setItems] = useState<Article[]>([]);
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selected, setSelected] = useState<Article | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [resultContinue, setResultContinue] = useState<{ id: string; content: string } | null>(null);
  const [loadingContinue, setLoadingContinue] = useState(false);
  const [errorContinue, setErrorContinue] = useState<string | null>(null);
  const [continueOpen, setContinueOpen] = useState(false);

  const loadRef = useRef<() => Promise<void>>(async () => {});

  async function load() {
    const res = await fetch(`/api/history?sort=${sortAsc ? "asc" : "desc"}${query ? `&q=${encodeURIComponent(query)}` : ""}${showFavoritesOnly ? "&favorite=1" : ""}`, { cache: "no-store" });
    if (!res.ok) {
      setItems([]);
      setSelected(null);
      return;
    }
    const text = await res.text();
    if (!text.trim()) {
      setItems([]);
      setSelected(null);
      return;
    }
    let data;
    try { data = JSON.parse(text); } catch { setItems([]); setSelected(null); return; }
    setItems(data.items ?? []);
    const first = (data.items ?? [])[0] ?? null;
    if (first?.id) {
      await loadItem(first.id);
    } else {
      setSelected(null);
    }
  }

  loadRef.current = load;

  async function handleContinue(direction: string) {
    if (!selected) return;
    setContinueOpen(false);
    setLoadingContinue(true);
    setErrorContinue(null);
    setResultContinue(null);
    try {
      const res = await fetch("/api/continue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: selected.id, direction }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Gagal melanjutkan konten.");
      const data = await res.json();
      setLoadingContinue(false);
      setResultContinue({ id: data.id, content: data.content });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal melanjutkan konten.";
      setLoadingContinue(false);
      setErrorContinue(message);
    }
  }

  useEffect(() => { void loadRef.current(); }, [sortAsc, query, showFavoritesOnly]);

  // load item from URL ?id= on direct visit
  useEffect(() => {
    const url = new URL(window.location.href);
    const id = url.searchParams.get("id");
    if (id) {
      loadItem(id);
    }
  }, []);

  async function loadItem(id: string) {
    const res = await fetch(`/api/history?id=${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) {
      setSelected(null);
      return;
    }
    const text = await res.text();
    if (!text.trim()) {
      setSelected(null);
      return;
    }
    let data;
    try { data = JSON.parse(text); } catch { setSelected(null); return; }
    if (data.item) {
      setSelected(data.item);
      setItems((prev) => prev ?? []);
    } else {
      setSelected(null);
    }
  }

  async function toggleFavorite(id: string, current: number = 0) {
    await fetch("/api/history", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, favorite: current ? 0 : 1 }),
    });
    await loadRef.current();
    if (selected?.id === id) {
      setSelected((prev) => prev ? { ...prev, favorite: current ? 0 : 1 } : prev);
    }
  }

  async function confirmDelete() {
    if (!confirmId) return;
    await fetch(`/api/history?id=${encodeURIComponent(confirmId)}`, { method: "DELETE" });
    setConfirmId(null);
    await loadRef.current();
  }

  async function exportZip() {
    const selectedForExport = selected ? [selected] : items;
    if (!selectedForExport.length) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const item of selectedForExport) {
      zip.file(`${item.id}_${item.judul || "article"}.md`, item.body || "");
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "konten.zip";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.2, color: "var(--text-primary)" }}>History Konten</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>Jelajahi, bandingkan, dan gunakan ulang konten yang dihasilkan atau direwrite.</p>
      </div>

      <div style={{ ...card, maxWidth: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" }}>
            <label style={{ ...labelStyle, fontSize: 12, color: "var(--text-muted)", letterSpacing: 0.15 }}>Cari judul / kata kunci / jenis / tanggal</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari..."
              className="input-hover"
              style={{ ...inputStyle, width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" }}>
            <label style={{ ...labelStyle, fontSize: 12, color: "var(--text-muted)", letterSpacing: 0.15 }}>Urut & Filter</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={() => setSortAsc(false)} className="hover-lift" style={{ ...(sortAsc ? filterInactiveButton : filterActiveButton), opacity: 1, cursor: "pointer" }}>Terbaru</button>
                <button type="button" onClick={() => setSortAsc(true)} className="hover-lift" style={{ ...(sortAsc ? filterActiveButton : filterInactiveButton), opacity: 1, cursor: "pointer" }}>Terlama</button>
                <button type="button" onClick={() => setShowFavoritesOnly((prev) => !prev)} className="hover-lift" style={{ ...(showFavoritesOnly ? filterActiveButton : filterInactiveButton), opacity: 1, cursor: "pointer" }}>{showFavoritesOnly ? "★ Favorit" : "Semua"}</button>
              </div>
              <button type="button" onClick={exportZip} disabled={!items.length} className="hover-lift" style={{ ...primaryButton, opacity: items.length ? 1 : 0.55, cursor: items.length ? "pointer" : "not-allowed" }}>Export ZIP</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)", gap: 16 }}>
        <div className="hover-lift" style={{ background: "var(--card-bg)", padding: 14, borderRadius: 14, border: "1px solid var(--border-subtle)", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => { setConfirmId(null); loadItem(item.id); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setConfirmId(null); loadItem(item.id); } }}
                role="button"
                tabIndex={0}
                onMouseEnter={(e) => {
                  if (selected?.id !== item.id) (e.currentTarget as HTMLDivElement).style.background = "var(--button-ghost)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateX(2px)";
                }}
                onMouseLeave={(e) => {
                  if (selected?.id !== item.id) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)";
                }}
                style={{ ...(selected?.id === item.id ? articleItemActiveStyle : articleItemStyle), transition: "background 0.2s ease, border-color 0.2s ease, transform 0.15s ease" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{item.judul || "Tanpa judul"}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>{item.created_at} • {item.jenis}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id, item.favorite ?? 0); }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--elevated)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--border)",
                        color: item.favorite ? "#eab308" : "var(--text-muted)",
                        borderRadius: 8,
                        padding: "0.25rem 0.5rem",
                        cursor: "pointer",
                        fontSize: 12,
                        transition: "background 0.2s ease",
                      }}
                    >
                      {item.favorite ? "★" : "☆"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setConfirmId(item.id); }}
                      className="btn-subtle"
                      style={{
                        background: "transparent",
                        border: "1px solid var(--border)",
                        color: "#ef4444",
                        borderRadius: 8,
                        padding: "0.25rem 0.5rem",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Belum ada konten.</div>}
          </div>
        </div>

        <div className="hover-lift" style={{ background: "var(--card-bg)", padding: 14, borderRadius: 14, border: "1px solid var(--border-subtle)", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
          {!selected ? <div style={{ color: "var(--text-muted)" }}>Pilih konten dari daftar.</div> : (
            <>
              {confirmId && (
                <div className="danger-confirm" style={{ marginBottom: 12, padding: 14, borderRadius: 12 }}>
                  <div style={{ fontWeight: 700 }}>Hapus item ini?</div>
                  <div style={{ marginTop: 10, display: "flex", gap: 10, color: "inherit" }}>
                    <button type="button" onClick={confirmDelete} className="hover-lift" style={{ ...primaryButton, padding: "0.55rem 0.8rem" }}>Hapus</button>
                    <button type="button" onClick={() => setConfirmId(null)} className="hover-lift" style={{ background: "var(--button-ghost)", color: "inherit", border: "1px solid var(--border)", padding: "0.55rem 0.8rem", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>Batal</button>
                  </div>
                </div>
              )}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{selected.judul || "Tanpa judul"}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>{selected.created_at} • {selected.jenis} • {selected.tone}</div>
                  </div>
                  <button type="button" onClick={() => setConfirmId(selected.id)} className="hover-lift" style={{ ...primaryButton, background: "#b91c1c", border: "1px solid #fecaca", boxShadow: "none", color: "#ffffff" }}>Hapus</button>
                </div>
                <div className="hover-lift" style={{ ...card, marginTop: 0, maxHeight: 520, overflow: "auto", paddingRight: 8, background: "var(--elevated)" }}>
                  <MarkdownRenderer text={selected.body} />
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <CopyButton text={selected.body} />
                  <DownloadButton filename={`${selected.judul || "article"}.md`} content={selected.body} />
                  <DownloadButton filename={`${selected.judul || "article"}.txt`} content={selected.body} />
                  <button type="button" onClick={() => setContinueOpen(true)} className="hover-lift" style={{ ...primaryButton }}>Lanjutkan Menulis</button>
                </div>
                {loadingContinue && <div style={{ marginTop: 12, color: "var(--text-muted)", fontSize: 13, letterSpacing: 0.2 }}>Melanjutkan konten...</div>}
                {errorContinue && <div style={noticeStyle("#3a2020", "#ffb3b3", "#ffd9d9")}>{errorContinue}</div>}
                {resultContinue && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ ...noticeStyle("#122225", "#a8dadc", "#b8e6eb"), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 700 }}>Dilanjutkan</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>{new Date().toLocaleString()}</div>
                    </div>
                    <div style={{ marginTop: 12, background: "var(--elevated)", padding: 16, borderRadius: 12, border: "1px solid var(--border-subtle)", whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
                      <MarkdownRenderer text={resultContinue.content} />
                    </div>
                    <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <CopyButton text={resultContinue.content} />
                      <DownloadButton filename={`${selected.judul || "article"}_continue.md`} content={resultContinue.content} />
                      <button type="button" onClick={() => resultContinue.id && (window.location.href = `/history?id=${resultContinue.id}`)} className="hover-lift" style={primaryButton}>Buka di Riwayat</button>
                    </div>
                    <SeoAnalyzer text={resultContinue.content} title={`${selected.judul || "Untitled"} (continued)`} keywords="" />
                  </div>
                )}
                <SeoAnalyzer text={selected.body} title={selected.judul} keywords={selected.kata_kunci} />
              </div>
            </>
          )}
        </div>
      </div>
      <ContinueDirectionDialog
        open={continueOpen}
        value="continue"
        onSelect={handleContinue}
        onCancel={() => setContinueOpen(false)}
      />
    </div>
  );
}
