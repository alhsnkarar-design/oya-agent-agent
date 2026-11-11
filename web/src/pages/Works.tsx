import { useState } from "react";
import { useT } from "../i18n";
import { linkProps } from "../router";
import { Icon } from "../components/Icon";
import "./works.css";

// Portfolio: the products, motion work, social media systems and freelance services behind Zifidit.
// To add a work, add an entry to WORKS. `img` is optional (a path under /public or a full URL).
type Kind = "digital" | "physical" | "motion" | "social";
type Work = { kind: Kind; ar: string; en: string; dar: string; den: string; img?: string; icon?: string; href?: string; live?: boolean };

const KINDS: Record<Kind, { ar: string; en: string; icon: string }> = {
  digital: { ar: "منتجات رقمية", en: "Digital products", icon: "globe" },
  physical: { ar: "منتجات مادية", en: "Physical products", icon: "tag" },
  motion: { ar: "موشن ومونتاج", en: "Motion & editing", icon: "film" },
  social: { ar: "سوشيال ميديا", en: "Social media", icon: "spark" },
};

const WORKS: Work[] = [
  { kind: "digital", live: true, href: "/editor", img: "/gallery/g0.webp",
    ar: "Zifidit: مونتاج وموشن بكلمة", en: "Zifidit: edit any video with a sentence",
    dar: "موقع ترفع عليه الفيديو الخام وتكتب أو تقول اللي عايزه، فيعمل المونتاج والكابشن بالعامية والموشن جرافيكس والدبلجة لأي لغة.",
    den: "Upload raw footage and type or say what you want: it cuts, captions in Arabic dialects, adds motion graphics and dubs into any language." },
  { kind: "digital", icon: "user",
    ar: "المساعد الإسلامي", en: "Islamic AI assistant",
    dar: "وكيل ذكاء اصطناعي يبحث في آيات القرآن، ويجيب بمصادر موثوقة بعربية فصحى مبسطة، ويقرأ الإجابة بالصوت.",
    den: "An AI agent that searches the Quran, answers from trusted sources in clear Arabic, and reads answers aloud." },
  { kind: "digital", img: "/gallery/g1.webp",
    ar: "مولّد الموشن العربي", en: "Arabic motion generator",
    dar: "تكتب جملة، فيطلع فيديو MP4 بموشن جرافيكس عربي وخطوط كوفية جاهز للنشر.",
    den: "Type a sentence and get an MP4 with Arabic kinetic typography, ready to post." },
  { kind: "motion", img: "/gallery/g5.webp",
    ar: "ريل الحلقة 0 بالموشن 3D", en: "Episode 0 reel in 3D motion",
    dar: "إعلان افتتاحي لعالم ثلاثي الأبعاد بإضاءة ومؤثرات بصرية، مدته 24 ثانية.",
    den: "A 24-second opening reel built as a lit 3D world with visual effects." },
  { kind: "motion", img: "/gallery/g2.webp",
    ar: "برومو 35 ثانية بصوت مصري", en: "35-second promo with Egyptian voice-over",
    dar: "فيديو دعائي بالموشن جرافيكس متزامن مع تعليق صوتي باللهجة المصرية.",
    den: "A motion-graphics promo synced to an Egyptian Arabic voice-over." },
  { kind: "motion", img: "/gallery/g3.webp",
    ar: "كابشن بالعامية كلمة كلمة", en: "Word-by-word dialect captions",
    dar: "كابشن متحرك بالمصري والخليجي والشامي على توقيت الكلام بالظبط.",
    den: "Animated captions in Egyptian, Gulf and Levantine Arabic, timed to each word." },
  { kind: "social", icon: "layers",
    ar: "«ببني بزنس قدامكم»", en: "“Building a business in public”",
    dar: "نظام محتوى من 12 شكل (العدّاد، الفلوس على الشاشة، الرهان…) وجدول نشر أسبوعي يحوّل رحلة البزنس لمتابعين.",
    den: "A 12-format content system and weekly schedule that turns a business journey into followers." },
  { kind: "social", icon: "stack",
    ar: "بنك محتوى 20 فيديو", en: "20-video content bank",
    dar: "عناوين وخطافات وسكريبتات كاملة لريلز مدتها 20 إلى 35 ثانية.",
    den: "Titles, hooks and full scripts for 20–35 second reels." },
  { kind: "social", icon: "phone",
    ar: "خطة إطلاق إنستجرام", en: "Instagram launch plan",
    dar: "إعداد الحساب والبايو، وخطة 4 أسابيع، وريلز وكاروسيل وستوري ورسائل جاهزة لحساب بدون وجه.",
    den: "Profile setup, a 4-week plan, and ready reels, carousels, stories and DMs for a faceless account." },
];

const SERVICES = [
  { icon: "film", ar: "مونتاج ريلز وموشن جرافيكس", en: "Reel editing & motion graphics" },
  { icon: "cc", ar: "كابشن بالعامية ودبلجة", en: "Dialect captions & dubbing" },
  { icon: "globe", ar: "مواقع وصفحات هبوط", en: "Websites & landing pages" },
  { icon: "spark", ar: "وكلاء وأدوات ذكاء اصطناعي", en: "AI agents & tools" },
  { icon: "layers", ar: "خطط محتوى وإدارة سوشيال ميديا", en: "Content plans & social media management" },
];

export function Works() {
  const { lang } = useT();
  const ar = lang === "ar";
  const kinds = (Object.keys(KINDS) as Kind[]).filter((k) => WORKS.some((w) => w.kind === k));
  const [on, setOn] = useState<Kind | "all">("all");
  const list = WORKS.filter((w) => on === "all" || w.kind === on);

  return (
    <main className="works wrap">
      <header className="w-head">
        <span className="eyebrow">{ar ? "معرض الأعمال" : "Portfolio"}</span>
        <h1 className="h2">{ar ? "أعمالي ومنتجاتي" : "My work & products"}</h1>
        <p className="sub">{ar
          ? "أبني منتجات رقمية بالذكاء الاصطناعي، وأصنع موشن جرافيكس ومحتوى للسوشيال ميديا، وأقدّم خدماتي كفريلانسر."
          : "I build AI-powered digital products, make motion graphics and social media content, and work as a freelancer."}</p>
        <div className="w-stats">
          {kinds.map((k) => (
            <div key={k} className="card st"><b>{WORKS.filter((w) => w.kind === k).length}</b><span>{ar ? KINDS[k].ar : KINDS[k].en}</span></div>
          ))}
          <div className="card st"><b>{SERVICES.length}</b><span>{ar ? "خدمات فريلانس" : "Freelance services"}</span></div>
        </div>
      </header>

      <div className="w-filter" role="tablist">
        {(["all", ...kinds] as const).map((k) => (
          <button key={k} role="tab" aria-selected={on === k} className={on === k ? "on" : ""} onClick={() => setOn(k)}>
            {k === "all" ? (ar ? "الكل" : "All") : ar ? KINDS[k].ar : KINDS[k].en}
          </button>
        ))}
      </div>

      <section className="w-grid">
        {list.map((w, i) => {
          const body = (
            <>
              <div className="thumb">
                {w.img ? <img src={w.img} alt="" loading="lazy" /> : <span className="ph"><Icon n={w.icon || KINDS[w.kind].icon} size={40} /></span>}
                <span className="kind">{ar ? KINDS[w.kind].ar : KINDS[w.kind].en}</span>
                {w.live && <span className="live">{ar ? "شغال الآن" : "Live"}</span>}
              </div>
              <div className="b">
                <h3>{ar ? w.ar : w.en}</h3>
                <p>{ar ? w.dar : w.den}</p>
                {w.href && <span className="more">{ar ? "جرّبه" : "Try it"} <Icon n="send" /></span>}
              </div>
            </>
          );
          return w.href
            ? <a key={i} className="card wk" {...linkProps(w.href)}>{body}</a>
            : <article key={i} className="card wk">{body}</article>;
        })}
      </section>

      <section className="w-services" id="services">
        <h2 className="h2">{ar ? "خدمات فريلانس" : "Freelance services"}</h2>
        <div className="sgrid">
          {SERVICES.map((s) => (
            <div key={s.en} className="card sv"><span className="n"><Icon n={s.icon} /></span><span>{ar ? s.ar : s.en}</span></div>
          ))}
        </div>
      </section>

      <footer className="foot"><span className="logo">Zifidit</span><span className="muted">© {new Date().getFullYear()} Zifidit</span></footer>
    </main>
  );
}
