import { useState, useEffect, useMemo } from "react";
import {
  Landmark,
  TrendingUp,
  WalletCards,
  FileSpreadsheet,
  Home,
  Smartphone,
  Shield,
  BriefcaseBusiness,
  Pencil,
  Download,
  Printer,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { Card } from "../../components/shared/Card";
import { Toast, type ToastType } from "../../components/shared/Toast";
import type { Account, HistoryRow } from "../../types";
import { initialAccounts } from "../../data/fds";
import { exportToPDF, exportToExcel, triggerPrint } from "../../utils/export";
import { useTable } from "../../hooks/useTable";

interface FdsAccountRecord {
  id: string;
  name: string;
  pct: number;
  usage: string;
  color: string;
  bg: string;
  iconName?: string;
}

const today = new Date().toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatMoney(value: number, currency: string) {
  return `${currency} ${Math.round(value).toLocaleString()}`;
}

export function FdsDashboard() {
  const [income, setIncome] = useState(0);
  const [currency, setCurrency] = useState("PKR");
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [calculatedIncome, setCalculatedIncome] = useState(0);
  const [displayIncome, setDisplayIncome] = useState(0);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const showToast = (msg: string, type: ToastType = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // useTable for FDS History
  const historyTable = useTable<HistoryRow>({
    initialData: [],
    searchFields: ["date", "currency"],
    defaultPageSize: 10,
    supabaseTable: "fds_history",
  });

  const accountsTable = useTable<FdsAccountRecord>({
    initialData: [],
    searchFields: ["name", "usage"],
    defaultPageSize: 10,
    supabaseTable: "fds_accounts",
  });

  const iconMap: Record<string, typeof Landmark> = {
    Landmark,
    TrendingUp,
    WalletCards,
    FileSpreadsheet,
    Home,
    Smartphone,
    Shield,
    BriefcaseBusiness,
  };

  useEffect(() => {
    if (accountsTable.data.length > 0) {
      setAccounts(
        accountsTable.data.map((record) => ({
          icon: iconMap[record.iconName ?? record.name] ?? Landmark,
          name: record.name,
          pct: record.pct,
          usage: record.usage,
          color: record.color,
          bg: record.bg,
        }))
      );
    }
  }, [accountsTable.data]);

  // Export handlers
  const handleExport = (format: "pdf" | "excel") => {
    const headers = ["#", "Account / Purpose", "Percentage", "Allocated Amount", "Usage"];
    const rows = accounts.map((a, i) => [
      String(i + 1),
      a.name,
      `${a.pct}%`,
      `${currency} ${Math.round((displayIncome * a.pct) / 100).toLocaleString()}`,
      a.usage,
    ]);
    if (format === "pdf") {
      exportToPDF({ title: "Financial Diversification Summary", headers, rows, fileName: "fds_distribution" });
    } else {
      exportToExcel({ title: "FDS Distribution", headers, rows, fileName: "fds_distribution" });
    }
    showToast(`Distribution exported to ${format.toUpperCase()}`);
  };

  const handlePrint = () => {
    triggerPrint();
    showToast("Print dialog opened", "info");
  };

  const totalPct = accounts.reduce((sum, account) => sum + account.pct, 0);
  const investments = useMemo(
    () =>
      accounts
        .filter((a) =>
          ["MBL Account", "PSX Account", "Mutual Funds Account", "Europe Stock Exchange", "Euro Account"].includes(
            a.name
          )
        )
        .reduce((sum, a) => sum + (displayIncome * a.pct) / 100, 0),
    [accounts, displayIncome]
  );
  const emergency = (displayIncome * (accounts.find((a) => a.name === "JazzCash")?.pct ?? 0)) / 100;
  const charity = (displayIncome * (accounts.find((a) => a.name === "EasyPaisa")?.pct ?? 0)) / 100;

  useEffect(() => {
    const start = displayIncome;
    const end = calculatedIncome;
    const diff = end - start;
    if (diff === 0) return;
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      setDisplayIncome(Math.round(start + diff * Math.min(frame / 18, 1)));
      if (frame >= 18) window.clearInterval(id);
    }, 18);
    return () => window.clearInterval(id);
  }, [calculatedIncome]);

  const handleCalculate = async () => {
    if (income <= 0) {
      setError("Please enter a valid income amount");
      return;
    }
    if (totalPct !== 100) {
      setError(`Percentages must total 100%. Current total: ${totalPct}%`);
      return;
    }
    setError("");
    setCalculatedIncome(income);

    const allocations = accounts.map((a) => ({
      name: a.name,
      pct: a.pct,
      amount: Math.round((income * a.pct) / 100),
    }));

    try {
      await historyTable.addItem({
        id: String(Date.now()),
        date: today,
        income,
        currency,
        allocations,
      });
      showToast("Distribution calculated and saved!");
    } catch (err) {
      showToast("Failed to save history to Supabase", "error");
    }
  };

  const handleReset = () => {
    setIncome(0);
    setCalculatedIncome(0);
    setDisplayIncome(0);
    setError("");
  };

  const updatePct = (name: string, value: string) => {
    const pct = Math.max(0, Number(value) || 0);
    setAccounts((current) =>
      current.map((account) => (account.name === name ? { ...account, pct } : account))
    );
  };

  const handleClearHistory = async () => {
    try {
      await Promise.all(historyTable.data.map((h) => historyTable.deleteItem(h.id)));
      showToast("Calculation history cleared", "error");
    } catch (err) {
      showToast("Failed to clear history", "error");
    }
  };

  return (
    <>
      <Toast message={toastMessage} type={toastType} isOpen={toastOpen} onClose={() => setToastOpen(false)} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-slate-955">Enter Monthly Surplus Income</h2>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-12 rounded-xl border border-slate-300 px-4 text-sm font-extrabold outline-none focus:border-brand bg-white text-slate-700"
              >
                <option>PKR</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
              <input
                type="number"
                min={0}
                value={income || ""}
                onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
                className="h-12 flex-1 rounded-xl border border-slate-300 px-4 text-lg font-bold outline-none focus:border-brand"
                placeholder="Enter amount e.g. 100,000"
              />
            </div>
            {error ? <p className="mt-3 text-sm font-extrabold text-red-600">{error}</p> : null}
            {totalPct !== 100 ? (
              <p className="mt-3 inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-extrabold text-yellow-800">
                Warning: Percentages must total 100%. Current total: {totalPct}%
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row xl:flex-col 2xl:flex-row">
            <button
              onClick={handleCalculate}
              className="h-12 rounded-xl bg-green-600 px-6 text-sm font-extrabold text-white shadow-soft hover:bg-green-700"
            >
              Calculate Distribution
            </button>
            <button
              onClick={handleReset}
              className="h-12 rounded-xl border border-slate-300 px-5 text-sm font-extrabold text-slate-600 hover:bg-slate-50 bg-white"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm font-bold text-slate-500">
          <span>
            Total Input: <b className="text-slate-955">{formatMoney(income, currency)}</b>
          </span>
          <span>Last Updated: {today}</span>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="space-y-6">
          <Card
            title="Account Distribution"
            subtext="Surplus income is automatically allocated across accounts based on fixed percentages."
          >
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[980px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {["Icon", "Account / Purpose", "Percentage", "Allocated Amount", "Usage", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 font-extrabold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map((account) => {
                    const amount = (displayIncome * account.pct) / 100;
                    const AccountIcon = account.icon;
                    return (
                      <tr key={account.name} className={`${account.bg} text-sm`}>
                        <td className="px-5 py-4">
                          <AccountIcon size={24} style={{ color: account.color }} />
                        </td>
                        <td className="px-5 py-4 font-extrabold text-slate-955">{account.name}</td>
                        <td className="px-5 py-4">
                          {editing === account.name ? (
                            <input
                              className="w-20 rounded-lg border border-slate-300 px-2 py-1 font-bold bg-white"
                              type="number"
                              value={account.pct}
                              onChange={(e) => updatePct(account.name, e.target.value)}
                              onBlur={() => setEditing(null)}
                              autoFocus
                            />
                          ) : (
                            <span className="font-extrabold" style={{ color: account.color }}>
                              {account.pct}%
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-base font-extrabold text-emerald-700">
                          {formatMoney(amount, currency)}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-600">{account.usage}</td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setEditing(account.name)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-50 shadow-sm"
                          >
                            <Pencil size={14} /> Edit %
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-900 text-sm text-white">
                    <td className="px-5 py-4 font-extrabold" colSpan={2}>
                      TOTAL
                    </td>
                    <td className="px-5 py-4 font-extrabold">{totalPct}%</td>
                    <td className="px-5 py-4 text-base font-extrabold">{formatMoney(displayIncome, currency)}</td>
                    <td className="px-5 py-4">-</td>
                    <td className="px-5 py-4">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <InfoCard
              title="1. HBL Account"
              icon={Home}
              purpose="Monthly household expenses (salary accounts and routine expenses)"
            />
            <InfoCard title="2. SBL Account" icon={Shield} purpose="Other people's money / amanat / temporary holding" />
          </div>
        </div>

        <aside className="space-y-6">
          <Card title="Distribution Overview">
            <div className="p-5">
              <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={accounts} innerRadius={70} outerRadius={105} paddingAngle={2} dataKey="pct">
                      {accounts.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-xl font-extrabold text-slate-950">{formatMoney(displayIncome, currency)}</p>
                  <p className="text-xs font-bold text-slate-500">Total</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {accounts.map((a) => (
                  <div
                    key={a.name}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2 font-bold text-slate-700">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: a.color }} />
                      {a.name}
                    </span>
                    <span className="font-extrabold">{a.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Allocation Summary">
            <div className="grid grid-cols-2 gap-3 p-5">
              <SummaryTile
                icon={BriefcaseBusiness}
                label="Investments"
                detail="MBL + PSX + Mutual + Europe"
                value={`${formatMoney(investments, currency)} - 70%`}
              />
              <SummaryTile icon={Landmark} label="Banking" detail="HBL + SBL (structural)" value="Info only" />
              <SummaryTile icon={Shield} label="Emergency" detail="JazzCash" value={`${formatMoney(emergency, currency)} - 15%`} />
              <SummaryTile icon={WalletCards} label="Charity" detail="EasyPaisa" value={`${formatMoney(charity, currency)} - 5%`} />
            </div>
          </Card>

          <Card
            title="Calculation History"
            action={
              <button onClick={handleClearHistory} className="text-sm font-extrabold text-red-600">
                Clear All
              </button>
            }
          >
            <div className="divide-y divide-slate-100">
              {historyTable.data.map((row, index) => (
                <button
                  key={row.id || `${row.date}-${index}`}
                  onClick={() => {
                    setCurrency(row.currency);
                    setIncome(row.income);
                    setCalculatedIncome(row.income);
                    if (row.allocations && Array.isArray(row.allocations)) {
                      setAccounts((current) =>
                        current.map((acc) => {
                          const saved = row.allocations.find((a: any) => a.name === acc.name);
                          return saved ? { ...acc, pct: saved.pct } : acc;
                        })
                      );
                    }
                  }}
                  className="grid w-full grid-cols-3 gap-2 px-5 py-4 text-left text-sm hover:bg-slate-50"
                >
                  <span className="font-bold text-slate-700">{row.date}</span>
                  <span className="font-semibold text-slate-500">{formatMoney(row.income, row.currency)}</span>
                  <span className="font-extrabold text-emerald-600">{formatMoney(row.income, row.currency)}</span>
                </button>
              ))}
              {historyTable.data.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm font-bold text-slate-400">
                  No calculation history yet
                </div>
              ) : null}
            </div>
          </Card>

          <Card title="Export Distribution">
            <div className="space-y-3 p-5">
              <ExportButton icon={Download} label="Export as PDF" onClick={() => handleExport("pdf")} />
              <ExportButton icon={FileSpreadsheet} label="Export as Excel" onClick={() => handleExport("excel")} />
              <ExportButton icon={Printer} label="Print Summary" onClick={handlePrint} />
            </div>
          </Card>
        </aside>
      </section>
    </>
  );
}

function InfoCard({ title, icon: Icon, purpose }: { title: string; icon: any; purpose: string }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-955">{title}</h3>
          <p className="mt-4 text-sm font-extrabold text-slate-700">Purpose:</p>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{purpose}</p>
        </div>
        <Icon size={44} className="shrink-0 text-brand text-blue-600" />
      </div>
    </div>
  );
}

function SummaryTile({ icon: Icon, label, detail, value }: { icon: any; label: string; detail: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <Icon size={22} className="text-slate-700" />
      <p className="mt-2 text-sm font-extrabold text-slate-900">{label}</p>
      <p className="mt-1 min-h-10 text-xs font-semibold text-slate-500">{detail}</p>
      <p className="mt-2 text-sm font-extrabold text-emerald-600">{value}</p>
    </div>
  );
}

function ExportButton({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition">
      <Icon size={18} />
      {label}
    </button>
  );
}
