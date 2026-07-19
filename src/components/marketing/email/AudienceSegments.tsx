import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Tag,
  Mail,
  Briefcase,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { EmailContact } from "./useEmailMarketing";

interface AudienceSegmentsProps {
  contacts: EmailContact[];
  isAr: boolean;
  onSaveContact: (payload: Partial<EmailContact>) => Promise<boolean>;
  onSyncCRM: () => Promise<boolean>;
}

export default function AudienceSegments({
  contacts,
  isAr,
  onSaveContact,
  onSyncCRM,
}: AudienceSegmentsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [contactTags, setContactTags] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Extract all unique tags
  const allTags = Array.from(new Set(contacts.flatMap((c) => c.segmentTags || [])));

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.segmentTags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesTag = tagFilter === "all" || c.segmentTags?.includes(tagFilter);

    return matchesSearch && matchesStatus && matchesTag;
  });

  const handleSync = async () => {
    setIsSyncing(true);
    await onSyncCRM();
    setIsSyncing(false);
  };

  const handleCreateContact = async () => {
    if (!contactName || !contactEmail) return;
    const payload = {
      name: contactName,
      email: contactEmail,
      company: contactCompany || "Independent",
      status: "Active" as const,
      segmentTags: contactTags
        ? contactTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : ["Lead"],
    };

    const success = await onSaveContact(payload);
    if (success) {
      setShowContactModal(false);
      setContactName("");
      setContactEmail("");
      setContactCompany("");
      setContactTags("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic segments overview count dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">
              {isAr ? "إجمالي جهات الاتصال" : "Total Audience"}
            </span>
            <span className="text-xl font-bold text-slate-800">{contacts.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">
              {isAr ? "المشتركين النشطين" : "Active Subscribers"}
            </span>
            <span className="text-xl font-bold text-slate-800">
              {contacts.filter((c) => c.status === "Active").length}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">
              {isAr ? "شرائح الجمهور الفريدة" : "Unique Segments"}
            </span>
            <span className="text-xl font-bold text-slate-800">{allTags.length}</span>
          </div>
        </div>
      </div>

      {/* Toolbar actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                isAr ? "البحث بالاسم، البريد أو المنشأة..." : "Search contacts, company, tags..."
              }
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
          >
            <option value="all">{isAr ? "كل الحالات" : "All Statuses"}</option>
            <option value="Active">{isAr ? "نشط" : "Active"}</option>
            <option value="Unsubscribed">{isAr ? "ملغي الاشتراك" : "Unsubscribed"}</option>
            <option value="Bounced">{isAr ? "مرتد" : "Bounced"}</option>
          </select>

          {allTags.length > 0 && (
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
            >
              <option value="all">{isAr ? "كل الأوسام" : "All Tags"}</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition disabled:opacity-50 flex items-center gap-1.5"
            title={isAr ? "مزامنة سريعة من CRM" : "Import Contacts from CRM"}
          >
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
            <span className="text-xs font-semibold">{isAr ? "مزامنة CRM" : "CRM Sync"}</span>
          </button>

          <button
            onClick={() => setShowContactModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {isAr ? "إضافة عميل" : "Add Contact"}
          </button>
        </div>
      </div>

      {/* Grid Table rendering */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredContacts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic">
            {isAr ? "لا توجد نتائج مطابقة لفلترة البحث." : "No contacts matched search filters."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-3">{isAr ? "الاسم" : "Name"}</th>
                  <th className="px-6 py-3">{isAr ? "البريد الإلكتروني" : "Email"}</th>
                  <th className="px-6 py-3">{isAr ? "المنشأة" : "Company"}</th>
                  <th className="px-6 py-3">{isAr ? "الأوسمة / الشرائح" : "Segments"}</th>
                  <th className="px-6 py-3 text-right">{isAr ? "الحالة" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                        {contact.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900">{contact.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        {contact.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                        {contact.company}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.segmentTags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[9px] font-bold rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[9px] font-bold rounded-full uppercase",
                          contact.status === "Active"
                            ? "bg-emerald-100 text-emerald-800"
                            : contact.status === "Unsubscribed"
                              ? "bg-slate-100 text-slate-700"
                              : "bg-rose-100 text-rose-800"
                        )}
                      >
                        {contact.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONTACT ADDITION MODAL */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-left"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">
                  {isAr ? "تسجيل عميل جديد لقوائم الاتصال" : "Add Direct Contact"}
                </h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                    {isAr ? "الاسم الكريم" : "Contact Name"}
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. خالد الحربي"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                    {isAr ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. k.harbi@domain.sa"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                    {isAr ? "المنشأة / الشركة" : "Company"}
                  </label>
                  <input
                    type="text"
                    value={contactCompany}
                    onChange={(e) => setContactCompany(e.target.value)}
                    placeholder="e.g. Aramco"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                    {isAr ? "وسوم وتصنيف (مفصولة بفاصلة)" : "Segment Tags (comma separated)"}
                  </label>
                  <input
                    type="text"
                    value={contactTags}
                    onChange={(e) => setContactTags(e.target.value)}
                    placeholder="e.g. High Value, Retail, Warm"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-150 flex justify-end gap-2">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleCreateContact}
                  disabled={!contactName || !contactEmail}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
                >
                  {isAr ? "إضافة عميل" : "Add Contact"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
