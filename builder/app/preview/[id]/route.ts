import { getProject } from "../../../lib/store";
import { previewHtml } from "../../../lib/preview";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id).catch(() => null);
  if (!project) return new Response("not found", { status: 404 });
  return new Response(previewHtml(project.files), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
