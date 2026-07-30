import { readOpenRouterSettings } from "./storage";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

function headers(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost",
    "X-Title": "Write Neko",
  };
}

export async function generateText(prompt: string, systemPrompt = "You are a helpful AI writing assistant.", maxTokens = 1200) {
  const { apiKey, model } = await readOpenRouterSettings();
  const key = apiKey.trim();
  if (!key) {
    throw new Error("OpenRouter API key belum diisi.");
  }
  const body = JSON.stringify({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: maxTokens,
  });

  const req = new Request(API_URL, {
    method: "POST",
    headers: headers(key),
    body,
  });

  const res = await fetch(req);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[API Error ${res.status}] ${text || res.statusText}`);
  }
  const payload = await res.json();
  if (!payload?.choices?.length) throw new Error("Respons API tidak valid.");
  return payload.choices[0].message.content as string;
}

export async function readSettings() {
  return readOpenRouterSettings();
}
