export interface NodeConfig {
  webhookUrl?: string;
  triggerEvent?: string;
  apiEndpoint?: string;
  promptTemplate?: string;
  selectedModel?: string;
  conditionField?: string;
  conditionOperator?: string;
  conditionValue?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  authMethod?: string;
}

export interface WorkflowNode {
  id: string;
  name: string;
  nameAr: string;
  desc: string;
  descAr: string;
  type: "trigger" | "action" | "condition";
  iconName: string;
  x: number;
  y: number;
  status: "idle" | "running" | "completed" | "warning" | "error";
  durationMs?: number;
  config: NodeConfig;
  inputPayload?: any;
  outputPayload?: any;
}

export interface WorkflowEdge {
  from: string;
  to: string;
  animated?: boolean;
}

export interface HistoricRun {
  id: string;
  timestamp: string;
  workflowName: string;
  status: "completed" | "warning" | "error";
  duration: string;
  triggeredBy: string;
}
