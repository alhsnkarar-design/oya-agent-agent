import { NextResponse } from "next/server";
import { createProject, listProjects } from "../../../lib/store";

export async function GET() {
  return NextResponse.json(await listProjects());
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { prompt?: unknown };
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) return NextResponse.json({ error: "اكتب وصفاً للتطبيق" }, { status: 400 });
  if (prompt.length > 4000) return NextResponse.json({ error: "الوصف طويل جداً" }, { status: 400 });
  const project = await createProject(prompt);
  return NextResponse.json({ id: project.id });
}
