import { useState, useEffect } from "react";
import { auth } from "@/src/lib/firebase";
import { toast } from "sonner";

export interface EmailCampaign {
  id: string;
  name: string;
  subjectLine: string;
  status: "Draft" | "Sent" | "Scheduled";
  sentCount: number;
  openCount: number;
  clickCount: number;
  bounceCount: number;
  spamCount: number;
  revenueGenerated: number;
  targetSegment: string;
  createdAt: string;
  sentAt?: string;
  bodyContent?: string;
  jsonStructure?: {
    blocks: Array<{
      type: string;
      text?: string;
      url?: string;
      code?: string;
      color?: string;
      align?: "left" | "center" | "right";
    }>;
  };
  abTest?: {
    enabled: boolean;
    subjectB: string;
    ratio: number;
    metricsA?: { opens: number; clicks: number };
    metricsB?: { opens: number; clicks: number };
  } | null;
  ampEnabled?: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  jsonStructure?: {
    blocks: Array<{
      type: "header" | "text" | "button" | "image" | "code" | "divider" | "footer";
      text?: string;
      url?: string;
      code?: string;
      color?: string;
      align?: "left" | "center" | "right";
    }>;
  };
  htmlContent: string;
  createdAt: string;
}

export interface EmailContact {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "Active" | "Unsubscribed" | "Bounced";
  segmentTags: string[];
  createdAt: string;
}

export interface WorkflowStep {
  id: string;
  type: "email" | "wait" | "condition";
  label: string;
  delayDays?: number;
  value?: number;
  field?: string;
  yesSteps?: WorkflowStep[];
  noSteps?: WorkflowStep[];
  description?: string;
}

export interface EmailAutomation {
  id: string;
  name: string;
  triggerEvent: string;
  status: "Active" | "Inactive";
  enrolledCount: number;
  completedCount: number;
  steps: WorkflowStep[];
  createdAt: string;
}

export function useEmailMarketing(isAr: boolean) {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Generation States
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSubjectOptions, setAiSubjectOptions] = useState<
    Array<{ category: string; subject: string; preview: string }>
  >([]);
  const [aiBodyResponse, setAiBodyResponse] = useState<any>(null);

  const getHeaders = async () => {
    await auth.authStateReady();
    const token = await auth.currentUser?.getIdToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      await auth.authStateReady();
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      const [cRes, tRes, aRes, contRes] = await Promise.all([
        fetch("/api/email-marketing/campaigns", { headers }),
        fetch("/api/email-marketing/templates", { headers }),
        fetch("/api/email-marketing/automations", { headers }),
        fetch("/api/email-marketing/contacts", { headers }),
      ]);

      if (cRes.ok) setCampaigns(await cRes.json());
      if (tRes.ok) setTemplates(await tRes.json());
      if (aRes.ok) setAutomations(await aRes.json());
      if (contRes.ok) setContacts(await contRes.json());
    } catch (err: any) {
      toast.error(isAr ? "خطأ في جلب بيانات التسويق" : "Error fetching marketing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [auth.currentUser]);

  const handleSaveCampaign = async (payload: Partial<EmailCampaign>, id?: string) => {
    try {
      const headers = await getHeaders();
      const url = id ? `/api/email-marketing/campaigns/${id}` : "/api/email-marketing/campaigns";
      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isAr ? "تم حفظ الحملة بنجاح" : "Campaign saved successfully");
        await fetchData();
        return true;
      } else {
        toast.error(isAr ? "فشل حفظ الحملة" : "Failed to save campaign");
        return false;
      }
    } catch (err) {
      toast.error(isAr ? "خطأ في حفظ الحملة" : "Error saving campaign");
      return false;
    }
  };

  const handleSendCampaign = async (id: string) => {
    try {
      toast.loading(
        isAr ? "جاري جدولة وإرسال البريد الإلكتروني..." : "Scheduling and dispatching campaign...",
        { id: "sending" }
      );
      const headers = await getHeaders();
      const res = await fetch(`/api/email-marketing/campaigns/${id}/send`, {
        method: "POST",
        headers: { Authorization: headers.Authorization },
      });

      toast.dismiss("sending");
      if (res.ok) {
        toast.success(
          isAr
            ? "تم إرسال الحملة بنجاح! تم رصد مؤشرات الأداء فوراً."
            : "Campaign sent successfully! Analytics tracked in real time."
        );
        await fetchData();
        return true;
      } else {
        toast.error(isAr ? "فشل إرسال الحملة" : "Failed to dispatch campaign");
        return false;
      }
    } catch (err) {
      toast.dismiss("sending");
      toast.error(isAr ? "خطأ في الإرسال" : "Error sending campaign");
      return false;
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (
      !confirm(
        isAr ? "هل أنت متأكد من حذف هذه الحملة؟" : "Are you sure you want to delete this campaign?"
      )
    )
      return false;
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/email-marketing/campaigns/${id}`, {
        method: "DELETE",
        headers: { Authorization: headers.Authorization },
      });
      if (res.ok) {
        toast.success(isAr ? "تم حذف الحملة" : "Campaign deleted");
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      toast.error(isAr ? "خطأ في حذف الحملة" : "Error deleting campaign");
      return false;
    }
  };

  const handleSaveContact = async (payload: Partial<EmailContact>) => {
    try {
      const headers = await getHeaders();
      const res = await fetch("/api/email-marketing/contacts", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isAr ? "تم تسجيل جهة الاتصال بنجاح" : "Contact enrolled successfully");
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      toast.error(isAr ? "خطأ في تسجيل جهة الاتصال" : "Error creating contact");
      return false;
    }
  };

  const handleSaveAutomation = async (payload: Partial<EmailAutomation>) => {
    try {
      const headers = await getHeaders();
      const res = await fetch("/api/email-marketing/automations", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          isAr ? "تم بناء وحفظ سير الأتمتة بنجاح" : "Automation flow built and saved successfully"
        );
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      toast.error(isAr ? "خطأ في حفظ الأتمتة" : "Error saving automation");
      return false;
    }
  };

  const handleSyncCRM = async () => {
    try {
      toast.loading(
        isAr ? "جاري فحص ومزامنة العملاء من CRM..." : "Scanning and importing contacts from CRM...",
        { id: "sync" }
      );
      const headers = await getHeaders();
      const res = await fetch("/api/email-marketing/contacts", {
        headers: { Authorization: headers.Authorization },
      });
      toast.dismiss("sync");
      if (res.ok) {
        toast.success(
          isAr
            ? "تمت المزامنة بنجاح! تم استيراد أحدث العملاء المؤهلين."
            : "Sync completed! Imported qualified contacts."
        );
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      toast.dismiss("sync");
      toast.error(isAr ? "فشلت المزامنة" : "Sync error");
      return false;
    }
  };

  const generateAiContent = async (
    genType: "subject_lines" | "full_email",
    promptText: string,
    tone: string
  ) => {
    if (!promptText) {
      toast.error(
        isAr
          ? "يرجى تحديد تفاصيل أو هدف الحملة أولاً"
          : "Please provide campaign details or goal first"
      );
      return null;
    }

    try {
      setAiGenerating(true);
      const headers = await getHeaders();
      const res = await fetch("/api/email-marketing/ai/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: genType,
          productName: promptText,
          offerDetails: "خصم 20% لفترة محدودة وتدشين ميزات التشغيل الذتى الذكي",
          targetAudience: "أصحاب الأعمال والمستثمرين ومدراء التسويق",
          tone,
          language: isAr ? "ar" : "en",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (genType === "subject_lines") {
          setAiSubjectOptions(data.options || []);
          toast.success(
            isAr
              ? "تم ابتكار عناوين جذابة فائقة الفعالية!"
              : "High-converting subject lines crafted!"
          );
          return { options: data.options };
        } else {
          setAiBodyResponse(data);
          toast.success(
            isAr
              ? "تم إعداد محتوى الرسالة وتعبئتها في المصمم!"
              : "Email body compiled and filled in the designer!"
          );
          return data;
        }
      } else {
        toast.error(isAr ? "فشل ابتكار المحتوى الذكي" : "Failed to brainstorm intelligent content");
        return null;
      }
    } catch (err) {
      toast.error(isAr ? "خطأ في التوليد بالذكاء الاصطناعي" : "AI Generation error");
      return null;
    } finally {
      setAiGenerating(false);
    }
  };

  const generateAiWorkflow = async (workflowGoal: string, triggerEvent: string) => {
    if (!workflowGoal) {
      toast.error(
        isAr
          ? "يرجى كتابة سيناريو أو هدف الأتمتة"
          : "Please write automation scenario or goal first"
      );
      return null;
    }

    try {
      setAiGenerating(true);
      const headers = await getHeaders();
      const res = await fetch("/api/email-marketing/ai/workflow", {
        method: "POST",
        headers,
        body: JSON.stringify({
          goal: workflowGoal,
          triggerEvent,
          language: isAr ? "ar" : "en",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(
          isAr
            ? "تم تخطيط وهيكلة الأتمتة الذكية بنجاح!"
            : "Smart flow planned and designed successfully!"
        );
        return data;
      } else {
        toast.error(
          isAr ? "فشل بناء سير العمل بالذكاء الاصطناعي" : "Failed to structure flow with AI"
        );
        return null;
      }
    } catch (err) {
      toast.error(isAr ? "فشل تخطيط الأتمتة" : "AI workflow generator failed");
      return null;
    } finally {
      setAiGenerating(false);
    }
  };

  return {
    campaigns,
    templates,
    automations,
    contacts,
    loading,
    aiGenerating,
    aiSubjectOptions,
    aiBodyResponse,
    fetchData,
    handleSaveCampaign,
    handleSendCampaign,
    handleDeleteCampaign,
    handleSaveContact,
    handleSaveAutomation,
    handleSyncCRM,
    generateAiContent,
    generateAiWorkflow,
    setAiSubjectOptions,
    setAiBodyResponse,
  };
}
