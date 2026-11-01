// Events streamed from /api/projects/[id]/chat to the editor, one JSON per line.
export type AgentEvent =
  | { type: "text"; text: string }
  | { type: "file"; path: string; action: "write" | "delete" }
  | { type: "done"; version: number }
  | { type: "error"; message: string };
