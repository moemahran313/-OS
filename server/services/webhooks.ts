import { db } from "./firebase.js";

export const executeWebhooks = async (userId: string, eventType: string, payload: any) => {
  try {
    const snap = await db.collection("settings").doc(userId).get();
    if (!snap.exists) return;
    const settings = snap.data();

    // Zapier Webhooks
    if (eventType === "lead.created" && settings?.zapierWebhookNewLead) {
      fetch(settings.zapierWebhookNewLead, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((err) => console.error("Zapier webhook failed", err));
    }

    if (eventType === "invoice.paid" && settings?.zapierWebhookInvoicePaid) {
      fetch(settings.zapierWebhookInvoicePaid, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((err) => console.error("Zapier webhook failed", err));
    }

    // Slack Integration
    if (settings?.slackWebhookUrl) {
      let slackMessage = "";
      if (eventType === "lead.created") {
        slackMessage = `:tada: *New Lead Created!*\n*Name:* ${payload.name}\n*Company:* ${payload.company}\n*Value:* SAR ${payload.value}`;
      } else if (eventType === "invoice.paid") {
        slackMessage = `:moneybag: *Invoice Paid!*\n*Invoice #:* ${payload.invoiceNumber}\n*Client:* ${payload.clientName}\n*Amount:* ${payload.total}`;
      } else if (eventType === "invoice.overdue") {
        slackMessage = `:warning: *Invoice Overdue!*\n*Invoice #:* ${payload.invoiceNumber}\n*Client:* ${payload.clientName}\n*Due Date:* ${payload.dueDate}`;
      }

      if (slackMessage) {
        fetch(settings.slackWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: slackMessage }),
        }).catch((err) => console.error("Slack webhook failed", err));
      }
    }
  } catch (error) {
    console.error("Execute Webhooks Error:", error);
  }
};
