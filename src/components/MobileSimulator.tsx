import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, Bell, Send, Users, FileText, Check, CheckCheck, 
  Settings as SettingsIcon, MessageSquare, Phone, MoreVertical, 
  MapPin, DollarSign, Calendar, Sliders, Play, Info, ArrowLeft, Plus, Trash2, Globe
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from '../lib/firebase';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from 'sonner';

// Mock initial data
const INITIAL_CHATS = [
  {
    id: 1,
    name: "مروان الغامدي",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop",
    lastMessage: "هل تم تأكيد مسير الرواتب لشهر مايو؟",
    time: "10:30",
    unread: 2,
    phone: "+966 50 123 4567",
    messages: [
      { id: 1, text: "مرحباً بكم، أود الاستفسار عن كشف الحساب", sender: "client", time: "09:12" },
      { id: 2, text: "أهلاً مروان، كشف الحساب جاهز في لوحة معلوماتك", sender: "system", time: "09:15" },
      { id: 3, text: "هل تم تأكيد مسير الرواتب لشهر مايو؟", sender: "client", time: "10:30" }
    ]
  },
  {
    id: 2,
    name: "سارة المالكي",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop",
    lastMessage: "تم تحويل قيمة الفاتورة الضريبية رقم #1024",
    time: "أمس",
    unread: 0,
    phone: "+966 54 987 6543",
    messages: [
      { id: 1, text: "يرجى مراجعة تفاصيل الشحن والشهادة الصحية", sender: "system", time: "أمس" },
      { id: 2, text: "تم تحويل قيمة الفاتورة الضريبية رقم #1024", sender: "client", time: "أمس" }
    ]
  },
  {
    id: 3,
    name: "شركة اليمامة للمقاولات",
    avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop",
    lastMessage: "نحتاج تفعيل الدفع عبر آبل باي لتسهيل التحصيل",
    time: "24/05",
    unread: 0,
    phone: "+966 56 111 2222",
    messages: [
      { id: 1, text: "نحتاج تفعيل الدفع عبر آبل باي لتسهيل التحصيل", sender: "client", time: "24/05" }
    ]
  }
];

const INITIAL_CLIENTS = [
  { id: 1, name: "ماجد بن خالد", company: "مؤسسة النور والظلال", phone: "+966 55 532 9911", email: "majed@alnoor.sa", area: "الرياض، الملز", balance: "18,400 ر.س" },
  { id: 2, name: "ليلى حسن", company: "حلول البريد السريع", phone: "+966 50 321 4455", email: "laila@fastpost.sa", area: "جدة، الحمراء", balance: "3,120 ر.س" },
  { id: 3, name: "عبدالرحمن الشمري", company: "مكتب آفاق التطوير", phone: "+966 53 777 8899", email: "shammari@dh.com", area: "الدمام، الكورنيش", balance: "0 ر.س" },
];

export default function MobileSimulator() {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  
  // States
  const [deviceOS, setDeviceOS] = useState<'ios' | 'android'>('ios');
  const [activeScreen, setActiveScreen] = useState<'inbox' | 'crm' | 'invoice' | 'config'>('inbox');
  const [mobileLang, setMobileLang] = useState<'ar' | 'en' | 'fr'>('ar');
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [pushNotification, setPushNotification] = useState<{title: string, body: string, time: string} | null>(null);
  const [pushAlertQueue, setPushAlertQueue] = useState<string[]>([]);
  
  // Invoicing states
  const [invClient, setInvClient] = useState('');
  const [invItem, setInvItem] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [simulatedInvoices, setSimulatedInvoices] = useState<any[]>([]);
  
  // Custom alerts controller
  const [customPushTitle, setCustomPushTitle] = useState('محاولة دخول جديدة 🔒');
  const [customPushBody, setCustomPushBody] = useState('تم رصد تسجيل دخول لحسابك من متصفح سفاري - لندن');
  
  // Ref for messages auto scroll
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChatId, chats]);

  // Sync automatic device language selection with the global operating system language
  useEffect(() => {
    if (settings?.language && (settings.language === 'ar' || settings.language === 'en' || settings.language === 'fr')) {
      setMobileLang(settings.language as any);
    }
  }, [settings?.language]);

  // Handle custom text localization
  useEffect(() => {
    if (mobileLang === 'ar') {
      setCustomPushTitle('محاولة دخول جديدة 🔒');
      setCustomPushBody('تم رصد تسجيل دخول لحسابك من متصفح سفاري - لندن');
    } else {
      setCustomPushTitle('New Login Attempt 🔒');
      setCustomPushBody('A login was detected from Safari browser on your accountant account.');
    }
  }, [mobileLang]);

  // Handle mobile messaging reply
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || selectedChatId === null) return;

    const newMessage = {
      id: Date.now(),
      text: replyText,
      sender: 'system',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === selectedChatId) {
        return {
          ...chat,
          lastMessage: replyText,
          time: "الآن",
          messages: [...chat.messages, newMessage]
        };
      }
      return chat;
    }));

    const currentChat = chats.find(c => c.id === selectedChatId);
    setReplyText('');

    // Simulated Auto Responder delay
    setTimeout(() => {
      const responseMessage = {
        id: Date.now() + 1,
        text: currentChat?.id === 1 
          ? "رائع جداً! شكراً لسرعة استجابتكم عبر مدارج." 
          : "شكراً لتأكيد الطلب واستخدامكم بوابات الدفع المباشر لدينا.",
        sender: 'client',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats(p => p.map(c => {
        if (c.id === selectedChatId) {
          return {
            ...c,
            lastMessage: responseMessage.text,
            messages: [...c.messages, responseMessage]
          };
        }
        return c;
      }));

      // Fire a push notification for this automatic client response!
      triggerNotification("رسالة جديدة من " + (currentChat?.name || "العميل"), responseMessage.text);
    }, 2000);
  };

  // Trigger push notification inside simulator
  const triggerNotification = (title: string, body: string) => {
    setPushNotification({
      title,
      body,
      time: "الآن"
    });
    // Add to audit trail log
    setPushAlertQueue(prev => [ `${new Date().toLocaleTimeString()}: [Push] ${title} - ${body}`, ...prev]);
    
    // Play subtle audio confirmation
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.frequency.setValueAtTime(587.33, context.currentTime); // D5
      gain.gain.setValueAtTime(0.1, context.currentTime);
      osc.start();
      osc.stop(context.currentTime + 0.15);
    } catch (e) {
      console.log("Audio not supported / user interaction required for prompt chime");
    }

    // Dismiss notification from top screen after 4 seconds
    setTimeout(() => {
      setPushNotification(prev => prev?.title === title ? null : prev);
    }, 5000);
  };

  // Add mobile simulated Invoice
  const handleCreateMobileInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invClient || !invItem || !invAmount) return;

    const newInv = {
      id: Date.now(),
      clientName: invClient,
      item: invItem,
      amount: parseFloat(invAmount).toLocaleString('sa-Ar', { style: 'currency', currency: 'SAR' }),
      date: new Date().toLocaleDateString('en-US'),
      number: `MINV-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setSimulatedInvoices(p => [newInv, ...p]);
    setInvClient('');
    setInvItem('');
    setInvAmount('');

    triggerNotification("🧾 تم إنشاء الفاتورة المصغرة", `فاتورة جديدة للعميل ${newInv.clientName} بمبلغ ${newInv.amount}`);
  };

  const selectedChat = chats.find(c => c.id === selectedChatId);

  // Localization translator inside device
  const deviceTranslations: Record<string, Record<string, string>> = {
    ar: {
      inboxTitle: "صندوق الرسائل الموحد",
      crmTitle: "إدارة علاقات العملاء",
      invoiceTitle: "إصدار فاتورة سريعة",
      settingsTitle: "الأجهزة والتحكم",
      whatsappSub: "الربط الفوري لقناة الواتساب والدعم",
      emptyDesc: "لا توجد رسائل جديدة",
      clientsCount: "إجمالي العملاء الموثقين",
      addBtn: "إصدار فوري متوافق مع ZATCA",
      clientFieldName: "اسم الشريك / العميل",
      itemLabel: "الخدمة / التوريد",
      priceLabel: "القيمة الإجمالية شاملة الضريبة (ر.س)",
      statusOnline: "نشط ومتصل بالخادم",
      placeholderSearch: "بحث بأسماء الشركاء...",
      sendPlaceholder: "اكتب ردك هنا...",
      notifTitle: "منصة إدارة الإشعارات الفورية (Push Alerts)",
      notifDesc: "قم بصياغة وإطلاق إشعارات فورية تجريبية للتحقق من مظهر الإشعارات وتنبيهات الأمان على أجهزة الموظفين والإداريين.",
      notifInputTitle: "عنوان التنبيه",
      notifInputBody: "محتوى رسالة الدفع (Push Note)",
      notifSendNow: "إرسال التنبيه الفوري",
      notifEmergency: "تنبيه أمني عاجل",
      langSelectTitle: "لغة نظام محاكي الجوال",
      langSelectDesc: "اختر لغة محاكاة نظام الجوال لتعديل كامل النصوص والاتجاهات.",
      loggerTitle: "سجل إرسال الإشعارات والتحقق",
      loggerWaiting: "بانتظار إطلاق أول إشعار للتجربة...",
      statusLive: "حي ومباشر",
      backBtn: "رجوع",
      blueprintTitle: "📋 الميزات الجوهرية للنسخة الأصلية (iOS / Android)",
      blueprintSub: "كيف يتم تطويع عتاد وتطوير الجوال محلياً لتوفير مبيعات واتساب وإشراف متكامل:",
      blueprintHubTitle: "💬 منصة مبيعات WhatsApp Hub",
      blueprintHubDesc: "تلقي رسائل المبيعات والدعم فوراً، والرد عليها بواسطة قوالب سريعة مبرمجة لعملاء الخليج (موافقة مع متطلبات هيئة الاتصالات والفواتير المباشرة بنقرة واحدة كملفات PDF متكاملة).",
      blueprintDashTitle: "📊 لوحة متابعة ومراقبة فورية للرواتب والامتثال",
      blueprintDashDesc: "كشف تتبع فوري لمعدلات التوطين بنظام نطاقات، حالة مسيرات الرواتب بوزارة الموارد البشرية ومستحقات الموردين وتواريخ الرواتب WPS.",
      blueprintSecureTitle: "🔒 أمان ودعم بخصائص عتاد الجوال",
      blueprintSecureDesc: "الامتثال الكامل لتشريعات حماية البيانات الشخصية لوائح نظام PDPL عبر FaceID وبصمات الأصابع محلياً، وميزة العمل دون اتصال بالإنترنت ومزامنة البيانات SQLite.",
      connectedSuccess: "تم تنشيط المحاكي بنجاح",
    },
    en: {
      inboxTitle: "Unified Mobile Inbox",
      crmTitle: "Mobile CRM Direct",
      invoiceTitle: "Fast Invoice Creator",
      settingsTitle: "Device Configuration",
      whatsappSub: "Live WhatsApp & Support integration",
      emptyDesc: "No outstanding messages",
      clientsCount: "Total verified clients",
      addBtn: "Generate ZATCA-Compliant Invoice",
      clientFieldName: "Client Name / Partner",
      itemLabel: "Description of Service",
      priceLabel: "Total value inc VAT (SAR)",
      statusOnline: "Online & connected",
      placeholderSearch: "Search partners...",
      sendPlaceholder: "Type your reply here...",
      notifTitle: "Unified Push Alerts Hub",
      notifDesc: "Draft and dispatch simulated push alerts to verify live security notifications on native companion devices.",
      notifInputTitle: "Alert Title",
      notifInputBody: "Push Message Body",
      notifSendNow: "Send Push Notification",
      notifEmergency: "Emergency Security Alert",
      langSelectTitle: "Simulator Device UI Language",
      langSelectDesc: "Choose default language inside your simulated device to update directions and text strings.",
      loggerTitle: "System Logs & Push Events Delivery Queue",
      loggerWaiting: "Awaiting first test alert event...",
      statusLive: "LIVE",
      backBtn: "Back",
      blueprintTitle: "📋 Native App Features Spec & Companion Blueprint (iOS & Android)",
      blueprintSub: "Replicating Mudarij OS core functionalities on native mobile companion clients:",
      blueprintHubTitle: "💬 WhatsApp Sales Hub Integration",
      blueprintHubDesc: "Allows on-the-go agents to view integrated chat histories, receive push client messages, use customized GCC templates, and dispatch fully ZATCA-compliant PDF invoices in 1-click.",
      blueprintDashTitle: "📊 Multi-KPI Dashboard on the Go",
      blueprintDashDesc: "Track real-time Saudi Nitaqat localization statuses, view pending invoices, monitor supplier shipments, and receive countdown warnings for WPS payroll deadlines to avoid lockouts.",
      blueprintSecureTitle: "🔒 Native Security & Biometric FaceID",
      blueprintSecureDesc: "Fully compliant with local PDPL policies utilizing hardware biometric MFA (Apple FaceID / Android Biometrics) with offline cache storage logic via unified SQLite engines.",
      connectedSuccess: "Simulator successfully initialized",
    },
    fr: {
      inboxTitle: "Boîte de Réception Mobile",
      crmTitle: "Relations Clients (CRM)",
      invoiceTitle: "Créateur Facture Express",
      settingsTitle: "Configuration Mobile",
      whatsappSub: "Intégration WhatsApp & Support",
      emptyDesc: "Aucun nouveau message",
      clientsCount: "Total des clients vérifiés",
      addBtn: "Générer la facture",
      clientFieldName: "Nom du client / Partenaire",
      itemLabel: "Service ou Produit",
      priceLabel: "Montant total TTC (SAR)",
      statusOnline: "Connecté au serveur Mudarij",
      placeholderSearch: "Rechercher un partenaire...",
      sendPlaceholder: "Écrivez votre réponse...",
      notifTitle: "Centre de Notifications Push",
      notifDesc: "Rédigez et envoyez des alertes push test pour vérifier les notifications de sécurité.",
      notifInputTitle: "Titre de l'alerte",
      notifInputBody: "Contenu du message push",
      notifSendNow: "Envoyer l'alerte",
      notifEmergency: "Alerte de sécurité d'urgence",
      langSelectTitle: "Sélecteur de langue de l'appareil",
      langSelectDesc: "Changez l'affichage et l'orientation des menus de l'appareil simulé.",
      loggerTitle: "Séquence des Alertes & Événements Système Logs",
      loggerWaiting: "En attente du premier lancement...",
      statusLive: "DIRECT",
      backBtn: "Retour",
      blueprintTitle: "📋 Renseignements techniques de l'application native (iOS/Android)",
      blueprintSub: "Spécifications de la plateforme mobile native:",
      blueprintHubTitle: "💬 Sales Hub WhatsApp intégré",
      blueprintHubDesc: "Suivi des opportunités, synchronisation des chats et émission instantanée de documents approuvés.",
      blueprintDashTitle: "📊 Tableau de Bord Intuitif Mobile",
      blueprintDashDesc: "Suivi immédiat des scores d'emploi locaux, conformité WPS et obligations fiscales.",
      blueprintSecureTitle: "🔒 Sécurité Biométrique Forte FaceID",
      blueprintSecureDesc: "Authentification via la reconnaissance faciale de l'appareil, stockage local résilient en mode hors connexion.",
      connectedSuccess: "Simulateur configuré avec succès",
    }
  };

  const dt = deviceTranslations[mobileLang];

  return (
    <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-200 shadow-sm" dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Top Banner & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-200">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            <Smartphone className="w-7 h-7 text-indigo-500 hover:rotate-12 transition-transform duration-300" />
            {t("settings.mobile.title", "تطبيق الأجهزة الذكية والتحكم الموحد")}
          </h2>
          <p className="text-xs text-zinc-500 mt-1 font-medium italic">
            {t("settings.mobile.subtitle", "محاكاة فورية للبيئة المحمولة بنظام iOS و Android للاتصال بالعملاء وخدمة الدعم مباشرة.")}
          </p>
        </div>
        
        {/* Physical OS Toggle controls */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-zinc-200 shadow-sm">
          <button 
            type="button" 
            onClick={() => {
              setDeviceOS('ios');
              toast.success(settings.language === 'ar' ? 'تم تفعيل واجهة iOS بنجاح' : 'Apple iOS UI mode active');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${deviceOS === 'ios' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
          >
            Apple iOS
          </button>
          <button 
            type="button" 
            onClick={() => {
              setDeviceOS('android');
              toast.success(settings.language === 'ar' ? 'تم تفعيل واجهة Google Android' : 'Google Android UI mode active');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${deviceOS === 'android' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
          >
            Google Android
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE CONTROL PANEL & PUSH INJECTOR */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Notification Launcher */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-500" />
              {dt.notifTitle}
            </h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
              {dt.notifDesc}
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">{dt.notifInputTitle}</label>
                <input 
                  type="text"
                  value={customPushTitle}
                  onChange={(e) => setCustomPushTitle(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500/30 text-right rtl:text-right ltr:text-left"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">{dt.notifInputBody}</label>
                <textarea 
                  rows={2}
                  value={customPushBody}
                  onChange={(e) => setCustomPushBody(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium outline-none resize-none focus:ring-1 focus:ring-indigo-500/30 text-right rtl:text-right ltr:text-left"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => triggerNotification(customPushTitle, customPushBody)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  {dt.notifSendNow}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (mobileLang === 'ar') {
                      triggerNotification("🚨 محاولة احتيال محتملة", "تم حظر محاولة دفع مشبوهة بمبلغ 5,000 ر.س من متصفح غير مدعوم.");
                    } else {
                      triggerNotification("🚨 Potential Fraud Blocked", "Suspicious payment attempt of 5,000 SAR has been blocked from an untrusted source.");
                    }
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                >
                  {dt.notifEmergency}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Demo Tasks inside App Panel */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-3">
            <h4 className="font-bold text-xs text-zinc-950 uppercase tracking-wide">{dt.langSelectTitle}</h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'ar', label: 'العربية (RTL)' },
                { code: 'en', label: 'English (LTR)' },
                { code: 'fr', label: 'Français (LTR)' }
              ].map(lg => (
                <button
                  key={lg.code}
                  type="button"
                  onClick={() => {
                    setMobileLang(lg.code as any);
                    toast.success(lg.code === 'ar' ? 'تم تبديل لغة صندوق الإيعاز' : 'Device viewport switch done');
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all ${mobileLang === lg.code ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 text-zinc-600 bg-white hover:bg-zinc-50'}`}
                >
                  {lg.label}
                </button>
              ))}
            </div>
            
            <p className="text-[10px] text-zinc-400 mt-2">
              {dt.langSelectDesc}
            </p>
          </div>

          {/* Simulated Alerts Log Queue */}
          <div className="bg-zinc-900 text-zinc-100 p-4 rounded-2xl border border-zinc-800 shadow-inner font-mono text-[10px] space-y-2 h-44 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 font-sans">
              <span className="text-zinc-400 font-mono text-[10px]">{dt.loggerTitle}</span>
              <span className="text-emerald-400">● {dt.statusLive}</span>
            </div>
            {pushAlertQueue.length === 0 ? (
              <p className="text-zinc-500 italic">{dt.loggerWaiting}</p>
            ) : (
              pushAlertQueue.map((log, idx) => (
                <div key={idx} className="leading-tight py-0.5 border-b border-zinc-800/40 text-left ltr:text-left rtl:text-right">
                  {log}
                </div>
              ))
            )}
          </div>

          {/* Native Mobile App specs and design outline blueprint */}
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-900/30 shadow-md space-y-4">
            <div>
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                Companion Blueprint
              </span>
              <h3 className="font-black text-sm mt-1.5 text-zinc-100 flex items-center gap-2">
                {dt.blueprintTitle}
              </h3>
              <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                {dt.blueprintSub}
              </p>
            </div>

            <div className="space-y-3.5 pt-2 text-right rtl:text-right ltr:text-left">
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                  {dt.blueprintHubTitle}
                </h4>
                <p className="text-[10px] text-zinc-300 leading-relaxed font-semibold">
                  {dt.blueprintHubDesc}
                </p>
              </div>

              <div className="space-y-1 border-t border-white/10 pt-2.5">
                <h4 className="font-bold text-xs text-sky-300 flex items-center gap-1.5">
                  {dt.blueprintDashTitle}
                </h4>
                <p className="text-[10px] text-zinc-300 leading-relaxed font-semibold">
                  {dt.blueprintDashDesc}
                </p>
              </div>

              <div className="space-y-1 border-t border-white/10 pt-2.5">
                <h4 className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                  {dt.blueprintSecureTitle}
                </h4>
                <p className="text-[10px] text-zinc-300 leading-relaxed font-semibold">
                  {dt.blueprintSecureDesc}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: HIGH-FIDELITY SMARTPHONE SIMULATOR EMULATOR */}
        <div className="lg:col-span-7 flex justify-center items-center">
          
          {/* Smartphone Bezel Body Wrapper */}
          <div className="relative w-[340px] h-[670px] bg-zinc-950 rounded-[50px] p-3.5 shadow-2xl border-4 border-zinc-800 overflow-hidden ring-12 ring-zinc-900/10 scale-[0.98]">
            
            {/* Camera Area (Dynamic Island or Notch) */}
            {deviceOS === 'ios' ? (
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 flex items-center justify-center pointer-events-none">
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-900/50 absolute left-3" />
                <div className="w-2 h-2 rounded-full bg-zinc-900/50 absolute left-8" />
              </div>
            ) : (
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900 rounded-full z-50 pointer-events-none" />
            )}

            {/* Simulated Live Notch Push Notification Slide Down Alert Container */}
            <AnimatePresence>
              {pushNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -80, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -80, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="absolute top-4 left-4 right-4 bg-zinc-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl z-50 shadow-xl border border-zinc-800/80 pointer-events-auto flex items-start gap-2.5"
                  dir={mobileLang === 'ar' ? 'rtl' : 'ltr'}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center text-sm shrink-0">
                    🔔
                  </div>
                  <div className="flex-1 space-y-0.5 text-right">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-zinc-100">{pushNotification.title}</h4>
                      <span className="text-[8px] text-zinc-400">{pushNotification.time}</span>
                    </div>
                    <p className="text-[10px] text-zinc-300 font-medium leading-relaxed">{pushNotification.body}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHYSICAL INTERNALS OF THE SCREEN */}
            <div 
              className="w-full h-full bg-zinc-100 rounded-[40px] overflow-hidden flex flex-col relative"
              dir={mobileLang === 'ar' ? 'rtl' : 'ltr'}
            >
              
              {/* Device Status Bar */}
              <div className="h-10 pt-4 px-6 flex justify-between items-center text-zinc-800 text-[10px] font-bold shrink-0 bg-white">
                <span>09:41 AM</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span>5G</span>
                  <span>📶</span>
                  <span>98% 🔋</span>
                </div>
              </div>

              {/* Dynamic Header Component on Mobile */}
              <header className="bg-white border-b border-zinc-200 p-4 shrink-0 shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{dt.statusOnline}</span>
                  </div>
                  <h3 className="font-black text-sm text-zinc-900">{dt.inboxTitle}</h3>
                </div>
                <div className="w-7 h-7 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center text-xs shrink-0 cursor-pointer">
                  📬
                </div>
              </header>

              {/* ACTIVE MOBILE SCREENS */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                
                {/* 1. WHATSAPP/MESSAGE INBOX TAB */}
                {activeScreen === 'inbox' && (
                  <div className="space-y-3">
                    {selectedChatId === null ? (
                      <>
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-2xl border border-emerald-100 flex items-center gap-2.5">
                          <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div className="text-right">
                            <p className="text-[10px] font-black text-emerald-950">{dt.whatsappSub}</p>
                            <p className="text-[8px] text-emerald-800 mt-0.5">رسائل WhatsApp فورية متصلة تلقائياً</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {chats.map(chat => (
                            <div 
                              key={chat.id}
                              onClick={() => setSelectedChatId(chat.id)}
                              className="bg-white p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 transition-all cursor-pointer flex items-center justify-between gap-2 shadow-xs group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img src={chat.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-zinc-200 shrink-0" />
                                <div className="text-right min-w-0">
                                  <h4 className="font-bold text-xs text-zinc-900 group-hover:text-amber-600 transition-colors">{chat.name}</h4>
                                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{chat.lastMessage}</p>
                                </div>
                              </div>
                              <div className="shrink-0 text-left flex flex-col items-end gap-1.5">
                                <span className="text-[8px] text-zinc-400 font-bold">{chat.time}</span>
                                {chat.unread > 0 ? (
                                  <span className="w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                                    {chat.unread}
                                  </span>
                                ) : (
                                  <CheckCheck className="w-3.5 h-3.5 text-zinc-300" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      /* Expanded Chat Conversation View */
                      <div className="flex flex-col h-full bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden -mx-1">
                        
                        {/* Chat Header */}
                        <div className="bg-zinc-50 px-3 py-2 border-b border-zinc-200 flex items-center justify-between">
                          <button 
                            type="button"
                            onClick={() => setSelectedChatId(null)}
                            className="text-xs font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                          >
                            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                            رجوع
                          </button>
                          <div className="flex items-center gap-2 text-right">
                            <img src={selectedChat?.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                            <div>
                              <h4 className="font-bold text-[11px] text-zinc-900Leading-none">{selectedChat?.name}</h4>
                              <p className="text-[8px] text-zinc-500 font-mono">{selectedChat?.phone}</p>
                            </div>
                          </div>
                          <Phone className="w-4 h-4 text-zinc-400" />
                        </div>

                        {/* Message Stream */}
                        <div className="flex-1 min-h-[220px] p-2.5 overflow-y-auto bg-zinc-50 space-y-2 flex flex-col justify-end">
                          {selectedChat?.messages.map((msg, i) => (
                            <div 
                              key={msg.id || i}
                              className={`max-w-[80%] rounded-[14px] p-2 text-[10px] leading-relaxed relative ${
                                msg.sender === 'system' 
                                  ? 'bg-zinc-900 text-white self-start' 
                                  : 'bg-white border border-zinc-200 text-zinc-800 self-end'
                              }`}
                            >
                              <p>{msg.text}</p>
                              <span className="text-[7px] text-zinc-400 block mt-1 text-left">{msg.time}</span>
                            </div>
                          ))}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Input Box */}
                        <form onSubmit={handleSendMessage} className="p-2 bg-white border-t border-zinc-200 flex gap-1.5">
                          <input 
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={dt.sendPlaceholder}
                            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[10px] outline-none focus:ring-1 focus:ring-zinc-800"
                          />
                          <button 
                            type="submit"
                            className="w-7 h-7 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg flex items-center justify-center shrink-0"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>

                      </div>
                    )}
                  </div>
                )}

                {/* 2. MOBILE CRM TAB */}
                {activeScreen === 'crm' && (
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-xl border border-zinc-200">
                      <h4 className="font-bold text-[11px] text-zinc-600 mb-2">{dt.clientsCount}</h4>
                      <p className="text-2xl font-black text-indigo-600">{clients.length}</p>
                    </div>

                    <div className="space-y-2">
                      {clients.map(cl => (
                        <div key={cl.id} className="bg-white p-3 rounded-xl border border-zinc-100 flex flex-col gap-2.5 shadow-xs text-right">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-bold text-xs text-zinc-900">{cl.name}</h5>
                              <p className="text-[9px] text-zinc-500 font-bold">{cl.company}</p>
                            </div>
                            <span className="bg-zinc-100 text-zinc-800 text-[8px] font-bold px-1.5 py-0.5 rounded">
                              {cl.balance}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[9px] text-zinc-500 font-mono">
                            <span className="flex items-center gap-1">📍 {cl.area}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-1 px-1 border-t border-zinc-50 pt-2">
                            <a 
                              href={`tel:${cl.phone}`} 
                              onClick={(e) => { e.preventDefault(); triggerNotification("اتصال صادر 📞", `جاري الاتصال بـ ${cl.name}...`); }}
                              className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[9px] font-bold py-1.5 rounded-lg text-center flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Phone className="w-3 h-3" />
                              اتصال هاتفي
                            </a>
                            <button 
                              type="button" 
                              onClick={() => {
                                setSelectedChatId(3); // open Yamama or active support thread
                                setActiveScreen('inbox');
                              }}
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[9px] font-bold py-1.5 rounded-lg text-center flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" />
                              دردشة فورية
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. MOBILE INVOICE TAB */}
                {activeScreen === 'invoice' && (
                  <div className="space-y-3">
                    <div className="bg-white p-3.5 rounded-xl border border-zinc-200">
                      <h4 className="font-black text-xs text-zinc-950 mb-3">{dt.invoiceTitle}</h4>
                      
                      <form onSubmit={handleCreateMobileInvoice} className="space-y-2.5">
                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 block mb-0.5">{dt.clientFieldName}</label>
                          <select 
                            value={invClient}
                            onChange={(e) => setInvClient(e.target.value)}
                            required
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[10px] outline-none"
                          >
                            <option value="">-- كافي الشركاء --</option>
                            {clients.map(c => (
                              <option key={c.id} value={c.name}>{c.name} ({c.company})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 block mb-0.5">{dt.itemLabel}</label>
                          <input 
                            type="text"
                            value={invItem}
                            onChange={(e) => setInvItem(e.target.value)}
                            placeholder="استشارات، توريد بضائع..."
                            required
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[10px] outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 block mb-0.5">{dt.priceLabel}</label>
                          <input 
                            type="number"
                            value={invAmount}
                            onChange={(e) => setInvAmount(e.target.value)}
                            placeholder="1500"
                            required
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[10px] outline-none"
                          />
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-zinc-950 text-white font-bold py-2 px-3 rounded-lg text-[9px] transition-all hover:bg-zinc-800"
                        >
                          {dt.addBtn}
                        </button>
                      </form>
                    </div>

                    {/* Historical mini invoices */}
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-bold text-zinc-500 uppercase">الفواتير المنشأة الجاهزة</h5>
                      {simulatedInvoices.length === 0 ? (
                        <p className="text-[9px] text-zinc-400 italic text-center">لم تصدر فواتير جوال بعد.</p>
                      ) : (
                        simulatedInvoices.map(inv => (
                          <div key={inv.id} className="bg-white p-2.5 rounded-lg border border-zinc-100 flex items-center justify-between shadow-xxs">
                            <div>
                              <p className="text-[9px] font-bold text-zinc-900 leading-none">{inv.clientName}</p>
                              <p className="text-[7px] text-zinc-400 font-mono mt-0.5">{inv.number} • {inv.item}</p>
                            </div>
                            <span className="text-[9px] font-black text-emerald-600">{inv.amount}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 4. MOBILE CONFIG/SETTINGS */}
                {activeScreen === 'config' && (
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-xl border border-zinc-200 space-y-3">
                      <h4 className="font-bold text-xs text-zinc-900">{dt.settingsTitle}</h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg">
                          <div>
                            <p className="text-[10px] font-bold text-zinc-900">سماح بـ Push Notifications</p>
                            <p className="text-[8px] text-zinc-500">استلام تنبيهات الأمان والدخول</p>
                          </div>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg">
                          <div>
                            <p className="text-[10px] font-bold text-zinc-900">تنبيهات Unusual Logins</p>
                            <p className="text-[8px] text-zinc-500">إشعار عند تسجيل الدخول من جهاز غير معتمد</p>
                          </div>
                          <span className="text-[10px] font-bold text-primary">نشط</span>
                        </div>
                      </div>

                      <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200 text-amber-900 text-[8px] leading-relaxed">
                        ⚠️ <strong>حماية إدارية:</strong> تطبيق الجوال متصل برصد الأخطاء الفوري للمواقع (trusted IP) ومزود ببصمة الوجه لتفويض المعاملات.
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Navigation Bar */}
              <div className="h-16 border-t border-zinc-200 bg-white grid grid-cols-4 shrink-0 px-2">
                {[
                  { id: 'inbox', label: 'الرسائل', icon: MessageSquare },
                  { id: 'crm', label: 'العملاء', icon: Users },
                  { id: 'invoice', label: 'الفواتير', icon: FileText },
                  { id: 'config', label: 'الإعدادات', icon: SettingsIcon },
                ].map(navBtn => (
                  <button
                    key={navBtn.id}
                    type="button"
                    onClick={() => {
                      setActiveScreen(navBtn.id as any);
                      if (navBtn.id !== 'inbox') setSelectedChatId(null);
                    }}
                    className={`flex flex-col items-center justify-center gap-1 transition-all ${activeScreen === navBtn.id ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-650'}`}
                  >
                    <navBtn.icon className="w-4.5 h-4.5" />
                    <span className="text-[8px] font-bold">{navBtn.label}</span>
                  </button>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
