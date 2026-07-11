import React, { useState } from "react";
import {
  FolderKanban,
  Briefcase,
  TrendingUp,
  DollarSign,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  MoreVertical,
  Edit,
  Trash2,
  Layers,
  ArrowUpRight,
  Sparkles,
  Users,
} from "lucide-react";
import { Project } from "../../types/projects";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

interface ProjectOverviewProps {
  projects: Project[];
  clients: any[]; // CRM leads
  language: string;
  onSelectProject: (p: Project) => void;
  onOpenNewProjectModal: () => void;
  onDeleteProject: (id: string) => void;
  onOpenCopilot: () => void;
}

export default function ProjectOverview({
  projects,
  clients,
  language,
  onSelectProject,
  onOpenNewProjectModal,
  onDeleteProject,
  onOpenCopilot,
}: ProjectOverviewProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [healthFilter, setHealthFilter] = useState<string>("All");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const isRtl = language === "ar";

  // Calculations
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "Active").length;

  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);

  // Calculate total costs (timesheets cost + expenses)
  const totalCosts = projects.reduce((acc, p) => {
    const timesheetCost = (p.timesheets || []).reduce((tAcc, t) => {
      return tAcc + (t.status === "Approved" ? t.hours * t.costRate : 0);
    }, 0);
    const expenseCost = (p.expenses || []).reduce((eAcc, e) => eAcc + e.amount, 0);
    return acc + timesheetCost + expenseCost;
  }, 0);

  const avgMargin =
    totalBudget > 0
      ? Math.max(0, Math.round(((totalBudget - totalCosts) / totalBudget) * 100))
      : 100;

  const totalHours = projects.reduce((acc, p) => {
    return acc + (p.timesheets || []).reduce((tAcc, t) => tAcc + t.hours, 0);
  }, 0);

  // Filtered list
  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      (p.clientName || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    const matchHealth = healthFilter === "All" || p.health === healthFilter;
    return matchSearch && matchStatus && matchHealth;
  });

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="bg-white dark:bg-zinc-100 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-black uppercase tracking-widest block">
              {isRtl ? "المشاريع الكلية" : "TOTAL PROJECTS"}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {totalProjects}
              </span>
              <span className="text-xs font-semibold text-emerald-500">
                {activeProjects} {isRtl ? "نشط" : "active"}
              </span>
            </div>
          </div>
          <div className="p-3 bg-emerald-500/5 text-emerald-500 rounded-xl border border-emerald-500/10">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        {/* Total Budget */}
        <div className="bg-white dark:bg-zinc-100 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-black uppercase tracking-widest block">
              {isRtl ? "الميزانيات الإجمالية" : "TOTAL BUDGETS"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {totalBudget.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-zinc-400">SAR</span>
            </div>
          </div>
          <div className="p-3 bg-blue-500/5 text-blue-500 rounded-xl border border-blue-500/10">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Spent Actuals */}
        <div className="bg-white dark:bg-zinc-100 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-black uppercase tracking-widest block">
              {isRtl ? "التكلفة المصروفة فعلياً" : "ACTUAL COST SPEND"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {totalCosts.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-zinc-500">SAR</span>
            </div>
          </div>
          <div className="p-3 bg-amber-500/5 text-amber-500 rounded-xl border border-amber-500/10">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Operating Profit Margin */}
        <div className="bg-white dark:bg-zinc-100 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-black uppercase tracking-widest block">
              {isRtl ? "معدل هامش الربح التشغيلي" : "EST. OPERATING MARGIN"}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-2xl font-black",
                  avgMargin > 40
                    ? "text-emerald-500"
                    : avgMargin > 15
                      ? "text-amber-500"
                      : "text-rose-500"
                )}
              >
                {avgMargin}%
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                {totalHours.toLocaleString()} {isRtl ? "ساعة مسجلة" : "hrs logged"}
              </span>
            </div>
          </div>
          <div className="p-3 bg-purple-500/5 text-purple-500 rounded-xl border border-purple-500/10">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters and Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-100 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-900">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute top-1/2 -translate-y-1/2 left-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRtl ? "البحث عن مشروع أو عميل..." : "Search projects or clients..."}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-700 dark:text-zinc-200 outline-none focus:border-emerald-500/50"
          >
            <option value="All">{isRtl ? "جميع الحالات" : "All Statuses"}</option>
            <option value="Planning">{isRtl ? "مرحلة التخطيط" : "Planning"}</option>
            <option value="Active">{isRtl ? "نشط" : "Active"}</option>
            <option value="Paused">{isRtl ? "متوقف مؤقتاً" : "Paused"}</option>
            <option value="Completed">{isRtl ? "مكتمل" : "Completed"}</option>
          </select>

          {/* Health Filter */}
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-700 dark:text-zinc-200 outline-none focus:border-emerald-500/50"
          >
            <option value="All">{isRtl ? "جميع مستويات السلامة" : "All Health states"}</option>
            <option value="On Track">{isRtl ? "سليم (On Track)" : "On Track"}</option>
            <option value="At Risk">{isRtl ? "معرض للمخاطر" : "At Risk"}</option>
            <option value="Critical">{isRtl ? "حرج (Critical)" : "Critical"}</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCopilot}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{isRtl ? "إنشاء ذكي بـ Gemini" : "Generate with Gemini"}</span>
          </button>

          <button
            onClick={onOpenNewProjectModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>{isRtl ? "مشروع جديد" : "New Project"}</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-zinc-100 p-12 text-center rounded-2xl border border-zinc-200 dark:border-zinc-900">
          <FolderKanban className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
          <h3 className="font-bold text-zinc-700 dark:text-zinc-200 text-sm">
            {isRtl ? "لا توجد مشاريع مطابقة" : "No projects found"}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {isRtl
              ? "ابدأ بإنشاء أول مشروع متكامل للمنشأة يدوياً أو بواسطة الـ Copilot."
              : "Initiate an enterprise project plan manually or use the AI Copilot."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => {
            const completedTasks = p.tasks.filter((t) => t.status === "Done").length;
            const totalTasks = p.tasks.length;
            const taskProgress =
              totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            // Project costs for this card
            const projectTimesheetCost = (p.timesheets || []).reduce((acc, t) => {
              return acc + (t.status === "Approved" ? t.hours * t.costRate : 0);
            }, 0);
            const projectExpenseCost = (p.expenses || []).reduce((acc, e) => acc + e.amount, 0);
            const totalProjectCost = projectTimesheetCost + projectExpenseCost;
            const costPct =
              p.budget > 0 ? Math.min(100, Math.round((totalProjectCost / p.budget) * 100)) : 0;

            return (
              <motion.div
                key={p.id}
                layoutId={`project-card-${p.id}`}
                className="bg-white dark:bg-zinc-100 rounded-2xl border border-zinc-200 dark:border-zinc-900/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Upper Body */}
                <div className="p-5 space-y-4 flex-1">
                  <div className="flex items-start justify-between">
                    {/* Health Indicator */}
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border",
                        p.health === "On Track"
                          ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/15"
                          : p.health === "At Risk"
                            ? "bg-amber-500/5 text-amber-500 border-amber-500/15"
                            : "bg-rose-500/5 text-rose-500 border-rose-500/15"
                      )}
                    >
                      {p.health === "On Track"
                        ? isRtl
                          ? "سليم"
                          : "On Track"
                        : p.health === "At Risk"
                          ? isRtl
                            ? "معرض لخطر"
                            : "At Risk"
                          : isRtl
                            ? "حرج"
                            : "Critical"}
                    </span>

                    {/* Actions Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === p.id ? null : p.id);
                        }}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === p.id && (
                        <div
                          className={cn(
                            "absolute top-7 bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-1.5 z-30 w-36 text-xs font-semibold",
                            isRtl ? "left-0" : "right-0"
                          )}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              onSelectProject(p);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300"
                          >
                            <Edit className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{isRtl ? "تعديل و تفاصيل" : "Edit & Details"}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  isRtl
                                    ? "هل أنت متأكد من حذف هذا المشروع بالكامل؟"
                                    : "Are you sure you want to delete this project?"
                                )
                              ) {
                                onDeleteProject(p.id);
                              }
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5 text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>{isRtl ? "حذف المشروع" : "Delete Project"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-1">
                    <h4
                      onClick={() => onSelectProject(p)}
                      className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 cursor-pointer transition-colors line-clamp-1"
                    >
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-2 min-h-[32px]">
                      {p.description}
                    </p>
                  </div>

                  {/* Client name if connected */}
                  {p.clientName && (
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-semibold bg-zinc-50 dark:bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200/40 dark:border-zinc-800/40">
                      <Briefcase className="w-3 h-3 text-zinc-400" />
                      <span className="line-clamp-1">{p.clientName}</span>
                    </div>
                  )}

                  {/* Progress bar tasks */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                      <span>{isRtl ? "إنجاز المهام" : "Task Completion"}</span>
                      <span>
                        {completedTasks}/{totalTasks} ({taskProgress}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${taskProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Budget Spent Actuals */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                      <span>{isRtl ? "المصروف الفعلي من الميزانية" : "Budget Spend Tracking"}</span>
                      <span
                        className={cn(
                          costPct > 90
                            ? "text-rose-500"
                            : costPct > 70
                              ? "text-amber-500"
                              : "text-emerald-500"
                        )}
                      >
                        {totalProjectCost.toLocaleString()} / {p.budget.toLocaleString()} SAR (
                        {costPct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-500",
                          costPct > 90
                            ? "bg-rose-500"
                            : costPct > 70
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        )}
                        style={{ width: `${costPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer details */}
                <div className="bg-zinc-50 dark:bg-zinc-100/40 px-5 py-3 border-t border-zinc-100 dark:border-zinc-900/60 flex items-center justify-between text-[10px] font-semibold text-zinc-400">
                  <div className="flex items-center gap-1">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        p.status === "Active"
                          ? "bg-emerald-500 animate-pulse"
                          : p.status === "Planning"
                            ? "bg-blue-500"
                            : p.status === "Paused"
                              ? "bg-amber-500"
                              : "bg-zinc-400"
                      )}
                    />
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {p.status === "Active"
                        ? isRtl
                          ? "نشط"
                          : "Active"
                        : p.status === "Planning"
                          ? isRtl
                            ? "قيد التخطيط"
                            : "Planning"
                          : p.status === "Paused"
                            ? isRtl
                              ? "متوقف مؤقتاً"
                              : "Paused"
                            : isRtl
                              ? "مكتمل"
                              : "Completed"}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectProject(p)}
                    className="text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                  >
                    <span>{isRtl ? "إدارة المشروع" : "Manage Project"}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
