const fs = require('fs');
const enPath = 'src/locales/en/translation.json';
const arPath = 'src/locales/ar/translation.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

en.sidebar.accounting = "General Ledger & Accounting";
ar.sidebar.accounting = "دفتر الأستاذ والقيود";

en.sidebar.inventory = "Inventory & Warehouses";
ar.sidebar.inventory = "المخزون والمستودعات";

en.sidebar.compliance = "Compliance & Security";
ar.sidebar.compliance = "الامتثال والأمان المتقدم";

en.sidebar.negotiations = "Smart Negotiations";
ar.sidebar.negotiations = "التفاوض والاجتماعات";

en.layout = {
  voice_tooltip: "Talk to Mudarij",
  select_dialect: "Select Dialect",
  voice_placeholder_listening: "Listening...",
  voice_placeholder: "Ask Mudarij... (e.g. 'Create invoice' or 'Calculate payroll')",
  ai_assistant: "Mudarij AI Assistant",
  notifications: "System Alerts",
  new: "New",
  no_notifications: "No urgent alerts",
  email: "Email",
  profile: "Profile",
  preferences: "Preferences",
  logout: "Logout"
};

ar.layout = {
  voice_tooltip: "تحدث مع مدارج",
  select_dialect: "اختر اللهجة",
  voice_placeholder_listening: "جاري الاستماع...",
  voice_placeholder: "اسأل مدارج... (مثلاً: 'انشئ فاتورة' أو 'احسب الرواتب')",
  ai_assistant: "مساعد مدارج الذكي",
  notifications: "التنبيهات الإدارية",
  new: "جديد",
  no_notifications: "لا توجد تنبيهات عاجلة",
  email: "البريد الإلكتروني",
  profile: "الملف الشخصي",
  preferences: "التفضيلات",
  logout: "تسجيل الخروج"
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2));
