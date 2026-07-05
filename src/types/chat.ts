export type Channel =
  | "whatsapp"
  | "telegram"
  | "email"
  | "sms"
  | "messenger"
  | "instagram"
  | "livechat"
  | "slack"
  | "teams";

export type MessageStatus = "sent" | "delivered" | "read" | "failed" | "queued";

export type MessageSender = "client" | "user" | "ai" | "system";

export interface ChatAttachment {
  id: string;
  name: string;
  type: "image" | "pdf" | "document" | "audio" | "archive";
  size: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
  status: MessageStatus;
  channel: Channel;
  isInternalNote?: boolean;
  authorName?: string;
  attachments?: ChatAttachment[];
}

export type ConversationStatus = "active" | "unassigned" | "closed" | "snoozed";

export interface TicketSummary {
  id: string;
  title: string;
  status: "open" | "solved" | "pending";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
}

export interface InvoiceSummary {
  id: string;
  number: string;
  amount: number;
  status: "Paid" | "Unpaid" | "Draft" | "Overdue";
  date: string;
}

export interface ActivitySummary {
  id: string;
  title: string;
  type: "call" | "email" | "meeting" | "task";
  date: string;
  done: boolean;
}

export interface CustomerProfile {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  whatsapp?: string;
  telegram?: string;
  facebook?: string;
  instagram?: string;
  country: string;
  language: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  customerValue: number;
  tags: string[];
  notes: string;
  invoices: InvoiceSummary[];
  tickets: TicketSummary[];
  activities: ActivitySummary[];
  aiSummary: string;
  sentiment: "positive" | "neutral" | "negative" | "angry";
  urgency: "low" | "medium" | "high" | "critical";
  churnScore: number; // 0 to 100
  lastSeen: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: "message_received" | "sentiment_angry" | "off_hours" | "keyword_detected";
  triggerDetail?: string; // e.g. "pricing"
  actions: string[]; // e.g. ["create_opportunity", "send_auto_reply", "escalate_priority", "assign_to_group"]
  actionPayloads?: Record<string, any>;
  isActive: boolean;
}

export interface ChannelConfig {
  id: Channel;
  name: string;
  isEnabled: boolean;
  status: "connected" | "disconnected" | "configuring";
  details: Record<string, any>;
}
