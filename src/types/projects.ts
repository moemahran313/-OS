export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  status: "pending" | "completed";
}

export interface Epic {
  id: string;
  name: string;
  description: string;
}

export interface SubTask {
  id: string;
  name: string;
  completed: boolean;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: "Backlog" | "Todo" | "In Progress" | "Review" | "Done";
  priority: "High" | "Medium" | "Low";
  startDate?: string;
  dueDate?: string;
  assignee: string;
  estimatedHours: number;
  actualHours: number;
  milestoneId?: string;
  epicId?: string;
  subTasks?: SubTask[];
}

export interface Resource {
  name: string;
  role: string;
  allocation: number; // percentage (e.g., 80)
  costRate: number; // SAR per hour
}

export interface Timesheet {
  id: string;
  taskId: string;
  taskName: string;
  description: string;
  date: string;
  hours: number;
  costRate: number; // copied from resource at time of log
  assignee: string;
  status: "Draft" | "Pending" | "Approved";
}

export interface ProjectExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "Planning" | "Active" | "Paused" | "Completed";
  priority: "High" | "Medium" | "Low";
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  billingMethod: "Fixed Price" | "Time & Materials";
  clientId?: string;
  clientName?: string;
  health: "On Track" | "At Risk" | "Critical";
  milestones: Milestone[];
  epics: Epic[];
  tasks: Task[];
  resources: Resource[];
  timesheets: Timesheet[];
  expenses: ProjectExpense[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}
