import { NextResponse } from "next/server";
import { getArticle, listArticles, deleteArticle, addArticle } from "@/lib/storage";
import { historyPatchSchema, historyDeleteSchema } from "@/lib/validation";

const JSON_HEADERS = {
  "content-type": "application/json",
  "x-content-type-options": "nosniff",
} as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sort = url.searchParams.get("sort") === "asc" ? "asc" : "desc";
  const q = url.searchParams.get("q")?.toLowerCase() ?? "";
  const typeFilter = url.searchParams.get("type") ?? "";
  const favoriteFilter = url.searchParams.get("favorite") === "1";
  const id = url.searchParams.get("id") ?? "";

  let items = await listArticles();

  if (q) {
    items = items.filter(
      (x) =>
        x.judul.toLowerCase().includes(q) ||
        x.kata_kunci.toLowerCase().includes(q) ||
        x.jenis.toLowerCase().includes(q) ||
        x.created_at.toLowerCase().includes(q)
    );
  }

  if (typeFilter === "source") {
    items = items.filter((x) => x.jenis !== "rewrite");
  }

  if (favoriteFilter) {
    items = items.filter((x) => x.favorite);
  }

  items = [...items].sort((a, b) => {
    const da = new Date(a.created_at).getTime();
    const db = new Date(b.created_at).getTime();
    return sort === "asc" ? da - db : db - da;
  });

  if (id) {
    const item = items.find((x) => x.id === id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404, headers: JSON_HEADERS });
    const fullItem = await getArticle(item.id);
    if (!fullItem) return NextResponse.json({ item });
    return NextResponse.json({ item: { ...fullItem } });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const trimmed = items.map(({ body, ...rest }) => rest);
  return NextResponse.json({ items: trimmed });
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const parsed = historyDeleteSchema.safeParse({ id });
    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(", ") || "Invalid request.";
      return NextResponse.json({ error: message }, { status: 400, headers: JSON_HEADERS });
    }
    const deleteId = parsed.data.id;

    await deleteArticle(deleteId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("History delete error", err);
    const message = err instanceof Error ? err.message : "Gagal menghapus konten.";
    return NextResponse.json({ error: message }, { status: 500, headers: JSON_HEADERS });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = historyPatchSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(", ") || "Invalid request.";
      return NextResponse.json({ error: message }, { status: 400, headers: JSON_HEADERS });
    }
    const { id, favorite } = parsed.data;

    const item = await listArticles().then((all) => all.find((x) => x.id === String(id)));
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404, headers: JSON_HEADERS });

    await addArticle({
      id: item.id,
      judul: item.judul,
      tone: item.tone,
      kata_kunci: item.kata_kunci,
      created_at: item.created_at,
      meta: item.meta,
      jenis: item.jenis,
      favorite: favorite ? 1 : 0,
    });

    return NextResponse.json({ ok: true, favorite: favorite ? 1 : 0 });
  } catch (err) {
    console.error("History patch error", err);
    const message = err instanceof Error ? err.message : "Gagal memperbarui konten.";
    return NextResponse.json({ error: message }, { status: 500, headers: JSON_HEADERS });
  }
}
