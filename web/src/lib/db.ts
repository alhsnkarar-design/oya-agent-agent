// Projects live in this browser (IndexedDB): the edit and the original video file.
import type { Project } from "../editor/model";

type Row = { id: string; project: Project; file: Blob; thumb?: Blob };
let dbp: Promise<IDBDatabase> | null = null;

function db() {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open("zifidit", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("projects", { keyPath: "id" });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}
function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return db().then((d) => new Promise<T>((res, rej) => {
    const r = fn(d.transaction("projects", mode).objectStore("projects"));
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
}

export const saveRow = (row: Row) => tx("readwrite", (s) => s.put(row));
export const getRow = (id: string) => tx<Row | undefined>("readonly", (s) => s.get(id));
export const listRows = () => tx<Row[]>("readonly", (s) => s.getAll());
export const deleteRow = (id: string) => tx("readwrite", (s) => s.delete(id));

export async function saveProject(p: Project) {
  const row = await getRow(p.id);
  if (row) await saveRow({ ...row, project: p });
}

/** A first-frame thumbnail for the projects list. */
export async function makeThumb(file: Blob): Promise<Blob | undefined> {
  const url = URL.createObjectURL(file);
  try {
    const v = document.createElement("video");
    v.muted = true; v.playsInline = true; v.src = url;
    await new Promise<void>((res, rej) => { v.onloadeddata = () => res(); v.onerror = () => rej(); });
    v.currentTime = Math.min(1, v.duration / 3);
    await new Promise<void>((res) => (v.onseeked = () => res()));
    const c = document.createElement("canvas"); c.width = 480; c.height = Math.round(480 * (v.videoHeight / v.videoWidth || 0.5625));
    c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
    return await new Promise<Blob | undefined>((res) => c.toBlob((b) => res(b ?? undefined), "image/jpeg", 0.8));
  } catch { return undefined; } finally { URL.revokeObjectURL(url); }
}
