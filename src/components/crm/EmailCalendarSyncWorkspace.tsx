import React, { useState, useEffect } from "react";
import {
  Mail,
  Calendar,
  RefreshCw,
  CheckCircle,
  ExternalLink,
  Lock,
  Plus,
  Clock,
  Trash2,
  Settings,
  AlertCircle,
  ChevronRight,
  Shield,
  Send,
  User,
  Activity,
  Check,
  CheckSquare
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
  const [showOauthDetails, setShowOauthDetails] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>("all");
  const [tab, setTab] = useState<"emails" | "meetings" | "settings">("emails");

  // Simulated live client databases
  const [connectedEmail, setConnectedEmail] = useState<string>("");
  const [connectedName, setConnectedName] = useState<string>("");

  // Simulated Email database
  const [emails, setEmails] = useState<any[]>(() => [
    {
      id: "m1",
      clientEmail: "salim@al-khobar-tech.com",
      clientName: "مؤسسة سليم لتقنية المعلومات",
      subject: "طلب عرض سعر مبدئي لتحديث الشبكات / Network RFP Request",
      body: "أهلاً بفريق مدارج، نود الحصول على عرض سعر لتوريد وتركيب خوادم محلية وتحديث هيكل الشبكة الحالي. مرفق كراسة الشروط والمواصفات للاطلاع.",
      date: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hrs ago
      sender: "client",
      unread: true,
      category: "inquiry"
    },
    {
      id: "m2",
      clientEmail: "r.harbi@yamama-group.sa",
      clientName: "مجموعة اليمامة القابضة",
      subject: "مراجعة عقد تزويد المواد الخام والخرسانة",
      body: "السلام عليكم، لقد قمنا بمراجعة مسودة العقد المرسلة من طرفكم، ونقترح تعديل البند الخاص بمدة التوريد لتصبح 45 يوماً بدلاً من 30 يوماً. الرجاء الإفادة بالموافقة.",
      date: new Date(Date.now() - 3600000 * 18).toISOString(), // 18 hrs ago
      sender: "client",
      unread: false,
      category: "contract"
    },
    {
      id: "m3",
      clientEmail: "h.naqbi@riyadh-logistic.com",
      clientName: "الرياض للخدمات اللوجستية",
      subject: "Re: تأكيد استلام الدفعة الأولى وطلب الفاتورة الضريبية",
      body: "شكراً لتأكيد الاستلام. تم إرسال الفاتورة الضريبية المعتمدة من هيئة الزكاة والضريبة والجمارك (ZATCA) في المرفقات. نتطلع لبدء العمل الميداني غداً.",
      date: new Date(Date.now() - 3600000 * 25).toISOString(), // 1 day ago
      sender: "us",
      unread: false,
      category: "finance"
    },
    {
      id: "m4",
      clientEmail: "salim@al-khobar-tech.com",
      clientName: "مؤسسة سليم لتقنية المعلومات",
      subject: "تأكيد موعد الاجتماع التعريفي الافتراضي",
      body: "تم جدولة موعد مناقشة المتطلبات الفنية يوم الإثنين القادم عبر Google Meet الساعة 11:00 صباحاً بتوقيت الرياض.",
      date: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
      sender: "us",
      unread: false,
      category: "meeting"
    }
  ]);

  // Simulated Calendar Events database
  const [meetings, setMeetings] = useState<any[]>(() => [
    {
      id: "evt1",
      title: "جلسة مراجعة المتطلبات - الرمال الذهبية",
      clientEmail: "m.aljasser@goldensands.com",
      clientName: "مؤسسة الرمال الذهبية",
      startTime: new Date(Date.now() + 3600000 * 24).toISOString(), // Tomorrow
      duration: 45,
      location: "Google Meet الافتراضي",
      description: "مناقشة تفاصيل ترخيص البرمجيات وتحديد نطاق العمل والمراحل الزمنية للتسليم.",
      status: "confirmed"
    },
    {
      id: "evt2",
      title: "توقيع اتفاقية توريد الخدمات اللوجستية",
      clientEmail: "h.naqbi@riyadh-logistic.com",
      clientName: "الرياض للخدمات اللوجستية",
      startTime: new Date(Date.now() + 3600000 * 72).toISOString(), // 3 days later
      duration: 60,
      location: "مقر العميل - الرياض طريق الملك فهد",
      description: "التوقيع النهائي على العقد وتوثيقه بالنفاذ الوطني بحضور المستشار القانوني.",
      status: "confirmed"
    }
  ]);

  // Email composer state
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  // Meeting scheduler state
  const [schedTitle, setSchedTitle] = useState("");
  const [schedClient, setSchedClient] = useState("");
  const [schedTime, setSchedTime] = useState("");
  const [schedDuration, setSchedDuration] = useState("30");
  const [schedLocation, setSchedLocation] = useState("Google Meet");
  const [schedDesc, setSchedDesc] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  // Credentials configuration states
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [oauthScopes, setOauthScopes] = useState({
    gmailRead: true,
    gmailSend: true,
    calendarWrite: true,
    calendarRead: true
  });

  // Handle mock Google connection
  const handleConnect = (selectedProv: "google" | "outlook") => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setProvider(selectedProv);
      setConnectedEmail(selectedProv === "google" ? "admin@madarij-os.com" : "ceo@madarij-sa.onmicrosoft.com");
      setConnectedName(selectedProv === "google" ? "مدارج جيت واي (Google Apps)" : "مدارج كورب (Microsoft Exchange)");
      toast.success(`تم الربط والتفويض مع ${selectedProv === "google" ? "Google Workspace" : "Microsoft Outlook"} بنجاح! 🔐`);
    }, 1500);
  };

  const handleDisconnect = () => {
    if (confirm("هل أنت متأكد من إلغاء مزامنة البريد والتقويم؟ سيتم حذف الجلسات المؤقتة.")) {
      setProvider("none");
      setConnectedEmail("");
      setConnectedName("");
      toast.info("تم فصل الحساب والمزامنة بنجاح.");
    }
  };

  const handleSyncNow = () => {
    if (provider === "none") {
      toast.error("يرجى ربط مزود الخدمة أولاً قبل محاولة المزامنة!");
      return;
    }
    setSyncInProgress(true);
    setTimeout(() => {
      setSyncInProgress(false);
      toast.success("تم الانتهاء من المزامنة الثنائية للبريد والتقويم! تم تحديث 4 محادثات وجدول اجتماعين.");
    }, 2000);
  };

  // Compose simulated email submit
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject || !composeBody) {
      toast.error("يرجى إكمال جميع الحقول!");
      return;
    }

    const matchedClient = clients.find(c => c.email === composeTo || c.name === composeTo);
    const clientName = matchedClient ? matchedClient.name : composeTo;
    const clientEmail = matchedClient ? matchedClient.email : composeTo;

    const newMail = {
      id: `m_${Date.now()}`,
      clientEmail,
      clientName,
      subject: composeSubject,
      body: composeBody,
      date: new Date().toISOString(),
      sender: "us",
      unread: false,
      category: "outbound"
    };

    setEmails([newMail, ...emails]);
    setIsComposing(false);
    toast.success(`تم إرسال البريد الإلكتروني بنجاح إلى ${clientName}`);

    // LOG THIS ACTION TO FIRESTORE CLIENT HISTORY FOR DUAL SYNC HEALTH
    if (matchedClient && matchedClient.id) {
      try {
        const clientDocRef = doc(db, "leads", matchedClient.id);
        const logItem = {
          id: `h_mail_${Date.now()}`,
          date: new Date().toISOString(),
          action: "بريد إلكتروني صادر (Synced)",
          details: `الموضوع: ${composeSubject}\nالرسالة: ${composeBody}`
        };
        await updateDoc(clientDocRef, {
          history: arrayUnion(logItem)
        });
        toast.info("تم توثيق الاتصال البريدي تلقائياً في سجل نشاط العميل بالـ CRM! ⚡");
      } catch (err) {
        console.warn("Failed to write history back to client doc:", err);
      }
    }

    // Reset composer
    setComposeSubject("");
    setComposeBody("");
  };

  // Schedule simulated meeting submit
  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedTitle || !schedClient || !schedTime) {
      toast.error("يرجى إدخال اسم الاجتماع، العميل والتاريخ!");
      return;
    }

    const matchedClient = clients.find(c => c.email === schedClient || c.name === schedClient);
    const clientName = matchedClient ? matchedClient.name : schedClient;
    const clientEmail = matchedClient ? matchedClient.email : "guest@meeting.com";

    const newMeeting = {
      id: `evt_${Date.now()}`,
      title: schedTitle,
      clientEmail,
      clientName,
      startTime: new Date(schedTime).toISOString(),
      duration: parseInt(schedDuration),
      location: schedLocation,
      description: schedDesc,
      status: "confirmed"
    };

    setMeetings([newMeeting, ...meetings]);
    setIsScheduling(false);
    toast.success(`تم حجز موعد الاجتماع بنجاح وتوليد رابط Google Meet! 🗓️`);

    // LOG MEETING TO CLIENT HISTORY IN FIRESTORE
    if (matchedClient && matchedClient.id) {
      try {
        const clientDocRef = doc(db, "leads", matchedClient.id);
        const logItem = {
          id: `h_meet_${Date.now()}`,
          date: new Date().toISOString(),
          action: "موعد مجدول (Synced Calendar)",
          details: `عنوان الاجتماع: ${schedTitle}\nالتاريخ: ${new Date(schedTime).toLocaleString("ar-SA")}\nالموقع: ${schedLocation}`
        };
        await updateDoc(clientDocRef, {
          history: arrayUnion(logItem)
        });
        toast.info("تم إدراج الموعد تلقائياً في سجل العميل بالـ CRM! 🔗");
      } catch (err) {
        console.warn("Failed to log meeting in history:", err);
      }
    }

    // Reset fields
    setSchedTitle("");
    setSchedTime("");
    setSchedDesc("");
  };

  // Filter emails/meetings based on client filter selection
  const filteredEmails = emails.filter(m => {
    if (selectedClientFilter === "all") return true;
    return m.clientEmail === selectedClientFilter || m.clientName === selectedClientFilter;
  });

  const filteredMeetings = meetings.filter(m => {
    if (selectedClientFilter === "all") return true;
    return m.clientEmail === selectedClientFilter || m.clientName === selectedClientFilter;
  });

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-[2.5rem] p-8 space-y-8 animate-in fade-in duration-300 text-right">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded-full border border-indigo-200 font-black uppercase tracking-wider">
              Bidirectional Synchronization
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-400 font-bold">نشط بالكامل / Active Engine</span>
          </div>
          <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-indigo-600" />
            مزامنة البريد والتقويم الذكية (Smart Integrations Hub)
          </h2>
          <p className="text-xs text-zinc-500 font-bold mt-1">
            اربط بريدك الإلكتروني المؤسسي (Gmail/Office365) والتقويم التفاعلي لمطابقة المراسلات، جدولة المواعيد وتحديث خط المبيعات ومحرك الهوية تلقائياً.
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
              <span>تهيئة ربط الـ API والـ OAuth</span>
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
          <p className="text-[10px] font-extrabold text-zinc-400">مزود الخدمة المعتمد / Provider</p>
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
                {provider !== "none" ? `مفوض عبر OAuth 2.0 • ${connectedEmail}` : "تتطلب تفويضاً قانونياً للوصول"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <p className="text-[10px] font-extrabold text-zinc-400">سجل النشاط المالي والمرسلات / Audit Trail</p>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-base font-black text-zinc-900">{emails.length} رسالة بريد</p>
              <p className="text-[10px] text-zinc-400 font-bold">تمت مطابقتها مع عناوين الـ CRM</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50/50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
              📬
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <p className="text-[10px] font-extrabold text-zinc-400">اجتماعات التقويم الذكي / Synchronized Events</p>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-base font-black text-zinc-900">{meetings.length} موعد مجدول</p>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                تزامن فوري بالتقويم الشخصي
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
                <Mail className="w-4 h-4" /> علبة بريد المعاملات ({filteredEmails.length})
              </button>
              <button
                onClick={() => setTab("meetings")}
                className={`pb-2 px-3 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all ${tab === "meetings" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}
              >
                <Calendar className="w-4 h-4" /> اجتماعات التقويم المجدولة ({filteredMeetings.length})
              </button>
              <button
                onClick={() => setTab("settings")}
                className={`pb-2 px-3 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all ${tab === "settings" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}
              >
                <Settings className="w-4 h-4" /> إعدادات الـ OAuth والتفويض
              </button>
            </div>

            {/* Content Switch */}
            {tab === "emails" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-50 pb-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-zinc-500">فلترة البريد حسب العميل:</span>
                    <select
                      value={selectedClientFilter}
                      onChange={(e) => setSelectedClientFilter(e.target.value)}
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

                {provider === "none" ? (
                  <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-zinc-300 mx-auto mb-3 shadow-xs">
                      <Lock className="w-6 h-6 text-zinc-400" />
                    </div>
                    <p className="text-xs font-black text-zinc-800">قناة الاتصال بالبريد مغلقة</p>
                    <p className="text-[10px] text-zinc-400 font-medium mt-1">
                      الرجاء الدخول على تبويب "إعدادات الـ OAuth والتفويض" لربط حساب Google/Outlook الخاص بك بشكل آمن.
                    </p>
                  </div>
                ) : filteredEmails.length === 0 ? (
                  <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    <p className="text-xs font-black text-zinc-500">لا توجد رسائل مطابقة حالياً لهذا العميل</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredEmails.map(mail => (
                      <div
                        key={mail.id}
                        className={`p-4 border rounded-2xl text-right transition-all hover:border-zinc-300 ${mail.unread ? "bg-indigo-50/20 border-indigo-200" : "bg-white border-zinc-150"}`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${mail.unread ? "bg-indigo-500" : "bg-transparent"}`} />
                            <h4 className="text-xs font-black text-zinc-900">{mail.clientName}</h4>
                            <span className="text-[10px] text-zinc-400 font-mono" dir="ltr">&lt;{mail.clientEmail}&gt;</span>
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
                             mail.category === "finance" ? "فوترة وتحصيل" :
                             mail.category === "meeting" ? "موعد واجتماع" : "صادر صفقات"}
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
                                setEmails(emails.filter(m => m.id !== mail.id));
                                toast.success("تم أرشفة الرسالة من علبة الوارد.");
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
                  </div>
                )}
              </div>
            )}

            {tab === "meetings" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-50 pb-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-zinc-500">مواعيد العميل المحدد:</span>
                    <select
                      value={selectedClientFilter}
                      onChange={(e) => setSelectedClientFilter(e.target.value)}
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

                {provider === "none" ? (
                  <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-zinc-300 mx-auto mb-3 shadow-xs">
                      <Calendar className="w-6 h-6 text-zinc-400" />
                    </div>
                    <p className="text-xs font-black text-zinc-800">تكامل التقويم معطل</p>
                    <p className="text-[10px] text-zinc-400 font-medium mt-1">
                      يتطلب ربط التقويم الذكي الوصول إلى Google Calendar API أو MS Graph API لمزامنة الاجتماعات وتأكيد روابط الاتصال.
                    </p>
                  </div>
                ) : filteredMeetings.length === 0 ? (
                  <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    <p className="text-xs font-black text-zinc-500">لا توجد اجتماعات قادمة مجدولة لهذا العميل في التقويم.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMeetings.map(meet => (
                      <div
                        key={meet.id}
                        className="p-5 border border-zinc-150 rounded-2xl bg-white shadow-2xs hover:border-emerald-500 transition-colors flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="text-[9px] font-black px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                              Google Meet Synced
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
                                setMeetings(meetings.filter(m => m.id !== meet.id));
                                toast.success("تم إلغاء الاجتماع وحذفه من تقاويم الأطراف.");
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
                )}
              </div>
            )}

            {tab === "settings" && (
              <div className="space-y-6 text-right">
                <div className="bg-zinc-50 border border-zinc-100 p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-zinc-900 flex items-center gap-2">
                    <Shield className="w-4.5 h-4.5 text-indigo-600" />
                    بيانات اعتماد الربط المؤسسي (REST API Credentials)
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">
                    لتحقيق مزامنة بريد حقيقية، نقوم بالتكامل مع حسابك عبر OAuth 2.0. قم بإدخال بيانات عميل التطبيق (Client Credentials) الخاصة بشركتك للوصول إلى الواجهات البرمجية.
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
                      <span className="text-[8px] font-mono text-zinc-400">gmail.readonly</span>
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
                      <span className="text-[8px] font-mono text-zinc-400">calendar.readonly</span>
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
                المزامنة الخلفية نشطة تلقائياً (دورة كل ٥ دقائق)
              </span>
              <span>الحساب النشط: {connectedName} ({connectedEmail})</span>
            </div>
          )}
        </div>

        {/* Right Side: Quick Simulation Utilities & Actions */}
        <div className="w-full lg:w-85 space-y-6">
          <div className="bg-zinc-900 text-white p-6 rounded-[2rem] space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              أتمتة المتابعة الذكية (CRM Rules)
            </h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-bold">
              يقوم مدارج بربط الأحداث تلقائياً بالعملاء. عند تفعيل "القواعد البرمجية"، أي بريد إلكتروني أو اجتماع قادم يتم تفصيله تلقائياً وتثبيته في سجل النشاط بالـ CRM للعميل.
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
            <h4 className="text-xs font-black text-zinc-900">أدوات المحاكاة المباشرة / Simulation Playground</h4>
            <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">
              محاكاة تلقي بريد إلكتروني وارد جديد من عميل لتجربة التزامن الفوري مع خط مبيعات الـ CRM وسجل تاريخه:
            </p>

            <button
              onClick={() => {
                if (provider === "none") {
                  toast.error("يرجى ربط مزود المزامنة أولاً لتفعيل الاستقبال المباشر!");
                  return;
                }
                const extraMail = {
                  id: `m_sim_${Date.now()}`,
                  clientEmail: "m.aljasser@goldensands.com",
                  clientName: "مؤسسة الرمال الذهبية",
                  subject: "طلب عاجل: تعديل جدول الدفعات للمشروع القائم",
                  body: "السلام عليكم، نود إعادة ترتيب جدول دفعات الربع القادم لتتوافق مع تسليمات البوابة الرقمية. يرجى مراجعة الجدول المرفق وإفادتنا في أقرب فرصة.",
                  date: new Date().toISOString(),
                  sender: "client",
                  unread: true,
                  category: "finance"
                };
                setEmails([extraMail, ...emails]);
                toast.success("محاكاة: تم جلب رسالة جديدة من مؤسسة الرمال الذهبية وتزامنها مع الـ CRM! 📬");

                // Write to audit log and update lead's history
                const lead = clients.find(c => c.name.includes("الرمال الذهبية") || c.email?.includes("goldensands"));
                if (lead && lead.id) {
                  const clientDocRef = doc(db, "leads", lead.id);
                  updateDoc(clientDocRef, {
                    history: arrayUnion({
                      id: `h_sim_${Date.now()}`,
                      date: new Date().toISOString(),
                      action: "بريد وارد مستلم (Auto Synced)",
                      details: `الموضوع: طلب عاجل: تعديل جدول الدفعات للمشروع القائم\nالرسالة: السلام عليكم، نود إعادة ترتيب جدول دفعات الربع القادم...`
                    })
                  }).catch(console.error);
                }
              }}
              className="w-full py-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-[11px] font-black tracking-tight transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>محاكاة استلام بريد وارد 📥</span>
            </button>
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
                    {clients.map(c => (
                      <option key={c.id} value={c.email || c.name}>{c.name} ({c.email || "بدون بريد"})</option>
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
                      {clients.map(c => (
                        <option key={c.id} value={c.email || c.name}>{c.name}</option>
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
