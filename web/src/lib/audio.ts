// Audio helpers: decode a video's soundtrack, cut it into 16 kHz mono WAV chunks for transcription,
// turn TTS PCM into AudioBuffers, find silences, and record the microphone with voice activity detection.

let ctx: AudioContext | null = null;
export function audioCtx() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Decode the soundtrack of a media file. */
export async function decodeFile(file: Blob): Promise<AudioBuffer> {
  const buf = await file.arrayBuffer();
  return await audioCtx().decodeAudioData(buf);
}

/** Resample to 16 kHz mono with an OfflineAudioContext. */
export async function toMono16k(src: AudioBuffer): Promise<Float32Array> {
  const rate = 16000;
  const off = new OfflineAudioContext(1, Math.max(1, Math.ceil(src.duration * rate)), rate);
  const node = off.createBufferSource();
  node.buffer = src;
  node.connect(off.destination);
  node.start();
  const out = await off.startRendering();
  return out.getChannelData(0);
}

export function wavBlob(samples: Float32Array, rate: number): Blob {
  const n = samples.length;
  const view = new DataView(new ArrayBuffer(44 + n * 2));
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); view.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  w(36, "data"); view.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true);
  }
  return new Blob([view.buffer], { type: "audio/wav" });
}

/** Split 16 kHz mono audio into chunks of at most `maxSec`, cutting at the quietest point near each boundary. */
export function chunk16k(s: Float32Array, maxSec = 600): { start: number; samples: Float32Array }[] {
  const rate = 16000, max = maxSec * rate, out: { start: number; samples: Float32Array }[] = [];
  let i = 0;
  while (i < s.length) {
    let end = Math.min(s.length, i + max);
    if (end < s.length) {
      // look back up to 20 s for the quietest 50 ms window
      let best = end, bestE = Infinity;
      for (let j = end; j > end - 20 * rate && j > i + rate; j -= 800) {
        let e = 0; for (let k = j - 800; k < j; k++) e += s[k] * s[k];
        if (e < bestE) { bestE = e; best = j; }
      }
      end = best;
    }
    out.push({ start: i / rate, samples: s.subarray(i, end) });
    i = end;
  }
  return out;
}

/** Quiet stretches longer than `minGap` seconds (RMS over 20 ms windows, threshold relative to the loudness). */
export function findSilences(s: Float32Array, rate = 16000, minGap = 0.45): { s: number; e: number }[] {
  const win = Math.round(rate * 0.02), n = Math.floor(s.length / win);
  const rms = new Float32Array(n);
  for (let w = 0; w < n; w++) { let e = 0; for (let k = w * win; k < (w + 1) * win; k++) e += s[k] * s[k]; rms[w] = Math.sqrt(e / win); }
  const sorted = Array.from(rms).sort((a, b) => a - b);
  const floor = sorted[Math.floor(n * 0.1)] ?? 0, loud = sorted[Math.floor(n * 0.9)] ?? 0.1;
  const th = floor + (loud - floor) * 0.12;
  const out: { s: number; e: number }[] = [];
  let st = -1;
  for (let w = 0; w <= n; w++) {
    const q = w < n && rms[w] < th;
    if (q && st < 0) st = w;
    if (!q && st >= 0) { const a = (st * win) / rate, b = (w * win) / rate; if (b - a >= minGap) out.push({ s: a, e: b }); st = -1; }
  }
  return out;
}

/** 16-bit little-endian mono PCM to an AudioBuffer. */
export function pcmToBuffer(pcm: ArrayBuffer, rate: number): AudioBuffer {
  const v = new Int16Array(pcm.byteLength % 2 ? pcm.slice(0, pcm.byteLength - 1) : pcm);
  const b = audioCtx().createBuffer(1, Math.max(1, v.length), rate);
  const ch = b.getChannelData(0);
  for (let i = 0; i < v.length; i++) ch[i] = v[i] / 32768;
  return b;
}

export function playBuffer(b: AudioBuffer): Promise<void> {
  return new Promise((res) => {
    const n = audioCtx().createBufferSource();
    n.buffer = b; n.connect(audioCtx().destination); n.onended = () => res(); n.start();
  });
}

/* ---------- microphone ---------- */

function pickMime() {
  for (const m of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]) if (MediaRecorder.isTypeSupported(m)) return m;
  return "";
}

/** Record until stop() is called. */
export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const rec = new MediaRecorder(stream, pickMime() ? { mimeType: pickMime() } : undefined);
  const parts: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && parts.push(e.data);
  rec.start();
  const t0 = performance.now();
  return {
    stop: () => new Promise<{ blob: Blob; seconds: number }>((res) => {
      rec.onstop = () => { stream.getTracks().forEach((t) => t.stop()); res({ blob: new Blob(parts, { type: rec.mimeType }), seconds: (performance.now() - t0) / 1000 }); };
      rec.stop();
    }),
    cancel: () => { rec.onstop = null; try { rec.stop(); } catch { /* */ } stream.getTracks().forEach((t) => t.stop()); },
  };
}

/** Any recorded blob to a 16 kHz mono WAV (what the transcription endpoint expects). */
export async function blobToWav16k(b: Blob) {
  const buf = await decodeFile(b);
  const s = await toMono16k(buf);
  return { wav: wavBlob(s, 16000), seconds: buf.duration };
}

/**
 * Live listening: waits for speech, records it, and calls onUtterance when the speaker pauses.
 * Returns a controller to pause (while the assistant talks) and stop.
 */
export async function liveListen(onUtterance: (b: Blob, seconds: number) => void, onLevel?: (v: number) => void) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  const ac = audioCtx();
  const src = ac.createMediaStreamSource(stream);
  const an = ac.createAnalyser(); an.fftSize = 1024; src.connect(an);
  const data = new Float32Array(an.fftSize);
  let rec: MediaRecorder | null = null, parts: Blob[] = [], speaking = false, lastVoice = 0, startT = 0, paused = false, stopped = false;
  let noise = 0.01;
  const mime = pickMime();

  const tick = () => {
    if (stopped) return;
    an.getFloatTimeDomainData(data);
    let e = 0; for (const v of data) e += v * v;
    const rms = Math.sqrt(e / data.length);
    onLevel?.(Math.min(1, rms * 12));
    const now = performance.now();
    if (!speaking) noise = noise * 0.98 + rms * 0.02;
    const loud = rms > Math.max(0.02, noise * 3);
    if (!paused) {
      if (loud) {
        lastVoice = now;
        if (!speaking) {
          speaking = true; startT = now; parts = [];
          rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
          rec.ondataavailable = (ev) => ev.data.size && parts.push(ev.data);
          rec.start(100);
        }
      } else if (speaking && now - lastVoice > 1100) {
        speaking = false;
        const r = rec!, secs = (now - startT) / 1000;
        r.onstop = () => { if (secs > 0.6) onUtterance(new Blob(parts, { type: r.mimeType }), secs); };
        r.stop(); rec = null;
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  return {
    pause: () => { paused = true; if (rec) { rec.onstop = null; rec.stop(); rec = null; speaking = false; } },
    resume: () => { paused = false; noise = 0.01; },
    stop: () => { stopped = true; if (rec) { rec.onstop = null; rec.stop(); } src.disconnect(); stream.getTracks().forEach((t) => t.stop()); },
  };
}
