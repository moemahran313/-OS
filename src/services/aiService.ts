export async function processBusinessCommand(command: string, language: string = "ar") {
  try {
    const res = await fetch("/api/ai/command", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command, language }),
    });

    if (!res.ok) {
      throw new Error("Failed to process command");
    }

    const data = await res.json();
    return data.text || "";
  } catch (error) {
    console.error("AI Error:", error);
    return language === "ar"
      ? "عذراً، حدث خطأ في معالجة طلبك."
      : "Sorry, an error occurred while processing your request.";
  }
}
