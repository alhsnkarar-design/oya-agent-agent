// The coding agent: Claude writes and edits the files of an Expo / React
// Native app through two tools, in a loop, streaming its progress.
import Anthropic from "@anthropic-ai/sdk";
import type { AgentEvent } from "./events";
import type { Project } from "./store";

const MODEL = "claude-opus-5-5";
const MAX_STEPS = 12;

const SYSTEM = `You are the engineer inside an AI mobile-app builder. The user describes an app (often in Arabic); you build it as an Expo / React Native project by calling the write_file and delete_file tools.

Rules for the code:
- Entry file is App.js with a default-exported component. Put other components in components/, screens in screens/, data in data/.
- JavaScript (.js) only. Import only from "react", "react-native" and the project's own files with relative paths. No other packages (no navigation libraries, no icon packs, no expo-* modules): build tabs, stacks and icons yourself with state, Pressable and emoji.
- The app runs in a phone-sized web preview through react-native-web, then on real devices. Use only cross-platform react-native APIs, StyleSheet, SafeAreaView, FlatList, ScrollView, TextInput, Pressable, Image with https URIs.
- Never put padding on SafeAreaView (the platform overrides it); wrap content in a View with the padding.
- Design it well: clear hierarchy, generous spacing, one accent colour, rounded cards. Fill it with realistic sample data so every screen looks alive. Handle empty states.
- If the user writes in Arabic, the app's text is Arabic and the layout is right-to-left (textAlign "right", flexDirection "row-reverse" where rows should read right to left).
- Write complete files every time (no placeholders, no "rest unchanged"). Keep each file under ~300 lines; split into components instead.

How to work:
- On the first message, plan briefly, then write all the files of a working first version.
- On later messages, change only what is needed; re-read the current files listed below before editing.
- When the user reports an error, find the cause in the code and fix it.
- Finish with two or three short sentences, in the user's language, saying what you built or changed. No code in the final message.`;

const tools: Anthropic.Beta.BetaToolUnion[] = [
  {
    name: "write_file",
    description:
      "Create or overwrite one file of the app with its complete content. Paths are relative to the project root, e.g. App.js or components/Card.js.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Relative file path ending in .js" },
        content: { type: "string", description: "The full file content" },
      },
      required: ["path", "content"],
      additionalProperties: false,
    },
    strict: true,
    eager_input_streaming: true,
  },
  {
    name: "delete_file",
    description: "Delete one file of the app that is no longer used.",
    input_schema: {
      type: "object",
      properties: { path: { type: "string", description: "Relative file path" } },
      required: ["path"],
      additionalProperties: false,
    },
    strict: true,
    eager_input_streaming: true,
  },
];

function validPath(p: unknown): p is string {
  return (
    typeof p === "string" &&
    p.length > 0 &&
    p.length < 200 &&
    !p.startsWith("/") &&
    !p.split("/").includes("..") &&
    /^[A-Za-z0-9_./-]+$/.test(p)
  );
}

function filesSnapshot(files: Record<string, string>): string {
  const names = Object.keys(files).sort();
  if (names.length === 0) return "The project is empty.";
  return (
    "Current project files:\n\n" +
    names.map((n) => `<file path="${n}">\n${files[n]}\n</file>`).join("\n\n")
  );
}

/**
 * Runs one user turn. Mutates project.files and project.history in place;
 * the caller saves the project afterwards.
 */
export async function* runAgent(
  project: Project,
  userText: string,
): AsyncGenerator<AgentEvent> {
  const client = new Anthropic();

  // Each user turn carries the current files, so the model edits what is
  // really there (the user may have changed nothing, or restored a version).
  project.history.push({
    role: "user",
    content: [
      { type: "text", text: filesSnapshot(project.files) },
      { type: "text", text: userText },
    ],
  });

  for (let step = 0; step < MAX_STEPS; step++) {
    const queue: AgentEvent[] = [];
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 64000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "high" },
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      tools,
      messages: project.history,
    });
    stream.on("text", (text) => queue.push({ type: "text", text }));

    // Relay text deltas while the request runs.
    let finished = false;
    let failure: unknown = null;
    const final = stream.finalMessage().then(
      (m) => {
        finished = true;
        return m;
      },
      (e) => {
        finished = true;
        failure = e;
        return null;
      },
    );
    while (!finished || queue.length) {
      while (queue.length) yield queue.shift()!;
      if (!finished) await new Promise((r) => setTimeout(r, 40));
    }
    const message = await final;
    if (!message) throw failure;

    // Keep the assistant turn exactly as returned (thinking blocks included).
    project.history.push({ role: "assistant", content: message.content });

    if (message.stop_reason === "refusal") {
      yield { type: "error", message: "رفض النموذج هذا الطلب. جرّب صياغة أخرى." };
      return;
    }
    if (message.stop_reason !== "tool_use") {
      if (message.stop_reason === "max_tokens") {
        yield { type: "error", message: "توقّف الرد لأنه طويل جداً. اطلب تعديلاً أصغر." };
      }
      return;
    }

    const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    for (const block of message.content) {
      if (block.type !== "tool_use") continue;
      const input = block.input as { path?: unknown; content?: unknown };
      let result = "ok";
      let isError = false;
      if (!validPath(input.path)) {
        result = "Invalid or missing path. Use a relative path like components/Card.js.";
        isError = true;
      } else if (block.name === "write_file") {
        if (typeof input.content !== "string") {
          result = "Missing content. Send the complete file content.";
          isError = true;
        } else {
          project.files[input.path] = input.content;
          yield { type: "file", path: input.path, action: "write" };
        }
      } else if (block.name === "delete_file") {
        delete project.files[input.path];
        yield { type: "file", path: input.path, action: "delete" };
      } else {
        result = `Unknown tool ${block.name}`;
        isError = true;
      }
      results.push({ type: "tool_result", tool_use_id: block.id, content: result, is_error: isError });
    }
    // All results go back in one user message.
    project.history.push({ role: "user", content: results });
  }
  yield { type: "error", message: "توقّف الوكيل بعد عدد كبير من الخطوات. أرسل رسالة للمتابعة." };
}
