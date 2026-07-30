import { z } from "zod";

export const generateSchema = z.object({
  topic: z.string().min(3, "Topiknya minimal 3 karakter."),
  keywords: z.string().optional(),
  tone: z.string().optional(),
  targetKata: z.coerce.number().int().min(10).max(5000).optional(),
  preset: z.string().optional(),
  instructions: z.string().optional(),
});

export const continueSchema = z.object({
  id: z.string().min(1, "ID konten dibutuhkan."),
  direction: z.enum(["continue", "shorter", "longer"]).optional(),
});

export const rewriteSchema = z.object({
  id: z.string().min(1, "ID konten dibutuhkan."),
  tone: z.string().optional(),
  keywords: z.string().optional(),
  targetKata: z.coerce.number().int().min(10).max(5000).optional(),
});

export const seoSchema = z.object({
  text: z.string().min(1, "Teks konten dibutuhkan."),
  keywords: z.string().optional(),
  title: z.string().optional(),
});

export const settingsSchema = z.object({
  apiKey: z.string().optional(),
  model: z.string().optional(),
});

export const templatesPostSchema = z.object({
  name: z.string().min(1, "Name is required."),
  prompt: z.string().min(1, "Prompt is required."),
});

export const templatesDeleteSchema = z.object({
  name: z.string().min(1, "Name is required."),
});

export const historyPatchSchema = z.object({
  id: z.string().min(1, "ID konten dibutuhkan."),
  favorite: z.boolean().optional(),
});

export const historyDeleteSchema = z.object({
  id: z.string().min(1, "ID konten dibutuhkan."),
});

const ESC: Record<string, string> = {
  "&": "&",
  "<": "<",
  ">": ">",
  '"': '"',
  "'": "'",
};

export function sanitizeText(input: string): string {
  return String(input).replace(/[&<>"']/g, (ch) => ESC[ch] ?? ch);
}
