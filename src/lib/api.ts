export async function callApi<T>(
  pathname: string,
  method: "GET" | "POST",
  payload?: unknown
): Promise<T> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  const url = new URL(pathname, base);
  const res = await fetch(url.toString(), {
    method,
    headers: { "content-type": "application/json" },
    body: method === "POST" ? JSON.stringify(payload ?? {}) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Request failed with ${res.status}`;
    try {
      const err = await res.json();
      if (err?.error) message = err.error;
    } catch {}
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export async function generateContent(payload: {
  topic: string;
  keywords?: string;
  tone?: string;
  targetKata?: number;
  preset?: string;
}) {
  return callApi<{ id: string; judul: string; content: string }>("/api/generate", "POST", payload);
}

export async function rewriteContent(payload: {
  id: string;
  tone?: string;
  keywords?: string;
}) {
  return callApi<{ id: string; content: string }>("/api/rewrite", "POST", payload);
}

export async function analyzeSeo(payload: {
  text: string;
  keywords?: string;
  title?: string;
}) {
  return callApi<{ score: number; suggestions: string[] }>("/api/seo", "POST", payload);
}

export async function getSettings() {
  return callApi<{ apiKey: string; model: string }>("/api/settings", "GET");
}

export async function saveSettings(payload: { apiKey: string; model: string }) {
  return callApi<{ ok: boolean }>("/api/settings", "POST", payload);
}
