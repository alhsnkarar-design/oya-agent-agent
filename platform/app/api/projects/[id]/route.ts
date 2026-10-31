import { ConflictError, getDb } from "@/lib/server/db";
import { currentUser, jsonError, sameOrigin } from "@/lib/server/auth";
import { parseProjectBody, validId } from "@/lib/server/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const user = await currentUser();
  if (!user) return jsonError("سجّل الدخول أولاً", 401);
  const { id } = await params;
  const p = validId(id) ? await (await getDb()).getProject(user.id, id) : null;
  if (!p) return jsonError("المشروع غير موجود", 404);
  return Response.json({ project: { id: p.id, name: p.name, ...p.data, publishedSlug: p.publishedSlug, updatedAt: p.updatedAt } });
}

export async function PUT(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return jsonError("طلب غير مسموح", 403);
  const user = await currentUser();
  if (!user) return jsonError("سجّل الدخول أولاً", 401);
  const { id } = await params;
  if (!validId(id)) return jsonError("معرّف غير صالح", 400);
  const parsed = parseProjectBody(await req.json().catch(() => null));
  if (typeof parsed === "string") return jsonError(parsed, 400);
  try {
    const p = await (await getDb()).saveProject(user.id, id, parsed.name, parsed.data);
    return Response.json({ ok: true, updatedAt: p.updatedAt, publishedSlug: p.publishedSlug });
  } catch (e) {
    if (e instanceof ConflictError) return jsonError("المشروع غير موجود", 404);
    throw e;
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return jsonError("طلب غير مسموح", 403);
  const user = await currentUser();
  if (!user) return jsonError("سجّل الدخول أولاً", 401);
  const { id } = await params;
  const ok = validId(id) && (await (await getDb()).deleteProject(user.id, id));
  return ok ? Response.json({ ok: true }) : jsonError("المشروع غير موجود", 404);
}
