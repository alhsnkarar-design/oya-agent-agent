"use client";
import type { Project } from "./storage";
import { deleteProject as deleteLocal, listProjects as listLocal } from "./storage";

export interface Me {
  user: { id: string; email: string; name: string } | null;
  signupOpen: boolean;
  requireLogin: boolean;
}

export interface CloudSummary {
  id: string;
  name: string;
  fileCount: number;
  publishedSlug: string | null;
  updatedAt: string;
}

let mePromise: Promise<Me> | null = null;
export function fetchMe(force = false): Promise<Me> {
  if (force || !mePromise) {
    mePromise = fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .catch(() => ({ user: null, signupOpen: true, requireLogin: false }));
  }
  return mePromise;
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || `Error ${res.status}`), { status: res.status });
  return body as T;
}

export const auth = {
  login: (email: string, password: string) =>
    api<{ user: Me["user"] }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string) =>
    api<{ user: Me["user"] }>("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  logout: () => api("/api/auth/logout", { method: "POST" }),
};

export const cloud = {
  list: () => api<{ projects: CloudSummary[] }>("/api/projects").then((r) => r.projects),
  async get(id: string): Promise<Project | null> {
    try {
      const { project } = await api<{ project: Project & { updatedAt: string } }>(`/api/projects/${id}`);
      return { ...project, createdAt: Date.parse(project.updatedAt), updatedAt: Date.parse(project.updatedAt) };
    } catch (e) {
      if ((e as { status?: number }).status === 404) return null;
      throw e;
    }
  },
  save: (p: Project) =>
    api<{ ok: true; publishedSlug: string | null }>(`/api/projects/${p.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: p.name,
        files: p.files,
        assets: p.assets,
        messages: p.messages,
        // older versions are kept locally only; the cloud keeps the last 10 to stay light
        versions: p.versions.slice(-10),
      }),
    }),
  remove: (id: string) => api(`/api/projects/${id}`, { method: "DELETE" }),
  publish: (id: string, slug: string) =>
    api<{ url: string; slug: string }>(`/api/projects/${id}/publish`, { method: "POST", body: JSON.stringify({ slug }) }),
  unpublish: (id: string) => api(`/api/projects/${id}/publish`, { method: "DELETE" }),
};

/** Move projects created before signing in into the account. Returns how many were imported. */
export async function importLocalProjects(): Promise<number> {
  let n = 0;
  for (const p of listLocal()) {
    try {
      await cloud.save({ ...p, assets: p.assets ?? {} });
      deleteLocal(p.id);
      n++;
    } catch {
      /* keep it locally if it fails (e.g. too large) */
    }
  }
  return n;
}

/** Suggest a URL slug from the project name (Latin letters only) or fall back to the id. */
export function suggestSlug(p: Pick<Project, "name" | "id">): string {
  const latin = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
  return latin.length >= 3 ? latin : `site-${p.id.slice(0, 8)}`;
}
