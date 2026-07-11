import React from "react";
import { Sparkles, Send, RefreshCw, Cpu, MessageSquare } from "lucide-react";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

interface AiAssistantProps {
  chatHistory: ChatMessage[];
  aiQuery: string;
  setAiQuery: (q: string) => void;
  isAiLoading: boolean;
  onAskAdvisor: (question: string) => void;
  customPrompt: string;
  setCustomPrompt: (p: string) => void;
  isGenerating: boolean;
  onGenerateWorkflow: () => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  chatHistory,
  aiQuery,
  setAiQuery,
  isAiLoading,
  onAskAdvisor,
  customPrompt,
  setCustomPrompt,
  isGenerating,
  onGenerateWorkflow,
}) => {
  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || isAiLoading) return;
    onAskAdvisor(aiQuery);
  };

  const renderFormattedText = (txt: string) => {
    return txt.split("\n").map((line, idx) => {
      let content = line;
      let isHeader = false;
      let isList = false;

      if (content.startsWith("### ")) {
        content = content.replace("### ", "");
        isHeader = true;
      } else if (content.startsWith("## ")) {
        content = content.replace("## ", "");
        isHeader = true;
      } else if (content.startsWith("* ") || content.startsWith("- ")) {
        content = content.replace(/^[*|-]\s+/, "");
        isList = true;
      }

      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIdx = 0;
      let match;

      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIdx) {
          parts.push(content.substring(lastIdx, match.index));
        }
        parts.push(
          <strong
            key={match.index}
            className="text-zinc-900 font-extrabold bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/50"
          >
            {match[1]}
          </strong>
        );
        lastIdx = boldRegex.lastIndex;
      }

      if (lastIdx < content.length) {
        parts.push(content.substring(lastIdx));
      }

      const finalLine = parts.length > 0 ? parts : content;

      if (isHeader) {
        return (
          <h4
            key={idx}
            className="text-xs font-black text-zinc-900 mt-4 mb-2 border-b border-zinc-100 pb-1"
          >
            {finalLine}
          </h4>
        );
      }
      if (isList) {
        return (
          <li
            key={idx}
            className="list-disc list-inside text-xs font-semibold text-zinc-700 mr-2 my-1 leading-relaxed"
          >
            {finalLine}
          </li>
        );
      }
      return (
        <p key={idx} className="text-xs font-medium text-zinc-600 my-1 leading-relaxed">
          {finalLine || <br />}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Generative Prompt block */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 text-white p-6 rounded-3xl relative overflow-hidden shadow-xl border border-zinc-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/35 px-2.5 py-1 rounded-full font-black w-max">
            <Sparkles className="w-3.5 h-3.5" />
            <span>توليد مسارات الأتمتة بالذكاء الاصطناعي التوليدي</span>
          </div>
          <h3 className="text-sm font-black text-zinc-100">صمم مسار أتمتة مخصص بلغة طبيعية</h3>
          <p className="text-[11px] text-zinc-400 font-semibold max-w-3xl leading-relaxed">
            اكتب فكرتك المحاسبية أو القانونية باللغة العربية أو الإنجليزية، وسيتولى ذكاء مدارج توليد
            وبناء مخطط التدقيق وتنسيق الإجراءات فوراً.
          </p>

          <div className="flex gap-2.5 mt-3">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onGenerateWorkflow()}
              placeholder="مثال: عند استيراد مسير رواتب موظف، تحقق من مطابقتهم مع التأمينات الاجتماعية وأرسل ملف SIF للمدير..."
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs font-semibold p-3 rounded-2xl focus:outline-none focus:border-violet-500 transition-colors"
            />
            <button
              onClick={onGenerateWorkflow}
              disabled={isGenerating || !customPrompt.trim()}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-55 disabled:hover:bg-violet-600 text-white font-black text-xs px-5 py-3 rounded-2xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isGenerating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>توليد المخطط</span>
            </button>
          </div>
        </div>
      </div>

      {/* Side chat and advisor */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col h-[350px]">
        <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-500" />
            <h3 className="text-xs font-black text-zinc-900">
              مستشار الامتثال والضرائب (ZATCA Advisor)
            </h3>
          </div>
          <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
            Gemini-3.5-flash
          </span>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-right">
          {chatHistory.map((chat, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                chat.sender === "user"
                  ? "bg-zinc-100 text-zinc-800 mr-auto rounded-tl-none border border-zinc-200/50"
                  : "bg-indigo-50/50 text-zinc-800 ml-auto rounded-tr-none border border-indigo-100/50"
              }`}
            >
              <div className="text-[10px] font-black text-zinc-400 mb-1">
                {chat.sender === "user" ? "أنت" : "مدارج الذكي"}
              </div>
              <div className="space-y-1">
                {chat.sender === "ai" ? renderFormattedText(chat.text) : chat.text}
              </div>
            </div>
          ))}
          {isAiLoading && (
            <div className="bg-zinc-50 border border-zinc-200 text-zinc-500 p-3 rounded-2xl text-xs font-semibold w-max flex items-center gap-2 animate-pulse">
              <Cpu className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>جاري صياغة رد قانوني مستفيض...</span>
            </div>
          )}
        </div>

        {/* Input area */}
        <form onSubmit={handleQuerySubmit} className="flex gap-2 border-t border-zinc-150 pt-3">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="اسأل المستشار: هل فواتير العقارات السكنية خاضعة للقيمة المضافة؟"
            className="flex-1 bg-zinc-50 border border-zinc-200 text-xs font-semibold p-2.5 rounded-xl text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white"
          />
          <button
            type="submit"
            disabled={isAiLoading || !aiQuery.trim()}
            className="bg-zinc-950 text-white p-2.5 rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
