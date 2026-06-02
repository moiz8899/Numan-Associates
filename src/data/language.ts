import { Users, FileText, DollarSign, CreditCard, CheckCircle } from "lucide-react";

export const languageKpis = [
  { label: "Total Clients", value: "0", change: "\u2014", trend: "positive", icon: Users, color: "#7c3aed", bg: "bg-violet-50" },
  { label: "Active Projects", value: "0", change: "\u2014", trend: "positive", icon: FileText, color: "#1a73e8", bg: "bg-blue-50" },
  { label: "Total Revenue", value: "PKR 0", change: "\u2014", trend: "positive", icon: DollarSign, color: "#16a34a", bg: "bg-green-50" },
  { label: "Pending Payments", value: "PKR 0", change: "\u2014", trend: "negative", icon: CreditCard, color: "#f97316", bg: "bg-orange-50" },
  { label: "Completed Projects", value: "0", change: "\u2014", trend: "positive", icon: CheckCircle, color: "#0d9488", bg: "bg-teal-50" },
];

export const languageClients: string[][] = [];
export const languageTasks: string[][] = [];
export const languageGoals: string[][] = [];
export const languageProjectStatus: { name: string; value: number; pct: string; color: string }[] = [];
export const languageDeadlines: string[][] = [];
export const languageRevenueServices: string[][] = [];
