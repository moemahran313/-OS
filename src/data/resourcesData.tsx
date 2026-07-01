import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Receipt,
  ShieldCheck,
  Info,
  Cpu,
  Truck,
  Users,
  CreditCard,
  FileCode,
  DollarSign,
  Briefcase,
  Layers,
  HelpCircle,
} from "lucide-react";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: "e-invoicing" | "payroll" | "crm" | "contracts" | "supply-chain" | "ai";
  readTime: string;
  tags: string[];
  content: React.ReactNode;
}

export const resourcesArticles: Article[] = [
  // --- ZATCA / E-INVOICING (7 ARTICLES) ---
  {
    id: "zatca-phase-1-fundamentals",
    category: "e-invoicing",
    title: "المرحلة الأولى من الفوترة الإلكترونية (مرحلة الإصدار والحفظ): المتطلبات والغرامات",
    excerpt:
      "كل ما تحتاج معرفته عن متطلبات توليد وحفظ الفواتير الإلكترونية لضريبة القيمة المضافة وتجنب غرامات عدم الالتزام.",
    readTime: "5 دقائق",
    tags: ["ZATCA", "الفاتورة", "المرحلة الأولى", "ضريبة القيمة المضافة"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          أطلقت هيئة الزكاة والضريبة والجمارك (ZATCA) نظام الفوترة الإلكترونية "فاتورة" بهدف تحسين
          الامتثال الضريبي والحد من التستر التجاري والاقتصاد الخفي. انطلقت المرحلة الأولى (الإصدار
          والحفظ) في 4 ديسمبر 2021.
        </p>

        <h4 className="text-white font-black text-lg">ما هي الفاتورة الإلكترونية المعتمدة؟</h4>
        <p className="text-zinc-300 leading-relaxed">
          هي فاتورة يتم توليدها وتعديلها وحفظها بتنسيق إلكتروني منظم عبر نظام محاسبي متكامل. لا
          تعتبر الفاتورة المكتوبة بخط اليد أو المصورة بالماسح الضوئي أو المكتوبة على برامج معالجة
          النصوص العادية (مثل Word) فاتورة إلكترونية معتمدة قانونياً.
        </p>

        <h4 className="text-white font-black text-lg mt-4">الشروط الإلزامية للمرحلة الأولى:</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-zinc-950/60 p-5 rounded-2xl border border-white/5">
            <h5 className="text-primary font-bold mb-2">1. منع الخصائص غير المتوافقة</h5>
            <p className="text-xs text-zinc-400">
              حظر استخدام الأنظمة التي تسمح بالتعديل على الفواتير بأثر رجعي، أو حذف السجلات، أو
              توليد فواتير بمسلسلات متعددة غير مترابطة.
            </p>
          </div>
          <div className="bg-zinc-950/60 p-5 rounded-2xl border border-white/5">
            <h5 className="text-emerald-400 font-bold mb-2">2. تضمين الـ QR Code</h5>
            <p className="text-xs text-zinc-400">
              للفواتير المبسطة (B2C)، يجب تضمين رمز استجابة سريعة (QR Code) يحتوي على اسم البائع،
              الرقم الضريبي، طابع الوقت، قيمة الضريبة، وإجمالي الفاتورة.
            </p>
          </div>
        </div>

        <h4 className="text-white font-black text-lg mt-4">لائحة المخالفات والغرامات:</h4>
        <ul className="list-disc list-inside space-y-2 mr-4 text-zinc-300">
          <li>
            عدم إصدار وحفظ الفواتير إلكترونياً: تبدأ الغرامات من{" "}
            <span className="text-rose-400 font-bold">5,000 ريال سعودي</span>.
          </li>
          <li>
            عدم تضمين رمز الاستجابة السريعة (QR) في الفاتورة المبسطة: تبدأ بغرامة إنذار وتصل إلى{" "}
            <span className="text-rose-400 font-bold">10,000 ريال سعودي</span>.
          </li>
          <li>
            حذف أو تعديل الفواتير الصادرة بعد إصدارها: غرامات تصل إلى{" "}
            <span className="text-rose-400 font-bold">50,000 ريال سعودي</span>.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "zatca-phase-2-technical",
    category: "e-invoicing",
    title: "الدليل الفني الشامل للامتثال بالمرحلة الثانية لـ ZATCA (الربط والتكامل)",
    excerpt:
      "شرح معمّق للمتطلبات التقنية مثل تشفير الفواتير، توليد الختم الرقمي عبر API الهيئة، والتحقق من صحة الفواتير الضريبية.",
    readTime: "8 دقائق",
    tags: ["ZATCA", "المرحلة الثانية", "تكامل", "API"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          تتطلب المرحلة الثانية (الربط والتكامل) من نظام "فاتورة" دمج الأنظمة التقنية الخاصة
          بالمكلفين مع أنظمة الهيئة مباشرة عبر بوابات الـ API لتسجيل الفواتير واعتمادها لحظياً.
        </p>

        <div className="bg-zinc-900/50 border border-white/5 p-5 rounded-2xl flex gap-3 items-start">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-400">
            يتم تطبيق هذه المرحلة على مجموعات مستهدفة يحددها حجم المبيعات السنوية الخاضعة لضريبة
            القيمة المضافة.
          </p>
        </div>

        <h4 className="text-white font-black text-lg">الخطوات التقنية الرئيسية للامتثال الفوري:</h4>
        <ol className="list-decimal list-inside space-y-3 mr-4 text-zinc-300">
          <li>
            <strong className="text-white">إصدار الهوية الرقمية لجهاز الفوترة (CCSID):</strong>
            توليد شهادات تشفير أمنية ثنائية للمنصة من خلال إجراء طلب التوثيق المتبادل (CSR) مع بوابة
            المطورين بـ ZATCA.
          </li>
          <li>
            <strong className="text-white">توليد الـ Hash والتسلسل المترابط (Chaining):</strong>
            تتطلب الهيئة ربط كل فاتورة جديدة بالفاتورة السابقة لها من خلال تضمين القيمة التشفيرية
            الهاش (SHA-256) الخاصة بالفاتورة السابقة داخل الفاتورة الحالية لمنع التلاعب بالسلسلة
            التاريخية.
          </li>
          <li>
            <strong className="text-white">التشفير بالختم الرقمي (ECDSA):</strong>
            توقيع ملف الفاتورة المكتوب بصيغة XML باستخدام مفتاح التشفير الخاص بالمنشأة، لضمان صحة
            هوية جهة الإصدار وعدم إمكانية تزييف الفاتورة.
          </li>
        </ol>

        <h4 className="text-white font-black text-lg mt-6">نوعا الفواتير في المرحلة الثانية:</h4>
        <div className="space-y-4">
          <div className="p-4 bg-zinc-950/40 rounded-xl border border-white/5">
            <h5 className="text-white font-bold text-sm">أ. الفواتير الضريبية القياسية (B2B):</h5>
            <p className="text-xs text-zinc-400 mt-1">
              يجب إرسالها لحظياً لهيئة الزكاة للموافقة عليها (Clearance) والحصول على ختم الهيئة قبل
              تسليمها للعميل التجاري.
            </p>
          </div>
          <div className="p-4 bg-zinc-950/40 rounded-xl border border-white/5">
            <h5 className="text-white font-bold text-sm">ب. الفواتير الضريبية المبسطة (B2C):</h5>
            <p className="text-xs text-zinc-400 mt-1">
              يتم تسليمها للعميل النهائي مباشرة مع إرسالها للهيئة في فترة لا تتجاوز 24 ساعة للإبلاغ
              (Reporting).
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "cryptographic-stamp-zatca",
    category: "e-invoicing",
    title: "فهم الختم الرقمي والشهادات التشفيرية (CCSID) في أنظمة الفواتير السعودية",
    excerpt:
      "تعرف على آلية التوقيع التشفيري للفواتير والتحقق من هوية المنشأة الرقمية في خوادم هيئة الزكاة.",
    readTime: "6 دقائق",
    tags: ["الختم الرقمي", "تشفير", "CCSID", "أمان"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          يعتبر الختم التشفيري بمثابة البصمة الرقمية التي تثبت سلامة الفاتورة ومصدرها. يحل هذا
          التوقيع محل الأختام والتواقيع الورقية التقليدية ويمنح الفاتورة قيمتها القانونية المطلقة
          أمام القضاء والجهات الحكومية.
        </p>

        <h4 className="text-white font-black text-lg">كيف يعمل الختم الرقمي؟</h4>
        <p className="text-zinc-300 leading-relaxed">
          يستخدم النظام تقنية التشفير بالمفاتيح العامة (Asymmetric Cryptography). يصدر النظام شهادة
          مشفرة تسمى (Cryptographic Stamp Certificate) وتعرف باسم (CCSID). عند إنشاء الفاتورة، يولد
          النظام طابعاً فريداً يربط تفاصيل الفاتورة بهوية المؤسسة المحفوظة بالهيئة.
        </p>

        <h4 className="text-white font-black text-lg mt-4">خطوات تجديد وتهيئة الشهادات:</h4>
        <div className="bg-zinc-950/80 border border-white/5 p-6 rounded-2xl">
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-xs text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>توليد زوج مفاتيح (العام والخاص) محلياً داخل النظام بصيغة آمنة.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>تقديم طلب توقيع الشهادة (CSR) عبر بوابة الفوترة بالهيئة.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>تخزين الشهادة المستلمة وتثبيتها بشكل آمن في خوادم مدارج OS المعتمدة.</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "standard-vs-simplified-invoice",
    category: "e-invoicing",
    title: "الفرق بين الفاتورة الضريبية القياسية (B2B) والفاتورة الضريبية المبسطة (B2C)",
    excerpt:
      "مقارنة دقيقة في المحتوى، طريقة الإصدار، والمجموعات المستهدفة وحالات الاستخدام في السوق السعودي.",
    readTime: "4 دقائق",
    tags: ["الفاتورة المبسطة", "B2B", "B2C", "التجزئة"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          تُصنف هيئة الزكاة الفواتير الإلكترونية إلى نوعين أساسيين بناءً على طبيعة الأطراف المتعاملة
          وقيمة التعاملات التجارية.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white font-bold bg-white/5">
                <th className="p-3">وجه المقارنة</th>
                <th className="p-3">الفاتورة الضريبية القياسية (B2B)</th>
                <th className="p-3">الفاتورة الضريبية المبسطة (B2C)</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300 divide-y divide-white/5">
              <tr>
                <td className="p-3 font-bold text-white">الطرف المستلم</td>
                <td className="p-3">منشأة تجارية أو جهة حكومية</td>
                <td className="p-3">المستهلك النهائي أو فرد عادي</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">رقم العميل الضريبي</td>
                <td className="p-3">إلزامي إذا كان مسجلاً بالضريبة</td>
                <td className="p-3">غير مطلوب بالكامل</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">متطلبات الـ QR Code</td>
                <td className="p-3">اختياري في المرحلة الأولى، إلزامي في الثانية</td>
                <td className="p-3">إلزامي بالكامل في جميع المراحل</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">الاعتماد من الهيئة</td>
                <td className="p-3">اعتماد فوري مسبق قبل الإرسال (Clearance)</td>
                <td className="p-3">تبليغ لاحق خلال 24 ساعة (Reporting)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    id: "xml-errors-zatca-fix",
    category: "e-invoicing",
    title: "الأخطاء الشائعة في ملفات XML للفواتير وطرق حلها فوراً",
    excerpt:
      "قائمة بأكواد أخطاء المطابقة الفنية لـ ZATCA عند رفع فواتير المرحلة الثانية وكيفية تصحيحها تلقائياً.",
    readTime: "7 دقائق",
    tags: ["أخطاء XML", "ZATCA SDK", "حلول تقنية", "فواتير"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          أثناء عملية الربط المباشر للمرحلة الثانية مع خوادم ZATCA، ترفض البوابة الإلكترونية بعض
          الفواتير نتيجة أخطاء تقنية في هيكلة ملفات الـ XML أو عدم تطابق قيم العمليات الحسابية بدقة
          الصفر.
        </p>

        <h4 className="text-white font-black text-lg">أبرز الأخطاء الشائعة وحلولها:</h4>
        <div className="space-y-4">
          <div className="p-4 bg-zinc-950/60 rounded-xl border border-white/5">
            <span className="text-xs font-mono text-rose-400 font-bold block">
              Error Code: IND-01 (Invalid Signature)
            </span>
            <p className="text-xs text-zinc-300 mt-1">
              <strong>السبب:</strong> وجود تلاعب في الفاتورة بعد توقيعها بالختم الرقمي أو استخدام
              شهادة تشفير منتهية أو غير مسجلة بالهيئة.
            </p>
            <p className="text-xs text-emerald-400 mt-1">
              <strong>الحل:</strong> إعادة تنشيط شهادة الـ CCSID ومطابقة ملف الـ XML قبل التوقيع
              للتأكد من عدم وجود مسافات فارغة تغير القيمة الهاش.
            </p>
          </div>
          <div className="p-4 bg-zinc-950/60 rounded-xl border border-white/5">
            <span className="text-xs font-mono text-rose-400 font-bold block">
              Error Code: VAL-04 (Calculation Mismatch)
            </span>
            <p className="text-xs text-zinc-300 mt-1">
              <strong>السبب:</strong> عدم مطابقة قيمة ضريبة القيمة المضافة الإجمالية مع حاصل ضرب
              أسعار بنود الفاتورة بالضرب العشري لـ 15%.
            </p>
            <p className="text-xs text-emerald-400 mt-1">
              <strong>الحل:</strong> تعتمد مدارج OS على محرك حسابي دقيق يطبق التقريب العشري لخانتين
              (Decimal Rounding) بما يتوافق مع متطلبات الـ SDK للهيئة بدقة مطلقة.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "debit-credit-notes-zatca",
    category: "e-invoicing",
    title: "الدليل القانوني لإصدار الإشعارات الدائنة والمدينة (المرتجع والتعديل) ضريبياً",
    excerpt:
      "تعلم القواعد الصحيحة لإرجاع البضائع أو تعديل الأخطاء في الفواتير الصادرة مسبقاً وتوثيقها بشكل رسمي.",
    readTime: "5 دقائق",
    tags: ["إشعار دائن", "إشعار مدين", "مرتجع", "الزكاة"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          يحظر نظام الفوترة الإلكترونية تماماً تعديل الفواتير الضريبية أو حذفها بعد إصدارها وإرسالها
          للهيئة. في حال حدوث تعديل في قيمة العقد، أو إرجاع العميل لبعض السلع، أو تعديل خطأ في
          الفاتورة، يجب استخدام الإشعارات الرسمية.
        </p>

        <h4 className="text-white font-black text-lg">1. الإشعار الدائن (Credit Note):</h4>
        <p className="text-zinc-300 leading-relaxed text-sm">
          يصدر لتخفيض القيمة المستحقة على العميل أو تسجيل مرتجع كامل أو جزئي للبضائع. يترتب عليه
          تقليل التزامك بضريبة القيمة المضافة المستحقة للهيئة.
        </p>

        <h4 className="text-white font-black text-lg mt-4">2. الإشعار المدين (Debit Note):</h4>
        <p className="text-zinc-300 leading-relaxed text-sm">
          يصدر لزيادة القيمة المستحقة على العميل (مثال: اكتشاف بيع السلع بسعر أقل من المتفق عليه، أو
          إضافة رسوم إضافية للخدمة). يترتب عليه زيادة الالتزام الضريبي للمنشأة.
        </p>

        <div className="bg-zinc-900/50 p-5 rounded-2xl border border-white/5">
          <h5 className="text-white font-bold text-sm mb-2">الشرط الأساسي للربط:</h5>
          <p className="text-xs text-zinc-400 leading-relaxed">
            يجب أن يشتمل الإشعار الدائن أو المدين على مرجع مباشر لرقم الفاتورة الضريبية الأصلية التي
            يتم تعديلها لمنع التلاعب وضمان سلاسة تفتيش الهيئة.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "uuid-and-chaining-explained",
    category: "e-invoicing",
    title: "فهم الرمز التعريفي الفريد (UUID) والهاش التراكمي في الفواتير الإلكترونية",
    excerpt:
      "كل ما تريد معرفته عن التقنيات الخفية التي تمنع تعديل الفواتير وتضمن ترابط المعاملات تاريخياً.",
    readTime: "6 دقائق",
    tags: ["UUID", "Cryptographic Chaining", "هاش", "حماية البيانات"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          تعتمد سلامة الفوترة الإلكترونية على آليات أمنية تضمن استحالة تعديل السجلات المحاسبية أو
          تغيير تسلسل الفواتير دون كشف ذلك فوراً من خلال الفحص التلقائي للهيئة.
        </p>

        <h4 className="text-white font-black text-lg">ما هو الـ UUID؟</h4>
        <p className="text-zinc-300 leading-relaxed">
          هو رمز فريد عالمياً (Universally Unique Identifier) يتم توليده بنمط عشوائي محدد (نسخة 4)
          ليمثل الهوية الفريدة لكل فاتورة على مستوى العالم، بحيث لا يمكن أن تتشابه فاتورتان في هذا
          الرمز أبداً.
        </p>

        <h4 className="text-white font-black text-lg mt-4">تقنية الترابط التراكمي (Chaining):</h4>
        <p className="text-zinc-300 leading-relaxed">
          تُجبر الهيئة الأنظمة على توليد قيمة تشفيرية (SHA-256 Hash) لكل فاتورة، وتمرير هذه القيمة
          لتكون جزءاً من مدخلات الفاتورة التي تليها مباشرة. ينشئ هذا ترابطاً يشبه سلاسل الكتل
          (Blockchain)؛ إذا تم تعديل أي فاتورة في منتصف السلسلة، ستفشل جميع الفواتير اللاحقة في
          المطابقة مما يكشف محاولة التلاعب فوراً.
        </p>
      </div>
    ),
  },

  // --- PAYROLL / WPS (8 ARTICLES) ---
  {
    id: "wps-ksa-regulations",
    category: "payroll",
    title: "الدليل التنظيمي لنظام حماية الأجور (WPS) لوزارة الموارد البشرية KSA",
    excerpt:
      "تعرف على النسب الإلزامية للالتزام بالدفع، تواريخ تقديم الملفات الشهرية، والعقوبات المقررة للمخالفين.",
    readTime: "7 دقائق",
    tags: ["WPS", "حماية الأجور", "وزارة الموارد البشرية", "الالتزام"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          يلزم برنامج حماية الأجور (WPS) جميع منشآت القطاع الخاص في المملكة العربية السعودية برفع
          ملفات الرواتب شهرياً لضمان سداد مستحقات الموظفين في مواعيدها ومراقبة عقود العمل الموثقة.
        </p>

        <h4 className="text-white font-black text-lg">نسبة الالتزام والحد الأدنى المقبول:</h4>
        <p className="text-zinc-300 leading-relaxed">
          تحسب وزارة الموارد البشرية نسبة التزام منشأتك شهرياً، والحد الأدنى المقبول لتجنب العقوبات
          هو <span className="text-emerald-400 font-bold">90%</span>.
        </p>

        <h4 className="text-white font-black text-lg mt-4">جدول تصنيف العقوبات التدريجية:</h4>
        <ul className="list-disc list-inside space-y-3 mr-4 text-zinc-300 text-sm">
          <li>
            <strong>تأخير الرواتب لمدة شهر:</strong> توجيه إنذار وتنبيه عبر قوى مع حظر تقديم تبريرات
            متأخرة.
          </li>
          <li>
            <strong>تأخير الرواتب لشهرين متتاليين:</strong> إيقاف الخدمات تلقائياً بما يشمل إصدار
            وتجديد رخص العمل وتأشيرات الاستقدام.
          </li>
          <li>
            <strong>تأخير الرواتب لثلاثة أشهر فأكثر:</strong> السماح بنقل كفالة الموظفين دون إذن
            صاحب العمل وإحالة المنشأة للتفتيش والتحقيق الميداني.
          </li>
        </ul>

        <div className="bg-zinc-900/50 p-5 rounded-2xl border border-white/5">
          <h5 className="text-white font-bold text-sm mb-1">الاستثناءات المقبولة للتبرير:</h5>
          <p className="text-xs text-zinc-400 leading-relaxed">
            تسمح منصة قوى بتقديم تبريرات مثل: الإجازات بدون راتب، الخصومات التأديبية الموثقة،
            الرواتب المدفوعة مقدماً، والوفاة أو مغادرة العمل، شريطة إرفاق الإثباتات اللازمة.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "how-to-generate-sif-file",
    category: "payroll",
    title: "طريقة إعداد وتصدير ملف حماية الأجور المعتمد للبنوك (SIF File)",
    excerpt:
      "تعلم التنسيق الصحيح لملف SIF، الحقول الإلزامية مثل رقم الآيبان ومبالغ البدلات والاستقطاعات المحاسبية.",
    readTime: "6 دقائق",
    tags: ["ملف SIF", "تصدير رواتب", "مدد", "البنوك السعودية"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          ملف الـ SIF (Standard Information Format) هو ملف نصي ذو تنسيق صارم جداً تستخدمه البنوك
          السعودية ومنصة مدد لمطابقة رواتب العاملين إلكترونياً. أي خطأ في مسافة واحدة أو فاصلة قد
          يتسبب في رفض الملف بالكامل من البنك.
        </p>

        <h4 className="text-white font-black text-lg">الحقول الأساسية المتضمنة في ملف SIF:</h4>
        <ul className="list-disc list-inside space-y-2 mr-4 text-zinc-300 text-sm">
          <li>
            <strong>رقم هوية الموظف/الإقامة:</strong> رقم فريد مكون من 10 خانات.
          </li>
          <li>
            <strong>رقم الآيبان (IBAN):</strong> الحساب البنكي النشط للموظف لتلقي الراتب.
          </li>
          <li>
            <strong>الراتب الأساسي وبدل السكن والبدلات الأخرى:</strong> يجب تحديد كل بند على حدة
            للامتثال للعقد الموثق.
          </li>
          <li>
            <strong>الاستقطاعات والتأمين:</strong> توضيح المبالغ المستقطعة للتأمينات (GOSI) أو
            الغيابات.
          </li>
        </ul>

        <div className="bg-zinc-950/60 p-5 rounded-2xl border border-white/5 font-mono text-xs text-zinc-400">
          {`/* مثال على تنسيق سطر الموظف في ملف SIF */\n1098765432,SA0380000012345678901234,4500.00,500.00,0.00,200.00,01`}
        </div>

        <p className="text-xs text-zinc-400">
          * تقوم منصة مدارج OS بتوليد وتدقيق ملف الـ SIF الخاص بك فورياً ومطابقته مع عقود قوى لضمان
          القبول الفوري من البنوك دون تأخير.
        </p>
      </div>
    ),
  },
  {
    id: "end-of-service-calculation-saudi",
    category: "payroll",
    title: "كيفية حساب مكافأة نهاية الخدمة بدقة وفق نظام العمل السعودي الجديد",
    excerpt:
      "المعادلات الرسمية لاحتساب مكافأة نهاية الخدمة للمستقيلين أو من انتهت عقودهم بالكامل مع الحالات الخاصة القانونية.",
    readTime: "6 دقائق",
    tags: ["مكافأة نهاية الخدمة", "قانون العمل", "الرواتب", "حسابات"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          مكافأة نهاية الخدمة هي حق إلزامي للعامل على صاحب العمل عند انتهاء علاقة العمل، وتقوم على
          أساس الراتب الفعلي الأخير للعامل وعدد سنوات الخدمة.
        </p>

        <h4 className="text-white font-black text-lg">القاعدة الأساسية للحساب:</h4>
        <ul className="list-disc list-inside space-y-3 mr-4 text-zinc-300 text-sm">
          <li>
            <strong>السنوات الخمس الأولى:</strong> يستحق العامل أجرة نصف شهر عن كل سنة من السنوات
            الخمس الأولى.
          </li>
          <li>
            <strong>ما زاد عن الخمس سنوات:</strong> يستحق العامل أجرة شهر كامل عن كل سنة تالية
            للسنوات الخمس الأولى.
          </li>
        </ul>

        <h4 className="text-white font-black text-lg mt-4">حالة الاستقالة (تأثير رغبة الموظف):</h4>
        <p className="text-zinc-300 leading-relaxed text-sm">
          إذا انتهت علاقة العمل بسبب استقالة العامل، يستحق المكافأة على النحو التالي:
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5 text-center">
            <span className="text-xs text-zinc-500 font-bold block">خدمة أقل من سنتين</span>
            <span className="text-rose-400 font-black text-sm block mt-2">لا يستحق شيئاً</span>
          </div>
          <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5 text-center">
            <span className="text-xs text-zinc-500 font-bold block">خدمة من 2 إلى 5 سنوات</span>
            <span className="text-amber-400 font-black text-sm block mt-2">يستحق ثلث المكافأة</span>
          </div>
          <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5 text-center">
            <span className="text-xs text-zinc-500 font-bold block">خدمة من 5 إلى 10 سنوات</span>
            <span className="text-emerald-400 font-black text-sm block mt-2">
              يستحق ثلثي المكافأة
            </span>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          * إذا بلغت الخدمة 10 سنوات فأكثر، يستحق المكافأة كاملة حتى في حال الاستقالة.
        </p>
      </div>
    ),
  },
  {
    id: "qiwa-platform-guide",
    category: "payroll",
    title: "دليل منصة قوى (Qiwa): التسجيل، توثيق عقود الموظفين وإدارتها",
    excerpt:
      "تعرف على منصة قوى الحكومية لإدارة خدمات قطاع العمل وإصدار تأشيرات العمل وتوثيق العقود إلكترونياً.",
    readTime: "5 دقائق",
    tags: ["قوى", "توثيق العقود", "الموارد البشرية", "KSA"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          تعتبر منصة "قوى" الواجهة الموحدة لوزارة الموارد البشرية لجميع الخدمات الرقمية لقطاع العمل.
          تجمع قوى كل ما يخص الموظف والمنشأة في مكان واحد لتنظيم سوق العمل ورفع نسبة الشفافية.
        </p>

        <h4 className="text-white font-black text-lg">الخدمات الأساسية في قوى:</h4>
        <ul className="list-disc list-inside space-y-2 mr-4 text-zinc-300">
          <li>
            <strong>إصدار وتجديد رخص العمل:</strong> المتطلب الأساسي لإصدار وتحديث الإقامات للعمالة
            الوافدة.
          </li>
          <li>
            <strong>توثيق عقود العمل إلكترونياً:</strong> حماية حقوق الطرفين ومنع الخلافات العمالية.
          </li>
          <li>
            <strong>نقل الخدمات وتغيير المسمى الوظيفي:</strong> إتمام الإجراءات الرقمية للتعاقد مع
            الكفاءات محلياً.
          </li>
          <li>
            <strong>لوحة الالتزام ومؤشرات التوطين:</strong> مراقبة المنشأة في نظام نطاقات والتحذير
            من هبوط النطاقات.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "mudad-vs-qiwa-comparison",
    category: "payroll",
    title: "ما الفرق بين منصة مدد ومنصة قوى؟ دليل أصحاب المنشآت",
    excerpt:
      "مقارنة دقيقة تحدد وظيفة كل منصة وكيفية التكامل بينهما لتحقيق الالتزام التام لقوانين العمل السعودي.",
    readTime: "4 دقائق",
    tags: ["مدد", "قوى", "الفرق", "أصحاب الأعمال"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          على الرغم من ترابط المنصتين، إلا أن لكل منهما أهدافاً ووظائف محاسبية وإدارية مختلفة تهم
          قطاع الشركات.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-950/60 p-6 rounded-2xl border border-white/5">
            <h4 className="text-primary font-black text-base mb-3">منصة قوى (Qiwa)</h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              منصة تنظيمية وتشريعية تركز على العلاقة التعاقدية العامة والتوطين والتأشيرات.
            </p>
            <ul className="text-xs text-zinc-300 space-y-2">
              <li>• صياغة وتوثيق عقود الموظفين.</li>
              <li>• رخص العمل والمهن ونقل الخدمات.</li>
              <li>• حساب نسب نطاقات والتوطين الفعلي.</li>
            </ul>
          </div>

          <div className="bg-zinc-950/60 p-6 rounded-2xl border border-white/5">
            <h4 className="text-emerald-400 font-black text-base mb-3">منصة مدد (Mudad)</h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              منصة مالية ومصرفية تركز على الرواتب الشهرية والامتثال لحماية الأجور WPS وتأمين الأجور.
            </p>
            <ul className="text-xs text-zinc-300 space-y-2">
              <li>• الربط المباشر مع البنوك لتحويل الرواتب.</li>
              <li>• كشف وإظهار مخالفات حماية الأجور والرد عليها.</li>
              <li>• مطابقة الملفات الرقمية للتحويل (SIF).</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "deductions-and-absences-math",
    category: "payroll",
    title: "طريقة حساب الاستقطاعات والغيابات والتأمين الاجتماعي للموظفين",
    excerpt:
      "دليل محاسبي يشرح بالخطوات كيفية تطبيق نظام الاستقطاع وقوانين الغياب والالتزام بحصص التأمينات الاجتماعية GOSI.",
    readTime: "5 دقائق",
    tags: ["استقطاع", "غياب الموظفين", "التأمينات الاجتماعية", "محاسبة"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          يتطلب مسير الرواتب الممتثل الخالي من الأخطاء تطبيق معادلات حسابية دقيقة لحساب أيام الغياب
          الفعلي والاستقطاعات المعتمدة بحق الموظف.
        </p>

        <h4 className="text-white font-black text-lg">معادلة خصم الغياب اليومي:</h4>
        <div className="bg-zinc-950/80 p-4 rounded-xl border border-white/5 font-mono text-center text-xs text-primary">
          قيمة خصم الغياب اليومي = (الراتب الأساسي + بدل السكن) / 30 يوم
        </div>

        <h4 className="text-white font-black text-lg mt-4">
          حصة المؤسسة في المؤسسة العامة للتأمينات الاجتماعية (GOSI):
        </h4>
        <p className="text-zinc-300 leading-relaxed text-sm">
          تحتسب الاشتراكات للتأمينات الاجتماعية شهرياً بناءً على الراتب المسجل الخاضع للاشتراك
          (الأساسي + بدل السكن المعتمد):
        </p>
        <ul className="list-disc list-inside space-y-2 mr-4 text-zinc-300 text-xs">
          <li>
            <strong>حصة الموظف السعودي:</strong> يتم استقطاع{" "}
            <span className="text-rose-400 font-bold">9.75%</span> من راتبه الخاضع للاشتراك.
          </li>
          <li>
            <strong>حصة صاحب العمل (المنشأة) للسعودي:</strong> تدفع المنشأة ما يعادل{" "}
            <span className="text-emerald-400 font-bold">11.75%</span> من راتبه الخاضع للاشتراك.
          </li>
          <li>
            <strong>الموظف غير السعودي:</strong> تدفع المنشأة{" "}
            <span className="text-emerald-400 font-bold">2%</span> مخصصة للأخطار المهنية وساند.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "gosi-compliance-for-smes",
    category: "payroll",
    title: "دليل الالتزام بنظام التأمينات الاجتماعية (GOSI) للمنشآت المتوسطة والصغيرة",
    excerpt:
      "كيف تضمن مطابقة الأجور المسجلة في التأمينات مع الأجور الفعلية المدفوعة لتجنب الغرامات المالية من مفتشي المؤسسة.",
    readTime: "5 دقائق",
    tags: ["GOSI", "التأمينات", "الامتثال", "غرامات"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          تفرض المؤسسة العامة للتأمينات الاجتماعية غرامات صارمة على الشركات التي تسجل أجور موظفيها
          بقيم أقل من الحقيقية أو تتخلف عن سداد الاشتراكات الشهرية في مواعيدها المحددة.
        </p>

        <h4 className="text-white font-black text-lg">كيف تتجنب غرامات التأمينات؟</h4>
        <ul className="list-disc list-inside space-y-3 mr-4 text-zinc-300 text-sm">
          <li>
            <strong>تحديث الأجور دورياً:</strong> تحديث الأجور والبدلات الخاضعة للاشتراك في شهر
            يناير من كل عام ميلادي.
          </li>
          <li>
            <strong>تسجيل الموظف فور مباشرة العمل:</strong> الالتزام بتسجيل الموظف الجديد في
            التأمينات خلال الـ 15 يوماً الأولى من مباشرته للعمل.
          </li>
          <li>
            <strong>استبعاد الموظف المستقيل فوراً:</strong> إتمام عملية الاستبعاد في بوابة التأمينات
            لعدم تراكم اشتراكات غير مستحقة على المنشأة.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "gcc-wage-protection-systems",
    category: "payroll",
    title: "نظرة مقارنة على أنظمة حماية الأجور (WPS) في دول مجلس التعاون الخليجي",
    excerpt:
      "كيف تختلف القوانين والمواعيد النهائية والملفات الرقمية لحماية الأجور بين السعودية والإمارات وقطر والكويت وعمان.",
    readTime: "6 دقائق",
    tags: ["WPS الخليج", "الإمارات", "الكويت", "سوق الخليج"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          تتشارك دول مجلس التعاون الخليجي في تطبيق أنظمة حماية الأجور لمراقبة التزام الشركات بحقوق
          العاملين، لكن لكل دولة تفاصيلها الفنية الخاصة.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-zinc-950/60 rounded-xl border border-white/5">
            <h5 className="text-white font-bold text-sm">السعودية (WPS KSA):</h5>
            <p className="text-xs text-zinc-400 mt-1">
              يتم التقديم والمطابقة عبر منصة مدد والبنوك بنسبة التزام لا تقل عن 90%.
            </p>
          </div>
          <div className="p-4 bg-zinc-950/60 rounded-xl border border-white/5">
            <h5 className="text-white font-bold text-sm">الإمارات (WPS UAE):</h5>
            <p className="text-xs text-zinc-400 mt-1">
              تشرف عليه وزارة الموارد البشرية والتوطين ومصرف الإمارات المركزي، ويشترط دفع الرواتب لـ
              90% من العمالة بحد أقصى 15 يوماً من الاستحقاق.
            </p>
          </div>
          <div className="p-4 bg-zinc-950/60 rounded-xl border border-white/5">
            <h5 className="text-white font-bold text-sm">عُمان والكويت:</h5>
            <p className="text-xs text-zinc-400 mt-1">
              تطبق أنظمة مشابهة عبر وزارات القوى العاملة بالتعاون مع البنوك المركزية المحلية.
            </p>
          </div>
        </div>
      </div>
    ),
  },

  // --- CRM & SALES (6 ARTICLES) ---
  {
    id: "how-to-choose-crm-for-smes",
    category: "crm",
    title: "كيف تختار نظام إدارة علاقات العملاء (CRM) المناسب لشركتك الناشئة؟",
    excerpt:
      "دليلك لمقارنة الميزات، سهولة الاستخدام، التكلفة، ودعم اللغة العربية والربط مع قنوات التواصل كواتساب.",
    readTime: "6 دقائق",
    tags: ["CRM", "مبيعات", "شركات ناشئة", "أدوات"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          يعتبر نظام الـ CRM بمثابة العقل المفكر لفريق المبيعات. اختيار النظام الصحيح يوفر على
          منشأتك مئات الساعات المفقودة في المتابعات اليدوية ويضمن زيادة معدلات تحويل الصفقات.
        </p>

        <h4 className="text-white font-black text-lg">الميزات الأساسية التي يجب البحث عنها:</h4>
        <ul className="list-disc list-inside space-y-2 mr-4 text-zinc-300">
          <li>
            <strong>الربط مع واتساب وقنوات التواصل:</strong> التواصل المباشر مع العملاء من واجهة
            واحدة.
          </li>
          <li>
            <strong>سهولة لوحة تحكم خطوط البيع (Pipeline Visibility):</strong> سحب وإفلات الصفقات
            بسلاسة لتتبع حالتها.
          </li>
          <li>
            <strong>التقارير التحليلية اللحظية:</strong> معرفة أداء كل مندوب مبيعات ونسبة نجاح
            الصفقات فورياً.
          </li>
          <li>
            <strong>دعم اللغة العربية والامتثال للبيانات المحلية:</strong> استضافة البيانات وحفظها
            وفق أنظمة أمن المعلومات المحلية.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "smart-whatsapp-followups",
    category: "crm",
    title: "استراتيجيات المتابعة الذكية للعملاء عبر قنوات الاتصال المتعددة دون إزعاج",
    excerpt:
      "تعلم الأوقات الذهبية للتواصل مع عملائك بالخليج، وصياغة الرسائل التفاعلية الفعالة لرفع نسب مبيعاتك.",
    readTime: "5 دقائق",
    tags: ["متابعة مبيعات", "واتساب", "أوقات التواصل", "تفاعل"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          المتابعة اللطيفة المنظمة هي السر الخفي لإتمام أكثر من 80% من المبيعات الناجحة. المتابعة
          غير الذكية قد تصنف رسائل شركتك كـ "سبام" وتتسبب بحظر رقم الواتساب الخاص بك.
        </p>

        <h4 className="text-white font-black text-lg">
          المعادلة الذهبية للمتابعة (Follow-up Rhythm):
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5">
            <span className="text-primary font-black block text-xs">اليوم الأول</span>
            <p className="text-xs text-zinc-400 mt-2">
              إرسال عرض السعر مع رسالة ترحيبية قصيرة ورابط تواصل مباشر للأسئلة.
            </p>
          </div>
          <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5">
            <span className="text-primary font-black block text-xs">اليوم الثالث</span>
            <p className="text-xs text-zinc-400 mt-2">
              متابعة لطيفة تسأل العميل عن مدى ملاءمة الأسعار أو حاجته لتعديل البنود.
            </p>
          </div>
          <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5">
            <span className="text-primary font-black block text-xs">اليوم السابع</span>
            <p className="text-xs text-zinc-400 mt-2">
              مشاركة قصة نجاح عميل مشابه أو توضيح القيمة المضافة لضمان إقناع العميل.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "b2b-saas-sales-ksa",
    category: "crm",
    title: "أتمتة مبيعات الشركات والخدمات (B2B SaaS) في السوق الخليجي",
    excerpt:
      "كيف تدير صفقات مبيعات الحلول التقنية والمقاولات والخدمات ذات الفترات الطويلة بنجاح وأمان محاسبي وقانوني.",
    readTime: "6 دقائق",
    tags: ["B2B", "مبيعات الشركات", "السوق الخليجي", "العقود"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          تتميز مبيعات الشركات (B2B) بطول فترة اتخاذ القرار وتعدد الأشخاص المعنيين بالموافقة على
          العروض التجارية. يتطلب ذلك إدارة دقيقة لكل مرحلة من مراحل التفاوض.
        </p>

        <h4 className="text-white font-black text-lg">العوامل الحاسمة لإغلاق الصفقات الكبرى:</h4>
        <ul className="list-disc list-inside space-y-3 mr-4 text-zinc-300">
          <li>
            <strong>أرشفة كاملة للمناقشات والتفاوض:</strong> حفظ المذكرات والملاحظات وتواريخ
            الاجتماعات داخل بطاقة الصفقة بالـ CRM.
          </li>
          <li>
            <strong>تجهيز مرن للعروض الفنية والمالية:</strong> القدرة على تعديل بنود العرض وإصدار
            نسخ مختلفة بناءً على جولات التفاوض.
          </li>
          <li>
            <strong>الربط بالعقود المعتمدة قانونياً:</strong> تحويل عرض السعر المقبول فورا إلى
            اتفاقية رسمية جاهزة للتوقيع الإلكتروني.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "how-to-build-sales-pipeline",
    category: "crm",
    title: "كيفية بناء خط أنابيب مبيعات (Sales Pipeline) فعال ومؤتمت بالكامل",
    excerpt:
      "تعلم تقسيم مراحل البيع من العميل المحتمل إلى الصفقة المغلقة بنجاح ومراقبة التحركات تلقائياً بالذكاء الاصطناعي.",
    readTime: "5 دقائق",
    tags: ["Sales Pipeline", "تنظيم صفقات", "أتمتة المبيعات", "دليل"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          يساعدك خط أنابيب المبيعات المنظم على فهم أين تذهب فرص البيع وما هي العقبات التي تمنع إتمام
          الصفقات التجارية لشركتك.
        </p>

        <h4 className="text-white font-black text-lg">
          المراحل الخمس الأساسية لخط الأنابيب النموذجي:
        </h4>
        <ol className="list-decimal list-inside space-y-2 mr-4 text-zinc-300 text-sm">
          <li>
            <strong>عميل محتمل جديد (Lead In):</strong> استلام الاستفسار من الموقع أو شبكات التواصل
            أو واتساب.
          </li>
          <li>
            <strong>التواصل والمؤهلات (Qualified):</strong> التحقق من جدية العميل وميزانيته واحتياجه
            الفعلي.
          </li>
          <li>
            <strong>تقديم العرض التجاري (Proposal Sent):</strong> توليد وإرسال عرض السعر المفصل
            للعميل.
          </li>
          <li>
            <strong>التفاوض والتعاقد (Negotiation):</strong> مناقشة الخصومات وتعديل البنود والاتفاق
            على الشروط القانونية.
          </li>
          <li>
            <strong>إغلاق الصفقة (Closed Won):</strong> التوقيع على العقد، وإصدار الفاتورة الضريبية
            الأولى وبدء تقديم الخدمة.
          </li>
        </ol>
      </div>
    ),
  },
  {
    id: "sales-kpis-and-dashboards",
    category: "crm",
    title: "قياس مؤشرات الأداء الرئيسية (KPIs) لفرق المبيعات والدعم الفني بالشركات",
    excerpt:
      "تعرف على أهم المقاييس مثل فترة إغلاق الصفقات، معدل التحويل، وقيمة دورة حياة العميل (LTV) وكيف تقرأها لحظياً.",
    readTime: "5 دقائق",
    tags: ["KPIs", "تحليلات المبيعات", "أداء الموظفين", "Dashboards"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          لا يمكنك تحسين ما لا تقوم بقياسه بدقة. توفر مؤشرات الأداء لوحة قيادة واضحة وموضوعية لتقييم
          كفاءة جهود المبيعات بالمؤسسة.
        </p>

        <h4 className="text-white font-black text-lg">أهم مؤشرات الأداء التي يجب قياسها شهرياً:</h4>
        <ul className="list-disc list-inside space-y-3 mr-4 text-zinc-300 text-sm">
          <li>
            <strong>معدل تحويل العملاء (Conversion Rate):</strong> نسبة العملاء الفعليين من إجمالي
            العملاء المحتملين الذين تواصلوا مع الشركة.
          </li>
          <li>
            <strong>متوسط وقت الإغلاق (Sales Cycle Length):</strong> المدة الزمنية اللازمة لتحويل
            العميل من مستفسر أول إلى صفقة مغلقة وناجحة.
          </li>
          <li>
            <strong>قيمة الصفقات المفقودة (Lost Opportunities Value):</strong> تحليل الأسباب الكامنة
            وراء رفض العملاء لعروضك لتفادي الأخطاء مستقبلاً.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "cloud-telephony-crm-integration",
    category: "crm",
    title: "الربط المباشر لخدمات الاتصال الهاتفي السحابي (Cloud Telephony) مع الـ CRM",
    excerpt:
      "كيف تزيد من كفاءة فريق الاتصالات وتوثق وتستمع لجميع تسجيلات المكالمات مباشرة من شاشة العميل بالـ CRM.",
    readTime: "5 دقائق",
    tags: ["اتصال سحابي", "تسجيل مكالمات", "كول سنتر", "CRM ربط"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          يسهل الاتصال السحابي ربط خطوط الهاتف الأرضية أو الموحدة (9200) بنظام إدارة علاقات العملاء
          مباشرة، مما يرفع من جودة خدمة العملاء والمتابعة الفورية.
        </p>

        <h4 className="text-white font-black text-lg">
          الميزات الثنائية لتكامل الاتصال السحابي مع مدارج OS:
        </h4>
        <ul className="list-disc list-inside space-y-2 mr-4 text-zinc-300">
          <li>
            <strong>عرض هوية المتصل الفورية (Caller ID Pop):</strong> تظهر معلومات وبطاقة العميل
            لموظف المبيعات فور رنين الهاتف.
          </li>
          <li>
            <strong>أتمتة تسجيل المكالمات:</strong> حفظ المكالمات الصوتية داخل ملف العميل للرجوع لها
            للتدريب وحل الخلافات التجارية.
          </li>
          <li>
            <strong>التحليلات التفصيلية للاتصالات:</strong> تقارير عن وقت المكالمات، فترات الانتظار،
            ونسب الرد والمتابعة.
          </li>
        </ul>
      </div>
    ),
  },

  // --- CONTRACTS & LEGAL (5 ARTICLES) ---
  {
    id: "digital-signature-validity-saudi",
    category: "contracts",
    title: "حجية التوقيع الإلكتروني في المنازعات القضائية السعودية والخليجية",
    excerpt:
      "قراءة قانونية لنظام المعاملات الإلكترونية السعودي الصادر بمرسوم ملكي وتوثيق المستندات رقمياً بموجبه.",
    readTime: "6 دقائق",
    tags: ["توقيع إلكتروني", "حجية قانونية", "محاكم السعودية", "قوانين"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          يمنح نظام المعاملات الإلكترونية السعودي التواقيع والاتفاقيات الإلكترونية كامل الحجية
          القانونية الموازية للتواقيع والمستندات الورقية التقليدية، شريطة الالتزام بمعايير الأمان
          المحددة.
        </p>

        <h4 className="text-white font-black text-lg">
          متطلبات الاعتراف القانوني بالتوقيع الرقمي:
        </h4>
        <ul className="list-disc list-inside space-y-3 mr-4 text-zinc-300 text-sm">
          <li>
            <strong>حماية فريدة وحصرية:</strong> أن يرتبط التوقيع بالموقع وحده دون غيره.
          </li>
          <li>
            <strong>سلامة العقد (Integrity):</strong> القدرة على كشف أي تعديل على محتوى الاتفاقية
            بعد التوقيع باستخدام بصمة الهاش المشفرة.
          </li>
          <li>
            <strong>مسار التدقيق والتوثيق (Audit Trail):</strong> تسجيل عنوان الـ IP وطابع وقت
            التوقيع وهوية الطرفين بدقة بالغة.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "nda-agreements-templates-gcc",
    category: "contracts",
    title: "صياغة اتفاقيات الحفاظ على سرية المعلومات (NDA) للشركات الخليجية",
    excerpt:
      "تعلم البنود الأساسية لحماية أسرار تجارتك، ملكيتك الفكرية، وبيانات عملائك عند التعاقد مع شركاء أو موظفين.",
    readTime: "5 دقائق",
    tags: ["NDA", "سرية المعلومات", "ملكية فكرية", "عقود تجارية"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          تعتبر اتفاقية عدم الإفصاح (Non-Disclosure Agreement) من أهم المستندات القانونية التي تحمي
          الشركات من تسريب الأفكار التجارية أو الخطط الفنية للمنافسين.
        </p>

        <h4 className="text-white font-black text-lg">
          أبرز البنود التي يجب تضمينها في اتفاقية الـ NDA:
        </h4>
        <ul className="list-disc list-inside space-y-2 mr-4 text-zinc-300 text-sm">
          <li>
            <strong>تعريف دقيق للمعلومات السرية:</strong> تحديد ما يعتبر سراً تجارياً (أكواد، قوائم
            عملاء، تصاميم فنية).
          </li>
          <li>
            <strong>مدة الالتزام بالسرية:</strong> تحديد فترة زمنية كافية (مثل: 3 سنوات بعد انتهاء
            العقد).
          </li>
          <li>
            <strong>التعويضات والغرامات عند الاختراق:</strong> وضع غرامات مالية واضحة ورادعة لأي طرف
            يخرق شروط الاتفاقية.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "saudi-unified-labor-contract",
    category: "contracts",
    title: "عقد العمل الموحد في السعودية: البنود الإلزامية والاختيارية",
    excerpt:
      "دليل إدارة الموارد البشرية لصياغة عقود عمل متوافقة مع نظام العمل وموثقة عبر منصة قوى الحكومية.",
    readTime: "6 دقائق",
    tags: ["عقد العمل الموحد", "نظام العمل", "قوى", "توثيق"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          فرضت وزارة الموارد البشرية نموذج عقد العمل الموحد لضمان حماية الموظف وصاحب العمل، ويتم
          تسجيل هذا العقد وتوثيقه بالكامل عبر منصة قوى.
        </p>

        <h4 className="text-white font-black text-lg">البنود الإلزامية غير القابلة للإسقاط:</h4>
        <ul className="list-disc list-inside space-y-2 mr-4 text-zinc-300">
          <li>• تحديد الأجر الأساسي وبدلات السكن والمواصلات بوضوح.</li>
          <li>• تحديد فترة التجربة (على ألا تتجاوز 90 يوماً وتصل إلى 180 يوماً بموافقة مكتوبة).</li>
          <li>• ساعات العمل الرسمية (8 ساعات يومياً كحد أقصى أو 48 ساعة أسبوعياً).</li>
          <li>
            • عدد أيام الإجازة السنوية المدفوعة (لا تقل عن 21 يوماً وتزداد لـ 30 يوماً عند إكمال 5
            سنوات بالخدمة).
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "digitizing-business-documents-safely",
    category: "contracts",
    title: "كيفية رقمنة وإدارة مستندات وتراخيص المنشأة التجارية بأمان تام",
    excerpt:
      "تجنب ضياع الأوراق وسجلات الشركات، وابنِ أرشيفاً سحابياً مشفراً يتتبع تواريخ انتهاء التراخيص الرسمية تلقائياً.",
    readTime: "4 دقائق",
    tags: ["رقمنة المستندات", "أرشيف سحابي", "أمان البيانات", "تراخيص"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          يعد الأرشيف السحابي الرقمي من الركائز الأساسية للتحول الرقمي في الشركات المعاصرة. يضمن
          الأرشيف حماية سجلات المؤسسة من الضياع والتلف ويسهل الوصول للبيانات من أي مكان بصلاحيات
          أمان صارمة.
        </p>

        <h4 className="text-white font-black text-lg">
          مزايا الأرشفة السحابية الذكية في مدارج OS:
        </h4>
        <ul className="list-disc list-inside space-y-3 mr-4 text-zinc-300 text-sm">
          <li>
            <strong>أمن وتشفير عالي (Military-Grade Encryption):</strong> حماية كاملة للمستندات من
            الاختراق وتوافق تام مع هيئة الأمن السيبراني.
          </li>
          <li>
            <strong>التنبيهات التلقائية لانتهاء التراخيص:</strong> تنبيهات بالبريد والواتساب قبل
            انتهاء السجلات التجارية أو شهادات الزكاة والدخل لتفادي الغرامات المالية.
          </li>
          <li>
            <strong>صلاحيات وصول دقيقة (Role-Based Access):</strong> تحكم مطلق بالملفات وتحديد من
            يستطيع عرض أو تحميل أو تعديل المستندات.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "external-procurement-contracts-tips",
    category: "contracts",
    title: "شروط وأحكام عقود التوريد والمشتريات الخارجية للشركات المستوردة",
    excerpt:
      "تعلم صياغة عقود المشتريات الخارجية وحساب بنود المسؤوليات والتأمين الدولي والتسليم IncoTerms.",
    readTime: "5 دقائق",
    tags: ["عقود التوريد", "IncoTerms", "مشتريات خارجية", "استيراد"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          تعتمد صياغة عقود الاستيراد الخارجية على شروط التجارة الدولية (IncoTerms) المعتمدة من غرفة
          التجارة الدولية لتحديد مسؤوليات الشحن والتأمين والمخاطر بين البائع والمشتري.
        </p>

        <h4 className="text-white font-black text-lg">
          أشهر شروط التسليم الدولية المستخدمة في عقود الاستيراد:
        </h4>
        <ul className="list-disc list-inside space-y-3 mr-4 text-zinc-300 text-sm">
          <li>
            <strong>EXW (Ex Works):</strong> يستلم المستورد البضاعة من باب مصنع المورد ويتحمل كافة
            تكاليف الشحن الداخلي والخارجي والتخليص الجمركي.
          </li>
          <li>
            <strong>FOB (Free On Board):</strong> يلتزم المورد بإيصال البضاعة ووضعها على متن السفينة
            في ميناء التصدير، ومن ثم تنتقل كافة التكاليف والمخاطر للمستورد.
          </li>
          <li>
            <strong>CIF (Cost, Insurance and Freight):</strong> يتحمل المورد تكاليف الشحن والتأمين
            الدولي للبضاعة حتى وصولها لميناء المستورد.
          </li>
        </ul>
      </div>
    ),
  },

  // --- SUPPLY CHAIN & LOGISTICS (4 ARTICLES) ---
  {
    id: "fasah-integration-supplychain",
    category: "supply-chain",
    title: "كيفية ربط نظام المشتريات والمخازن مع منصة فسح (Fasah) الجمركية",
    excerpt:
      "دليلك للتكامل مع البوابة الوطنية الموحدة للمنافذ الجمركية وتتبع بيانات بوالص الشحن والفسح تلقائياً.",
    readTime: "6 دقائق",
    tags: ["منصة فسح", "جمارك السعودية", "تتبع شحنات", "ربط لوجستي"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          تعتبر منصة "فسح" البوابة الوطنية الموحدة للمعاملات الجمركية والاستيراد والتصدير في المملكة
          العربية السعودية، وربطها مع أنظمتك التقنية يحسن من جودة سلاسل الإمداد.
        </p>

        <h4 className="text-white font-black text-lg">منافع الربط المباشر مع منصة فسح:</h4>
        <ul className="list-disc list-inside space-y-3 mr-4 text-zinc-300">
          <li>
            <strong>الفسح المسبق للشحنات:</strong> تقديم كافة المستندات والفواتير للجمارك إلكترونياً
            قبل وصول الحاوية للمنفذ الجمركي لتقليل أوقات الانتظار والأرضيات.
          </li>
          <li>
            <strong>تتبع لحظي لبيانات بوالص الشحن:</strong> تتبع حالة الحاوية من خروجها من بلد
            التصدير وحتى وصولها وتفتيشها وفسحها من الجمارك السعودية.
          </li>
          <li>
            <strong>التكامل مع المخلصين الجمركيين:</strong> إدارة المخلصين وتفويضهم ودفع الرسوم
            الجمركية والضرائب مباشرة وبطرق إلكترونية آمنة.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "landed-cost-math-details",
    category: "supply-chain",
    title: "طريقة حساب التكلفة الإجمالية الواصلة للمنتج (Landed Cost Calculation)",
    excerpt:
      "شرح للمعادلات الرياضية المحاسبية المعتمدة لتوزيع مصاريف الشحن والجمارك والنقل الداخلي على سعر المنتج الأصلي.",
    readTime: "5 دقائق",
    tags: ["Landed Cost", "حسابات جمركية", "تسعير المنتجات", "سلاسل إمداد"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          يعد حساب التكلفة الإجمالية الواصلة (Landed Cost) ركيزة رئيسية في تسعير المنتجات بدقة،
          لضمان تحقيق هوامش أرباح حقيقية خالية من المفاجآت والمصاريف الخفية.
        </p>

        <h4 className="text-white font-black text-lg">طرق توزيع التكاليف المشتركة للشحنة:</h4>
        <ul className="list-disc list-inside space-y-3 mr-4 text-zinc-300 text-sm">
          <li>
            <strong>التوزيع بناءً على القيمة الفردية للمنتج (By Value):</strong> يتم تقسيم أجور
            الشحن والجمارك بناء على نسبة سعر المنتج الإجمالي من القيمة الكلية للشحنة. وهي الطريقة
            الأكثر دقة وتطبيقاً.
          </li>
          <li>
            <strong>التوزيع بناءً على الوزن أو الحجم (By Weight/Volume):</strong> تستخدم عند شحن
            منتجات ذات أوزان أو أحجام متفاوتة جداً تؤثر بشكل مباشر على سعر تكلفة شحن الحاوية.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "multi-warehouse-inventory-management",
    category: "supply-chain",
    title: "إدارة المخزون متعدد المستودعات وجرد البضائع الدوري vs المستمر",
    excerpt:
      "تعلم كيفية تتبع حركة السلع بين الفروع المختلفة وتطبيق استراتيجيات صرف البضائع مثل FIFO و LIFO.",
    readTime: "5 دقائق",
    tags: ["إدارة المخازن", "FIFO", "الجرد الدوري", "سلاسل التوريد"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          تتطلب إدارة المخازن متعددة الفروع تخطيطاً دقيقاً لمنع نفاد المخزون أو تراكم بضائع غير
          مطلوبة تسبب في تجميد رأس مال منشأتك.
        </p>

        <h4 className="text-white font-black text-lg">استراتيجيات تقييم وصرف المخزون:</h4>
        <ul className="list-disc list-inside space-y-3 mr-4 text-zinc-300 text-sm">
          <li>
            <strong>FIFO (الوارد أولاً يصرف أولاً):</strong> بيع السلع القديمة أولاً لتقليل نسب تلف
            المخزون ومطابقة الأسعار الحقيقية للتكلفة. وهي الاستراتيجية المفضلة للمواد الغذائية
            والمستهلكات.
          </li>
          <li>
            <strong>LIFO (الوارد أخيراً يصرف أولاً):</strong> تستخدم في صناعات محددة ذات أسعار
            متقلبة للمواد الخام كصناعة المعادن والبناء.
          </li>
          <li>
            <strong>الجرد المستمر (Continuous Inventory):</strong> تحديث قيم وكميات المخزون فورياً
            عند كل عملية بيع أو شراء، وهو النظام المطبق تلقائياً في منصة مدارج OS.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "optimizing-supply-chain-leadtime",
    category: "supply-chain",
    title: "كيفية تحسين كفاءة سلاسل التوريد وتقليل فترات انتظار الشحنات الدولية",
    excerpt:
      "نصائح عملية لإدارة الموردين الدوليين، تحديد حد إعادة الطلب الآمن (Reorder Point)، وإيجاد بدائل توريد مرنة.",
    readTime: "5 دقائق",
    tags: ["سلاسل التوريد", "حد إعادة الطلب", "الموردين", "لوجستية"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          يعتبر تقليل فترات انتظار الشحنات (Lead Time) عاملاً حاسماً في استمرارية مبيعاتك وعدم
          انقطاع منتجاتك المفضلة من السوق.
        </p>

        <h4 className="text-white font-black text-lg">
          معادلة حد إعادة الطلب الآمن (Reorder Point):
        </h4>
        <div className="bg-zinc-950/80 p-4 rounded-xl border border-white/5 font-mono text-center text-xs text-primary">
          حد إعادة الطلب = (متوسط الاستهلاك اليومي × متوسط فترة التوريد بالأيام) + مخزون الأمان
          الاحتياطي
        </div>

        <p className="text-zinc-300 leading-relaxed text-sm mt-4">
          يضمن هذا التخطيط الدقيق بدء طلب الحاوية الجديدة تلقائياً بمجرد وصول الكمية الحالية للحد
          الآمن، مما يمنع انقطاع البضائع أو تكدس رأس المال.
        </p>
      </div>
    ),
  },

  // --- AI & AUTOMATION (2 ARTICLES) ---
  {
    id: "ai-forecasting-sales-demand",
    category: "ai",
    title: "استخدام الذكاء الاصطناعي التوليدي في التنبؤ بحجم المبيعات ومخاطر السوق",
    excerpt:
      "تعلم كيف تستفيد الأنظمة المعاصرة من خوارزميات التعلم الآلي لتقدير احتياجات المخزون المستقبلية بناءً على البيانات التاريخية.",
    readTime: "5 دقائق",
    tags: ["الذكاء الاصطناعي", "التعلم الآلي", "التنبؤ بالمبيعات", "تحليلات"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          لم يعد الذكاء الاصطناعي مجرد رفاهية تقنية، بل أصبح أداة أساسية في اتخاذ القرارات التجارية
          والتسويقية الدقيقة في الشركات والمنظمات الكبرى.
        </p>

        <h4 className="text-white font-black text-lg">مزايا التنبؤ الذكي بالمبيعات:</h4>
        <ul className="list-disc list-inside space-y-3 mr-4 text-zinc-300 text-sm">
          <li>
            <strong>تقليل الهدر المالي في المخازن:</strong> تقدير الكميات المطلوبة بدقة وتفادي تكدس
            البضائع غير الموسمية.
          </li>
          <li>
            <strong>تحديد الاتجاهات والمواسم الشرائية:</strong> فهم مواسم الطلب المرتفع (مثل رمضان
            وعيد الفطر ومواسم العودة للمدارس) لتهيئة خطوط التوريد مسبقاً.
          </li>
          <li>
            <strong>أتمتة عروض الأسعار:</strong> تقديم خصومات مخصصة للعملاء بناءً على توقعات سلوكهم
            الشرائي السابقة.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "customer-journey-automation-agents",
    category: "ai",
    title: "رقمنة رحلة العميل بالكامل وتحويلها لأتمتة تفاعلية فائقة السرعة",
    excerpt:
      "تصميم رحلات مستخدم ذكية تستجيب لتفاعلات العملاء وتقوم بإرسال التنبيهات وإصدار الفواتير تلقائياً دون تدخل بشري.",
    readTime: "5 دقائق",
    tags: ["رحلة العميل", "أتمتة العمليات", "الذكاء الاصطناعي", "كفاءة"],
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-zinc-300">
          تضمن أتمتة رحلة العميل تقديم تجربة مستخدم سريعة ومميزة تزيد من مستويات الرضا والولاء
          لعلامتك التجارية وتخفض الأخطاء التشغيلية البشرية.
        </p>

        <h4 className="text-white font-black text-lg">خطوات رحلة العميل المؤتمتة بالكامل:</h4>
        <ol className="list-decimal list-inside space-y-3 mr-4 text-zinc-300 text-sm">
          <li>
            <strong>استلام العميل المحتمل:</strong> قراءة الطلب بالذكاء الاصطناعي وتصنيف العميل
            وتعيين المندوب المناسب فورا.
          </li>
          <li>
            <strong>التسعير التلقائي:</strong> توليد الفاتورة الأولية وعرض السعر وإرسالها برابط
            مباشر عبر الواتساب والبريد.
          </li>
          <li>
            <strong>التعاقد والدفع الإلكتروني:</strong> حث العميل على توقيع العقد إلكترونياً وتوفير
            بوابات دفع آمنة (مدى، فيزا، أبل باي).
          </li>
          <li>
            <strong>إتمام الشحن وبدء الخدمة:</strong> تحويل تفاصيل الفاتورة المدفوعة تلقائياً لقسم
            المخازن واللوجستيات لجدولة التوصيل الفوري.
          </li>
        </ol>
      </div>
    ),
  },
];
