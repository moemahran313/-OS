const fs = require("fs");
const enPath = "src/locales/en/translation.json";
const arPath = "src/locales/ar/translation.json";

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const ar = JSON.parse(fs.readFileSync(arPath, "utf8"));

en.layout.mic_not_supported = "Sorry, your browser doesn't support speech recognition.";
ar.layout.mic_not_supported = "عذراً، متصفحك لا يدعم التعرف على الصوت.";

en.layout.mic_permission_denied = "Please allow microphone access or open the app in a new window.";
ar.layout.mic_permission_denied =
  "يرجى السماح بالوصول إلى الميكروفون، أو فتح التطبيق في نافذة جديدة.";

en.layout.mic_error = "Speech recognition error occurred. Please try again.";
ar.layout.mic_error = "حدث خطأ في التعرف على الصوت. الرجاء المحاولة مرة أخرى.";

en.layout.switch_to_english = "System language switched to English";
ar.layout.switch_to_english = "تم تحويل لغة النظام إلى الإنجليزية";

en.layout.switch_to_arabic = "System language switched to Arabic";
ar.layout.switch_to_arabic = "تم تحويل لغة النظام إلى العربية";

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2));
