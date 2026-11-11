import { newProject } from "../editor/model";
import { makeThumb, saveRow } from "./db";

/** Read a video's size and length, then store it as a new project. */
export async function createProject(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const v = document.createElement("video");
    v.preload = "metadata"; v.muted = true; v.src = url;
    await new Promise<void>((res, rej) => { v.onloadedmetadata = () => res(); v.onerror = () => rej(new Error("video")); });
    const id = crypto.randomUUID();
    const p = newProject(id, file.name.replace(/\.[^.]+$/, "") || "Zifidit", v.duration, v.videoWidth, v.videoHeight);
    await saveRow({ id, project: p, file, thumb: await makeThumb(file) });
    return id;
  } finally { URL.revokeObjectURL(url); }
}

export const fmt = (s: number) => { const m = Math.floor(s / 60), x = Math.floor(s % 60); return `${m}:${String(x).padStart(2, "0")}`; };
