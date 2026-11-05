// Plays the edit: drives the hidden <video> through the kept ranges, draws each frame to the canvas,
// mixes the original sound, dubbing and sound effects with WebAudio, and records the result for download.
import { audioCtx, pcmToBuffer } from "../lib/audio";
import { sfxBuffer } from "../lib/sfx";
import { outDuration, outToSrc, type Project } from "./model";
import { drawFrame } from "./render";

const SOURCES = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();

export class Player {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  p: Project;
  t = 0;
  playing = false;
  split: number | null = null;
  exporting = false;
  onTime?: (t: number, playing: boolean) => void;
  private seg = 0;
  private raf = 0;
  private ac = audioCtx();
  private master: GainNode;
  private orig: GainNode;
  private duck: GainNode;
  private hp: BiquadFilterNode;
  private presence: BiquadFilterNode;
  private comp: DynamicsCompressorNode;
  private makeup: GainNode;
  private voBufs: AudioBuffer[] = [];
  private voKey = "";
  private nodes: AudioBufferSourceNode[] = [];
  private dubBufs: AudioBuffer[] = [];
  private dubKey = "";
  private endResolve: (() => void) | null = null;

  constructor(video: HTMLVideoElement, canvas: HTMLCanvasElement, p: Project) {
    this.video = video; this.canvas = canvas; this.p = p;
    this.ctx = canvas.getContext("2d", { alpha: false })!;
    this.master = this.ac.createGain(); this.master.connect(this.ac.destination);
    this.orig = this.ac.createGain();
    // original sound: [voice enhance: rumble cut → presence → leveling] → volume → ducking under voice-over
    this.hp = this.ac.createBiquadFilter(); this.hp.type = "highpass";
    this.presence = this.ac.createBiquadFilter(); this.presence.type = "peaking"; this.presence.frequency.value = 3200; this.presence.Q.value = 0.9;
    this.comp = this.ac.createDynamicsCompressor();
    this.makeup = this.ac.createGain();
    this.duck = this.ac.createGain();
    this.hp.connect(this.presence).connect(this.comp).connect(this.makeup).connect(this.orig).connect(this.duck).connect(this.master);
    // a media element can be wired into WebAudio only once
    let srcNode = SOURCES.get(video);
    if (!srcNode) { srcNode = this.ac.createMediaElementSource(video); SOURCES.set(video, srcNode); }
    srcNode.disconnect(); srcNode.connect(this.hp);
    video.addEventListener("seeked", () => { if (!this.playing) this.draw(); });
    video.addEventListener("loadeddata", () => this.draw());
    this.setProject(p);
  }

  setProject(p: Project) {
    const wasPlaying = this.playing;
    if (wasPlaying) this.pause();
    this.p = p;
    this.orig.gain.value = p.dub ? Math.min(p.origVolume, 0.12) : p.origVolume;
    const key = p.dub ? p.dub.lang + ":" + p.dub.clips.length + ":" + p.dub.clips.map((c) => c.t.toFixed(2)).join(",") : "";
    if (key !== this.dubKey) { this.dubKey = key; this.dubBufs = p.dub ? p.dub.clips.map((c) => pcmToBuffer(c.pcm, c.rate)) : []; }
    const vo = p.vo ?? [];
    const vkey = vo.map((c) => c.t.toFixed(2) + c.text.length).join(",");
    if (vkey !== this.voKey) { this.voKey = vkey; this.voBufs = vo.map((c) => pcmToBuffer(c.pcm, c.rate)); }
    this.setEnhance(!!p.enhance);
    const D = outDuration(p);
    if (this.t > D) this.t = 0;
    if (wasPlaying) void this.play(); else this.seek(this.t);
  }

  get duration() { return outDuration(this.p); }

  private setEnhance(on: boolean) {
    this.hp.frequency.value = on ? 90 : 10;
    this.presence.gain.value = on ? 3.5 : 0;
    this.comp.threshold.value = on ? -24 : 0; this.comp.ratio.value = on ? 3.5 : 1;
    this.comp.knee.value = on ? 12 : 0; this.comp.attack.value = 0.008; this.comp.release.value = 0.2;
    this.makeup.gain.value = on ? 1.5 : 1;
  }

  setMuted(m: boolean) { this.master.gain.value = m ? 0 : 1; }

  draw() { drawFrame(this.ctx, this.p, this.video, this.t, { split: this.exporting ? null : this.split }); }

  private segAt(src: number) {
    const i = this.p.segs.findIndex((g) => src >= g.s - 0.001 && src < g.e);
    return i < 0 ? 0 : i;
  }

  seek(t: number) {
    this.t = Math.max(0, Math.min(this.duration, t));
    const src = outToSrc(this.p, this.t);
    this.seg = this.segAt(src);
    if (Math.abs(this.video.currentTime - src) > 0.03) this.video.currentTime = src; else this.draw();
    this.onTime?.(this.t, this.playing);
  }

  private stopNodes() { for (const n of this.nodes) { try { n.stop(); } catch { /* already stopped */ } } this.nodes = []; }

  private async schedule() {
    this.stopNodes();
    const now = this.ac.currentTime + 0.05, t0 = this.t;
    const at = (t: number, buf: AudioBuffer, gain: number, rate = 1) => {
      const end = t + buf.duration / rate;
      if (end <= t0) return;
      const n = this.ac.createBufferSource(); n.buffer = buf; n.playbackRate.value = rate;
      const g = this.ac.createGain(); g.gain.value = gain; n.connect(g).connect(this.master);
      const off = Math.max(0, t0 - t) * rate;
      n.start(now + Math.max(0, t - t0), off);
      this.nodes.push(n);
    };
    if (this.p.dub) this.p.dub.clips.forEach((c, i) => {
      const b = this.dubBufs[i]; if (!b) return;
      // fit long lines into their slot by speeding up a little (max 1.25×)
      const rate = Math.min(1.25, Math.max(1, b.duration / Math.max(0.3, c.dur)));
      at(c.t, b, 1, rate);
    });
    // voice-over: play the narration and lower the original sound under it
    const d = this.duck.gain;
    d.cancelScheduledValues(this.ac.currentTime); d.setValueAtTime(1, this.ac.currentTime);
    (this.p.vo ?? []).forEach((c, i) => {
      const b = this.voBufs[i]; if (!b) return;
      at(c.t, b, 1);
      const s = now + Math.max(0, c.t - t0), e = now + Math.max(0, c.t + b.duration - t0);
      if (e <= now) return;
      if (c.t <= t0) d.setValueAtTime(0.25, now); else { d.setValueAtTime(1, Math.max(now, s - 0.2)); d.linearRampToValueAtTime(0.25, s); }
      d.setValueAtTime(0.25, e); d.linearRampToValueAtTime(1, e + 0.3);
    });
    for (const s of this.p.sfx) at(s.t, await sfxBuffer(s.kind), s.vol);
  }

  async play() {
    if (this.playing) return;
    if (this.t >= this.duration - 0.05) this.seek(0);
    if (this.ac.state === "suspended") await this.ac.resume();
    this.playing = true;
    const src = outToSrc(this.p, this.t);
    this.seg = this.segAt(src);
    this.video.currentTime = src;
    try { await this.video.play(); } catch { this.playing = false; return; }
    await this.schedule();
    const loop = () => {
      if (!this.playing) return;
      const segs = this.p.segs;
      let g = segs[this.seg];
      const v = this.video.currentTime;
      if (g && v >= g.e - 0.02) {
        this.seg++;
        g = segs[this.seg];
        if (!g) { this.finish(); return; }
        this.video.currentTime = g.s;
      }
      if (g) {
        let acc = 0; for (let i = 0; i < this.seg; i++) acc += segs[i].e - segs[i].s;
        this.t = acc + Math.max(0, Math.min(g.e, this.video.currentTime) - g.s);
      }
      this.draw();
      this.onTime?.(this.t, true);
      if (this.video.ended) { this.finish(); return; }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private finish() {
    this.pause();
    this.t = this.duration;
    this.onTime?.(this.t, false);
    this.endResolve?.(); this.endResolve = null;
  }

  pause() {
    this.playing = false;
    this.duck.gain.cancelScheduledValues(this.ac.currentTime); this.duck.gain.setValueAtTime(1, this.ac.currentTime);
    cancelAnimationFrame(this.raf);
    this.video.pause();
    this.stopNodes();
    this.onTime?.(this.t, false);
  }

  /** Records the edit in real time and returns the file. */
  async export(onProgress: (k: number) => void): Promise<{ blob: Blob; ext: string }> {
    this.pause();
    this.exporting = true;
    this.seek(0);
    await new Promise((r) => setTimeout(r, 250));
    const vstream = this.canvas.captureStream(30);
    const dest = this.ac.createMediaStreamDestination();
    this.master.connect(dest);
    const types = ["video/mp4;codecs=avc1.42E01F,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    const mimeType = types.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
    const rec = new MediaRecorder(new MediaStream([...vstream.getVideoTracks(), ...dest.stream.getAudioTracks()]), {
      ...(mimeType ? { mimeType } : {}), videoBitsPerSecond: 9_000_000, audioBitsPerSecond: 160_000,
    });
    const parts: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && parts.push(e.data);
    const done = new Promise<void>((r) => (rec.onstop = () => r()));
    const ended = new Promise<void>((r) => (this.endResolve = r));
    const prev = this.onTime;
    this.onTime = (t, pl) => { prev?.(t, pl); onProgress(Math.min(1, t / Math.max(0.1, this.duration))); };
    rec.start(500);
    await this.play();
    await ended;
    await new Promise((r) => setTimeout(r, 300));
    rec.stop();
    await done;
    this.onTime = prev;
    this.exporting = false;
    this.master.disconnect(dest);
    vstream.getTracks().forEach((t) => t.stop());
    const type = rec.mimeType || mimeType || "video/webm";
    return { blob: new Blob(parts, { type }), ext: type.includes("mp4") ? "mp4" : "webm" };
  }

  destroy() { this.pause(); }
}
