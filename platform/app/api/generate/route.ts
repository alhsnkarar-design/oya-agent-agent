import { activeProvider, streamGeneration } from "@/lib/llm";
import { BUILD_SYSTEM, EDIT_SYSTEM, buildUserMessage, type ChatTurn } from "@/lib/prompts";
import type { FileMap } from "@/lib/parse";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Separator between the model text and the final JSON status line. */
const END = "\u001e";
const MAX_PROMPT = 8000;
const MAX_FILES_BYTES = 800_000;

export async function GET() {
  return Response.json({ provider: activeProvider(), protected: Boolean(process.env.BANNAA_ACCESS_CODE) });
}

export async function POST(req: Request) {
  const code = process.env.BANNAA_ACCESS_CODE;
  if (code && req.headers.get("x-access-code") !== code) {
    return Response.json({ error: "رمز الدخول غير صحيح" }, { status: 401 });
  }

  let body: { prompt?: string; files?: FileMap; history?: ChatTurn[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "طلب غير صالح" }, { status: 400 });
  }
  const prompt = (body.prompt ?? "").trim();
  if (!prompt) return Response.json({ error: "اكتب وصفاً لما تريد بناءه" }, { status: 400 });
  if (prompt.length > MAX_PROMPT) return Response.json({ error: "الوصف طويل جداً" }, { status: 413 });

  const files: FileMap = {};
  for (const [k, v] of Object.entries(body.files ?? {})) if (typeof v === "string") files[k] = v;
  if (JSON.stringify(files).length > MAX_FILES_BYTES) {
    return Response.json({ error: "حجم المشروع أكبر من الحد المسموح" }, { status: 413 });
  }
  const history = (body.history ?? []).filter((t) => t && (t.role === "user" || t.role === "assistant"));
  const isEdit = Object.keys(files).length > 0;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const result = await streamGeneration({
        system: isEdit ? EDIT_SYSTEM : BUILD_SYSTEM,
        user: buildUserMessage({ prompt, files, history }),
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
