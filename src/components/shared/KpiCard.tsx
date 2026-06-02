import type { LucideIcon } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

const kpiSparkData = [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }];

interface KpiCardProps {
  label: string;
  value: string;
  change: string;
  trend: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export function KpiCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  color,
  bg,
}: KpiCardProps) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`} style={{ color }}>
          <Icon size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-950">{value}</p>
        </div>
      </div>
      <div className="mt-4 flex items-end gap-3">
        <div className="h-10 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={kpiSparkData}>
              <Line type="monotone" dataKey="v" dot={false} stroke={color} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="text-right">
          <p className={`text-sm font-extrabold ${trend === "negative" ? "text-red-600" : "text-emerald-600"}`}>{change}</p>
          <p className="text-[11px] font-bold text-slate-400">vs last month</p>
        </div>
      </div>
    </div>
  );
}
