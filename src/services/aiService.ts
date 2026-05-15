
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function processBusinessCommand(command: string) {
  try {
    // 1. Fetch real context from backend
    let contextData = null;
    try {
      const contextRes = await fetch("/api/ai/context");
      if (contextRes.ok) {
        contextData = await contextRes.json();
      }
    } catch (e) {
      console.warn("Could not fetch AI context", e);
    }

    // 2. Prepare prompt with real data
    const contextStr = contextData 
      ? `User Context: Business: ${contextData.companyName}, City: ${contextData.city}. 
         Stats: ${contextData.leads} leads, ${contextData.invoices} invoices, ${contextData.employees} employees.`
      : "User Context: Local environment, no DB stats available.";

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: command,
      config: {
        systemInstruction: `You are the core AI operator for Mudarij OS (مدارج), an Arabic Business Operating System for GCC SMEs.
        ${contextStr}
        Your goal is to parse user commands and suggest actions based on their REAL data above.
        
        Available modules: CRM, Invoicing (VAT GCC), Payroll, Analytics.
        Respond in a helpful, professional Arabic tone. Be concise.`,
      },
    });
    
    return response.text || "لم أتمكن من معالجة الطلب.";
  } catch (error) {
    console.error("AI Error:", error);
    return "عذراً، حدث خطأ في معالجة طلبك.";
  }
}
