import React, { useState, useEffect } from "react";
import { useSettings } from "@/src/contexts/SettingsContext";
import { useUser } from "@/src/contexts/UserContext";
import { db, auth } from "@/src/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Sparkles, X, Plus } from "lucide-react";

import { Project, Task, Milestone, Epic, Resource } from "../types/projects";
import ProjectOverview from "../components/projects/ProjectOverview";
import ProjectDetails from "../components/projects/ProjectDetails";
import ProjectAICopilot from "../components/projects/ProjectAICopilot";

// Pristine, high-fidelity enterprise seed data for fallback or initialization
const SEED_PROJECTS: Project[] = [
  {
    id: "proj-zatca-2",
    name: "ربط بوابة ZATCA المرحلة الثانية لجميع الفروع",
    description:
      "مشروع وطني استراتيجي لربط واجهات الفوترة الإلكترونية والمبيعات لمنصات Madarij OS مع منصة فاتورة التابعة لهيئة الزكاة والضريبة والجمارك بالمملكة العربية السعودية.",
    status: "Active",
    priority: "High",
    startDate: "2026-06-01",
    endDate: "2026-10-30",
    budget: 280000,
    currency: "SAR",
    billingMethod: "Fixed Price",
    clientId: "lead-won-saudi-telecom",
    clientName: "شركة الاتصالات السعودية (STC)",
    health: "On Track",
    userId: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    milestones: [
      {
        id: "m1",
        name: "محاكاة الفاتورة وبناء توقيع الـ XML",
        description: "مطابقة الهياكل المطلوبة لـ ZATCA وبناء الرموز التشفيرية",
        dueDate: "2026-07-15",
        status: "completed",
      },
      {
        id: "m2",
        name: "اجتياز اختبار البيئة التجريبية (Sandbox)",
        description: "الحصول على الموافقة الفنية للتكامل وتجربة إرسال 100 فاتورة مبدئية",
        dueDate: "2026-08-30",
        status: "pending",
      },
    ],
    epics: [
      {
        id: "e1",
        name: "تكامل التشفير والتوقيع (XML Cryptographic Signing)",
        description: "تنفيذ الخوارزميات المعتمدة للرموز الأمنية والختم الإلكتروني",
      },
    ],
    tasks: [
      {
        id: "t1",
        name: "برمجة توليد الرقم الموحد للفاتورة UUID والـ Hash",
        description: "تحويل هياكل الفاتورة إلى الـ XML القياسي وإجراء الترميز",
        status: "Done",
        priority: "High",
        assignee: "Lead Architect",
        estimatedHours: 40,
        actualHours: 45,
        milestoneId: "m1",
        epicId: "e1",
      },
      {
        id: "t2",
        name: "إجراء اختبار التحقق من الامتثال لضوابط الهيئة",
        description: "فحص الفواتير المبسطة وفواتير ضريبة القيمة المضافة التقليدية",
        status: "In Progress",
        priority: "Medium",
        assignee: "Senior Dev",
        estimatedHours: 24,
        actualHours: 12,
        milestoneId: "m2",
        epicId: "e1",
      },
    ],
    resources: [
      { name: "Lead Architect", role: "Architect", allocation: 80, costRate: 250 },
      { name: "Senior Dev", role: "Developer", allocation: 100, costRate: 180 },
    ],
    timesheets: [
      {
        id: "ts1",
        taskId: "t1",
        taskName: "برمجة توليد الرقم الموحد للفاتورة UUID والـ Hash",
        description: "بناء التوقيعات الرقمية ومطابقة كود SHA-256",
        date: "2026-06-15",
        hours: 45,
        costRate: 250,
        assignee: "Lead Architect",
        status: "Approved",
      },
    ],
    expenses: [
      {
        id: "exp1",
        description: "شهادات التشفير الرقمي والختم الأمني الخاص بالهيئة",
        amount: 1500,
        date: "2026-06-10",
        category: "Software License",
      },
    ],
  },
  {
    id: "proj-supply-chain",
    name: "ميكنة مخازن سلاسل الإمداد بمستودع جدة",
    description:
      "بناء وتكامل نظام إدارة المستودعات والباركود RFID مع الموديول المالي لمحاسبة المخازن والوقوف على تكلفة المبيعات الفعلية لحظياً.",
    status: "Planning",
    priority: "Medium",
    startDate: "2026-08-01",
    endDate: "2026-12-15",
    budget: 190000,
    currency: "SAR",
    billingMethod: "Time & Materials",
    clientId: "lead-won-jeddah-logistics",
    clientName: "شركة جدة للخدمات اللوجستية المتقدمة",
    health: "At Risk",
    userId: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    milestones: [
      {
        id: "m1",
        name: "تهيئة الخوادم وتوزيع أجهزة المسح الذكية",
        description: "إعداد نقاط التتبع وبدء ميكنة باركود المخزون",
        dueDate: "2026-09-01",
        status: "pending",
      },
    ],
    epics: [
      {
        id: "e1",
        name: "ربط الباركود مع موديول المشتريات (ERP Procure-to-Pay)",
        description: "تحويل الحركات التشغيلية بالمستودع إلى قيود محاسبية تلقائية",
      },
    ],
    tasks: [
      {
        id: "t1",
        name: "مزامنة جرد المخزون الفعلي مع موديول المبيعات",
        description: "تحديث الأرصدة ومنع حدوث بيع مخزون غير متوفر",
        status: "Todo",
        priority: "High",
        assignee: "Lead Architect",
        estimatedHours: 32,
        actualHours: 0,
        milestoneId: "m1",
        epicId: "e1",
      },
    ],
    resources: [
      { name: "Lead Architect", role: "Architect", allocation: 40, costRate: 250 },
      { name: "Senior Dev", role: "Developer", allocation: 80, costRate: 180 },
    ],
    timesheets: [],
    expenses: [],
  },
];

export default function Projects() {
  const { settings } = useSettings();
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<any[]>([]); // Won leads from CRM
  const [loading, setLoading] = useState(true);

  // Navigation & Drawer States
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // New Project Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budget: 120000,
    billingMethod: "Fixed Price" as "Fixed Price" | "Time & Materials",
    priority: "Medium" as "High" | "Medium" | "Low",
    clientId: "",
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  const language = settings.language;
  const isRtl = language === "ar";

  // 1. Fetch Projects & CRM Clients
  useEffect(() => {
    if (!user) return;

    // Load CRM won clients for dropdown
    const qLeads = query(collection(db, "leads"), where("userId", "==", user.uid));
    const unsubscribeLeads = onSnapshot(
      qLeads,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setClients(list);
      },
      (err) => console.warn("Leads dropdown sync offline fallback active:", err)
    );

    // Load real projects collection from Firestore
    const qProjects = query(collection(db, "projects"), where("userId", "==", user.uid));
    const unsubscribeProjects = onSnapshot(
      qProjects,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Project[];
          setProjects(list);
        } else {
          // No projects in database, seed initial values for rich visual state
          setProjects(SEED_PROJECTS);
          // Auto-write seeds so Firestore has data
          SEED_PROJECTS.forEach(async (p) => {
            try {
              await setDoc(doc(db, "projects", p.id), { ...p, userId: user.uid });
            } catch (e) {
              console.warn("Failed to seed initial Firestore data:", e);
            }
          });
        }
        setLoading(false);
      },
      (err) => {
        console.warn("Projects sync offline, loading fallbacks:", err);
        setProjects(SEED_PROJECTS);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeLeads();
      unsubscribeProjects();
    };
  }, [user]);

  // 2. Handle Add Manual Project
  const handleCreateProject = async () => {
    if (!formData.name) return;

    const matchedClient = clients.find((c) => c.id === formData.clientId);
    const clientName = matchedClient
      ? matchedClient.company || matchedClient.name
      : "Internal Enterprise Project";

    const projectObj: Omit<Project, "id"> = {
      name: formData.name,
      description: formData.description,
      status: "Planning",
      priority: formData.priority,
      startDate: new Date().toISOString().split("T")[0],
      endDate: formData.endDate,
      budget: Number(formData.budget) || 120000,
      currency: "SAR",
      billingMethod: formData.billingMethod,
      clientId: formData.clientId || undefined,
      clientName: clientName,
      health: "On Track",
      milestones: [
        {
          id: "m-" + Date.now(),
          name: "M1: Project Initiation & Requirements sign-off",
          description: "Establish baseline scope",
          dueDate: formData.endDate,
          status: "pending",
        },
      ],
      epics: [
        {
          id: "e-" + Date.now(),
          name: "Phase 1 - Implementation Scope",
          description: "Primary implementation deliverables",
        },
      ],
      tasks: [
        {
          id: "t-" + Date.now(),
          name: "Setup project parameters & blueprints",
          description: "Initial setup",
          status: "Todo",
          priority: "Medium",
          assignee: "Lead Architect",
          estimatedHours: 12,
          actualHours: 0,
        },
      ],
      resources: [
        { name: "Lead Architect", role: "Architect", allocation: 100, costRate: 250 },
        { name: "Senior Dev", role: "Developer", allocation: 100, costRate: 180 },
      ],
      timesheets: [],
      expenses: [],
      userId: user?.uid || "system",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (user) {
        await addDoc(collection(db, "projects"), projectObj);
        toast.success(
          isRtl
            ? "تم إطلاق المشروع الجديد بنجاح!"
            : "Enterprise project plan launched successfully!"
        );
      } else {
        // Local fallback update
        setProjects([...projects, { id: "proj-" + Date.now(), ...projectObj }]);
      }
      setIsNewModalOpen(false);
      setFormData({
        name: "",
        description: "",
        budget: 120000,
        billingMethod: "Fixed Price",
        priority: "Medium",
        clientId: "",
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });
    } catch (e: any) {
      toast.error(e.message || "Failed to create project");
    }
  };

  // 3. Update Project (CRUD bridging from child tabs)
  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      // Optimistic Local state update
      setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
      if (selectedProject?.id === updatedProject.id) {
        setSelectedProject(updatedProject);
      }

      if (user) {
        // Update document in Firestore projects collection
        const { id, ...docData } = updatedProject;
        await setDoc(doc(db, "projects", id), docData, { merge: true });
      }
    } catch (e) {
      console.error("Failed to sync project update with Firestore:", e);
      toast.error("Failed to sync changes with cloud database. Local state preserved.");
    }
  };

  // 4. Delete Project
  const handleDeleteProject = async (id: string) => {
    try {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }

      if (user) {
        await deleteDoc(doc(db, "projects", id));
      }
      toast.success(isRtl ? "تم حذف المشروع بالكامل" : "Project deleted successfully");
    } catch (e: any) {
      toast.error("Failed to delete project");
    }
  };

  // 5. Apply AI-Generated Project plan from Copilot
  const handleApplyAiPlan = async (aiPlan: any) => {
    const projectObj: Omit<Project, "id"> = {
      name: aiPlan.name || "AI Generated Project",
      description: aiPlan.description || "",
      status: "Planning",
      priority: "High",
      startDate: new Date().toISOString().split("T")[0],
      endDate:
        aiPlan.milestones?.[aiPlan.milestones.length - 1]?.dueDate ||
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      budget: aiPlan.budget || 150000,
      currency: "SAR",
      billingMethod: "Fixed Price",
      health: "On Track",
      milestones: aiPlan.milestones || [],
      epics: aiPlan.epics || [],
      tasks: aiPlan.tasks || [],
      resources: aiPlan.resources || [
        { name: "Lead Architect", role: "Architect", allocation: 100, costRate: 250 },
        { name: "Senior Fullstack Engineer", role: "Developer", allocation: 100, costRate: 180 },
      ],
      timesheets: [],
      expenses: [],
      userId: user?.uid || "system",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (user) {
        await addDoc(collection(db, "projects"), projectObj);
        toast.success(
          isRtl
            ? "تم توليد وتدشين خطة العمل من قبل الـ Copilot!"
            : "Complete project plan generated by Gemini Copilot is live!"
        );
      } else {
        setProjects([...projects, { id: "proj-" + Date.now(), ...projectObj }]);
      }
    } catch (err) {
      toast.error("Failed to import AI project structure");
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360, borderRadius: ["25%", "50%", "50%", "25%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-zinc-200 border-t-emerald-600 rounded-xl"
        />
        <p className="mt-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          {isRtl ? "جاري مزامنة خطط العمل..." : "Synchronizing Project Operating System..."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full" dir={isRtl ? "rtl" : "ltr"}>
      {/* Overview or Project Detail Routing */}
      <AnimatePresence mode="wait">
        {selectedProject ? (
          <motion.div
            key="details-view"
            initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            <ProjectDetails
              project={selectedProject}
              language={language}
              onBack={() => setSelectedProject(null)}
              onUpdateProject={handleUpdateProject}
            />
          </motion.div>
        ) : (
          <motion.div
            key="overview-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ProjectOverview
              projects={projects}
              clients={clients}
              language={language}
              onSelectProject={(p) => setSelectedProject(p)}
              onOpenNewProjectModal={() => setIsNewModalOpen(true)}
              onDeleteProject={handleDeleteProject}
              onOpenCopilot={() => setIsCopilotOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SIDEBAR AI COPILOT DRAWER --- */}
      <AnimatePresence>
        {isCopilotOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCopilotOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: isRtl ? -450 : 450 }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? -450 : 450 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md h-full shadow-2xl flex flex-col z-10"
            >
              <ProjectAICopilot
                language={language}
                onApplyPlan={handleApplyAiPlan}
                onClose={() => setIsCopilotOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MANUAL CREATE PROJECT MODAL --- */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-100 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-black text-sm text-zinc-900 dark:text-white">
                {isRtl ? "تدشين مشروع جديد بالمنشأة" : "Launch Enterprise Project Plan"}
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Project Name */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase">
                  {isRtl ? "اسم المشروع" : "Project Name"}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={
                    isRtl
                      ? "مثال: ميكنة واجهة محاسبة مستودع جدة"
                      : "e.g., Warehouse Accounting Sync Jeddah"
                  }
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-100 border border-zinc-250 dark:border-zinc-850 rounded-xl outline-none text-zinc-800 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase">
                  {isRtl ? "الهدف ونطاق العمل بالتفصيل" : "Scope and Target Outcomes"}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder={
                    isRtl
                      ? "نطاق المشروع، تفاصيل التسليمات المتوقعة والأهداف..."
                      : "Describe key milestones and expectations..."
                  }
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-100 border border-zinc-250 dark:border-zinc-850 rounded-xl outline-none text-zinc-800 dark:text-white resize-none"
                />
              </div>

              {/* Client Dropdown (Bridging CRM) */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase">
                  {isRtl ? "ربط المشروع مع عملاء الـ CRM" : "Bridge with CRM Client / Lead"}
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-100 border border-zinc-250 dark:border-zinc-850 rounded-xl outline-none text-zinc-800 dark:text-white"
                >
                  <option value="">
                    -- {isRtl ? "مشروع داخلي بالمنشأة" : "Internal Corporate Project"} --
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company ? `${client.company} (${client.name})` : client.name} -{" "}
                      {client.status === "won" ? "Won Contract" : "Active Opportunity"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Budget */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase">
                    {isRtl ? "الميزانية المعتمدة (SAR)" : "Budget (SAR)"}
                  </label>
                  <input
                    type="number"
                    value={formData.budget || ""}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-100 border border-zinc-250 dark:border-zinc-850 rounded-xl outline-none text-zinc-800 dark:text-white"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase">
                    {isRtl ? "تاريخ تسليم المشروع" : "Project Deadline"}
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-100 border border-zinc-250 dark:border-zinc-850 rounded-xl outline-none text-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Billing Method */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase">
                    {isRtl ? "طريقة الفوترة" : "Billing Method"}
                  </label>
                  <select
                    value={formData.billingMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, billingMethod: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-100 border border-zinc-250 dark:border-zinc-850 rounded-xl outline-none text-zinc-800 dark:text-white"
                  >
                    <option value="Fixed Price">{isRtl ? "سعر ثابت" : "Fixed Price"}</option>
                    <option value="Time & Materials">
                      {isRtl ? "حسب الوقت والمواد" : "Time & Materials"}
                    </option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase">
                    {isRtl ? "الأولوية" : "Project Priority"}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-100 border border-zinc-250 dark:border-zinc-850 rounded-xl outline-none text-zinc-800 dark:text-white"
                  >
                    <option value="High">{isRtl ? "عالي" : "High"}</option>
                    <option value="Medium">{isRtl ? "متوسط" : "Medium"}</option>
                    <option value="Low">{isRtl ? "منخفض" : "Low"}</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-5 py-2.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl font-bold cursor-pointer"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleCreateProject}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  {isRtl ? "تدشين المشروع" : "Launch Project"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
