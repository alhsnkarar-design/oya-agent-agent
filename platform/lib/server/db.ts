import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Pool } from "pg";

/**
 * Data layer with two interchangeable drivers:
 *  - Postgres (DATABASE_URL) — Supabase, Neon, RDS, any Postgres. Tables are created automatically.
 *  - Local JSON file (.data/db.json) — zero-config for development or a single small server.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

/** Everything the editor needs; stored as one JSON document per project. */
export interface ProjectData {
  files: Record<string, string>;
  assets: Record<string, string>; // path -> data URL
  messages: unknown[];
  versions: unknown[];
}

export interface ProjectRecord {
  id: string;
  userId: string;
  name: string;
  data: ProjectData;
  publishedSlug: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  fileCount: number;
  publishedSlug: string | null;
  updatedAt: string;
}

export interface Site {
  slug: string;
  projectId: string;
  userId: string;
  files: Record<string, string>;
  assets: Record<string, string>;
  updatedAt: string;
}

export class ConflictError extends Error {}

export interface Db {
  createUser(email: string, name: string, passwordHash: string): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  listProjects(userId: string): Promise<ProjectSummary[]>;
  getProject(userId: string, id: string): Promise<ProjectRecord | null>;
  saveProject(userId: string, id: string, name: string, data: ProjectData): Promise<ProjectRecord>;
  deleteProject(userId: string, id: string): Promise<boolean>;
  getSite(slug: string): Promise<Site | null>;
  publishSite(slug: string, userId: string, projectId: string, data: Pick<ProjectData, "files" | "assets">): Promise<Site>;
  unpublishProject(userId: string, projectId: string): Promise<void>;
  incrementUsage(userId: string, day: string): Promise<number>;
}

const now = () => new Date().toISOString();

function summary(p: ProjectRecord): ProjectSummary {
  return {
    id: p.id,
    name: p.name,
    fileCount: Object.keys(p.data.files ?? {}).length,
    publishedSlug: p.publishedSlug,
    updatedAt: p.updatedAt,
  };
}

// ----------------------------------------------------------------------------- Postgres

const SCHEMA = `
create table if not exists bannaa_users (
  id text primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);
create table if not exists bannaa_projects (
  id text primary key,
  user_id text not null references bannaa_users(id) on delete cascade,
  name text not null,
  data jsonb not null,
  published_slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bannaa_projects_user_idx on bannaa_projects(user_id, updated_at desc);
create table if not exists bannaa_sites (
  slug text primary key,
  project_id text not null unique references bannaa_projects(id) on delete cascade,
  user_id text not null references bannaa_users(id) on delete cascade,
  files jsonb not null,
  assets jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists bannaa_usage (
  user_id text not null references bannaa_users(id) on delete cascade,
  day text not null,
  count integer not null default 0,
  primary key (user_id, day)
);`;

/* eslint-disable @typescript-eslint/no-explicit-any */
const rowUser = (r: any): User => ({
  id: r.id,
  email: r.email,
  name: r.name,
  passwordHash: r.password_hash,
  createdAt: new Date(r.created_at).toISOString(),
});
const rowProject = (r: any): ProjectRecord => ({
  id: r.id,
  userId: r.user_id,
  name: r.name,
  data: r.data,
  publishedSlug: r.published_slug,
  createdAt: new Date(r.created_at).toISOString(),
  updatedAt: new Date(r.updated_at).toISOString(),
});
const rowSite = (r: any): Site => ({
  slug: r.slug,
  projectId: r.project_id,
  userId: r.user_id,
  files: r.files,
  assets: r.assets,
  updatedAt: new Date(r.updated_at).toISOString(),
});

class PgDb implements Db {
  private ready: Promise<void>;
  constructor(private pool: Pool) {
    this.ready = pool.query(SCHEMA).then(() => undefined);
  }
  private async q(sql: string, params: unknown[] = []) {
    await this.ready;
    return this.pool.query(sql, params);
  }
  async createUser(email: string, name: string, passwordHash: string) {
    try {
      const r = await this.q(
        "insert into bannaa_users (id, email, name, password_hash) values ($1,$2,$3,$4) returning *",
        [randomUUID(), email, name, passwordHash],
      );
      return rowUser(r.rows[0]);
    } catch (e: any) {
      if (e?.code === "23505") throw new ConflictError("email");
      throw e;
    }
  }
  async getUserByEmail(email: string) {
    const r = await this.q("select * from bannaa_users where email = $1", [email]);
    return r.rows[0] ? rowUser(r.rows[0]) : null;
  }
  async getUserById(id: string) {
    const r = await this.q("select * from bannaa_users where id = $1", [id]);
    return r.rows[0] ? rowUser(r.rows[0]) : null;
  }
  async listProjects(userId: string) {
    const r = await this.q(
      `select id, name, published_slug, updated_at, created_at, user_id,
              jsonb_build_object('files', coalesce(data->'files','{}'::jsonb)) as data
         from bannaa_projects where user_id = $1 order by updated_at desc limit 200`,
      [userId],
    );
    return r.rows.map((x) => summary(rowProject(x)));
  }
  async getProject(userId: string, id: string) {
    const r = await this.q("select * from bannaa_projects where id = $1 and user_id = $2", [id, userId]);
    return r.rows[0] ? rowProject(r.rows[0]) : null;
  }
  async saveProject(userId: string, id: string, name: string, data: ProjectData) {
    const r = await this.q(
      `insert into bannaa_projects (id, user_id, name, data) values ($1,$2,$3,$4)
       on conflict (id) do update set name = excluded.name, data = excluded.data, updated_at = now()
         where bannaa_projects.user_id = excluded.user_id
       returning *`,
      [id, userId, name, JSON.stringify(data)],
    );
    if (!r.rows[0]) throw new ConflictError("project");
    return rowProject(r.rows[0]);
  }
  async deleteProject(userId: string, id: string) {
    const r = await this.q("delete from bannaa_projects where id = $1 and user_id = $2", [id, userId]);
    return (r.rowCount ?? 0) > 0;
  }
  async getSite(slug: string) {
    const r = await this.q("select * from bannaa_sites where slug = $1", [slug]);
    return r.rows[0] ? rowSite(r.rows[0]) : null;
  }
  async publishSite(slug: string, userId: string, projectId: string, data: Pick<ProjectData, "files" | "assets">) {
    await this.ready;
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const taken = await client.query("select project_id from bannaa_sites where slug = $1 for update", [slug]);
      if (taken.rows[0] && taken.rows[0].project_id !== projectId) throw new ConflictError("slug");
      await client.query("delete from bannaa_sites where project_id = $1 and slug <> $2", [projectId, slug]);
      const r = await client.query(
        `insert into bannaa_sites (slug, project_id, user_id, files, assets) values ($1,$2,$3,$4,$5)
         on conflict (slug) do update set files = excluded.files, assets = excluded.assets, updated_at = now()
         returning *`,
        [slug, projectId, userId, JSON.stringify(data.files), JSON.stringify(data.assets)],
      );
      await client.query("update bannaa_projects set published_slug = $1 where id = $2 and user_id = $3", [slug, projectId, userId]);
      await client.query("commit");
      return rowSite(r.rows[0]);
    } catch (e) {
      await client.query("rollback");
      throw e;
    } finally {
      client.release();
    }
  }
  async unpublishProject(userId: string, projectId: string) {
    await this.q("delete from bannaa_sites where project_id = $1 and user_id = $2", [projectId, userId]);
    await this.q("update bannaa_projects set published_slug = null where id = $1 and user_id = $2", [projectId, userId]);
  }
  async incrementUsage(userId: string, day: string) {
    const r = await this.q(
      `insert into bannaa_usage (user_id, day, count) values ($1,$2,1)
       on conflict (user_id, day) do update set count = bannaa_usage.count + 1 returning count`,
      [userId, day],
    );
    return r.rows[0].count as number;
  }
}

// ----------------------------------------------------------------------------- JSON file

interface FileState {
  users: User[];
  projects: ProjectRecord[];
  sites: Site[];
  usage: Record<string, number>;
}

class FileDb implements Db {
  private state: FileState | null = null;
  private chain: Promise<unknown> = Promise.resolve();
  constructor(private file: string) {}

  private async load(): Promise<FileState> {
    if (this.state) return this.state;
    try {
      this.state = JSON.parse(await fs.readFile(this.file, "utf8"));
    } catch {
      this.state = { users: [], projects: [], sites: [], usage: {} };
    }
    return this.state!;
  }
  /** Serialise all access so concurrent requests can't interleave writes. */
  private run<T>(fn: (s: FileState) => T | Promise<T>, write = false): Promise<T> {
    const next = this.chain.then(async () => {
      const s = await this.load();
      const out = await fn(s);
      if (write) {
        await fs.mkdir(path.dirname(this.file), { recursive: true });
        const tmp = this.file + ".tmp";
        await fs.writeFile(tmp, JSON.stringify(s));
        await fs.rename(tmp, this.file);
      }
      return structuredClone(out);
    });
    this.chain = next.catch(() => undefined);
    return next;
  }

  createUser(email: string, name: string, passwordHash: string) {
    return this.run((s) => {
      if (s.users.some((u) => u.email === email)) throw new ConflictError("email");
      const u: User = { id: randomUUID(), email, name, passwordHash, createdAt: now() };
      s.users.push(u);
      return u;
    }, true);
  }
  getUserByEmail(email: string) {
    return this.run((s) => s.users.find((u) => u.email === email) ?? null);
  }
  getUserById(id: string) {
    return this.run((s) => s.users.find((u) => u.id === id) ?? null);
  }
  listProjects(userId: string) {
    return this.run((s) =>
      s.projects
        .filter((p) => p.userId === userId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map(summary),
    );
  }
  getProject(userId: string, id: string) {
    return this.run((s) => s.projects.find((p) => p.id === id && p.userId === userId) ?? null);
  }
  saveProject(userId: string, id: string, name: string, data: ProjectData) {
    return this.run((s) => {
      const existing = s.projects.find((p) => p.id === id);
      if (existing && existing.userId !== userId) throw new ConflictError("project");
      if (existing) {
        Object.assign(existing, { name, data, updatedAt: now() });
        return existing;
      }
      const p: ProjectRecord = { id, userId, name, data, publishedSlug: null, createdAt: now(), updatedAt: now() };
      s.projects.push(p);
      return p;
    }, true);
  }
  deleteProject(userId: string, id: string) {
    return this.run((s) => {
      const before = s.projects.length;
      s.projects = s.projects.filter((p) => !(p.id === id && p.userId === userId));
      s.sites = s.sites.filter((x) => !(x.projectId === id && x.userId === userId));
      return s.projects.length < before;
    }, true);
  }
  getSite(slug: string) {
    return this.run((s) => s.sites.find((x) => x.slug === slug) ?? null);
  }
  publishSite(slug: string, userId: string, projectId: string, data: Pick<ProjectData, "files" | "assets">) {
    return this.run((s) => {
      const taken = s.sites.find((x) => x.slug === slug);
      if (taken && taken.projectId !== projectId) throw new ConflictError("slug");
      s.sites = s.sites.filter((x) => x.projectId !== projectId);
      const site: Site = { slug, projectId, userId, files: data.files, assets: data.assets, updatedAt: now() };
      s.sites.push(site);
      const p = s.projects.find((x) => x.id === projectId && x.userId === userId);
      if (p) p.publishedSlug = slug;
      return site;
    }, true);
  }
  unpublishProject(userId: string, projectId: string) {
    return this.run((s) => {
      s.sites = s.sites.filter((x) => !(x.projectId === projectId && x.userId === userId));
      const p = s.projects.find((x) => x.id === projectId && x.userId === userId);
      if (p) p.publishedSlug = null;
    }, true);
  }
  incrementUsage(userId: string, day: string) {
    return this.run((s) => {
      const k = `${userId}:${day}`;
      s.usage[k] = (s.usage[k] ?? 0) + 1;
      return s.usage[k];
    }, true);
  }
}

// ----------------------------------------------------------------------------- factory

const g = globalThis as unknown as { __bannaaDb?: Db };

export async function getDb(): Promise<Db> {
  if (g.__bannaaDb) return g.__bannaaDb;
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: url,
      max: Number(process.env.DATABASE_POOL_MAX || 5),
      ssl: process.env.DATABASE_SSL === "no-verify" ? { rejectUnauthorized: false } : undefined,
    });
    g.__bannaaDb = new PgDb(pool);
  } else {
    g.__bannaaDb = new FileDb(path.join(process.env.BANNAA_DATA_DIR || path.join(process.cwd(), ".data"), "db.json"));
  }
  return g.__bannaaDb;
}

export function dbDriver(): "postgres" | "file" {
  return process.env.DATABASE_URL ? "postgres" : "file";
}
