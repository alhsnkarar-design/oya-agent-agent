/**
 * Parser for the model's streamed output protocol:
 *
 *   === PLAN ===
 *   short explanation for the user
 *   === FILE: path/to/file.ext ===
 *   ...full content...
 *   === END FILE ===
 *   === DELETE: path/to/old.html ===
 *   === NOTES ===
 *   short summary
 *
 * Works on partial text so the UI can show files as they are being written.
 */

export type FileMap = Record<string, string>;

export interface ParsedOutput {
  plan: string;
  notes: string;
  files: FileMap; // completed files
  deleted: string[];
  writing: string | null; // file currently being streamed
  writingContent: string;
}

const MARKER = /^=== (PLAN|NOTES|END FILE|FILE: (.+?)|DELETE: (.+?)) ===\s*$/;

export function safePath(raw: string): string | null {
  const parts = raw
    .trim()
    .replace(/^[`'"]+|[`'"]+$/g, "")
    .replace(/\\/g, "/")
    .split("/")
    .filter((p) => p && p !== ".");
  if (!parts.length || parts.some((p) => p === "..")) return null;
  return parts.join("/");
}

function stripFence(s: string): string {
  return s.replace(/^\s*```[\w-]*\n/, "").replace(/\n```\s*$/, "");
}

export function parseOutput(text: string): ParsedOutput {
  const out: ParsedOutput = { plan: "", notes: "", files: {}, deleted: [], writing: null, writingContent: "" };
  let section: "none" | "plan" | "notes" | "file" = "none";
  let current: string | null = null;
  let buf: string[] = [];

  const flush = () => {
    if (section === "plan") out.plan = buf.join("\n").trim();
    if (section === "notes") out.notes = buf.join("\n").trim();
    buf = [];
  };

  for (const line of text.split("\n")) {
    const m = line.startsWith("=== ") ? line.match(MARKER) : null;
    if (!m) {
      buf.push(line);
      continue;
    }
    const [, kind, filePath, delPath] = m;
    if (kind === "END FILE") {
      if (current) out.files[current] = stripFence(buf.join("\n")) + "\n";
      current = null;
      buf = [];
      section = "none";
    } else {
      // tolerate a missing END FILE: a new marker closes the open file
      if (section === "file" && current) out.files[current] = stripFence(buf.join("\n")) + "\n";
      current = null;
      flush();
      if (kind === "PLAN") section = "plan";
      else if (kind === "NOTES") section = "notes";
      else if (filePath) {
        current = safePath(filePath);
        section = "file";
      } else if (delPath) {
        const p = safePath(delPath);
        if (p) out.deleted.push(p);
        section = "none";
      }
    }
  }
  // trailing (possibly incomplete) section
  if (section === "file" && current) {
    out.writing = current;
    out.writingContent = buf.join("\n");
  } else {
    flush();
  }
  return out;
}

/** Apply an edit result on top of existing files. */
export function applyChanges(base: FileMap, parsed: ParsedOutput): FileMap {
  const next: FileMap = { ...base, ...parsed.files };
  for (const d of parsed.deleted) delete next[d];
  return next;
}
