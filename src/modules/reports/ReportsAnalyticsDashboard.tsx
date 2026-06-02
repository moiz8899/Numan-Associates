import { useState } from "react";
import {
  FileBarChart,
  Download,
  Columns3,
  Shield,
  DollarSign,
  FileSpreadsheet,
  Printer,
  ChevronDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card } from "../../components/shared/Card";
import { KpiCard } from "../../components/shared/KpiCard";
import { ActionIcons } from "../../components/shared/ActionIcons";
import { SystemStatusBadge } from "../../components/shared/badges";
import { Modal } from "../../components/shared/Modal";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { ViewDrawer } from "../../components/shared/ViewDrawer";
import { Toast, type ToastType } from "../../components/shared/Toast";
import { useTable } from "../../hooks/useTable";
import { PaginatedTableFooter } from "../../components/shared/TableFooter";
import { TableActions } from "../../components/shared/TableActions";
import { exportToPDF, exportToExcel, triggerPrint } from "../../utils/export";

// Types
interface ReportRecord {
  id: string;
  name: string;
  category: string;
  period: string;
  preparedBy: string;
  status: string;
  created_at?: string;
}

const categoryOptions = ["Financial", "Taxation", "Immigration", "Amazon", "Law", "Management", "Academic", "Training"];

export function ReportsAnalyticsDashboard() {
  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const showToast = (msg: string, type: ToastType = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // useTable
  const reportsTable = useTable<ReportRecord>({
    initialData: [],
    searchFields: ["name", "category", "period", "preparedBy", "status"],
    defaultPageSize: 5,
    supabaseTable: "reports",
  });

  const [showExportMenu, setShowExportMenu] = useState(false);

  // Form state
  const [form, setForm] = useState<Omit<ReportRecord, "id">>({
    name: "",
    category: "Financial",
    period: "",
    preparedBy: "",
    status: "Draft",
  });

  // Dynamic KPIs
  const published = reportsTable.data.filter((r) => r.status === "Published").length;
  const drafts = reportsTable.data.filter((r) => r.status === "Draft").length;
  const underReview = reportsTable.data.filter((r) => r.status === "Under Review").length;
  const reportValue = reportsTable.data.length * 120000;

  const kpis = [
    { label: "Reports Generated", value: String(reportsTable.data.length), change: "—", trend: "positive", icon: FileBarChart, color: "#1a73e8", bg: "bg-blue-50" },
    { label: "Published", value: String(published), change: "—", trend: "positive", icon: Download, color: "#16a34a", bg: "bg-green-50" },
    { label: "Drafts", value: String(drafts), change: "—", trend: "positive", icon: Columns3, color: "#7c3aed", bg: "bg-violet-50" },
    { label: "Under Review", value: String(underReview), change: "—", trend: "negative", icon: Shield, color: "#f97316", bg: "bg-orange-50" },
    { label: "Revenue YTD", value: `PKR ${reportValue.toLocaleString()}`, change: "—", trend: "positive", icon: DollarSign, color: "#0d9488", bg: "bg-teal-50" },
  ];

  const lastSixMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  });

  const reportsByMonth = reportsTable.data.reduce<Record<string, number>>((acc, report) => {
    if (!report.created_at) return acc;
    const month = new Date(report.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const revenueData = lastSixMonths.map((month) => ({
    month,
    value: reportsByMonth[month] || 0,
  }));

  const categoryCounts = reportsTable.data.reduce<Record<string, number>>((acc, report) => {
    const key = report.category || "Other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const totalCategoryCount = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0) || 1;
  const chartColors = ["#1a73e8", "#f97316", "#22c55e", "#8b5cf6", "#64748b"];
  const serviceMix = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count], idx) => ({
      label,
      pct: Math.round((count / totalCategoryCount) * 100),
      color: chartColors[idx % chartColors.length],
    }));

  // Export
  const handleExport = (format: "pdf" | "excel") => {
    setShowExportMenu(false);
    const headers = ["#", "Report Name", "Category", "Period", "Prepared By", "Status"];
    const rows = reportsTable.data.map((r, i) => [
      String(i + 1), r.name, r.category, r.period, r.preparedBy, r.status,
    ]);
    if (format === "pdf") {
      exportToPDF({ title: "Reports & Analytics", headers, rows, fileName: "reports_analytics" });
    } else {
      exportToExcel({ title: "Reports Analytics", headers, rows, fileName: "reports_analytics" });
    }
    showToast(`Reports exported to ${format.toUpperCase()}`);
  };

  // CRUD
  const openAdd = () => {
    setForm({ name: "", category: "Financial", period: "", preparedBy: "", status: "Draft" });
    reportsTable.setIsAddOpen(true);
  };

  const openEdit = (r: ReportRecord) => {
    setForm({ name: r.name, category: r.category, period: r.period, preparedBy: r.preparedBy, status: r.status });
    reportsTable.selectItemForAction(r, "edit");
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    reportsTable.addItem({ id: String(Date.now()), ...form });
    reportsTable.setIsAddOpen(false);
    showToast(`Report "${form.name}" generated successfully!`);
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportsTable.selectedItem) return;
    reportsTable.updateItem({ id: reportsTable.selectedItem.id, ...form });
    reportsTable.setIsEditOpen(false);
    showToast("Report updated!");
  };

  const columns = ["#", "Report Name", "Category", "Period", "Prepared By", "Status", "Actions"];

  return (
    <>
      <Toast message={toastMessage} type={toastType} isOpen={toastOpen} onClose={() => setToastOpen(false)} />

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.8fr)]">
        <div className="space-y-6">
          {/* Revenue Chart */}
          <Card
            title="Revenue Analytics"
            subtext="Compare revenue trends across the core service departments."
            action={
              <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-700">
                <option>Last 6 Months</option>
              </select>
            }
          >
            <div className="h-96 p-5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}`}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                  />
                  <Tooltip formatter={(value) => [`${value} reports`, "Count"]} />
                  <Area type="monotone" dataKey="value" stroke="#1a73e8" fill="#bfdbfe" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Report Library Table */}
          <Card
            title="Report Library"
            subtext="Generate, review, and export management reports."
            action={
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                  >
                    <Download size={14} /> Export <ChevronDown size={12} />
                  </button>
                  {showExportMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                      <div className="absolute right-0 mt-2 z-20 w-44 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl animate-scale-up space-y-1">
                        <button onClick={() => handleExport("pdf")} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 transition">Export to PDF</button>
                        <button onClick={() => handleExport("excel")} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 transition">Export to Excel</button>
                      </div>
                    </>
                  )}
                </div>
                <button onClick={triggerPrint} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition shadow-sm">
                  <Printer size={14} />
                </button>
                <button onClick={openAdd} className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-extrabold text-white shadow-soft hover:bg-emerald-700 transition">
                  + Generate Report
                </button>
              </div>
            }
          >
            <div className="p-4 border-b border-slate-100">
              <TableActions searchQuery={reportsTable.searchQuery} onSearchChange={reportsTable.setSearchQuery} searchPlaceholder="Search reports..." columns={columns} visibleColumns={reportsTable.visibleColumns} onToggleColumn={(col) => reportsTable.setVisibleColumns((c) => ({ ...c, [col]: c[col] === false }))} />
            </div>
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {columns.map((h) => reportsTable.visibleColumns[h] !== false && (
                      <th key={h} className="px-4 py-3 font-extrabold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportsTable.paginatedData.map((row, i) => (
                    <tr key={row.id} className="text-sm hover:bg-slate-50 transition duration-100">
                      {reportsTable.visibleColumns["#"] !== false && <td className="px-4 py-3 font-extrabold text-slate-400">{(reportsTable.currentPage - 1) * reportsTable.pageSize + i + 1}</td>}
                      {reportsTable.visibleColumns["Report Name"] !== false && <td className="px-4 py-3 font-extrabold text-slate-900">{row.name}</td>}
                      {reportsTable.visibleColumns["Category"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.category}</td>}
                      {reportsTable.visibleColumns["Period"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.period}</td>}
                      {reportsTable.visibleColumns["Prepared By"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.preparedBy}</td>}
                      {reportsTable.visibleColumns["Status"] !== false && (
                        <td className="px-4 py-3"><SystemStatusBadge status={row.status} /></td>
                      )}
                      {reportsTable.visibleColumns["Actions"] !== false && (
                        <td className="px-4 py-3">
                          <ActionIcons
                            onView={() => reportsTable.selectItemForAction(row, "view")}
                            onEdit={() => openEdit(row)}
                            onDelete={() => reportsTable.selectItemForAction(row, "delete")}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                  {reportsTable.paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-12 text-center text-sm font-bold text-slate-400">
                        No reports found. Click "+ Generate Report" to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginatedTableFooter currentPage={reportsTable.currentPage} totalPages={reportsTable.totalPages} pageSize={reportsTable.pageSize} totalItems={reportsTable.filteredData.length} onPageChange={reportsTable.setCurrentPage} onPageSizeChange={reportsTable.setPageSize} />
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Card title="Export Center">
            <div className="space-y-3 p-5">
              <ExportButton icon={Download} label="Export PDF" onClick={() => handleExport("pdf")} />
              <ExportButton icon={FileSpreadsheet} label="Export Excel" onClick={() => handleExport("excel")} />
              <ExportButton icon={Printer} label="Print Dashboard" onClick={triggerPrint} />
            </div>
          </Card>
          <Card title="Service Mix">
            <div className="space-y-4 p-5">
              {serviceMix.map((item) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-extrabold text-slate-700">{item.label}</span>
                    <span className="font-extrabold text-slate-500">{item.pct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </section>

      {/* Add Modal */}
      <Modal isOpen={reportsTable.isAddOpen} onClose={() => reportsTable.setIsAddOpen(false)} title="Generate New Report">
        <form onSubmit={submitAdd} className="space-y-4">
          <FormField label="Report Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Monthly Revenue Summary" required />
          <FormSelect label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={categoryOptions} />
          <FormField label="Period" value={form.period} onChange={(v) => setForm({ ...form, period: v })} placeholder="e.g. Jan–Mar 2026" required />
          <FormField label="Prepared By" value={form.preparedBy} onChange={(v) => setForm({ ...form, preparedBy: v })} placeholder="e.g. Numan Ali" required />
          <FormSelect label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["Draft", "Under Review", "Published"]} />
          <FormActions onCancel={() => reportsTable.setIsAddOpen(false)} submitLabel="Generate Report" />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={reportsTable.isEditOpen} onClose={() => reportsTable.setIsEditOpen(false)} title="Edit Report Details">
        <form onSubmit={submitEdit} className="space-y-4">
          <FormField label="Report Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <FormSelect label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={categoryOptions} />
          <FormField label="Period" value={form.period} onChange={(v) => setForm({ ...form, period: v })} required />
          <FormField label="Prepared By" value={form.preparedBy} onChange={(v) => setForm({ ...form, preparedBy: v })} required />
          <FormSelect label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["Draft", "Under Review", "Published"]} />
          <FormActions onCancel={() => reportsTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>

      {/* View Drawer */}
      <ViewDrawer isOpen={reportsTable.isViewOpen} onClose={() => reportsTable.setIsViewOpen(false)} title={reportsTable.selectedItem?.name || "Report"}>
        {reportsTable.selectedItem && (
          <div className="space-y-4">
            <DetailCard label="Report Details" items={[["Report Name", reportsTable.selectedItem.name], ["Category", reportsTable.selectedItem.category]]} />
            <DetailCard label="Publishing" items={[["Period", reportsTable.selectedItem.period], ["Prepared By", reportsTable.selectedItem.preparedBy], ["Status", reportsTable.selectedItem.status]]} />
          </div>
        )}
      </ViewDrawer>

      {/* Confirm Delete */}
      <ConfirmDialog isOpen={reportsTable.isConfirmOpen} onClose={() => reportsTable.setIsConfirmOpen(false)} onConfirm={() => { if (reportsTable.selectedItem) reportsTable.deleteItem(reportsTable.selectedItem.id); showToast("Report deleted", "error"); }} title="Delete Report" message={`Remove report "${reportsTable.selectedItem?.name}"?`} />
    </>
  );
}

// Subcomponents
function ExportButton({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition">
      <Icon size={18} />
      {label}
    </button>
  );
}

function FormField({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</span>
      <input type="text" required={required} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white" placeholder={placeholder} />
    </label>
  );
}

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

function FormActions({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) {
  return (
    <div className="flex justify-end gap-3 pt-3">
      <button type="button" onClick={onCancel} className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-extrabold text-slate-600 hover:bg-slate-50 bg-white">Cancel</button>
      <button type="submit" className="h-10 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700">
        {submitLabel}
      </button>
    </div>
  );
}

function DetailCard({ label, items }: { label: string; items: [string, string][] }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card space-y-3">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{label}</span>
      {items.map(([k, v]) => <p key={k} className="text-sm font-semibold text-slate-600">{k}: <b className="text-slate-800">{v}</b></p>)}
    </div>
  );
}
