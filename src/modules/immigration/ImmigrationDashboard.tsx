import { useState } from "react";
import { Users, Calendar, Target, Plus, Download, Printer, Eye, ChevronDown } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card } from "../../components/shared/Card";
import { KpiCard } from "../../components/shared/KpiCard";
import {
  StatusBadge,
  PriorityBadge,
  AmazonPill,
  ImmigrationStatusBadge,
  ProgressBar,
} from "../../components/shared/badges";
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

// Data Types
interface ClientRecord {
  id: string;
  name: string;
  serviceType: string;
  tasksCount: string;
  paymentAmount: string;
  paymentStatus: string;
}

interface TaskRecord {
  id: string;
  title: string;
  assignee: string;
  priority: string;
  dueDate: string;
  progress: string;
  status: string;
}

interface GoalRecord {
  id: string;
  description: string;
  target: string;
  progress: string;
  pct: string;
  deadline: string;
  status: string;
}

export function ImmigrationDashboard() {
  const [activeTab, setActiveTab] = useState("Clients");

  // Toast State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");

  const showToast = (msg: string, type: ToastType = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // 1. Clients Table Hook
  const clientsTable = useTable<ClientRecord>({
    initialData: [],
    searchFields: ["name", "serviceType", "paymentStatus"],
    defaultPageSize: 5,
    supabaseTable: "clients",
    supabaseFilter: { column: "department", value: "immigration" },
  });

  // 2. Tasks Table Hook
  const tasksTable = useTable<TaskRecord>({
    initialData: [],
    searchFields: ["title", "assignee", "status"],
    defaultPageSize: 5,
    supabaseTable: "tasks",
    supabaseFilter: { column: "department", value: "immigration" },
  });

  // 3. Goals Table Hook
  const goalsTable = useTable<GoalRecord>({
    initialData: [],
    searchFields: ["description", "status"],
    defaultPageSize: 5,
    supabaseTable: "goals",
    supabaseFilter: { column: "department", value: "immigration" },
  });

  // Dropdown states for Dashboard Header Export
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Form Field Local States
  const [clientForm, setClientForm] = useState<Omit<ClientRecord, "id">>({
    name: "",
    serviceType: "Study Visa",
    tasksCount: "0",
    paymentAmount: "PKR 0",
    paymentStatus: "Pending",
  });

  const [taskForm, setTaskForm] = useState<Omit<TaskRecord, "id">>({
    title: "",
    assignee: "",
    priority: "Medium",
    dueDate: "",
    progress: "0%",
    status: "Not Started",
  });

  const [goalForm, setGoalForm] = useState<Omit<GoalRecord, "id">>({
    description: "",
    target: "100%",
    progress: "0%",
    pct: "0%",
    deadline: "",
    status: "Not Started",
  });

  // Dynamic KPI Counts
  const activeCasesCount = clientsTable.data.length;
  const approvalsCount = clientsTable.data.filter((c) => c.paymentStatus === "Paid").length;
  const pendingPaymentsCount = clientsTable.data.filter((c) => c.paymentStatus === "Pending").length;
  const totalRevenueSum = clientsTable.data
    .filter((c) => c.paymentStatus === "Paid")
    .reduce((sum, c) => sum + (parseInt(c.paymentAmount.replace(/[^\d]/g, "")) || 0), 0);

  const immigrationKpis = [
    { label: "Total Clients", value: String(clientsTable.data.length), change: "\u2014", trend: "positive", icon: Users, color: "#7c3aed", bg: "bg-violet-50" },
    { label: "Active Cases", value: String(activeCasesCount), change: "\u2014", trend: "positive", icon: Users, color: "#1a73e8", bg: "bg-blue-50" },
    { label: "Total Revenue", value: `PKR ${totalRevenueSum.toLocaleString()}`, change: "\u2014", trend: "positive", icon: Users, color: "#16a34a", bg: "bg-green-50" },
    { label: "Pending Payments", value: String(pendingPaymentsCount), change: "\u2014", trend: "negative", icon: Users, color: "#f97316", bg: "bg-orange-50" },
    { label: "Visa Approvals", value: String(approvalsCount), change: "\u2014", trend: "positive", icon: Users, color: "#0d9488", bg: "bg-teal-50" },
  ];

  // Dynamic Case Status Distribution
  const caseStatusData = [
    { name: "Paid Approvals", value: approvalsCount, color: "#10B981" },
    { name: "Pending Invoices", value: pendingPaymentsCount, color: "#F59E0B" },
  ];

  // Global Export Handler
  const handleExport = (format: "pdf" | "excel") => {
    setShowExportMenu(false);
    if (activeTab === "Clients") {
      const headers = ["#", "Client Name", "Type of Service", "Tasks", "Payment Amount", "Payment Status"];
      const rows = clientsTable.data.map((c, i) => [
        String(i + 1),
        c.name,
        c.serviceType,
        c.tasksCount,
        c.paymentAmount,
        c.paymentStatus,
      ]);
      if (format === "pdf") {
        exportToPDF({ title: "Immigration Clients Report", headers, rows, fileName: "immigration_clients" });
      } else {
        exportToExcel({ title: "Immigration Clients", headers, rows, fileName: "immigration_clients" });
      }
      showToast(`Clients list exported to ${format.toUpperCase()}`, "success");
    } else if (activeTab === "Tasks") {
      const headers = ["#", "Task Title", "Assigned To", "Priority", "Due Date", "Progress", "Status"];
      const rows = tasksTable.data.map((t, i) => [
        String(i + 1),
        t.title,
        t.assignee,
        t.priority,
        t.dueDate,
        t.progress,
        t.status,
      ]);
      if (format === "pdf") {
        exportToPDF({ title: "Immigration Tasks Report", headers, rows, fileName: "immigration_tasks" });
      } else {
        exportToExcel({ title: "Immigration Tasks", headers, rows, fileName: "immigration_tasks" });
      }
      showToast(`Tasks list exported to ${format.toUpperCase()}`, "success");
    } else {
      const headers = ["#", "Goal Description", "Target", "Current Progress", "% Achieved", "Deadline", "Status"];
      const rows = goalsTable.data.map((g, i) => [
        String(i + 1),
        g.description,
        g.target,
        g.progress,
        g.pct,
        g.deadline,
        g.status,
      ]);
      if (format === "pdf") {
        exportToPDF({ title: "Immigration Goals Report", headers, rows, fileName: "immigration_goals" });
      } else {
        exportToExcel({ title: "Immigration Goals", headers, rows, fileName: "immigration_goals" });
      }
      showToast(`Goals list exported to ${format.toUpperCase()}`, "success");
    }
  };

  // Client CRUD Actions
  const openAddClient = () => {
    setClientForm({ name: "", serviceType: "Study Visa", tasksCount: "0", paymentAmount: "PKR 0", paymentStatus: "Pending" });
    clientsTable.setIsAddOpen(true);
  };

  const submitAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim()) return;
    const newId = String(clientsTable.data.length + 1);
    clientsTable.addItem({ id: newId, ...clientForm });
    clientsTable.setIsAddOpen(false);
    showToast(`Client ${clientForm.name} added successfully!`, "success");
  };

  const openEditClient = (client: ClientRecord) => {
    setClientForm({
      name: client.name,
      serviceType: client.serviceType,
      tasksCount: client.tasksCount,
      paymentAmount: client.paymentAmount,
      paymentStatus: client.paymentStatus,
    });
    clientsTable.selectItemForAction(client, "edit");
  };

  const submitEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientsTable.selectedItem) return;
    clientsTable.updateItem({
      id: clientsTable.selectedItem.id,
      ...clientForm,
    });
    clientsTable.setIsEditOpen(false);
    showToast(`Client details updated!`, "success");
  };

  const confirmDeleteClient = () => {
    if (!clientsTable.selectedItem) return;
    clientsTable.deleteItem(clientsTable.selectedItem.id);
    showToast(`Record removed from case files`, "error");
  };

  // Task CRUD Actions
  const openAddTask = () => {
    setTaskForm({ title: "", assignee: "", priority: "Medium", dueDate: "", progress: "0%", status: "Not Started" });
    tasksTable.setIsAddOpen(true);
  };

  const submitAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    const newId = String(tasksTable.data.length + 1);
    tasksTable.addItem({ id: newId, ...taskForm });
    tasksTable.setIsAddOpen(false);
    showToast(`Task created!`, "success");
  };

  const openEditTask = (task: TaskRecord) => {
    setTaskForm({
      title: task.title,
      assignee: task.assignee,
      priority: task.priority,
      dueDate: task.dueDate,
      progress: task.progress,
      status: task.status,
    });
    tasksTable.selectItemForAction(task, "edit");
  };

  const submitEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tasksTable.selectedItem) return;
    tasksTable.updateItem({
      id: tasksTable.selectedItem.id,
      ...taskForm,
    });
    tasksTable.setIsEditOpen(false);
    showToast(`Task details updated!`, "success");
  };

  // Goal CRUD Actions
  const openAddGoal = () => {
    setGoalForm({ description: "", target: "100%", progress: "0%", pct: "0%", deadline: "", status: "Not Started" });
    goalsTable.setIsAddOpen(true);
  };

  const submitAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.description.trim()) return;
    const newId = String(goalsTable.data.length + 1);
    goalsTable.addItem({ id: newId, ...goalForm });
    goalsTable.setIsAddOpen(false);
    showToast(`Milestone goal registered!`, "success");
  };

  const openEditGoal = (goal: GoalRecord) => {
    setGoalForm({
      description: goal.description,
      target: goal.target,
      progress: goal.progress,
      pct: goal.pct,
      deadline: goal.deadline,
      status: goal.status,
    });
    goalsTable.selectItemForAction(goal, "edit");
  };

  const submitEditGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalsTable.selectedItem) return;
    goalsTable.updateItem({
      id: goalsTable.selectedItem.id,
      ...goalForm,
    });
    goalsTable.setIsEditOpen(false);
    showToast(`Goal details updated!`, "success");
  };

  return (
    <>
      {/* Toast Alert popup */}
      <Toast message={toastMessage} type={toastType} isOpen={toastOpen} onClose={() => setToastOpen(false)} />

      {/* KPI Overviews */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {immigrationKpis.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </section>

      {/* Primary Tab controls & Export menu */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-6">
          <Tab icon={Users} label="Clients" active={activeTab === "Clients"} onClick={() => setActiveTab("Clients")} />
          <Tab icon={Calendar} label="Tasks" active={activeTab === "Tasks"} onClick={() => setActiveTab("Tasks")} />
          <Tab icon={Target} label="Goals" active={activeTab === "Goals"} onClick={() => setActiveTab("Goals")} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              <Download size={16} />
              Export
              <ChevronDown size={14} />
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-2 z-20 w-44 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl animate-scale-up space-y-1">
                  <button
                    onClick={() => handleExport("pdf")}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Export to PDF
                  </button>
                  <button
                    onClick={() => handleExport("excel")}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Export to Excel
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={triggerPrint}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <Printer size={16} />
            Print
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

      {/* Main Workspace */}
      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.75fr)]">
        <div>
          {activeTab === "Clients" ? (
            <ImmigrationClientTableComponent table={clientsTable} openEdit={openEditClient} />
          ) : activeTab === "Tasks" ? (
            <ImmigrationTasksTableComponent table={tasksTable} openEdit={openEditTask} />
          ) : (
            <ImmigrationGoalsTableComponent table={goalsTable} openEdit={openEditGoal} />
          )}
        </div>
        <ImmigrationRightColumn caseStatusData={caseStatusData} totalCases={clientsTable.data.length} />
      </section>

      {/* ========================================================================= */}
      {/* CRUD MODALS & DIALOGS */}
      {/* ========================================================================= */}

      {/* 1. Client Add Modal */}
      <Modal isOpen={clientsTable.isAddOpen} onClose={() => clientsTable.setIsAddOpen(false)} title="Onboard New Immigration Client">
        <form onSubmit={submitAddClient} className="space-y-4">
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Client Name</span>
            <input
              type="text"
              required
              value={clientForm.name}
              onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
              placeholder="e.g. Asma Ali"
            />
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Visa / Service Type</span>
            <select
              value={clientForm.serviceType}
              onChange={(e) => setClientForm({ ...clientForm, serviceType: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
            >
              <option>Study Visa</option>
              <option>Express Entry</option>
              <option>Work Permit</option>
              <option>Spouse Sponsorship</option>
              <option>Visitor Visa</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Payment Amount</span>
            <input
              type="text"
              required
              value={clientForm.paymentAmount}
              onChange={(e) => setClientForm({ ...clientForm, paymentAmount: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
              placeholder="e.g. PKR 150,000"
            />
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Payment Status</span>
            <select
              value={clientForm.paymentStatus}
              onChange={(e) => setClientForm({ ...clientForm, paymentStatus: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
            >
              <option>Pending</option>
              <option>Partial</option>
              <option>Paid</option>
            </select>
          </label>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => clientsTable.setIsAddOpen(false)}
              className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-extrabold text-slate-600 hover:bg-slate-50 bg-white"
            >
              Cancel
            </button>
            <button type="submit" className="h-10 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700">
              Save Client
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Client Edit Modal */}
      <Modal isOpen={clientsTable.isEditOpen} onClose={() => clientsTable.setIsEditOpen(false)} title="Modify Client Record">
        <form onSubmit={submitEditClient} className="space-y-4">
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Client Name</span>
            <input
              type="text"
              required
              value={clientForm.name}
              onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
            />
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Visa / Service Type</span>
            <select
              value={clientForm.serviceType}
              onChange={(e) => setClientForm({ ...clientForm, serviceType: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
            >
              <option>Study Visa</option>
              <option>Express Entry</option>
              <option>Work Permit</option>
              <option>Spouse Sponsorship</option>
              <option>Visitor Visa</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Payment Amount</span>
            <input
              type="text"
              required
              value={clientForm.paymentAmount}
              onChange={(e) => setClientForm({ ...clientForm, paymentAmount: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
            />
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Payment Status</span>
            <select
              value={clientForm.paymentStatus}
              onChange={(e) => setClientForm({ ...clientForm, paymentStatus: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
            >
              <option>Pending</option>
              <option>Partial</option>
              <option>Paid</option>
            </select>
          </label>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => clientsTable.setIsEditOpen(false)}
              className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-extrabold text-slate-600 hover:bg-slate-50 bg-white"
            >
              Cancel
            </button>
            <button type="submit" className="h-10 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Sliding View Drawer */}
      <ViewDrawer isOpen={clientsTable.isViewOpen} onClose={() => clientsTable.setIsViewOpen(false)} title={clientsTable.selectedItem?.name || "Client File"}>
        {clientsTable.selectedItem ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Personal Details</span>
              <p className="text-sm font-semibold text-slate-600">Client ID: <b className="text-slate-800">#{clientsTable.selectedItem.id}</b></p>
              <p className="text-sm font-semibold text-slate-600">Name: <b className="text-slate-800">{clientsTable.selectedItem.name}</b></p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Application Parameters</span>
              <p className="text-sm font-semibold text-slate-600">Visa Class: <b className="text-slate-800">{clientsTable.selectedItem.serviceType}</b></p>
              <p className="text-sm font-semibold text-slate-600">Active Tasks: <b className="text-slate-800">{clientsTable.selectedItem.tasksCount}</b></p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Financial Overview</span>
              <p className="text-sm font-semibold text-slate-600">Consultancy Fee: <b className="text-slate-800">{clientsTable.selectedItem.paymentAmount}</b></p>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <span>Fee Status:</span>
                <AmazonPill value={clientsTable.selectedItem.paymentStatus} />
              </div>
            </div>
          </div>
        ) : null}
      </ViewDrawer>

      {/* 4. Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={clientsTable.isConfirmOpen}
        onClose={() => clientsTable.setIsConfirmOpen(false)}
        onConfirm={confirmDeleteClient}
        title="Confirm Record Deletion"
        message={`Are you sure you want to delete ${clientsTable.selectedItem?.name} from immigration records? This will clear all application files.`}
      />

      {/* 5. Task Add Modal */}
      <Modal isOpen={tasksTable.isAddOpen} onClose={() => tasksTable.setIsAddOpen(false)} title="Create Operational Task">
        <form onSubmit={submitAddTask} className="space-y-4">
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Task Title</span>
            <input
              type="text"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
              placeholder="e.g. Document Checklist Audit"
            />
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Assigned To</span>
            <input
              type="text"
              required
              value={taskForm.assignee}
              onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
              placeholder="e.g. Sara Khan"
            />
          </label>
          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Priority</span>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
            <label className="block flex-1">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Status</span>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>At Risk</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => tasksTable.setIsAddOpen(false)}
              className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-extrabold text-slate-600 hover:bg-slate-50 bg-white"
            >
              Cancel
            </button>
            <button type="submit" className="h-10 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700">
              Create Task
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Goal Add Modal */}
      <Modal isOpen={goalsTable.isAddOpen} onClose={() => goalsTable.setIsAddOpen(false)} title="Register Target Milestone">
        <form onSubmit={submitAddGoal} className="space-y-4">
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Goal Description</span>
            <input
              type="text"
              required
              value={goalForm.description}
              onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
              placeholder="e.g. Expand Spousal Visas by 20%"
            />
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Target Deadline</span>
            <input
              type="text"
              required
              value={goalForm.deadline}
              onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
              placeholder="e.g. 30 Jun 2024"
            />
          </label>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => goalsTable.setIsAddOpen(false)}
              className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-extrabold text-slate-600 hover:bg-slate-50 bg-white"
            >
              Cancel
            </button>
            <button type="submit" className="h-10 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700">
              Save Goal
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. Task Edit Modal */}
      <Modal isOpen={tasksTable.isEditOpen} onClose={() => tasksTable.setIsEditOpen(false)} title="Modify Operational Task">
        <form onSubmit={submitEditTask} className="space-y-4">
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Task Title</span>
            <input
              type="text"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
            />
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Assigned To</span>
            <input
              type="text"
              required
              value={taskForm.assignee}
              onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
            />
          </label>
          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Priority</span>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
            <label className="block flex-grow">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Progress</span>
              <input
                type="text"
                required
                value={taskForm.progress}
                onChange={(e) => setTaskForm({ ...taskForm, progress: e.target.value })}
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
              />
            </label>
            <label className="block flex-1">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Status</span>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>At Risk</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => tasksTable.setIsEditOpen(false)}
              className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-extrabold text-slate-600 hover:bg-slate-50 bg-white"
            >
              Cancel
            </button>
            <button type="submit" className="h-10 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* 8. Goal Edit Modal */}
      <Modal isOpen={goalsTable.isEditOpen} onClose={() => goalsTable.setIsEditOpen(false)} title="Modify Target Milestone">
        <form onSubmit={submitEditGoal} className="space-y-4">
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Goal Description</span>
            <input
              type="text"
              required
              value={goalForm.description}
              onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
            />
          </label>
          <div className="flex gap-3">
            <label className="block flex-grow">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Target</span>
              <input
                type="text"
                required
                value={goalForm.target}
                onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
              />
            </label>
            <label className="block flex-grow">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Current Progress</span>
              <input
                type="text"
                required
                value={goalForm.progress}
                onChange={(e) => setGoalForm({ ...goalForm, progress: e.target.value })}
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
              />
            </label>
          </div>
          <div className="flex gap-3">
            <label className="block flex-grow">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">% Achieved</span>
              <input
                type="text"
                required
                value={goalForm.pct}
                onChange={(e) => setGoalForm({ ...goalForm, pct: e.target.value })}
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
              />
            </label>
            <label className="block flex-grow">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Target Deadline</span>
              <input
                type="text"
                required
                value={goalForm.deadline}
                onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Status</span>
            <select
              value={goalForm.status}
              onChange={(e) => setGoalForm({ ...goalForm, status: e.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white"
            >
              <option>Not Started</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>At Risk</option>
            </select>
          </label>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => goalsTable.setIsEditOpen(false)}
              className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-extrabold text-slate-600 hover:bg-slate-50 bg-white"
            >
              Cancel
            </button>
            <button type="submit" className="h-10 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// =========================================================================
// TABLE SUBCOMPONENTS
// =========================================================================

function Tab({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-extrabold transition duration-150 ${
        active ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-900"
      }`}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}

function ImmigrationClientTableComponent({
  table,
  openEdit,
}: {
  table: ReturnType<typeof useTable<ClientRecord>>;
  openEdit: (client: ClientRecord) => void;
}) {
  const columns = ["#", "Client Name", "Type of Service", "Tasks", "Payment Amount", "Payment Status", "Actions"];

  return (
    <Card
      title="Client Management"
      subtext="Handles visa applications, case checklists, and invoice status tracking."
      action={
        <TableActions
          searchQuery={table.searchQuery}
          onSearchChange={table.setSearchQuery}
          searchPlaceholder="Search clients..."
          columns={columns}
          visibleColumns={table.visibleColumns}
          onToggleColumn={(col) =>
            table.setVisibleColumns((current) => ({
              ...current,
              [col]: current[col] === false ? true : false,
            }))
          }
        />
      }
    >
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[820px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map(
                (h) =>
                  table.visibleColumns[h] !== false && (
                    <th key={h} className="px-4 py-3 font-extrabold">
                      {h}
                    </th>
                  )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.paginatedData.map((row, index) => (
              <tr key={row.id} className="text-sm hover:bg-slate-50 transition duration-100">
                {table.visibleColumns["#"] !== false && (
                  <td className="px-4 py-3 font-extrabold text-slate-400">
                    {(table.currentPage - 1) * table.pageSize + index + 1}
                  </td>
                )}
                {table.visibleColumns["Client Name"] !== false && (
                  <td className="px-4 py-3 font-extrabold text-slate-950">{row.name}</td>
                )}
                {table.visibleColumns["Type of Service"] !== false && (
                  <td className="px-4 py-3 font-semibold text-slate-600">{row.serviceType}</td>
                )}
                {table.visibleColumns["Tasks"] !== false && (
                  <td className="px-4 py-3 font-semibold text-slate-600">{row.tasksCount}</td>
                )}
                {table.visibleColumns["Payment Amount"] !== false && (
                  <td className="px-4 py-3 font-bold text-slate-800">{row.paymentAmount}</td>
                )}
                {table.visibleColumns["Payment Status"] !== false && (
                  <td className="px-4 py-3">
                    <AmazonPill value={row.paymentStatus} />
                  </td>
                )}
                {table.visibleColumns["Actions"] !== false && (
                  <td className="px-4 py-3">
                    <ActionIcons
                      onView={() => table.selectItemForAction(row, "view")}
                      onEdit={() => openEdit(row)}
                      onDelete={() => table.selectItemForAction(row, "delete")}
                    />
                  </td>
                )}
              </tr>
            ))}
            {table.paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm font-bold text-slate-400 bg-slate-50/20">
                  No onboarded clients. Click "+ Add Client" to begin.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <TableFooter
        text={`Showing ${Math.min((table.currentPage - 1) * table.pageSize + 1, table.filteredData.length)} to ${Math.min(
          table.currentPage * table.pageSize,
          table.filteredData.length
        )} of ${table.filteredData.length} entries`}
        pages={Array.from({ length: table.totalPages }, (_, i) => String(i + 1))}
      />
    </Card>
  );
}

function ImmigrationTasksTableComponent({
  table,
  openEdit,
}: {
  table: ReturnType<typeof useTable<TaskRecord>>;
  openEdit: (task: TaskRecord) => void;
}) {
  const columns = ["#", "Task Title", "Assigned To", "Priority", "Due Date", "Progress", "Status", "Actions"];

  return (
    <Card
      title="Tasks for Growth"
      subtext="Track visa applications, deadlines, and internal tasks."
      action={
        <TableActions
          searchQuery={table.searchQuery}
          onSearchChange={table.setSearchQuery}
          searchPlaceholder="Search tasks..."
          columns={columns}
          visibleColumns={table.visibleColumns}
          onToggleColumn={(col) =>
            table.setVisibleColumns((current) => ({
              ...current,
              [col]: current[col] === false ? true : false,
            }))
          }
        />
      }
    >
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map(
                (h) =>
                  table.visibleColumns[h] !== false && (
                    <th key={h} className="px-4 py-3 font-extrabold">
                      {h}
                    </th>
                  )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.paginatedData.map((row, index) => (
              <tr key={row.id} className="text-sm hover:bg-slate-50 transition duration-100">
                {table.visibleColumns["#"] !== false && (
                  <td className="px-4 py-3 font-extrabold text-slate-400">
                    {(table.currentPage - 1) * table.pageSize + index + 1}
                  </td>
                )}
                {table.visibleColumns["Task Title"] !== false && (
                  <td className="px-4 py-3 font-extrabold text-slate-900">{row.title}</td>
                )}
                {table.visibleColumns["Assigned To"] !== false && (
                  <td className="px-4 py-3 font-semibold text-slate-600">{row.assignee}</td>
                )}
                {table.visibleColumns["Priority"] !== false && (
                  <td className="px-4 py-3">
                    <StatusBadge status={row.priority} />
                  </td>
                )}
                {table.visibleColumns["Due Date"] !== false && (
                  <td className="px-4 py-3 font-semibold text-slate-600">{row.dueDate}</td>
                )}
                {table.visibleColumns["Progress"] !== false && (
                  <td className="px-4 py-3">
                    <ProgressBar value={row.progress} />
                  </td>
                )}
                {table.visibleColumns["Status"] !== false && (
                  <td className="px-4 py-3">
                    <ImmigrationStatusBadge status={row.status} />
                  </td>
                )}
                {table.visibleColumns["Actions"] !== false && (
                  <td className="px-4 py-3">
                    <ActionIcons
                      onEdit={() => openEdit(row)}
                      onDelete={() => table.selectItemForAction(row, "delete")}
                    />
                  </td>
                )}
              </tr>
            ))}
            {table.paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm font-bold text-slate-400 bg-slate-50/20">
                  No tasks configured. Click "+ Create Task" to begin.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <TableFooter
        text={`Showing ${Math.min((table.currentPage - 1) * table.pageSize + 1, table.filteredData.length)} to ${Math.min(
          table.currentPage * table.pageSize,
          table.filteredData.length
        )} of ${table.filteredData.length} entries`}
        pages={Array.from({ length: table.totalPages }, (_, i) => String(i + 1))}
      />
    </Card>
  );
}

function ImmigrationGoalsTableComponent({
  table,
  openEdit,
}: {
  table: ReturnType<typeof useTable<GoalRecord>>;
  openEdit: (goal: GoalRecord) => void;
}) {
  const columns = ["#", "Goal Description", "Target", "Current Progress", "% Achieved", "Deadline", "Status", "Actions"];

  return (
    <Card
      title="Goals Status"
      subtext="Monitor immigration department goals, targets, and achievement metrics."
      action={
        <TableActions
          searchQuery={table.searchQuery}
          onSearchChange={table.setSearchQuery}
          searchPlaceholder="Search goals..."
          columns={columns}
          visibleColumns={table.visibleColumns}
          onToggleColumn={(col) =>
            table.setVisibleColumns((current) => ({
              ...current,
              [col]: current[col] === false ? true : false,
            }))
          }
        />
      }
    >
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map(
                (h) =>
                  table.visibleColumns[h] !== false && (
                    <th key={h} className="px-4 py-3 font-extrabold">
                      {h}
                    </th>
                  )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.paginatedData.map((row, index) => (
              <tr key={row.id} className="text-sm hover:bg-slate-50 transition duration-100">
                {table.visibleColumns["#"] !== false && (
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {(table.currentPage - 1) * table.pageSize + index + 1}
                  </td>
                )}
                {table.visibleColumns["Goal Description"] !== false && (
                  <td className="px-4 py-3 font-extrabold text-slate-900">{row.description}</td>
                )}
                {table.visibleColumns["Target"] !== false && (
                  <td className="px-4 py-3 font-semibold text-slate-700">{row.target}</td>
                )}
                {table.visibleColumns["Current Progress"] !== false && (
                  <td className="px-4 py-3 font-semibold text-slate-700">{row.progress}</td>
                )}
                {table.visibleColumns["% Achieved"] !== false && (
                  <td className="px-4 py-3">
                    <ProgressBar value={row.pct} />
                  </td>
                )}
                {table.visibleColumns["Deadline"] !== false && (
                  <td className="px-4 py-3 font-semibold text-slate-700">{row.deadline}</td>
                )}
                {table.visibleColumns["Status"] !== false && (
                  <td className="px-4 py-3">
                    <ImmigrationStatusBadge status={row.status} />
                  </td>
                )}
                {table.visibleColumns["Actions"] !== false && (
                  <td className="px-4 py-3">
                    <ActionIcons
                      onEdit={() => openEdit(row as any)}
                      onDelete={() => table.selectItemForAction(row, "delete")}
                    />
                  </td>
                )}
              </tr>
            ))}
            {table.paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm font-bold text-slate-400 bg-slate-50/20">
                  No targets set. Click "+ Add Goal" to begin.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <TableFooter
        text={`Showing ${Math.min((table.currentPage - 1) * table.pageSize + 1, table.filteredData.length)} to ${Math.min(
          table.currentPage * table.pageSize,
          table.filteredData.length
        )} of ${table.filteredData.length} entries`}
        pages={Array.from({ length: table.totalPages }, (_, i) => String(i + 1))}
      />
    </Card>
  );
}

function ImmigrationRightColumn({
  caseStatusData,
  totalCases,
}: {
  caseStatusData: { name: string; value: number; color: string }[];
  totalCases: number;
}) {
  return (
    <aside className="space-y-6">
      <Card title="Case Status Overview">
        <div className="p-5">
          {totalCases > 0 ? (
            <>
              <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={caseStatusData} innerRadius={72} outerRadius={104} paddingAngle={3} dataKey="value">
                      {caseStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-2xl font-extrabold text-slate-950">{totalCases}</p>
                  <p className="text-xs font-bold text-slate-500">Active Cases</p>
                </div>
              </div>
              <ChartLegend
                items={caseStatusData.map((item) => ({
                  name: item.name,
                  value: item.value,
                  pct: totalCases > 0 ? `${Math.round((item.value / totalCases) * 100)}%` : "0%",
                  color: item.color,
                }))}
              />
            </>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm font-bold text-slate-400">
              No cases to chart
            </div>
          )}
        </div>
      </Card>
      <Card title="Top Visa Categories by Revenue">
        <div className="space-y-4 p-5 text-sm font-bold text-slate-500 text-center py-8">
          Add paid client records to populate visa metrics dynamically.
        </div>
      </Card>
    </aside>
  );
}
