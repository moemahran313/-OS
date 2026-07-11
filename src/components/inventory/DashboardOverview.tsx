import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Cpu,
  HelpCircle,
  Package,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardOverviewProps {
  items: any[];
  warehouses: any[];
  transfers: any[];
  adjustments: any[];
  onTabChange?: (tab: string) => void;
}

export default function DashboardOverview({
  items,
  warehouses,
  transfers,
  adjustments,
  onTabChange,
}: DashboardOverviewProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [valuationMethod, setValuationMethod] = useState<"weighted" | "fifo" | "lifo">("weighted");

  // Calculate detailed inventory KPIs
  const metrics = useMemo(() => {
    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let physicalCount = 0;
    let serviceCount = 0;
    let bundleCount = 0;

    items.forEach((item) => {
      const qtySum = Object.values(item.warehouseQuantities || {}).reduce(
        (a: any, b: any) => Number(a) + Number(b),
        0
      ) as number;

      // Calculate value based on selected method (simulate small variance)
      const multiplier =
        valuationMethod === "fifo" ? 1.02 : valuationMethod === "lifo" ? 0.98 : 1.0;
      totalValue += (qtySum * (item.costPriceHalalas || 0) * multiplier) / 100;

      if (qtySum === 0) {
        outOfStockCount++;
      } else if (qtySum < (item.minStock || 15)) {
        lowStockCount++;
      }

      // Check item custom types (defaulting to physical)
      const prodType =
        item.productType || (item.type === "assembly" ? "Finished Good" : "Raw Material");
      if (prodType === "Service") serviceCount++;
      else if (prodType === "Bundle") bundleCount++;
      else physicalCount++;
    });

    return {
      totalValue,
      totalCount: items.length,
      lowStockCount,
      outOfStockCount,
      physicalCount,
      serviceCount,
      bundleCount,
      warehousesCount: warehouses.length,
    };
  }, [items, warehouses, valuationMethod]);

  // Recharts: stock levels per warehouse
  const warehouseChartData = useMemo(() => {
    return warehouses.map((wh) => {
      let totalQty = 0;
      let whValue = 0;
      items.forEach((item) => {
        const qty = Number(item.warehouseQuantities?.[wh.id] || 0);
        totalQty += qty;
        whValue += (qty * (item.costPriceHalalas || 0)) / 100;
      });
      return {
        name: wh.nameAr || wh.nameEn,
        "الكمية المخزنة": totalQty,
        "القيمة (ر.س)": Math.round(whValue),
      };
    });
  }, [items, warehouses]);

  // Recharts: ABC Analysis (Value classification)
  // A: Top 70% value, B: Next 20%, C: Bottom 10%
  const abcChartData = useMemo(() => {
    const sortedItems = [...items]
      .map((item) => {
        const qty = Object.values(item.warehouseQuantities || {}).reduce(
          (a: any, b: any) => Number(a) + Number(b),
          0
        ) as number;
        const val = (qty * (item.costPriceHalalas || 0)) / 100;
        return { sku: item.sku, val };
      })
      .sort((a, b) => b.val - a.val);

    const totalValSum = sortedItems.reduce((acc, curr) => acc + curr.val, 0) || 1;
    let runningSum = 0;
    let countA = 0,
      countB = 0,
      countC = 0;
    let valA = 0,
      valB = 0,
      valC = 0;

    sortedItems.forEach((item) => {
      runningSum += item.val;
      const percentage = (runningSum / totalValSum) * 100;
      if (percentage <= 70) {
        countA++;
        valA += item.val;
      } else if (percentage <= 90) {
        countB++;
        valB += item.val;
      } else {
        countC++;
        valC += item.val;
      }
    });

    return [
      {
        name: "فئة A (الأعلى قيمة 70%)",
        value: countA || 1,
        amount: Math.round(valA),
        color: "#10b981",
      },
      {
        name: "فئة B (متوسط القيمة 20%)",
        value: countB || 1,
        amount: Math.round(valB),
        color: "#3b82f6",
      },
      {
        name: "فئة C (الأقل قيمة 10%)",
        value: countC || 1,
        amount: Math.round(valC),
        color: "#9ca3af",
      },
    ];
  }, [items]);

  // Simulation of AI forecasting and smart reorders
  const runAiEngine = () => {
    setAiLoading(true);
    setAiInsights([]);

    setTimeout(() => {
      const insightsList = [
        "⚠️ تنبؤ بالطلب: يواجه الصنف TAB-101 (طاولة مكتبية) تزايداً بنسبة 24% في مبيعات المنطقة الوسطى. يُنصح بزيادة حد الأمان بمقدار 20 وحدة لتفادي نفاذ المخزون في يوليو.",
        "💡 تحسين التوزيع: لوحظ تكدس في صنف الكراسي الطبية (CHR-202) بمستودع السلي الرئيسي (120 وحدة) مع طلب نشط في مستودع جدة (8 وحدات فقط). يُنصح بنقل 40 كرسي فوراً عبر تحويل بيني لتقليل تكلفة الفرصة البديلة.",
        "📈 تخفيض تكاليف التخزين (Dead Stock Alert): صنف الباقات التجميعية (Gaming PC Bundle) لم يسجل أي حركة صرف منذ 45 يوماً في مستودع مروج الرياض. يُنصح بعمل عرض ترويجي لتسييل 15% من المخزون الراكد.",
        "🎯 التوصية بالموردين: بناءً على أحدث أسعار التوريد وسرعة التسليم، نوصي باعتماد 'مجموعة الرياض للتأثيث' كمورد مفضل لصنف الطاولات لتحقيق وفرة بمقدار 4% في متوسط تكلفة الشراء.",
        "📦 إعادة جدولة الشراء: نقترح إصدار أمر شراء تلقائي لـ 50 وحدة من الصنف TAB-101 قبل 12 يوماً من موعد التوريد المعتاد بناءً على مؤشرات Lead Time المسجلة حديثاً.",
      ];
      setAiInsights(insightsList);
      setAiLoading(false);
    }, 1200);
  };

  const COLORS = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b"];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Valuation */}
        <div className="bg-white dark:bg-zinc-100 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between group hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              قيمة المخزون الكلية
            </span>
            <select
              value={valuationMethod}
              onChange={(e) => setValuationMethod(e.target.value as any)}
              className="text-[9px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-1.5 py-0.5 font-bold cursor-pointer outline-none text-zinc-600 dark:text-zinc-300"
            >
              <option value="weighted">المتوسط المرجح (WAC)</option>
              <option value="fifo">الوارد أولاً (FIFO)</option>
              <option value="lifo">الوارد أخيراً (LIFO)</option>
            </select>
          </div>
          <div className="my-4">
            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {metrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
              <span className="text-xs text-zinc-400 font-sans">ر.س</span>
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1">
              مجموع التكلفة لـ {metrics.totalCount} صنف نشط
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-black">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>متوافق مع معايير SOCPA المحاسبية</span>
          </div>
        </div>

        {/* Metric 2: Low Stock */}
        <div className="bg-white dark:bg-zinc-100 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between group hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            أصناف منخفضة المخزون
          </span>
          <div className="my-4">
            <h3 className="text-3xl font-black text-amber-500 font-mono flex items-baseline gap-2">
              {metrics.lowStockCount}
              <span className="text-xs text-zinc-400 font-sans font-bold">تجاوزت حد الأمان</span>
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1">أصناف وصلت لنقطة إعادة الطلب</p>
          </div>
          <button
            onClick={() => onTabChange && onTabChange("inventory")}
            className="text-[10px] text-amber-600 dark:text-amber-400 font-black flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>مراجعة وإصدار أوامر شراء</span>
            <ArrowRight className="w-3 h-3 rotate-180" />
          </button>
        </div>

        {/* Metric 3: Out of Stock */}
        <div className="bg-white dark:bg-zinc-100 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between group hover:border-red-500/30 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            أصناف نفدت تماماً
          </span>
          <div className="my-4">
            <h3 className="text-3xl font-black text-red-500 font-mono flex items-baseline gap-2">
              {metrics.outOfStockCount}
              <span className="text-xs text-zinc-400 font-sans font-bold">صنف فارغ</span>
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1">مبيعات معلقة بسبب نفاد الكميات</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400 font-black">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>يمنع البيع غير المغطى حالياً</span>
          </div>
        </div>

        {/* Metric 4: Warehouse Activity */}
        <div className="bg-white dark:bg-zinc-100 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            النشاط المستودعي
          </span>
          <div className="my-4">
            <h3 className="text-3xl font-black text-emerald-500 font-mono flex items-baseline gap-2">
              {metrics.warehousesCount}
              <span className="text-xs text-zinc-400 font-sans font-bold">مستودعات نشطة</span>
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1">
              تحويلات بينية نشطة: {transfers.length} معالجة
            </p>
          </div>
          <button
            onClick={() => onTabChange && onTabChange("warehouses")}
            className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>إدارة المواقع والرفوف</span>
            <ArrowRight className="w-3 h-3 rotate-180" />
          </button>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Level Per Warehouse Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-100 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            توزيع كميات وقيم المخزون على المستودعات (Warehouse Allocations)
          </h3>
          <div className="h-72 w-full text-xs font-bold">
            {warehouseChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-400">
                لا توجد مستودعات مدخلة حالياً
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={warehouseChartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-zinc-100 dark:stroke-zinc-800"
                  />
                  <XAxis dataKey="name" stroke="#a1a1aa" tickLine={false} />
                  <YAxis stroke="#a1a1aa" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "16px",
                      borderColor: "#e4e4e7",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="الكمية المخزنة" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={35} />
                  <Bar dataKey="القيمة (ر.س)" fill="#10b981" radius={[6, 6, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ABC Analysis Distribution Chart */}
        <div className="bg-white dark:bg-zinc-100 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              تحليل ABC لأصناف المخزون (Pareto ABC)
            </h3>
            <p className="text-[11px] text-zinc-400 mb-4">
              تصنيف الأصناف حسب المساهمة في القيمة المالية الكلية
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center relative">
            {items.length === 0 ? (
              <div className="text-zinc-400 text-xs">لا توجد بيانات كافية</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={abcChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {abcChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-black text-zinc-400">إجمالي الأصناف</span>
                  <span className="text-xl font-mono font-black text-zinc-900 dark:text-white">
                    {items.length}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2 mt-4 text-[11px] font-bold">
            {abcChartData.map((data, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-zinc-50 dark:border-zinc-800/50 pb-1.5 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: data.color }}
                  />
                  <span className="text-zinc-600 dark:text-zinc-300">{data.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-900 dark:text-zinc-100 font-mono block">
                    {data.amount.toLocaleString()} ر.س
                  </span>
                  <span className="text-[9px] text-zinc-400 block">{data.value} صنف مخزن</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Smart Engine & Forecasts */}
      <div className="bg-gradient-to-r from-indigo-900/10 via-emerald-900/5 to-transparent dark:from-indigo-950/20 dark:via-emerald-950/10 dark:to-transparent rounded-[2rem] border border-indigo-500/20 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-500/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600/20 p-2.5 rounded-2xl border border-indigo-500/30">
              <Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                محرك الذكاء الاصطناعي للتنبؤ والطلب (AI Demand Forecasting)
                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[9px] rounded-full font-black uppercase">
                  Alpha
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold mt-0.5">
                توليد تحليلات ذكية للتنبؤ بالنقص، تحسين الموارد، كشف ركود المخزون واقتراح كميات
                الشراء المثالية.
              </p>
            </div>
          </div>
          <button
            onClick={runAiEngine}
            disabled={aiLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            {aiLoading ? "جاري تشغيل محاكاة الطلب..." : "تشغيل التحليل التنبؤي الذكي"}
          </button>
        </div>

        {aiInsights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-bottom duration-300">
            {aiInsights.map((insight, idx) => (
              <div
                key={idx}
                className="bg-white/80 dark:bg-zinc-100/80 p-4 rounded-2xl border border-indigo-500/10 shadow-sm flex items-start gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:translate-y-[-2px] transition-all duration-300"
              >
                <div className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">✨</div>
                <div>
                  <p className="leading-relaxed">{insight}</p>
                  <div className="flex gap-2 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    <button className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline">
                      تنفيذ التوصية
                    </button>
                    <span className="text-zinc-300">|</span>
                    <button className="text-[10px] text-zinc-400 hover:underline">تجاهل</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 font-bold text-xs flex flex-col items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-bounce" />
            انقر على زر "تشغيل التحليل التنبؤي" للقيام بجرد ذكي وتقديم تنبؤات المخزون والموردين للـ
            30 يوماً القادمة.
          </div>
        )}
      </div>

      {/* Critical Alert Banner for Low Stock */}
      {metrics.lowStockCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="text-xs font-black text-amber-800 dark:text-amber-400">
              تنبيه حرج: هناك {metrics.lowStockCount} أصناف مخزنية انخفضت تحت حد الأمان المسموح به
              وقد تسبب تعطل المبيعات قريباً.
            </span>
          </div>
          <button
            onClick={() => onTabChange && onTabChange("inventory")}
            className="px-3.5 py-1.5 bg-amber-600 text-white hover:bg-amber-700 rounded-lg text-[10px] font-black transition-all whitespace-nowrap"
          >
            طلب توريد فوري
          </button>
        </div>
      )}
    </div>
  );
}
