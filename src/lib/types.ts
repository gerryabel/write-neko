export interface ArticleRecord {
  id: string;
  judul: string;
  tone: string;
  kata_kunci: string;
  created_at: string;
  meta: string;
  jenis: string;
  favorite?: number;
}

export interface SavedArticle extends ArticleRecord {
  body: string;
}
