import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, ArrowLeft, Mail, Lock } from "lucide-react";
import { Logo } from "@/src/components/Logo";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useUser();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      const success = await loginWithGoogle(); // Needs refCode
      if (success) {
        navigate("/app");
      } else {
        setError("فشل تسجيل الدخول باستخدام جوجل.");
      }
    } catch (err: any) {
      setError("حدث خطأ أثناء تسجيل الدخول: " + (err.message || "خطأ غير معروف"));
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setError("يرجى إدخال جميع الحقول المطلوبة.");
      return;
    }
    setError("");
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        // @ts-ignore
        await registerWithEmail(email, password, name, avatar, refCode || undefined);
      }
      navigate("/app");
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') setError('البريد الإلكتروني مسجل مسبقاً.');
      else if (err.code === 'auth/wrong-password') setError('كلمة المرور غير صحيحة.');
      else if (err.code === 'auth/user-not-found') setError('لم يتم العثور على حساب بهذا البريد.');
      else if (err.code === 'auth/operation-not-allowed') setError('التسجيل بالبريد الإلكتروني غير مفعل في Firebase. يرجى تفعيله من لوحة التحكم.');
      else setError("حدث خطأ: " + (err.message || "خطأ غير معروف"));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 selection:bg-primary/10" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden"
      >
        <div className="p-8 md:p-12 space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-6">
               <Logo iconClassName="w-16 h-16" textClassName="text-4xl" />
            </div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight leading-tight">
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </h1>
            <p className="text-zinc-500 font-bold max-w-[320px] mx-auto leading-relaxed">
              {isLogin ? 'مرحباً بك مجدداً في مدارج OS.' : 'انضم إلينا وابدأ في إدارة أعمالك بكفاءة.'}
            </p>
          </div>

          <div className="flex p-1 bg-zinc-100 rounded-2xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isLogin ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              دخول
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isLogin ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-4">
              {!isLogin && (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="الاسم الكامل"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none hover:border-zinc-300 transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="رابط الصورة الشخصية (اختياري)"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none hover:border-zinc-300 transition-colors"
                      dir="ltr"
                    />
                  </div>
                </>
              )}
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="البريد الإلكتروني"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-12 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none hover:border-zinc-300 transition-colors"
                  dir="ltr"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-12 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none hover:border-zinc-300 transition-colors"
                  dir="ltr"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-sm"
            >
              {isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200" /></div>
            <span className="relative bg-white px-4 text-xs font-bold text-zinc-400">أو</span>
          </div>

          <button 
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-zinc-900 border border-zinc-200 py-4 rounded-2xl font-black text-sm hover:border-zinc-900 hover:bg-zinc-50 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-sm group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>باستخدام حساب جوجل</span>
          </button>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <p className="text-[11px] font-black text-rose-600">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4">
            <button 
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-600 font-bold text-xs transition-all"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>العودة للصفحة الرئيسية</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

