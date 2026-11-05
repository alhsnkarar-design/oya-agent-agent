// Turns the difference between two versions of a project into the checklist shown under Zifidit.Ai's reply.
import { outDuration, type Project } from "./model";

export function describe(a: Project, b: Project, lang: string): string[] {
  const ar = lang === "ar";
  const out: string[] = [];
  const cutA = a.segs.length - 1, cutB = b.segs.length - 1;
  const lost = outDuration(a) - outDuration(b);
  if (!a.transcribed && b.transcribed) out.push(ar ? `اتفرّغ الكلام · ${b.words.length} كلمة` : `Transcribed · ${b.words.length} words`);
  if (Math.abs(lost) > 0.05 || cutB !== cutA) {
    out.push(lost >= 0
      ? (ar ? `شلت ${Math.max(0, cutB - cutA)} سكتة وغلطة · ${lost.toFixed(1)} ث` : `Removed ${Math.max(0, cutB - cutA)} pauses · ${lost.toFixed(1)}s`)
      : (ar ? `رجّعت أجزاء · +${(-lost).toFixed(1)} ث` : `Restored parts · +${(-lost).toFixed(1)}s`));
  }
  if (!a.captions.on && b.captions.on) out.push(ar ? "ضفت كابشن كلمة كلمة" : "Added word-by-word captions");
  if (a.captions.on && !b.captions.on) out.push(ar ? "شلت الكابشن" : "Removed captions");
  if (b.captions.on && a.captions.on && (a.captions.style !== b.captions.style || a.captions.color !== b.captions.color || a.captions.size !== b.captions.size || a.captions.pos !== b.captions.pos)) out.push(ar ? "غيّرت شكل الكابشن" : "Restyled captions");
  if (b.captions.lang && b.captions.lang !== a.captions.lang) out.push(ar ? `ترجمت الكابشن لـ${b.captions.lang}` : `Translated captions to ${b.captions.lang}`);
  const added = b.overlays.filter((o) => !a.overlays.some((x) => x.id === o.id));
  for (const o of added) out.push(ar ? `ضفت عنوان «${o.text}»` : `Added title “${o.text}”`);
  for (const o of b.overlays) {
    const old = a.overlays.find((x) => x.id === o.id);
    if (!old) continue;
    if (old.color !== o.color) out.push(ar ? `العنوان بقى ${o.color}` : `Title set to ${o.color}`);
    if (Math.abs(old.size - o.size) > 0.01) out.push(ar ? `حجم العنوان ${Math.round(o.size * 100)}%` : `Title size ${Math.round(o.size * 100)}%`);
    if (old.text !== o.text) out.push(ar ? `غيّرت نص العنوان` : `Changed title text`);
    if (old.pos !== o.pos) out.push(ar ? `نقلت العنوان` : `Moved the title`);
  }
  if (b.overlays.length < a.overlays.length) out.push(ar ? "شلت عنوان" : "Removed a title");
  if (b.zooms.length > a.zooms.length) out.push(ar ? `ضفت ${b.zooms.length - a.zooms.length} زووم` : `Added ${b.zooms.length - a.zooms.length} zooms`);
  if (b.trans.length > a.trans.length) out.push(ar ? `ضفت ${b.trans.length - a.trans.length} انتقال` : `Added ${b.trans.length - a.trans.length} transitions`);
  if (b.sfx.length !== a.sfx.length) out.push(ar ? `مؤثرات صوتية طبيعية · ${b.sfx.length}` : `Natural sound effects · ${b.sfx.length}`);
  if (a.aspect !== b.aspect) out.push(ar ? `المقاس ${b.aspect}` : `Resized to ${b.aspect}`);
  if (a.grade !== b.grade) out.push(ar ? `الألوان: ${b.grade}` : `Color: ${b.grade}`);
  if (!a.dub && b.dub) out.push(ar ? `دبلجة لـ${b.dub.lang} · ${b.dub.clips.length} جملة` : `Dubbed to ${b.dub.lang} · ${b.dub.clips.length} lines`);
  const fa = a.fx ?? [], fb = b.fx ?? [];
  if (fb.length !== fa.length) out.push(fb.length > fa.length ? (ar ? `مؤثرات بصرية · ${fb.length}` : `Visual effects · ${fb.length}`) : (ar ? "شلت مؤثرات بصرية" : "Removed visual effects"));
  const va = a.vo ?? [], vb = b.vo ?? [];
  if (vb.length > va.length) out.push(ar ? `ضفت تعليق صوتي · ${vb.length - va.length}` : `Added voice-over · ${vb.length - va.length}`);
  if (vb.length < va.length) out.push(ar ? "شلت التعليق الصوتي" : "Removed voice-over");
  if (!a.enhance && b.enhance) out.push(ar ? "نضّفت صوت المتكلم ووضّحته" : "Enhanced the voice");
  if (a.enhance && !b.enhance) out.push(ar ? "رجّعت الصوت الأصلي" : "Original voice restored");
  if (Math.abs(a.origVolume - b.origVolume) > 0.01 && !a.dub === !b.dub) out.push(ar ? `صوت الفيديو ${Math.round(b.origVolume * 100)}%` : `Video volume ${Math.round(b.origVolume * 100)}%`);
  if (a.dub && !b.dub) out.push(ar ? "شلت الدبلجة" : "Removed dubbing");
  return out;
}
