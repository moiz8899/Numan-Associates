import { useState } from "react";
import { Users, Calendar, Target, Plus, Download, Printer, ChevronDown, type LucideIcon } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card } from "../../components/shared/Card";
import { KpiCard } from "../../components/shared/KpiCard";
import {
  AmazonPill,
  ImmigrationStatusBadge,
  ProgressBar,
  StatusBadge,
} from "../../components/shared/badges";
import { ChartLegend } from "../../components/shared/ChartLegend";
import { PaginatedTableFooter } from "../../components/shared/TableFooter";
import { ActionIcons } from "../../components/shared/ActionIcons";
import { TableActions } from "../../components/shared/TableActions";
import { Modal } from "../../components/shared/Modal";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { ViewDrawer } from "../../components/shared/ViewDrawer";
import { Toast, type ToastType } from "../../components/shared/Toast";
import { useTable } from "../../hooks/useTable";
import { exportToPDF, exportToExcel, triggerPrint } from "../../utils/export";

interface ClientRecord { id: string; name: string; serviceType: string; tasksCount: string; paymentAmount: string; paymentStatus: string; }
interface TaskRecord { id: string; title: string; assignee: string; priority: string; dueDate: string; progress: string; status: string; }
interface GoalRecord { id: string; description: string; target: string; progress: string; pct: string; deadline: string; status: string; }

export function AcademicDashboard() {
  const [activeTab, setActiveTab] = useState("Clients");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const showToast = (msg: string, type: ToastType = "success") => { setToastMessage(msg); setToastType(type); setToastOpen(true); };

  const clientsTable = useTable<ClientRecord>({
    initialData: [],
    searchFields: ["name", "serviceType", "paymentStatus"],
    defaultPageSize: 5,
    supabaseTable: "clients",
    supabaseFilter: { column: "department", value: "academic" },
  });
  const tasksTable = useTable<TaskRecord>({
    initialData: [],
    searchFields: ["title", "assignee", "status"],
    defaultPageSize: 5,
    supabaseTable: "tasks",
    supabaseFilter: { column: "department", value: "academic" },
  });
  const goalsTable = useTable<GoalRecord>({
    initialData: [],
    searchFields: ["description", "status"],
    defaultPageSize: 5,
    supabaseTable: "goals",
    supabaseFilter: { column: "department", value: "academic" },
  });

  const [showExportMenu, setShowExportMenu] = useState(false);

  const [clientForm, setClientForm] = useState<Omit<ClientRecord, "id">>({ name: "", serviceType: "Research Assistance", tasksCount: "0", paymentAmount: "PKR 0", paymentStatus: "Pending" });
  const [taskForm, setTaskForm] = useState<Omit<TaskRecord, "id">>({ title: "", assignee: "", priority: "Medium", dueDate: "", progress: "0%", status: "Not Started" });
  const [goalForm, setGoalForm] = useState<Omit<GoalRecord, "id">>({ description: "", target: "100%", progress: "0%", pct: "0%", deadline: "", status: "Not Started" });

  // Dynamic KPIs
  const totalClients = clientsTable.data.length;
  const activeProjects = clientsTable.data.filter((c) => c.paymentStatus !== "Paid").length;
  const pendingPayments = clientsTable.data.filter((c) => c.paymentStatus === "Pending").length;
  const completedProjects = clientsTable.data.filter((c) => c.paymentStatus === "Paid").length;
  const totalRevenue = clientsTable.data.filter((c) => c.paymentStatus === "Paid").reduce((sum, c) => sum + (parseInt(c.paymentAmount.replace(/[^\d]/g, "")) || 0), 0);

  const academicKpis = [
    { label: "Total Clients", value: String(totalClients), change: "\u2014", trend: "positive", icon: Users, color: "#7c3aed", bg: "bg-violet-50" },
    { label: "Active Projects", value: String(activeProjects), change: "\u2014", trend: "positive", icon: Users, color: "#1a73e8", bg: "bg-blue-50" },
    { label: "Total Revenue", value: `PKR ${totalRevenue.toLocaleString()}`, change: "\u2014", trend: "positive", icon: Users, color: "#16a34a", bg: "bg-green-50" },
    { label: "Pending Payments", value: String(pendingPayments), change: "\u2014", trend: "negative", icon: Users, color: "#f97316", bg: "bg-orange-50" },
    { label: "Completed Projects", value: String(completedProjects), change: "\u2014", trend: "positive", icon: Users, color: "#0d9488", bg: "bg-teal-50" },
  ];

  const projectStatusData = [
    { name: "Active", value: activeProjects, color: "#3B82F6" },
    { name: "Completed", value: completedProjects, color: "#10B981" },
    { name: "Pending", value: pendingPayments, color: "#F59E0B" },
  ];

  // Export
  const handleExport = (format: "pdf" | "excel") => {
    setShowExportMenu(false);
    if (activeTab === "Clients") {
      const headers = ["#", "Client Name", "Type of Service", "Tasks", "Payment Amount", "Payment Status"];
      const rows = clientsTable.data.map((c, i) => [String(i + 1), c.name, c.serviceType, c.tasksCount, c.paymentAmount, c.paymentStatus]);
      format === "pdf" ? exportToPDF({ title: "Academic Clients Report", headers, rows, fileName: "academic_clients" }) : exportToExcel({ title: "Academic Clients", headers, rows, fileName: "academic_clients" });
    } else if (activeTab === "Tasks") {
      const headers = ["#", "Task Title", "Assigned To", "Priority", "Due Date", "Progress", "Status"];
      const rows = tasksTable.data.map((t, i) => [String(i + 1), t.title, t.assignee, t.priority, t.dueDate, t.progress, t.status]);
      format === "pdf" ? exportToPDF({ title: "Academic Tasks Report", headers, rows, fileName: "academic_tasks" }) : exportToExcel({ title: "Academic Tasks", headers, rows, fileName: "academic_tasks" });
    } else {
      const headers = ["#", "Goal", "Target", "Progress", "% Achieved", "Deadline", "Status"];
      const rows = goalsTable.data.map((g, i) => [String(i + 1), g.description, g.target, g.progress, g.pct, g.deadline, g.status]);
      format === "pdf" ? exportToPDF({ title: "Academic Goals Report", headers, rows, fileName: "academic_goals" }) : exportToExcel({ title: "Academic Goals", headers, rows, fileName: "academic_goals" });
    }
    showToast(`${activeTab} exported to ${format.toUpperCase()}`);
  };

  // Client CRUD
  const openAddClient = () => { setClientForm({ name: "", serviceType: "Research Assistance", tasksCount: "0", paymentAmount: "PKR 0", paymentStatus: "Pending" }); clientsTable.setIsAddOpen(true); };
  const submitAddClient = (e: React.FormEvent) => { e.preventDefault(); if (!clientForm.name.trim()) return; clientsTable.addItem({ id: String(Date.now()), ...clientForm }); clientsTable.setIsAddOpen(false); showToast(`Client ${clientForm.name} added!`); };
  const openEditClient = (c: ClientRecord) => { setClientForm({ name: c.name, serviceType: c.serviceType, tasksCount: c.tasksCount, paymentAmount: c.paymentAmount, paymentStatus: c.paymentStatus }); clientsTable.selectItemForAction(c, "edit"); };
  const submitEditClient = (e: React.FormEvent) => { e.preventDefault(); if (!clientsTable.selectedItem) return; clientsTable.updateItem({ id: clientsTable.selectedItem.id, ...clientForm }); clientsTable.setIsEditOpen(false); showToast("Client updated!"); };
  const confirmDeleteClient = () => { if (!clientsTable.selectedItem) return; clientsTable.deleteItem(clientsTable.selectedItem.id); showToast("Client removed", "error"); };

  // Task CRUD
  const openAddTask = () => { setTaskForm({ title: "", assignee: "", priority: "Medium", dueDate: "", progress: "0%", status: "Not Started" }); tasksTable.setIsAddOpen(true); };
  const submitAddTask = (e: React.FormEvent) => { e.preventDefault(); if (!taskForm.title.trim()) return; tasksTable.addItem({ id: String(Date.now()), ...taskForm }); tasksTable.setIsAddOpen(false); showToast("Task created!"); };
  const openEditTask = (t: TaskRecord) => { setTaskForm({ title: t.title, assignee: t.assignee, priority: t.priority, dueDate: t.dueDate, progress: t.progress, status: t.status }); tasksTable.selectItemForAction(t, "edit"); };
  const submitEditTask = (e: React.FormEvent) => { e.preventDefault(); if (!tasksTable.selectedItem) return; tasksTable.updateItem({ id: tasksTable.selectedItem.id, ...taskForm }); tasksTable.setIsEditOpen(false); showToast("Task updated!"); };

  // Goal CRUD
  const openAddGoal = () => { setGoalForm({ description: "", target: "100%", progress: "0%", pct: "0%", deadline: "", status: "Not Started" }); goalsTable.setIsAddOpen(true); };
  const submitAddGoal = (e: React.FormEvent) => { e.preventDefault(); if (!goalForm.description.trim()) return; goalsTable.addItem({ id: String(Date.now()), ...goalForm }); goalsTable.setIsAddOpen(false); showToast("Goal registered!"); };
  const openEditGoal = (g: GoalRecord) => { setGoalForm({ description: g.description, target: g.target, progress: g.progress, pct: g.pct, deadline: g.deadline, status: g.status }); goalsTable.selectItemForAction(g, "edit"); };
  const submitEditGoal = (e: React.FormEvent) => { e.preventDefault(); if (!goalsTable.selectedItem) return; goalsTable.updateItem({ id: goalsTable.selectedItem.id, ...goalForm }); goalsTable.setIsEditOpen(false); showToast("Goal updated!"); };

  const serviceOptions = ["Research Assistance", "Thesis Writing", "Academic Consulting", "Data Analysis", "Proofreading", "Publication Support"];

  return (
    <>
      <Toast message={toastMessage} type={toastType} isOpen={toastOpen} onClose={() => setToastOpen(false)} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {academicKpis.map((card) => <KpiCard key={card.label} {...card} />)}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-6">
          <Tab icon={Users} label="Clients" active={activeTab === "Clients"} onClick={() => setActiveTab("Clients")} />
          <Tab icon={Calendar} label="Tasks" active={activeTab === "Tasks"} onClick={() => setActiveTab("Tasks")} />
          <Tab icon={Target} label="Goals" active={activeTab === "Goals"} onClick={() => setActiveTab("Goals")} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition shadow-sm"><Download size={16} />Export<ChevronDown size={14} /></button>
            {showExportMenu && (<><div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} /><div className="absolute right-0 mt-2 z-20 w-44 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl animate-scale-up space-y-1"><button onClick={() => handleExport("pdf")} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Export to PDF</button><button onClick={() => handleExport("excel")} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Export to Excel</button></div></>)}
          </div>
          <button onClick={triggerPrint} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition shadow-sm"><Printer size={16} />Print</button>
          <button onClick={activeTab === "Clients" ? openAddClient : activeTab === "Tasks" ? openAddTask : openAddGoal} className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700 transition"><Plus size={18} />{activeTab === "Clients" ? "Add Client" : activeTab === "Tasks" ? "Create Task" : "Add Goal"}</button>
        </div>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.75fr)]">
        <div>
          {activeTab === "Clients" ? <CrudTable type="client" table={clientsTable} openEdit={openEditClient} /> : activeTab === "Tasks" ? <CrudTable type="task" table={tasksTable} openEdit={openEditTask} /> : <CrudTable type="goal" table={goalsTable} openEdit={openEditGoal} />}
        </div>
        <AcademicRightColumn projectStatusData={projectStatusData} totalProjects={totalClients} />
      </section>

      {/* Client Modals */}
      <Modal isOpen={clientsTable.isAddOpen} onClose={() => clientsTable.setIsAddOpen(false)} title="Add Academic Client">
        <form onSubmit={submitAddClient} className="space-y-4">
          <FormField label="Client Name" value={clientForm.name} onChange={(v) => setClientForm({ ...clientForm, name: v })} placeholder="e.g. Prof. Aslam Iqbal" required />
          <FormSelect label="Service Type" value={clientForm.serviceType} onChange={(v) => setClientForm({ ...clientForm, serviceType: v })} options={serviceOptions} />
          <FormField label="Payment Amount" value={clientForm.paymentAmount} onChange={(v) => setClientForm({ ...clientForm, paymentAmount: v })} placeholder="e.g. PKR 80,000" required />
          <FormSelect label="Payment Status" value={clientForm.paymentStatus} onChange={(v) => setClientForm({ ...clientForm, paymentStatus: v })} options={["Pending", "Partial", "Paid"]} />
          <FormActions onCancel={() => clientsTable.setIsAddOpen(false)} submitLabel="Save Client" />
        </form>
      </Modal>
      <Modal isOpen={clientsTable.isEditOpen} onClose={() => clientsTable.setIsEditOpen(false)} title="Edit Academic Client">
        <form onSubmit={submitEditClient} className="space-y-4">
          <FormField label="Client Name" value={clientForm.name} onChange={(v) => setClientForm({ ...clientForm, name: v })} required />
          <FormSelect label="Service Type" value={clientForm.serviceType} onChange={(v) => setClientForm({ ...clientForm, serviceType: v })} options={serviceOptions} />
          <FormField label="Payment Amount" value={clientForm.paymentAmount} onChange={(v) => setClientForm({ ...clientForm, paymentAmount: v })} required />
          <FormSelect label="Payment Status" value={clientForm.paymentStatus} onChange={(v) => setClientForm({ ...clientForm, paymentStatus: v })} options={["Pending", "Partial", "Paid"]} />
          <FormActions onCancel={() => clientsTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ViewDrawer isOpen={clientsTable.isViewOpen} onClose={() => clientsTable.setIsViewOpen(false)} title={clientsTable.selectedItem?.name || "Client"}>
        {clientsTable.selectedItem ? (
          <div className="space-y-4">
            <DetailCard label="Client Details" items={[["ID", `#${clientsTable.selectedItem.id}`], ["Name", clientsTable.selectedItem.name]]} />
            <DetailCard label="Service Info" items={[["Service", clientsTable.selectedItem.serviceType], ["Tasks", clientsTable.selectedItem.tasksCount]]} />
            <DetailCard label="Payment" items={[["Amount", clientsTable.selectedItem.paymentAmount], ["Status", clientsTable.selectedItem.paymentStatus]]} />
          </div>
        ) : null}
      </ViewDrawer>
      <ConfirmDialog isOpen={clientsTable.isConfirmOpen} onClose={() => clientsTable.setIsConfirmOpen(false)} onConfirm={confirmDeleteClient} title="Delete Client" message={`Remove ${clientsTable.selectedItem?.name} from academic records?`} />

      {/* Task Modals */}
      <Modal isOpen={tasksTable.isAddOpen} onClose={() => tasksTable.setIsAddOpen(false)} title="Create Academic Task">
        <form onSubmit={submitAddTask} className="space-y-4">
          <FormField label="Task Title" value={taskForm.title} onChange={(v) => setTaskForm({ ...taskForm, title: v })} placeholder="e.g. Literature Review Draft" required />
          <FormField label="Assigned To" value={taskForm.assignee} onChange={(v) => setTaskForm({ ...taskForm, assignee: v })} placeholder="e.g. Dr. Sara Malik" required />
          <div className="flex gap-3">
            <FormSelect label="Priority" value={taskForm.priority} onChange={(v) => setTaskForm({ ...taskForm, priority: v })} options={["High", "Medium", "Low"]} />
            <FormSelect label="Status" value={taskForm.status} onChange={(v) => setTaskForm({ ...taskForm, status: v })} options={["Not Started", "In Progress", "Completed", "At Risk"]} />
          </div>
          <FormActions onCancel={() => tasksTable.setIsAddOpen(false)} submitLabel="Create Task" />
        </form>
      </Modal>
      <Modal isOpen={tasksTable.isEditOpen} onClose={() => tasksTable.setIsEditOpen(false)} title="Edit Academic Task">
        <form onSubmit={submitEditTask} className="space-y-4">
          <FormField label="Task Title" value={taskForm.title} onChange={(v) => setTaskForm({ ...taskForm, title: v })} required />
          <FormField label="Assigned To" value={taskForm.assignee} onChange={(v) => setTaskForm({ ...taskForm, assignee: v })} required />
          <div className="flex gap-3">
            <FormSelect label="Priority" value={taskForm.priority} onChange={(v) => setTaskForm({ ...taskForm, priority: v })} options={["High", "Medium", "Low"]} />
            <FormField label="Progress" value={taskForm.progress} onChange={(v) => setTaskForm({ ...taskForm, progress: v })} required />
            <FormSelect label="Status" value={taskForm.status} onChange={(v) => setTaskForm({ ...taskForm, status: v })} options={["Not Started", "In Progress", "Completed", "At Risk"]} />
          </div>
          <FormActions onCancel={() => tasksTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={tasksTable.isConfirmOpen} onClose={() => tasksTable.setIsConfirmOpen(false)} onConfirm={() => { if (tasksTable.selectedItem) tasksTable.deleteItem(tasksTable.selectedItem.id); showToast("Task removed", "error"); }} title="Delete Task" message={`Remove task "${tasksTable.selectedItem?.title}"?`} />

      {/* Goal Modals */}
      <Modal isOpen={goalsTable.isAddOpen} onClose={() => goalsTable.setIsAddOpen(false)} title="Register Academic Goal">
        <form onSubmit={submitAddGoal} className="space-y-4">
          <FormField label="Goal Description" value={goalForm.description} onChange={(v) => setGoalForm({ ...goalForm, description: v })} placeholder="e.g. Publish 5 research papers" required />
          <FormField label="Target Deadline" value={goalForm.deadline} onChange={(v) => setGoalForm({ ...goalForm, deadline: v })} placeholder="e.g. 31 Dec 2024" required />
          <FormActions onCancel={() => goalsTable.setIsAddOpen(false)} submitLabel="Save Goal" />
        </form>
      </Modal>
      <Modal isOpen={goalsTable.isEditOpen} onClose={() => goalsTable.setIsEditOpen(false)} title="Edit Academic Goal">
        <form onSubmit={submitEditGoal} className="space-y-4">
          <FormField label="Goal Description" value={goalForm.description} onChange={(v) => setGoalForm({ ...goalForm, description: v })} required />
          <div className="flex gap-3">
            <FormField label="Target" value={goalForm.target} onChange={(v) => setGoalForm({ ...goalForm, target: v })} required />
            <FormField label="Progress" value={goalForm.progress} onChange={(v) => setGoalForm({ ...goalForm, progress: v })} required />
          </div>
          <div className="flex gap-3">
            <FormField label="% Achieved" value={goalForm.pct} onChange={(v) => setGoalForm({ ...goalForm, pct: v })} required />
            <FormField label="Deadline" value={goalForm.deadline} onChange={(v) => setGoalForm({ ...goalForm, deadline: v })} required />
          </div>
          <FormSelect label="Status" value={goalForm.status} onChange={(v) => setGoalForm({ ...goalForm, status: v })} options={["Not Started", "In Progress", "Completed", "At Risk"]} />
          <FormActions onCancel={() => goalsTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={goalsTable.isConfirmOpen} onClose={() => goalsTable.setIsConfirmOpen(false)} onConfirm={() => { if (goalsTable.selectedItem) goalsTable.deleteItem(goalsTable.selectedItem.id); showToast("Goal removed", "error"); }} title="Delete Goal" message={`Remove goal "${goalsTable.selectedItem?.description}"?`} />
    </>
  );
}

// =========================================================================
// REUSABLE SUB-COMPONENTS
// =========================================================================

function Tab({ icon: Icon, label, active = false, onClick }: { icon: LucideIcon; label: string; active?: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-extrabold transition ${active ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-900"}`}><Icon size={17} />{label}</button>;
}

function FormField({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <label className="block flex-1">
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

function CrudTable({ type, table, openEdit }: { type: "client" | "task" | "goal"; table: any; openEdit: (item: any) => void }) {
  const configs = {
    client: {
      title: "Client Management",
      subtext: "The Academic Services module supports research projects, academic consulting, thesis assistance, and student/institutional client management.",
      columns: ["#", "Client Name", "Type of Services", "Tasks", "Payment Amount", "Payment Status", "Actions"],
      emptyMsg: 'No clients. Click "+ Add Client" to begin.',
      searchPlaceholder: "Search clients...",
    },
    task: {
      title: "Tasks for Growth",
      subtext: "Track and manage academic service tasks, research deadlines, and consultant assignments.",
      columns: ["#", "Task Title", "Assigned To", "Priority", "Due Date", "Progress", "Status", "Actions"],
      emptyMsg: 'No tasks. Click "+ Create Task" to begin.',
      searchPlaceholder: "Search tasks...",
    },
    goal: {
      title: "Goals Status",
      subtext: "Monitor academic department goals, research targets, and milestone achievement progress.",
      columns: ["#", "Goal Description", "Target", "Current Progress", "% Achieved", "Deadline", "Status", "Actions"],
      emptyMsg: 'No goals. Click "+ Add Goal" to begin.',
      searchPlaceholder: "Search goals...",
    },
  };
  const cfg = configs[type];

  return (
    <Card title={cfg.title} subtext={cfg.subtext} action={<TableActions searchQuery={table.searchQuery} onSearchChange={table.setSearchQuery} searchPlaceholder={cfg.searchPlaceholder} columns={cfg.columns} visibleColumns={table.visibleColumns} onToggleColumn={(col: string) => table.setVisibleColumns((c: Record<string, boolean>) => ({ ...c, [col]: c[col] === false }))} />}>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[820px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>{cfg.columns.map((h) => table.visibleColumns[h] !== false && <th key={h} className="px-4 py-3 font-extrabold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.paginatedData.map((row: any, index: number) => (
              <tr key={row.id} className="text-sm hover:bg-slate-50 transition duration-100">
                {table.visibleColumns["#"] !== false && <td className="px-4 py-3 font-extrabold text-slate-400">{(table.currentPage - 1) * table.pageSize + index + 1}</td>}
                {type === "client" && (
                  <>
                    {table.visibleColumns["Client Name"] !== false && <td className="px-4 py-3 font-extrabold text-slate-950">{row.name}</td>}
                    {table.visibleColumns["Type of Services"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.serviceType}</td>}
                    {table.visibleColumns["Tasks"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.tasksCount}</td>}
                    {table.visibleColumns["Payment Amount"] !== false && <td className="px-4 py-3 font-bold text-slate-800">{row.paymentAmount}</td>}
                    {table.visibleColumns["Payment Status"] !== false && <td className="px-4 py-3"><AmazonPill value={row.paymentStatus} /></td>}
                  </>
                )}
                {type === "task" && (
                  <>
                    {table.visibleColumns["Task Title"] !== false && <td className="px-4 py-3 font-extrabold text-slate-900">{row.title}</td>}
                    {table.visibleColumns["Assigned To"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.assignee}</td>}
                    {table.visibleColumns["Priority"] !== false && <td className="px-4 py-3"><StatusBadge status={row.priority} /></td>}
                    {table.visibleColumns["Due Date"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.dueDate}</td>}
                    {table.visibleColumns["Progress"] !== false && <td className="px-4 py-3"><ProgressBar value={row.progress} /></td>}
                    {table.visibleColumns["Status"] !== false && <td className="px-4 py-3"><ImmigrationStatusBadge status={row.status} /></td>}
                  </>
                )}
                {type === "goal" && (
                  <>
                    {table.visibleColumns["Goal Description"] !== false && <td className="px-4 py-3 font-extrabold text-slate-900">{row.description}</td>}
                    {table.visibleColumns["Target"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.target}</td>}
                    {table.visibleColumns["Current Progress"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.progress}</td>}
                    {table.visibleColumns["% Achieved"] !== false && <td className="px-4 py-3"><ProgressBar value={row.pct} /></td>}
                    {table.visibleColumns["Deadline"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.deadline}</td>}
                    {table.visibleColumns["Status"] !== false && <td className="px-4 py-3"><ImmigrationStatusBadge status={row.status} /></td>}
                  </>
                )}
                {table.visibleColumns["Actions"] !== false && (
                  <td className="px-4 py-3">
                    <ActionIcons onView={type === "client" ? () => table.selectItemForAction(row, "view") : undefined} onEdit={() => openEdit(row)} onDelete={() => table.selectItemForAction(row, "delete")} />
                  </td>
                )}
              </tr>
            ))}
            {table.paginatedData.length === 0 && <tr><td colSpan={cfg.columns.length} className="px-4 py-12 text-center text-sm font-bold text-slate-400">{cfg.emptyMsg}</td></tr>}
          </tbody>
        </table>
      </div>
      <PaginatedTableFooter currentPage={table.currentPage} totalPages={table.totalPages} pageSize={table.pageSize} totalItems={table.filteredData.length} onPageChange={table.setCurrentPage} onPageSizeChange={table.setPageSize} />
    </Card>
  );
}

function AcademicRightColumn({ projectStatusData, totalProjects }: { projectStatusData: { name: string; value: number; color: string }[]; totalProjects: number }) {
  return (
    <aside className="space-y-6">
      <Card title="Project Status Overview">
        <div className="p-5">
          {totalProjects > 0 ? (
            <>
              <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={projectStatusData} innerRadius={72} outerRadius={104} paddingAngle={3} dataKey="value">{projectStatusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-2xl font-extrabold text-slate-950">{totalProjects}</p>
                  <p className="text-xs font-bold text-slate-500">Total Projects</p>
                </div>
              </div>
              <ChartLegend items={projectStatusData.map((item) => ({ name: item.name, value: item.value, pct: totalProjects > 0 ? `${Math.round((item.value / totalProjects) * 100)}%` : "0%", color: item.color }))} />
            </>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm font-bold text-slate-400">No active projects</div>
          )}
        </div>
      </Card>
      <Card title="Top Academic Services by Revenue">
        <div className="space-y-4 p-5 text-sm font-bold text-slate-500 text-center py-8">
          Add paid client records to populate service metrics dynamically.
        </div>
      </Card>
    </aside>
  );
}
