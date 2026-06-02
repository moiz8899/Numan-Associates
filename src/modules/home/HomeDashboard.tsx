import { useState } from "react";
import {
  Bell,
  CheckSquare,
  CreditCard,
  FileText,
  Calendar,
  Bot,
  UserPlus,
  Trash2,
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
import { StatusBadge } from "../../components/shared/badges";
import { useTable } from "../../hooks/useTable";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { Toast, type ToastType } from "../../components/shared/Toast";

interface HomeTask {
  id: string;
  title: string;
  department: string;
  assignee: string;
  dueDate: string;
  status: string;
}

interface HomePayment {
  id: string;
  company: string;
  service: string;
  amount: string;
  status: string;
  urgent: boolean;
  created_at?: string;
}


function AlertPill({ tone, label }: { tone: string; label: string }) {
  return <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${tone}`}>{label}</span>;
}

function QuickAction({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-24 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-sm font-extrabold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-brand"
    >
      <Icon size={24} />
      <span>{label}</span>
    </button>
  );
}

export function HomeDashboard({ onNavigate }: { onNavigate: (module: string) => void }) {
  // Toast State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");

  const showToast = (msg: string, type: ToastType = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const clientsTable = useTable<{ id: string; name: string; department?: string; serviceType?: string; paymentAmount?: string; paymentStatus?: string; created_at?: string }>({
    initialData: [],
    searchFields: ["name", "department", "serviceType", "paymentStatus"],
    defaultPageSize: 5,
    supabaseTable: "clients",
  });

  // useTable for Tasks on Home
  const tasksTable = useTable<HomeTask>({
    initialData: [],
    searchFields: ["title", "department", "assignee"],
    defaultPageSize: 5,
    supabaseTable: "tasks",
  });

  // useTable for Payments on Home
  const paymentsTable = useTable<HomePayment>({
    initialData: [],
    searchFields: ["company", "service"],
    defaultPageSize: 5,
    supabaseTable: "clients",
    supabaseFilter: { column: "payment_status", value: "Pending" },
  });

  const remindersTable = useTable<{ id: string; title: string; service: string; client: string; dueDate: string; priority: string; status: string }>({
    initialData: [],
    searchFields: ["title", "service", "client", "status"],
    defaultPageSize: 5,
    supabaseTable: "reminders",
  });

  const parseAmount = (amount?: string) => {
    if (!amount) return 0;
    const numeric = Number(String(amount).replace(/[^\d.-]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const totalClients = clientsTable.data.length;
  const totalRevenue = clientsTable.data.reduce((sum, client) => sum + parseAmount(client.paymentAmount), 0);
  const activeTasksCount = tasksTable.data.filter((t) => t.status !== "Completed").length;
  const completedCasesCount = tasksTable.data.filter((t) => t.status === "Completed").length;

  const totalOutstandingAmount = paymentsTable.data.reduce(
    (sum, pay) => sum + parseAmount(pay.amount),
    0
  );

  const totalReminders = remindersTable.data.length;
  const overdueRemindersCount = remindersTable.data.filter((r) => r.status === "Overdue").length;
  const pendingRemindersCount = remindersTable.data.filter((r) => r.status !== "Completed").length;

  const kpiCards = [
    { label: "Total Clients", value: String(totalClients), change: "\u2014", trend: "positive", icon: UserPlus, color: "#1a73e8", bg: "bg-blue-50" },
    { label: "Total Revenue", value: `PKR ${totalRevenue.toLocaleString()}`, change: "\u2014", trend: "positive", icon: CreditCard, color: "#16a34a", bg: "bg-green-50" },
    { label: "Total Pending Payments", value: `PKR ${totalOutstandingAmount.toLocaleString()}`, change: "\u2014", trend: "negative", icon: CreditCard, color: "#f97316", bg: "bg-orange-50" },
    { label: "Active Tasks", value: String(activeTasksCount), change: "\u2014", trend: "positive", icon: CheckSquare, color: "#7c3aed", bg: "bg-violet-50" },
    { label: "Total Completed Cases", value: String(completedCasesCount), change: "\u2014", trend: "positive", icon: CheckSquare, color: "#0d9488", bg: "bg-teal-50" },
  ];

  const lastSixMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  });

  const paymentsByMonth = paymentsTable.data.reduce<Record<string, number>>((acc, payment) => {
    if (!payment.created_at) return acc;
    const monthLabel = new Date(payment.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    acc[monthLabel] = (acc[monthLabel] || 0) + parseAmount(payment.amount);
    return acc;
  }, {});

  const revenueData = lastSixMonths.map((month) => ({
    month,
    value: paymentsByMonth[month] || 0,
  }));

  const taskStatusData = [
    { name: "In Progress", value: tasksTable.data.filter((t) => t.status === "In Progress").length, color: "#3B82F6" },
    { name: "Not Started", value: tasksTable.data.filter((t) => t.status === "Not Started").length, color: "#F59E0B" },
    { name: "Completed", value: tasksTable.data.filter((t) => t.status === "Completed").length, color: "#10B981" },
  ];

  const departmentCounts = tasksTable.data.reduce<Record<string, number>>((acc, task) => {
    const name = task.department || "General";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const totalDepartmentTasks = Object.values(departmentCounts).reduce((sum, value) => sum + value, 0) || 1;
  const departmentColors = ["bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-violet-500", "bg-slate-500"];
  const departmentPerformance = Object.entries(departmentCounts).slice(0, 5).map(([label, count], index) => ({
    label,
    pct: Math.round((count / totalDepartmentTasks) * 100),
    color: departmentColors[index % departmentColors.length],
  }));

  return (
    <>
      <Toast message={toastMessage} type={toastType} isOpen={toastOpen} onClose={() => setToastOpen(false)} />

      {/* Notification Center */}
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
          <Bell size={18} className="text-slate-600" />
          <span>Notification Center</span>
        </div>
        <div className="flex flex-1 flex-wrap gap-2">
          {totalReminders > 0 ? (
            <>
              <AlertPill tone="bg-orange-100 text-orange-700" label={`${pendingRemindersCount} Reminder${pendingRemindersCount === 1 ? "" : "s"} Pending`} />
              {overdueRemindersCount > 0 ? (
                <AlertPill tone="bg-red-100 text-red-700" label={`${overdueRemindersCount} Overdue Reminder${overdueRemindersCount === 1 ? "" : "s"}`} />
              ) : null}
            </>
          ) : (
            <AlertPill tone="bg-green-100 text-green-700" label="No reminders set" />
          )}
          <AlertPill tone="bg-orange-100 text-orange-700" label={`${activeTasksCount} Pending Tasks`} />
        </div>
        <button onClick={() => onNavigate("Calendar & Reminders")} className="text-sm font-extrabold text-brand hover:text-blue-700">View All →</button>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </section>

      {/* Tasks, Performance, Payments grid */}
      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)_minmax(320px,0.8fr)]">
        <Card
          title="Recent High-Priority Tasks"
          action={<button onClick={() => onNavigate("Calendar & Reminders")} className="text-sm font-extrabold text-brand">View All Tasks →</button>}
        >
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {["#", "Task Title", "Department", "Assigned To", "Due Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 font-extrabold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasksTable.paginatedData.map((row, idx) => (
                  <tr key={row.id} className="text-sm hover:bg-slate-50">
                    <td className="px-4 py-3 font-extrabold text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-extrabold text-slate-900">{row.title}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{row.department}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{row.assignee}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{row.dueDate}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          tasksTable.selectItemForAction(row, "delete");
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {tasksTable.paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm font-bold text-slate-400">
                      No high priority tasks.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="Department Performance"
          action={<button onClick={() => onNavigate("Reports & Analytics")} className="text-sm font-extrabold text-brand">View Report →</button>}
        >
          <div className="space-y-4 p-5">
            {departmentPerformance.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-extrabold text-slate-700">{item.label}</span>
                  <span className="font-extrabold text-slate-990">{item.pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div className={`h-2.5 rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Pending Payments"
          action={<button onClick={() => onNavigate("Reports & Analytics")} className="text-sm font-extrabold text-brand">View All →</button>}
        >
          <div className="divide-y divide-slate-100">
            {paymentsTable.paginatedData.map((payment) => (
              <div key={payment.id} className="px-5 py-4 hover:bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold text-slate-990">{payment.company}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{payment.service}</p>
                  <p className={`mt-2 text-xs font-extrabold ${payment.urgent ? "text-red-600 bg-red-50" : "text-orange-600 bg-orange-50"} px-2 py-0.5 rounded-full inline-block`}>
                    {payment.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-slate-900">{payment.amount}</p>
                  <button
                    onClick={() => {
                      paymentsTable.selectItemForAction(payment, "delete");
                    }}
                    className="mt-2 text-xs font-bold text-red-500 hover:text-red-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ))}
            {paymentsTable.paginatedData.length === 0 && (
              <div className="px-5 py-8 text-center text-sm font-bold text-slate-400">
                No pending payments!
              </div>
            )}
            <div className="flex items-center justify-between bg-red-50 bg-opacity-50 px-5 py-4">
              <span className="text-sm font-extrabold text-red-700">Total Outstanding</span>
              <span className="text-lg font-extrabold text-red-700">PKR {totalOutstandingAmount.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </section>

      {/* Revenue and Status charts */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)_minmax(320px,0.8fr)]">
        <Card
          title="Revenue Overview"
          action={
            <select className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-700">
              <option>This Year</option>
            </select>
          }
        >
          <div className="h-80 p-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#1a73e8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
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
                  tickFormatter={(v) => `PKR ${Number(v) / 1000}K`}
                  ticks={[0, 75000, 150000, 225000, 300000]}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                />
                <Tooltip formatter={(value) => [`PKR ${Number(value).toLocaleString()}`, "Revenue"]} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#1a73e8"
                  strokeWidth={3}
                  fill="url(#revenueFill)"
                  dot={{ r: 4, fill: "#1a73e8", strokeWidth: 2, stroke: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Tasks Status Overview">
          <div className="p-5">
            <div className="relative h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskStatusData} innerRadius={76} outerRadius={108} paddingAngle={3} dataKey="value">
                    {taskStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} Tasks`, "Count"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-2xl font-extrabold text-slate-955">{tasksTable.data.length}</p>
                <p className="text-xs font-bold text-slate-500">Total Tasks</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {taskStatusData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2 font-bold text-slate-700">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-extrabold">
                    {item.value} ({tasksTable.data.length > 0 ? Math.round((item.value / tasksTable.data.length) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-3 p-5">
            <QuickAction icon={UserPlus} label="Add New Client" onClick={() => onNavigate("Settings")} />
            <QuickAction icon={CheckSquare} label="Create Task" onClick={() => onNavigate("Calendar & Reminders")} />
            <QuickAction icon={CreditCard} label="Record Payment" onClick={() => onNavigate("Reports & Analytics")} />
            <QuickAction icon={FileText} label="Generate Report" onClick={() => onNavigate("Reports & Analytics")} />
            <QuickAction icon={Calendar} label="Schedule Meeting" onClick={() => onNavigate("Calendar & Reminders")} />
            <QuickAction icon={Bot} label="AI Assistant" onClick={() => onNavigate("AI Assistant")} />
          </div>
        </Card>
      </section>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={tasksTable.isConfirmOpen}
        onClose={() => tasksTable.setIsConfirmOpen(false)}
        onConfirm={() => {
          if (tasksTable.selectedItem) {
            tasksTable.deleteItem(tasksTable.selectedItem.id);
            showToast("Task deleted successfully", "success");
          }
        }}
        title="Delete High Priority Task"
        message={`Are you sure you want to delete "${tasksTable.selectedItem?.title}"?`}
      />

      <ConfirmDialog
        isOpen={paymentsTable.isConfirmOpen}
        onClose={() => paymentsTable.setIsConfirmOpen(false)}
        onConfirm={() => {
          if (paymentsTable.selectedItem) {
            paymentsTable.deleteItem(paymentsTable.selectedItem.id);
            showToast("Pending payment cleared", "success");
          }
        }}
        title="Clear Pending Payment"
        message={`Are you sure you want to clear payment for "${paymentsTable.selectedItem?.company}"?`}
      />
    </>
  );
}
