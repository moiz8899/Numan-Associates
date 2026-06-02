import { useState, useMemo } from "react";
import {
  Users,
  Calendar,
  Settings,
  FileBarChart,
  Plus,
  Download,
  Printer,
  ChevronDown,
  BriefcaseBusiness,
  FolderClosed,
  type LucideIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card } from "../../components/shared/Card";
import { KpiCard } from "../../components/shared/KpiCard";
import { StatusBadge, PriorityBadge, AmazonPill, ProgressBar } from "../../components/shared/badges";
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

// Data Types
interface ClientRecord {
  id: string;
  name: string;
  serviceType: string;
  activeCases: string;
  primaryAdvocate: string;
  paymentAmount: string;
  paymentStatus: string;
  lastActivity: string;
}

interface TaskRecord {
  id: string;
  title: string;
  relatedCase: string;
  assignee: string;
  dueDate: string;
  status: string;
}

interface GoalRecord {
  id: string;
  goal: string;
  practiceArea: string;
  progress: string;
  targetDate: string;
  status: string;
}

interface HearingRecord {
  id: string;
  date: string;
  time: string;
  caseName: string;
  court: string;
  priority: string;
}

interface ReportRecord {
  id: string;
  reportName: string;
  period: string;
  owner: string;
  generatedOn: string;
  status: string;
}

export function LawDashboard() {
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

  // Table Hooks
  const clientsTable = useTable<ClientRecord>({
    initialData: [],
    searchFields: ["name", "serviceType", "primaryAdvocate", "paymentStatus"],
    defaultPageSize: 5,
    supabaseTable: "clients",
    supabaseFilter: { column: "department", value: "law" },
  });

  const tasksTable = useTable<TaskRecord>({
    initialData: [],
    searchFields: ["title", "relatedCase", "assignee", "status"],
    defaultPageSize: 5,
    supabaseTable: "tasks",
    supabaseFilter: { column: "department", value: "law" },
  });

  const goalsTable = useTable<GoalRecord>({
    initialData: [],
    searchFields: ["goal", "practiceArea", "status"],
    defaultPageSize: 5,
    supabaseTable: "goals",
    supabaseFilter: { column: "department", value: "law" },
  });

  const hearingsTable = useTable<HearingRecord>({
    initialData: [],
    searchFields: ["caseName", "court", "priority"],
    defaultPageSize: 5,
    supabaseTable: "law_hearings",
  });

  const reportsTable = useTable<ReportRecord>({
    initialData: [],
    searchFields: ["reportName", "period", "owner", "status"],
    defaultPageSize: 5,
    supabaseTable: "reports",
    supabaseFilter: { column: "category", value: "Law" },
  });

  // Export dropdown
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Form States
  const [clientForm, setClientForm] = useState<Omit<ClientRecord, "id">>({
    name: "",
    serviceType: "Corporate Consultation",
    activeCases: "1",
    primaryAdvocate: "Adv. Numan",
    paymentAmount: "PKR 0",
    paymentStatus: "Pending",
    lastActivity: "Today",
  });

  const [taskForm, setTaskForm] = useState<Omit<TaskRecord, "id">>({
    title: "",
    relatedCase: "",
    assignee: "",
    dueDate: "",
    status: "Not Started",
  });

  const [goalForm, setGoalForm] = useState<Omit<GoalRecord, "id">>({
    goal: "",
    practiceArea: "Corporate Law",
    progress: "0%",
    targetDate: "",
    status: "Not Started",
  });

  const [hearingForm, setHearingForm] = useState<Omit<HearingRecord, "id">>({
    date: "",
    time: "",
    caseName: "",
    court: "",
    priority: "Medium Priority",
  });

  const [reportForm, setReportForm] = useState<Omit<ReportRecord, "id">>({
    reportName: "",
    period: "May 2024",
    owner: "Admin User",
    generatedOn: "Today",
    status: "Draft",
  });

  // Dynamic KPIs
  const totalClients = clientsTable.data.length;
  const activeCases = clientsTable.data.reduce((sum, c) => sum + (parseInt(c.activeCases) || 0), 0);
  const totalRevenue = clientsTable.data
    .filter((c) => c.paymentStatus === "Paid")
    .reduce((sum, c) => sum + (parseInt(c.paymentAmount.replace(/[^\d]/g, "")) || 0), 0);
  const pendingPayments = clientsTable.data.filter((c) => c.paymentStatus === "Pending").length;
  const closedCases = clientsTable.data.filter((c) => c.activeCases === "0").length;

  const lawKpis = [
    { label: "Total Clients", value: String(totalClients), change: "\u2014", trend: "positive", icon: Users, color: "#7c3aed", bg: "bg-violet-50" },
    { label: "Active Cases", value: String(activeCases), change: "\u2014", trend: "positive", icon: BriefcaseBusiness, color: "#1a73e8", bg: "bg-blue-50" },
    { label: "Total Revenue", value: `PKR ${totalRevenue.toLocaleString()}`, change: "\u2014", trend: "positive", icon: FolderClosed, color: "#16a34a", bg: "bg-green-50" },
    { label: "Pending Payments", value: String(pendingPayments), change: "\u2014", trend: "negative", icon: Users, color: "#f97316", bg: "bg-orange-50" },
    { label: "Closed Cases", value: String(closedCases), change: "\u2014", trend: "positive", icon: FolderClosed, color: "#0d9488", bg: "bg-teal-50" },
  ];

  // Dynamic Charts
  const lawTaskData = useMemo(() => {
    const completed = tasksTable.data.filter((t) => t.status === "Completed").length;
    const inProgress = tasksTable.data.filter((t) => t.status === "In Progress").length;
    const notStarted = tasksTable.data.filter((t) => t.status === "Not Started").length;
    const atRisk = tasksTable.data.filter((t) => t.status === "At Risk").length;
    const total = tasksTable.data.length;
    if (total === 0) return [];
    return [
      { name: "Completed", value: completed, color: "#10B981" },
      { name: "In Progress", value: inProgress, color: "#3B82F6" },
      { name: "Not Started", value: notStarted, color: "#94A3B8" },
      { name: "At Risk", value: atRisk, color: "#EF4444" },
    ];
  }, [tasksTable.data]);

  const caseStatusData = useMemo(() => {
    const active = clientsTable.data.filter((c) => parseInt(c.activeCases) > 0).length;
    const closed = clientsTable.data.filter((c) => parseInt(c.activeCases) === 0).length;
    const total = clientsTable.data.length;
    if (total === 0) return [];
    return [
      { name: "Active", value: active, color: "#3B82F6" },
      { name: "Closed", value: closed, color: "#10B981" },
    ];
  }, [clientsTable.data]);

  const matterTypes = useMemo(() => {
    const types: Record<string, number> = {};
    clientsTable.data.forEach((c) => {
      types[c.serviceType] = (types[c.serviceType] || 0) + 1;
    });
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
    return Object.entries(types).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  }, [clientsTable.data]);

  const practiceAreas = useMemo(() => {
    const areas: Record<string, number> = {};
    clientsTable.data.forEach((c) => {
      const revenue = parseInt(c.paymentAmount.replace(/[^\d]/g, "")) || 0;
      areas[c.serviceType] = (areas[c.serviceType] || 0) + revenue;
    });
    const total = Object.values(areas).reduce((s, v) => s + v, 0);
    return Object.entries(areas).map(([label, rev]) => {
      const pct = total > 0 ? `${Math.round((rev / total) * 100)}%` : "0%";
      const width = total > 0 ? `${(rev / total) * 100}%` : "0%";
      return [label, `PKR ${rev.toLocaleString()}`, pct, width];
    });
  }, [clientsTable.data]);

  // Export
  const handleExport = (format: "pdf" | "excel") => {
    setShowExportMenu(false);
    if (activeTab === "Clients") {
      const headers = ["#", "Client Name", "Service Type", "Active Cases", "Advocate", "Payment", "Status", "Last Activity"];
      const rows = clientsTable.data.map((c, i) => [String(i + 1), c.name, c.serviceType, c.activeCases, c.primaryAdvocate, c.paymentAmount, c.paymentStatus, c.lastActivity]);
      format === "pdf"
        ? exportToPDF({ title: "Law Clients Report", headers, rows, fileName: "law_clients" })
        : exportToExcel({ title: "Law Clients", headers, rows, fileName: "law_clients" });
    } else if (activeTab === "Tasks") {
      const headers = ["#", "Task Title", "Related Case", "Assignee", "Due Date", "Status"];
      const rows = tasksTable.data.map((t, i) => [String(i + 1), t.title, t.relatedCase, t.assignee, t.dueDate, t.status]);
      format === "pdf"
        ? exportToPDF({ title: "Law Tasks Report", headers, rows, fileName: "law_tasks" })
        : exportToExcel({ title: "Law Tasks", headers, rows, fileName: "law_tasks" });
    } else if (activeTab === "Goals") {
      const headers = ["#", "Goal", "Practice Area", "Progress", "Target Date", "Status"];
      const rows = goalsTable.data.map((g, i) => [String(i + 1), g.goal, g.practiceArea, g.progress, g.targetDate, g.status]);
      format === "pdf"
        ? exportToPDF({ title: "Law Goals Report", headers, rows, fileName: "law_goals" })
        : exportToExcel({ title: "Law Goals", headers, rows, fileName: "law_goals" });
    } else if (activeTab === "Case Calendar") {
      const headers = ["#", "Date", "Time", "Case Name", "Court", "Priority"];
      const rows = hearingsTable.data.map((h, i) => [String(i + 1), h.date, h.time, h.caseName, h.court, h.priority]);
      format === "pdf"
        ? exportToPDF({ title: "Law Hearings Report", headers, rows, fileName: "law_hearings" })
        : exportToExcel({ title: "Law Hearings", headers, rows, fileName: "law_hearings" });
    } else {
      const headers = ["#", "Report Name", "Period", "Owner", "Generated On", "Status"];
      const rows = reportsTable.data.map((r, i) => [String(i + 1), r.reportName, r.period, r.owner, r.generatedOn, r.status]);
      format === "pdf"
        ? exportToPDF({ title: "Law Reports Report", headers, rows, fileName: "law_reports" })
        : exportToExcel({ title: "Law Reports", headers, rows, fileName: "law_reports" });
    }
    showToast(`${activeTab} exported to ${format.toUpperCase()}`);
  };

  // Client CRUD
  const openAddClient = () => {
    setClientForm({ name: "", serviceType: "Corporate Consultation", activeCases: "1", primaryAdvocate: "Adv. Numan", paymentAmount: "PKR 0", paymentStatus: "Pending", lastActivity: "Today" });
    clientsTable.setIsAddOpen(true);
  };
  const submitAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim()) return;
    clientsTable.addItem({ id: String(Date.now()), ...clientForm });
    clientsTable.setIsAddOpen(false);
    showToast(`Client ${clientForm.name} added!`);
  };
  const openEditClient = (c: ClientRecord) => {
    setClientForm({ name: c.name, serviceType: c.serviceType, activeCases: c.activeCases, primaryAdvocate: c.primaryAdvocate, paymentAmount: c.paymentAmount, paymentStatus: c.paymentStatus, lastActivity: c.lastActivity });
    clientsTable.selectItemForAction(c, "edit");
  };
  const submitEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientsTable.selectedItem) return;
    clientsTable.updateItem({ id: clientsTable.selectedItem.id, ...clientForm });
    clientsTable.setIsEditOpen(false);
    showToast("Client details updated!");
  };
  const confirmDeleteClient = () => {
    if (!clientsTable.selectedItem) return;
    clientsTable.deleteItem(clientsTable.selectedItem.id);
    showToast("Client removed", "error");
  };

  // Task CRUD
  const openAddTask = () => {
    setTaskForm({ title: "", relatedCase: "", assignee: "", dueDate: "", status: "Not Started" });
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
    setTaskForm({ title: t.title, relatedCase: t.relatedCase, assignee: t.assignee, dueDate: t.dueDate, status: t.status });
    tasksTable.selectItemForAction(t, "edit");
  };
  const submitEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tasksTable.selectedItem) return;
    tasksTable.updateItem({ id: tasksTable.selectedItem.id, ...taskForm });
    tasksTable.setIsEditOpen(false);
    showToast("Task updated!");
  };

  // Goal CRUD
  const openAddGoal = () => {
    setGoalForm({ goal: "", practiceArea: "Corporate Law", progress: "0%", targetDate: "", status: "Not Started" });
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
    setGoalForm({ goal: g.goal, practiceArea: g.practiceArea, progress: g.progress, targetDate: g.targetDate, status: g.status });
    goalsTable.selectItemForAction(g, "edit");
  };
  const submitEditGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalsTable.selectedItem) return;
    goalsTable.updateItem({ id: goalsTable.selectedItem.id, ...goalForm });
    goalsTable.setIsEditOpen(false);
    showToast("Goal updated!");
  };

  // Hearing CRUD
  const openAddHearing = () => {
    setHearingForm({ date: "", time: "", caseName: "", court: "", priority: "Medium Priority" });
    hearingsTable.setIsAddOpen(true);
  };
  const submitAddHearing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hearingForm.caseName.trim()) return;
    hearingsTable.addItem({ id: String(Date.now()), ...hearingForm });
    hearingsTable.setIsAddOpen(false);
    showToast("Hearing scheduled!");
  };
  const openEditHearing = (h: HearingRecord) => {
    setHearingForm({ date: h.date, time: h.time, caseName: h.caseName, court: h.court, priority: h.priority });
    hearingsTable.selectItemForAction(h, "edit");
  };
  const submitEditHearing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hearingsTable.selectedItem) return;
    hearingsTable.updateItem({ id: hearingsTable.selectedItem.id, ...hearingForm });
    hearingsTable.setIsEditOpen(false);
    showToast("Hearing details updated!");
  };

  // Report CRUD
  const openAddReport = () => {
    setReportForm({ reportName: "", period: "May 2024", owner: "Admin User", generatedOn: "Today", status: "Draft" });
    reportsTable.setIsAddOpen(true);
  };
  const submitAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.reportName.trim()) return;
    reportsTable.addItem({ id: String(Date.now()), ...reportForm });
    reportsTable.setIsAddOpen(false);
    showToast("Report generated!");
  };
  const openEditReport = (r: ReportRecord) => {
    setReportForm({ reportName: r.reportName, period: r.period, owner: r.owner, generatedOn: r.generatedOn, status: r.status });
    reportsTable.selectItemForAction(r, "edit");
  };
  const submitEditReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportsTable.selectedItem) return;
    reportsTable.updateItem({ id: reportsTable.selectedItem.id, ...reportForm });
    reportsTable.setIsEditOpen(false);
    showToast("Report updated!");
  };

  const serviceOptions = [
    "Corporate Consultation",
    "Civil Litigation",
    "Criminal Defense",
    "Family Law Dispute",
    "Real Estate Settlement",
    "Intellectual Property Protection",
  ];

  return (
    <>
      <Toast message={toastMessage} type={toastType} isOpen={toastOpen} onClose={() => setToastOpen(false)} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {lawKpis.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-6">
          <Tab icon={Users} label="Clients" active={activeTab === "Clients"} onClick={() => setActiveTab("Clients")} />
          <Tab icon={Calendar} label="Tasks" active={activeTab === "Tasks"} onClick={() => setActiveTab("Tasks")} />
          <Tab icon={Settings} label="Goals" active={activeTab === "Goals"} onClick={() => setActiveTab("Goals")} />
          <Tab
            icon={Calendar}
            label="Case Calendar"
            active={activeTab === "Case Calendar"}
            onClick={() => setActiveTab("Case Calendar")}
          />
          <Tab
            icon={FileBarChart}
            label="Reports"
            active={activeTab === "Reports"}
            onClick={() => setActiveTab("Reports")}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition shadow-sm">
              <Download size={16} />
              Export
              <ChevronDown size={14} />
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
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={
              activeTab === "Clients"
                ? openAddClient
                : activeTab === "Tasks"
                ? openAddTask
                : activeTab === "Goals"
                ? openAddGoal
                : activeTab === "Case Calendar"
                ? openAddHearing
                : openAddReport
            }
            className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            {activeTab === "Clients"
              ? "Add Client"
              : activeTab === "Tasks"
              ? "Create Task"
              : activeTab === "Goals"
              ? "Add Goal"
              : activeTab === "Case Calendar"
              ? "Add Hearing"
              : "Generate Report"}
          </button>
        </div>
      </section>

      {activeTab === "Clients" ? (
        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.75fr)]">
          <div className="space-y-6">
            <CrudTable type="client" table={clientsTable} openEdit={openEditClient} />

            <section className="grid gap-6 xl:grid-cols-2">
              <Card title="Tasks Overview">
                <div className="grid gap-4 p-5 md:grid-cols-[190px_minmax(0,1fr)] md:items-center">
                  {lawTaskData.length > 0 ? (
                    <>
                      <div className="relative h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={lawTaskData} innerRadius={58} outerRadius={86} paddingAngle={3} dataKey="value">
                              {lawTaskData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                          <p className="text-2xl font-extrabold text-slate-950">{tasksTable.data.length}</p>
                          <p className="text-xs font-bold text-slate-500">Total Tasks</p>
                        </div>
                      </div>
                      <ChartLegend items={lawTaskData.map((item) => ({ ...item, pct: tasksTable.data.length > 0 ? `${Math.round((item.value / tasksTable.data.length) * 100)}%` : "0%" }))} />
                    </>
                  ) : (
                    <div className="col-span-2 flex h-56 items-center justify-center text-sm font-bold text-slate-400">
                      No tasks available
                    </div>
                  )}
                </div>
              </Card>

              <Card
                title="Recent High-Priority Tasks"
                action={<button onClick={() => setActiveTab("Tasks")} className="text-sm font-extrabold text-brand">View All Tasks →</button>}
              >
                <div className="scrollbar-thin overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        {["#", "Task Title", "Assignee", "Status"].map((h) => (
                          <th key={h} className="px-4 py-3 font-extrabold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tasksTable.data.slice(0, 3).map((row, idx) => (
                        <tr key={row.id} className="text-sm hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-700">{idx + 1}</td>
                          <td className="px-4 py-3 font-extrabold text-slate-900">{row.title}</td>
                          <td className="px-4 py-3 font-semibold text-slate-700">{row.assignee}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={row.status} />
                          </td>
                        </tr>
                      ))}
                      {tasksTable.data.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-sm font-bold text-slate-400">
                            No tasks found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <Card title="Revenue Overview">
                <div className="h-80 p-5">
                  <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">
                    Add paid client records to view dynamic revenue statistics.
                  </div>
                </div>
              </Card>

              <Card title="Matter Type Distribution">
                <div className="grid gap-4 p-5 md:grid-cols-[190px_minmax(0,1fr)] md:items-center">
                  {matterTypes.length > 0 ? (
                    <>
                      <div className="relative h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={matterTypes} innerRadius={58} outerRadius={86} paddingAngle={3} dataKey="value">
                              {matterTypes.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                          <p className="text-2xl font-extrabold text-slate-950">{totalClients}</p>
                          <p className="text-xs font-bold text-slate-500">Total Matters</p>
                        </div>
                      </div>
                      <ChartLegend items={matterTypes.map((item) => ({ ...item, pct: totalClients > 0 ? `${Math.round((item.value / totalClients) * 100)}%` : "0%" }))} />
                    </>
                  ) : (
                    <div className="col-span-2 flex h-56 items-center justify-center text-sm font-bold text-slate-400">
                      No matters available
                    </div>
                  )}
                </div>
              </Card>
            </section>
          </div>

          <aside className="space-y-6">
            <Card title="Case Status Overview">
              <div className="p-5">
                {caseStatusData.length > 0 ? (
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
                        <p className="text-2xl font-extrabold text-slate-950">{totalClients}</p>
                        <p className="text-xs font-bold text-slate-500">Active Cases</p>
                      </div>
                    </div>
                    <ChartLegend items={caseStatusData.map((item) => ({ ...item, pct: totalClients > 0 ? `${Math.round((item.value / totalClients) * 100)}%` : "0%" }))} />
                  </>
                ) : (
                  <div className="flex h-64 items-center justify-center text-sm font-bold text-slate-400">
                    No cases available
                  </div>
                )}
              </div>
            </Card>

            <Card
              title="Upcoming Hearings"
              action={<button onClick={() => setActiveTab("Case Calendar")} className="text-sm font-extrabold text-brand">View All →</button>}
            >
              <div className="divide-y divide-slate-100">
                {hearingsTable.data.slice(0, 3).map((row) => (
                  <div key={row.id} className="grid grid-cols-[48px_minmax(0,1fr)_auto] gap-3 px-5 py-4">
                    <div className="text-center">
                      <p className="text-2xl font-extrabold leading-none text-slate-950">
                        {row.date.split(" ")[0] || "15"}
                      </p>
                      <p className="mt-1 text-xs font-extrabold text-slate-400">
                        {row.date.split(" ")[1]?.toUpperCase() || "MAY"}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-500">{row.time}</p>
                      <p className="mt-1 truncate text-sm font-extrabold text-slate-900">{row.caseName}</p>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-500">{row.court}</p>
                    </div>
                    <PriorityBadge label={row.priority} />
                  </div>
                ))}
                {hearingsTable.data.length === 0 && (
                  <div className="px-5 py-8 text-center text-sm font-bold text-slate-400">
                    No upcoming hearings
                  </div>
                )}
              </div>
            </Card>

            <Card title="Top Practice Areas by Revenue">
              <div className="space-y-4 p-5">
                {practiceAreas.length > 0 ? (
                  practiceAreas.map(([label, amount, pct, width]) => (
                    <div key={label}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                        <span className="font-extrabold text-slate-700">{label}</span>
                        <span className="shrink-0 font-extrabold text-slate-900">
                          {amount} ({pct})
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100">
                        <div className="h-2.5 rounded-full bg-brand" style={{ width }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm font-bold text-slate-400 py-4">
                    No practice area statistics
                  </div>
                )}
              </div>
            </Card>
          </aside>
        </section>
      ) : activeTab === "Tasks" ? (
        <CrudTable type="task" table={tasksTable} openEdit={openEditTask} />
      ) : activeTab === "Goals" ? (
        <CrudTable type="goal" table={goalsTable} openEdit={openEditGoal} />
      ) : activeTab === "Case Calendar" ? (
        <CrudTable type="hearing" table={hearingsTable} openEdit={openEditHearing} />
      ) : (
        <CrudTable type="report" table={reportsTable} openEdit={openEditReport} />
      )}

      {/* Client Modals */}
      <Modal isOpen={clientsTable.isAddOpen} onClose={() => clientsTable.setIsAddOpen(false)} title="Add Law Client">
        <form onSubmit={submitAddClient} className="space-y-4">
          <FormField label="Client Name" value={clientForm.name} onChange={(v) => setClientForm({ ...clientForm, name: v })} placeholder="e.g. Salim & Sons" required />
          <FormSelect label="Service Type" value={clientForm.serviceType} onChange={(v) => setClientForm({ ...clientForm, serviceType: v })} options={serviceOptions} />
          <FormField label="Active Cases" value={clientForm.activeCases} onChange={(v) => setClientForm({ ...clientForm, activeCases: v })} placeholder="e.g. 1" required />
          <FormField label="Primary Advocate" value={clientForm.primaryAdvocate} onChange={(v) => setClientForm({ ...clientForm, primaryAdvocate: v })} placeholder="e.g. Adv. Numan" required />
          <FormField label="Payment Amount" value={clientForm.paymentAmount} onChange={(v) => setClientForm({ ...clientForm, paymentAmount: v })} placeholder="e.g. PKR 150,000" required />
          <FormSelect label="Payment Status" value={clientForm.paymentStatus} onChange={(v) => setClientForm({ ...clientForm, paymentStatus: v })} options={["Pending", "Partial", "Paid"]} />
          <FormActions onCancel={() => clientsTable.setIsAddOpen(false)} submitLabel="Save Client" />
        </form>
      </Modal>
      <Modal isOpen={clientsTable.isEditOpen} onClose={() => clientsTable.setIsEditOpen(false)} title="Edit Law Client">
        <form onSubmit={submitEditClient} className="space-y-4">
          <FormField label="Client Name" value={clientForm.name} onChange={(v) => setClientForm({ ...clientForm, name: v })} required />
          <FormSelect label="Service Type" value={clientForm.serviceType} onChange={(v) => setClientForm({ ...clientForm, serviceType: v })} options={serviceOptions} />
          <FormField label="Active Cases" value={clientForm.activeCases} onChange={(v) => setClientForm({ ...clientForm, activeCases: v })} required />
          <FormField label="Primary Advocate" value={clientForm.primaryAdvocate} onChange={(v) => setClientForm({ ...clientForm, primaryAdvocate: v })} required />
          <FormField label="Payment Amount" value={clientForm.paymentAmount} onChange={(v) => setClientForm({ ...clientForm, paymentAmount: v })} required />
          <FormSelect label="Payment Status" value={clientForm.paymentStatus} onChange={(v) => setClientForm({ ...clientForm, paymentStatus: v })} options={["Pending", "Partial", "Paid"]} />
          <FormActions onCancel={() => clientsTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ViewDrawer isOpen={clientsTable.isViewOpen} onClose={() => clientsTable.setIsViewOpen(false)} title={clientsTable.selectedItem?.name || "Client"}>
        {clientsTable.selectedItem ? (
          <div className="space-y-4">
            <DetailCard label="Client Details" items={[["ID", `#${clientsTable.selectedItem.id}`], ["Name", clientsTable.selectedItem.name]]} />
            <DetailCard label="Legal Cases" items={[["Matter", clientsTable.selectedItem.serviceType], ["Active Cases", clientsTable.selectedItem.activeCases], ["Advocate", clientsTable.selectedItem.primaryAdvocate]]} />
            <DetailCard label="Financial" items={[["Amount", clientsTable.selectedItem.paymentAmount], ["Status", clientsTable.selectedItem.paymentStatus]]} />
          </div>
        ) : null}
      </ViewDrawer>
      <ConfirmDialog isOpen={clientsTable.isConfirmOpen} onClose={() => clientsTable.setIsConfirmOpen(false)} onConfirm={confirmDeleteClient} title="Delete Client" message={`Remove ${clientsTable.selectedItem?.name} from law records?`} />

      {/* Task Modals */}
      <Modal isOpen={tasksTable.isAddOpen} onClose={() => tasksTable.setIsAddOpen(false)} title="Create Law Task">
        <form onSubmit={submitAddTask} className="space-y-4">
          <FormField label="Task Title" value={taskForm.title} onChange={(v) => setTaskForm({ ...taskForm, title: v })} placeholder="e.g. Prepare written response" required />
          <FormField label="Related Case" value={taskForm.relatedCase} onChange={(v) => setTaskForm({ ...taskForm, relatedCase: v })} placeholder="e.g. Salim vs Fed" required />
          <FormField label="Assigned To" value={taskForm.assignee} onChange={(v) => setTaskForm({ ...taskForm, assignee: v })} placeholder="e.g. Junior Counsel" required />
          <FormField label="Due Date" value={taskForm.dueDate} onChange={(v) => setTaskForm({ ...taskForm, dueDate: v })} placeholder="e.g. 15 Jun 2024" required />
          <FormSelect label="Status" value={taskForm.status} onChange={(v) => setTaskForm({ ...taskForm, status: v })} options={["Not Started", "In Progress", "Completed", "At Risk"]} />
          <FormActions onCancel={() => tasksTable.setIsAddOpen(false)} submitLabel="Create Task" />
        </form>
      </Modal>
      <Modal isOpen={tasksTable.isEditOpen} onClose={() => tasksTable.setIsEditOpen(false)} title="Edit Law Task">
        <form onSubmit={submitEditTask} className="space-y-4">
          <FormField label="Task Title" value={taskForm.title} onChange={(v) => setTaskForm({ ...taskForm, title: v })} required />
          <FormField label="Related Case" value={taskForm.relatedCase} onChange={(v) => setTaskForm({ ...taskForm, relatedCase: v })} required />
          <FormField label="Assigned To" value={taskForm.assignee} onChange={(v) => setTaskForm({ ...taskForm, assignee: v })} required />
          <FormField label="Due Date" value={taskForm.dueDate} onChange={(v) => setTaskForm({ ...taskForm, dueDate: v })} required />
          <FormSelect label="Status" value={taskForm.status} onChange={(v) => setTaskForm({ ...taskForm, status: v })} options={["Not Started", "In Progress", "Completed", "At Risk"]} />
          <FormActions onCancel={() => tasksTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={tasksTable.isConfirmOpen} onClose={() => tasksTable.setIsConfirmOpen(false)} onConfirm={() => { if (tasksTable.selectedItem) tasksTable.deleteItem(tasksTable.selectedItem.id); showToast("Task removed", "error"); }} title="Delete Task" message={`Remove task "${tasksTable.selectedItem?.title}"?`} />

      {/* Goal Modals */}
      <Modal isOpen={goalsTable.isAddOpen} onClose={() => goalsTable.setIsAddOpen(false)} title="Register Law Goal">
        <form onSubmit={submitAddGoal} className="space-y-4">
          <FormField label="Goal Description" value={goalForm.goal} onChange={(v) => setGoalForm({ ...goalForm, goal: v })} placeholder="e.g. Increase corporate case intake" required />
          <FormSelect label="Practice Area" value={goalForm.practiceArea} onChange={(v) => setGoalForm({ ...goalForm, practiceArea: v })} options={["Corporate Law", "Litigation", "Criminal Law", "Tax Consultation"]} />
          <FormField label="Target Date" value={goalForm.targetDate} onChange={(v) => setGoalForm({ ...goalForm, targetDate: v })} placeholder="e.g. 31 Dec 2024" required />
          <FormActions onCancel={() => goalsTable.setIsAddOpen(false)} submitLabel="Save Goal" />
        </form>
      </Modal>
      <Modal isOpen={goalsTable.isEditOpen} onClose={() => goalsTable.setIsEditOpen(false)} title="Edit Law Goal">
        <form onSubmit={submitEditGoal} className="space-y-4">
          <FormField label="Goal Description" value={goalForm.goal} onChange={(v) => setGoalForm({ ...goalForm, goal: v })} required />
          <FormSelect label="Practice Area" value={goalForm.practiceArea} onChange={(v) => setGoalForm({ ...goalForm, practiceArea: v })} options={["Corporate Law", "Litigation", "Criminal Law", "Tax Consultation"]} />
          <div className="flex gap-3">
            <FormField label="Progress" value={goalForm.progress} onChange={(v) => setGoalForm({ ...goalForm, progress: v })} required />
            <FormField label="Target Date" value={goalForm.targetDate} onChange={(v) => setGoalForm({ ...goalForm, targetDate: v })} required />
          </div>
          <FormSelect label="Status" value={goalForm.status} onChange={(v) => setGoalForm({ ...goalForm, status: v })} options={["Not Started", "In Progress", "Completed", "At Risk"]} />
          <FormActions onCancel={() => goalsTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={goalsTable.isConfirmOpen} onClose={() => goalsTable.setIsConfirmOpen(false)} onConfirm={() => { if (goalsTable.selectedItem) goalsTable.deleteItem(goalsTable.selectedItem.id); showToast("Goal removed", "error"); }} title="Delete Goal" message={`Remove goal "${goalsTable.selectedItem?.goal}"?`} />

      {/* Hearing Modals */}
      <Modal isOpen={hearingsTable.isAddOpen} onClose={() => hearingsTable.setIsAddOpen(false)} title="Schedule Court Hearing">
        <form onSubmit={submitAddHearing} className="space-y-4">
          <FormField label="Date" value={hearingForm.date} onChange={(v) => setHearingForm({ ...hearingForm, date: v })} placeholder="e.g. 15 May" required />
          <FormField label="Time" value={hearingForm.time} onChange={(v) => setHearingForm({ ...hearingForm, time: v })} placeholder="e.g. 09:30 AM" required />
          <FormField label="Case Name" value={hearingForm.caseName} onChange={(v) => setHearingForm({ ...hearingForm, caseName: v })} placeholder="e.g. Salim vs FBR" required />
          <FormField label="Court" value={hearingForm.court} onChange={(v) => setHearingForm({ ...hearingForm, court: v })} placeholder="e.g. High Court Lahore" required />
          <FormSelect label="Priority" value={hearingForm.priority} onChange={(v) => setHearingForm({ ...hearingForm, priority: v })} options={["High Priority", "Medium Priority", "Low Priority"]} />
          <FormActions onCancel={() => hearingsTable.setIsAddOpen(false)} submitLabel="Schedule Hearing" />
        </form>
      </Modal>
      <Modal isOpen={hearingsTable.isEditOpen} onClose={() => hearingsTable.setIsEditOpen(false)} title="Edit Hearing Details">
        <form onSubmit={submitEditHearing} className="space-y-4">
          <FormField label="Date" value={hearingForm.date} onChange={(v) => setHearingForm({ ...hearingForm, date: v })} required />
          <FormField label="Time" value={hearingForm.time} onChange={(v) => setHearingForm({ ...hearingForm, time: v })} required />
          <FormField label="Case Name" value={hearingForm.caseName} onChange={(v) => setHearingForm({ ...hearingForm, caseName: v })} required />
          <FormField label="Court" value={hearingForm.court} onChange={(v) => setHearingForm({ ...hearingForm, court: v })} required />
          <FormSelect label="Priority" value={hearingForm.priority} onChange={(v) => setHearingForm({ ...hearingForm, priority: v })} options={["High Priority", "Medium Priority", "Low Priority"]} />
          <FormActions onCancel={() => hearingsTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={hearingsTable.isConfirmOpen} onClose={() => hearingsTable.setIsConfirmOpen(false)} onConfirm={() => { if (hearingsTable.selectedItem) hearingsTable.deleteItem(hearingsTable.selectedItem.id); showToast("Hearing cancelled", "error"); }} title="Delete Hearing" message={`Cancel hearing for "${hearingsTable.selectedItem?.caseName}"?`} />

      {/* Report Modals */}
      <Modal isOpen={reportsTable.isAddOpen} onClose={() => reportsTable.setIsAddOpen(false)} title="Generate Legal Report">
        <form onSubmit={submitAddReport} className="space-y-4">
          <FormField label="Report Name" value={reportForm.reportName} onChange={(v) => setReportForm({ ...reportForm, reportName: v })} placeholder="e.g. Q2 Case Performance Review" required />
          <FormField label="Period" value={reportForm.period} onChange={(v) => setReportForm({ ...reportForm, period: v })} placeholder="e.g. Q2 2024" required />
          <FormSelect label="Status" value={reportForm.status} onChange={(v) => setReportForm({ ...reportForm, status: v })} options={["Draft", "In Review", "Final"]} />
          <FormActions onCancel={() => reportsTable.setIsAddOpen(false)} submitLabel="Generate" />
        </form>
      </Modal>
      <Modal isOpen={reportsTable.isEditOpen} onClose={() => reportsTable.setIsEditOpen(false)} title="Edit Report Settings">
        <form onSubmit={submitEditReport} className="space-y-4">
          <FormField label="Report Name" value={reportForm.reportName} onChange={(v) => setReportForm({ ...reportForm, reportName: v })} required />
          <FormField label="Period" value={reportForm.period} onChange={(v) => setReportForm({ ...reportForm, period: v })} required />
          <FormSelect label="Status" value={reportForm.status} onChange={(v) => setReportForm({ ...reportForm, status: v })} options={["Draft", "In Review", "Final"]} />
          <FormActions onCancel={() => reportsTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={reportsTable.isConfirmOpen} onClose={() => reportsTable.setIsConfirmOpen(false)} onConfirm={() => { if (reportsTable.selectedItem) reportsTable.deleteItem(reportsTable.selectedItem.id); showToast("Report deleted", "error"); }} title="Delete Report" message={`Remove report "${reportsTable.selectedItem?.reportName}"?`} />
    </>
  );
}

// =========================================================================
// REUSABLE SUB-COMPONENTS
// =========================================================================

function Tab({ icon: Icon, label, active = false, onClick }: { icon: LucideIcon; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-extrabold transition ${
        active ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-900"
      }`}
    >
      <Icon size={17} />
      {label}
    </button>
  );
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

function CrudTable({ type, table, openEdit }: { type: "client" | "task" | "goal" | "hearing" | "report"; table: any; openEdit: (item: any) => void }) {
  const configs = {
    client: {
      title: "Client Management",
      subtext: "Manage law clients, primary advocates, payment settings, and active case counts.",
      columns: ["#", "Client Name", "Type of Services", "Active Cases", "Primary Advocate", "Payment Amount", "Payment Status", "Actions"],
      emptyMsg: 'No clients. Click "+ Add Client" to begin.',
      searchPlaceholder: "Search clients...",
    },
    task: {
      title: "Law Tasks",
      subtext: "Track case hearings preparation, document drafting, and counsel tasks.",
      columns: ["#", "Task Title", "Related Case", "Assigned To", "Due Date", "Status", "Actions"],
      emptyMsg: 'No tasks. Click "+ Create Task" to begin.',
      searchPlaceholder: "Search tasks...",
    },
    goal: {
      title: "Law Goals",
      subtext: "Monitor practice growth, target milestones, and advocacy objectives.",
      columns: ["#", "Goal", "Practice Area", "Progress", "Target Date", "Status", "Actions"],
      emptyMsg: 'No goals. Click "+ Add Goal" to begin.',
      searchPlaceholder: "Search goals...",
    },
    hearing: {
      title: "Case Calendar (Hearings)",
      subtext: "Schedule and manage upcoming court dates, client briefings, and hearings.",
      columns: ["#", "Date", "Time", "Case Name", "Court", "Priority", "Actions"],
      emptyMsg: 'No hearings scheduled. Click "+ Add Hearing" to begin.',
      searchPlaceholder: "Search hearings...",
    },
    report: {
      title: "Reports Library",
      subtext: "Access legal analytics, generated performance reviews, and draft reports.",
      columns: ["#", "Report Name", "Period", "Owner", "Generated On", "Status", "Actions"],
      emptyMsg: 'No reports found. Click "+ Generate Report" to begin.',
      searchPlaceholder: "Search reports...",
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
                    {table.visibleColumns["Active Cases"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.activeCases}</td>}
                    {table.visibleColumns["Primary Advocate"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.primaryAdvocate}</td>}
                    {table.visibleColumns["Payment Amount"] !== false && <td className="px-4 py-3 font-bold text-slate-800">{row.paymentAmount}</td>}
                    {table.visibleColumns["Payment Status"] !== false && <td className="px-4 py-3"><AmazonPill value={row.paymentStatus} /></td>}
                  </>
                )}
                {type === "task" && (
                  <>
                    {table.visibleColumns["Task Title"] !== false && <td className="px-4 py-3 font-extrabold text-slate-900">{row.title}</td>}
                    {table.visibleColumns["Related Case"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.relatedCase}</td>}
                    {table.visibleColumns["Assigned To"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.assignee}</td>}
                    {table.visibleColumns["Due Date"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.dueDate}</td>}
                    {table.visibleColumns["Status"] !== false && <td className="px-4 py-3"><StatusBadge status={row.status} /></td>}
                  </>
                )}
                {type === "goal" && (
                  <>
                    {table.visibleColumns["Goal"] !== false && <td className="px-4 py-3 font-extrabold text-slate-900">{row.goal}</td>}
                    {table.visibleColumns["Practice Area"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.practiceArea}</td>}
                    {table.visibleColumns["Progress"] !== false && <td className="px-4 py-3"><ProgressBar value={row.progress} /></td>}
                    {table.visibleColumns["Target Date"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.targetDate}</td>}
                    {table.visibleColumns["Status"] !== false && <td className="px-4 py-3"><StatusBadge status={row.status} /></td>}
                  </>
                )}
                {type === "hearing" && (
                  <>
                    {table.visibleColumns["Date"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.date}</td>}
                    {table.visibleColumns["Time"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.time}</td>}
                    {table.visibleColumns["Case Name"] !== false && <td className="px-4 py-3 font-extrabold text-slate-900">{row.caseName}</td>}
                    {table.visibleColumns["Court"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.court}</td>}
                    {table.visibleColumns["Priority"] !== false && <td className="px-4 py-3"><PriorityBadge label={row.priority} /></td>}
                  </>
                )}
                {type === "report" && (
                  <>
                    {table.visibleColumns["Report Name"] !== false && <td className="px-4 py-3 font-extrabold text-slate-900">{row.reportName}</td>}
                    {table.visibleColumns["Period"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.period}</td>}
                    {table.visibleColumns["Owner"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.owner}</td>}
                    {table.visibleColumns["Generated On"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.generatedOn}</td>}
                    {table.visibleColumns["Status"] !== false && <td className="px-4 py-3"><AmazonPill value={row.status} /></td>}
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
