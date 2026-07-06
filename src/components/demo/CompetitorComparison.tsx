import React, { useState } from "react";
import {
  Check,
  X,
  Shield,
  ArrowRightLeft,
  Sparkles,
  Building,
  Landmark,
  Percent,
} from "lucide-react";
import { COMPETITOR_COMPARISON_DATA, CompetitorComparisonData } from "./DemoDataGenerator";

interface Props {
  language?: "ar" | "en";
}

export default function CompetitorComparison({ language = "ar" }: Props) {
  const [activeCompetitor, setActiveCompetitor] = useState<
    "all" | "quickbooks" | "odoo" | "zoho" | "qoyod"
  >("all");

  const filteredData = COMPETITOR_COMPARISON_DATA;

  const getCompetitorHeader = (comp: string) => {
    switch (comp) {
      case "quickbooks":
        return "QuickBooks";
      case "odoo":
        return "Odoo ERP";
      case "zoho":
        return "Zoho Books";
      case "qoyod":
        return "قيود (Qoyod)";
      default:
        return "";
    }
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h3 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
            <ArrowRightLeft className="w-8 h-8 text-primary" />
            {language === "ar" ? "جدول المقارنة التفاعلي" : "Interactive Competitor Matrix"}
          </h3>
          <p className="text-zinc-400 mt-2 font-medium">
            {language === "ar"
              ? "اكتشف لماذا تختار كبرى الشركات الخليجية مدارج كبديل للأنظمة العالمية والمحلية"
              : "See why GCC companies migrate to Madarij OS from legacy ERPs."}
          </p>
        </div>

        {/* Competitor filter tabs */}
        <div className="flex flex-wrap gap-2 bg-zinc-950 p-1.5 rounded-xl border border-white/5">
          {(["all", "quickbooks", "odoo", "zoho", "qoyod"] as const).map((comp) => (
            <button
              key={comp}
              onClick={() => setActiveCompetitor(comp)}
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${
                activeCompetitor === comp
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {comp === "all" ? (language === "ar" ? "الكل" : "All") : getCompetitorHeader(comp)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table
          className="w-full text-right border-collapse"
          dir={language === "ar" ? "rtl" : "ltr"}
        >
          <thead>
            <tr className="border-b border-white/10 text-zinc-400 text-sm">
              <th className="pb-4 font-black">
                {language === "ar" ? "الميزة / المعيار" : "Feature / Standard"}
              </th>
              <th className="pb-4 font-black text-primary text-center bg-primary/5 rounded-t-xl px-4">
                مدارج (Madarij OS)
              </th>

              {(activeCompetitor === "all" || activeCompetitor === "quickbooks") && (
                <th className="pb-4 font-bold text-center px-4">QuickBooks</th>
              )}
              {(activeCompetitor === "all" || activeCompetitor === "odoo") && (
                <th className="pb-4 font-bold text-center px-4">Odoo</th>
              )}
              {(activeCompetitor === "all" || activeCompetitor === "zoho") && (
                <th className="pb-4 font-bold text-center px-4">Zoho Books</th>
              )}
              {(activeCompetitor === "all" || activeCompetitor === "qoyod") && (
                <th className="pb-4 font-bold text-center px-4">قيود (Qoyod)</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredData.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="py-5 font-black text-white text-sm md:text-base max-w-xs">
                  {row.feature}
                </td>

                {/* Madarij column */}
                <td className="py-5 text-center bg-primary/5 font-bold text-emerald-400 text-xs md:text-sm px-4">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span className="max-w-[150px] inline-block">{row.madarij}</span>
                  </div>
                </td>

                {/* QuickBooks column */}
                {(activeCompetitor === "all" || activeCompetitor === "quickbooks") && (
                  <td className="py-5 text-center text-zinc-400 text-xs md:text-sm px-4">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <X className="w-5 h-5 text-rose-500" />
                      <span className="max-w-[150px] inline-block text-zinc-500">
                        {row.quickbooks}
                      </span>
                    </div>
                  </td>
                )}

                {/* Odoo column */}
                {(activeCompetitor === "all" || activeCompetitor === "odoo") && (
                  <td className="py-5 text-center text-zinc-400 text-xs md:text-sm px-4">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <X className="w-5 h-5 text-amber-500" />
                      <span className="max-w-[150px] inline-block text-zinc-500">{row.odoo}</span>
                    </div>
                  </td>
                )}

                {/* Zoho column */}
                {(activeCompetitor === "all" || activeCompetitor === "zoho") && (
                  <td className="py-5 text-center text-zinc-400 text-xs md:text-sm px-4">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <X className="w-5 h-5 text-amber-500" />
                      <span className="max-w-[150px] inline-block text-zinc-500">{row.zoho}</span>
                    </div>
                  </td>
                )}

                {/* Qoyod column */}
                {(activeCompetitor === "all" || activeCompetitor === "qoyod") && (
                  <td className="py-5 text-center text-zinc-400 text-xs md:text-sm px-4">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <X className="w-5 h-5 text-amber-500" />
                      <span className="max-w-[150px] inline-block text-zinc-500">{row.qoyod}</span>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-5 bg-zinc-950/80 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center gap-4">
        <Shield className="w-10 h-10 text-primary shrink-0" />
        <div>
          <h4 className="font-bold text-white text-sm md:text-base">
            {language === "ar"
              ? "ضمان الملاءمة والامتثال الخليجي الكامل"
              : "Full Gulf Regulatory Compliance Guarantee"}
          </h4>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            {language === "ar"
              ? "مدارج مرخصة بالكامل من هيئة الزكاة والضريبة والجمارك (ZATCA) في السعودية، ومطابقة لأنظمة حماية الأجور (WPS) وقواعد التأمينات الاجتماعية في دول مجلس التعاون الخليجي."
              : "Licensed by ZATCA for electronic invoicing in Saudi Arabia and compliant with HR Wages Protection Systems across the GCC."}
          </p>
        </div>
      </div>
    </div>
  );
}
