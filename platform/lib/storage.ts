"use client";
import type { FileMap } from "./parse";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: number;
  status?: "streaming" | "done" | "error";
  changed?: string[];
  images?: string[]; // asset paths attached to this message
}

export interface Version {
  id: string;
  at: number;
  label: string;
  files: FileMap;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  files: FileMap;
  assets: Record<string, string>; // "assets/logo.png" -> data URL
  messages: Message[];
  versions: Version[];
  publishedSlug?: string | null;
}

const KEY = "bannaa:projects:v1";
const MAX_VERSIONS = 20;

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

function readAll(): Record<string, Project> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, Project>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // quota exceeded: drop oldest versions everywhere and retry once
    for (const p of Object.values(all)) p.versions = p.versions.slice(-5);
    try {
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch {
      /* give up silently; project stays in memory */
    }
  }
}

export function listProjects(): Project[] {
  return Object.values(readAll()).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getProject(id: string): Project | null {
  const p = readAll()[id];
  return p ? { ...p, assets: p.assets ?? {} } : null;
}

export function saveProject(p: Project) {
  const all = readAll();
  p.versions = p.versions.slice(-MAX_VERSIONS);
  all[p.id] = { ...p, updatedAt: Date.now() };
  writeAll(all);
}

export function deleteProject(id: string) {
  const all = readAll();
  delete all[id];
  writeAll(all);
}

export function newProject(name = "مشروع جديد"): Project {
  const now = Date.now();
  return { id: uid(), name, createdAt: now, updatedAt: now, files: {}, assets: {}, messages: [], versions: [] };
}

export function projectNameFrom(prompt: string): string {
  const words = prompt.replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).slice(0, 5).join(" ");
  return words || "مشروع جديد";
}
