
import { NextResponse } from "next/server";
import { rewriteSchema } from "@/lib/validation";
import { generateText } from "@/lib/openai";
import { addArticle, articlePath, getArticle } from "@/lib/storage";

const JSON_HEADERS = {
  "content-type": "application/json",
  "x-content-type-options": "nosniff",
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = rewriteSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(", ") || "Invalid request.";
      return NextResponse.json({ error: message }, { status: 400, headers: JSON_HEADERS });
    }
    const { id, tone, keywords, targetKata } = parsed.data;

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
    const toneVal = String(tone ?? "casual").trim();
    const kwVal = String(keywords ?? "").trim();
    const targetKataVal = Number(targetKata ?? 500);
    const kwNote = kwVal ? " Gunakan juga kata kunci: " + kwVal + "." : "";
    const prompt = "Rewrite konten ini menjadi lebih menarik, lebih mudah dibaca, tanpa mengubah makna inti.\n\n" + base + "\n\nGunakan tone " + toneVal + ". " + kwNote + " Targetkan sekitar " + String(targetKataVal) + " kata.\n\nOUTPUT HANYA hasil rewrite. Jangan tambahkan pengantar seperti 'Tentu, ini versi yang sudah disesuaikan'. Jangan tambahkan catatan, penjelasan, atau kalimat pembuka apapun. Langsung ke konten hasil rewrite.";
    const out = await generateText(prompt, "Kamu adalah editor profesional. Bahasa Indonesia yang enak dibaca.", 1500);
    const rid = new Date().toISOString().replace(/[:T.]/g, "-").slice(0, 19);
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");

    addArticle({
      id: rid,
      judul: baseTitle + " (rewrite)",
      tone: toneVal,
      kata_kunci: kwVal,
      created_at: now,
      meta: "rewrite|source=" + id,
      jenis: "rewrite",
    });

    try { await fs.writeFile(articlePath(rid), out, "utf-8"); } catch {}

    return NextResponse.json({ id: rid, created_at: now, tone: toneVal, kata_kunci: kwVal, content: out });
  } catch (err) {
    console.error("Rewrite API error", err);
    const message = err instanceof Error ? err.message : "Gagal rewrite konten.";
    return NextResponse.json({ error: message }, { status: 500, headers: JSON_HEADERS });
  }
}
