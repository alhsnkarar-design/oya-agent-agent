# حركة: صفحة الهبوط وقائمة الانتظار

صفحة عربية تعرض الفكرة، وتجمع إيميلات المهتمين، وتقيس استعدادهم للدفع (الضغط على أزرار الأسعار وسؤال الدفع المقدم).

> **"حركة" اسم مؤقت.** لتغييره، ابحث عن كلمة `حركة` في `public/index.html` واستبدلها.

## الملفات

| الملف | وظيفته |
|---|---|
| `public/index.html` | الصفحة نفسها (HTML وCSS وJS في ملف واحد، بدون أي build) |
| `functions/api/waitlist.js` | يستقبل التسجيل ويحفظه في Appwrite |
| `functions/api/event.js` | يسجل الضغط على أزرار الأسعار |
| `lib/appwrite.js` | دوال مشتركة للاتصال بـ Appwrite |

## الإعداد خطوة بخطوة

### 1) Appwrite (حفظ المسجلين)

1. أنشئ مشروعًا جديدًا في [cloud.appwrite.io](https://cloud.appwrite.io).
2. من **Databases** أنشئ قاعدة بيانات باسم `landing`.
3. أنشئ داخلها مجموعة (Collection) باسم `waitlist` بهذه الحقول، وكلها من نوع **String**:

   | الحقل | الطول | مطلوب؟ |
   |---|---|---|
   | `email` | 160 | نعم |
   | `name` | 80 | لا |
   | `content_type` | 20 | نعم |
   | `plan` | 20 | لا |
   | `prepay` | 10 | لا |
   | `utm_source` | 100 | لا |
   | `utm_medium` | 100 | لا |
   | `utm_campaign` | 100 | لا |
   | `referrer` | 300 | لا |
   | `country` | 8 | لا |

4. من **Indexes** داخل `waitlist` أضف فهرسًا من نوع **Unique** على `email`، حتى لا يتكرر نفس الإيميل.
5. أنشئ مجموعة ثانية باسم `events` بهذه الحقول (String): `name` (40، مطلوب)، `plan` (20)، `utm_source` (100)، `country` (8).
6. اترك صلاحيات المجموعتين (Permissions) **فارغة**، فلا يقرأ أو يكتب فيها أحد إلا السيرفر بالمفتاح.
7. من **Overview ← API Keys** أنشئ مفتاحًا بصلاحية `documents.write` فقط.

### 2) Cloudflare Pages (الاستضافة)

1. ادخل [dash.cloudflare.com](https://dash.cloudflare.com) ← **Workers & Pages** ← **Create** ← **Pages** ← **Connect to Git**.
2. اختر هذا المستودع، ثم اضبط:
   - **Root directory:** `landing`
   - **Build command:** اتركه فارغًا
   - **Build output directory:** `public`
3. من **Settings ← Variables and Secrets** أضف هذه القيم (اختر **Encrypt** للمفتاح):

   | الاسم | القيمة |
   |---|---|
   | `APPWRITE_ENDPOINT` | مثل `https://fra.cloud.appwrite.io/v1` (تجده في إعدادات المشروع) |
   | `APPWRITE_PROJECT_ID` | رقم المشروع |
   | `APPWRITE_API_KEY` | المفتاح من الخطوة 1-7 |
   | `APPWRITE_DATABASE_ID` | رقم قاعدة البيانات `landing` |
   | `APPWRITE_WAITLIST_COLLECTION_ID` | رقم مجموعة `waitlist` |
   | `APPWRITE_EVENTS_COLLECTION_ID` | رقم مجموعة `events` |

4. أعد النشر (Retry deployment) بعد إضافة القيم.
5. من **Custom domains** اربط الدومين.

### 3) التجربة

افتح الصفحة على الدومين، وسجّل بإيميلك، ثم تأكد أنه ظهر في مجموعة `waitlist` داخل Appwrite.

## قراءة النتائج

- **عدد المسجلين ÷ عدد الزوار** (الزوار من Cloudflare Web Analytics، وهي مجانية من لوحة Pages).
- **الضغط على أزرار الأسعار** في مجموعة `events`، وأي باقة أكثر طلبًا.
- **إجابات سؤال الدفع المقدم** (`prepay`): عدد "أيوه" هو أقوى مؤشر.
- **مصدر الزيارة:** أضف `?utm_source=facebook` أو `?utm_source=telegram` لرابط كل منشور أو إعلان لتعرف أي مكان يجيب مسجلين أكثر.

## الحماية الموجودة

- المفاتيح في إعدادات Cloudflare فقط، ولا تظهر في المتصفح.
- حقل مخفي (Honeypot) يصطاد البرامج الآلية.
- التحقق من كل القيم على السيرفر، وأي قيمة غير متوقعة تُرفض.
- فهرس Unique يمنع تكرار الإيميل.
- لو زاد السبام لاحقًا: فعّل **Cloudflare Turnstile** (مجاني).
