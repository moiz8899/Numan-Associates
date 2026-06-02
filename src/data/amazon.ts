import { Users, ShoppingBag, ShoppingCart, DollarSign, FileBarChart } from "lucide-react";

export const amazonKpis = [
  { label: "Total Clients", value: "0", change: "\u2014", trend: "positive", icon: Users, color: "#7c3aed", bg: "bg-violet-50" },
  { label: "Total Revenue", value: "PKR 0", change: "\u2014", trend: "positive", icon: ShoppingBag, color: "#16a34a", bg: "bg-green-50" },
  { label: "Total Orders", value: "0", change: "\u2014", trend: "positive", icon: ShoppingCart, color: "#f97316", bg: "bg-orange-50" },
  { label: "ACoS (Average)", value: "0%", change: "\u2014", trend: "negative", icon: FileBarChart, color: "#1a73e8", bg: "bg-blue-50" },
  { label: "Total Profit", value: "PKR 0", change: "\u2014", trend: "positive", icon: DollarSign, color: "#0d9488", bg: "bg-teal-50" },
];

export const amazonClients: string[][] = [];
export const amazonRevenueData: { month: string; value: number }[] = [];
export const amazonTaskData: { name: string; value: number; pct: string; color: string }[] = [];
export const amazonSalesData: { name: string; value: number; pct: string; color: string }[] = [];
export const amazonCategories: string[][] = [];
export const accountHealth: { label: string; value: string; pct: number }[] = [];
