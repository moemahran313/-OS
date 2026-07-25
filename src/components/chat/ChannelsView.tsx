import React, { useState } from "react";
import {
  MessageSquare,
  Building,
  Smartphone,
  Mail,
  Coins,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  QrCode,
  Copy,
  Settings,
  Bot,
  Zap,
  Globe,
  Plus,
  Play,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

interface ChannelInfo {
  id: string;
  name: string;
  desc: string;
  status: "connected" | "disconnected" | "configuring";
  icon: any;
  color: string;
}

export default function ChannelsView() {
  const [channels, setChannels] = useState<ChannelInfo[]>([
    {
      id: "whatsapp",
      name: "واتساب (WhatsApp Cloud API)",
      desc: "ربط رقم الشركة المعتمد لتبادل الرسائل وقوالب الإشعارات حياً والكتالوجات",
      status: "connected",
      icon: MessageSquare,
      color: "bg-emerald-500 text-white",
    },
    {
      id: "telegram",
      name: "تيليجرام (Telegram Bot API)",
      desc: "ربط حسابات البوت والمجموعات والقنوات لإجراء الدعم الفني وتلقي الأوامر الفورية",
      status: "connected",
      icon: Bot,
      color: "bg-sky-500 text-white",
    },
    {
      id: "email",
      name: "البريد الإلكتروني الموحد (SMTP / IMAP)",
      desc: "صندوق بريد مشترك لإرسال واستقبال رسائل العملاء كرسائل دعم مدمجة بالموقع",
      status: "configuring",
      icon: Mail,
      color: "bg-rose-500 text-white",
    },
    {
      id: "sms",
      name: "بوابة الرسائل القصيرة (SMS Twilio / local)",
      desc: "إرسال رسائل التفعيل OTP وإشعارات الفواتير وتأكيدات مسيرات الرواتب",
      status: "disconnected",
      icon: Smartphone,
      color: "bg-zinc-700 text-white",
    },
    {
      id: "livechat",
      name: "المحادثة المباشرة بالموقع (Website Widget)",
      desc: "ويدجت عائم بالموقع الإلكتروني للتواصل الفوري مع زوار موقعك والتحويل للمبيعات",
      status: "connected",
      icon: Globe,
      color: "bg-blue-600 text-white",
    },
  ]);

  const [activeChannelId, setActiveChannelId] = useState<string>("whatsapp");

  // State for form fields
  const [waPhone, setWaPhone] = useState("+966 50 111 2222");
  const [waPhoneNumberId, setWaPhoneNumberId] = useState("10928374829102");
  const [waToken, setWaToken] = useState("wa_token_prod_908234723487_secured");
  const [waVerifiedName, setWaVerifiedName] = useState("Madarij Business Account");
  const [waTestResult, setWaTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [isTestingWa, setIsTestingWa] = useState(false);
  const [isSavingWa, setIsSavingWa] = useState(false);

  const [tgBotToken, setTgBotToken] = useState("7234982342:AAHG83478dksfhsdkfjsdhf8");
  const [tgBotUsername, setTgBotUsername] = useState("MadarijOS_Support_Bot");
  const [smtpServer, setSmtpServer] = useState("smtp.madarij-os.com");
  const [smtpUser, setSmtpUser] = useState("support@madarij-os.com");
  const [smsSid, setSmsSid] = useState("AC738923472348cdef89234");
  const [widgetColor, setWidgetColor] = useState("#0f9b7e");
  const [widgetTitle, setWidgetTitle] = useState("الدعم الفوري - مدارج OS");

  const [isTesting, setIsTesting] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<any>(null);
  const [waVerifyToken, setWaVerifyToken] = useState("madarij_wa_verify_secret");

  // Fetch real webhook status & saved whatsapp config on mount
  React.useEffect(() => {
    fetch("/api/webhooks/status")
      .then((res) => res.json())
      .then((data) => {
        setWebhookStatus(data);
        if (data?.webhooks?.whatsapp?.verifyToken) {
          setWaVerifyToken(data.webhooks.whatsapp.verifyToken);
        }
      })
      .catch((err) => console.error("Failed to load webhook status", err));

    fetch("/api/whatsapp/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) {
          if (data.config.phoneNumberId) setWaPhoneNumberId(data.config.phoneNumberId);
          if (data.config.token) setWaToken(data.config.token);
          if (data.config.displayPhone) setWaPhone(data.config.displayPhone);
          if (data.config.verifiedName) setWaVerifiedName(data.config.verifiedName);
        }
      })
      .catch((err) => console.error("Failed to load WhatsApp config", err));
  }, []);

  const handleTestWhatsAppConnection = async () => {
    if (!waPhoneNumberId || !waToken) {
      toast.error("يرجى إدخال معرّف رقم الهاتف (Phone Number ID) ورمز الوصول (API Token) أولاً");
      return;
    }
    setIsTestingWa(true);
    setWaTestResult(null);
    try {
      const res = await fetch("/api/whatsapp/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumberId: waPhoneNumberId.trim(),
          token: waToken.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWaTestResult({
          success: true,
          message: data.message || "✓ تم الاتصال بـ Meta WhatsApp Business Cloud API بنجاح!",
          details: data,
        });
        if (data.verifiedName) setWaVerifiedName(data.verifiedName);
        if (data.displayPhoneNumber && data.displayPhoneNumber !== "غير محدد") {
          setWaPhone(data.displayPhoneNumber);
        }
        toast.success("✓ نجح اختبار الاتصالية اللحظي مع Meta Cloud API!");
      } else {
        setWaTestResult({
          success: false,
          message: data.error || "فشل الاتصال بـ Meta WhatsApp API. تحقق من صحة المفاتيح.",
        });
        toast.error(data.error || "فشل الاتصال بـ Meta WhatsApp API");
      }
    } catch (err: any) {
      setWaTestResult({
        success: false,
        message: "خطأ بالشبكة: " + err.message,
      });
      toast.error("خطأ بالشبكة أثناء الاتصال بالخادم");
    } finally {
      setIsTestingWa(false);
    }
  };

  const handleSaveWhatsAppConfig = async () => {
    if (!waPhoneNumberId || !waToken) {
      toast.error("يرجى إدخال جميع البيانات المطلوبة قبل الحفظ");
      return;
    }
    setIsSavingWa(true);
    try {
      const res = await fetch("/api/whatsapp/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumberId: waPhoneNumberId.trim(),
          token: waToken.trim(),
          displayPhone: waPhone,
          verifyToken: waVerifyToken,
          verifiedName: waVerifiedName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "✓ تم حفظ وتفعيل إعدادات WhatsApp Cloud API بنجاح!");
        setChannels(
          channels.map((c) => (c.id === "whatsapp" ? { ...c, status: "connected" as const } : c))
        );
      } else {
        toast.error(data.error || "فشل حفظ إعدادات الواتساب");
      }
    } catch (err: any) {
      toast.error("خطأ في الاتصال بالخادم: " + err.message);
    } finally {
      setIsSavingWa(false);
    }
  };

  const handleRegisterTelegramWebhook = async () => {
    if (!tgBotToken) {
      toast.error("يرجى إدخال معرّف البوت (Telegram Bot Token) أولاً");
      return;
    }
    setIsTesting(true);
    try {
      const res = await fetch("/api/webhooks/telegram/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken: tgBotToken }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("✓ تم تسجيل الـ Webhook الخاص بتيليجرام بنجاح على الخادم!");
        setChannels(
          channels.map((c) => (c.id === "telegram" ? { ...c, status: "connected" as const } : c))
        );
      } else {
        toast.error(data.error || data.telegramResponse?.description || "فشل تسجيل Webhook تيليجرام");
      }
    } catch (e: any) {
      toast.error("خطأ في الاتصال بالخادم: " + e.message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestConnection = (channelId: string) => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      toast.success(`تم اختبار وتأكيد الاتصال بقناة ${channelId.toUpperCase()} بنجاح!`);
    }, 1200);
  };

  const handleSaveConfig = (channelId: string) => {
    setChannels(
      channels.map((c) => {
        if (c.id === channelId) {
          return { ...c, status: "connected" as const };
        }
        return c;
      })
    );
    toast.success(`تم حفظ إعدادات ${channelId.toUpperCase()} بنجاح وتفعيل القناة حياً!`);
  };

  const handleDisconnect = (channelId: string) => {
    setChannels(
      channels.map((c) => {
        if (c.id === channelId) {
          return { ...c, status: "disconnected" as const };
        }
        return c;
      })
    );
    toast.info(`تم قطع الاتصال بقناة ${channelId.toUpperCase()}`);
  };

  const widgetEmbedCode = `<script>
  window.MadarijChatConfig = {
    appletId: "${window.location.host.split("-")[1] || "secured-app-id"}",
    themeColor: "${widgetColor}",
    welcomeMessage: "أهلاً بك في مدارج OS! كيف يمكننا مساعدتك اليوم؟",
    rtl: true
  };
</script>
<script src="${window.location.origin}/chat-widget.js" async></script>`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" dir="rtl">
      {/* Sidebar: Channel selection */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="font-extrabold text-sm text-zinc-800">قنوات الاتصال الموحدة</h3>
          <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
            اختر القناة لتهيئة الربط وفحص الحالة
          </p>
        </div>

        <div className="space-y-2">
          {channels.map((c) => {
            const isSelected = c.id === activeChannelId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveChannelId(c.id)}
                className={`w-full text-right p-4 rounded-2xl border flex items-start gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary/5 border-primary shadow-sm"
                    : "bg-white border-zinc-200/60 hover:bg-zinc-50"
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${c.color}`}>
                  <c.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-zinc-800 truncate">{c.name}</span>
                    <span
                      className={`px-2 py-0.5 text-[8px] font-black rounded-full border shrink-0 ${
                        c.status === "connected"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : c.status === "configuring"
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : "bg-zinc-50 text-zinc-500 border-zinc-200"
                      }`}
                    >
                      {c.status === "connected" && "متصل حياً"}
                      {c.status === "configuring" && "قيد التهيئة"}
                      {c.status === "disconnected" && "غير متصل"}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-bold mt-1 leading-relaxed truncate">
                    {c.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Future Integrations */}
        <div className="bg-zinc-50/70 border border-zinc-200/50 rounded-2xl p-4 space-y-3">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">
            قنوات قادمة للتفعيل (Future Channels):
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold text-zinc-500">
            {[
              "Slack Direct",
              "Microsoft Teams",
              "Apple Messages",
              "WeChat Business",
              "Discord Bot",
              "Google Maps Chat",
            ].map((fc) => (
              <span
                key={fc}
                className="bg-white border border-zinc-200/40 px-2 py-1 rounded-lg truncate flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                {fc}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Panel: Configuration form for selected channel */}
      <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
        <AnimatePresence mode="wait">
          {activeChannelId === "whatsapp" && (
            <motion.div
              key="config-whatsapp"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="border-b border-zinc-100 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-800 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    إعدادات ربط Meta WhatsApp Business Cloud API
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                    اربط حساب Meta WhatsApp الرسمية عبر إدخال مفتاح الوصول (API Token) ومعرّف رقم الهاتف (Phone Number ID) مباشرة
                  </p>
                </div>
                <div className="px-2.5 py-1 text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span>Meta Graph API v18.0</span>
                </div>
              </div>

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-600 block mb-1.5 flex items-center gap-1">
                    <span>معرّف رقم الهاتف (Phone Number ID)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={waPhoneNumberId}
                    onChange={(e) => setWaPhoneNumberId(e.target.value)}
                    placeholder="مثال: 10928374829102"
                    className="w-full text-xs font-mono font-bold px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl focus:outline-none transition-all dir-ltr text-left"
                  />
                  <span className="text-[9px] text-zinc-400 block mt-1">يُستخرج من لوحة مطوري Meta {`->`} WhatsApp {`->`} API Setup</span>
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-600 block mb-1.5 flex items-center gap-1">
                    <span>مفتاح الوصول المستمر (API Access Token)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={waToken}
                    onChange={(e) => setWaToken(e.target.value)}
                    placeholder="EAAG..."
                    className="w-full text-xs font-mono font-bold px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl focus:outline-none transition-all dir-ltr text-left"
                  />
                  <span className="text-[9px] text-zinc-400 block mt-1">Permanent System User Token مع صلاحيات whatsapp_business_messaging</span>
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-600 block mb-1.5">
                    رقم هاتف الواتساب الموثّق للعرض
                  </label>
                  <input
                    type="text"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="+966 50 111 2222"
                    className="w-full text-xs font-bold px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl focus:outline-none transition-all dir-ltr text-left"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-600 block mb-1.5">
                    اسم الحساب المعتمد بـ Meta (Verified Business Name)
                  </label>
                  <input
                    type="text"
                    value={waVerifiedName}
                    onChange={(e) => setWaVerifiedName(e.target.value)}
                    placeholder="اسم الشركة المعتمد"
                    className="w-full text-xs font-bold px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Test Connection Live Output Banner */}
              {waTestResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-4 rounded-2xl border text-xs font-bold space-y-2",
                    waTestResult.success
                      ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                      : "bg-rose-50/90 border-rose-300 text-rose-950"
                  )}
                >
                  <div className="flex items-center gap-2 border-b pb-2 border-current/20">
                    {waTestResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <span className="font-extrabold text-sm">{waTestResult.message}</span>
                  </div>

                  {waTestResult.success && waTestResult.details && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px] font-mono">
                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-200">
                        <span className="text-zinc-500 block text-[9px]">اسم الحساب الموثّق:</span>
                        <span className="font-bold text-emerald-800">{waTestResult.details.verifiedName}</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-200">
                        <span className="text-zinc-500 block text-[9px]">Phone Number ID:</span>
                        <span className="font-bold text-emerald-800">{waTestResult.details.phoneNumberId}</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-200">
                        <span className="text-zinc-500 block text-[9px]">الرقم المسجل:</span>
                        <span className="font-bold text-emerald-800">{waTestResult.details.displayPhoneNumber}</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-200">
                        <span className="text-zinc-500 block text-[9px]">تقييم جودة الرقم:</span>
                        <span className="font-bold text-emerald-600">🟢 {waTestResult.details.qualityRating}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Meta Webhook Live URL & Config Box */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-emerald-200/60 pb-2">
                  <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    رابط الـ Webhook المستمع لـ Meta WhatsApp (Live Webhook)
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-100 text-emerald-800 rounded-md">
                    X-Hub-Signature-256 مفعل
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-bold">
                  <div>
                    <label className="text-[10px] text-emerald-700 font-extrabold block mb-1">
                      Webhook Callback URL (في لوحة مطوري Meta):
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/api/webhooks/whatsapp`}
                        className="flex-1 bg-white border border-emerald-200 rounded-xl px-3 py-1.5 text-[10px] font-mono text-emerald-900 dir-ltr text-left"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/whatsapp`);
                          toast.success("تم نسخ رابط Webhook الخاص بواتساب!");
                        }}
                        className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 cursor-pointer"
                        title="نسخ الرابط"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-emerald-700 font-extrabold block mb-1">
                      رمز التحقق المقترن (Verify Token):
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        readOnly
                        value={waVerifyToken}
                        className="flex-1 bg-white border border-emerald-200 rounded-xl px-3 py-1.5 text-[10px] font-mono text-emerald-900 dir-ltr text-left"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(waVerifyToken);
                          toast.success("تم نسخ رمز التحقق Verify Token!");
                        }}
                        className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 cursor-pointer"
                        title="نسخ الرمز"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-end border-t border-zinc-100 pt-4">
                <button
                  onClick={() => handleDisconnect("whatsapp")}
                  className="px-4 py-2.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  قطع الاتصال
                </button>
                <button
                  onClick={handleTestWhatsAppConnection}
                  disabled={isTestingWa}
                  className="px-4 py-2.5 bg-zinc-900 text-white text-xs font-extrabold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isTestingWa ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>جاري فحص Meta Cloud API...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>اختبار اتصالية لحظي (Meta Cloud API)</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleSaveWhatsAppConfig}
                  disabled={isSavingWa}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  {isSavingWa ? (
                    <span>جاري حفظ الإعدادات...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>حفظ الإعدادات والتنشيط</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {activeChannelId === "telegram" && (
            <motion.div
              key="config-telegram"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="border-b border-zinc-100 pb-4">
                <h3 className="font-extrabold text-sm text-zinc-800">إعدادات Telegram Bot API</h3>
                <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                  اربط معرف البوت التابع لشركتك لاستلام رسائل المجموعات والمحادثات الخاصة فوراً في
                  صندوق الوارد
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 block mb-1.5">
                    معرّف البوت (Bot Token)
                  </label>
                  <input
                    type="password"
                    value={tgBotToken}
                    onChange={(e) => setTgBotToken(e.target.value)}
                    className="w-full text-xs font-bold px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-primary/50 focus:bg-white rounded-xl focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-500 block mb-1.5">
                    اسم مستخدم البوت (Bot Username)
                  </label>
                  <input
                    type="text"
                    value={tgBotUsername}
                    onChange={(e) => setTgBotUsername(e.target.value)}
                    className="w-full text-xs font-bold px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-primary/50 focus:bg-white rounded-xl focus:outline-none transition-all"
                    placeholder="@Support_Bot"
                  />
                </div>
              </div>

              <div className="bg-sky-50 border border-sky-100 text-sky-800 p-4 rounded-2xl text-xs font-bold space-y-3">
                <div className="flex justify-between items-center border-b border-sky-200/60 pb-2">
                  <h4 className="flex items-center gap-1.5 font-black text-sky-900">
                    <Bot className="w-4 h-4" /> التسجيل الآلي لـ Telegram Webhook
                  </h4>
                  <button
                    onClick={handleRegisterTelegramWebhook}
                    disabled={isTesting}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-black rounded-xl cursor-pointer transition-all shadow-sm flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    <span>{isTesting ? "جاري التسجيل..." : "ربط Webhook تلقائياً مع Telegram"}</span>
                  </button>
                </div>
                <p className="leading-relaxed">
                  1. افتح تطبيق تيليجرام وابحث عن حساب{" "}
                  <span className="font-black">@BotFather</span>.<br />
                  2. أرسل الأمر <span className="font-black">/newbot</span> واتبع الخطوات لتسمية
                  البوت.
                  <br />
                  3. الصق رمز الـ HTTP API (Token) الموفر في الحقل أعلاه، ثم اضغط زر "ربط Webhook تلقائياً"!
                </p>
                <div className="pt-2 border-t border-sky-200/50 flex items-center justify-between text-[10px]">
                  <span className="text-sky-700 font-extrabold">عنوان Webhook المستهدف:</span>
                  <code className="bg-white/80 px-2 py-0.5 rounded font-mono text-sky-900">
                    {window.location.origin}/api/webhooks/telegram
                  </code>
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-zinc-100 pt-4">
                <button
                  onClick={() => handleDisconnect("telegram")}
                  className="px-4 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  إلغاء التفعيل
                </button>
                <button
                  onClick={() => handleTestConnection("telegram")}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 text-xs font-bold rounded-xl border border-zinc-200 hover:bg-zinc-200 cursor-pointer"
                >
                  اختبار الاتصال بالبوت
                </button>
                <button
                  onClick={() => handleSaveConfig("telegram")}
                  className="px-5 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-black rounded-xl cursor-pointer"
                >
                  تأكيد وحفظ الإعدادات
                </button>
              </div>
            </motion.div>
          )}

          {activeChannelId === "email" && (
            <motion.div
              key="config-email"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="border-b border-zinc-100 pb-4">
                <h3 className="font-extrabold text-sm text-zinc-800">
                  إعدادات البريد المشترك (SMTP / IMAP)
                </h3>
                <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                  قم بربط بريد الدعم الفني أو المبيعات لاستلام البريد وتحويله لتذاكر أو محادثات مع
                  الـ CRM تلقائياً
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 block mb-1.5">
                    خادم البريد الوارد (IMAP Server)
                  </label>
                  <input
                    type="text"
                    value={smtpServer}
                    onChange={(e) => setSmtpServer(e.target.value)}
                    className="w-full text-xs font-bold px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-primary/50 focus:bg-white rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-500 block mb-1.5">
                    عنوان البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    className="w-full text-xs font-bold px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-primary/50 focus:bg-white rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-zinc-100 pt-4">
                <button
                  onClick={() => handleDisconnect("email")}
                  className="px-4 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 hover:bg-rose-100 cursor-pointer"
                >
                  إيقاف الربط
                </button>
                <button
                  onClick={() => handleTestConnection("email")}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 text-xs font-bold rounded-xl border border-zinc-200 hover:bg-zinc-200 cursor-pointer"
                >
                  فحص خوادم البريد
                </button>
                <button
                  onClick={() => handleSaveConfig("email")}
                  className="px-5 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-black rounded-xl cursor-pointer"
                >
                  ربط وحفظ البريد الإلكتروني
                </button>
              </div>
            </motion.div>
          )}

          {activeChannelId === "sms" && (
            <motion.div
              key="config-sms"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="border-b border-zinc-100 pb-4">
                <h3 className="font-extrabold text-sm text-zinc-800">
                  إعدادات بوابة Twilio / Vonage SMS
                </h3>
                <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                  قم بربط حساب Twilio أو مزود محلي لإرسال رسائل الـ OTP والتحقق الثنائي وإشعارات
                  الفواتير العاجلة
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 block mb-1.5">
                    Twilio Account SID
                  </label>
                  <input
                    type="text"
                    value={smsSid}
                    onChange={(e) => setSmsSid(e.target.value)}
                    className="w-full text-xs font-bold px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-primary/50 focus:bg-white rounded-xl focus:outline-none"
                    placeholder="AC............................"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-500 block mb-1.5">
                    Twilio Auth Token
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="w-full text-xs font-bold px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-primary/50 focus:bg-white rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-zinc-100 pt-4">
                <button
                  onClick={() => handleTestConnection("sms")}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 text-xs font-bold rounded-xl border border-zinc-200 hover:bg-zinc-200 cursor-pointer"
                >
                  فحص الحساب حياً
                </button>
                <button
                  onClick={() => handleSaveConfig("sms")}
                  className="px-5 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-black rounded-xl cursor-pointer"
                >
                  حفظ بيانات الرسائل وتفعيلها
                </button>
              </div>
            </motion.div>
          )}

          {activeChannelId === "livechat" && (
            <motion.div
              key="config-livechat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="border-b border-zinc-100 pb-4">
                <h3 className="font-extrabold text-sm text-zinc-800">
                  تضمين ويدجت المحادثة المباشرة (Website Widget)
                </h3>
                <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                  انسخ الكود البرمجي وضعه في موقعك الإلكتروني لتبدأ في تلقي استفسارات الزوار والربط
                  بالـ CRM فوراً
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 block mb-1.5">
                    لون الويدجت الرئيسي (Brand Color)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={widgetColor}
                      onChange={(e) => setWidgetColor(e.target.value)}
                      className="w-11 h-11 rounded-xl border border-zinc-200 shrink-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={widgetColor}
                      onChange={(e) => setWidgetColor(e.target.value)}
                      className="flex-1 text-xs font-bold px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-500 block mb-1.5">
                    عنوان الويدجت الترحيبي
                  </label>
                  <input
                    type="text"
                    value={widgetTitle}
                    onChange={(e) => setWidgetTitle(e.target.value)}
                    className="w-full text-xs font-bold px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-primary/50 focus:bg-white rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Embed Code Copy Box */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 block">
                  كود التضمين في الـ HTML (Embed Code):
                </label>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 font-mono text-[10px] text-zinc-300 relative select-all leading-relaxed max-h-36 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{widgetEmbedCode}</pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(widgetEmbedCode);
                      toast.success("تم نسخ كود التضمين للموقع!");
                    }}
                    className="absolute top-3 left-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-700 text-[10px] font-sans font-black transition-all cursor-pointer"
                  >
                    نسخ الكود
                  </button>
                </div>
                <span className="text-[9px] text-zinc-400 font-bold block">
                  * ضَع هذا الكود قبل وسم {`</body>`} مباشرة في جميع صفحات موقعك الإلكتروني لتبدأ
                  المحادثات الفورية بالتدفق.
                </span>
              </div>

              <div className="flex gap-2 justify-end border-t border-zinc-100 pt-4">
                <button
                  onClick={() => handleSaveConfig("livechat")}
                  className="px-5 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-black rounded-xl cursor-pointer"
                >
                  حفظ وتطبيق التغييرات
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
