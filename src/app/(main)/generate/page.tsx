"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { CopyButton, DownloadButton, MarkdownRenderer, noticeStyle, SeoAnalyzer, inputStyle, labelStyle, card, primaryButton } from "../shared-ui";
import { CustomSelect } from "@/components/custom-select";
import { ConfirmDialog } from "@/components/confirm-dialog";

const PRESETS = [
  { id: "artikel_blog", label: "Artikel Blog" },
  { id: "blog_casual", label: "Blog Casual" },
  { id: "script_short", label: "Script Video Short" },
  { id: "linkedin_post", label: "LinkedIn Post" },
  { id: "email", label: "Email" },
  { id: "ad_copy", label: "Ad Copy" },
  { id: "product_description", label: "Produk Description" },
  { id: "newsletter", label: "Newsletter" },
];

const TONE_MAP: Record<string, string[]> = {
  artikel_blog: ["netral", "akademik", "casual", "storytelling", "persuasif"],
  blog_casual: ["casual", "storytelling", "netral"],
  script_short: ["casual", "persuasif", "netral"],
  linkedin_post: ["netral", "persuasif", "akademik"],
  email: ["netral", "persuasif", "casual"],
  ad_copy: ["persuasif", "casual", "netral"],
  product_description: ["netral", "persuasif", "akademik"],
  newsletter: ["netral", "casual", "storytelling"],
};

const PRESET_PROMPTS: Record<string, string> = {
  artikel_blog: "Tulis dengan struktur artikel blog: pendahuluan, 3-5 poin utama, penutup actionable.",
  blog_casual: "Tulis dengan gaya blog casual, santai dan mudah terhubung.",
  script_short: "Tulis dalam format script video pendek (60-90 detik), dengan kalimat pendek dan visual yang jelas.",
  linkedin_post: "Tulis status LinkedIn yang relatable, padat, dan bernilai.",
  email: "Tulis email yang jelas, sopan, dan mudah dibaca.",
  ad_copy: "Tulis ad copy yang menarik, singkat, dan memancing aksi.",
  product_description: "Tulis deskripsi produk yang jualan, jelas manfaatnya, dan mudah dipahami.",
  newsletter: "Tulis newsletter yang engaging, ringkas, dan punya alur pembaca.",
};

export default function GeneratePage() {
  const [preset, setPreset] = useState<string>(PRESETS[0].id);
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState<string>(TONE_MAP[PRESETS[0].id][0]);
  const [targetKata, setTargetKata] = useState<number>(500);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [templates, setTemplates] = useState<Record<string, string>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templateName, setTemplateName] = useState<string>("");
  const [templatePrompt, setTemplatePrompt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ judul: string; content: string; wordCount?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const toneOptions = useMemo(() => TONE_MAP[preset] ?? TONE_MAP.artikel_blog, [preset]);

  // Preserve behavior: keep tone within the current preset's allowed tones.
  const toneRef = useRef(tone);
  const setTonePreset = (next: string) => {
    const options = TONE_MAP[next] ?? TONE_MAP.artikel_blog;
    setPreset(next);
    setTone(options.includes(toneRef.current) ? toneRef.current : options[0]);
  };

  const placeholderTopic = useMemo(() => {
    const p = PRESETS.find((x) => x.id === preset);
    switch (p?.id) {
      case "artikel_blog":
        return "Contoh: Manfaat tidur siang untuk produktivitas";
      case "blog_casual":
        return "Contoh: Hari pertama ngelombok bareng temen";
      case "script_short":
        return "Contoh: 3 tips hemat listrik di kos";
      case "linkedin_post":
        return "Contoh: Pelajaran jadi remote worker";
      case "email":
        return "Contoh: Permohonan liburan ke atasan";
      case "ad_copy":
        return "Contoh: Kopi_street_A untuk anak kost";
      case "product_description":
        return "Contoh: Sepatu lari ringan untuk kota";
      case "newsletter":
        return "Contoh: Update mingguan komunitas branding";
      default:
        return "Contoh: topik konten kamu";
    }
  }, [preset]);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => {
        const list = d.templates ?? {};
        setTemplates(list);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setMessage(null);

    const topicVal = topic.trim();
    if (topicVal.length < 3) {
      setError("Topiknya minimal 3 karakter ya, biar AI ngerti mau nulis apa.");
      return;
    }
    if (topicVal.split(/\s+/).length > 30) {
      setError("Topiknya kepanjangan, coba ringkas jadi maksimal 30 kata.");
      return;
    }
    const kwVal = keywords.trim();
    if (kwVal.split(",").length > 20) {
      setError("Kata kunci kebanyikan, maksimal 20 aja ya.");
      return;
    }

    setLoading(true);
    try {
      const presetInstruction = PRESET_PROMPTS[preset] ?? "";
      const templateInstruction = selectedTemplate && templates[selectedTemplate] ? `\n${templates[selectedTemplate]}` : "";
      const finalPrompt = [presetInstruction, customPrompt.trim(), templateInstruction].filter(Boolean).join("\n\n");

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          topic: topicVal,
          keywords: kwVal,
          tone,
          targetKata,
          preset,
          instructions: finalPrompt || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; judul?: string; content?: string };
      if (!res.ok) throw new Error(data.error ?? "Gagal generate konten.");
      const words = (data.content ?? "").split(/\s+/).filter(Boolean).length;
      setResult({ judul: data.judul ?? "Untitled", content: data.content ?? "", wordCount: words });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal generate konten.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function saveTemplate() {
    if (!templateName.trim() || !templatePrompt.trim()) {
      setError("Isi nama dan prompt template-nya.");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: templateName.trim(), prompt: templatePrompt.trim() }),
      });
      const data = (await res.json()) as { templates?: Record<string, string>; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan template.");
      setTemplates(data.templates ?? {});
      setSelectedTemplate(templateName.trim());
      setTemplateName("");
      setTemplatePrompt("");
      setMessage("Template saved.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan template.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemplate() {
    if (!selectedTemplate) return;
    const res = await fetch("/api/templates", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: selectedTemplate }),
    });
    const data = (await res.json()) as { templates?: Record<string, string>; error?: string } ;
    setTemplates(data.templates ?? {});
    setSelectedTemplate("");
    setDeleteOpen(false);
    setMessage("Template deleted.");
  }

  const badge = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "var(--button-ghost)",
        color: "var(--text-primary)",
        border: "1px solid var(--border)",
        padding: "0.35rem 0.7rem",
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
          boxShadow: "0 0 0 3px rgba(124,58,237,0.25)",
        }}
      />
      AI Writer Ready
    </span>
  );

  return (
    <div style={{ maxWidth: 1260, margin: "0 auto" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.2, color: "var(--text-primary)" }}>Generate Konten Baru</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>
            Pilih jenis konten, isi topik, lalu generate.
          </p>
        </div>
        {badge}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.4fr) minmax(320px,0.8fr)",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <form
            onSubmit={handleSubmit}
            style={{ ...card, display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <CustomSelect
                label="Jenis konten"
                value={preset}
                onChange={setTonePreset}
                placeholder="Pilih jenis konten"
                options={PRESETS.map((p) => ({ value: p.id, label: p.label }))}
                width="100%"
              />
              <CustomSelect
                label="Tone"
                value={tone}
                onChange={setTone}
                placeholder="Pilih tone"
                options={toneOptions.map((t) => ({ value: t, label: t }))}
                width="100%"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={labelStyle}>Topik / ide utama</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={placeholderTopic}
                className="input-hover"
                style={{ ...inputStyle }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label style={labelStyle}>Kata kunci (opsional, pisah koma)</label>
                <input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="misal: produktivitas, kesehatan"
                  className="input-hover"
                  style={{ ...inputStyle }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label style={labelStyle}>Target jumlah kata</label>
                <input
                  type="number"
                  min={50}
                  max={5000}
                  step={50}
                  value={targetKata}
                  onChange={(e) => setTargetKata(Number(e.target.value))}
                  className="input-hover"
                  style={{ ...inputStyle }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label style={labelStyle}>Custom instructions (opsional)</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Contoh: Tulis dengan bullet point."
                  rows={3}
                  className="input-hover"
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label style={labelStyle}>Template</label>
                <CustomSelect
                  value={selectedTemplate}
                  onChange={setSelectedTemplate}
                  placeholder="Use template: none"
                  options={[
                    { value: "", label: "Use template: none" },
                    ...Object.keys(templates).map((name) => ({ value: name, label: name })),
                  ]}
                  width="100%"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hover-lift"
              style={{
                ...primaryButton,
                opacity: loading ? 0.65 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 14px 30px rgba(99,102,241,0.25)",
              }}
            >
              {loading ? "Generating..." : "Generate Sekarang"}
            </button>
          </form>

          {error && <div style={{ ...noticeStyle("var(--button-ghost)", "var(--border)", "var(--text-primary)"), marginTop: 10, borderLeft: "4px solid #ef4444" }}>{error}</div>}
          {message && <div style={{ ...noticeStyle("var(--button-ghost)", "var(--border)", "var(--text-primary)"), marginTop: 10, borderLeft: "4px solid #22c55e" }}>{message}</div>}

          {result && (
            <div className="hover-lift" style={{ ...card, marginTop: 4, border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{result.judul}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 3 }}>{result.wordCount} kata</div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <CopyButton text={result.content} />
                  <DownloadButton filename={`${result.judul}.md`} content={result.content} />
                </div>
              </div>
              <div style={{ marginTop: 14, background: "var(--elevated)", padding: 16, borderRadius: 12, border: "1px solid var(--border-subtle)", whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
                <MarkdownRenderer text={result.content} />
              </div>
              <div style={{ marginTop: 14 }}>
                <SeoAnalyzer text={result.content} title={result.judul} keywords={keywords} />
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="hover-lift" style={{ ...card }}>
            <div style={{ fontWeight: 700, marginBottom: 10, color: "var(--text-primary)" }}>Custom Prompt Templates</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label style={labelStyle}>Template name</label>
                <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="misal: product copy" className="input-hover" style={{ ...inputStyle }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label style={labelStyle}>Prompt template</label>
                <input value={templatePrompt} onChange={(e) => setTemplatePrompt(e.target.value)} placeholder="misal: Always end with CTA." className="input-hover" style={{ ...inputStyle }} />
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button type="button" onClick={saveTemplate} disabled={saving} className="hover-lift" style={{ ...primaryButton, opacity: saving ? 0.65 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving..." : "Save Template"}
                </button>
              <button type="button" onClick={() => setDeleteOpen(true)} disabled={!selectedTemplate} className="btn-subtle" style={{ background: "var(--button-ghost)", color: "var(--text-primary)", border: "1px solid var(--border)", padding: "0.55rem 0.8rem", borderRadius: 8, cursor: selectedTemplate ? "pointer" : "not-allowed", opacity: selectedTemplate ? 1 : 0.55, fontSize: 13, transition: "opacity 0.2s ease, transform 0.15s ease" }}>
                  Delete Template
                </button>
                <span
                  style={{
                    marginLeft: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "var(--button-ghost)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                    padding: "0.35rem 0.7rem",
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Saved: {Object.keys(templates).length}
                </span>
              </div>
            </div>
          </div>

          <div className="hover-lift" style={{ ...card }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>Quick Tips</div>
            <ul style={{ paddingLeft: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8, color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6, listStyle: "none" }}>
              <li style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ minWidth: 22, height: 22, padding: "0 5px", borderRadius: 9999, background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>1</span>
                Pakai kata kunci yang relevan untuk hasil yang lebih fokus.
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ minWidth: 22, height: 22, padding: "0 5px", borderRadius: 9999, background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>2</span>
                Atur target kata sesuai kebutuhan: 300-800 untuk konten pendek.
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ minWidth: 22, height: 22, padding: "0 5px", borderRadius: 9999, background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>3</span>
                Simpan template favorit untuk workflow yang konsisten.
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ minWidth: 22, height: 22, padding: "0 5px", borderRadius: 9999, background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>4</span>
                Gunakan custom instructions jika ingin format spesifik.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Hapus template?"
        description={`Yakin mau menghapus template "${selectedTemplate}"? Aksi ini tidak bisa dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        tone="danger"
        onConfirm={deleteTemplate}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
