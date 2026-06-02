import { useState } from "react";
import {
  Users,
  Calendar,
  Target,
  Plus,
  Download,
  Printer,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card } from "../../components/shared/Card";
import { KpiCard } from "../../components/shared/KpiCard";
import { AmazonPill, AmazonTaskBadge } from "../../components/shared/badges";
import { ProgressBar } from "../../components/shared/badges";
import { ChartLegend } from "../../components/shared/ChartLegend";
import { TableFooter } from "../../components/shared/TableFooter";
import { ActionIcons } from "../../components/shared/ActionIcons";
import { TableActions } from "../../components/shared/TableActions";
import { Modal } from "../../components/shared/Modal";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { ViewDrawer } from "../../components/shared/ViewDrawer";
import { Toast, type ToastType } from "../../components/shared/Toast";
import { useTable } from "../../hooks/useTable";
import { exportToPDF, exportToExcel, triggerPrint } from "../../utils/export";
import { accountHealth } from "../../data/amazon";

// ── Data Types ──────────────────────────────────────────────────────────

interface ClientRecord {
  id: string;
  name: string;
  marketplace: string;
  services: string;
  activeStore: string;
  tasks: string;
  revenue30d: string;
  profit30d: string;
  paymentStatus: string;
}

interface TaskRecord {
  id: string;
  title: string;
  client: string;
  assignee: string;
  dueDate: string;
  status: string;
}

interface GoalRecord {
  id: string;
  goal: string;
  client: string;
  progress: string;
  targetDate: string;
  status: string;
}

// ── Main Dashboard ──────────────────────────────────────────────────────

export function AmazonDashboard() {
  const [activeTab, setActiveTab] = useState("Clients");

  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const showToast = (msg: string, type: ToastType = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // ── Table Hooks ─────────────────────────────────────────────────────
  const clientsTable = useTable<ClientRecord>({
    initialData: [],
    searchFields: ["name", "marketplace", "services", "paymentStatus"],
    defaultPageSize: 5,
    supabaseTable: "clients",
    supabaseFilter: { column: "department", value: "amazon" },
  });

  const tasksTable = useTable<TaskRecord>({
    initialData: [],
    searchFields: ["title", "client", "assignee", "status"],
    defaultPageSize: 5,
    supabaseTable: "tasks",
    supabaseFilter: { column: "department", value: "amazon" },
  });

  const goalsTable = useTable<GoalRecord>({
    initialData: [],
    searchFields: ["goal", "client", "status"],
    defaultPageSize: 5,
    supabaseTable: "goals",
    supabaseFilter: { column: "department", value: "amazon" },
  });

  // ── Export menu ─────────────────────────────────────────────────────
  const [showExportMenu, setShowExportMenu] = useState(false);

  // ── Form States ─────────────────────────────────────────────────────
  const [clientForm, setClientForm] = useState<Omit<ClientRecord, "id">>({
    name: "", marketplace: "Amazon US", services: "FBA Management", activeStore: "Yes",
    tasks: "0", revenue30d: "PKR 0", profit30d: "PKR 0", paymentStatus: "Pending",
  });

  const [taskForm, setTaskForm] = useState<Omit<TaskRecord, "id">>({
    title: "", client: "", assignee: "", dueDate: "", status: "Not Started",
  });

  const [goalForm, setGoalForm] = useState<Omit<GoalRecord, "id">>({
    goal: "", client: "", progress: "0%", targetDate: "", status: "Not Started",
  });

  // ── Dynamic KPIs ───────────────────────────────────────────────────
  const totalClients = clientsTable.data.length;
  const totalRevenue = clientsTable.data
    .reduce((sum, c) => sum + (parseInt(c.revenue30d.replace(/[^\d]/g, "")) || 0), 0);
  const totalProfit = clientsTable.data
    .reduce((sum, c) => sum + (parseInt(c.profit30d.replace(/[^\d]/g, "")) || 0), 0);
  const totalTasks = tasksTable.data.length;

  const amazonKpis = [
    { label: "Total Clients", value: String(totalClients), change: "—", trend: "positive", icon: Users, color: "#7c3aed", bg: "bg-violet-50" },
    { label: "Total Revenue", value: `PKR ${totalRevenue.toLocaleString()}`, change: "—", trend: "positive", icon: Users, color: "#16a34a", bg: "bg-green-50" },
    { label: "Total Orders", value: String(totalTasks), change: "—", trend: "positive", icon: Users, color: "#f97316", bg: "bg-orange-50" },
    { label: "ACoS (Average)", value: "0%", change: "—", trend: "negative", icon: Users, color: "#1a73e8", bg: "bg-blue-50" },
    { label: "Total Profit", value: `PKR ${totalProfit.toLocaleString()}`, change: "—", trend: "positive", icon: Users, color: "#0d9488", bg: "bg-teal-50" },
  ];

  // ── Export Handler ─────────────────────────────────────────────────
  const handleExport = (format: "pdf" | "excel") => {
    setShowExportMenu(false);
    if (activeTab === "Clients") {
      const headers = ["#", "Client Name", "Marketplace", "Services", "Active Store", "Tasks", "Revenue (30d)", "Profit (30d)", "Payment Status"];
      const rows = clientsTable.data.map((c, i) => [String(i + 1), c.name, c.marketplace, c.services, c.activeStore, c.tasks, c.revenue30d, c.profit30d, c.paymentStatus]);
      format === "pdf"
        ? exportToPDF({ title: "Amazon Clients Report", headers, rows, fileName: "amazon_clients" })
        : exportToExcel({ title: "Amazon Clients", headers, rows, fileName: "amazon_clients" });
    } else if (activeTab === "Tasks") {
      const headers = ["#", "Task Title", "Client", "Assigned To", "Due Date", "Status"];
      const rows = tasksTable.data.map((t, i) => [String(i + 1), t.title, t.client, t.assignee, t.dueDate, t.status]);
      format === "pdf"
        ? exportToPDF({ title: "Amazon Tasks Report", headers, rows, fileName: "amazon_tasks" })
        : exportToExcel({ title: "Amazon Tasks", headers, rows, fileName: "amazon_tasks" });
    } else {
      const headers = ["#", "Goal", "Client", "Progress", "Target Date", "Status"];
      const rows = goalsTable.data.map((g, i) => [String(i + 1), g.goal, g.client, g.progress, g.targetDate, g.status]);
      format === "pdf"
        ? exportToPDF({ title: "Amazon Goals Report", headers, rows, fileName: "amazon_goals" })
        : exportToExcel({ title: "Amazon Goals", headers, rows, fileName: "amazon_goals" });
    }
    showToast(`${activeTab} exported to ${format.toUpperCase()}`, "success");
  };

  // ── Client CRUD ────────────────────────────────────────────────────
  const openAddClient = () => {
    setClientForm({ name: "", marketplace: "Amazon US", services: "FBA Management", activeStore: "Yes", tasks: "0", revenue30d: "PKR 0", profit30d: "PKR 0", paymentStatus: "Pending" });
    clientsTable.setIsAddOpen(true);
  };
  const submitAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim()) return;
    clientsTable.addItem({ id: String(Date.now()), ...clientForm });
    clientsTable.setIsAddOpen(false);
    showToast(`Client ${clientForm.name} onboarded!`);
  };
  const openEditClient = (c: ClientRecord) => {
    setClientForm({ name: c.name, marketplace: c.marketplace, services: c.services, activeStore: c.activeStore, tasks: c.tasks, revenue30d: c.revenue30d, profit30d: c.profit30d, paymentStatus: c.paymentStatus });
    clientsTable.selectItemForAction(c, "edit");
  };
  const submitEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientsTable.selectedItem) return;
    clientsTable.updateItem({ id: clientsTable.selectedItem.id, ...clientForm });
    clientsTable.setIsEditOpen(false);
    showToast("Client updated!");
  };
  const confirmDeleteClient = () => {
    if (!clientsTable.selectedItem) return;
    clientsTable.deleteItem(clientsTable.selectedItem.id);
    showToast("Client removed from records", "error");
  };

  // ── Task CRUD ──────────────────────────────────────────────────────
  const openAddTask = () => {
    setTaskForm({ title: "", client: "", assignee: "", dueDate: "", status: "Not Started" });
    tasksTable.setIsAddOpen(true);
  };
  const submitAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    tasksTable.addItem({ id: String(Date.now()), ...taskForm });
    tasksTable.setIsAddOpen(false);
    showToast("Task created!");
  };
  const openEditTask = (t: TaskRecord) => {
    setTaskForm({ title: t.title, client: t.client, assignee: t.assignee, dueDate: t.dueDate, status: t.status });
    tasksTable.selectItemForAction(t, "edit");
  };
  const submitEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tasksTable.selectedItem) return;
    tasksTable.updateItem({ id: tasksTable.selectedItem.id, ...taskForm });
    tasksTable.setIsEditOpen(false);
    showToast("Task updated!");
  };
  const confirmDeleteTask = () => {
    if (!tasksTable.selectedItem) return;
    tasksTable.deleteItem(tasksTable.selectedItem.id);
    showToast("Task deleted", "error");
  };

  // ── Goal CRUD ──────────────────────────────────────────────────────
  const openAddGoal = () => {
    setGoalForm({ goal: "", client: "", progress: "0%", targetDate: "", status: "Not Started" });
    goalsTable.setIsAddOpen(true);
  };
  const submitAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.goal.trim()) return;
    goalsTable.addItem({ id: String(Date.now()), ...goalForm });
    goalsTable.setIsAddOpen(false);
    showToast("Goal registered!");
  };
  const openEditGoal = (g: GoalRecord) => {
    setGoalForm({ goal: g.goal, client: g.client, progress: g.progress, targetDate: g.targetDate, status: g.status });
    goalsTable.selectItemForAction(g, "edit");
  };
  const submitEditGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalsTable.selectedItem) return;
    goalsTable.updateItem({ id: goalsTable.selectedItem.id, ...goalForm });
    goalsTable.setIsEditOpen(false);
    showToast("Goal updated!");
  };
  const confirmDeleteGoal = () => {
    if (!goalsTable.selectedItem) return;
    goalsTable.deleteItem(goalsTable.selectedItem.id);
    showToast("Goal deleted", "error");
  };

  // ── Dynamic charts data ────────────────────────────────────────────
  const taskStatusData = [
    { name: "Completed", value: tasksTable.data.filter(t => t.status === "Completed").length, color: "#10B981" },
    { name: "In Progress", value: tasksTable.data.filter(t => t.status === "In Progress").length, color: "#3B82F6" },
    { name: "Not Started", value: tasksTable.data.filter(t => t.status === "Not Started").length, color: "#F59E0B" },
  ];
  const totalTaskCount = taskStatusData.reduce((s, d) => s + d.value, 0);

  const salesData = [
    { name: "Paid Clients", value: clientsTable.data.filter(c => c.paymentStatus === "Paid").length, color: "#10B981" },
    { name: "Pending", value: clientsTable.data.filter(c => c.paymentStatus === "Pending").length, color: "#F59E0B" },
    { name: "Partial", value: clientsTable.data.filter(c => c.paymentStatus === "Partial").length, color: "#EF4444" },
  ];

  return (
    <>
      <Toast message={toastMessage} type={toastType} isOpen={toastOpen} onClose={() => setToastOpen(false)} />

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {amazonKpis.map(card => <KpiCard key={card.label} {...card} />)}
      </section>

      {/* Tabs + Actions */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-6">
          <Tab icon={Users} label="Clients" active={activeTab === "Clients"} onClick={() => setActiveTab("Clients")} />
          <Tab icon={Calendar} label="Tasks" active={activeTab === "Tasks"} onClick={() => setActiveTab("Tasks")} />
          <Tab icon={Target} label="Goals" active={activeTab === "Goals"} onClick={() => setActiveTab("Goals")} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition shadow-sm">
              <Download size={16} /> Export <ChevronDown size={14} />
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-2 z-20 w-44 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl animate-scale-up space-y-1">
                  <button onClick={() => handleExport("pdf")} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Export to PDF</button>
                  <button onClick={() => handleExport("excel")} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Export to Excel</button>
                </div>
              </>
            )}
          </div>
          <button onClick={triggerPrint} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition shadow-sm">
            <Printer size={16} /> Print
          </button>
          <button
            onClick={activeTab === "Clients" ? openAddClient : activeTab === "Tasks" ? openAddTask : openAddGoal}
            className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            {activeTab === "Clients" ? "Add Client" : activeTab === "Tasks" ? "Create Task" : "Add Goal"}
          </button>
        </div>
      </section>

      {/* Main Content */}
      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.75fr)]">
        <div>
          {activeTab === "Clients" ? (
            <AmazonClientTableComponent table={clientsTable} openEdit={openEditClient} />
          ) : activeTab === "Tasks" ? (
            <AmazonTaskTableComponent table={tasksTable} openEdit={openEditTask} />
          ) : (
            <AmazonGoalTableComponent table={goalsTable} openEdit={openEditGoal} />
          )}
        </div>
        <AmazonRightColumn
          taskStatusData={taskStatusData}
          totalTaskCount={totalTaskCount}
          salesData={salesData}
          totalRevenue={totalRevenue}
        />
      </section>

      {/* ═══════════════════ CRUD MODALS ═══════════════════ */}

      {/* Client Add */}
      <Modal isOpen={clientsTable.isAddOpen} onClose={() => clientsTable.setIsAddOpen(false)} title="Onboard Amazon Client">
        <form onSubmit={submitAddClient} className="space-y-4">
          <FormInput label="Client Name" value={clientForm.name} onChange={v => setClientForm({ ...clientForm, name: v })} placeholder="e.g. Ahmed Electronics" />
          <div className="flex gap-3">
            <FormSelect label="Marketplace" value={clientForm.marketplace} onChange={v => setClientForm({ ...clientForm, marketplace: v })} options={["Amazon US", "Amazon UK", "Amazon UAE", "Amazon DE", "Amazon CA"]} />
            <FormSelect label="Services" value={clientForm.services} onChange={v => setClientForm({ ...clientForm, services: v })} options={["FBA Management", "PPC Campaigns", "Listing Optimization", "Brand Registry", "Account Management"]} />
          </div>
          <div className="flex gap-3">
            <FormInput label="Revenue (30d)" value={clientForm.revenue30d} onChange={v => setClientForm({ ...clientForm, revenue30d: v })} placeholder="PKR 0" />
            <FormInput label="Profit (30d)" value={clientForm.profit30d} onChange={v => setClientForm({ ...clientForm, profit30d: v })} placeholder="PKR 0" />
          </div>
          <FormSelect label="Payment Status" value={clientForm.paymentStatus} onChange={v => setClientForm({ ...clientForm, paymentStatus: v })} options={["Pending", "Partial", "Paid"]} />
          <ModalFooter onCancel={() => clientsTable.setIsAddOpen(false)} submitLabel="Save Client" />
        </form>
      </Modal>

      {/* Client Edit */}
      <Modal isOpen={clientsTable.isEditOpen} onClose={() => clientsTable.setIsEditOpen(false)} title="Modify Client Record">
        <form onSubmit={submitEditClient} className="space-y-4">
          <FormInput label="Client Name" value={clientForm.name} onChange={v => setClientForm({ ...clientForm, name: v })} />
          <div className="flex gap-3">
            <FormSelect label="Marketplace" value={clientForm.marketplace} onChange={v => setClientForm({ ...clientForm, marketplace: v })} options={["Amazon US", "Amazon UK", "Amazon UAE", "Amazon DE", "Amazon CA"]} />
            <FormSelect label="Services" value={clientForm.services} onChange={v => setClientForm({ ...clientForm, services: v })} options={["FBA Management", "PPC Campaigns", "Listing Optimization", "Brand Registry", "Account Management"]} />
          </div>
          <div className="flex gap-3">
            <FormInput label="Revenue (30d)" value={clientForm.revenue30d} onChange={v => setClientForm({ ...clientForm, revenue30d: v })} />
            <FormInput label="Profit (30d)" value={clientForm.profit30d} onChange={v => setClientForm({ ...clientForm, profit30d: v })} />
          </div>
          <FormSelect label="Payment Status" value={clientForm.paymentStatus} onChange={v => setClientForm({ ...clientForm, paymentStatus: v })} options={["Pending", "Partial", "Paid"]} />
          <ModalFooter onCancel={() => clientsTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>

      {/* Client View */}
      <ViewDrawer isOpen={clientsTable.isViewOpen} onClose={() => clientsTable.setIsViewOpen(false)} title={clientsTable.selectedItem?.name || "Client"}>
        {clientsTable.selectedItem && (
          <div className="space-y-4">
            <DrawerSection label="Business Details">
              <DrawerField label="Client" value={clientsTable.selectedItem.name} />
              <DrawerField label="Marketplace" value={clientsTable.selectedItem.marketplace} />
              <DrawerField label="Services" value={clientsTable.selectedItem.services} />
              <DrawerField label="Active Store" value={clientsTable.selectedItem.activeStore} />
            </DrawerSection>
            <DrawerSection label="Financial Overview">
              <DrawerField label="Revenue (30d)" value={clientsTable.selectedItem.revenue30d} />
              <DrawerField label="Profit (30d)" value={clientsTable.selectedItem.profit30d} />
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <span>Payment:</span> <AmazonPill value={clientsTable.selectedItem.paymentStatus} />
              </div>
            </DrawerSection>
          </div>
        )}
      </ViewDrawer>

      {/* Client Delete */}
      <ConfirmDialog
        isOpen={clientsTable.isConfirmOpen}
        onClose={() => clientsTable.setIsConfirmOpen(false)}
        onConfirm={confirmDeleteClient}
        title="Delete Client Record"
        message={`Are you sure you want to remove ${clientsTable.selectedItem?.name}? This action cannot be undone.`}
      />

      {/* Task Add */}
      <Modal isOpen={tasksTable.isAddOpen} onClose={() => tasksTable.setIsAddOpen(false)} title="Create Amazon Task">
        <form onSubmit={submitAddTask} className="space-y-4">
          <FormInput label="Task Title" value={taskForm.title} onChange={v => setTaskForm({ ...taskForm, title: v })} placeholder="e.g. PPC Campaign Setup" required />
          <div className="flex gap-3">
            <FormInput label="Client" value={taskForm.client} onChange={v => setTaskForm({ ...taskForm, client: v })} placeholder="Client name" />
            <FormInput label="Assigned To" value={taskForm.assignee} onChange={v => setTaskForm({ ...taskForm, assignee: v })} placeholder="Team member" />
          </div>
          <div className="flex gap-3">
            <FormInput label="Due Date" value={taskForm.dueDate} onChange={v => setTaskForm({ ...taskForm, dueDate: v })} placeholder="e.g. 15 Jun 2024" />
            <FormSelect label="Status" value={taskForm.status} onChange={v => setTaskForm({ ...taskForm, status: v })} options={["Not Started", "In Progress", "Completed", "At Risk"]} />
          </div>
          <ModalFooter onCancel={() => tasksTable.setIsAddOpen(false)} submitLabel="Create Task" />
        </form>
      </Modal>

      {/* Task Edit */}
      <Modal isOpen={tasksTable.isEditOpen} onClose={() => tasksTable.setIsEditOpen(false)} title="Modify Task">
        <form onSubmit={submitEditTask} className="space-y-4">
          <FormInput label="Task Title" value={taskForm.title} onChange={v => setTaskForm({ ...taskForm, title: v })} />
          <div className="flex gap-3">
            <FormInput label="Client" value={taskForm.client} onChange={v => setTaskForm({ ...taskForm, client: v })} />
            <FormInput label="Assigned To" value={taskForm.assignee} onChange={v => setTaskForm({ ...taskForm, assignee: v })} />
          </div>
          <div className="flex gap-3">
            <FormInput label="Due Date" value={taskForm.dueDate} onChange={v => setTaskForm({ ...taskForm, dueDate: v })} />
            <FormSelect label="Status" value={taskForm.status} onChange={v => setTaskForm({ ...taskForm, status: v })} options={["Not Started", "In Progress", "Completed", "At Risk"]} />
          </div>
          <ModalFooter onCancel={() => tasksTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>

      {/* Task Delete */}
      <ConfirmDialog
        isOpen={tasksTable.isConfirmOpen}
        onClose={() => tasksTable.setIsConfirmOpen(false)}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message={`Remove task "${tasksTable.selectedItem?.title}"? This cannot be undone.`}
      />

      {/* Goal Add */}
      <Modal isOpen={goalsTable.isAddOpen} onClose={() => goalsTable.setIsAddOpen(false)} title="Register Amazon Goal">
        <form onSubmit={submitAddGoal} className="space-y-4">
          <FormInput label="Goal Description" value={goalForm.goal} onChange={v => setGoalForm({ ...goalForm, goal: v })} placeholder="e.g. Achieve 50% ROI on PPC" required />
          <div className="flex gap-3">
            <FormInput label="Client" value={goalForm.client} onChange={v => setGoalForm({ ...goalForm, client: v })} placeholder="Client name" />
            <FormInput label="Target Date" value={goalForm.targetDate} onChange={v => setGoalForm({ ...goalForm, targetDate: v })} placeholder="e.g. 30 Jun 2024" />
          </div>
          <FormSelect label="Status" value={goalForm.status} onChange={v => setGoalForm({ ...goalForm, status: v })} options={["Not Started", "In Progress", "Completed", "At Risk"]} />
          <ModalFooter onCancel={() => goalsTable.setIsAddOpen(false)} submitLabel="Save Goal" />
        </form>
      </Modal>

      {/* Goal Edit */}
      <Modal isOpen={goalsTable.isEditOpen} onClose={() => goalsTable.setIsEditOpen(false)} title="Modify Goal">
        <form onSubmit={submitEditGoal} className="space-y-4">
          <FormInput label="Goal Description" value={goalForm.goal} onChange={v => setGoalForm({ ...goalForm, goal: v })} />
          <div className="flex gap-3">
            <FormInput label="Client" value={goalForm.client} onChange={v => setGoalForm({ ...goalForm, client: v })} />
            <FormInput label="Progress" value={goalForm.progress} onChange={v => setGoalForm({ ...goalForm, progress: v })} />
          </div>
          <div className="flex gap-3">
            <FormInput label="Target Date" value={goalForm.targetDate} onChange={v => setGoalForm({ ...goalForm, targetDate: v })} />
            <FormSelect label="Status" value={goalForm.status} onChange={v => setGoalForm({ ...goalForm, status: v })} options={["Not Started", "In Progress", "Completed", "At Risk"]} />
          </div>
          <ModalFooter onCancel={() => goalsTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>

      {/* Goal Delete */}
      <ConfirmDialog
        isOpen={goalsTable.isConfirmOpen}
        onClose={() => goalsTable.setIsConfirmOpen(false)}
        onConfirm={confirmDeleteGoal}
        title="Delete Goal"
        message={`Remove goal "${goalsTable.selectedItem?.goal}"? This cannot be undone.`}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// REUSABLE FORM SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function FormInput({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <label className="block flex-1">
      <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</span>
      <input type="text" required={required} value={value} onChange={e => onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white" placeholder={placeholder} />
    </label>
  );
}

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block flex-1">
      <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

function ModalFooter({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) {
  return (
    <div className="flex justify-end gap-3 pt-3">
      <button type="button" onClick={onCancel} className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-extrabold text-slate-600 hover:bg-slate-50 bg-white">Cancel</button>
      <button type="submit" className="h-10 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700">{submitLabel}</button>
    </div>
  );
}

function DrawerSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card space-y-3">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{label}</span>
      {children}
    </div>
  );
}

function DrawerField({ label, value }: { label: string; value: string }) {
  return <p className="text-sm font-semibold text-slate-600">{label}: <b className="text-slate-800">{value}</b></p>;
}

// ═══════════════════════════════════════════════════════════════════════
// TABLE SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function Tab({ icon: Icon, label, active = false, onClick }: { icon: LucideIcon; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-extrabold transition duration-150 ${active ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-900"}`}>
      <Icon size={17} /> {label}
    </button>
  );
}

function AmazonClientTableComponent({ table, openEdit }: { table: ReturnType<typeof useTable<ClientRecord>>; openEdit: (c: ClientRecord) => void }) {
  const columns = ["#", "Client Name", "Marketplace", "Services", "Active Store", "Tasks", "Revenue (30d)", "Profit (30d)", "Payment Status", "Actions"];
  return (
    <Card title="Client Management" subtext="Manage Amazon clients and performance overview." action={<TableActions searchQuery={table.searchQuery} onSearchChange={table.setSearchQuery} searchPlaceholder="Search clients..." columns={columns} visibleColumns={table.visibleColumns} onToggleColumn={col => table.setVisibleColumns(c => ({ ...c, [col]: c[col] === false ? true : false }))} />}>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>{columns.map(h => table.visibleColumns[h] !== false && <th key={h} className="px-4 py-3 font-extrabold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.paginatedData.map((row, i) => (
              <tr key={row.id} className="text-sm hover:bg-slate-50 transition duration-100">
                {table.visibleColumns["#"] !== false && <td className="px-4 py-3 font-extrabold text-slate-400">{(table.currentPage - 1) * table.pageSize + i + 1}</td>}
                {table.visibleColumns["Client Name"] !== false && <td className="px-4 py-3 font-extrabold text-slate-950">{row.name}</td>}
                {table.visibleColumns["Marketplace"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.marketplace}</td>}
                {table.visibleColumns["Services"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.services}</td>}
                {table.visibleColumns["Active Store"] !== false && <td className="px-4 py-3"><AmazonPill value={row.activeStore} /></td>}
                {table.visibleColumns["Tasks"] !== false && <td className="px-4 py-3 font-extrabold text-slate-700">{row.tasks}</td>}
                {table.visibleColumns["Revenue (30d)"] !== false && <td className="px-4 py-3 font-extrabold text-slate-900">{row.revenue30d}</td>}
                {table.visibleColumns["Profit (30d)"] !== false && <td className="px-4 py-3 font-extrabold text-emerald-600">{row.profit30d}</td>}
                {table.visibleColumns["Payment Status"] !== false && <td className="px-4 py-3"><AmazonPill value={row.paymentStatus} /></td>}
                {table.visibleColumns["Actions"] !== false && (
                  <td className="px-4 py-3">
                    <ActionIcons onView={() => table.selectItemForAction(row, "view")} onEdit={() => openEdit(row)} onDelete={() => table.selectItemForAction(row, "delete")} />
                  </td>
                )}
              </tr>
            ))}
            {table.paginatedData.length === 0 && (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-sm font-bold text-slate-400 bg-slate-50/20">No clients. Click "+ Add Client" to begin.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <TableFooter text={`Showing ${Math.min((table.currentPage - 1) * table.pageSize + 1, table.filteredData.length)} to ${Math.min(table.currentPage * table.pageSize, table.filteredData.length)} of ${table.filteredData.length} entries`} pages={Array.from({ length: table.totalPages }, (_, i) => String(i + 1))} />
    </Card>
  );
}

function AmazonTaskTableComponent({ table, openEdit }: { table: ReturnType<typeof useTable<TaskRecord>>; openEdit: (t: TaskRecord) => void }) {
  const columns = ["#", "Task Title", "Client", "Assigned To", "Due Date", "Status", "Actions"];
  return (
    <Card title="Amazon Tasks" subtext="Track operational tasks across marketplaces and client accounts." action={<TableActions searchQuery={table.searchQuery} onSearchChange={table.setSearchQuery} searchPlaceholder="Search tasks..." columns={columns} visibleColumns={table.visibleColumns} onToggleColumn={col => table.setVisibleColumns(c => ({ ...c, [col]: c[col] === false ? true : false }))} />}>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>{columns.map(h => table.visibleColumns[h] !== false && <th key={h} className="px-4 py-3 font-extrabold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.paginatedData.map((row, i) => (
              <tr key={row.id} className="text-sm hover:bg-slate-50 transition duration-100">
                {table.visibleColumns["#"] !== false && <td className="px-4 py-3 font-extrabold text-slate-400">{(table.currentPage - 1) * table.pageSize + i + 1}</td>}
                {table.visibleColumns["Task Title"] !== false && <td className="px-4 py-3 font-extrabold text-slate-900">{row.title}</td>}
                {table.visibleColumns["Client"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.client}</td>}
                {table.visibleColumns["Assigned To"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.assignee}</td>}
                {table.visibleColumns["Due Date"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.dueDate}</td>}
                {table.visibleColumns["Status"] !== false && <td className="px-4 py-3"><AmazonTaskBadge status={row.status} /></td>}
                {table.visibleColumns["Actions"] !== false && (
                  <td className="px-4 py-3">
                    <ActionIcons onEdit={() => openEdit(row)} onDelete={() => table.selectItemForAction(row, "delete")} />
                  </td>
                )}
              </tr>
            ))}
            {table.paginatedData.length === 0 && (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-sm font-bold text-slate-400 bg-slate-50/20">No tasks. Click "+ Create Task" to begin.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <TableFooter text={`Showing ${Math.min((table.currentPage - 1) * table.pageSize + 1, table.filteredData.length)} to ${Math.min(table.currentPage * table.pageSize, table.filteredData.length)} of ${table.filteredData.length} entries`} pages={Array.from({ length: table.totalPages }, (_, i) => String(i + 1))} />
    </Card>
  );
}

function AmazonGoalTableComponent({ table, openEdit }: { table: ReturnType<typeof useTable<GoalRecord>>; openEdit: (g: GoalRecord) => void }) {
  const columns = ["#", "Goal", "Client", "Progress", "Target Date", "Status", "Actions"];
  return (
    <Card title="Amazon Goals" subtext="Monitor targets for revenue, listings, PPC, and account health." action={<TableActions searchQuery={table.searchQuery} onSearchChange={table.setSearchQuery} searchPlaceholder="Search goals..." columns={columns} visibleColumns={table.visibleColumns} onToggleColumn={col => table.setVisibleColumns(c => ({ ...c, [col]: c[col] === false ? true : false }))} />}>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>{columns.map(h => table.visibleColumns[h] !== false && <th key={h} className="px-4 py-3 font-extrabold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.paginatedData.map((row, i) => (
              <tr key={row.id} className="text-sm hover:bg-slate-50 transition duration-100">
                {table.visibleColumns["#"] !== false && <td className="px-4 py-3 font-extrabold text-slate-400">{(table.currentPage - 1) * table.pageSize + i + 1}</td>}
                {table.visibleColumns["Goal"] !== false && <td className="px-4 py-3 font-extrabold text-slate-900">{row.goal}</td>}
                {table.visibleColumns["Client"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.client}</td>}
                {table.visibleColumns["Progress"] !== false && <td className="px-4 py-3"><ProgressBar value={row.progress} /></td>}
                {table.visibleColumns["Target Date"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.targetDate}</td>}
                {table.visibleColumns["Status"] !== false && <td className="px-4 py-3"><AmazonTaskBadge status={row.status} /></td>}
                {table.visibleColumns["Actions"] !== false && (
                  <td className="px-4 py-3">
                    <ActionIcons onEdit={() => openEdit(row)} onDelete={() => table.selectItemForAction(row, "delete")} />
                  </td>
                )}
              </tr>
            ))}
            {table.paginatedData.length === 0 && (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-sm font-bold text-slate-400 bg-slate-50/20">No goals. Click "+ Add Goal" to begin.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <TableFooter text={`Showing ${Math.min((table.currentPage - 1) * table.pageSize + 1, table.filteredData.length)} to ${Math.min(table.currentPage * table.pageSize, table.filteredData.length)} of ${table.filteredData.length} entries`} pages={Array.from({ length: table.totalPages }, (_, i) => String(i + 1))} />
    </Card>
  );
}

function AmazonRightColumn({ taskStatusData, totalTaskCount, salesData, totalRevenue }: {
  taskStatusData: { name: string; value: number; color: string }[];
  totalTaskCount: number;
  salesData: { name: string; value: number; color: string }[];
  totalRevenue: number;
}) {
  return (
    <aside className="space-y-6">
      <Card title="Sales Overview">
        <div className="p-5">
          {salesData.some(d => d.value > 0) ? (
            <>
              <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={salesData.filter(d => d.value > 0)} innerRadius={72} outerRadius={104} paddingAngle={3} dataKey="value">
                      {salesData.filter(d => d.value > 0).map(entry => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-xl font-extrabold text-slate-950">PKR {totalRevenue.toLocaleString()}</p>
                  <p className="text-xs font-bold text-slate-500">Total Revenue</p>
                </div>
              </div>
              <ChartLegend items={salesData.filter(d => d.value > 0).map(item => ({ ...item, pct: `${totalRevenue > 0 ? Math.round((item.value / salesData.reduce((s, d) => s + d.value, 0)) * 100) : 0}%` }))} />
            </>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm font-bold text-slate-400">Add clients to see sales overview</div>
          )}
        </div>
      </Card>

      <Card title="Tasks Summary">
        <div className="p-5">
          {totalTaskCount > 0 ? (
            <>
              <div className="relative h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={taskStatusData.filter(d => d.value > 0)} innerRadius={58} outerRadius={86} paddingAngle={3} dataKey="value">
                      {taskStatusData.filter(d => d.value > 0).map(entry => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-2xl font-extrabold text-slate-950">{totalTaskCount}</p>
                  <p className="text-xs font-bold text-slate-500">Total Tasks</p>
                </div>
              </div>
              <ChartLegend items={taskStatusData.filter(d => d.value > 0).map(item => ({ ...item, pct: `${Math.round((item.value / totalTaskCount) * 100)}%` }))} />
            </>
          ) : (
            <div className="flex h-56 items-center justify-center text-sm font-bold text-slate-400">Create tasks to see summary</div>
          )}
        </div>
      </Card>

      <Card title="Account Health Overview">
        <div className="space-y-4 p-5">
          {accountHealth.length > 0 ? accountHealth.map(metric => (
            <div key={metric.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-extrabold text-slate-700">{metric.label}</span>
                <span className="font-extrabold text-emerald-600">{metric.value}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-emerald-500" style={{ width: `${metric.pct}%` }} />
              </div>
            </div>
          )) : (
            <div className="text-center text-sm font-bold text-slate-400 py-2">No health metrics available</div>
          )}
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-slate-700">Feedback Rating</span>
              <span className="text-sm font-extrabold text-emerald-600">— / 5</span>
            </div>
            <p className="mt-2 text-lg font-extrabold text-slate-300">☆☆☆☆☆</p>
          </div>
        </div>
      </Card>
    </aside>
  );
}
