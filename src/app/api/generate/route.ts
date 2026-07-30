
import { NextResponse } from "next/server";
import { generateSchema } from "@/lib/validation";
import { generateText } from "@/lib/openai";
import { addArticle, articlePath } from "@/lib/storage";

const JSON_HEADERS = {
  "content-type": "application/json",
  "x-content-type-options": "nosniff",
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(", ") || "Invalid request.";
      return NextResponse.json({ error: message }, { status: 400, headers: JSON_HEADERS });
    }
    const { topic, keywords, tone, targetKata, preset, instructions } = parsed.data;

    const kwVal = String(keywords ?? "").trim();
    const toneVal = String(tone ?? "netral").trim();
    const presetVal = String(preset ?? "artikel_blog").trim();
    const presetPrompt =
      presetVal === "blog_casual"
        ? "Tulis dengan gaya blog casual, santai dan mudah terhubung."
        : presetVal === "script_short"
          ? "Tulis dalam format script video pendek (60-90 detik), dengan kalimat pendek dan visual yang jelas."
          : presetVal === "linkedin_post"
            ? "Tulis status LinkedIn yang relatable, padat, dan bernilai."
            : presetVal === "email"
              ? "Tulis email yang jelas, sopan, dan mudah dibaca."
              : presetVal === "ad_copy"
                ? "Tulis ad copy yang menarik, singkat, dan memancing aksi."
                : presetVal === "product_description"
                  ? "Tulis deskripsi produk yang jualan, jelas manfaatnya, dan mudah dipahami."
                  : presetVal === "newsletter"
                    ? "Tulis newsletter yang engaging, ringkas, dan punya alur pembaca."
                    : "Tulis dengan struktur artikel blog: pendahuluan, 3-5 poin utama, penutup actionable.";

    const templateInstruction = instructions ? "\n\n" + String(instructions).trim() : "";
    const prompt = presetPrompt + templateInstruction + "\n\nTopik: " + topic + "\nTone: " + toneVal + (kwVal ? "\nKata kunci: " + kwVal : "") + "\nTarget kata: " + String(targetKata ?? 500);
    const system = "Kamu adalah asisten penulis AI. Jawab dalam Bahasa Indonesia, tanpa pengantar atau meta komentar.";
    const out = await generateText(prompt, system, 1200);

    const rid = new Date().toISOString().replace(/[:T.]/g, "-").slice(0, 19);
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    const meta = "preset=" + presetVal;

    addArticle({
      id: rid,
      judul: String(topic).trim() || "Untitled",
      tone: toneVal,
      kata_kunci: kwVal,
      created_at: now,
      meta,
      jenis: "artikel_blog",
    });

    try {
      await import("fs/promises").then((m) => m.writeFile(articlePath(rid), out, "utf-8"));
    } catch {}

    return NextResponse.json({ id: rid, created_at: now, content: out, judul: String(topic).trim() || "Untitled" });
  } catch (err) {
    console.error("Generate API error", err);
    const message = err instanceof Error ? err.message : "Gagal generate konten.";
    return NextResponse.json({ error: message }, { status: 500, headers: JSON_HEADERS });
  }
}
