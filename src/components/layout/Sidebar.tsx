import { ChevronRight, Shield } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { fdsModule, mainNav, systemNav } from "../../data/navigation";
import type { NavItem } from "../../types";

const sparkData = [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }];

interface SidebarProps {
  activeModule: string;
  onSelect: (label: string) => void;
}

function SidebarItem({
  item,
  activeModule,
  onSelect,
  system = false,
}: {
  item: NavItem;
  activeModule: string;
  onSelect: (label: string) => void;
  system?: boolean;
}) {
  const Icon = item.icon;
  const isActive = activeModule === item.label;

  return (
    <button
      onClick={() => onSelect(item.label)}
      className={`group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition ${
        isActive ? "bg-brand text-white shadow-soft" : "text-slate-200 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon size={18} />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-bold text-emerald-950">
          {item.badge}
        </span>
      ) : null}
      {!system && !isActive ? <ChevronRight size={16} className="opacity-60" /> : null}
    </button>
  );
}

function TaxSidebarSubItem({ label, active = false, tone }: { label: string; active?: boolean; tone: string }) {
  return (
    <button
      className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition ${
        active ? "bg-brand text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${tone}`} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

export function Sidebar({ activeModule, onSelect }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-[#0d1b2a] text-white lg:flex">
      <div className="flex h-24 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
          <Shield size={27} />
        </div>
        <div>
          <p className="text-[13px] font-extrabold leading-tight tracking-wide">NUMAN AND ASSOCIATES</p>
          <p className="mt-1 text-xs font-medium text-slate-300">Consultancy Firm</p>
        </div>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-5">
        <nav className="space-y-1.5">
          {mainNav.map((item) => (
            <div key={item.label}>
              <SidebarItem item={item} activeModule={activeModule} onSelect={onSelect} />
              {activeModule === "Taxation Services" && item.label === "Taxation Services" ? (
                <div className="mt-4 space-y-1">
                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Taxation Services
                  </p>
                  <TaxSidebarSubItem label="Pakistan Taxation" active tone="bg-emerald-400" />
                  <TaxSidebarSubItem label="USA Taxation" tone="bg-blue-400" />
                  <TaxSidebarSubItem label="Germany Taxation" tone="bg-yellow-400" />
                </div>
              ) : null}
              {activeModule === "Amazon Services" && item.label === "Amazon Services" ? (
                <div className="mt-4 space-y-1">
                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Amazon Services
                  </p>
                  <TaxSidebarSubItem label="Clients" active tone="bg-blue-400" />
                  <TaxSidebarSubItem label="Tasks" tone="bg-orange-400" />
                  <TaxSidebarSubItem label="Goals" tone="bg-emerald-400" />
                </div>
              ) : null}
              {activeModule === "Law Services" && item.label === "Law Services" ? (
                <div className="mt-4 space-y-1">
                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Law Services
                  </p>
                  <TaxSidebarSubItem label="Clients" active tone="bg-blue-400" />
                  <TaxSidebarSubItem label="Tasks" tone="bg-orange-400" />
                  <TaxSidebarSubItem label="Goals" tone="bg-emerald-400" />
                  <TaxSidebarSubItem label="Case Calendar" tone="bg-violet-400" />
                  <TaxSidebarSubItem label="Reports" tone="bg-cyan-400" />
                </div>
              ) : null}
              {activeModule === "Immigration Services" && item.label === "Immigration Services" ? (
                <div className="mt-4 space-y-1">
                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Immigration Services
                  </p>
                  <TaxSidebarSubItem label="Clients" active tone="bg-blue-400" />
                  <TaxSidebarSubItem label="Tasks" tone="bg-orange-400" />
                  <TaxSidebarSubItem label="Goals" tone="bg-emerald-400" />
                </div>
              ) : null}
              {activeModule === "Language Services" && item.label === "Language Services" ? (
                <div className="mt-4 space-y-1">
                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Language Services
                  </p>
                  <TaxSidebarSubItem label="Clients" active tone="bg-blue-400" />
                  <TaxSidebarSubItem label="Tasks" tone="bg-orange-400" />
                  <TaxSidebarSubItem label="Goals" tone="bg-emerald-400" />
                </div>
              ) : null}
              {activeModule === "Investment Services" && item.label === "Investment Services" ? (
                <div className="mt-4 space-y-1">
                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Investment Services
                  </p>
                  <TaxSidebarSubItem label="Client Portfolios" active tone="bg-blue-400" />
                  <TaxSidebarSubItem label="Portfolio Management" tone="bg-orange-400" />
                  <TaxSidebarSubItem label="Profit Tracking" tone="bg-emerald-400" />
                  <TaxSidebarSubItem label="Financial Reports" tone="bg-violet-400" />
                  <TaxSidebarSubItem label="Investment Goals" tone="bg-cyan-400" />
                </div>
              ) : null}
              {activeModule === "Academic Services" && item.label === "Academic Services" ? (
                <div className="mt-4 space-y-1">
                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Academic Services
                  </p>
                  <TaxSidebarSubItem label="Clients" active tone="bg-blue-400" />
                  <TaxSidebarSubItem label="Tasks" tone="bg-orange-400" />
                  <TaxSidebarSubItem label="Goals" tone="bg-emerald-400" />
                </div>
              ) : null}
              {activeModule === "Marketing Services" && item.label === "Marketing Services" ? (
                <div className="mt-4 space-y-1">
                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Marketing Services
                  </p>
                  <TaxSidebarSubItem label="Clients" active tone="bg-blue-400" />
                  <TaxSidebarSubItem label="Tasks" tone="bg-orange-400" />
                  <TaxSidebarSubItem label="Goals" tone="bg-emerald-400" />
                </div>
              ) : null}
              {activeModule === "Training Services" && item.label === "Training Services" ? (
                <div className="mt-4 space-y-1">
                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Training Services
                  </p>
                  <TaxSidebarSubItem label="Clients" active tone="bg-blue-400" />
                  <TaxSidebarSubItem label="Tasks" tone="bg-orange-400" />
                  <TaxSidebarSubItem label="Goals" tone="bg-emerald-400" />
                </div>
              ) : null}
            </div>
          ))}
        </nav>
        <p className="mb-2 mt-7 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">System</p>
        <nav className="space-y-1.5">
          {systemNav.map((item) => (
            <SidebarItem key={item.label} item={item} activeModule={activeModule} onSelect={onSelect} system />
          ))}
        </nav>
      </div>
      <div className="border-t border-white/10 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-xs font-extrabold leading-tight">Numan and Associates</p>
            <p className="text-[11px] font-medium text-slate-400">Consultancy Firm</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs font-bold text-slate-300">
            {activeModule === "Taxation Services" ? "Total Revenue (All Tax)" : "Total Revenue (All Services)"}
          </p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-400">PKR 0</p>
          <div className="mt-3 flex items-end gap-3">
            <div className="h-9 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <Line type="monotone" dataKey="v" dot={false} stroke="#34d399" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <span className="text-xs font-extrabold text-emerald-300">—</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">vs last month</p>
        </div>
        <p className="mt-4 text-[11px] font-semibold text-slate-500">© 2024 All Rights Reserved</p>
      </div>
    </aside>
  );
}
