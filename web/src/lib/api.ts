// Calls to the Zifidit Worker. The Worker holds the OpenRouter key and enforces usage limits.
import { idToken } from "./auth";

export class ApiError extends Error {
  constructor(public code: string, public status: number) { super(code); }
}

async function headers(extra: Record<string, string> = {}) {
  const tok = await idToken();
  return { ...extra, ...(tok ? { Authorization: "Bearer " + tok } : {}) };
}

async function fail(res: Response): Promise<never> {
  let code = "error";
  try { code = ((await res.json()) as { error?: string }).error ?? code; } catch { /* not json */ }
  throw new ApiError(code, res.status);
}

export type Word = { w: string; s: number; e: number };
export type Transcript = { text: string; language?: string; words: Word[]; duration: number };

/** Speech to text with word timestamps. `seconds` is used for usage accounting. */
export async function transcribe(wav: Blob, seconds: number, language?: string): Promise<Transcript> {
  const fd = new FormData();
  fd.append("file", wav, "audio.wav");
  fd.append("seconds", String(Math.ceil(seconds)));
  if (language) fd.append("language", language);
  const res = await fetch("/api/transcribe", { method: "POST", body: fd, headers: await headers() });
  if (!res.ok) return fail(res);
  return res.json();
}

export type ChatMsg = { role: "user" | "assistant"; content: string };
/** Ask Zifidit.Ai. Returns its reply and the edit actions to apply. */
export async function chat(body: { messages: ChatMsg[]; project: unknown; lang: string; mode?: "chat" | "auto_edit" | "translate" }) {
  const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify(body), headers: await headers({ "Content-Type": "application/json" }) });
  if (!res.ok) return fail(res);
  return (await res.json()) as { reply: string; actions: unknown[]; lines?: string[] };
}

/** Text to speech. Returns 16-bit mono PCM and its sample rate. */
export async function speak(text: string, voice: string, instructions?: string) {
  const res = await fetch("/api/tts", { method: "POST", body: JSON.stringify({ text, voice, instructions }), headers: await headers({ "Content-Type": "application/json" }) });
  if (!res.ok) return fail(res);
  const ct = res.headers.get("content-type") ?? "";
  const rate = Number(/rate=(\d+)/.exec(ct)?.[1] ?? 24000);
  return { pcm: await res.arrayBuffer(), rate };
}

export async function usage() {
  const res = await fetch("/api/usage", { headers: await headers() });
  if (!res.ok) return null;
  return (await res.json()) as { plan: string; used: Record<string, number>; limits: Record<string, number> };
}

/** Whether the AI is ready (key present, valid, with credit). Costs nothing. */
export async function health(): Promise<{ ai: boolean; reason?: string } | null> {
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}
