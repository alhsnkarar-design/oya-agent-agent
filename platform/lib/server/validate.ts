import type { ProjectData } from "./db";

export const MAX_PROJECT_BYTES = 6_000_000;
export const MAX_ASSET_BYTES = 1_500_000;
const ID = /^[a-z0-9]{6,40}$/i;
export const SLUG = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
const RESERVED = new Set(["api", "admin", "www", "app", "login", "build", "static", "assets", "bannaa"]);

export const validId = (id: string) => ID.test(id);
export const validSlug = (s: string) => SLUG.test(s) && !RESERVED.has(s);

const isStrMap = (v: unknown): v is Record<string, string> =>
  !!v && typeof v === "object" && !Array.isArray(v) && Object.values(v).every((x) => typeof x === "string");

/** Validate a project document coming from the browser. Returns an error message or the clean data. */
export function parseProjectBody(body: unknown): { name: string; data: ProjectData } | string {
  if (!body || typeof body !== "object") return "Invalid request";
  const b = body as Record<string, unknown>;
  const name = String(b.name ?? "").trim().slice(0, 120) || "Untitled project";
  const files = b.files ?? {};
  const assets = b.assets ?? {};
  if (!isStrMap(files) || !isStrMap(assets)) return "Invalid files";
  for (const [p, v] of Object.entries(assets)) {
    if (!p.startsWith("assets/") || !/^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,/.test(v)) return `Invalid asset: ${p}`;
    if (v.length > MAX_ASSET_BYTES * 1.4) return `Image is too large: ${p}`;
  }
  const messages = Array.isArray(b.messages) ? b.messages.slice(-200) : [];
  const versions = Array.isArray(b.versions) ? b.versions.slice(-10) : [];
  const data: ProjectData = { files, assets, messages, versions };
  if (JSON.stringify(data).length > MAX_PROJECT_BYTES) return "The project is larger than the 6MB limit";
  return { name, data };
}
