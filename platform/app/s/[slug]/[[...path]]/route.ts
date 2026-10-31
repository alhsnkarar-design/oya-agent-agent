import { getDb } from "@/lib/server/db";
import { serveSite } from "@/lib/server/sites";
import { safePath } from "@/lib/parse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string; path?: string[] }> };

export async function GET(req: Request, { params }: Ctx) {
  const { slug, path = [] } = await params;
  const url = new URL(req.url);
  // relative links (css/style.css) only resolve correctly under a trailing slash
  if (!path.length && !url.pathname.endsWith("/")) {
    return Response.redirect(`${url.origin}${url.pathname}/${url.search}`, 308);
  }
  const rel = path.length ? safePath(path.map(decodeURIComponent).join("/")) : "";
  const site = rel === null ? null : await (await getDb()).getSite(slug.toLowerCase());
  return serveSite(req, site, rel ?? "");
}
