// File-based project store. One JSON file per project under .data/projects.
// Swap for Supabase/Postgres later without changing callers.
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type Anthropic from "@anthropic-ai/sdk";

export type ChatItem =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; files: string[]; error?: string };

export interface Project {
  id: string;
  name: string;
  prompt: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  files: Record<string, string>;
  chat: ChatItem[];
  // Full API history (including thinking blocks) so later turns continue the
  // same conversation. Kept append-only.
  history: Anthropic.Beta.BetaMessageParam[];
}

const DIR = path.join(process.cwd(), ".data", "projects");

function fileFor(id: string) {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("bad project id");
  return path.join(DIR, `${id}.json`);
}

export async function createProject(prompt: string): Promise<Project> {
  await fs.mkdir(DIR, { recursive: true });
  const now = new Date().toISOString();
  const name = prompt.trim().split(/\s+/).slice(0, 6).join(" ").slice(0, 60) || "تطبيق جديد";
  const project: Project = {
    id: randomUUID(),
    name,
    prompt,
    createdAt: now,
    updatedAt: now,
    version: 0,
    files: {},
    chat: [],
    history: [],
  };
  await saveProject(project);
  return project;
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    return JSON.parse(await fs.readFile(fileFor(id), "utf8")) as Project;
  } catch {
    return null;
  }
}

export async function saveProject(project: Project): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  project.updatedAt = new Date().toISOString();
  const tmp = `${fileFor(project.id)}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(project));
  await fs.rename(tmp, fileFor(project.id));
}

export async function listProjects(): Promise<Pick<Project, "id" | "name" | "updatedAt">[]> {
  try {
    const names = await fs.readdir(DIR);
    const out = [];
    for (const n of names.filter((f) => f.endsWith(".json"))) {
      const p = await getProject(n.replace(/\.json$/, ""));
      if (p) out.push({ id: p.id, name: p.name, updatedAt: p.updatedAt });
    }
    return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}
