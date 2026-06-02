import {
  Users,
  DollarSign,
  CreditCard,
  ClipboardList,
  CheckCircle,
} from "lucide-react";

export const kpiCards = [
  { label: "Total Clients", value: "0", change: "\u2014", trend: "positive", icon: Users, color: "#1a73e8", bg: "bg-blue-50" },
  { label: "Total Revenue", value: "PKR 0", change: "\u2014", trend: "positive", icon: DollarSign, color: "#16a34a", bg: "bg-green-50" },
  { label: "Total Pending Payments", value: "PKR 0", change: "\u2014", trend: "negative", icon: CreditCard, color: "#f97316", bg: "bg-orange-50" },
  { label: "Active Tasks", value: "0", change: "\u2014", trend: "positive", icon: ClipboardList, color: "#7c3aed", bg: "bg-violet-50" },
  { label: "Total Completed Cases", value: "0", change: "\u2014", trend: "positive", icon: CheckCircle, color: "#0d9488", bg: "bg-teal-50" },
];

export const priorityTasks: string[][] = [];
export const departmentPerformance: { label: string; pct: number; color: string }[] = [];
export const pendingPayments: { company: string; service: string; amount: string; status: string; urgent: boolean }[] = [];
export const revenueData: { month: string; value: number }[] = [];
export const taskStatusData: { name: string; value: number; pct: string; color: string }[] = [];
