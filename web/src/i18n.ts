// Arabic (default) and English strings. useT() re-renders on language change.
import { useSyncExternalStore } from "react";

export type Lang = "ar" | "en";

const ar = {
  nav_features: "المميزات", nav_pricing: "الأسعار", nav_faq: "أسئلة", nav_home: "الرئيسية", nav_editor: "المحرر", nav_projects: "مشاريعي",
  login: "دخول", get_started: "ابدأ", logout: "خروج", lang_switch: "EN",
  hero_title_a: "عدّل أي فيديو", hero_title_b: "بكلمة", hero_title_c: "منك.",
  hero_sub: "ارفع الفيديو الخام، واطلب اللي عايزه. Zifidit.Ai يعمل المونتاج والكابشن والموشن جرافيكس والدبلجة.",
  prompt_ph: "شيل السكتات وحط كابشن كلمة كلمة",
  attach: "أرفق فيديو", record: "سجّل طلبك بصوتك", send: "ابدأ",
  chip_reel: "اعمل ريل 30 ثانية", chip_dub: "دبلجه للإنجليزي", chip_resize: "خليه 9:16",
  raw: "خام", edited: "بعد المونتاج",
  need_video: "أرفق فيديو الأول.",
  features_title: "كل اللي بياخد منك ساعات… بكلمة.",
  f1_t: "مونتاج تلقائي", f1_p: "يشيل السكتات والتكرار والغلطات، ويرتب اللقطات، ويضيف زووم وانتقالات ومؤثرات صوتية طبيعية على إيقاع الكلام. من غير موسيقى.",
  f2_t: "Zifidit.Ai بالصوت المباشر", f2_p: "اتكلم معاه زي ما بتكلم مونتير: «كبّر العنوان»، «احذف المشهد التاني». بيرد عليك وينفّذ قدامك.",
  f3_t: "كابشن بالعامية", f3_p: "مصري وخليجي وشامي وفصحى وإنجليزي، كلمة كلمة على توقيت الكلام، وتعدّله بإيدك.",
  f4_t: "دبلجة وترجمة لأي لغة", f4_p: "قوله «دبلجه للإسباني» أو «ترجم الكابشن للفرنساوي»، ويطلع صوت جديد بلغتك.",
  f5_t: "موشن جرافيكس من وصف", f5_p: "اكتب العنوان أو الفكرة، يطلع عنوان متحرك جاهز على الفيديو.",
  f6_t: "مقاس لكل منصة", f6_p: "9:16 و1:1 و16:9 بدوسة، والفيديو بيتعالج في جهازك.",
  faq_title: "أسئلة سريعة",
  q1: "إيه اللي بيحصل لما دقايقي تخلص؟", a1: "الخدمة بتقف لحد ما الشهر الجديد يبدأ، أو تشتري دقايق إضافية: 60 دقيقة بـ5 دولار.",
  q2: "فيديوهاتي بتتخزن قد إيه؟", a2: "المونتاج والرندر بيحصلوا في متصفحك، والفيديو نفسه مش بيترفع على سيرفراتنا. بنبعت صوت الفيديو بس للذكاء الاصطناعي عشان التفريغ والدبلجة، ومش بنحتفظ بيه.",
  q3: "بيدعم العربي واللهجات؟", a3: "أيوه، العربي هو الأساس: الكابشن والأوامر والدبلجة بالعامية والفصحى، ومعاهم الإنجليزي وأغلب لغات العالم.",
  q4: "فيه موسيقى؟", a4: "لأ. Zifidit بيضيف مؤثرات صوتية طبيعية خفيفة بس (ووش، وضغطة، وانتقال)، من غير أي موسيقى.",
  pricing_title_a: "باقة على", pricing_title_b: "قد", pricing_title_c: "شغلك",
  monthly: "شهري", yearly: "سنوي", yearly_note: "ادفع 10 شهور وخد 12", promo: "خصم 50% لأول 100 مشترك",
  per_month: "/ شهر", most_popular: "الأكثر طلبًا",
  plan_creator: "صانع محتوى", plan_editor: "مونتير", plan_studio: "استوديو",
  min_edit: "دقيقة مونتاج وكابشن", min_dub: "دقيقة دبلجة", cmds: "أمر بالصوت أو الكتابة", seats: "حسابات للتيم",
  get_plan: "اشترك في", extra: "دقايق إضافية: 60 دقيقة بـ5 دولار", buy_minutes: "اشتري دقايق",
  pay_soon: "الدفع بيتفعّل قريبًا. سجّل دلوقتي وهنبعتلك أول ما يفتح.",
  // editor
  undo: "تراجع", redo: "إعادة", download: "تحميل", before: "قبل", after: "بعد",
  upload_title: "ارفع الفيديو الخام", upload_sub: "اسحب الفيديو هنا أو دوس للاختيار. MP4 أو MOV أو WebM.", choose_file: "اختار فيديو",
  cmd_ph: "اكتب أمر أو سجّل صوتك", talk_live: "كلام مباشر", stop_live: "إيقاف", listening: "بسمعك…", thinking: "بفكر…", speaking: "بتكلم…",
  track_video: "فيديو", track_captions: "كابشن", track_motion: "موشن", track_dub: "دبلجة",
  ai_hello: "أهلًا! أنا Zifidit.Ai. ارفع الفيديو وقولي عايز إيه: «اعمل مونتاج تلقائي»، «شيل السكتات»، «حط كابشن مصري»، «دبلجه للإنجليزي»، أو «خليه 9:16».",
  exporting: "بجهّز الفيديو…", export_done: "الفيديو جاهز ✓", export_note: "التحميل بيتسجّل في الوقت الحقيقي، فخلي الصفحة مفتوحة لحد ما يخلص.",
  step_audio: "بطلّع الصوت", step_transcribe: "بفرّغ الكلام", step_plan: "بخطط للمونتاج", step_apply: "بطبّق المونتاج", step_translate: "بترجم", step_voice: "بسجّل الصوت الجديد",
  dub_voice: "صوت الدبلجة", captions_on: "الكابشن", grade: "الألوان",
  projects_title: "مشاريعي", no_projects: "لسه مفيش مشاريع. ارفع أول فيديو.", new_project: "مشروع جديد", local_note: "المشاريع محفوظة على الجهاز ده بس.",
  // auth
  login_title: "ادخل على Zifidit", signup_title: "اعمل حساب", email: "الإيميل", password: "كلمة السر", password2: "أكّد كلمة السر",
  with_google: "الدخول بحساب Google", or: "أو", no_account: "معندكش حساب؟", have_account: "عندك حساب؟", forgot: "نسيت كلمة السر؟",
  verify_sent: "بعتنالك رسالة تأكيد على الإيميل. أكّد وارجع ادخل.", reset_sent: "بعتنالك رابط تغيير كلمة السر.",
  auth_off: "تسجيل الدخول بيتفعّل قريبًا. تقدر تجرّب المحرر دلوقتي بحدود الضيف.",
  pw_short: "كلمة السر لازم تبقى 8 حروف على الأقل.", pw_mismatch: "كلمتين السر مش زي بعض.",
  err_generic: "حصلت مشكلة. جرّب تاني.", err_quota: "خلصت حدود الاستخدام المتاحة. سجّل دخول أو استنى للشهر الجاي.",
  err_ai_off: "الذكاء الاصطناعي مش متاح دلوقتي. جرّب بعد شوية.", err_mic: "مش قادر أوصل للمايك. اسمح للمتصفح يستخدمه.",
  err_video: "مش قادر أفتح الفيديو ده. جرّب MP4.",
  err_no_key: "الذكاء الاصطناعي لسه مش متوصّل: مفتاح OpenRouter مش متحط في إعدادات الموقع على Cloudflare.",
  err_bad_key: "مفتاح OpenRouter اللي في إعدادات الموقع غلط أو اتلغى. اعمل مفتاح جديد وحطه في Cloudflare.",
  err_no_credits: "رصيد OpenRouter خلص، أو المفتاح وصل لحد الصرف بتاعه. اشحن الرصيد أو ارفع الحد.",
  err_busy: "الذكاء الاصطناعي عليه ضغط دلوقتي. جرّب كمان دقيقة.",
  err_upstream: "خدمة الذكاء الاصطناعي رجّعت خطأ. جرّب تاني بعد شوية.",
  err_network: "مفيش اتصال بالإنترنت أو الموقع مش بيرد. اتأكد من النت وجرّب تاني.",
  err_too_large: "الصوت في الجزء ده كبير قوي. جرّب فيديو أقصر.",
  ai_off_banner: "تنبيه: الذكاء الاصطناعي مش شغال دلوقتي. ",
  footer_rights: "كل الحقوق محفوظة",
};

type Dict = typeof ar;

const en: Dict = {
  nav_features: "Features", nav_pricing: "Pricing", nav_faq: "FAQ", nav_home: "Home", nav_editor: "Project editor", nav_projects: "Projects",
  login: "Log in", get_started: "Get started", logout: "Log out", lang_switch: "عربي",
  hero_title_a: "Edit any video", hero_title_b: "just by", hero_title_c: "asking.",
  hero_sub: "Upload raw footage. Describe the cut. Zifidit.Ai handles editing, captions, motion graphics and dubbing.",
  prompt_ph: "Remove the silences and add word-by-word captions",
  attach: "Attach a video", record: "Record your request", send: "Start",
  chip_reel: "Make a 30s reel", chip_dub: "Dub to Spanish", chip_resize: "Resize to 9:16",
  raw: "Raw", edited: "Edited",
  need_video: "Attach a video first.",
  features_title: "Hours of editing, in one sentence.",
  f1_t: "Automatic editing", f1_p: "Cuts silences, repeats and mistakes, orders the shots, and adds zooms, transitions and natural sound effects on the beat of speech. No music.",
  f2_t: "Live voice with Zifidit.Ai", f2_p: "Talk to it like an editor: \"make the title bigger\", \"delete the second scene\". It answers and edits in front of you.",
  f3_t: "Captions in any dialect", f3_p: "Egyptian, Gulf, Levantine, Modern Standard Arabic and English, word by word on the beat, and fully editable.",
  f4_t: "Dub and translate to any language", f4_p: "Say \"dub it to Spanish\" or \"translate the captions to French\" and get a new voice track.",
  f5_t: "Motion graphics from a description", f5_p: "Type the title or idea and get an animated title on your video.",
  f6_t: "A size for every platform", f6_p: "9:16, 1:1 and 16:9 in one tap. Your video is processed on your device.",
  faq_title: "Quick questions",
  q1: "What happens when my minutes run out?", a1: "The service pauses until your next month starts, or you buy extra minutes: 60 minutes for $5.",
  q2: "How long are my videos stored?", a2: "Editing and rendering happen in your browser, and the video itself is not uploaded to our servers. Only the audio is sent to the AI for transcription and dubbing, and we don't keep it.",
  q3: "Does it support Arabic and dialects?", a3: "Yes. Arabic comes first: captions, commands and dubbing in dialects and MSA, plus English and most world languages.",
  q4: "Is there music?", a4: "No. Zifidit only adds light natural sound effects (whoosh, click, transition), never music.",
  pricing_title_a: "A plan for the way", pricing_title_b: "you", pricing_title_c: "work",
  monthly: "Monthly", yearly: "Yearly", yearly_note: "Pay for 10 months, get 12", promo: "50% off for the first 100 subscribers",
  per_month: "/ month", most_popular: "Most popular",
  plan_creator: "Creator", plan_editor: "Editor", plan_studio: "Studio",
  min_edit: "min editing & captions", min_dub: "min dubbing", cmds: "voice or text commands", seats: "team seats",
  get_plan: "Get", extra: "Extra minutes: 60 min for $5", buy_minutes: "Buy minutes",
  pay_soon: "Payments open soon. Sign up now and we'll email you when they do.",
  undo: "Undo", redo: "Redo", download: "Download", before: "Before", after: "After",
  upload_title: "Upload raw footage", upload_sub: "Drop a video here or click to choose. MP4, MOV or WebM.", choose_file: "Choose video",
  cmd_ph: "Type a command or record your voice", talk_live: "Talk live", stop_live: "Stop", listening: "Listening…", thinking: "Thinking…", speaking: "Speaking…",
  track_video: "Video", track_captions: "Captions", track_motion: "Motion", track_dub: "Dubbing",
  ai_hello: "Hi! I'm Zifidit.Ai. Upload a video and tell me what you want: \"auto edit it\", \"cut the silences\", \"add captions\", \"dub it to English\" or \"make it 9:16\".",
  exporting: "Preparing your video…", export_done: "Your video is ready ✓", export_note: "Export records in real time, so keep this page open until it finishes.",
  step_audio: "Extracting audio", step_transcribe: "Transcribing", step_plan: "Planning the edit", step_apply: "Applying the edit", step_translate: "Translating", step_voice: "Recording the new voice",
  dub_voice: "Dub voice", captions_on: "Captions", grade: "Color",
  projects_title: "Projects", no_projects: "No projects yet. Upload your first video.", new_project: "New project", local_note: "Projects are saved on this device only.",
  login_title: "Log in to Zifidit", signup_title: "Create your account", email: "Email", password: "Password", password2: "Confirm password",
  with_google: "Continue with Google", or: "or", no_account: "No account yet?", have_account: "Have an account?", forgot: "Forgot password?",
  verify_sent: "We sent a confirmation email. Confirm it, then log in.", reset_sent: "We sent a password reset link.",
  auth_off: "Sign-in opens soon. You can try the editor now with guest limits.",
  pw_short: "Password must be at least 8 characters.", pw_mismatch: "Passwords don't match.",
  err_generic: "Something went wrong. Try again.", err_quota: "You've reached your usage limit. Log in or wait for next month.",
  err_ai_off: "The AI isn't available right now. Try again shortly.", err_mic: "Can't reach the microphone. Allow access in your browser.",
  err_video: "Can't open this video. Try an MP4.",
  err_no_key: "The AI isn't connected yet: the OpenRouter key is missing from the site's Cloudflare settings.",
  err_bad_key: "The OpenRouter key in the site settings is wrong or was revoked. Create a new key and add it in Cloudflare.",
  err_no_credits: "OpenRouter credits ran out, or the key hit its spending limit. Top up or raise the limit.",
  err_busy: "The AI is busy right now. Try again in a minute.",
  err_upstream: "The AI service returned an error. Try again shortly.",
  err_network: "No connection, or the site isn't responding. Check your internet and try again.",
  err_too_large: "The audio in this part is too large. Try a shorter video.",
  ai_off_banner: "Heads up: the AI isn't working right now. ",
  footer_rights: "All rights reserved",
};

const dicts: Record<Lang, Dict> = { ar, en };

let lang: Lang = (() => {
  try { const v = localStorage.getItem("zf-lang"); if (v === "en" || v === "ar") return v; } catch { /* storage blocked */ }
  return "ar";
})();
const subs = new Set<() => void>();

function apply() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}
apply();

export function setLang(l: Lang) {
  lang = l;
  try { localStorage.setItem("zf-lang", l); } catch { /* ignore */ }
  apply();
  subs.forEach((f) => f());
}
export const getLang = () => lang;

export function useT() {
  const l = useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => lang);
  return { t: dicts[l], lang: l };
}
export type T = Dict;
