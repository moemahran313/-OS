import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Layers,
  Clock,
  Users,
  DollarSign,
  Plus,
  CheckCircle2,
  ListTodo,
  Circle,
  FileSignature,
  FileText,
  AlertCircle,
  TrendingDown,
  ChevronRight,
  Trash2,
  Check,
  Send,
  Zap,
} from "lucide-react";
import {
  Project,
  Task,
  Milestone,
  Epic,
  Resource,
  Timesheet,
  ProjectExpense,
  SubTask,
} from "../../types/projects";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";

interface ProjectDetailsProps {
  project: Project;
  language: string;
  onBack: () => void;
  onUpdateProject: (updated: Project) => void;
}

export default function ProjectDetails({
  project,
  language,
  onBack,
  onUpdateProject,
}: ProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState<
    "tasks" | "timeline" | "timesheets" | "resources" | "financials"
  >("tasks");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");

  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showEpicModal, setShowEpicModal] = useState(false);

  // Form Fields
  const [newTask, setNewTask] = useState<Partial<Task>>({
    name: "",
    description: "",
    status: "Todo",
    priority: "Medium",
    assignee: "Lead Architect",
    estimatedHours: 8,
    actualHours: 0,
    milestoneId: "",
    epicId: "",
    subTasks: [],
  });

  const [newExpense, setNewExpense] = useState<Partial<ProjectExpense>>({
    description: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    category: "Software License",
  });

  const [newTimesheet, setNewTimesheet] = useState<Partial<Timesheet>>({
    taskId: "",
    description: "",
    hours: 4,
    date: new Date().toISOString().split("T")[0],
    assignee: "Lead Architect",
  });

  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    name: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    status: "pending",
  });

  const [newEpic, setNewEpic] = useState<Partial<Epic>>({
    name: "",
    description: "",
  });

  const isRtl = language === "ar";

  // Calculations
  const approvedTimesheetCost = (project.timesheets || []).reduce((acc, t) => {
    return acc + (t.status === "Approved" ? t.hours * t.costRate : 0);
  }, 0);
  const totalExpenseCost = (project.expenses || []).reduce((acc, e) => acc + e.amount, 0);
  const totalProjectCost = approvedTimesheetCost + totalExpenseCost;
  const projectMargin = project.budget - totalProjectCost;
  const marginPct = project.budget > 0 ? Math.round((projectMargin / project.budget) * 100) : 100;

  // Add a Task
  const handleAddTask = () => {
    if (!newTask.name) return;
    const taskObj: Task = {
      id: "task-" + Date.now(),
      name: newTask.name,
      description: newTask.description || "",
      status: newTask.status || "Todo",
      priority: newTask.priority || "Medium",
      assignee: newTask.assignee || "Lead Architect",
      estimatedHours: Number(newTask.estimatedHours) || 8,
      actualHours: 0,
      milestoneId: newTask.milestoneId || undefined,
      epicId: newTask.epicId || undefined,
      subTasks: [],
    };

    const updatedTasks = [...(project.tasks || []), taskObj];
    onUpdateProject({ ...project, tasks: updatedTasks });
    setShowTaskModal(false);
    setNewTask({
      name: "",
      description: "",
      status: "Todo",
      priority: "Medium",
      assignee: "Lead Architect",
      estimatedHours: 8,
    });
    toast.success(isRtl ? "تم إضافة المهمة بنجاح" : "Task added successfully");
  };

  // Toggle Task Status
  const handleToggleTaskStatus = (taskId: string, nextStatus: Task["status"]) => {
    const updatedTasks = (project.tasks || []).map((t) => {
      if (t.id === taskId) {
        return { ...t, status: nextStatus };
      }
      return t;
    });
    onUpdateProject({ ...project, tasks: updatedTasks });
    toast.info(
      isRtl ? `تم تحديث حالة المهمة إلى: ${nextStatus}` : `Task status updated to ${nextStatus}`
    );
  };

  // Add Subtask Checklist
  const handleAddSubtask = (taskId: string, name: string) => {
    if (!name) return;
    const updatedTasks = (project.tasks || []).map((t) => {
      if (t.id === taskId) {
        const subs = t.subTasks || [];
        return {
          ...t,
          subTasks: [...subs, { id: "sub-" + Date.now(), name, completed: false }],
        };
      }
      return t;
    });
    onUpdateProject({ ...project, tasks: updatedTasks });
  };

  const handleToggleSubtask = (taskId: string, subId: string) => {
    const updatedTasks = (project.tasks || []).map((t) => {
      if (t.id === taskId) {
        const subs = (t.subTasks || []).map((s) => {
          if (s.id === subId) {
            return { ...s, completed: !s.completed };
          }
          return s;
        });
        return { ...t, subTasks: subs };
      }
      return t;
    });
    onUpdateProject({ ...project, tasks: updatedTasks });
  };

  // Add Milestone
  const handleAddMilestone = () => {
    if (!newMilestone.name) return;
    const mileObj: Milestone = {
      id: "mile-" + Date.now(),
      name: newMilestone.name,
      description: newMilestone.description || "",
      dueDate: newMilestone.dueDate || new Date().toISOString().split("T")[0],
      status: "pending",
    };
    onUpdateProject({ ...project, milestones: [...(project.milestones || []), mileObj] });
    setShowMilestoneModal(false);
    setNewMilestone({ name: "", description: "", dueDate: new Date().toISOString().split("T")[0] });
    toast.success(isRtl ? "تمت إضافة المحطة بنجاح" : "Milestone created");
  };

  // Complete Milestone
  const handleToggleMilestone = (mileId: string) => {
    const updatedMiles = (project.milestones || []).map((m) => {
      if (m.id === mileId) {
        const nextStatus: "pending" | "completed" =
          m.status === "completed" ? "pending" : "completed";
        return { ...m, status: nextStatus };
      }
      return m;
    });
    onUpdateProject({ ...project, milestones: updatedMiles });
    toast.success(isRtl ? "تم تحديث حالة محطة المشروع" : "Milestone status updated");
  };

  // Add Epic
  const handleAddEpic = () => {
    if (!newEpic.name) return;
    const epicObj: Epic = {
      id: "epic-" + Date.now(),
      name: newEpic.name,
      description: newEpic.description || "",
    };
    onUpdateProject({ ...project, epics: [...(project.epics || []), epicObj] });
    setShowEpicModal(false);
    setNewEpic({ name: "", description: "" });
    toast.success(isRtl ? "تمت إضافة المجموعة البرمجية الكبرى" : "Epic added");
  };

  // Add Timesheet Log
  const handleAddTimesheet = () => {
    if (!newTimesheet.taskId || !newTimesheet.hours) return;
    const matchedTask = project.tasks.find((t) => t.id === newTimesheet.taskId);

    // Find cost rate from active resources
    const matchedResource = project.resources.find(
      (r) => r.name === (newTimesheet.assignee || "Lead Architect")
    );
    const costRate = matchedResource ? matchedResource.costRate : 150;

    const tsObj: Timesheet = {
      id: "timesheet-" + Date.now(),
      taskId: newTimesheet.taskId,
      taskName: matchedTask ? matchedTask.name : "General Project Work",
      description: newTimesheet.description || "",
      date: newTimesheet.date || new Date().toISOString().split("T")[0],
      hours: Number(newTimesheet.hours),
      costRate: costRate,
      assignee: newTimesheet.assignee || "Lead Architect",
      status: "Pending",
    };

    onUpdateProject({ ...project, timesheets: [...(project.timesheets || []), tsObj] });
    setShowTimesheetModal(false);
    setNewTimesheet({
      taskId: "",
      description: "",
      hours: 4,
      date: new Date().toISOString().split("T")[0],
    });
    toast.success(
      isRtl
        ? "تم تسجيل الوقت بنجاح (بانتظار موافقة المدير)"
        : "Time logged successfully (Pending Approval)"
    );
  };

  // Approve Timesheet Log (trigges cost re-calculation)
  const handleApproveTimesheet = (tsId: string) => {
    const updatedTimesheets = (project.timesheets || []).map((t) => {
      if (t.id === tsId) {
        return { ...t, status: "Approved" as const };
      }
      return t;
    });

    // Update actual task logged hours
    const timesheetItem = project.timesheets.find((t) => t.id === tsId);
    let updatedTasks = project.tasks;
    if (timesheetItem && timesheetItem.status !== "Approved") {
      updatedTasks = project.tasks.map((task) => {
        if (task.id === timesheetItem.taskId) {
          return { ...task, actualHours: (task.actualHours || 0) + timesheetItem.hours };
        }
        return task;
      });
    }

    onUpdateProject({ ...project, timesheets: updatedTimesheets, tasks: updatedTasks });
    toast.success(
      isRtl ? "تمت الموافقة على سجل الوقت واحتساب التكاليف" : "Timesheet approved & costs updated"
    );
  };

  // Add Expense
  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount) return;
    const expObj: ProjectExpense = {
      id: "exp-" + Date.now(),
      description: newExpense.description,
      amount: Number(newExpense.amount),
      date: newExpense.date || new Date().toISOString().split("T")[0],
      category: newExpense.category || "General",
    };

    onUpdateProject({ ...project, expenses: [...(project.expenses || []), expObj] });
    setShowExpenseModal(false);
    setNewExpense({
      description: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      category: "Software License",
    });
    toast.success(
      isRtl ? "تم تسجيل المصروف في المشروع بنجاح" : "Expense logged in project financial database"
    );
  };

  // BRIDGING: Generate Real Invoice in Accounting Engine
  const handleGenerateInvoice = async () => {
    try {
      const matchedClient = project.clientId || "N/A";
      const invoiceData = {
        userId: project.userId || auth.currentUser?.uid || "system",
        clientId: project.clientId || "won_lead_placeholder",
        clientName: project.clientName || "Corporate Client",
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: "draft",
        currency: "SAR",
        projectCode: project.id,
        projectName: project.name,
        discount: 0,
        taxRate: 15, // standard KSA ZATCA tax rate
        lineItems: [
          {
            name: `${isRtl ? "خدمات استشارية وإدارة مشاريع" : "Consultancy & Project Delivery Services"} - ${project.name}`,
            quantity: 1,
            unitPrice: project.budget,
            taxRate: 15,
          },
        ],
        notes: `Generated automatically from Project OS. Connected to Project ID: ${project.id}.`,
        createdAt: new Date().toISOString(),
      };

      // Create doc in 'invoices' collection
      await addDoc(collection(db, "invoices"), invoiceData);

      toast.success(
        isRtl
          ? "تم توليد فاتورة رسمية بنجاح وربطها بدفتر الأستاذ والقيود!"
          : "Official Project Invoice generated successfully inside the Accounting Engine!"
      );
    } catch (err: any) {
      console.error(err);
      toast.error(isRtl ? "فشل توليد الفاتورة التلقائية" : "Failed to generate project invoice");
    }
  };

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Upper Navigation & Title Card */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">
                {project.billingMethod === "Fixed Price"
                  ? isRtl
                    ? "سعر ثابت"
                    : "FIXED PRICE"
                  : isRtl
                    ? "حسب الوقت والمواد"
                    : "TIME & MATERIALS"}
              </span>
              <span className="text-zinc-300 dark:text-zinc-800">•</span>
              <span className="text-[10px] font-bold text-zinc-400 font-mono">
                ID: {project.id}
              </span>
            </div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              {project.name}
            </h2>
          </div>
        </div>

        {/* Dynamic Financial Banner summary */}
        <div className="flex items-center gap-6 bg-zinc-50 dark:bg-zinc-900 px-5 py-3 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 text-xs">
          <div>
            <span className="text-zinc-500 block">
              {isRtl ? "ميزانية المشروع" : "Project Budget"}
            </span>
            <strong className="text-zinc-900 dark:text-zinc-100 text-sm">
              {project.budget.toLocaleString()} SAR
            </strong>
          </div>
          <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
          <div>
            <span className="text-zinc-500 block">{isRtl ? "هامش الأرباح" : "Net Profit"}</span>
            <strong
              className={cn("text-sm", projectMargin > 0 ? "text-emerald-500" : "text-rose-500")}
            >
              {projectMargin.toLocaleString()} SAR ({marginPct}%)
            </strong>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-900 pb-px text-xs font-semibold">
        <button
          onClick={() => setActiveTab("tasks")}
          className={cn(
            "pb-3 px-4 border-b-2 transition-all cursor-pointer",
            activeTab === "tasks"
              ? "border-emerald-500 text-emerald-500"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          )}
        >
          {isRtl ? "المهام والعمليات" : "Tasks & Checklist"}
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={cn(
            "pb-3 px-4 border-b-2 transition-all cursor-pointer",
            activeTab === "timeline"
              ? "border-emerald-500 text-emerald-500"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          )}
        >
          {isRtl ? "المخطط الزمني (Gantt)" : "Gantt Timeline"}
        </button>
        <button
          onClick={() => setActiveTab("timesheets")}
          className={cn(
            "pb-3 px-4 border-b-2 transition-all cursor-pointer",
            activeTab === "timesheets"
              ? "border-emerald-500 text-emerald-500"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          )}
        >
          {isRtl ? "تسجيل وإقرار الساعات" : "Timesheets & Approval"}
        </button>
        <button
          onClick={() => setActiveTab("resources")}
          className={cn(
            "pb-3 px-4 border-b-2 transition-all cursor-pointer",
            activeTab === "resources"
              ? "border-emerald-500 text-emerald-500"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          )}
        >
          {isRtl ? "الموارد البشرية" : "Team Workload"}
        </button>
        <button
          onClick={() => setActiveTab("financials")}
          className={cn(
            "pb-3 px-4 border-b-2 transition-all cursor-pointer",
            activeTab === "financials"
              ? "border-emerald-500 text-emerald-500"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          )}
        >
          {isRtl ? "المصروفات والفوترة" : "Financials & Invoice"}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="min-h-[400px]">
        {/* 1. TASKS TAB */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border",
                    viewMode === "list"
                      ? "bg-zinc-900 border-zinc-800 text-white"
                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 text-zinc-500"
                  )}
                >
                  {isRtl ? "طريقة القائمة" : "List View"}
                </button>
                <button
                  onClick={() => setViewMode("board")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border",
                    viewMode === "board"
                      ? "bg-zinc-900 border-zinc-800 text-white"
                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 text-zinc-500"
                  )}
                >
                  {isRtl ? "لوحة كانبان" : "Kanban Board"}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowMilestoneModal(true)}
                  className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-[11px] font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  {isRtl ? "+ محطة رئيسية" : "+ Milestone"}
                </button>
                <button
                  onClick={() => setShowEpicModal(true)}
                  className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-[11px] font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  {isRtl ? "+ مجموعة كبرى" : "+ Epic"}
                </button>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                >
                  {isRtl ? "+ إضافة مهمة" : "+ Add Task"}
                </button>
              </div>
            </div>

            {/* LIST VIEW */}
            {viewMode === "list" && (
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-400 font-bold border-b border-zinc-200 dark:border-zinc-900">
                    <tr>
                      <th className="py-3 px-4 text-left">{isRtl ? "المهمة" : "Task Name"}</th>
                      <th className="py-3 px-4 text-left">{isRtl ? "المسؤول" : "Assignee"}</th>
                      <th className="py-3 px-4 text-left">
                        {isRtl ? "المحطة / المجموعة" : "Milestone / Epic"}
                      </th>
                      <th className="py-3 px-4 text-left">{isRtl ? "الأولوية" : "Priority"}</th>
                      <th className="py-3 px-4 text-left">{isRtl ? "التقدير" : "Est."}</th>
                      <th className="py-3 px-4 text-left">{isRtl ? "الحالة" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-900 text-zinc-700 dark:text-zinc-300">
                    {project.tasks.map((task) => {
                      const matchedMile = project.milestones.find((m) => m.id === task.milestoneId);
                      const matchedEpic = project.epics.find((e) => e.id === task.epicId);

                      return (
                        <tr
                          key={task.id}
                          className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/30 transition-colors"
                        >
                          <td className="py-3 px-4 font-semibold text-zinc-800 dark:text-zinc-200">
                            <div>
                              <span>{task.name}</span>
                              <p className="text-[10px] text-zinc-400 font-normal mt-0.5">
                                {task.description}
                              </p>
                            </div>
                            {/* Inner Subtasks checklist */}
                            <div className="mt-2 space-y-1">
                              {(task.subTasks || []).map((sub) => (
                                <button
                                  key={sub.id}
                                  onClick={() => handleToggleSubtask(task.id, sub.id)}
                                  className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium hover:text-emerald-500 cursor-pointer"
                                >
                                  {sub.completed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5 text-zinc-400" />
                                  )}
                                  <span
                                    className={sub.completed ? "line-through text-zinc-500" : ""}
                                  >
                                    {sub.name}
                                  </span>
                                </button>
                              ))}
                              {/* Quick subtask add */}
                              <div className="flex items-center gap-1.5 mt-1">
                                <input
                                  type="text"
                                  placeholder={
                                    isRtl ? "إضافة بند فرعي..." : "Add checklist item..."
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleAddSubtask(task.id, e.currentTarget.value);
                                      e.currentTarget.value = "";
                                    }
                                  }}
                                  className="bg-transparent border-b border-zinc-200 dark:border-zinc-800 text-[10px] focus:border-emerald-500/50 outline-none w-32 py-0.5"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-500">{task.assignee}</td>
                          <td className="py-3 px-4 font-mono text-[10px] text-zinc-500">
                            {matchedMile && (
                              <span className="bg-blue-500/5 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/10 block mb-1 text-center">
                                {matchedMile.name}
                              </span>
                            )}
                            {matchedEpic && (
                              <span className="bg-purple-500/5 text-purple-500 px-1.5 py-0.5 rounded border border-purple-500/10 block text-center">
                                {matchedEpic.name}
                              </span>
                            )}
                            {!matchedMile && !matchedEpic && "-"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                "px-1.5 py-0.5 rounded text-[10px] font-black border",
                                task.priority === "High"
                                  ? "bg-rose-500/5 text-rose-500 border-rose-500/15"
                                  : task.priority === "Medium"
                                    ? "bg-amber-500/5 text-amber-500 border-amber-500/15"
                                    : "bg-blue-500/5 text-blue-500 border-blue-500/15"
                              )}
                            >
                              {task.priority === "High"
                                ? isRtl
                                  ? "عالي"
                                  : "High"
                                : task.priority === "Medium"
                                  ? isRtl
                                    ? "متوسط"
                                    : "Medium"
                                  : isRtl
                                    ? "منخفض"
                                    : "Low"}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-500">
                            {task.estimatedHours}h
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleToggleTaskStatus(task.id, e.target.value as Task["status"])
                              }
                              className="px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] outline-none"
                            >
                              <option value="Backlog">Backlog</option>
                              <option value="Todo">Todo</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Review">Review</option>
                              <option value="Done">Done</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* BOARD VIEW */}
            {viewMode === "board" && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {(["Backlog", "Todo", "In Progress", "Review", "Done"] as Task["status"][]).map(
                  (status) => {
                    const tasksInLane = project.tasks.filter((t) => t.status === status);
                    return (
                      <div
                        key={status}
                        className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-900 flex flex-col min-h-[400px] space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-2">
                          <span className="font-black text-xs text-zinc-700 dark:text-zinc-200 tracking-wider uppercase">
                            {status}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-900 text-zinc-500">
                            {tasksInLane.length}
                          </span>
                        </div>

                        <div className="flex-1 space-y-2 overflow-y-auto">
                          {tasksInLane.map((t) => (
                            <div
                              key={t.id}
                              className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:border-emerald-500/20 transition-all space-y-2"
                            >
                              <h5 className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                                {t.name}
                              </h5>
                              <p className="text-[10px] text-zinc-400 line-clamp-2">
                                {t.description}
                              </p>
                              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-zinc-500">
                                <span>{t.assignee}</span>
                                <span className="font-mono">{t.estimatedHours}h</span>
                              </div>

                              {/* Fast transition buttons */}
                              <div className="flex items-center gap-1 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60">
                                {status !== "Done" && (
                                  <button
                                    onClick={() =>
                                      handleToggleTaskStatus(
                                        t.id,
                                        status === "Backlog"
                                          ? "Todo"
                                          : status === "Todo"
                                            ? "In Progress"
                                            : status === "In Progress"
                                              ? "Review"
                                              : "Done"
                                      )
                                    }
                                    className="w-full text-center py-1 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/10 text-[9px] font-bold"
                                  >
                                    {isRtl ? "ترقية للحالة التالية" : "Advance →"}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. TIMELINE TAB */}
        {activeTab === "timeline" && (
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">
                {isRtl ? "المخطط الزمني للأهداف والمهام" : "Milestones & Tasks Gantt chart"}
              </h3>
              <p className="text-[10px] text-zinc-400">
                {isRtl
                  ? "يرسم المخطط بشكل ديناميكي بناءً على مواعيد البداية والنهاية."
                  : "Constructed automatically from start and end dates."}
              </p>
            </div>

            {/* Milestones Horizontal Timeline */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-900 pb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span>{isRtl ? "الأهداف والمحطات الكبرى للمشروع" : "Project Milestones"}</span>
              </h4>

              <div className="relative pl-6 border-l border-zinc-200 dark:border-zinc-800 space-y-6">
                {project.milestones.map((m, idx) => (
                  <div key={m.id} className="relative">
                    {/* Bullet marker */}
                    <button
                      onClick={() => handleToggleMilestone(m.id)}
                      className={cn(
                        "absolute -left-[30px] top-1 w-4.5 h-4.5 rounded-full flex items-center justify-center border transition-all cursor-pointer",
                        m.status === "completed"
                          ? "bg-emerald-500 border-emerald-600 text-white shadow"
                          : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                      )}
                    >
                      {m.status === "completed" && (
                        <Check className="w-3 h-3 text-white font-black" />
                      )}
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <p
                          className={cn(
                            "font-bold text-xs",
                            m.status === "completed"
                              ? "text-zinc-400 line-through"
                              : "text-zinc-850 dark:text-zinc-200"
                          )}
                        >
                          {m.name}
                        </p>
                        <p className="text-[10px] text-zinc-400">{m.description}</p>
                      </div>
                      <span className="text-[10px] font-mono bg-blue-500/5 border border-blue-500/10 text-blue-500 px-2 py-0.5 rounded self-start">
                        {isRtl ? "الموعد المستهدف:" : "Target due date:"} {m.dueDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Gantt Bars */}
            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-500" />
                <span>{isRtl ? "المخطط الزمني للمهام" : "Interactive Gantt Bars"}</span>
              </h4>

              <div className="space-y-2 pt-2">
                {project.tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 text-xs">
                    <span className="w-28 shrink-0 font-semibold text-zinc-700 dark:text-zinc-300 line-clamp-1">
                      {task.name}
                    </span>
                    <div className="flex-1 bg-zinc-50 dark:bg-zinc-900 p-1.5 rounded-lg border border-zinc-100 dark:border-zinc-900 flex items-center">
                      <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-850 rounded overflow-hidden relative">
                        {/* Bar offset simulating timeline */}
                        <div
                          className={cn(
                            "h-full rounded transition-all duration-500 flex items-center justify-center text-[9px] font-black text-white",
                            task.status === "Done"
                              ? "bg-emerald-500"
                              : task.status === "In Progress"
                                ? "bg-blue-500"
                                : "bg-zinc-400"
                          )}
                          style={{
                            width:
                              task.status === "Done"
                                ? "100%"
                                : task.status === "In Progress"
                                  ? "60%"
                                  : "20%",
                            marginLeft:
                              task.status === "In Progress"
                                ? "15%"
                                : task.status === "Done"
                                  ? "0%"
                                  : "5%",
                          }}
                        >
                          {task.status === "Done"
                            ? "100%"
                            : task.status === "In Progress"
                              ? "60%"
                              : "Planning"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. TIMESHEETS TAB */}
        {activeTab === "timesheets" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">
                {isRtl ? "تسجيل ساعات العمل" : "Submit Employee Timesheet"}
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    {isRtl ? "المهمة المرتبطة" : "Associated Task"}
                  </label>
                  <select
                    value={newTimesheet.taskId}
                    onChange={(e) => setNewTimesheet({ ...newTimesheet, taskId: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none"
                  >
                    <option value="">{isRtl ? "اختر مهمة..." : "Select a task..."}</option>
                    {project.tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    {isRtl ? "العضو المنفذ" : "Team Member"}
                  </label>
                  <select
                    value={newTimesheet.assignee}
                    onChange={(e) => setNewTimesheet({ ...newTimesheet, assignee: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none"
                  >
                    {project.resources.map((r, idx) => (
                      <option key={idx} value={r.name}>
                        {r.name} ({r.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                      {isRtl ? "عدد الساعات" : "Hours"}
                    </label>
                    <input
                      type="number"
                      value={newTimesheet.hours || ""}
                      onChange={(e) =>
                        setNewTimesheet({ ...newTimesheet, hours: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                      {isRtl ? "التاريخ" : "Date"}
                    </label>
                    <input
                      type="date"
                      value={newTimesheet.date}
                      onChange={(e) => setNewTimesheet({ ...newTimesheet, date: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    {isRtl ? "تفاصيل النشاط" : "Work Description"}
                  </label>
                  <textarea
                    value={newTimesheet.description}
                    onChange={(e) =>
                      setNewTimesheet({ ...newTimesheet, description: e.target.value })
                    }
                    placeholder={
                      isRtl
                        ? "ما الذي تم إنجازه خلال الساعات..."
                        : "Describe the accomplishments..."
                    }
                    rows={3}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none resize-none"
                  />
                </div>

                <button
                  onClick={handleAddTimesheet}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  {isRtl ? "تسجيل الوقت" : "Log Hours"}
                </button>
              </div>
            </div>

            {/* Audit Logs / Timesheets Table */}
            <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm lg:col-span-2 space-y-4">
              <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">
                {isRtl ? "سجلات أوقات العمل والموافقات" : "Time Audit and Approvals"}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-400 font-bold border-b border-zinc-200 dark:border-zinc-900">
                    <tr>
                      <th className="py-2 px-3 text-left">{isRtl ? "المسؤول" : "Member"}</th>
                      <th className="py-2 px-3 text-left">
                        {isRtl ? "المهمة والنشاط" : "Task / Activity"}
                      </th>
                      <th className="py-2 px-3 text-left">{isRtl ? "الساعات" : "Hrs"}</th>
                      <th className="py-2 px-3 text-left">
                        {isRtl ? "التكلفة (SAR)" : "Cost Rate"}
                      </th>
                      <th className="py-2 px-3 text-left">{isRtl ? "الحالة" : "Approval"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-zinc-700 dark:text-zinc-300">
                    {(project.timesheets || []).map((t) => (
                      <tr key={t.id} className="hover:bg-zinc-50/20">
                        <td className="py-2.5 px-3">
                          <span className="font-bold">{t.assignee}</span>
                          <span className="block text-[10px] text-zinc-400">{t.date}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {t.taskName}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{t.description}</p>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-zinc-800 dark:text-white">
                          {t.hours}h
                        </td>
                        <td className="py-2.5 px-3 font-mono text-zinc-500">
                          {t.costRate} SAR/h
                          <span className="block text-[10px] text-zinc-400 font-normal">
                            Total: {(t.hours * t.costRate).toLocaleString()} SAR
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {t.status === "Approved" ? (
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded">
                              {isRtl ? "معتمد" : "Approved"}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApproveTimesheet(t.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[9px] font-bold cursor-pointer transition-all"
                            >
                              {isRtl ? "اعتماد الساعات" : "Approve"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. RESOURCES TAB */}
        {activeTab === "resources" && (
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">
                {isRtl ? "مؤشر لود العمل والقدرة الاستيعابية" : "Resource Allocation Workloads"}
              </h3>
              <p className="text-[10px] text-zinc-400">
                {isRtl
                  ? "معدلات التكلفة والتفرغ للمشروع."
                  : "Displays hourly cost rates and project allocation %."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.resources.map((res, idx) => {
                const totalLoggedHours = (project.timesheets || [])
                  .filter((t) => t.assignee === res.name)
                  .reduce((acc, t) => acc + t.hours, 0);

                const isOverload = res.allocation > 100;

                return (
                  <div
                    key={idx}
                    className="bg-zinc-50 dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {res.name}
                        </h4>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">
                          {res.role}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-black border",
                          isOverload
                            ? "bg-rose-500/5 text-rose-500 border-rose-500/10"
                            : "bg-emerald-500/5 text-emerald-500 border-emerald-500/10"
                        )}
                      >
                        {isOverload
                          ? isRtl
                            ? "حمل مفرط"
                            : "Overallocated"
                          : isRtl
                            ? "حمل مثالي"
                            : "Healthy Load"}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Cost details */}
                      <div className="flex items-center justify-between border-b border-zinc-200/40 dark:border-zinc-800/40 pb-2">
                        <span className="text-zinc-400">
                          {isRtl ? "تكلفة العمل المباشرة" : "Hourly Direct Cost"}
                        </span>
                        <strong className="text-zinc-800 dark:text-zinc-200">
                          {res.costRate} SAR / hr
                        </strong>
                      </div>

                      {/* Logged cumulative */}
                      <div className="flex items-center justify-between border-b border-zinc-200/40 dark:border-zinc-800/40 pb-2">
                        <span className="text-zinc-400">
                          {isRtl ? "إجمالي ساعات المنفذة" : "Total Hrs Completed"}
                        </span>
                        <strong className="text-zinc-800 dark:text-zinc-200">
                          {totalLoggedHours} hrs
                        </strong>
                      </div>

                      {/* Allocation Load bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
                          <span>{isRtl ? "نسبة التفرغ للمشروع" : "Project Allocation"}</span>
                          <span>{res.allocation}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all",
                              isOverload ? "bg-rose-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${Math.min(100, res.allocation)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. FINANCIALS TAB */}
        {activeTab === "financials" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Financial metrics & bridge */}
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm space-y-6 lg:col-span-1">
              <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">
                {isRtl ? "تحليل الميزانية والأرباح" : "Project Profitability Engine"}
              </h3>

              <div className="space-y-4 text-xs">
                {/* Budget */}
                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">
                    {isRtl ? "ميزانية العقد الكلية" : "Total Project Contract Value"}
                  </span>
                  <strong className="text-zinc-800 dark:text-zinc-100 text-lg font-black font-mono">
                    {project.budget.toLocaleString()} SAR
                  </strong>
                </div>

                {/* Expenses accum */}
                <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-900">
                  <span className="text-zinc-500">
                    {isRtl ? "تكلفة العمل المباشرة (Timesheets)" : "Direct Labor Costs"}
                  </span>
                  <strong className="font-mono text-zinc-800 dark:text-white">
                    {approvedTimesheetCost.toLocaleString()} SAR
                  </strong>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-900">
                  <span className="text-zinc-500">
                    {isRtl ? "المصروفات والمشتريات" : "Material & Category Expenses"}
                  </span>
                  <strong className="font-mono text-zinc-800 dark:text-white">
                    {totalExpenseCost.toLocaleString()} SAR
                  </strong>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-900">
                  <span className="text-zinc-500">
                    {isRtl ? "إجمالي التكلفة الكلية للمشروع" : "Total Direct Spend"}
                  </span>
                  <strong className="font-mono text-zinc-800 dark:text-white">
                    {totalProjectCost.toLocaleString()} SAR
                  </strong>
                </div>

                <div className="flex justify-between items-center py-2.5">
                  <span className="text-zinc-500 font-bold">
                    {isRtl ? "صافي هامش الربح المتوقع" : "Project Net Profit Margin"}
                  </span>
                  <strong
                    className={cn(
                      "font-mono text-sm font-black",
                      projectMargin > 0 ? "text-emerald-500" : "text-rose-500"
                    )}
                  >
                    {projectMargin.toLocaleString()} SAR ({marginPct}%)
                  </strong>
                </div>

                {/* Integration bridge button */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900">
                  <button
                    onClick={handleGenerateInvoice}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-white" />
                    <span>
                      {isRtl ? "توليد فاتورة في نظام المحاسبة" : "Generate Invoice in ERP"}
                    </span>
                  </button>
                  <span className="text-[9px] text-zinc-400 block text-center mt-2">
                    {isRtl
                      ? "يولد هذا الإجراء فاتورة رسمية بنسبة 15% ضريبة مضافة ويربطها مباشرة بدفتر الأستاذ والعملاء."
                      : "Generates an official invoice in 'invoices' collection connected to the active CRM Client."}
                  </span>
                </div>
              </div>
            </div>

            {/* Expenses List & form */}
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">
                  {isRtl ? "سجل المصروفات والمشتريات" : "Project Expenses Log"}
                </h3>
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {isRtl ? "+ تسجيل مصروف" : "+ Log Expense"}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-400 font-bold border-b border-zinc-200 dark:border-zinc-900">
                    <tr>
                      <th className="py-2 px-3 text-left">{isRtl ? "المصروف" : "Description"}</th>
                      <th className="py-2 px-3 text-left">{isRtl ? "التاريخ" : "Date"}</th>
                      <th className="py-2 px-3 text-left">{isRtl ? "التصنيف" : "Category"}</th>
                      <th className="py-2 px-3 text-right">
                        {isRtl ? "المبلغ (SAR)" : "Amount (SAR)"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-zinc-700 dark:text-zinc-300">
                    {(project.expenses || []).map((exp) => (
                      <tr key={exp.id}>
                        <td className="py-3 px-3 font-semibold">{exp.description}</td>
                        <td className="py-3 px-3 font-mono text-zinc-400">{exp.date}</td>
                        <td className="py-3 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-zinc-800 dark:text-white">
                          {exp.amount.toLocaleString()} SAR
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- ALL INNER MODALS --- */}
      {/* 1. Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-850 p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-white">
              {isRtl ? "إضافة محطة أداء رئيسية للمشروع" : "Add Key Project Milestone"}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                  {isRtl ? "اسم المحطة" : "Milestone Name"}
                </label>
                <input
                  type="text"
                  value={newMilestone.name}
                  onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                  placeholder="e.g. M1: Database Architecture Setup"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                  {isRtl ? "الوصف" : "Description"}
                </label>
                <textarea
                  value={newMilestone.description}
                  onChange={(e) =>
                    setNewMilestone({ ...newMilestone, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                  {isRtl ? "تاريخ الاستحقاق" : "Due Date"}
                </label>
                <input
                  type="date"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl outline-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl font-bold cursor-pointer"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleAddMilestone}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  {isRtl ? "إضافة" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Epic Modal */}
      {showEpicModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-850 p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-white">
              {isRtl ? "إضافة مجموعة برمجية كبرى" : "Add Project Epic"}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                  {isRtl ? "اسم المجموعة" : "Epic Title"}
                </label>
                <input
                  type="text"
                  value={newEpic.name}
                  onChange={(e) => setNewEpic({ ...newEpic, name: e.target.value })}
                  placeholder="e.g. Back-office API Integrations"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                  {isRtl ? "وصف ميزاتها" : "Scope Details"}
                </label>
                <textarea
                  value={newEpic.description}
                  onChange={(e) => setNewEpic({ ...newEpic, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl outline-none resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowEpicModal(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl font-bold cursor-pointer"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleAddEpic}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  {isRtl ? "إضافة" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-850 p-6 w-full max-w-lg space-y-4">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-white">
              {isRtl ? "إنشاء مهمة عمل جديدة" : "Create New Task"}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                  {isRtl ? "اسم المهمة" : "Task Title"}
                </label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                  {isRtl ? "شرح المهمة بالتفصيل" : "Implementation Details"}
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    {isRtl ? "ربط بمحطة" : "Link Milestone"}
                  </label>
                  <select
                    value={newTask.milestoneId}
                    onChange={(e) => setNewTask({ ...newTask, milestoneId: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl outline-none"
                  >
                    <option value="">-- {isRtl ? "لا يوجد" : "None"} --</option>
                    {project.milestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    {isRtl ? "ربط بمجموعة" : "Link Epic"}
                  </label>
                  <select
                    value={newTask.epicId}
                    onChange={(e) => setNewTask({ ...newTask, epicId: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl outline-none"
                  >
                    <option value="">-- {isRtl ? "لا يوجد" : "None"} --</option>
                    {project.epics.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    {isRtl ? "المسؤول" : "Assignee"}
                  </label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl outline-none"
                  >
                    {project.resources.map((r, idx) => (
                      <option key={idx} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    {isRtl ? "ساعات تقديرية" : "Est. Hours"}
                  </label>
                  <input
                    type="number"
                    value={newTask.estimatedHours || ""}
                    onChange={(e) =>
                      setNewTask({ ...newTask, estimatedHours: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    {isRtl ? "الأولوية" : "Priority"}
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({ ...newTask, priority: e.target.value as Task["priority"] })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl outline-none"
                  >
                    <option value="High">{isRtl ? "عالي" : "High"}</option>
                    <option value="Medium">{isRtl ? "متوسط" : "Medium"}</option>
                    <option value="Low">{isRtl ? "منخفض" : "Low"}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl font-bold cursor-pointer"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  {isRtl ? "إضافة المهمة" : "Create Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-850 p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-white">
              {isRtl ? "تسجيل مصروف مالي للمشروع" : "Log Project Expense"}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                  {isRtl ? "وصف المصروف" : "Expense Description"}
                </label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="e.g. AWS Production Database hosting"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    {isRtl ? "المبلغ (SAR)" : "Amount"}
                  </label>
                  <input
                    type="number"
                    value={newExpense.amount || ""}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, amount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                    {isRtl ? "التصنيف" : "Category"}
                  </label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl outline-none"
                  >
                    <option value="Software License">Software License</option>
                    <option value="Travel & Lodging">Travel & Lodging</option>
                    <option value="Marketing & G&A">Marketing & G&A</option>
                    <option value="Direct Contracting">Direct Contracting</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                  {isRtl ? "التاريخ" : "Date"}
                </label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl outline-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl font-bold cursor-pointer"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleAddExpense}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  {isRtl ? "تسجيل المصروف" : "Record Expense"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
