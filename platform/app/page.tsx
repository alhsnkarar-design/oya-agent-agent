import { HeroPrompt } from "@/components/HeroPrompt";
import { Logo } from "@/components/Logo";
import { RecentProjects } from "@/components/RecentProjects";
import { UserMenu } from "@/components/UserMenu";

const FEATURES = [
  { icon: "💬", title: "صِف بلغتك", text: "اكتب فكرتك بالعربية كما تشرحها لصديق، وبنّاء يفهم ويخطط ويبني." },
  { icon: "⚡", title: "شاهده يُبنى مباشرة", text: "معاينة حية تتحدث مع كل ملف يُكتب، على الكمبيوتر والتابلت والجوال." },
  { icon: "🛠️", title: "عدّل بالمحادثة", text: "«غيّر الألوان»، «أضف صفحة أسعار» — يعدّل الملفات المطلوبة فقط." },
  { icon: "🩺", title: "إصلاح ذاتي للأخطاء", text: "يكتشف أخطاء التشغيل في المعاينة ويصلحها تلقائياً." },
  { icon: "🕘", title: "سجل النسخ", text: "كل تعديل نسخة محفوظة، ارجع لأي نسخة سابقة بضغطة." },
  { icon: "📦", title: "كودك ملكك", text: "صدّر المشروع كاملاً مع الصور كملف ZIP في أي وقت." },
  { icon: "🚀", title: "انشر برابط بضغطة", text: "رابط مباشر لموقعك تشاركه على واتساب، أو حمّله ZIP وانشره أينما شئت." },
  { icon: "🖼️", title: "من صورة إلى موقع", text: "أرفق شعارك وصورك، أو لقطة تصميم أعجبتك ليحوّلها بنّاء إلى كود يعمل." },
  { icon: "☁️", title: "مشاريعك في كل مكان", text: "حسابك يحفظ مشاريعك سحابياً لتكمل العمل من أي جهاز." },
];

export default function Home() {
  return (
    <main className="glow-bg min-h-screen">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-5 py-5">
        <Logo />
        <nav className="flex items-center gap-6 text-sm text-white/70">
          <a href="#features" className="hover:text-white">المزايا</a>
          <a href="#how" className="hover:text-white">كيف يعمل</a>
          <UserMenu />
        </nav>
      </header>

      <section className="px-5 pt-16 pb-12 text-center">
        <span className="inline-block rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-1 text-sm text-brand-300 mb-6">
          أول منصة عربية لبناء المواقع والتطبيقات بالذكاء الاصطناعي
        </span>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-5">
          من <span className="text-gradient">فكرة</span> إلى موقع يعمل
          <br /> في دقائق
        </h1>
        <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10">
          صِف ما تريد، وشاهد بنّاء يصمّمه ويبرمجه أمامك — بتصميم احترافي يدعم العربية من اليمين إلى اليسار بإتقان.
        </p>
        <HeroPrompt />
      </section>

      <RecentProjects />

      <section id="features" className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">لماذا بنّاء؟</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="panel rounded-2xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-white/55 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="max-w-4xl mx-auto px-5 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">كيف يعمل؟</h2>
        <ol className="grid md:grid-cols-3 gap-5">
          {["صِف فكرتك أو اختر قالباً", "شاهد المعاينة الحية وعدّل بالمحادثة", "حمّل مشروعك أو انشره"].map((s, i) => (
            <li key={s} className="panel rounded-2xl p-6 text-center">
              <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full btn-primary font-bold">{i + 1}</div>
              {s}
            </li>
          ))}
        </ol>
      </section>

      <footer className="border-t border-ink-700 py-8 text-center text-sm text-white/40">© 2026 بنّاء — صُنع بحب للعالم العربي</footer>
    </main>
  );
}
