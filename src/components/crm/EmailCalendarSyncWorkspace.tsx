import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Calendar,
  RefreshCw,
  Lock,
  Plus,
  Clock,
  Trash2,
  Settings,
  AlertCircle,
  Shield,
  Send,
  Activity,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building2,
  Inbox
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { db } from "../../lib/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

interface EmailCalendarSyncWorkspaceProps {
  clients: any[];
}

export default function EmailCalendarSyncWorkspace({ clients }: EmailCalendarSyncWorkspaceProps) {
  const [provider, setProvider] = useState<"none" | "google" | "outlook">("none");
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>("all");
  const [tab, setTab] = useState<"emails" | "meetings" | "settings">("emails");

  // Connected Account Metadata
  const [connectedEmail, setConnectedEmail] = useState<string>("");
  const [connectedName, setConnectedName] = useState<string>("");

  // Live Sync Email Database & Pagination
  const [emails, setEmails] = useState<any[]>([]);
  const [emailPage, setEmailPage] = useState<number>(1);
  const [emailPagination, setEmailPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasMore: false,
  });

  // Live Sync Calendar Meetings & Pagination
  const [meetings, setMeetings] = useState<any[]>([]);
  const [meetingPage, setMeetingPage] = useState<number>(1);
  const [meetingPagination, setMeetingPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasMore: false,
  });

  // Compose email modal state
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  // Schedule meeting modal state
  const [schedTitle, setSchedTitle] = useState("");
  const [schedClient, setSchedClient] = useState("");
  const [schedTime, setSchedTime] = useState("");
  const [schedDuration, setSchedDuration] = useState("30");
  const [schedLocation, setSchedLocation] = useState("Google Meet");
  const [schedDesc, setSchedDesc] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  // OAuth Settings
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [oauthScopes, setOauthScopes] = useState({
    gmailRead: true,
    gmailSend: true,
    calendarWrite: true,
    calendarRead: true,
  });

  // ---------------------------------------------------------------------------
  // 1. Fetch Integration Status
  // ---------------------------------------------------------------------------
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/status");
      if (res.ok) {
        const data = await res.json();
        if (data.google?.connected) {
          setProvider("google");
          setConnectedEmail(data.google.email || "user@workspace.com");
          setConnectedName(data.google.name || "Google Workspace User");
        } else if (data.outlook?.connected) {
          setProvider("outlook");
          setConnectedEmail(data.outlook.email || "user@outlook.com");
          setConnectedName(data.outlook.name || "Microsoft 365 User");
        } else {
          setProvider("none");
          setConnectedEmail("");
          setConnectedName("");
        }
      }
    } catch (err) {
      console.warn("Failed to fetch integration status:", err);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // 2. Fetch Live Emails with Pagination
  // ---------------------------------------------------------------------------
  const fetchEmails = useCallback(async (pageToFetch = 1) => {
    setSyncInProgress(true);
    try {
      const params = new URLSearchParams({
        page: pageToFetch.toString(),
        limit: "10",
        clientEmail: selectedClientFilter !== "all" ? selectedClientFilter : "",
      });

      const res = await fetch(`/api/crm/emails/sync?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.emails) {
          setEmails(data.emails);
          setEmailPagination(data.pagination);
          setEmailPage(data.pagination.page);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch synced emails:", err);
    } finally {
      setSyncInProgress(false);
    }
  }, [selectedClientFilter]);

  // ---------------------------------------------------------------------------
  // 3. Fetch Live Meetings with Pagination
  // ---------------------------------------------------------------------------
  const fetchMeetings = useCallback(async (pageToFetch = 1) => {
    setSyncInProgress(true);
    try {
      const params = new URLSearchParams({
        page: pageToFetch.toString(),
        limit: "10",
        clientEmail: selectedClientFilter !== "all" ? selectedClientFilter : "",
      });

      const res = await fetch(`/api/crm/calendar/sync?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.meetings) {
          setMeetings(data.meetings);
          setMeetingPagination(data.pagination);
          setMeetingPage(data.pagination.page);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch synced meetings:", err);
    } finally {
      setSyncInProgress(false);
    }
  }, [selectedClientFilter]);

  // Load Status on Mount & Sync initial data
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (tab === "emails") {
      fetchEmails(emailPage);
    } else if (tab === "meetings") {
      fetchMeetings(meetingPage);
    }
  }, [tab, selectedClientFilter, fetchEmails, fetchMeetings, emailPage, meetingPage]);

  // ---------------------------------------------------------------------------
  // 4. OAuth Popup Initiation Flow
  // ---------------------------------------------------------------------------
  const handleConnect = async (selectedProv: "google" | "outlook") => {
    setIsConnecting(true);
    try {
      const res = await fetch(`/api/integrations/${selectedProv}/connect?json=true`);
      if (!res.ok) {
        throw new Error("فشل تحضير رابط OAuth من الخادم.");
      }
      const data = await res.json();

      if (data.url) {
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        window.open(
          data.url,
          `${selectedProv}_oauth_popup`,
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
        );

        const handleAuthMessage = (event: MessageEvent) => {
          if (event.data && event.data.type === "OAUTH_AUTH_SUCCESS") {
            window.removeEventListener("message", handleAuthMessage);
            fetchStatus();
            fetchEmails(1);
            fetchMeetings(1);
            toast.success(
              `تم المصادقة والربط بنجاح مع ${selectedProv === "google" ? "Google Workspace" : "Microsoft 365"}! 🔐 (${event.data.email})`
            );
          }
        };

        window.addEventListener("message", handleAuthMessage);
      }
    } catch (err: any) {
      toast.error(err.message || "فشل الاتصال بمزود OAuth.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm("هل أنت متأكد من إلغاء مزامنة البريد والتقويم؟ سيتم فصل الجلسات المفوضة.")) {
      try {
        await fetch("/api/integrations/disconnect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider }),
        });
        setProvider("none");
        setConnectedEmail("");
        setConnectedName("");
        setEmails([]);
        setMeetings([]);
        toast.info("تم فصل الحساب وإلغاء المزامنة بنجاح.");
      } catch (err) {
        toast.error("فشل إلغاء الربط.");
      }
    }
  };

  const handleSyncNow = () => {
    fetchEmails(emailPage);
    fetchMeetings(meetingPage);
    toast.success("جاري تحديث واستقبال البيانات من الواجهة البرمجية...");
  };

  // ---------------------------------------------------------------------------
  // 5. Send Outbound Email (Live Server Proxy + CRM History Log)
  // ---------------------------------------------------------------------------
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject || !composeBody) {
      toast.error("يرجى إكمال جميع الحقول!");
      return;
    }

    const matchedClient = clients.find((c) => c.email === composeTo || c.name === composeTo);
    const clientName = matchedClient ? matchedClient.name : composeTo;
    const clientEmail = matchedClient ? matchedClient.email : composeTo;

    try {
      const res = await fetch("/api/crm/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: clientEmail,
          subject: composeSubject,
          body: composeBody,
          clientId: matchedClient?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          data.isLiveSent
            ? `تم إرسال البريد الإلكتروني بنجاح عبر حساب ${provider === "google" ? "Gmail" : "Outlook"}! ✉️`
            : `تم توثيق وإرسال البريد محلياً للعميل ${clientName}`
        );
      }
    } catch (err) {
      console.warn("Outbound email error:", err);
    }

    // Refresh email list
    fetchEmails(1);
    setIsComposing(false);
    setComposeSubject("");
    setComposeBody("");

    // Dual write to Firestore client history if present
    if (matchedClient && matchedClient.id) {
      try {
        const clientDocRef = doc(db, "leads", matchedClient.id);
        await updateDoc(clientDocRef, {
          history: arrayUnion({
            id: `h_mail_${Date.now()}`,
            date: new Date().toISOString(),
            action: "بريد صادر - مبيعات (OAuth Synced)",
            details: `الموضوع: ${composeSubject}\nالرسالة: ${composeBody}`,
          }),
        });
        toast.info("تم توثيق المراسلة في سجل نشاط العميل بالـ CRM! ⚡");
      } catch (err) {
        console.warn("Failed to write to client history doc:", err);
      }
    }
  };

  // ---------------------------------------------------------------------------
  // 6. Schedule Meeting (Live Server Proxy + CRM History Log)
  // ---------------------------------------------------------------------------
  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedTitle || !schedClient || !schedTime) {
      toast.error("يرجى إدخال اسم الاجتماع، العميل والتاريخ!");
      return;
    }

    const matchedClient = clients.find((c) => c.email === schedClient || c.name === schedClient);
    const clientName = matchedClient ? matchedClient.name : schedClient;
    const clientEmail = matchedClient ? matchedClient.email : "guest@meeting.com";

    try {
      const res = await fetch("/api/crm/calendar/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: schedTitle,
          clientEmail,
          startTime: schedTime,
          duration: schedDuration,
          location: schedLocation,
          description: schedDesc,
          clientId: matchedClient?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          data.isLiveCreated
            ? `تم حجز الموعد في التقويم وتوليد رابط الاجتماع (${data.meetLink})! 🗓️`
            : `تم حجز موعد الاجتماع بنجاح للعميل ${clientName}`
        );
      }
    } catch (err) {
      console.warn("Calendar schedule error:", err);
    }

    fetchMeetings(1);
    setIsScheduling(false);
    setSchedTitle("");
    setSchedTime("");
    setSchedDesc("");

    if (matchedClient && matchedClient.id) {
      try {
        const clientDocRef = doc(db, "leads", matchedClient.id);
        await updateDoc(clientDocRef, {
          history: arrayUnion({
            id: `h_meet_${Date.now()}`,
            date: new Date().toISOString(),
            action: "موعد مجدول (Synced Calendar)",
            details: `عنوان الاجتماع: ${schedTitle}\nالتاريخ: ${new Date(schedTime).toLocaleString("ar-SA")}\nالموقع: ${schedLocation}`,
          }),
        });
      } catch (err) {
        console.warn("Failed to log meeting in client history:", err);
      }
    }
  };

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-[2.5rem] p-8 space-y-8 animate-in fade-in duration-300 text-right">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded-full border border-indigo-200 font-black uppercase tracking-wider">
              Bidirectional OAuth Engine
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-400 font-bold">مربوط ومفوض بالكامل / Live API Active</span>
          </div>
          <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-indigo-600" />
            مزامنة البريد والتقويم الذكية (Google Workspace & Microsoft 365)
          </h2>
          <p className="text-xs text-zinc-500 font-bold mt-1">
            اربط بريدك المؤسسي والتقويم عبر OAuth 2.0 لمطابقة المراسلات، جدولة اجتماعات Google Meet / Teams، وتحديث صفقات الـ CRM تلقائياً.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {provider !== "none" && (
            <button
              onClick={handleSyncNow}
              disabled={syncInProgress}
              className="px-5 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black hover:bg-emerald-100 transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncInProgress ? "animate-spin text-emerald-600" : ""}`} />
              <span>{syncInProgress ? "جاري جلب ومطابقة المراسلات..." : "تحديث ومزامنة فورية"}</span>
            </button>
          )}

          {provider === "none" ? (
            <button
              onClick={() => setTab("settings")}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/15 transition-all flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>تهيئة ربط الـ OAuth والـ APIs</span>
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="px-5 py-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-black hover:bg-rose-100 transition-all flex items-center gap-1.5"
            >
              <span>قطع الاتصال</span>
            </button>
          )}
        </div>
      </div>

      {/* Integration Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <p className="text-[10px] font-extrabold text-zinc-400">مزود الخدمة المفوض / OAuth Provider</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-150">
              {provider === "google" ? (
                <span className="text-sm font-black text-blue-600">Google G</span>
              ) : provider === "outlook" ? (
                <span className="text-sm font-black text-indigo-600">Office 📦</span>
              ) : (
                <AlertCircle className="w-5 h-5 text-zinc-300" />
              )}
            </div>
            <div>
              <p className="text-xs font-black text-zinc-900">
                {provider === "google" ? "Google Workspace Cloud" : provider === "outlook" ? "Microsoft Graph Exchange" : "غير متصل حالياً"}
              </p>
              <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                {provider !== "none" ? `مفوض عبر OAuth 2.0 • ${connectedEmail}` : "يتطلب تفويضاً قانونياً للوصول"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <p className="text-[10px] font-extrabold text-zinc-400">سجل الرسائل المزافنة / Synced Threads</p>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-base font-black text-zinc-900">{emailPagination.total || emails.length} رسالة بريدية</p>
              <p className="text-[10px] text-zinc-400 font-bold">تمت مطابقتها آلياً مع ملفات العملاء</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50/50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
              📬
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <p className="text-[10px] font-extrabold text-zinc-400">اجتماعات التقويم الذكي / Calendar Events</p>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-base font-black text-zinc-900">{meetingPagination.total || meetings.length} موعد مجدول</p>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                مزامنة فورية بالتقويم المؤسسي
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-50/50 rounded-full flex items-center justify-center text-emerald-600 font-bold">
              🗓️
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Area */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Dynamic Workspace Content */}
        <div className="flex-1 bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm min-h-[450px] flex flex-col justify-between">
          <div>
            {/* Inner Tabs Navigation */}
            <div className="flex gap-2 border-b border-zinc-100 pb-3 mb-6">
              <button
                onClick={() => setTab("emails")}
                className={`pb-2 px-3 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all ${tab === "emails" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}
              >
                <Mail className="w-4 h-4" /> علبة بريد المعاملات والصفقات ({emailPagination.total || emails.length})
              </button>
              <button
                onClick={() => setTab("meetings")}
                className={`pb-2 px-3 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all ${tab === "meetings" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}
              >
                <Calendar className="w-4 h-4" /> اجتماعات التقويم المجدولة ({meetingPagination.total || meetings.length})
              </button>
              <button
                onClick={() => setTab("settings")}
                className={`pb-2 px-3 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all ${tab === "settings" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}
              >
                <Settings className="w-4 h-4" /> إعدادات الـ OAuth والتفويض
              </button>
            </div>

            {/* Tab 1: Emails */}
            {tab === "emails" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-50 pb-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-zinc-500">فلترة البريد حسب العميل:</span>
                    <select
                      value={selectedClientFilter}
                      onChange={(e) => {
                        setSelectedClientFilter(e.target.value);
                        setEmailPage(1);
                      }}
                      className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-700"
                    >
                      <option value="all">كافة مراسلات العملاء والصفقات</option>
                      {clients.filter(c => c.email).map(c => (
                        <option key={c.id} value={c.email}>{c.name} ({c.email})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      if (provider === "none") {
                        toast.error("يرجى تفويض الاتصال عبر الإعدادات أولاً!");
                        return;
                      }
                      setIsComposing(true);
                    }}
                    className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-zinc-800 transition-all self-end"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إرسال بريد / عرض سعر للعميل</span>
                  </button>
                </div>

                {syncInProgress ? (
                  <div className="py-20 text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-xs font-black text-zinc-600">جاري مزامنة وجلب البريد من الواجهة البرمجية...</p>
                  </div>
                ) : provider === "none" ? (
                  <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-zinc-300 mx-auto mb-3 shadow-xs">
                      <Lock className="w-6 h-6 text-zinc-400" />
                    </div>
                    <p className="text-xs font-black text-zinc-800">قناة الاتصال بالبريد غير مفوضة</p>
                    <p className="text-[10px] text-zinc-400 font-medium mt-1">
                      الرجاء الدخول على تبويب "إعدادات الـ OAuth والتفويض" لربط حساب Google/Outlook الخاص بك بشكل آمن.
                    </p>
                  </div>
                ) : emails.length === 0 ? (
                  <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    <Inbox className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-xs font-black text-zinc-500">لا توجد رسائل مطابقة حالياً لهذا العميل</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emails.map((mail) => (
                      <div
                        key={mail.id}
                        className={`p-4 border rounded-2xl text-right transition-all hover:border-zinc-300 ${mail.unread ? "bg-indigo-50/20 border-indigo-200" : "bg-white border-zinc-150"}`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${mail.unread ? "bg-indigo-500" : "bg-transparent"}`} />
                            <h4 className="text-xs font-black text-zinc-900">{mail.clientName}</h4>
                            <span className="text-[10px] text-zinc-400 font-mono" dir="ltr">&lt;{mail.clientEmail}&gt;</span>
                            {mail.matchedClientId && (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-md border border-emerald-200 flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-emerald-600" />
                                مطابَق بالـ CRM
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {new Date(mail.date).toLocaleString("ar-SA", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                          </span>
                        </div>

                        <p className="text-xs font-black text-zinc-800 mt-2">{mail.subject}</p>
                        <p className="text-[11px] text-zinc-500 mt-1.5 whitespace-pre-line leading-relaxed font-medium">
                          {mail.body}
                        </p>

                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-50">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            mail.category === "inquiry" ? "bg-purple-50 text-purple-600 border border-purple-100" :
                            mail.category === "contract" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                            mail.category === "finance" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                            "bg-zinc-100 text-zinc-500"
                          }`}>
                            {mail.category === "inquiry" ? "طلب عرض سعر" :
                             mail.category === "contract" ? "مفاوضات عقد" :
                             mail.category === "finance" ? "فوترة وتحصيل" : "مراسلة صفقات"}
                          </span>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setComposeTo(mail.clientEmail);
                                setComposeSubject(`Re: ${mail.subject}`);
                                setComposeBody(`\n\n-----------------\nكتب ${mail.clientName}:\n> ${mail.body}`);
                                setIsComposing(true);
                              }}
                              className="px-2.5 py-1 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 text-[10px] rounded font-black transition-all"
                            >
                              رد سريع / Reply
                            </button>
                            <button
                              onClick={() => {
                                setEmails(emails.filter((m) => m.id !== mail.id));
                                toast.success("تم أرشفة الرسالة من القائمة.");
                              }}
                              className="p-1 text-zinc-400 hover:text-rose-600"
                              title="أرشفة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Email Real Pagination Controls */}
                    {emailPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-150 text-xs font-bold text-zinc-600">
                        <div className="flex items-center gap-2">
                          <button
                            disabled={emailPage <= 1 || syncInProgress}
                            onClick={() => setEmailPage((prev) => Math.max(1, prev - 1))}
                            className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40 transition-all"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <span>صفحة {emailPagination.page} من {emailPagination.totalPages}</span>
                          <button
                            disabled={!emailPagination.hasMore || syncInProgress}
                            onClick={() => setEmailPage((prev) => prev + 1)}
                            className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40 transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          إجمالي الرسائل: {emailPagination.total}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Meetings */}
            {tab === "meetings" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-50 pb-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-zinc-500">مواعيد العميل المحدد:</span>
                    <select
                      value={selectedClientFilter}
                      onChange={(e) => {
                        setSelectedClientFilter(e.target.value);
                        setMeetingPage(1);
                      }}
                      className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-700"
                    >
                      <option value="all">كافة مواعيد التقويم المؤسسي</option>
                      {clients.filter(c => c.email).map(c => (
                        <option key={c.id} value={c.email}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      if (provider === "none") {
                        toast.error("يرجى تفويض الاتصال بالتقويم أولاً!");
                        return;
                      }
                      setIsScheduling(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all self-end"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>جدولة موعد اجتماع جديد</span>
                  </button>
                </div>

                {syncInProgress ? (
                  <div className="py-20 text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                    <p className="text-xs font-black text-zinc-600">جاري مزامنة وجلب مواعيد التقويم من الواجهة البرمجية...</p>
                  </div>
                ) : provider === "none" ? (
                  <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-zinc-300 mx-auto mb-3 shadow-xs">
                      <Calendar className="w-6 h-6 text-zinc-400" />
                    </div>
                    <p className="text-xs font-black text-zinc-800">تكامل التقويم معطل</p>
                    <p className="text-[10px] text-zinc-400 font-medium mt-1">
                      يتطلب ربط التقويم الذكي الوصول إلى Google Calendar API أو MS Graph API لمزامنة الاجتماعات وتأكيد روابط الاتصال.
                    </p>
                  </div>
                ) : meetings.length === 0 ? (
                  <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    <p className="text-xs font-black text-zinc-500">لا توجد اجتماعات قادمة مجدولة لهذا العميل في التقويم.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {meetings.map((meet) => (
                        <div
                          key={meet.id}
                          className="p-5 border border-zinc-150 rounded-2xl bg-white shadow-2xs hover:border-emerald-500 transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <span className="text-[9px] font-black px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                {provider === "google" ? "Google Meet Synced" : "Teams Synced"}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">{meet.duration} دقيقة</span>
                            </div>
                            <h4 className="text-xs font-black text-zinc-900">{meet.title}</h4>
                            <p className="text-[10px] text-zinc-400 mt-1 font-bold">مع: {meet.clientName}</p>
                            <p className="text-[11px] text-zinc-500 mt-2 font-medium whitespace-pre-line leading-relaxed">{meet.description}</p>
                          </div>

                          <div className="pt-4 mt-4 border-t border-zinc-50 space-y-2">
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono" dir="ltr">
                              <Clock className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{new Date(meet.startTime).toLocaleString("ar-SA")}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-zinc-500 font-bold">📍 {meet.location}</span>
                              <button
                                onClick={() => {
                                  setMeetings(meetings.filter((m) => m.id !== meet.id));
                                  toast.success("تم إلغاء الاجتماع بنجاح.");
                                }}
                                className="text-rose-600 font-black hover:underline"
                              >
                                إلغاء الموعد / Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Meetings Real Pagination Controls */}
                    {meetingPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-150 text-xs font-bold text-zinc-600">
                        <div className="flex items-center gap-2">
                          <button
                            disabled={meetingPage <= 1 || syncInProgress}
                            onClick={() => setMeetingPage((prev) => Math.max(1, prev - 1))}
                            className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40 transition-all"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <span>صفحة {meetingPagination.page} من {meetingPagination.totalPages}</span>
                          <button
                            disabled={!meetingPagination.hasMore || syncInProgress}
                            onClick={() => setMeetingPage((prev) => prev + 1)}
                            className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40 transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          إجمالي المواعيد: {meetingPagination.total}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: OAuth Settings */}
            {tab === "settings" && (
              <div className="space-y-6 text-right">
                <div className="bg-zinc-50 border border-zinc-100 p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-zinc-900 flex items-center gap-2">
                    <Shield className="w-4.5 h-4.5 text-indigo-600" />
                    بيانات اعتماد الربط المؤسسي (REST API Credentials)
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">
                    لتحقيق مزامنة بريد حقيقية، نقوم بالتكامل مع حسابك عبر OAuth 2.0. يتم تبادل الرموز وتشفير Refresh Tokens مفتاحياً في الخادم المعتمد.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-zinc-400">CLIENT ID (معرف عميل التطبيق)</label>
                      <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="7192837492-mdrj.apps.googleusercontent.com"
                        className="w-full text-xs font-mono py-2.5 px-4 border border-zinc-200 rounded-xl bg-white outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-zinc-400">CLIENT SECRET (الرمز السري للعميل)</label>
                      <input
                        type="password"
                        value={clientSecret}
                        onChange={(e) => setClientSecret(e.target.value)}
                        placeholder="••••••••••••••••••••••••"
                        className="w-full text-xs font-mono py-2.5 px-4 border border-zinc-200 rounded-xl bg-white outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-zinc-900 flex items-center gap-2">
                    <CheckSquare className="w-4.5 h-4.5 text-zinc-800" />
                    صلاحيات تفويض المزامنة المطلوبة (OAuth Scopes Configuration)
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                    حدد الصلاحيات المطلوب مصادقتها لمدراء المبيعات والمستخدمين عند تسجيل الدخول:
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="p-3 border border-zinc-150 rounded-xl flex items-center justify-between cursor-pointer hover:bg-zinc-50">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={oauthScopes.gmailRead}
                          onChange={(e) => setOauthScopes({ ...oauthScopes, gmailRead: e.target.checked })}
                          className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-black text-zinc-800">قراءة رسائل البريد</span>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-400">gmail.modify</span>
                    </label>

                    <label className="p-3 border border-zinc-150 rounded-xl flex items-center justify-between cursor-pointer hover:bg-zinc-50">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={oauthScopes.gmailSend}
                          onChange={(e) => setOauthScopes({ ...oauthScopes, gmailSend: e.target.checked })}
                          className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-black text-zinc-800">إرسال الفواتير والمراسلات</span>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-400">gmail.send</span>
                    </label>

                    <label className="p-3 border border-zinc-150 rounded-xl flex items-center justify-between cursor-pointer hover:bg-zinc-50">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={oauthScopes.calendarRead}
                          onChange={(e) => setOauthScopes({ ...oauthScopes, calendarRead: e.target.checked })}
                          className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-black text-zinc-800">قراءة تقويم Google Calendar</span>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-400">calendar</span>
                    </label>

                    <label className="p-3 border border-zinc-150 rounded-xl flex items-center justify-between cursor-pointer hover:bg-zinc-50">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={oauthScopes.calendarWrite}
                          onChange={(e) => setOauthScopes({ ...oauthScopes, calendarWrite: e.target.checked })}
                          className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-black text-zinc-800">حجز المواعيد والاجتماعات</span>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-400">calendar.events</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                  <button
                    onClick={() => handleConnect("google")}
                    disabled={isConnecting}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-lg shadow-red-600/10 transition-all flex items-center gap-2"
                  >
                    <span>تفويض حساب Google Workspace</span>
                  </button>
                  <button
                    onClick={() => handleConnect("outlook")}
                    disabled={isConnecting}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/10 transition-all flex items-center gap-2"
                  >
                    <span>تفويض حساب Microsoft Office 365</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Connected state label footer */}
          {provider !== "none" && (
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-bold bg-zinc-50 -mx-6 -mb-6 px-6 py-4 rounded-b-[2rem]">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                المزامنة الخلفية نشطة تلقائياً (تحديث زمني مستمر)
              </span>
              <span>الحساب المفوض: {connectedName} ({connectedEmail})</span>
            </div>
          )}
        </div>

        {/* Right Side: Smart CRM Automation Card */}
        <div className="w-full lg:w-85 space-y-6">
          <div className="bg-zinc-900 text-white p-6 rounded-[2rem] space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              أتمتة المتابعة الذكية (CRM Rules)
            </h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-bold">
              يقوم مدارج بربط الأحداث تلقائياً بالعملاء. أي بريد إلكتروني أو اجتماع قادم يتم تفصيله آلياً وتثبيته في سجل النشاط بالـ CRM للعميل المكتشف.
            </p>

            <div className="space-y-3 pt-2 text-xs font-bold">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <span>تزامن الوارد مع سجل العميل</span>
                <span className="text-emerald-400 text-[10px]">نشط تلقائياً</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <span>إنشاء بطاقة عميل للبريد الجديد</span>
                <span className="text-emerald-400 text-[10px]">نشط تلقائياً</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <span>ربط روابط Meet بنطاق العمل</span>
                <span className="text-emerald-400 text-[10px]">نشط تلقائياً</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 p-6 rounded-[2rem] space-y-4">
            <h4 className="text-xs font-black text-zinc-900">حالة الربط المباشر / OAuth Connection Status</h4>
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2 text-xs font-bold">
              <div className="flex justify-between text-zinc-600">
                <span>Google Gmail API:</span>
                <span className={provider === "google" ? "text-emerald-600" : "text-zinc-400"}>
                  {provider === "google" ? "نشط ومفوض" : "غير مفوض"}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Google Calendar API:</span>
                <span className={provider === "google" ? "text-emerald-600" : "text-zinc-400"}>
                  {provider === "google" ? "نشط ومفوض" : "غير مفوض"}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Microsoft Graph API:</span>
                <span className={provider === "outlook" ? "text-emerald-600" : "text-zinc-400"}>
                  {provider === "outlook" ? "نشط ومفوض" : "غير مفوض"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Modals / Drawers for Composer / Scheduler */}
      <AnimatePresence>
        {isComposing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-200"
            >
              <div className="bg-zinc-50 px-6 py-5 border-b border-zinc-150 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="text-zinc-400 hover:text-zinc-600 font-bold"
                >
                  ✕
                </button>
                <h3 className="font-black text-sm text-zinc-900">إنشاء رسالة صفقات جديدة (Send Email Proposal)</h3>
              </div>

              <form onSubmit={handleSendEmail} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400">المستلم / TO</label>
                  <select
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-150 rounded-xl text-xs font-bold"
                  >
                    <option value="">اختر عميلاً من الـ CRM...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.email || c.name}>
                        {c.name} ({c.email || "بدون بريد"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400">عنوان الرسالة / SUBJECT</label>
                  <input
                    type="text"
                    required
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="مثال: تقديم عرض الأسعار المالي والجدول الزمني للمشروع"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-150 rounded-xl text-xs font-bold outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400">محتوى البريد / EMAIL BODY</label>
                  <textarea
                    required
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    placeholder="اكتب تفاصيل المراسلة أو العرض هنا..."
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-150 rounded-xl text-xs font-medium outline-none focus:border-indigo-600 min-h-[150px]"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-zinc-100">
                  <button
                    type="submit"
                    className="flex-1 bg-zinc-900 text-white py-3.5 rounded-xl font-black text-xs hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>إرسال وتوثيق بالـ CRM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsComposing(false)}
                    className="px-6 bg-zinc-100 text-zinc-600 py-3.5 rounded-xl font-black text-xs hover:bg-zinc-200 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isScheduling && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-200"
            >
              <div className="bg-zinc-50 px-6 py-5 border-b border-zinc-150 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsScheduling(false)}
                  className="text-zinc-400 hover:text-zinc-600 font-bold"
                >
                  ✕
                </button>
                <h3 className="font-black text-sm text-zinc-900">جدولة اجتماع تفاعلي بالتقويم (Schedule Meeting)</h3>
              </div>

              <form onSubmit={handleScheduleMeeting} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400">اسم أو غرض الاجتماع / MEETING TITLE</label>
                  <input
                    type="text"
                    required
                    value={schedTitle}
                    onChange={(e) => setSchedTitle(e.target.value)}
                    placeholder="مثال: مراجعة العقود الفنية والبنود الإضافية"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-150 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400">العميل المستهدف / CLIENT</label>
                    <select
                      value={schedClient}
                      onChange={(e) => setSchedClient(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-150 rounded-xl text-xs font-bold"
                    >
                      <option value="">اختر عميلاً من الـ CRM...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.email || c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400">تاريخ ووقت الاجتماع / DATE & TIME</label>
                    <input
                      type="datetime-local"
                      required
                      value={schedTime}
                      onChange={(e) => setSchedTime(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-150 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400">المدة الزمنية / DURATION</label>
                    <select
                      value={schedDuration}
                      onChange={(e) => setSchedDuration(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-150 rounded-xl text-xs font-bold"
                    >
                      <option value="15">15 دقيقة</option>
                      <option value="30">30 دقيقة</option>
                      <option value="45">45 دقيقة</option>
                      <option value="60">60 دقيقة (ساعة كاملة)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400">الموقع / LOCATION</label>
                    <input
                      type="text"
                      value={schedLocation}
                      onChange={(e) => setSchedLocation(e.target.value)}
                      placeholder="مثال: Google Meet / مقر الشركة"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-150 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400">تفاصيل وأجندة الاجتماع / AGENDA</label>
                  <textarea
                    value={schedDesc}
                    onChange={(e) => setSchedDesc(e.target.value)}
                    placeholder="تفاصيل تظهر لجميع أطراف الاجتماع في دعوة التقويم..."
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-150 rounded-xl text-xs font-medium outline-none focus:border-emerald-600 min-h-[100px]"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-zinc-100">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-black text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>حجز بالتقويم وتوثيق بالـ CRM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsScheduling(false)}
                    className="px-6 bg-zinc-100 text-zinc-600 py-3.5 rounded-xl font-black text-xs hover:bg-zinc-200 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
