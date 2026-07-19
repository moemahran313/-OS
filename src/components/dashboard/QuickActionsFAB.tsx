import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  FileText,
  Users,
  CreditCard,
  FolderKanban,
  X,
  Zap,
} from "lucide-react";
import { useSettings } from "@/src/contexts/SettingsContext";

interface QuickActionsFABProps {
  onNewInvoice: () => void;
  onNewLead: () => void;
  onNewPayroll: () => void;
  onNewProject: () => void;
}

export default function QuickActionsFAB({
  onNewInvoice,
  onNewLead,
  onNewPayroll,
  onNewProject,
}: QuickActionsFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useSettings();
  const isAr = settings.language === "ar";

  const actions = [
    {
      id: "invoice",
      labelAr: "فاتورة مبيعات جديدة",
      labelEn: "New Sales Invoice",
      icon: FileText,
      color: "bg-blue-500 hover:bg-blue-600 text-white",
      onClick: () => {
        onNewInvoice();
        setIsOpen(false);
      },
    },
    {
      id: "lead",
      labelAr: "إضافة عميل مبيعات جديد (Lead)",
      labelEn: "Add New CRM Lead",
      icon: Users,
      color: "bg-emerald-500 hover:bg-emerald-600 text-white",
      onClick: () => {
        onNewLead();
        setIsOpen(false);
      },
    },
    {
      id: "payroll",
      labelAr: "تشغيل مسير رواتب جديد",
      labelEn: "New Payroll Run (WPS)",
      icon: CreditCard,
      color: "bg-purple-500 hover:bg-purple-600 text-white",
      onClick: () => {
        onNewPayroll();
        setIsOpen(false);
      },
    },
    {
      id: "project",
      labelAr: "إنشاء مشروع تشغيلي جديد",
      labelEn: "Create New Project",
      icon: FolderKanban,
      color: "bg-amber-500 hover:bg-amber-600 text-white",
      onClick: () => {
        onNewProject();
        setIsOpen(false);
      },
    },
  ];

  return (
    <div
      className={`fixed bottom-8 z-40 flex flex-col items-center ${
        isAr ? "left-8" : "right-8"
      }`}
    >
      {/* Expanded Menu Actions */}
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-center gap-3.5 mb-4">
            {actions.map((act, idx) => {
              const ActIcon = act.icon;
              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, y: 15, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.8 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3"
                >
                  {/* Action Tooltip Label */}
                  <div
                    className={`bg-zinc-900/90 dark:bg-zinc-800/95 text-zinc-100 font-black text-[10px] px-3 py-1.5 rounded-lg border border-zinc-800 shadow-xl whitespace-nowrap pointer-events-none transition-all order-1 ${
                      isAr ? "order-2" : "order-1"
                    }`}
                  >
                    {isAr ? act.labelAr : act.labelEn}
                  </div>

                  {/* Sub Action Button */}
                  <button
                    onClick={act.onClick}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer select-none relative z-50 ${
                      isAr ? "order-1" : "order-2"
                    } ${act.color}`}
                  >
                    <ActIcon className="w-5 h-5" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Primary Floating FAB Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-[1.75rem] flex items-center justify-center text-white transition-all duration-300 shadow-lg cursor-pointer select-none border border-emerald-500/20 hover:scale-105 active:scale-95 ${
          isOpen
            ? "bg-zinc-900 dark:bg-zinc-800 rotate-45 shadow-zinc-950/20"
            : "bg-emerald-600 shadow-emerald-500/30"
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -45 }}
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </motion.div>
          ) : (
            <motion.div
              key="zap-icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1"
            >
              <Zap className="w-5 h-5 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
