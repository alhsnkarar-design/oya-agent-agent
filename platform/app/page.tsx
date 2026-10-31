import { HeroPrompt } from "@/components/HeroPrompt";
import { LogoMark } from "@/components/Logo";
import { RecentProjects } from "@/components/RecentProjects";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { Nav } from "@/components/landing/Nav";
import { Showcase } from "@/components/landing/Showcase";
import {
  IconCheck,
  IconCloud,
  IconCode,
  IconGlobe,
  IconHistory,
  IconImage,
  IconMessage,
  IconPhone,
  IconRocket,
  IconShield,
  IconSparkles,
  IconStethoscope,
  IconWand,
  IconZap,
} from "@/components/icons";

const STEPS = [
  { n: "01", icon: IconMessage, title: "Describe it", text: "Tell Bannaa what you want in plain words — or drop in a logo, photos or a screenshot of a design you love." },
  { n: "02", icon: IconZap, title: "Watch it build", text: "Bannaa plans the structure and writes every file live. The preview assembles in front of you in seconds." },
  { n: "03", icon: IconWand, title: "Refine in chat", text: "“Make the hero bolder”, “add a pricing page”. Only the files that need to change are rewritten." },
  { n: "04", icon: IconRocket, title: "Publish", text: "One click gives you a live link to share — or export a clean ZIP and host it anywhere." },
];

const FAQ = [
  ["Do I need to know how to code?", "No. You describe what you want in everyday language and refine it the same way. If you do code, every file is open for you to read and edit."],
  ["What can Bannaa build?", "Multi-page websites, landing pages, portfolios, online stores with working carts, booking flows, dashboards and other interactive web apps that run in the browser."],
  ["Can I use my own logo, photos or a design?", "Yes. Attach images to any message. Logos and photos are placed into your site, and screenshots of a design are recreated as working code."],
  ["Does it support right-to-left languages?", "Yes. Write in any language — Arabic, English, French and more. Right-to-left layouts are handled properly, not as an afterthought."],
  ["Who owns the code?", "You do. Download the complete project as a ZIP at any time and host it wherever you like."],
  ["How does publishing work?", "Click Publish, pick a link name and your site is live. Update it after every change with one click, or unpublish anytime."],
];

const PLANS = [
  { name: "Starter", price: "$0", per: "forever", blurb: "Try Bannaa and build your first projects.", cta: "Start free", features: ["10 generations / day", "Live preview & chat edits", "1 published site", "ZIP export"] },
  {
    name: "Pro",
    price: "$20",
    per: "/ month",
    blurb: "For creators and small businesses shipping real sites.",
    cta: "Go Pro",
    featured: true,
    features: ["Unlimited projects", "250 generations / month", "Unlimited published sites", "Image & design-to-code", "Priority generation"],
  },
  { name: "Team", price: "$50", per: "/ month", blurb: "For agencies building for many clients.", cta: "Contact sales", features: ["Everything in Pro", "1,000 generations / month", "Shared workspace", "Custom domains", "Priority support"] },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[900px] aurora" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[900px] grid-bg" />
      <div className="relative">
        <Nav />

        {/* ---------------- hero ---------------- */}
        <section className="px-5 pt-20 pb-16 text-center sm:pt-28">
          <a
            href="#product"
            className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 text-sm text-white/70 hover:bg-white/10 transition"
          >
            <span className="rounded-full btn-primary px-2 py-0.5 text-xs font-semibold">New</span>
            Design-to-code from a screenshot
            <span className="text-white/40">→</span>
          </a>
          <h1 className="animate-fade-up mx-auto mt-7 max-w-4xl text-5xl font-semibold tracking-[-0.035em] leading-[1.02] sm:text-7xl [animation-delay:80ms]">
            Describe it.{" "}
            <span className="font-display italic text-gradient pr-1">Bannaa</span>
            <br className="hidden sm:block" /> builds it.
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-white/55 [animation-delay:160ms]">
            Turn an idea into a polished, working website or web app in minutes — by chatting with AI. No code, no templates to wrestle with.
          </p>
          <div className="animate-fade-up mt-10 [animation-delay:240ms]">
            <HeroPrompt />
          </div>
          <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/40 [animation-delay:320ms]">
            {["No credit card", "Live preview", "Publish in one click", "You own the code"].map((x) => (
              <span key={x} className="flex items-center gap-2">
                <IconCheck size={15} className="text-emerald-400" /> {x}
              </span>
            ))}
          </div>
        </section>

        <RecentProjects />

        {/* ---------------- product demo ---------------- */}
        <section id="product" className="mx-auto max-w-6xl px-5 py-16 scroll-mt-20">
          <LiveDemo />
        </section>

        {/* ---------------- how it works ---------------- */}
        <section className="mx-auto max-w-6xl px-5 py-24">
          <SectionHead eyebrow="How it works" title={<>From idea to <em className="font-display text-gradient">live site</em> in four steps</>} />
          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {STEPS.map(({ n, icon: Icon, title, text }) => (
              <div key={n} className="group panel rounded-2xl p-6 transition hover:border-white/20">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border hairline text-brand-300 group-hover:text-flare-400 transition">
                    <Icon size={20} />
                  </span>
                  <span className="font-mono text-xs text-white/25">{n}</span>
                </div>
                <h3 className="mt-5 font-semibold text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- templates ---------------- */}
        <section id="templates" className="mx-auto max-w-7xl px-5 py-24 scroll-mt-20">
          <SectionHead
            eyebrow="Start from a template"
            title={<>Pick a starting point, <em className="font-display text-gradient">make it yours</em></>}
            text="Every template is just a detailed prompt — click one and watch it come to life, then change anything by chatting."
          />
          <div className="mt-14">
            <Showcase />
          </div>
        </section>

        {/* ---------------- bento features ---------------- */}
        <section id="features" className="mx-auto max-w-6xl px-5 py-24 scroll-mt-20">
          <SectionHead eyebrow="Features" title={<>Everything you need to <em className="font-display text-gradient">ship</em></>} />
          <div className="mt-14 grid gap-4 md:grid-cols-6 md:auto-rows-[minmax(210px,auto)]">
            <Bento className="md:col-span-4" icon={IconZap} title="Streaming, live preview" text="Files appear as they are written and the preview updates instantly — on desktop, tablet and phone sizes.">
              <div className="mt-6 flex gap-3">
                {[IconCode, IconPhone, IconGlobe].map((I, i) => (
                  <div key={i} className="flex-1 rounded-xl border hairline bg-ink-950/60 p-3">
                    <div className="mb-3 flex items-center gap-2 text-white/40"><I size={14} /><span className="h-1.5 w-12 rounded-full bg-white/10" /></div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-[85%] rounded-full bg-brand-400/40" />
                      <div className="h-1.5 w-[65%] rounded-full bg-white/10" />
                      <div className="h-1.5 w-[75%] rounded-full bg-flare-400/30" />
                    </div>
                  </div>
                ))}
              </div>
            </Bento>
            <Bento className="md:col-span-2" icon={IconStethoscope} title="Self-healing" text="Runtime errors in the preview are detected and fixed automatically — before you even notice.">
              <div className="mt-6 space-y-2 font-mono text-[12px]">
                <div className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-rose-300 line-through decoration-rose-300/50">
                  TypeError: cart is undefined
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-emerald-300">
                  <IconCheck size={14} /> Fixed in js/app.js
                </div>
              </div>
            </Bento>
            <Bento className="md:col-span-2" icon={IconImage} title="Design-to-code" text="Drop in a screenshot or mockup and get a faithful, working recreation. Add your logo and photos too." />
            <Bento className="md:col-span-2" icon={IconWand} title="Precise edits" text="Change one thing without breaking the rest. Bannaa rewrites only the files that need it." />
            <Bento className="md:col-span-2" icon={IconHistory} title="Version history" text="Every change is a snapshot. Jump back to any version in one click." />
            <Bento className="md:col-span-3" icon={IconRocket} title="One-click publishing" text="Get a shareable live link instantly. Update or unpublish anytime — no hosting setup.">
              <div className="mt-6 flex items-center gap-2 rounded-xl border hairline bg-ink-950/60 px-4 py-3 font-mono text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                <span className="text-white/40">bannaa.app/s/</span>
                <span className="text-white">your-site</span>
                <span className="ml-auto text-xs text-emerald-300">Live</span>
              </div>
            </Bento>
            <Bento className="md:col-span-3" icon={IconCloud} title="Your projects, everywhere" text="Sign in and every project autosaves to the cloud. Pick up on any device, export a ZIP whenever you like.">
              <div className="mt-6 flex items-center gap-3 text-xs text-white/50">
                {["Coffee roastery", "Yoga studio", "Portfolio"].map((n, i) => (
                  <div key={n} className="flex-1 rounded-xl border hairline bg-ink-950/60 p-3">
                    <div className="mb-2 h-10 rounded-md" style={{ background: ["linear-gradient(135deg,#9a3412,#f59e0b)", "linear-gradient(135deg,#0ea5e9,#22c55e)", "linear-gradient(135deg,#e11d48,#7c3aed)"][i] }} />
                    {n}
                  </div>
                ))}
              </div>
            </Bento>
            <Bento className="md:col-span-3" icon={IconGlobe} title="Any language, RTL done right" text="Build in English, Arabic or any language. Right-to-left layouts, fonts and icons are handled natively.">
              <div className="mt-6 flex flex-wrap gap-2">
                {["Hello", "مرحباً", "Bonjour", "Hola", "Merhaba", "こんにちは"].map((w) => (
                  <span key={w} className="rounded-full border hairline bg-white/5 px-3 py-1 text-sm text-white/70">{w}</span>
                ))}
              </div>
            </Bento>
            <Bento className="md:col-span-3" icon={IconShield} title="Safe by design" text="Published sites run isolated from your account, sessions are signed and every write is CSRF-protected.">
              <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-white/60">
                {["Sandboxed sites", "Signed sessions", "CSRF checks"].map((x) => (
                  <div key={x} className="rounded-xl border hairline bg-ink-950/60 px-2 py-3">
                    <IconShield size={16} className="mx-auto mb-1.5 text-emerald-300" />
                    {x}
                  </div>
                ))}
              </div>
            </Bento>
          </div>
        </section>

        {/* ---------------- pricing ---------------- */}
        <section id="pricing" className="mx-auto max-w-6xl px-5 py-24 scroll-mt-20">
          <SectionHead eyebrow="Pricing" title={<>Simple plans that <em className="font-display text-gradient">grow with you</em></>} />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-3xl p-7 ${p.featured ? "ring-gradient bg-gradient-to-b from-brand-600/15 to-ink-900 shadow-[0_30px_80px_-40px_#c026d3]" : "panel"}`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-7 rounded-full btn-primary px-3 py-1 text-xs font-semibold">Most popular</span>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-white/50">{p.blurb}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-semibold tracking-tight">{p.price}</span>
                  <span className="text-white/40">{p.per}</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-white/70">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <IconCheck size={16} className="text-brand-300 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/login?mode=register"
                  className={`mt-8 rounded-full py-3 text-center text-sm font-semibold ${p.featured ? "btn-primary" : "btn-ghost"}`}
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section id="faq" className="mx-auto max-w-3xl px-5 py-24 scroll-mt-20">
          <SectionHead eyebrow="FAQ" title="Questions, answered" />
          <div className="mt-12 divide-y divide-white/10 border-y hairline">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between gap-6 text-left font-medium">
                  {q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border hairline text-white/50 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 pr-12 leading-relaxed text-white/55">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="relative overflow-hidden rounded-[32px] ring-gradient noise px-8 py-20 text-center">
            <div className="absolute inset-0 aurora opacity-90" />
            <div className="relative">
              <div className="mx-auto mb-6 w-fit animate-float"><LogoMark size={56} /></div>
              <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Your next site is <em className="font-display text-gradient">one sentence</em> away
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-white/60">Describe it, watch it come alive and share it with the world today.</p>
              <a href="/build" className="mt-8 inline-flex items-center gap-2 btn-white rounded-full px-6 py-3 font-semibold">
                <IconSparkles size={17} /> Start building — it’s free
              </a>
            </div>
          </div>
        </section>

        <footer className="border-t hairline">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-white/40 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5 text-white/80">
              <LogoMark size={22} /> <span className="font-semibold">Bannaa</span>
            </div>
            <div className="flex flex-wrap gap-6">
              <a href="#product" className="hover:text-white">Product</a>
              <a href="#templates" className="hover:text-white">Templates</a>
              <a href="#pricing" className="hover:text-white">Pricing</a>
              <a href="#faq" className="hover:text-white">FAQ</a>
            </div>
            <span className="sm:ml-auto">© 2026 Bannaa. Built for builders.</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function SectionHead({ eyebrow, title, text }: { eyebrow: string; title: React.ReactNode; text?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="text-sm font-medium uppercase tracking-[0.18em] text-brand-300">{eyebrow}</div>
      <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{title}</h2>
      {text && <p className="mt-4 text-white/50 text-lg">{text}</p>}
    </div>
  );
}

function Bento({
  className = "",
  icon: Icon,
  title,
  text,
  children,
}: {
  className?: string;
  icon: (p: { size?: number }) => React.ReactNode;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`group relative overflow-hidden rounded-3xl panel p-7 transition hover:border-white/20 ${className}`}>
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brand-600/0 blur-3xl transition group-hover:bg-brand-600/20" />
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border hairline text-brand-300">
        <Icon size={20} />
      </span>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-white/50">{text}</p>
      {children}
    </div>
  );
}
