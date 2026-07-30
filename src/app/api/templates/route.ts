
import { NextResponse } from "next/server";
import { templatesPostSchema, templatesDeleteSchema } from "@/lib/validation";

const JSON_HEADERS = {
  "content-type": "application/json",
  "x-content-type-options": "nosniff",
} as const;

const fs = await import("fs/promises");
const path = await import("path");
const TEMPLATES_PATH = path.join(process.cwd(), "saved_articles", "templates.json");

async function readTemplates(): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(TEMPLATES_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeTemplates(data: Record<string, string>) {
  await fs.mkdir(path.dirname(TEMPLATES_PATH), { recursive: true });
  await fs.writeFile(TEMPLATES_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const data = await readTemplates();
  return NextResponse.json({ templates: data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = templatesPostSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(", ") || "Invalid request.";
      return NextResponse.json({ error: message }, { status: 400, headers: JSON_HEADERS });
    }
    const { name, prompt } = parsed.data;

    const existing = await readTemplates();
    existing[String(name)] = String(prompt);
    await writeTemplates(existing);
    return NextResponse.json({ ok: true, templates: existing });
  } catch (err) {
    console.error("Templates POST error", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Gagal menyimpan template." }, { status: 500, headers: JSON_HEADERS });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const parsed = templatesDeleteSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(", ") || "Invalid request.";
      return NextResponse.json({ error: message }, { status: 400, headers: JSON_HEADERS });
    }
    const { name } = parsed.data;

    const existing = await readTemplates();
    delete existing[String(name)];
    await writeTemplates(existing);
    return NextResponse.json({ ok: true, templates: existing });
  } catch (err) {
    console.error("Templates DELETE error", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Gagal menghapus template." }, { status: 500, headers: JSON_HEADERS });
  }
}
