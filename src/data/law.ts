import { Users, BriefcaseBusiness, DollarSign, CreditCard, FolderClosed } from "lucide-react";

export const lawKpis = [
  { label: "Total Clients", value: "0", change: "\u2014", trend: "positive", icon: Users, color: "#7c3aed", bg: "bg-violet-50" },
  { label: "Active Cases", value: "0", change: "\u2014", trend: "positive", icon: BriefcaseBusiness, color: "#1a73e8", bg: "bg-blue-50" },
  { label: "Total Revenue", value: "PKR 0", change: "\u2014", trend: "positive", icon: DollarSign, color: "#16a34a", bg: "bg-green-50" },
  { label: "Pending Payments", value: "PKR 0", change: "\u2014", trend: "negative", icon: CreditCard, color: "#f97316", bg: "bg-orange-50" },
  { label: "Closed Cases", value: "0", change: "\u2014", trend: "positive", icon: FolderClosed, color: "#0d9488", bg: "bg-teal-50" },
];

export const lawClients: string[][] = [];
export const lawTasks: string[][] = [];
export const lawTaskData: { name: string; value: number; pct: string; color: string }[] = [];
export const lawRevenueData: { month: string; value: number }[] = [];
export const matterTypes: { name: string; value: number; pct: string; color: string }[] = [];
export const caseStatusData: { name: string; value: number; pct: string; color: string }[] = [];
export const upcomingHearings: string[][] = [];
export const practiceAreas: string[][] = [];
