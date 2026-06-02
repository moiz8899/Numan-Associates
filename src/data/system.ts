import {
  Calendar,
  ClipboardList,
  CheckCircle,
  CreditCard,
  MessageSquare,
  FileBarChart,
  Download,
  Columns3,
  Shield,
  DollarSign,
} from "lucide-react";

export const aiAssistantUseCases: string[][] = [];
export const aiRecentDrafts: string[][] = [];

export const calendarKpis = [
  { label: "Today Events", value: "0", change: "\u2014", trend: "positive", icon: Calendar, color: "#1a73e8", bg: "bg-blue-50" },
  { label: "This Week", value: "0", change: "\u2014", trend: "positive", icon: ClipboardList, color: "#7c3aed", bg: "bg-violet-50" },
  { label: "Completed", value: "0", change: "\u2014", trend: "positive", icon: CheckCircle, color: "#16a34a", bg: "bg-green-50" },
  { label: "Overdue", value: "0", change: "\u2014", trend: "negative", icon: CreditCard, color: "#f97316", bg: "bg-orange-50" },
  { label: "Client Follow-ups", value: "0", change: "\u2014", trend: "positive", icon: MessageSquare, color: "#0d9488", bg: "bg-teal-50" },
];

export const reminderRows: string[][] = [];
export const reminderStatusData: { name: string; value: number; pct: string; color: string }[] = [];

export const reportsKpis = [
  { label: "Reports Generated", value: "0", change: "\u2014", trend: "positive", icon: FileBarChart, color: "#1a73e8", bg: "bg-blue-50" },
  { label: "Exports", value: "0", change: "\u2014", trend: "positive", icon: Download, color: "#16a34a", bg: "bg-green-50" },
  { label: "Dashboards", value: "0", change: "\u2014", trend: "positive", icon: Columns3, color: "#7c3aed", bg: "bg-violet-50" },
  { label: "Anomalies", value: "0", change: "\u2014", trend: "negative", icon: Shield, color: "#f97316", bg: "bg-orange-50" },
  { label: "Revenue YTD", value: "PKR 0", change: "\u2014", trend: "positive", icon: DollarSign, color: "#0d9488", bg: "bg-teal-50" },
];

export const serviceRevenueReport: { month: string; taxation: number; amazon: number; law: number; immigration: number }[] = [];
export const reportRows: string[][] = [];

export const searchResultRows: string[][] = [];
export const savedFilters: string[][] = [];

export const settingsUsers: string[][] = [];
export const moduleSettings: string[][] = [];
