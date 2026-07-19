import React, { useState } from "react";
import {
  Trash2,
  ArrowUp,
  ArrowDown,
  Layout,
  Plus,
  Monitor,
  Smartphone,
  Eye,
  Settings,
  Type,
  Image,
  Square,
  Code,
  Minus,
  Info,
  Palette,
  Sparkles,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface EmailBlock {
  type: string;
  text?: string;
  url?: string;
  code?: string;
  color?: string;
  align?: "left" | "center" | "right";
}

interface EmailTemplateEditorProps {
  blocks: EmailBlock[];
  onChange: (blocks: EmailBlock[]) => void;
  isAr: boolean;
  templates?: any[];
  onLoadTemplate?: (blocks: EmailBlock[]) => void;
}

export default function EmailTemplateEditor({
  blocks,
  onChange,
  isAr,
  templates = [],
  onLoadTemplate,
}: EmailTemplateEditorProps) {
  const [activePreview, setActivePreview] = useState<"desktop" | "mobile">("desktop");
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number | null>(null);

  // Block definitions for presets
  const blockTypes = [
    { type: "header", label: isAr ? "ترويسة / شعار" : "Header / Logo", icon: Type },
    { type: "image", label: isAr ? "صورة رئيسية" : "Hero Image", icon: Image },
    { type: "text", label: isAr ? "فقرة نصية" : "Text Paragraph", icon: Info },
    { type: "button", label: isAr ? "زر تفاعلي (CTA)" : "CTA Button", icon: Square },
    { type: "code", label: isAr ? "رمز مخصص (HTML)" : "Custom Code / HTML", icon: Code },
    { type: "divider", label: isAr ? "خط فاصل" : "Divider Line", icon: Minus },
    { type: "footer", label: isAr ? "تذييل البريد" : "Email Footer", icon: Layout },
  ];

  const handleAddBlock = (type: string) => {
    let newBlock: EmailBlock = { type };
    if (type === "header") {
      newBlock = {
        type,
        text: isAr ? "أهلاً بك في نشرتنا الإخبارية" : "Welcome to Our Newsletter",
        align: "center",
        color: "#1e1b4b",
      };
    } else if (type === "text") {
      newBlock = {
        type,
        text: isAr
          ? "يسعدنا جداً تقديم ميزاتنا الجديدة التي ستساعدك على تنمية أعمالك بكل يسر وسهولة."
          : "We are extremely excited to introduce our new tools designed to streamline your business workflows effortlessly.",
        align: "left",
        color: "#334155",
      };
    } else if (type === "image") {
      newBlock = {
        type,
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
        text: isAr ? "صورة توضيحية" : "Campaign Visual banner",
      };
    } else if (type === "button") {
      newBlock = {
        type,
        text: isAr ? "تسجيل الحضور والاستفادة" : "Unlock Special Offer",
        url: "https://madarij.sa",
        align: "center",
        color: "#4f46e5",
      };
    } else if (type === "code") {
      newBlock = {
        type,
        code: `<div style="padding: 15px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; text-align: center;">
  <p style="margin: 0; color: #475569; font-size: 13px;">⚡ Custom HTML Block - Fully Supported</p>
</div>`,
      };
    } else if (type === "divider") {
      newBlock = { type, color: "#cbd5e1" };
    } else if (type === "footer") {
      newBlock = {
        type,
        text: isAr
          ? "جميع الحقوق محفوظة © Madarij OS | الرياض، المملكة العربية السعودية"
          : "All rights reserved © Madarij OS | Riyadh, Saudi Arabia",
        url: "https://madarij.sa/unsubscribe",
        align: "center",
        color: "#94a3b8",
      };
    }

    const updated = [...blocks, newBlock];
    onChange(updated);
    setSelectedBlockIdx(updated.length - 1);
  };

  const handleUpdateBlockField = (index: number, key: keyof EmailBlock, value: any) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  };

  const handleDeleteBlock = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = blocks.filter((_, i) => i !== index);
    onChange(updated);
    if (selectedBlockIdx === index) {
      setSelectedBlockIdx(null);
    } else if (selectedBlockIdx !== null && selectedBlockIdx > index) {
      setSelectedBlockIdx(selectedBlockIdx - 1);
    }
  };

  const handleMoveBlock = (index: number, dir: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    if (dir === "up" && index === 0) return;
    if (dir === "down" && index === blocks.length - 1) return;

    const targetIdx = dir === "up" ? index - 1 : index + 1;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChange(updated);

    if (selectedBlockIdx === index) {
      setSelectedBlockIdx(targetIdx);
    } else if (selectedBlockIdx === targetIdx) {
      setSelectedBlockIdx(index);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 bg-slate-50 p-1 rounded-2xl min-h-[600px]">
      {/* LEFT COLUMN: Controls, Blocks Library, & Block Inspector (5/12 cols) */}
      <div className="xl:col-span-6 flex flex-col gap-4">
        {/* Templates Presets bar */}
        {templates.length > 0 && onLoadTemplate && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-indigo-500" />
              {isAr ? "تحميل تخطيط مسبق جاهز" : "Load Fast Blueprint Template"}
            </h5>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {templates.slice(0, 3).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (t.jsonStructure?.blocks) {
                      onLoadTemplate(t.jsonStructure.blocks);
                      setSelectedBlockIdx(null);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 rounded-lg text-[11px] font-semibold text-slate-600 transition flex items-center gap-1 shrink-0"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Blocks Palette Library */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h5 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-teal-600" />
            {isAr ? "مكتبة المكونات والكتل" : "Email Block Library"}
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {blockTypes.map((bt) => {
              const Icon = bt.icon;
              return (
                <button
                  key={bt.type}
                  onClick={() => handleAddBlock(bt.type)}
                  className="flex items-center gap-2 px-3 py-2 border border-slate-200 hover:border-indigo-400 hover:bg-slate-50 rounded-lg text-[11px] font-semibold text-slate-700 transition shadow-sm text-left"
                >
                  <div className="p-1 bg-slate-100 rounded text-slate-600">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{bt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Order & Builder */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[300px]">
          <h5 className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
            <span>{isAr ? "ترتيب وهيكل كتل البريد" : "Active Message Hierarchy"}</span>
            <span className="text-[10px] text-slate-400 font-normal">
              {blocks.length} {isAr ? "كتلة مضافة" : "blocks active"}
            </span>
          </h5>

          {blocks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
              <Layout className="w-8 h-8 mb-2 stroke-1" />
              <p className="text-xs">{isAr ? "البريد فارغ حالياً." : "Your email is empty."}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {isAr
                  ? "اضغط على أي مكون في الأعلى للبدء بالتصميم"
                  : "Click any block above to start building"}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {blocks.map((block, idx) => {
                const isSelected = selectedBlockIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedBlockIdx(idx)}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer group",
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/20 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 font-mono text-[9px] font-bold rounded uppercase">
                        {block.type}
                      </span>
                      <span className="text-xs text-slate-700 font-medium truncate max-w-[200px]">
                        {block.text ||
                          block.url ||
                          (block.code ? "Raw Custom HTML" : isAr ? "خط فاصل" : "Divider")}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleMoveBlock(idx, "up", e)}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                        title={isAr ? "تحريك لأعلى" : "Move Up"}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleMoveBlock(idx, "down", e)}
                        disabled={idx === blocks.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                        title={isAr ? "تحريك لأسفل" : "Move Down"}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteBlock(idx, e)}
                        className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                        title={isAr ? "حذف الكتل" : "Delete Block"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Block Inspector Panel */}
        {selectedBlockIdx !== null && blocks[selectedBlockIdx] && (
          <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm animate-fadeIn">
            <h5 className="text-xs font-bold text-indigo-950 mb-3 flex items-center gap-1.5 border-b border-indigo-50 pb-2">
              <Settings className="w-4 h-4 text-indigo-600 animate-spin-slow" />
              <span>
                {isAr ? "تخصيص المكون النشط" : "Edit Selected Block"}:{" "}
                <strong className="uppercase text-indigo-600 font-mono text-[10px]">
                  {blocks[selectedBlockIdx].type}
                </strong>
              </span>
            </h5>

            <div className="space-y-3 text-xs">
              {/* Text Field editing */}
              {(blocks[selectedBlockIdx].type === "header" ||
                blocks[selectedBlockIdx].type === "text" ||
                blocks[selectedBlockIdx].type === "button" ||
                blocks[selectedBlockIdx].type === "footer") && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    {isAr ? "المحتوى النصي" : "Content Text"}
                  </label>
                  {blocks[selectedBlockIdx].type === "text" ? (
                    <textarea
                      value={blocks[selectedBlockIdx].text || ""}
                      onChange={(e) =>
                        handleUpdateBlockField(selectedBlockIdx, "text", e.target.value)
                      }
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={blocks[selectedBlockIdx].text || ""}
                      onChange={(e) =>
                        handleUpdateBlockField(selectedBlockIdx, "text", e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  )}
                </div>
              )}

              {/* URL/Links Field Editing */}
              {(blocks[selectedBlockIdx].type === "button" ||
                blocks[selectedBlockIdx].type === "image" ||
                blocks[selectedBlockIdx].type === "footer") && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    {blocks[selectedBlockIdx].type === "image"
                      ? isAr
                        ? "رابط الصورة المباشر"
                        : "Direct Image URL"
                      : isAr
                        ? "رابط التوجيه (Link URL)"
                        : "Action Link URL"}
                  </label>
                  <input
                    type="text"
                    value={
                      blocks[selectedBlockIdx].type === "image"
                        ? blocks[selectedBlockIdx].url || ""
                        : blocks[selectedBlockIdx].url || ""
                    }
                    onChange={(e) =>
                      handleUpdateBlockField(selectedBlockIdx, "url", e.target.value)
                    }
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-[11px]"
                  />
                </div>
              )}

              {/* Code Editor for custom HTML */}
              {blocks[selectedBlockIdx].type === "code" && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    {isAr ? "رموز HTML المخصصة" : "Custom raw HTML markup"}
                  </label>
                  <textarea
                    value={blocks[selectedBlockIdx].code || ""}
                    onChange={(e) =>
                      handleUpdateBlockField(selectedBlockIdx, "code", e.target.value)
                    }
                    rows={6}
                    className="w-full bg-slate-900 text-teal-400 border border-slate-800 p-3 rounded-xl font-mono text-[11px] focus:outline-none"
                  />
                </div>
              )}

              {/* Alignment & colors options */}
              {(blocks[selectedBlockIdx].type === "header" ||
                blocks[selectedBlockIdx].type === "text" ||
                blocks[selectedBlockIdx].type === "button" ||
                blocks[selectedBlockIdx].type === "divider" ||
                blocks[selectedBlockIdx].type === "footer") && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      {isAr ? "اللون المخصص" : "Block Theme Color"}
                    </label>
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="color"
                        value={blocks[selectedBlockIdx].color || "#4f46e5"}
                        onChange={(e) =>
                          handleUpdateBlockField(selectedBlockIdx, "color", e.target.value)
                        }
                        className="w-7 h-7 rounded cursor-pointer border border-slate-200"
                      />
                      <input
                        type="text"
                        value={blocks[selectedBlockIdx].color || ""}
                        onChange={(e) =>
                          handleUpdateBlockField(selectedBlockIdx, "color", e.target.value)
                        }
                        className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-[10px] font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {blocks[selectedBlockIdx].type !== "divider" && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        {isAr ? "المحاذاة" : "Alignment"}
                      </label>
                      <select
                        value={blocks[selectedBlockIdx].align || "center"}
                        onChange={(e) =>
                          handleUpdateBlockField(selectedBlockIdx, "align", e.target.value)
                        }
                        className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg focus:outline-none"
                      >
                        <option value="left">{isAr ? "يسار" : "Left"}</option>
                        <option value="center">{isAr ? "وسط" : "Center"}</option>
                        <option value="right">{isAr ? "يمين" : "Right"}</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Live Newsletter Client Mockup Preview (6/12 cols) */}
      <div className="xl:col-span-6 flex flex-col border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
        {/* Preview Device Header Tools */}
        <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-indigo-600" />
            {isAr ? "المعاينة التفاعلية المباشرة" : "Interactive Client Simulator"}
          </span>

          <div className="flex gap-1.5">
            <button
              onClick={() => setActivePreview("desktop")}
              className={cn(
                "p-1.5 rounded-lg transition",
                activePreview === "desktop"
                  ? "bg-slate-200 text-slate-800"
                  : "text-slate-400 hover:text-slate-600"
              )}
              title={isAr ? "شاشة مكتبية" : "Desktop Client Preview"}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActivePreview("mobile")}
              className={cn(
                "p-1.5 rounded-lg transition",
                activePreview === "mobile"
                  ? "bg-slate-200 text-slate-800"
                  : "text-slate-400 hover:text-slate-600"
              )}
              title={isAr ? "شاشة هاتف" : "Mobile App Preview"}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email Mail Client Canvas Simulator */}
        <div className="flex-1 bg-slate-100 p-4 overflow-y-auto flex justify-center items-start">
          <div
            className={cn(
              "bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 border border-slate-200/60 p-6 space-y-5",
              activePreview === "desktop" ? "w-full max-w-xl" : "w-[340px]"
            )}
            style={{ minHeight: "450px" }}
          >
            {/* Top Mail Header Envelope bar */}
            <div className="border-b border-slate-100 pb-3 mb-2 text-[10px] text-slate-400 space-y-1 text-left">
              <div>
                <strong>From:</strong> Madarij growth engine &lt;hello@madarij.sa&gt;
              </div>
              <div>
                <strong>To:</strong> Customer Segment
              </div>
            </div>

            {/* Email Body content loop render */}
            {blocks.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center text-slate-400">
                <Layout className="w-10 h-10 mb-2 stroke-1 opacity-50" />
                <p className="text-xs">
                  {isAr ? "لا توجد عناصر لعرضها" : "No blocks added to design yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {blocks.map((block, idx) => {
                  const alignmentClass =
                    block.align === "left"
                      ? "text-left"
                      : block.align === "right"
                        ? "text-right"
                        : "text-center";

                  const styleObj = block.color ? { color: block.color } : {};

                  if (block.type === "header") {
                    return (
                      <h1
                        key={idx}
                        className={cn("text-2xl font-extrabold tracking-tight", alignmentClass)}
                        style={styleObj}
                      >
                        {block.text}
                      </h1>
                    );
                  }

                  if (block.type === "text") {
                    return (
                      <p
                        key={idx}
                        className={cn("text-sm leading-relaxed text-slate-600", alignmentClass)}
                        style={{ ...styleObj, whiteSpace: "pre-line" }}
                      >
                        {block.text}
                      </p>
                    );
                  }

                  if (block.type === "image") {
                    return (
                      <div key={idx} className="w-full flex justify-center">
                        <img
                          src={
                            block.url ||
                            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600"
                          }
                          alt={block.text || "Visual Content"}
                          className="rounded-lg shadow-sm max-h-[220px] object-cover w-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    );
                  }

                  if (block.type === "button") {
                    const btnAlign =
                      block.align === "left"
                        ? "justify-start"
                        : block.align === "right"
                          ? "justify-end"
                          : "justify-center";

                    return (
                      <div key={idx} className={cn("w-full flex", btnAlign)}>
                        <a
                          href={block.url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition hover:scale-[1.02] inline-block text-center"
                          style={{ backgroundColor: block.color || "#4f46e5" }}
                        >
                          {block.text}
                        </a>
                      </div>
                    );
                  }

                  if (block.type === "code") {
                    return (
                      <div
                        key={idx}
                        className="w-full overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: block.code || "" }}
                      />
                    );
                  }

                  if (block.type === "divider") {
                    return (
                      <hr
                        key={idx}
                        className="border-t w-full my-4"
                        style={{ borderColor: block.color || "#cbd5e1" }}
                      />
                    );
                  }

                  if (block.type === "footer") {
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "text-[11px] text-slate-400 space-y-1.5 pt-4 border-t border-slate-100",
                          alignmentClass
                        )}
                      >
                        <p>{block.text}</p>
                        <div className="flex justify-center gap-2">
                          <a href={block.url || "#"} className="text-indigo-500 hover:underline">
                            {isAr ? "إلغاء الاشتراك" : "Unsubscribe"}
                          </a>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
