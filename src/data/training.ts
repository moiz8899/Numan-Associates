import {
  Users,
  FileText,
  DollarSign,
  CreditCard,
  CheckCircle,
} from "lucide-react";

export const trainingKpis = [
  { label: "Total Clients", value: "0", change: "\u2014", trend: "positive", icon: Users, color: "#7c3aed", bg: "bg-violet-50" },
  { label: "Active Programs", value: "0", change: "\u2014", trend: "positive", icon: FileText, color: "#1a73e8", bg: "bg-blue-50" },
  { label: "Total Revenue", value: "PKR 0", change: "\u2014", trend: "positive", icon: DollarSign, color: "#16a34a", bg: "bg-green-50" },
  { label: "Pending Payments", value: "PKR 0", change: "\u2014", trend: "negative", icon: CreditCard, color: "#f97316", bg: "bg-orange-50" },
  { label: "Completed Programs", value: "0", change: "\u2014", trend: "positive", icon: CheckCircle, color: "#0d9488", bg: "bg-teal-50" },
];

export const trainingClients: string[][] = [];
export const trainingTasks: string[][] = [];
export const trainingGoals: string[][] = [];
export const trainingProgramStatus: { name: string; value: number; pct: string; color: string }[] = [];
export const trainingSessions: string[][] = [];
export const trainingRevenuePrograms: string[][] = [];
export const trainingCompletionRates: string[][] = [];
