import React from "react";
import {
  UserCheck,
  Building2,
  Phone,
  Mail,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { LeadContact } from "@/src/types/leadGen";

interface LeadPipelineProps {
  contacts: LeadContact[];
  onUpdateStatus: (contactId: string, newStatus: LeadContact["leadStatus"]) => void;
  onSelectContact: (contact: LeadContact) => void;
}

const STAGES: { id: LeadContact["leadStatus"]; label: string; color: string }[] = [
  { id: "new", label: "عميل جديد (New)", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30" },
  { id: "contacted", label: "تم التواصل (Contacted)", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30" },
  { id: "qualified", label: "مؤهل (Qualified)", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  { id: "meeting", label: "اجتماع مجدول (Meeting)", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30" },
  { id: "proposal", label: "تم إرسال العرض (Proposal)", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30" },
  { id: "negotiation", label: "تفاوض (Negotiation)", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30" },
  { id: "won", label: "صفقة ناجحة (Won)", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  { id: "lost", label: "مستبعد (Lost)", color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/30" },
];

export const LeadPipeline: React.FC<LeadPipelineProps> = ({
  contacts,
  onUpdateStatus,
  onSelectContact,
}) => {
  return (
    <div className="space-y-4 dir-rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100">
            خط أنابيب المبيعات والمتابعة (Pipeline & Stages)
          </h2>
          <p className="text-xs text-zinc-400">إدارة الفرص والمراحل الانتقالية بوضوح عبر المراحل الرسمية.</p>
        </div>
      </div>

      {/* Kanban Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
        {STAGES.map((stage) => {
          const stageContacts = contacts.filter((c) => c.leadStatus === stage.id);

          return (
            <div
              key={stage.id}
              className="w-72 shrink-0 bg-zinc-100/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 flex flex-col max-h-[75vh]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-3 px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${stage.color}`}>
                    {stage.label}
                  </span>
                </div>
                <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] font-black text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                  {stageContacts.length}
                </span>
              </div>

              {/* Column Cards List */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1 pl-1">
                {stageContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => onSelectContact(contact)}
                    className="bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50 rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-500 transition-colors">
                          {contact.firstName} {contact.lastName}
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-bold truncate">{contact.position}</p>
                      </div>

                      <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black rounded">
                        {contact.leadScore} pts
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 truncate">
                      <Building2 className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span className="truncate">{contact.companyName}</span>
                    </div>

                    {/* Stage Transfer Quick Controls */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between text-[10px]">
                      <span className="text-zinc-400 font-bold">{contact.assignedTo || "غير مسند"}</span>

                      <div className="flex items-center gap-1">
                        <select
                          value={contact.leadStatus}
                          onChange={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(contact.id, e.target.value as LeadContact["leadStatus"]);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-zinc-100 dark:bg-zinc-700 border-none rounded px-1.5 py-0.5 text-[10px] font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label.split(" ")[0]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                {stageContacts.length === 0 && (
                  <div className="py-8 text-center text-[10px] font-bold text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                    لا توجد صفقات في هذه المرحلة
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
