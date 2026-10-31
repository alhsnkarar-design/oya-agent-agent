import { activeProvider, streamGeneration, type InputImage } from "@/lib/llm";
import { currentUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { BUILD_SYSTEM, EDIT_SYSTEM, buildUserMessage, type ChatTurn } from "@/lib/prompts";
import type { FileMap } from "@/lib/parse";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Separator between the model text and the final JSON status line. */
const END = "\u001e";
const MAX_PROMPT = 8000;
const MAX_FILES_BYTES = 800_000;
const MAX_IMAGES = 4;
const MAX_IMAGE_CHARS = 2_100_000; // ~1.5MB binary as base64

export async function GET() {
  return Response.json({ provider: activeProvider(), protected: Boolean(process.env.BANNAA_ACCESS_CODE) });
}

export async function POST(req: Request) {
  const code = process.env.BANNAA_ACCESS_CODE;
  if (code && req.headers.get("x-access-code") !== code) {
    return Response.json({ error: "Invalid access code" }, { status: 401 });
  }

  const user = await currentUser();
  if (process.env.REQUIRE_LOGIN === "true" && !user) {
    return Response.json({ error: "Log in to start building", needLogin: true }, { status: 401 });
  }
  const limit = Number(process.env.DAILY_LIMIT || 0);
  if (user && limit > 0) {
    const used = await (await getDb()).incrementUsage(user.id, new Date().toISOString().slice(0, 10));
    if (used > limit) {
      return Response.json({ error: `You've reached today's limit of ${limit} generations. It resets tomorrow.` }, { status: 429 });
    }
  }

  let body: { prompt?: string; files?: FileMap; history?: ChatTurn[]; images?: InputImage[]; assets?: string[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const prompt = (body.prompt ?? "").trim();
  if (!prompt) return Response.json({ error: "Describe what you want to build" }, { status: 400 });
  if (prompt.length > MAX_PROMPT) return Response.json({ error: "That description is too long" }, { status: 413 });

  const files: FileMap = {};
  for (const [k, v] of Object.entries(body.files ?? {})) if (typeof v === "string") files[k] = v;
  if (JSON.stringify(files).length > MAX_FILES_BYTES) {
    return Response.json({ error: "The project is larger than the allowed size" }, { status: 413 });
  }
  const history = (body.history ?? []).filter((t) => t && (t.role === "user" || t.role === "assistant"));
  const isEdit = Object.keys(files).length > 0;
  const images = (Array.isArray(body.images) ? body.images : [])
    .filter((i) => i && typeof i.path === "string" && typeof i.dataUrl === "string" && i.dataUrl.length <= MAX_IMAGE_CHARS)
    .slice(0, MAX_IMAGES);
  const assets = (Array.isArray(body.assets) ? body.assets : [])
    .filter((a): a is string => typeof a === "string" && a.startsWith("assets/"))
    .slice(0, 50);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const result = await streamGeneration({
        system: isEdit ? EDIT_SYSTEM : BUILD_SYSTEM,
        user: buildUserMessage({ prompt, files, history, assets, attached: images.map((i) => i.path) }),
        images,
        isEdit,
        signal: req.signal,
        onText: (t) => controller.enqueue(encoder.encode(t)),
      });
      try {
        controller.enqueue(encoder.encode(END + JSON.stringify({ ...result, provider: activeProvider() })));
        controller.close();
      } catch {
        /* client disconnected */
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
