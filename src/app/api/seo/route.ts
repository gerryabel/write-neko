
import { NextResponse } from "next/server";
import { seoSchema, sanitizeText } from "@/lib/validation";
import { generateText } from "@/lib/openai";

const JSON_HEADERS = {
  "content-type": "application/json",
  "x-content-type-options": "nosniff",
} as const;

function analyzeSeo(text: string, keywords = "", title = "") {
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  let score = 0;
  const suggestions = [];

  if (wordCount >= 600) score += 25;
  else if (wordCount >= 300) { score += 15; suggestions.push("Panjang konten sudah cukup, tapi targetkan 600+ kata untuk meningkatkan kualitas SEO."); }
  else { score += 5; suggestions.push("Konten terlalu pendek. Targetkan minimal 300 kata agar punya nilai SEO yang lebih baik."); }

  const kws = String(keywords).split(",").map((s) => s.trim()).filter(Boolean);
  const mainKw = kws[0] ?? "";
  if (mainKw) {
    if (mainKw.toLowerCase().includes(String(title).toLowerCase())) score += 25;
    else { score += 5; suggestions.push("Masukkan keyword utama '" + mainKw + "' lebih awal di judul agar pencarian lebih relevan."); }
  }

  const headings = text.split("\n").filter((line) => /^\s*#+\s/.test(line));
  if (headings.length >= 3) score += 25; else { score += 5; suggestions.push("Tambahkan struktur heading yang jelas untuk membantu Google memahami topik."); }

  if (wordCount > 0) {
    const sentences = text.replace(/[?!]/, ".").split(".").map((s) => s.trim()).filter(Boolean);
    const avgLen = sentences.reduce((sum, s) => sum + s.split(/\s+/).filter(Boolean).length, 0) / Math.max(1, sentences.length);
    if (avgLen <= 20) score += 25; else { score += 10; suggestions.push("Beberapa kalimat terlalu panjang. Pecah jadi kalimat lebih pendek untuk keterbacaan."); }
  }

  if (score >= 80) suggestions.unshift("SEO konten sudah bagus. Tinggal sesuaikan gaya dengan tujuan pembaca.");
  else if (score >= 50) suggestions.unshift("SEO konten cukup baik. Tinggal sesuaikan dengan saran di atas.");
  else suggestions.unshift("SEO perlu diperbaiki. Fokus dulu pada panjang konten, kata kunci utama, dan struktur heading.");

  return { score: Math.min(100, score), suggestions: suggestions.slice(0, 8) };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = seoSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(", ") || "Invalid request.";
      return NextResponse.json({ error: message }, { status: 400, headers: JSON_HEADERS });
    }
    const { text, keywords, title } = parsed.data;
    const rawText = sanitizeText(String(text));

    const local = analyzeSeo(rawText, String(keywords ?? ""), String(title ?? ""));
    try {
      const system = "Kamu adalah konsultan SEO. Analisis artikel yang diberikan dan berikan 3-5 saran SEO yang spesifik dan actionable. Jawab dalam Bahasa Indonesia, format: satu saran per baris, tanpa bullet atau numbering.";
      const prompt = "Analisis artikel berikut dari segi SEO dan berikan saran perbaikan:\n\n" + rawText.slice(0, 3000);
      const result = await generateText(prompt, system, 600);
      const aiSuggestions = result.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 5);
      if (aiSuggestions.length) return NextResponse.json({ score: local.score, suggestions: aiSuggestions });
    } catch {}

    return NextResponse.json({ score: local.score, suggestions: local.suggestions });
  } catch (err) {
    console.error("SEO API error", err);
    const message = err instanceof Error ? err.message : "Gagal menganalisis SEO.";
    return NextResponse.json({ error: message }, { status: 500, headers: JSON_HEADERS });
  }
}
