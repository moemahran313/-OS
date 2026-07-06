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
  const [waToken, setWaToken] = useState("wa_token_prod_908234723487_secured");
  const [tgBotToken, setTgBotToken] = useState("7234982342:AAHG83478dksfhsdkfjsdhf8");
  const [tgBotUsername, setTgBotUsername] = useState("MadarijOS_Support_Bot");
  const [smtpServer, setSmtpServer] = useState("smtp.madarij-os.com");
  const [smtpUser, setSmtpUser] = useState("support@madarij-os.com");
  const [smsSid, setSmsSid] = useState("AC738923472348cdef89234");
  const [widgetColor, setWidgetColor] = useState("#0f9b7e");
  const [widgetTitle, setWidgetTitle] = useState("الدعم الفوري - مدارج OS");

  const [isTesting, setIsTesting] = useState(false);

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
                  <h3 className="font-extrabold text-sm text-zinc-800">
                    إعدادات ربط WhatsApp Cloud API
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                    اربط رقم شركتك الرسمي لإرسال واستلام محادثات واتساب بخصوصية تامة
                  </p>
                </div>
                <div className="px-2.5 py-1 text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span>متصل بالخادم الرسمي</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 block mb-1.5">
                    رقم هاتف الواتساب الموثّق
                  </label>
                  <input
                    type="text"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    className="w-full text-xs font-bold px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-primary/50 focus:bg-white rounded-xl focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-500 block mb-1.5">
                    رمز توثيق الوصول (Access Token)
                  </label>
                  <input
                    type="password"
                    value={waToken}
                    onChange={(e) => setWaToken(e.target.value)}
                    className="w-full text-xs font-bold px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-primary/50 focus:bg-white rounded-xl focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* QR connection simulator */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
                <div className="p-3 bg-white rounded-xl border border-zinc-200 shrink-0 shadow-sm">
                  <QrCode className="w-24 h-24 text-zinc-800" />
                </div>
                <div className="space-y-1 text-center md:text-right">
                  <h4 className="text-xs font-black text-zinc-800">
                    امسح رمز الاستجابة السريعة (QR Code) لربط الجهاز
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">
                    افتح تطبيق الواتساب بهاتفك {`->`} الأجهزة المرتبطة {`->`} ربط جهاز، ومسح الرمز
                    الموضّح أعلاه لربط تطبيق الويب مباشرة دون توقف.
                  </p>
                  <button
                    onClick={() => toast.success("تم تحديث رمز QR لربط واتساب")}
                    className="mt-2 text-[10px] font-black text-primary hover:underline"
                  >
                    تحديث رمز QR التوثيقي
                  </button>
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-zinc-100 pt-4">
                <button
                  onClick={() => handleDisconnect("whatsapp")}
                  className="px-4 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  قطع الاتصال
                </button>
                <button
                  onClick={() => handleTestConnection("whatsapp")}
                  disabled={isTesting}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 text-xs font-bold rounded-xl border border-zinc-200 hover:bg-zinc-200 cursor-pointer"
                >
                  {isTesting ? "جاري الفحص..." : "اختبار الاتصال"}
                </button>
                <button
                  onClick={() => handleSaveConfig("whatsapp")}
                  className="px-5 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-black rounded-xl cursor-pointer"
                >
                  حفظ الإعدادات والتنشيط
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

              <div className="bg-sky-50 border border-sky-100 text-sky-800 p-4 rounded-2xl text-xs font-bold space-y-2">
                <h4 className="flex items-center gap-1.5 font-black text-sky-900">
                  <Bot className="w-4 h-4" /> تعليمات الحصول على Token:
                </h4>
                <p className="leading-relaxed">
                  1. افتح تطبيق تيليجرام وابحث عن حساب{" "}
                  <span className="font-black">@BotFather</span>.<br />
                  2. أرسل الأمر <span className="font-black">/newbot</span> واتبع الخطوات لتسمية
                  البوت.
                  <br />
                  3. الصق رمز الـ HTTP API (Token) الموفر في الحقل أعلاه، واحفظ الإعدادات!
                </p>
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
