import React from "react";
import { motion } from "motion/react";
import { Check, X, ShieldAlert, Sparkles, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { trackLandingEvent } from "@/src/services/landingTracker";

export const ComparisonMatrixSection = () => {
  const comparisonRows = [
    {
      feature: "الربط اللحظي والتوقيع الرقمي مع هيئة الزكاة (ZATCA Phase 2)",
      desc: "توليد ملفات UBL 2.1 XML وتوقيع ECDSA secp256k1 بكسر من الثانية.",
      mudarij: { supported: true, note: "مباشر وتلقائي 100%" },
      qoyod: { supported: true, note: "رسوم إضافية للربط" },
      zoho: { supported: true, note: "يتطلب تهيئة معقدة" },
      quickbooks: { supported: false, note: "غير متوافق مع المرحلة 2" },
    },
    {
      feature: "ملفات مسير الرواتب المعتمدة من البنك المركزي و'مدد' (WPS SIF)",
      desc: "هيكلية تبويب صريحة (14/15) خالية من الأخطاء لجميع البنوك السعودية.",
      mudarij: { supported: true, note: "مدمج ومجاني" },
      qoyod: { supported: true, note: "محدود بعدد الموظفين" },
      zoho: { supported: false, note: "ملفات غير متوافقة بنسبة 100%" },
      quickbooks: { supported: false, note: "غير محلي إطلاقاً" },
    },
    {
      feature: "ربط واتساب سحابي بدون رسوم وسطاء (WhatsApp Cloud API)",
      desc: "إرسال الفواتير والتذكيرات وتأكيد الطلبات تلقائياً مع زر دفع مباشر.",
      mudarij: { supported: true, note: "عمولة 0% على الرسائل" },
      qoyod: { supported: false, note: "يتطلب بوابة خارجية" },
      zoho: { supported: false, note: "اشتراك منفصل مكلف" },
      quickbooks: { supported: false, note: "غير مدعوم" },
    },
    {
      feature: "التحقق المباشر من العنوان الوطني السعودي (SPL Proxy)",
      desc: "توصيل آلي وتدقيق العناوين الوطنية الرسمية عبر api.address.gov.sa.",
      mudarij: { supported: true, note: "تكامل رسمي مباشر" },
      qoyod: { supported: false, note: "إدخال نصي عشوائي" },
      zoho: { supported: false, note: "غير مدعوم" },
      quickbooks: { supported: false, note: "غير مدعوم" },
    },
    {
      feature: "منصة التوقيع الرقمي عالي الدقة (300 DPI Canvas E-Sign)",
      desc: "توقيع العقود بيومترياً وتوثيق الهويات قانونياً لحماية المبيعات.",
      mudarij: { supported: true, note: "مدمج مجاناً" },
      qoyod: { supported: false, note: "تطبيق خارجي" },
      zoho: { supported: false, note: "يتطلب Zoho Sign" },
      quickbooks: { supported: false, note: "غير مدعوم" },
    },
    {
      feature: "حساب نسبة التوطين (نطاقات) واستقطاعات التأمينات (GOSI)",
      desc: "مؤشر حي وفوري ومحاكاة توظيف المواطنين وتأثيرهم على النطاق.",
      mudarij: { supported: true, note: "مدمج في مسير الرواتب" },
      qoyod: { supported: false, note: "جدول اكسل خارجي" },
      zoho: { supported: false, note: "غير مدعوم" },
      quickbooks: { supported: false, note: "غير مدعوم" },
    },
    {
      feature: "عدد مستخدمين غير محدود وبدون فرض رسوم على كل مقعد (Per Seat)",
      desc: "إضافة المحاسب والمبيعات والإدارة دون زيادات تصاعدية بالفاتورة.",
      mudarij: { supported: true, note: "مستخدمين بلا حدود" },
      qoyod: { supported: false, note: "رسوم لكل مستخدم إضافي" },
      zoho: { supported: false, note: "رسوم باهظة لكل مقعد" },
      quickbooks: { supported: false, note: "حد أقصى للمستخدمين" },
    },
  ];

  return (
    <section id="comparison" className="py-28 bg-white text-zinc-900 border-t border-zinc-200 overflow-hidden" dir="rtl">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-black tracking-wide mb-6">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>مقارنة علمية وموضوعية 100%</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-tight">
            لماذا يفضل قادة الأعمال في المملكة <br />
            <span className="text-emerald-600">التحول من قيود وزوهو إلى نظام مدارج؟</span>
          </h2>
          <p className="text-zinc-500 text-lg font-medium mt-4">
            جدول المقارنة الفنية المباشرة بدون مواربة. انظر بنفسك كيف توفر كل ميزة نقدية وتلغي الحاجة للتطبيقات المنفصلة.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto pb-6">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-zinc-200">
                <th className="py-6 px-6 text-sm font-extrabold text-zinc-500 w-2/5">المعيار / الميزة التقنية</th>
                <th className="py-6 px-4 text-center text-base font-black text-emerald-700 bg-emerald-50/80 rounded-t-2xl border-x border-t border-emerald-200 w-1/5 shadow-sm">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-black text-zinc-900">نظام مدارج</span>
                    <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      النظام الموحد
                    </span>
                  </div>
                </th>
                <th className="py-6 px-4 text-center text-sm font-extrabold text-zinc-700 w-1/5">قيود (Qoyod)</th>
                <th className="py-6 px-4 text-center text-sm font-extrabold text-zinc-700 w-1/5">فواتير زوهو (Zoho)</th>
                <th className="py-6 px-4 text-center text-sm font-extrabold text-zinc-700 w-1/5">كويك بوكس (QuickBooks)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs md:text-sm">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-5 px-6 font-bold text-zinc-900 space-y-1">
                    <p className="font-extrabold text-zinc-900 text-sm">{row.feature}</p>
                    <p className="text-[11px] text-zinc-400 font-normal leading-relaxed">{row.desc}</p>
                  </td>

                  {/* Mudarij Column */}
                  <td className="py-5 px-4 text-center bg-emerald-50/40 border-x border-emerald-100/80 font-extrabold text-emerald-900">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="text-[11px] text-emerald-800 font-black mt-1">{row.mudarij.note}</span>
                    </div>
                  </td>

                  {/* Qoyod */}
                  <td className="py-5 px-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      {row.qoyod.supported ? (
                        <Check className="w-5 h-5 text-amber-500" />
                      ) : (
                        <X className="w-5 h-5 text-rose-400 opacity-60" />
                      )}
                      <span className="text-[11px] text-zinc-500 font-medium">{row.qoyod.note}</span>
                    </div>
                  </td>

                  {/* Zoho */}
                  <td className="py-5 px-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      {row.zoho.supported ? (
                        <Check className="w-5 h-5 text-amber-500" />
                      ) : (
                        <X className="w-5 h-5 text-rose-400 opacity-60" />
                      )}
                      <span className="text-[11px] text-zinc-500 font-medium">{row.zoho.note}</span>
                    </div>
                  </td>

                  {/* QuickBooks */}
                  <td className="py-5 px-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      {row.quickbooks.supported ? (
                        <Check className="w-5 h-5 text-amber-500" />
                      ) : (
                        <X className="w-5 h-5 text-rose-400 opacity-60" />
                      )}
                      <span className="text-[11px] text-zinc-500 font-medium">{row.quickbooks.note}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Callout */}
        <div className="mt-12 text-center bg-zinc-900 text-white p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-right space-y-1">
            <h4 className="text-xl font-black">هل تسجل بياناتك حالياً في قيود أو زوهو أو أكسيل؟</h4>
            <p className="text-xs text-zinc-400 font-medium">
              خدمة النقل المجاني: ينقل فريقنا الهندسي جميع بياناتك وفواتيرك السابقة إلى مدارج خلال أقل من 24 ساعة بدون توقف لعملك.
            </p>
          </div>
          <Link
            to="/app"
            onClick={() => trackLandingEvent("انتقل الآن مجاناً من الأنظمة الأخرى", "MIGRATION_CTA")}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl text-sm shrink-0 transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
          >
            اطلب نقل بياناتك مجاناً الآن
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ComparisonMatrixSection;
