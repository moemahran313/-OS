import React from "react";
import { motion } from "motion/react";
import { Building2, Globe, Zap, Shield } from "lucide-react";

export const SocialProofSection = () => {
  return (
    <section
      className="py-24 bg-zinc-50 border-y border-zinc-200 overflow-hidden relative"
      dir="rtl"
    >
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-50 to-transparent z-10 pointer-events-none" />

      <div className="container mx-auto px-6 text-center max-w-7xl relative z-0">
        <h3 className="text-zinc-500 font-black tracking-widest uppercase text-xs mb-12">
          الخيار الأول لأكثر من 5,000 شركة ورائد أعمال في المملكة والخليج
        </h3>

        <motion.div
          animate={{ x: [0, -1035] }}
          transition={{ ease: "linear", duration: 20, repeat: Infinity }}
          className="flex whitespace-nowrap items-center gap-16 md:gap-24 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500"
          style={{ width: "max-content", direction: "ltr" }}
        >
          {/* Corporate logos placeholders - duplicated for infinite effect */}
          {[1, 2].map((group) => (
            <React.Fragment key={group}>
              <div className="flex items-center gap-3 font-black text-2xl text-zinc-800">
                <Building2 className="w-8 h-8 text-primary" /> مجموعة الرائدة
              </div>
              <div className="flex items-center gap-3 font-black text-2xl text-zinc-800">
                <Globe className="w-8 h-8 text-emerald-500" /> خدمات ألفا
              </div>
              <div className="flex items-center gap-3 font-black text-2xl text-zinc-800">
                <Zap className="w-8 h-8 text-blue-500" /> تقنية الغد
              </div>
              <div className="flex items-center gap-3 font-black text-2xl text-zinc-800">
                <Shield className="w-8 h-8 text-rose-500" /> درع الأمن
              </div>
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
export default SocialProofSection;
