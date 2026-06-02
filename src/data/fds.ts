import {
  Landmark,
  TrendingUp,
  WalletCards,
  FileSpreadsheet,
  Home,
  Smartphone,
  Shield,
  BriefcaseBusiness,
} from "lucide-react";
import type { Account } from "../types";

export const initialAccounts: Account[] = [
  { icon: Landmark, name: "MBL Account", pct: 20, usage: "Business growth, marketing, staff, expansion", color: "#3B82F6", bg: "bg-blue-50" },
  { icon: TrendingUp, name: "PSX Account", pct: 20, usage: "Pakistan stock market investments", color: "#22C55E", bg: "bg-green-50" },
  { icon: WalletCards, name: "Mutual Funds Account", pct: 10, usage: "Stable long-term investments", color: "#F59E0B", bg: "bg-yellow-50" },
  { icon: FileSpreadsheet, name: "Euro Account", pct: 10, usage: "Currency diversification and Euro savings", color: "#60A5FA", bg: "bg-blue-50" },
  { icon: Home, name: "Europe Stock Exchange", pct: 10, usage: "International investments and ETFs", color: "#F97316", bg: "bg-orange-50" },
  { icon: Smartphone, name: "JazzCash", pct: 15, usage: "Emergency fund and opportunity reserve", color: "#EF4444", bg: "bg-red-50" },
  { icon: Shield, name: "EasyPaisa", pct: 5, usage: "Sadqa, khairat, zakat and helping others", color: "#10B981", bg: "bg-emerald-50" },
  { icon: BriefcaseBusiness, name: "Personal Flex Money (Cash form)", pct: 10, usage: "Travel, learning, gadgets, enjoyment", color: "#FBBF24", bg: "bg-amber-50" },
];
