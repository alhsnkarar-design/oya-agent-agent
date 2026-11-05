// zifidit.com Worker.
// - Serves the built site (deploy/site) from the public repo, pinned to the commit in SITE_REF.
// - /api/*: OpenRouter proxy (speech-to-text, Zifidit.Ai chat, text-to-speech) with per-user limits in D1.
// Bindings: DB (D1), OPENROUTER_API_KEY (secret), SITE_REF, FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_APP_ID.
// No template literals in this file (it is uploaded inside one).

const REPO = "https://raw.githubusercontent.com/alhsnkarar-design/oya-agent-agent/";
const OR = "https://openrouter.ai/api/v1";
const STT_MODEL = "openai/whisper-large-v3-turbo";
const STT_FALLBACK = "openai/whisper-large-v3";
const CHAT_MODEL = "google/gemini-2.5-flash";
const TTS_MODEL = "google/gemini-3.8-flash-lite-tts";

// Until payments open, signed-in users get a trial allowance per month and guests a small one per day.
const LIMITS = {
  guest: { stt: 240, tts: 700, chat: 15 },
  trial: { stt: 900, tts: 3000, chat: 60 },
};

const SEC = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "Permissions-Policy": "camera=(), geolocation=(), microphone=(self)" };
const TYPES = { js: "text/javascript; charset=utf-8", css: "text/css; charset=utf-8", html: "text/html; charset=utf-8", svg: "image/svg+xml", webp: "image/webp", png: "image/png", jpg: "image/jpeg", woff2: "font/woff2", woff: "font/woff", txt: "text/plain; charset=utf-8", json: "application/json" };

const json = (body, status) => new Response(JSON.stringify(body), { status: status || 200, headers: Object.assign({}, SEC, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }) });

/* ---------- static site ---------- */

async function asset(path, env) {
  const ref = env.SITE_REF || "claude/auto-motion-graphics-site-rqo0y3";
  const ext = (path.split(".").pop() || "").toLowerCase();
  const immutable = path.startsWith("/assets/");
  const res = await fetch(REPO + ref + "/deploy/site" + path, { cf: { cacheTtl: immutable ? 31536000 : 300, cacheEverything: true } });
  if (!res.ok) return null;
  return new Response(res.body, { headers: Object.assign({}, SEC, { "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "public, max-age=300" }) });
}

/* ---------- auth (Firebase ID tokens) ---------- */

let jwks = null, jwksAt = 0;
function b64u(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
async function verifyFirebase(tok, projectId) {
  try {
    const parts = tok.split(".");
    if (parts.length !== 3) return null;
    const dec = new TextDecoder();
    const head = JSON.parse(dec.decode(b64u(parts[0])));
    const body = JSON.parse(dec.decode(b64u(parts[1])));
    if (head.alg !== "RS256") return null;
    if (!jwks || Date.now() - jwksAt > 3600000) {
      jwks = await (await fetch("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")).json();
      jwksAt = Date.now();
    }
    const jwk = (jwks.keys || []).find(function (k) { return k.kid === head.kid; });
    if (!jwk) return null;
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64u(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]));
    const now = Date.now() / 1000;
    if (!ok || body.aud !== projectId || body.iss !== "https://securetoken.google.com/" + projectId || body.exp < now || !body.sub) return null;
    const provider = body.firebase && body.firebase.sign_in_provider;
    if (provider === "password" && !body.email_verified) return null;
    return body;
  } catch (e) { return null; }
}

async function who(request, env) {
  const h = request.headers.get("Authorization") || "";
  if (h.startsWith("Bearer ") && env.FIREBASE_PROJECT_ID) {
    const u = await verifyFirebase(h.slice(7), env.FIREBASE_PROJECT_ID);
    if (u) return { subject: "u:" + u.sub, plan: "trial", period: new Date().toISOString().slice(0, 7), email: u.email || null };
  }
  const ip = request.headers.get("CF-Connecting-IP") || "0";
  return { subject: "ip:" + ip, plan: "guest", period: new Date().toISOString().slice(0, 10), email: null };
}

/* ---------- usage ---------- */

async function used(env, me) {
  const out = { stt: 0, tts: 0, chat: 0 };
  if (!env.DB) return out;
  const r = await env.DB.prepare("SELECT kind, amount FROM usage WHERE subject = ?1 AND period = ?2").bind(me.subject, me.period).all();
  for (const row of r.results || []) out[row.kind] = row.amount;
  return out;
}
async function allow(env, me, kind, amount) {
  const u = await used(env, me);
  return u[kind] + amount <= LIMITS[me.plan][kind];
}
async function add(env, me, kind, amount) {
  if (!env.DB) return;
  await env.DB.prepare("INSERT INTO usage (subject, period, kind, amount) VALUES (?1, ?2, ?3, ?4) ON CONFLICT(subject, period, kind) DO UPDATE SET amount = amount + excluded.amount")
    .bind(me.subject, me.period, kind, amount).run();
}

function orHeaders(env, extra) {
  return Object.assign({ Authorization: "Bearer " + env.OPENROUTER_API_KEY, "HTTP-Referer": "https://zifidit.com", "X-Title": "Zifidit" }, extra || {});
}
function upstreamError(res) {
  if (res.status === 402) return json({ error: "ai_unavailable" }, 503);
  if (res.status === 401 || res.status === 403) return json({ error: "not_configured" }, 503);
  if (res.status === 429) return json({ error: "busy" }, 503);
  return json({ error: "upstream", status: res.status }, 502);
}

/* ---------- speech to text ---------- */

function wordsFrom(j) {
  const words = [];
  const raw = j.words || [];
  for (const w of raw) {
    const t = String(w.word || w.text || "").trim();
    if (t) words.push({ w: t, s: Number(w.start) || 0, e: Number(w.end) || Number(w.start) || 0 });
  }
  if (words.length) return words;
  // no word timing: spread each segment's words across the segment
  for (const sg of j.segments || []) {
    const parts = String(sg.text || "").trim().split(/\s+/).filter(Boolean);
    const s = Number(sg.start) || 0, e = Number(sg.end) || s, step = (e - s) / Math.max(1, parts.length);
    parts.forEach(function (p, i) { words.push({ w: p, s: s + i * step, e: s + (i + 1) * step }); });
  }
  return words;
}

async function transcribe(request, env, me) {
  const form = await request.formData();
  const file = form.get("file");
  const seconds = Math.max(1, Math.ceil(Number(form.get("seconds")) || 60));
  if (!file || typeof file === "string") return json({ error: "bad_request" }, 400);
  if (file.size > 25 * 1024 * 1024) return json({ error: "too_large" }, 413);
  if (!(await allow(env, me, "stt", seconds))) return json({ error: "quota" }, 429);
  let res, model = STT_MODEL;
  for (const m of [STT_MODEL, STT_FALLBACK]) {
    model = m;
    const fd = new FormData();
    fd.append("file", file, "audio.wav");
    fd.append("model", m);
    fd.append("response_format", "verbose_json");
    fd.append("timestamp_granularities[]", "word");
    fd.append("timestamp_granularities[]", "segment");
    const lang = form.get("language");
    if (lang) fd.append("language", String(lang));
    res = await fetch(OR + "/audio/transcriptions", { method: "POST", headers: orHeaders(env), body: fd });
    if (res.ok || res.status === 402 || res.status === 401 || res.status === 429) break;
  }
  if (!res.ok) return upstreamError(res);
  const j = await res.json();
  await add(env, me, "stt", seconds);
  return json({ text: String(j.text || ""), language: j.language || null, duration: Number(j.duration) || seconds, words: wordsFrom(j), model: model });
}

/* ---------- Zifidit.Ai ---------- */

const ACTIONS = [
  "auto_edit {instructions?}: full professional automatic edit (cuts, captions, title, zooms, transitions, natural sound effects, color).",
  "cut_silences {min_gap?: seconds, default 0.45}",
  "remove_phrases {items: [{range: \"first-last\" word numbers from the transcript line, text: exact words to cut, all?: boolean}]}: cut filler words, false starts, repeats or any phrase the user names.",
  "remove_range {start, end}: output seconds.",
  "keep_source_ranges {ranges: [{start, end}]}: SOURCE seconds to keep (e.g. the best moments for a 30-second reel); everything else is cut.",
  "reset_cuts {}: restore the full video.",
  "split_at {at}: output seconds. remove_segment {index}.",
  "set_aspect {ratio: \"9:16\" | \"1:1\" | \"16:9\"}",
  "color_grade {preset: none | warm | cool | cinematic | vivid | bw | fade}",
  "captions {on?: boolean, style?: karaoke | bold | minimal | boxed, color?: name or #hex, position?: top | center | bottom, size_scale?: number, original?: true to go back to untranslated captions}",
  "add_title {text, start?, end?, color?, size?: 1 = normal, position?: top | center | bottom, anim?: pop | slide | type | kinetic, box?: boolean, motion?: true for a motion-graphics title}",
  "edit_title {target: \"last\" | \"all\" | title id, text?, color?, size_scale?: e.g. 1.2 = 20% bigger, position?, anim?, start?, end?, box?}",
  "remove_titles {target?: \"all\" | \"last\" | id}",
  "add_zoom {at, duration?: seconds, scale?: 1.05-1.6}   remove_zooms {}",
  "add_transition {at, kind: whip | flash | fade}   auto_transitions {every?: n}   remove_transitions {}",
  "add_sfx {at, kind: whoosh | pop | click | impact | riser | swipe | ding | shutter | typing | heartbeat | tick, volume?: 0-1}   auto_sfx {}   remove_sfx {}  (natural sound effects only, never music)",
  "add_effect {at, kind: shake | punch | glow | light_leak | rgb_split | blur_in | film_grain, duration?: seconds, intensity?: 0.2-1}   auto_effects {}   remove_effects {kind?: one kind or \"all\"}",
  "voiceover {text, at?: output seconds, voice?: Kore (female) | Puck (male) | Charon (deep male) | Aoede (soft female), tone?: delivery instructions}: speak a narration line over the video (the original sound is lowered under it). Write the text in the language the user wants.",
  "remove_voiceover {}",
  "enhance_audio {on?: boolean}: clean up the speaker's voice (cuts rumble, adds clarity, evens the level).",
  "original_volume {value: 0-1}",
  "dub {language, voice?}: translate the speech and replace the voice in that language (any language).",
  "translate_captions {language}",
  "remove_dub {}",
];

function systemPrompt(mode, lang) {
  const replyLang = lang === "ar"
    ? "Reply in Arabic, in friendly Egyptian colloquial (عامية مصرية), short: one or two sentences."
    : "Reply in English, friendly and short: one or two sentences.";
  if (mode === "translate") {
    return "You translate video speech for dubbing and captions. Input JSON: {target, lines}. Return ONLY JSON {\"lines\": [...]} with exactly one translated string per input line, same order. " +
      "Translate into the target language naturally, as people speak it, keeping each line about as long as the original so it fits the same time. " +
      "If the target is an Arabic dialect (Egyptian, Gulf, Levantine), write in that dialect. Keep names and brand names. No notes.";
  }
  const base = "You are Zifidit.Ai, the AI video editor inside zifidit.com. You edit the user's uploaded video by returning edit actions. " +
    "You never add music; only natural sound effects. You never invent footage. " +
    "Times: titles, zooms, transitions, sound effects and remove_range use OUTPUT seconds (the 'out' times in the transcript). keep_source_ranges uses SOURCE seconds ('src'). " +
    "Transcript lines look like '#12-20 src 3.40-6.10s out 2.10s: words' where 12-20 are the word numbers. " +
    "Colors: gold, white, yellow, red, blue, green, pink, purple, orange, black, cream, or #hex. " +
    "Return ONLY a JSON object: {\"reply\": string, \"actions\": [ {\"type\": ..., ...} ]}. " + replyLang + "\n\nActions:\n- " + ACTIONS.join("\n- ");
  if (mode === "auto_edit") {
    return base + "\n\nTask: plan a professional human-quality edit of this video. Silences are already cut. Return actions that: " +
      "cut filler words, false starts and repeated takes with remove_phrases (only clear cases); " +
      "add a short hook title (max 6 words, in the video's language) at the start with add_title (position top, anim pop or kinetic, color gold); " +
      "turn captions on (karaoke, gold) unless the user said otherwise; " +
      "add 3 to 8 add_zoom on emphasised moments (scale 1.1-1.2); add_transition (whip or flash) at the 2 to 5 biggest topic changes; " +
      "add_sfx: whoosh just before each transition, pop when the title appears, a light impact on the strongest moment; " +
      "add_effect: punch or shake on the 1 to 3 strongest moments (with a light impact sound), a light_leak or rgb_split on one or two transitions, blur_in at 0; keep it tasteful; " +
      "turn on enhance_audio when there is speech; " +
      "pick a color_grade that suits the video (usually warm or cinematic). Do not add a voiceover unless the user asks for one. Follow any extra instructions from the user. " +
      "In reply, summarise what you did in one or two sentences.";
  }
  return base + "\n\nTask: do what the user asks with the right actions, using the transcript and current state. " +
    "If the user asks for a full or automatic edit, use auto_edit. If they ask to dub or translate the voice, use dub. " +
    "If they want narration or a voice saying something, use voiceover. If they want visual effects, use add_effect or auto_effects, usually with matching natural sound effects. " +
    "If they ask for something you cannot do (music, generating new footage), say so kindly and suggest the closest thing. " +
    "If the request is just conversation, reply with no actions.";
}

function parseJson(s) {
  try { return JSON.parse(s); } catch (e) { /* fall through */ }
  const m = /\{[\s\S]*\}/.exec(s || "");
  if (m) { try { return JSON.parse(m[0]); } catch (e) { /* ignore */ } }
  return null;
}

async function chat(request, env, me) {
  const body = await request.json().catch(function () { return null; });
  if (!body) return json({ error: "bad_request" }, 400);
  const mode = body.mode === "auto_edit" || body.mode === "translate" ? body.mode : "chat";
  if (!(await allow(env, me, "chat", 1))) return json({ error: "quota" }, 429);
  const lang = body.lang === "en" ? "en" : "ar";
  const messages = [{ role: "system", content: systemPrompt(mode, lang) }];
  if (mode === "translate") {
    const lines = Array.isArray(body.project && body.project.lines) ? body.project.lines.slice(0, 400).map(String) : [];
    messages.push({ role: "user", content: JSON.stringify({ target: String((body.project && body.project.target) || "English"), lines: lines }) });
  } else {
    messages.push({ role: "user", content: "Current project state (JSON):\n" + JSON.stringify(body.project || {}).slice(0, 60000) });
    const hist = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
    for (const m of hist) if (m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") messages.push({ role: m.role, content: m.content.slice(0, 4000) });
  }
  const res = await fetch(OR + "/chat/completions", {
    method: "POST", headers: orHeaders(env, { "Content-Type": "application/json" }),
    body: JSON.stringify({ model: CHAT_MODEL, messages: messages, response_format: { type: "json_object" }, temperature: 0.3, max_tokens: 4000 }),
  });
  if (!res.ok) return upstreamError(res);
  const j = await res.json();
  const content = j.choices && j.choices[0] && j.choices[0].message ? j.choices[0].message.content : "";
  const out = parseJson(typeof content === "string" ? content : JSON.stringify(content)) || {};
  await add(env, me, "chat", 1);
  if (mode === "translate") return json({ reply: "", actions: [], lines: Array.isArray(out.lines) ? out.lines.map(String) : [] });
  const actions = Array.isArray(out.actions) ? out.actions.filter(function (a) { return a && typeof a.type === "string"; }).slice(0, 80) : [];
  return json({ reply: typeof out.reply === "string" ? out.reply : "", actions: actions });
}

/* ---------- text to speech ---------- */

async function tts(request, env, me) {
  const body = await request.json().catch(function () { return null; });
  const text = body && typeof body.text === "string" ? body.text.trim().slice(0, 1200) : "";
  if (!text) return json({ error: "bad_request" }, 400);
  if (!(await allow(env, me, "tts", text.length))) return json({ error: "quota" }, 429);
  const res = await fetch(OR + "/audio/speech", {
    method: "POST", headers: orHeaders(env, { "Content-Type": "application/json" }),
    body: JSON.stringify({ model: TTS_MODEL, input: text, voice: typeof body.voice === "string" ? body.voice : "Kore", response_format: "pcm", instructions: typeof body.instructions === "string" ? body.instructions.slice(0, 300) : undefined }),
  });
  if (!res.ok) return upstreamError(res);
  await add(env, me, "tts", text.length);
  return new Response(res.body, { headers: Object.assign({}, SEC, { "Content-Type": res.headers.get("content-type") || "audio/pcm;rate=24000;channels=1", "Cache-Control": "no-store" }) });
}

/* ---------- router ---------- */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname.startsWith("www.")) { url.hostname = url.hostname.slice(4); return Response.redirect(url.toString(), 301); }
    const path = url.pathname;

    if (path.startsWith("/api/")) {
      try {
        if (path === "/api/config") {
          const fb = env.FIREBASE_API_KEY && env.FIREBASE_PROJECT_ID
            ? { apiKey: env.FIREBASE_API_KEY, authDomain: env.FIREBASE_AUTH_DOMAIN || (env.FIREBASE_PROJECT_ID + ".firebaseapp.com"), projectId: env.FIREBASE_PROJECT_ID, appId: env.FIREBASE_APP_ID || undefined }
            : null;
          return json({ firebase: fb });
        }
        const me = await who(request, env);
        if (path === "/api/usage") return json({ plan: me.plan, used: await used(env, me), limits: LIMITS[me.plan] });
        if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
        if (!env.OPENROUTER_API_KEY) return json({ error: "not_configured" }, 503);
        if (path === "/api/transcribe") return await transcribe(request, env, me);
        if (path === "/api/chat") return await chat(request, env, me);
        if (path === "/api/tts") return await tts(request, env, me);
        return json({ error: "not_found" }, 404);
      } catch (e) {
        console.error("api error", e && e.stack ? e.stack : e);
        return json({ error: "server_error" }, 500);
      }
    }

    if (/^\/(assets|gallery)\/[\w.\-]+$/.test(path) || path === "/favicon.svg" || path === "/robots.txt") {
      const r = await asset(path, env);
      return r || new Response("Not found", { status: 404 });
    }
    const page = await asset("/index.html", env);
    if (!page) return new Response("Zifidit: الصفحة مش متاحة دلوقتي، جرّب بعد دقيقة.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    return new Response(page.body, { headers: Object.assign({}, SEC, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" }) });
  },
};
