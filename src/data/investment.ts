import { Users, FileBarChart, DollarSign, WalletCards, TrendingUp } from "lucide-react";

export const investmentKpis = [
  { label: "Total Clients", value: "0", change: "\u2014", trend: "positive", icon: Users, color: "#7c3aed", bg: "bg-violet-50" },
  { label: "Total AUM", value: "PKR 0", change: "\u2014", trend: "positive", icon: FileBarChart, color: "#1a73e8", bg: "bg-blue-50" },
  { label: "Total Revenue", value: "PKR 0", change: "\u2014", trend: "positive", icon: DollarSign, color: "#16a34a", bg: "bg-green-50" },
  { label: "Pending Payments", value: "PKR 0", change: "\u2014", trend: "negative", icon: WalletCards, color: "#f97316", bg: "bg-orange-50" },
  { label: "Avg Portfolio ROI", value: "0%", change: "\u2014", trend: "positive", icon: TrendingUp, color: "#0d9488", bg: "bg-teal-50" },
];

export const investmentPortfolios: string[][] = [];
export const investmentManagementRows: string[][] = [];
export const investmentProfitRows: string[][] = [];
export const investmentReports: string[][] = [];
export const investmentGoals: string[][] = [];
export const portfolioDistribution: { name: string; value: number; pct: string; color: string }[] = [];
export const investmentReviews: string[][] = [];
export const topPortfolioTypes: string[][] = [];
export const marketOverview: string[][] = [];
