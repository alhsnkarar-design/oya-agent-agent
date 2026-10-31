import Anthropic from "@anthropic-ai/sdk";
import { demoOutput } from "./demo";

/**
 * Streams raw model text. Provider is picked from environment variables:
 *   ANTHROPIC_API_KEY → Claude (official SDK, recommended)
 *   GEMINI_API_KEY / OPENROUTER_API_KEY / OPENAI_API_KEY / LLM_API_KEY → OpenAI-compatible endpoint
 *   none → demo mode
 */

export type Provider = "claude" | "openai-compatible" | "demo";

/** An image attached by the user (data URL), sent to the model for vision. */
export interface InputImage {
  path: string;
  dataUrl: string;
}

function splitDataUrl(url: string): { mediaType: string; data: string } | null {
  const m = url.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/s);
  return m ? { mediaType: m[1], data: m[2] } : null;
}

export interface StreamResult {
  stop: string; // end_turn | max_tokens | refusal | error | demo
  error?: string;
}

export function activeProvider(): Provider {
  if (process.env.ANTHROPIC_API_KEY) return "claude";
  if (compatConfig()) return "openai-compatible";
  return "demo";
}

function compatConfig(): { base: string; key: string; model: string } | null {
  const env = process.env;
  if (env.LLM_API_KEY && env.LLM_BASE_URL)
    return { base: env.LLM_BASE_URL, key: env.LLM_API_KEY, model: env.LLM_MODEL || "gpt-4o" };
  if (env.GEMINI_API_KEY)
    return {
      base: "https://generativelanguage.googleapis.com/v1beta/openai",
      key: env.GEMINI_API_KEY,
      model: env.LLM_MODEL || "gemini-2.5-pro",
    };
  if (env.OPENROUTER_API_KEY)
    return { base: "https://openrouter.ai/api/v1", key: env.OPENROUTER_API_KEY, model: env.LLM_MODEL || "anthropic/claude-opus-5.5" };
  if (env.OPENAI_API_KEY) return { base: "https://api.openai.com/v1", key: env.OPENAI_API_KEY, model: env.LLM_MODEL || "gpt-4o" };
  return null;
}

type Effort = "low" | "medium" | "high" | "xhigh" | "max";

async function streamClaude(
  system: string,
  user: string,
  images: InputImage[],
  onText: (t: string) => void,
  signal: AbortSignal,
): Promise<StreamResult> {
  const client = new Anthropic();
  const useFallbacks = process.env.CLAUDE_FALLBACKS !== "off";
  const params = {
    model: process.env.CLAUDE_MODEL || "claude-opus-5-5",
    max_tokens: 64000,
    system: [{ type: "text" as const, text: system, cache_control: { type: "ephemeral" as const } }],
    messages: [
      {
        role: "user" as const,
        content: [
          ...images.flatMap((img) => {
            const d = splitDataUrl(img.dataUrl);
            return d
              ? [
                  { type: "text" as const, text: `Attached image: ${img.path}` },
                  {
                    type: "image" as const,
                    source: { type: "base64" as const, media_type: d.mediaType as "image/png", data: d.data },
                  },
                ]
              : [];
          }),
          { type: "text" as const, text: user },
        ],
      },
    ],
    output_config: { effort: (process.env.CLAUDE_EFFORT || "high") as Effort },
    ...(useFallbacks ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" } : {}),
  };
  // `fallbacks: "default"` re-runs a refused request on a suitable fallback model server-side.
  const stream = client.beta.messages.stream(params as Parameters<typeof client.beta.messages.stream>[0], { signal });
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") onText(event.delta.text);
  }
  const final = await stream.finalMessage();
  return { stop: final.stop_reason ?? "end_turn" };
}

async function streamCompat(
  system: string,
  user: string,
  images: InputImage[],
  onText: (t: string) => void,
  signal: AbortSignal,
): Promise<StreamResult> {
  const cfg = compatConfig()!;
  const res = await fetch(cfg.base.replace(/\/$/, "") + "/chat/completions", {
    method: "POST",
    signal,
    headers: { Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: cfg.model,
      stream: true,
      max_tokens: Number(process.env.LLM_MAX_TOKENS || 32000),
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: images.length
            ? [
                ...images
                  .filter((i) => splitDataUrl(i.dataUrl))
                  .flatMap((i) => [
                    { type: "text", text: `Attached image: ${i.path}` },
                    { type: "image_url", image_url: { url: i.dataUrl } },
                  ]),
                { type: "text", text: user },
              ]
            : user,
        },
      ],
    }),
  });
  if (!res.ok || !res.body) {
    return { stop: "error", error: `HTTP ${res.status}: ${(await res.text()).slice(0, 300)}` };
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let stop = "end_turn";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const data = line.replace(/^data:\s*/, "").trim();
      if (!data || data === "[DONE]" || !line.startsWith("data:")) continue;
      try {
        const j = JSON.parse(data);
        const delta = j.choices?.[0]?.delta?.content;
        if (delta) onText(delta);
        const fr = j.choices?.[0]?.finish_reason;
        if (fr) stop = fr === "length" ? "max_tokens" : "end_turn";
      } catch {
        /* ignore keep-alive / partial lines */
      }
    }
  }
  return { stop };
}

async function streamDemo(isEdit: boolean, onText: (t: string) => void, signal: AbortSignal): Promise<StreamResult> {
  const text = demoOutput(isEdit);
  for (let i = 0; i < text.length && !signal.aborted; i += 180) {
    onText(text.slice(i, i + 180));
    await new Promise((r) => setTimeout(r, 25));
  }
  return { stop: "demo" };
}

export async function streamGeneration(opts: {
  system: string;
  user: string;
  images?: InputImage[];
  isEdit: boolean;
  onText: (t: string) => void;
  signal: AbortSignal;
}): Promise<StreamResult> {
  const provider = activeProvider();
  try {
    if (provider === "claude") return await streamClaude(opts.system, opts.user, opts.images ?? [], opts.onText, opts.signal);
    if (provider === "openai-compatible") return await streamCompat(opts.system, opts.user, opts.images ?? [], opts.onText, opts.signal);
    return await streamDemo(opts.isEdit, opts.onText, opts.signal);
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return { stop: "error", error: "Rate limit reached — please try again in a moment" };
    if (e instanceof Anthropic.AuthenticationError) return { stop: "error", error: "ANTHROPIC_API_KEY is invalid" };
    if (e instanceof Anthropic.APIError) return { stop: "error", error: `${e.status ?? ""} ${e.message}`.trim() };
    if (opts.signal.aborted) return { stop: "aborted" };
    return { stop: "error", error: e instanceof Error ? e.message : String(e) };
  }
}
