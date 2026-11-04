import Anthropic from "@anthropic-ai/sdk";
import { getProject, saveProject } from "../../../../../lib/store";
import { runAgent } from "../../../../../lib/agent";
import { runDemo } from "../../../../../lib/demo";
import type { AgentEvent } from "../../../../../lib/events";

export const runtime = "nodejs";
export const maxDuration = 800;

// One turn at a time per project.
const busy = new Set<string>();

function errorText(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return "مفتاح ANTHROPIC_API_KEY غير صالح.";
  if (e instanceof Anthropic.RateLimitError) return "تم تجاوز حد الطلبات. حاول بعد قليل.";
  if (e instanceof Anthropic.BadRequestError) return "طلب غير صالح: " + e.message;
  if (e instanceof Anthropic.APIError) return `خطأ من خدمة الذكاء الاصطناعي (${e.status ?? "?"}).`;
  if (e instanceof Anthropic.APIConnectionError) return "تعذّر الاتصال بخدمة الذكاء الاصطناعي.";
  return "حدث خطأ غير متوقع.";
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { message?: unknown };
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 8000) : "";
  const project = await getProject(id).catch(() => null);
  if (!project) return new Response("not found", { status: 404 });
  if (!message) return new Response("empty message", { status: 400 });
  if (busy.has(id)) return new Response("busy", { status: 409 });
  busy.add(id);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: AgentEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      project.chat.push({ role: "user", text: message });
      const reply = { role: "assistant" as const, text: "", files: [] as string[], error: undefined as string | undefined };
      const before = JSON.stringify(project.files);
      try {
        if (process.env.ANTHROPIC_API_KEY) {
          for await (const e of runAgent(project, message)) {
            if (e.type === "text") reply.text += e.text;
            if (e.type === "file") reply.files.push(e.path);
            if (e.type === "error") reply.error = e.message;
            send(e);
          }
        } else {
          for await (const e of runDemo(message)) {
            if (e.type === "files") { project.files = { ...e.files }; continue; }
            if (e.type === "text") reply.text += e.text;
            if (e.type === "file") reply.files.push(e.path);
            send(e);
          }
        }
      } catch (e) {
        console.error(e);
        reply.error = errorText(e);
        send({ type: "error", message: reply.error });
      }
      if (JSON.stringify(project.files) !== before) project.version += 1;
      project.chat.push(reply);
      await saveProject(project);
      busy.delete(id);
      send({ type: "done", version: project.version });
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
