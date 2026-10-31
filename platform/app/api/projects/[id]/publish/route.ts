import { ConflictError, getDb } from "@/lib/server/db";
import { currentUser, jsonError, sameOrigin } from "@/lib/server/auth";
import { validId, validSlug } from "@/lib/server/validate";
import { siteUrl } from "@/lib/server/sites";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

/** Publish the project's current saved files under /s/<slug>/ (or SITES_URL). */
export async function POST(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return jsonError("طلب غير مسموح", 403);
  const user = await currentUser();
  if (!user) return jsonError("سجّل الدخول أولاً", 401);
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const slug = String(body.slug ?? "").trim().toLowerCase();
  if (!validSlug(slug)) {
    return jsonError("الرابط يجب أن يكون 3-40 حرفاً إنجليزياً صغيراً أو أرقاماً أو شرطة (-)", 400);
  }
  const db = await getDb();
  const project = validId(id) ? await db.getProject(user.id, id) : null;
  if (!project) return jsonError("احفظ المشروع أولاً", 404);
  if (!project.data.files["index.html"]) return jsonError("لا توجد صفحة index.html للنشر", 400);
  try {
    await db.publishSite(slug, user.id, id, { files: project.data.files, assets: project.data.assets ?? {} });
  } catch (e) {
    if (e instanceof ConflictError) return jsonError("هذا الرابط مستخدم، اختر رابطاً آخر", 409);
    throw e;
  }
  return Response.json({ ok: true, slug, url: siteUrl(req, slug) });
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return jsonError("طلب غير مسموح", 403);
  const user = await currentUser();
  if (!user) return jsonError("سجّل الدخول أولاً", 401);
  const { id } = await params;
  if (validId(id)) await (await getDb()).unpublishProject(user.id, id);
  return Response.json({ ok: true });
}
