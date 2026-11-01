// Demo mode: used when no ANTHROPIC_API_KEY is set. Produces a small sample
// app so the whole editor flow can be tried without AI calls.
import type { AgentEvent } from "./events";

export function demoFiles(title: string): Record<string, string> {
  const safe = title.replace(/[`$\\]/g, "").slice(0, 40) || "تطبيقي";
  return {
    "App.js": `import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, Pressable, FlatList, StyleSheet } from "react-native";
import TaskRow from "./components/TaskRow";

export default function App() {
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState([
    { id: "1", title: "جرّب إضافة مهمة", done: false },
    { id: "2", title: "اضغط على مهمة لإنهائها", done: true },
  ]);

  const add = () => {
    if (!text.trim()) return;
    setTasks([{ id: String(Date.now()), title: text.trim(), done: false }, ...tasks]);
    setText("");
  };

  const toggle = (id) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
      <Text style={styles.title}>${safe}</Text>
      <Text style={styles.sub}>{tasks.filter((t) => !t.done).length} مهام متبقية</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="مهمة جديدة..."
          onSubmitEditing={add}
        />
        <Pressable style={styles.button} onPress={add}>
          <Text style={styles.buttonText}>إضافة</Text>
        </Pressable>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => <TaskRow task={item} onPress={() => toggle(item.id)} />}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد مهام بعد</Text>}
      />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f7fb" },
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "700", color: "#1d1b3a", textAlign: "right", marginTop: 12 },
  sub: { fontSize: 14, color: "#6b6a85", textAlign: "right", marginBottom: 16 },
  row: { flexDirection: "row-reverse", gap: 8, marginBottom: 16 },
  input: { flex: 1, minWidth: 0, backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, textAlign: "right", borderWidth: 1, borderColor: "#e3e3ef" },
  button: { backgroundColor: "#5b4cf0", borderRadius: 12, paddingHorizontal: 18, justifyContent: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  empty: { textAlign: "center", color: "#9a99b0", marginTop: 40 },
});
`,
    "components/TaskRow.js": `import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

export default function TaskRow({ task, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, task.done && styles.done]}>
      <Text style={styles.check}>{task.done ? "✅" : "⬜️"}</Text>
      <Text style={[styles.text, task.done && styles.doneText]}>{task.title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row-reverse", alignItems: "center", gap: 10, backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 8 },
  done: { opacity: 0.6 },
  check: { fontSize: 18 },
  text: { flex: 1, fontSize: 16, color: "#1d1b3a", textAlign: "right" },
  doneText: { textDecorationLine: "line-through" },
});
`,
  };
}

export async function* runDemo(prompt: string): AsyncGenerator<AgentEvent | { type: "files"; files: Record<string, string> }> {
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const intro =
    "⚠️ وضع تجريبي: لا يوجد مفتاح ANTHROPIC_API_KEY، لذلك هذا تطبيق نموذجي ثابت وليس مبنياً من وصفك. " +
    "أضف المفتاح في ملف ‎.env.local‎ ليكتب الذكاء الاصطناعي تطبيقك فعلاً.\n\n";
  for (const word of intro.split(" ")) {
    yield { type: "text", text: word + " " };
    await wait(15);
  }
  const files = demoFiles(prompt.split(/\s+/).slice(0, 4).join(" "));
  for (const path of Object.keys(files)) {
    await wait(200);
    yield { type: "file", path, action: "write" };
  }
  yield { type: "files", files };
  yield { type: "text", text: "\nجاهز. جرّب التطبيق في المعاينة على اليسار." };
}
