/** Client-side image helpers for user-uploaded assets (logos, photos, design screenshots). */

export interface PendingImage {
  name: string;
  dataUrl: string;
}

const MAX_SIDE = 1600;

/** Downscale and re-encode an image so it is light enough to store, send to the model and publish. */
export async function compressImage(file: File): Promise<PendingImage> {
  const name = file.name.replace(/\.[^.]+$/, "") || "image";
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return { name, dataUrl: await readAsDataUrl(file) };
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  // PNG keeps transparency for logos; photos become JPEG
  const keepAlpha = file.type === "image/png" && bitmap.width * bitmap.height < 600_000;
  const dataUrl = canvas.toDataURL(keepAlpha ? "image/png" : "image/jpeg", 0.85);
  return { name, dataUrl };
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg" };

/** "Company Logo.png" -> "assets/image-1.png" style unique, URL-safe paths. */
export function assetPath(img: PendingImage, taken: Record<string, string>): string {
  const mime = img.dataUrl.slice(5, img.dataUrl.indexOf(";"));
  const ext = EXT[mime] ?? "png";
  const base = img.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "image";
  let p = `assets/${base}.${ext}`;
  for (let i = 2; taken[p]; i++) p = `assets/${base}-${i}.${ext}`;
  return p;
}

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const b64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
