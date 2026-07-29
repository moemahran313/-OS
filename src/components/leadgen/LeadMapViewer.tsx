import React, { useState } from "react";
import {
  MapPin,
  Compass,
  Building2,
  Navigation,
  Globe,
  Sliders,
  Phone,
  Star,
  ExternalLink,
  Layers,
  Map as MapIcon,
} from "lucide-react";
import { LeadCompany } from "@/src/types/leadGen";

interface LeadMapViewerProps {
  companies: LeadCompany[];
  onSelectCompany: (company: LeadCompany) => void;
}

export const LeadMapViewer: React.FC<LeadMapViewerProps> = ({
  companies,
  onSelectCompany,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>("Riyadh");
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [activeCompanyPin, setActiveCompanyPin] = useState<LeadCompany | null>(companies[0] || null);

  const cityCoordinates: Record<string, { lat: number; lng: number; nameAr: string }> = {
    Riyadh: { lat: 24.7136, lng: 46.6753, nameAr: "الرياض (العاصمة)" },
    Jeddah: { lat: 21.5433, lng: 39.1728, nameAr: "جدة (المنطقة الغربية)" },
    Dammam: { lat: 26.4344, lng: 50.1033, nameAr: "الدمام (المنطقة الشرقية)" },
    Khobar: { lat: 26.282, lng: 50.2104, nameAr: "الخبر" },
    Dubai: { lat: 25.1852, lng: 55.267, nameAr: "دبي (الإمارات)" },
  };

  const currentCityInfo = cityCoordinates[selectedCity] || cityCoordinates.Riyadh;

  const cityCompanies = companies.filter(
    (c) => c.city.toLowerCase() === selectedCity.toLowerCase()
  );

  return (
    <div className="space-y-6 dir-rtl">
      {/* Map Control Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-500" />
            <span>الخارطة التفاعلية ونطاق البحث الجغرافي (Map Lead Visualizer)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            استكشاف مواقع الشركات على الخارطة، وتحديد النطاقات الجغرافية (Radius Search) وتوزيع فرق المبيعات.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* City Selector */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
          >
            {Object.entries(cityCoordinates).map(([cityKey, info]) => (
              <option key={cityKey} value={cityKey}>
                {info.nameAr}
              </option>
            ))}
          </select>

          {/* Radius Selector */}
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <span className="text-xs font-bold text-zinc-500 whitespace-nowrap">نطاق القطر:</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{radiusKm} كم</span>
          </div>
        </div>
      </div>

      {/* Main Map Visual Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Interactive Canvas */}
        <div className="lg:col-span-2 bg-zinc-900 text-white rounded-3xl p-6 min-h-[420px] relative overflow-hidden flex flex-col justify-between border border-zinc-800 shadow-xl">
          {/* Background Grid Pattern simulating Geographic GIS map */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Map Header Overlay */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs font-bold">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>إحداثيات المركز: {currentCityInfo.lat}, {currentCityInfo.lng}</span>
            </div>

            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-xl text-xs font-black">
              {cityCompanies.length} شركة نشطة بالمجال
            </div>
          </div>

          {/* Canvas Pins Visual Representation */}
          <div className="relative z-10 my-auto py-12 flex items-center justify-center">
            {/* Radius Circle Graphic */}
            <div className="w-72 h-72 rounded-full border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 flex items-center justify-center relative animate-pulse">
              <span className="text-[10px] font-mono text-emerald-400/60 absolute top-2">
                دائرة التغطية الميدانية ({radiusKm} KM Radius)
              </span>

              {/* Center Pin */}
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center text-[10px] shadow-lg shadow-emerald-500/50">
                <MapPin className="w-3.5 h-3.5" />
              </div>

              {/* Distributed Business Pins */}
              {cityCompanies.map((c, i) => {
                const isSelected = activeCompanyPin?.id === c.id;
                // Offset calculation for pin rendering
                const topOffset = 30 + (i * 25) % 50;
                const leftOffset = 20 + (i * 35) % 60;

                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCompanyPin(c)}
                    style={{ top: `${topOffset}%`, left: `${leftOffset}%` }}
                    className={`absolute p-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-2 shadow-lg ${
                      isSelected
                        ? "bg-emerald-500 text-black border-white scale-110 z-20"
                        : "bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 border-zinc-700"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] font-black truncate max-w-[100px]">
                      {c.nameAr || c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Footer Note */}
          <div className="relative z-10 text-[10px] font-bold text-zinc-400 text-center">
            تكامل الخرائط: مصفوفة إحداثيات الهيئة العامة للمساحة ومركز قيادة التوزيع الجغرافي.
          </div>
        </div>

        {/* Selected Pin Details Sidebar */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          {activeCompanyPin ? (
            <div className="space-y-4">
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase">
                {activeCompanyPin.industry}
              </span>

              <div>
                <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                  {activeCompanyPin.nameAr || activeCompanyPin.name}
                </h3>
                <p className="text-xs text-zinc-400">{activeCompanyPin.name}</p>
              </div>

              <div className="space-y-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{activeCompanyPin.address}، {activeCompanyPin.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{activeCompanyPin.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="truncate">{activeCompanyPin.website}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                  <span>{activeCompanyPin.rating} ({activeCompanyPin.reviewCount} مراجعة)</span>
                </div>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold">
                {activeCompanyPin.description}
              </p>

              <button
                onClick={() => onSelectCompany(activeCompanyPin)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>فتح ملف الشركة المتكامل</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-zinc-400 text-center my-auto font-bold">
              اختر شركة من الخارطة لعرض تفاصيلها الميدانية.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
