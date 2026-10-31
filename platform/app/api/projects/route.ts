import { getDb } from "@/lib/server/db";
import { currentUser, jsonError } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return jsonError("Please log in first", 401);
  return Response.json({ projects: await (await getDb()).listProjects(user.id) });
}
