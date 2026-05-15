import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Building2, Hash, MapPin, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Onboarding() {
  const { user, updateProfile } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: user?.companyName || "",
    crNumber: user?.crNumber || "",
    city: user?.city || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.crNumber || !formData.city) {
      toast.error("يرجى إكمال جميع الحقول المطلوبة.");
      return;
    }
    
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success("تم إعداد حسابك بنجاح!");
      navigate("/app");
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ البيانات.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 selection:bg-primary/10" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden"
      >
        <div className="p-8 md:p-12 space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-3xl mb-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight leading-tight">
              أكمل بيانات منشأتك
            </h1>
            <p className="text-zinc-500 font-bold max-w-[380px] mx-auto leading-relaxed">
              لتقديم تجربة مخصصة لك، نرجو تزويدنا ببعض التفاصيل حول عملك.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-2">اسم المنشأة التجاري *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="مؤسسة مدارج التقنية"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-12 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none hover:border-zinc-300 transition-colors"
                  />
                  <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-2">السجل التجاري أو الرقم الضريبي *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.crNumber}
                    onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })}
                    placeholder="1010XXXXXX"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-12 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none hover:border-zinc-300 transition-colors"
                  />
                  <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-2">المدينة *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="الرياض"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-12 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none hover:border-zinc-300 transition-colors"
                  />
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-4 flex items-center justify-center gap-2 rounded-2xl font-black text-sm hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <span>متابعة إلى لوحة القيادة</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
