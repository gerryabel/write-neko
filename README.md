<div align="center">

<img src="docs/screenshots/generate.png" alt="Tampilan halaman Generate Write Neko" width="900">

# Write Neko

Asisten menulis AI berbasis web yang menyimpan data secara lokal dan menggunakan OpenRouter untuk inferensi AI. Generate, rewrite, lanjutkan, analisis SEO, dan kelola artikel dalam satu workspace.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

[Repository](https://github.com/gerryabel/write-neko)

</div>

## Tentang

**Write Neko** adalah asisten penulis AI yang berfokus pada pembuatan dan perbaikan konten menggunakan model OpenRouter. Seluruh data aplikasi — artikel, template, dan pengaturan — disimpan di workspace lokal, sehingga tidak membutuhkan akun atau sinkronisasi cloud.

## Fitur

- Generate artikel dari topik dengan tone, kata kunci, target panjang, dan template yang bisa digunakan ulang
- Rewrite artikel yang ada dengan penyesuaian tone dan kata kunci
- Melanjutkan atau meng-expand konten: lanjut natural, lebih pendek, atau lebih panjang
- Analisis SEO dengan skor lokal dan saran opsional dari AI
- Riwayat: pencarian, sorting, preview, copy, download `.md`, hapus, favorit
- Pengaturan: simpan API key dan model OpenRouter
- Manajemen template untuk prompt generasi yang bisa dipakai lagi
- Sidebar bersama dan komponen UI reusable di seluruh halaman

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Bahasa | TypeScript |
| Storage | `better-sqlite3` + file `.md` lokal |
| Validasi | `zod` |
| Download helper | `jszip` |
| Lint | ESLint |

## Menjalankan Secara Lokal

### Prasyarat

- Node.js 20+
- npm

### Instalasi

```bash
git clone https://github.com/gerryabel/write-neko.git
cd write-neko
npm install
```

### Konfigurasi

Buka `/settings` dan simpan API key OpenRouter serta model yang ingin dipakai. Nilai-nilai ini disimpan secara lokal di `saved_articles/articles.db`.

### Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Perintah Tersedia

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan aplikasi dalam mode pengembangan |
| `npm run build` | Membuat build produksi |
| `npm run start` | Menjalankan build produksi |
| `npm run lint` | Memeriksa kualitas kode dengan ESLint |

## Struktur Proyek

```
src/
  app/
    (main)/       # Halaman fitur + shared UI/sidebar
    api/          # Server route handlers
    globals.css
    layout.tsx
    page.tsx      # Root route
  components/     # Reusable client components
  lib/            # Storage, AI client, validation, types
saved_articles/   # Data runtime lokal: DB, markdown exports, templates
```

## Data & Privasi

- Artikel, template, dan pengaturan aplikasi disimpan di workspace lokal.
- AI inference dilakukan melalui OpenRouter; request dikirim keluar sesuai konfigurasi API key/model.
- File runtime di bawah `saved_articles/` tidak ditrack Git dan sebaiknya tidak dibagikan.

## Batasan

- Data tetap di workspace lokal; tidak ada sinkronisasi antar perangkat.
- Kualitas generate bergantung pada model OpenRouter yang dipakai dan penulisan prompt.
- Saran SEO dari AI membutuhkan API key/model OpenRouter yang valid dan bisa gagal saat rate-limited atau tidak tersedia.

---

<div align="center">

Dibuat oleh [Gerry Abel Al Ashby](https://github.com/gerryabel)

</div>
