
import { NextResponse } from "next/server";
import { readSettings, writeSetting } from "@/lib/storage";
import { settingsSchema, sanitizeText } from "@/lib/validation";

const JSON_HEADERS = {
  "content-type": "application/json",
  "x-content-type-options": "nosniff",
} as const;

function maskApiKey(key = "") {
  const k = String(key).trim();
  if (!k) return "";
  if (k.length <= 8) return `${k.slice(0, 4)}...`;
  return `${k.slice(0, 6)}...****`;
}

export async function GET() {
  const s = await readSettings();
  const model = s.model ?? "openrouter/global";
  return NextResponse.json(
    { apiKey: maskApiKey(s.apiKey ?? ""), model: sanitizeText(model) },
    { headers: JSON_HEADERS }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(", ") || "Invalid request.";
      return NextResponse.json({ error: message }, { status: 400, headers: JSON_HEADERS });
    }
    const { apiKey, model } = parsed.data;
    const apiKeyVal = sanitizeText(String(apiKey ?? "").trim());
    const modelVal = sanitizeText(String(model ?? "").trim()) || "openrouter/global";

    await writeSetting("OPENROUTER_API_KEY", apiKeyVal);
    await writeSetting("OPENROUTER_MODEL", modelVal);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Settings API error", err);
    const message = err instanceof Error ? err.message : "Gagal menyimpan konfigurasi.";
    return NextResponse.json({ error: message }, { status: 500, headers: JSON_HEADERS });
  }
}
