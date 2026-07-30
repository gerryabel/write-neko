
import { NextResponse } from "next/server";
import { continueSchema } from "@/lib/validation";
import { generateText } from "@/lib/openai";
import { addArticle, articlePath, getArticle } from "@/lib/storage";

const JSON_HEADERS = {
  "content-type": "application/json",
  "x-content-type-options": "nosniff",
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = continueSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(", ") || "Invalid request.";
      return NextResponse.json({ error: message }, { status: 400, headers: JSON_HEADERS });
    }
    const { id, direction } = parsed.data;

    const fs = await import("fs/promises");
    const filePath = articlePath(String(id));
    let base;
    try {
      base = await fs.readFile(filePath, "utf-8");
    } catch {
      return NextResponse.json({ error: "File konten sumber tidak ditemukan." }, { status: 404, headers: JSON_HEADERS });
    }

    const source = await getArticle(String(id));
    const baseTitle = source?.judul?.trim() ? source.judul.trim() : "Untitled";
    const trimmed = base.trimEnd();

    let prompt = "";
    let system = "Kamu adalah editor profesional. Bahasa Indonesia yang enak dibaca.";

    if (direction === "shorter") {
      prompt = "Ringkas konten berikut menjadi lebih padat tanpa menghilangkan inti. OUTPUT HANYA hasil ringkasan, tanpa pengantar.\n\n" + trimmed;
      system = "Kamu adalah editor yang ahli merangkum konten.";
    } else if (direction === "longer") {
      prompt = "Perluas konten berikut dengan menambahkan penjelasan, contoh, atau poin pendukung yang relevan. OUTPUT HANYA hasil perluasan, tanpa pengantar.\n\n" + trimmed;
      system = "Kamu adalah penulis yang ahli memperluas konten.";
    } else {
      prompt = "Lanjutkan artikel berikut dengan gaya yang sama. Jangan mengulang isi dari bagian terakhir. OUTPUT HANYA kelanjutan artikel, tanpa pengantar.\n\n" + trimmed;
      system = "Kamu adalah penulis yang melanjutkan artikel dengan alur yang natural.";
    }

    const out = await generateText(prompt, system, 1200);
    const rid = new Date().toISOString().replace(/[:T.]/g, "-").slice(0, 19);
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    const meta = "continue|source=" + id + "|direction=" + direction;

    addArticle({
      id: rid,
      judul: baseTitle + " (" + direction + ")",
      tone: source?.tone ?? "",
      kata_kunci: source?.kata_kunci ?? "",
      created_at: now,
      meta,
      jenis: "continue",
    });

    try { await fs.writeFile(articlePath(rid), out, "utf-8"); } catch {}

    return NextResponse.json({ id: rid, created_at: now, content: out });
  } catch (err) {
    console.error("Continue API error", err);
    const message = err instanceof Error ? err.message : "Gagal melanjutkan konten.";
    return NextResponse.json({ error: message }, { status: 500, headers: JSON_HEADERS });
  }
}
