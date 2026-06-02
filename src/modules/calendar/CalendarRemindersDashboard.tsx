import { useState } from "react";
import {
  Calendar,
  ClipboardList,
  CheckCircle,
  CreditCard,
  MessageSquare,
  Plus,
  Download,
  Printer,
  ChevronDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { Card } from "../../components/shared/Card";
import { KpiCard } from "../../components/shared/KpiCard";
import { ActionIcons } from "../../components/shared/ActionIcons";
import { ChartLegend } from "../../components/shared/ChartLegend";
import { PriorityBadge, SystemStatusBadge } from "../../components/shared/badges";
import { Modal } from "../../components/shared/Modal";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { ViewDrawer } from "../../components/shared/ViewDrawer";
import { Toast, type ToastType } from "../../components/shared/Toast";
import { useTable } from "../../hooks/useTable";
import { PaginatedTableFooter } from "../../components/shared/TableFooter";
import { TableActions } from "../../components/shared/TableActions";
import { exportToPDF, exportToExcel, triggerPrint } from "../../utils/export";

// Data Types
interface ReminderRecord {
  id: string;
  title: string;
  service: string;
  client: string;
  dueDate: string;
  priority: string;
  status: string;
}

const initialReminders: ReminderRecord[] = [
  { id: "rem-1", title: "FBR Income Tax Filing Deadline", service: "Taxation Services", client: "Numan Ali", dueDate: "05 Jun 2026", priority: "High", status: "Pending" },
  { id: "rem-2", title: "SECP Annual Returns Board Meeting", service: "Company Registration", client: "Apex Tech LLC", dueDate: "10 Jun 2026", priority: "Medium", status: "Pending" },
  { id: "rem-3", title: "Immigration Interview Prep Session", service: "Immigration Services", client: "Asma Ali", dueDate: "08 Jun 2026", priority: "High", status: "Completed" },
  { id: "rem-4", title: "Amazon Store Audit Check", service: "Amazon Services", client: "Ahmed Electronics", dueDate: "12 Jun 2026", priority: "Low", status: "Pending" }
];

export function CalendarRemindersDashboard() {
  // Toast State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");

  const showToast = (msg: string, type: ToastType = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // useTable Hook
  const remindersTable = useTable<ReminderRecord>({
    initialData: [],
    searchFields: ["title", "service", "client", "status"],
    defaultPageSize: 5,
    supabaseTable: "reminders",
  });

  const [showExportMenu, setShowExportMenu] = useState(false);

  // Form State
  const [form, setForm] = useState<Omit<ReminderRecord, "id">>({
    title: "",
    service: "Taxation Services",
    client: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
  });

  // Dynamic KPIs calculations
  const todayEvents = remindersTable.data.filter((r) => r.status === "Pending" && (r.dueDate.toLowerCase().includes("today") || r.dueDate.includes("31 May"))).length;
  const thisWeekEvents = remindersTable.data.filter((r) => r.status === "Pending").length;
  const completedEvents = remindersTable.data.filter((r) => r.status === "Completed").length;
  const overdueEvents = remindersTable.data.filter((r) => r.status === "Overdue").length;
  const followUps = remindersTable.data.filter((r) => r.title.toLowerCase().includes("follow") || r.title.toLowerCase().includes("prep")).length;

  const calendarKpis = [
    { label: "Today Events", value: String(todayEvents), change: "\u2014", trend: "positive", icon: Calendar, color: "#1a73e8", bg: "bg-blue-50" },
    { label: "This Week", value: String(thisWeekEvents), change: "\u2014", trend: "positive", icon: ClipboardList, color: "#7c3aed", bg: "bg-violet-50" },
    { label: "Completed", value: String(completedEvents), change: "\u2014", trend: "positive", icon: CheckCircle, color: "#16a34a", bg: "bg-green-50" },
    { label: "Overdue", value: String(overdueEvents), change: "\u2014", trend: "negative", icon: CreditCard, color: "#f97316", bg: "bg-orange-50" },
    { label: "Follow-ups", value: String(followUps), change: "\u2014", trend: "positive", icon: MessageSquare, color: "#0d9488", bg: "bg-teal-50" },
  ];

  const reminderStatusData = [
    { name: "Pending", value: thisWeekEvents, color: "#3B82F6" },
    { name: "Completed", value: completedEvents, color: "#10B981" },
    { name: "Overdue", value: overdueEvents, color: "#EF4444" },
  ];

  const serviceOptions = [
    "Taxation Services",
    "Company Registration",
    "Amazon Services",
    "Law Services",
    "Immigration Services",
    "Academic Services",
    "Training Services",
    "General",
  ];

  // Export handlers
  const handleExport = (format: "pdf" | "excel") => {
    setShowExportMenu(false);
    const headers = ["#", "Reminder", "Service", "Client", "Due Date", "Priority", "Status"];
    const rows = remindersTable.data.map((r, i) => [
      String(i + 1),
      r.title,
      r.service,
      r.client,
      r.dueDate,
      r.priority,
      r.status,
    ]);

    if (format === "pdf") {
      exportToPDF({ title: "Calendar & Reminders Report", headers, rows, fileName: "calendar_reminders" });
    } else {
      exportToExcel({ title: "Calendar Reminders", headers, rows, fileName: "calendar_reminders" });
    }
    showToast(`Reminders exported to ${format.toUpperCase()}`);
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    remindersTable.addItem({ id: String(Date.now()), ...form });
    remindersTable.setIsAddOpen(false);
    showToast(`Reminder "${form.title}" scheduled successfully!`);
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remindersTable.selectedItem) return;
    remindersTable.updateItem({ id: remindersTable.selectedItem.id, ...form });
    remindersTable.setIsEditOpen(false);
    showToast("Reminder updated!");
  };

  const openAdd = () => {
    setForm({ title: "", service: "Taxation Services", client: "", dueDate: "", priority: "Medium", status: "Pending" });
    remindersTable.setIsAddOpen(true);
  };

  const openEdit = (r: ReminderRecord) => {
    setForm({ title: r.title, service: r.service, client: r.client, dueDate: r.dueDate, priority: r.priority, status: r.status });
    remindersTable.selectItemForAction(r, "edit");
  };

  const handleQuickSchedule = (type: string) => {
    setForm({
      title: `${type}: `,
      service: "General",
      client: "",
      dueDate: "Tomorrow",
      priority: "Medium",
      status: "Pending",
    });
    remindersTable.setIsAddOpen(true);
  };

  const columns = ["#", "Reminder", "Service", "Client", "Due Date", "Priority", "Status", "Actions"];

  return (
    <>
      <Toast message={toastMessage} type={toastType} isOpen={toastOpen} onClose={() => setToastOpen(false)} />

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {calendarKpis.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </section>

      {/* Main layout */}
      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.75fr)]">
        
        {/* Reminders table Card */}
        <Card
          title="Calendar & Reminders"
          subtext="Track meetings, filing dates, hearings, application deadlines, and client follow-ups."
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
              <button
                onClick={openAdd}
                className="h-10 rounded-xl bg-brand px-4 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700 transition"
              >
                + Add Reminder
              </button>
            </div>
          }
        >
          <div className="p-4 border-b border-slate-100">
            <TableActions searchQuery={remindersTable.searchQuery} onSearchChange={remindersTable.setSearchQuery} searchPlaceholder="Search reminders..." columns={columns} visibleColumns={remindersTable.visibleColumns} onToggleColumn={(col) => remindersTable.setVisibleColumns((c) => ({ ...c, [col]: c[col] === false }))} />
          </div>
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {columns.map((h) => remindersTable.visibleColumns[h] !== false && (
                    <th key={h} className="px-4 py-3 font-extrabold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {remindersTable.paginatedData.map((row, i) => (
                  <tr key={row.id} className="text-sm hover:bg-slate-50 transition duration-100">
                    {remindersTable.visibleColumns["#"] !== false && <td className="px-4 py-3 font-extrabold text-slate-400">{(remindersTable.currentPage - 1) * remindersTable.pageSize + i + 1}</td>}
                    {remindersTable.visibleColumns["Reminder"] !== false && <td className="px-4 py-3 font-extrabold text-slate-900">{row.title}</td>}
                    {remindersTable.visibleColumns["Service"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.service}</td>}
                    {remindersTable.visibleColumns["Client"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.client}</td>}
                    {remindersTable.visibleColumns["Due Date"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.dueDate}</td>}
                    {remindersTable.visibleColumns["Priority"] !== false && (
                      <td className="px-4 py-3">
                        <PriorityBadge label={row.priority} />
                      </td>
                    )}
                    {remindersTable.visibleColumns["Status"] !== false && (
                      <td className="px-4 py-3">
                        <SystemStatusBadge status={row.status} />
                      </td>
                    )}
                    {remindersTable.visibleColumns["Actions"] !== false && (
                      <td className="px-4 py-3">
                        <ActionIcons
                          onView={() => remindersTable.selectItemForAction(row, "view")}
                          onEdit={() => openEdit(row)}
                          onDelete={() => remindersTable.selectItemForAction(row, "delete")}
                        />
                      </td>
                    )}
                  </tr>
                ))}
                {remindersTable.paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center text-sm font-bold text-slate-400">
                      No reminders found. Click "+ Add Reminder" to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PaginatedTableFooter currentPage={remindersTable.currentPage} totalPages={remindersTable.totalPages} pageSize={remindersTable.pageSize} totalItems={remindersTable.filteredData.length} onPageChange={remindersTable.setCurrentPage} onPageSizeChange={remindersTable.setPageSize} />
        </Card>

        {/* Right column */}
        <aside className="space-y-6">
          <Card title="Reminder Status">
            <div className="p-5">
              {remindersTable.data.length > 0 ? (
                <>
                  <div className="relative h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={reminderStatusData.filter(d => d.value > 0)} innerRadius={72} outerRadius={104} paddingAngle={3} dataKey="value">
                          {reminderStatusData.filter(d => d.value > 0).map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => [`${v} Reminders`, "Count"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                      <p className="text-2xl font-extrabold text-slate-955">{remindersTable.data.length}</p>
                      <p className="text-xs font-bold text-slate-500">Total Reminders</p>
                    </div>
                  </div>
                  <ChartLegend items={reminderStatusData.filter(d => d.value > 0).map(item => ({ ...item, pct: remindersTable.data.length > 0 ? `${Math.round((item.value / remindersTable.data.length) * 100)}%` : "0%" }))} />
                </>
              ) : (
                <div className="flex h-64 items-center justify-center text-sm font-bold text-slate-400">
                  No reminders available
                </div>
              )}
            </div>
          </Card>
          
          <Card title="Quick Schedule">
            <div className="grid grid-cols-2 gap-3 p-5">
              {["Meeting", "Filing Date", "Hearing", "Client Call"].map((item) => (
                <button
                  key={item}
                  onClick={() => handleQuickSchedule(item)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm font-extrabold text-slate-700 hover:bg-blue-50 hover:text-brand transition"
                >
                  {item}
                </button>
              ))}
            </div>
          </Card>
        </aside>
      </section>

      {/* CRUD MODALS */}
      <Modal isOpen={remindersTable.isAddOpen} onClose={() => remindersTable.setIsAddOpen(false)} title="Schedule New Reminder">
        <form onSubmit={submitAdd} className="space-y-4">
          <FormField label="Reminder Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. Audit Meeting with Tax Client" required />
          <FormSelect label="Related Service" value={form.service} onChange={(v) => setForm({ ...form, service: v })} options={serviceOptions} />
          <FormField label="Client / Company" value={form.client} onChange={(v) => setForm({ ...form, client: v })} placeholder="e.g. Malik & Associates" required />
          <div className="flex gap-3">
            <FormField label="Due Date" value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} placeholder="e.g. 15 Jun 2026" required />
            <FormSelect label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={["High", "Medium", "Low"]} />
          </div>
          <FormSelect label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["Pending", "Completed", "Overdue"]} />
          <FormActions onCancel={() => remindersTable.setIsAddOpen(false)} submitLabel="Schedule Event" />
        </form>
      </Modal>

      <Modal isOpen={remindersTable.isEditOpen} onClose={() => remindersTable.setIsEditOpen(false)} title="Edit Reminder Details">
        <form onSubmit={submitEdit} className="space-y-4">
          <FormField label="Reminder Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <FormSelect label="Related Service" value={form.service} onChange={(v) => setForm({ ...form, service: v })} options={serviceOptions} />
          <FormField label="Client / Company" value={form.client} onChange={(v) => setForm({ ...form, client: v })} required />
          <div className="flex gap-3">
            <FormField label="Due Date" value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} required />
            <FormSelect label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={["High", "Medium", "Low"]} />
          </div>
          <FormSelect label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["Pending", "Completed", "Overdue"]} />
          <FormActions onCancel={() => remindersTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>

      <ViewDrawer isOpen={remindersTable.isViewOpen} onClose={() => remindersTable.setIsViewOpen(false)} title={remindersTable.selectedItem?.title || "Reminder File"}>
        {remindersTable.selectedItem && (
          <div className="space-y-4">
            <DetailCard label="Reminder Details" items={[["Description", remindersTable.selectedItem.title], ["Associated Client", remindersTable.selectedItem.client]]} />
            <DetailCard label="Schedule" items={[["Related Service", remindersTable.selectedItem.service], ["Target Due Date", remindersTable.selectedItem.dueDate], ["Priority Level", remindersTable.selectedItem.priority]]} />
            <DetailCard label="Status" items={[["Filing/Event Status", remindersTable.selectedItem.status]]} />
          </div>
        )}
      </ViewDrawer>

      <ConfirmDialog isOpen={remindersTable.isConfirmOpen} onClose={() => remindersTable.setIsConfirmOpen(false)} onConfirm={() => { if (remindersTable.selectedItem) remindersTable.deleteItem(remindersTable.selectedItem.id); showToast("Reminder deleted", "error"); }} title="Delete Reminder" message={`Remove scheduled event "${remindersTable.selectedItem?.title}"?`} />
    </>
  );
}

// Subcomponents
function FormField({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <label className="block flex-grow">
      <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</span>
      <input type="text" required={required} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white" placeholder={placeholder} />
    </label>
  );
}

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block flex-1">
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
      <button type="submit" className="h-10 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700">{submitLabel}</button>
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
