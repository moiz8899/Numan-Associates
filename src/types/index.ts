import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export interface Account {
  icon: LucideIcon;
  name: string;
  pct: number;
  usage: string;
  color: string;
  bg: string;
}

export interface HistoryRow {
  id: string;
  date: string;
  income: number;
  currency: string;
  allocations?: any;
}

export interface ModuleDetail {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  stats: { label: string; value: string; tone: string }[];
  workflow: string[];
}
