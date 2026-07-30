"use client";

import { useEffect, useState } from "react";
import { CopyButton, DownloadButton, MarkdownRenderer, noticeStyle, SeoAnalyzer, inputStyle, labelStyle, card, primaryButton } from "../shared-ui";
import { CustomSelect } from "@/components/custom-select";

type Article = {
  id: string;
  judul: string;
  created_at: string;
  jenis: string;
  tone: string;
};

const TONES = ["netral","akademik","casual","storytelling","persuasif"] as const;

export default function RewritePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [tone, setTone] = useState<string>("casual");
  const [targetKata, setTargetKata] = useState<number>(500);
  const [keywords, setKeywords] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; content: string; wordCount?: number } | null>(null);

  useEffect(() => {
    fetch("/api/history?type=source", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const list: Article[] = data.items ?? [];
        setArticles(list);
        if (list.length) setSelectedId(list[0].id);
      })
      .catch(() => {});
  }, []);

  const selected = articles.find((a) => a.id === selectedId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!selectedId) { setError("Pilih konten yang mau di-rewrite."); return; }
    const kwVal = (keywords ?? "").trim();
    if (kwVal.split(",").length > 20) { setError("Kata kunci kebanyikan, maksimal 20 aja ya."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: selectedId, tone, keywords: kwVal, targetKata }),
      });
      const data = (await res.json()) as { error?: string; id?: string; content?: string };
      if (!res.ok) throw new Error(data.error ?? "Gagal rewrite konten.");
      const words = (data.content ?? "").split(/\s+/).filter(Boolean).length;
      setResult({ id: data.id ?? "", content: data.content ?? "", wordCount: words });
      await fetch("/api/history", { cache: "no-store" }).then((r) => r.json()).then((d) => setArticles(d.items ?? []));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal rewrite konten.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1260, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.2, color: "var(--text-primary)" }}>Rewrite Konten</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>
          Pilih konten, ubah tone/kata kunci, lalu rewrite.
        </p>
      </div>

      <div
        style={{
          ...card,
          display: "grid",
          gridTemplateColumns: "minmax(240px,1.45fr) minmax(260px,0.9fr)",
          gap: 22,
          alignItems: "start",
          overflow: "visible",
          position: "relative",
          isolation: "auto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative", zIndex: 0 }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(190px,0.55fr)", gap: 14, alignItems: "end" }}>
              <CustomSelect label="Konten sumber" value={selectedId} onChange={setSelectedId} placeholder="Pilih konten sumber" options={articles.map((a) => ({ value: a.id, label: `${a.judul || "Untitled"} · ${new Date(a.created_at).toLocaleString()}` }))} width="100%" />
              <CustomSelect label="Tone" value={tone} onChange={setTone} placeholder="Pilih tone" options={TONES.map((t) => ({ value: t, label: t }))} width="100%" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(130px,0.45fr) minmax(210px,1fr)", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label style={labelStyle}>Target kata</label>
                <input type="number" min={100} max={5000} value={targetKata} onChange={(e) => setTargetKata(Number(e.target.value || 0))} style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label style={labelStyle}>Kata kunci (opsional)</label>
                <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="pisah koma" style={inputStyle} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="hover-lift" style={{ ...primaryButton, opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 14px 30px rgba(99,102,241,0.25)" }}>
              {loading ? "Rewriting..." : "Rewrite Sekarang"}
            </button>
          </form>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="hover-lift" style={{ ...card, background: "var(--elevated)", border: "1px solid var(--border-subtle)", padding: "16px 18px" }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>Quick Tips</div>
            <ul style={{ paddingLeft: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9, color: "var(--text-secondary)", fontSize: 13.5, lineHeight: 1.7, listStyle: "none" }}>
              <li style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ minWidth: 22, height: 22, padding: "0 5px", borderRadius: 9999, background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>1</span>
                Pilih tone yang sesuai audiens tujuan.
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ minWidth: 22, height: 22, padding: "0 5px", borderRadius: 9999, background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>2</span>
                Batasi kata kunci agar hasil tetap fokus.
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ minWidth: 22, height: 22, padding: "0 5px", borderRadius: 9999, background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>3</span>
                Gunakan target kata untuk kontrol panjang.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {error && <div style={{ ...noticeStyle("var(--button-ghost)", "var(--border)", "var(--text-primary)"), marginTop: 14, borderLeft: "4px solid #ef4444" }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 22 }}>
          <div style={{ background: "var(--button-ghost)", border: "1px solid var(--border)", padding: "0.9rem 1rem", borderRadius: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>{selected?.judul}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{result.wordCount} kata</div>
          </div>

          <div style={{ marginTop: 14, ...card, whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
            <MarkdownRenderer text={result.content} />
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <CopyButton text={result.content} />
            <DownloadButton filename={`rewrite_${selected?.judul ?? "article"}.md`} content={result.content} />
            <button type="button" onClick={() => selectedId && (window.location.href = `/history?id=${selectedId}`)} style={{ ...primaryButton, background: "var(--button-ghost)", boxShadow: "none", opacity: 1, cursor: "pointer", transition: "opacity 0.2s ease" }}>Open in History</button>
          </div>
          <SeoAnalyzer text={result.content} title={selected?.judul ?? ""} keywords={keywords} />
        </div>
      )}
    </div>
  );
}
