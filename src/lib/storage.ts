import * as Database from "better-sqlite3";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { SavedArticle } from "./types";

const ARTICLES_DIR = path.join(process.cwd(), "saved_articles");
const DB_PATH = path.join(ARTICLES_DIR, "articles.db");

export function articlePath(articleId: string): string {
  return path.join(ARTICLES_DIR, `${articleId}.md`);
}

let dbPromise: Promise<Database.Database> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      await fs.mkdir(ARTICLES_DIR, { recursive: true });
      const db = new (Database as unknown as { new (path: string): Database.Database })(DB_PATH);
      db.pragma("journal_mode = WAL");
      db.exec(
        `CREATE TABLE IF NOT EXISTS articles (
          id TEXT PRIMARY KEY,
          judul TEXT NOT NULL DEFAULT '',
          tone TEXT NOT NULL DEFAULT '',
          kata_kunci TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL DEFAULT '',
          meta TEXT NOT NULL DEFAULT '',
          jenis TEXT NOT NULL DEFAULT 'artikel_blog',
          favorite INTEGER NOT NULL DEFAULT 0
        )`
      );
      return db;
    })();
  }
  return dbPromise;
}

export async function listArticles(): Promise<SavedArticle[]> {
  const db = await getDb();
  const rows = db.prepare("SELECT id, judul, tone, kata_kunci, created_at, meta, jenis, favorite FROM articles ORDER BY created_at DESC").all() as SavedArticle[];
  const out: SavedArticle[] = [];
  for (const row of rows) {
    let body = "";
    const p = articlePath(row.id);
    try { body = await fs.readFile(p, "utf-8"); } catch {}
    out.push({ ...row, body });
  }
  return out;
}

export async function getArticle(articleId: string): Promise<SavedArticle | null> {
  const all = await listArticles();
  return all.find((x) => x.id === articleId) ?? null;
}

export async function addArticle(record: { id: string; judul: string; tone: string; kata_kunci: string; created_at: string; meta: string; jenis: string; favorite?: number }) {
  const db = await getDb();
  try {
    db.exec(`ALTER TABLE articles ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0`);
  } catch {}
  const stmt = db.prepare(
    `INSERT OR REPLACE INTO articles (id, judul, tone, kata_kunci, created_at, meta, jenis, favorite)
     VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, 0))`
  );
  stmt.run(record.id, record.judul, record.tone, record.kata_kunci, record.created_at, record.meta, record.jenis, record.favorite ?? 0);
}

export async function deleteArticle(articleId: string): Promise<void> {
  const db = await getDb();
  db.prepare("DELETE FROM articles WHERE id = ?").run(articleId);
  const p = articlePath(articleId);
  try { await fs.unlink(p); } catch {}
}

export async function initSettings() {
  const db = await getDb();
  db.exec(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '')`);
  const cols = db.prepare("PRAGMA table_info(settings)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "value")) {
    db.exec("ALTER TABLE settings ADD COLUMN value TEXT NOT NULL DEFAULT ''");
  }
}

export async function readSettings() {
  return readOpenRouterSettings();
}

export async function readSetting(key: string): Promise<string> {
  const db = await getDb();
  await initSettings();
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? "";
}

export async function writeSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await initSettings();
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
}

export async function readOpenRouterSettings() {
  const apiKey = await readSetting("OPENROUTER_API_KEY");
  const model = (await readSetting("OPENROUTER_MODEL")).trim() || "openrouter/owl-alpha";
  return { apiKey, model };
}
