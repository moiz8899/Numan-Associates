import { useState } from "react";
import {
  Users,
  Shield,
  Columns3,
  Bell,
  CheckCircle,
  Circle,
} from "lucide-react";
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

// Types
interface UserRecord {
  id: string;
  name: string;
  role: string;
  access: string;
  status: string;
}

interface ModuleSettingRecord {
  id: string;
  name: string;
  status: string;
  access: string;
  priority: string;
}

// Mock data
const initialUsers: UserRecord[] = [
  { id: "usr-1", name: "Numan Ali", role: "Administrator", access: "All Modules", status: "Active" },
  { id: "usr-2", name: "Sarah Khan", role: "Senior Associate", access: "Immigration, Law, Taxation", status: "Active" },
  { id: "usr-3", name: "Ahmed Malik", role: "Amazon Specialist", access: "Amazon Services", status: "Active" },
  { id: "usr-4", name: "Fatima Zahra", role: "Legal Advisor", access: "Law, Immigration", status: "On Leave" },
  { id: "usr-5", name: "Ali Hassan", role: "Tax Consultant", access: "Taxation, Company Reg", status: "Active" },
];

const fallbackModuleSettingsData = [
  { name: "Taxation Services", status: "Enabled", access: "Full Access — All Staff", priority: "High" },
  { name: "Immigration Services", status: "Enabled", access: "Full Access — All Staff", priority: "High" },
  { name: "Amazon Services", status: "Enabled", access: "Ahmed Malik, Numan Ali", priority: "Medium" },
  { name: "Law Services", status: "Enabled", access: "Fatima Zahra, Sarah Khan", priority: "High" },
  { name: "Academic Services", status: "Enabled", access: "Senior Associates", priority: "Low" },
  { name: "AI Assistant", status: "Disabled", access: "Requires API Key", priority: "Optional" },
];

const roleOptions = ["Administrator", "Senior Associate", "Associate", "Specialist", "Consultant", "Legal Advisor", "Intern"];
const statusOptions = ["Active", "On Leave", "Suspended", "Inactive"];

export function SettingsDashboard() {
  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const showToast = (msg: string, type: ToastType = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // Clear Data
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearDone, setClearDone] = useState(false);
  const handleClearData = () => {
    localStorage.clear();
    setClearDone(true);
    setShowClearConfirm(false);
    showToast("All data cleared. System resetting...", "error");
    setTimeout(() => {
      setClearDone(false);
      window.location.reload();
    }, 1500);
  };

  // Firm Profile State
  const [firmProfile, setFirmProfile] = useState({
    firmName: "Numan and Associates",
    businessType: "Consultancy Firm",
    currency: "PKR",
    timezone: "Asia/Karachi",
  });

  const handleSaveFirm = () => {
    showToast("Firm profile saved successfully!");
  };

  // Users table
  const usersTable = useTable<UserRecord>({
    initialData: [],
    searchFields: ["name", "role", "access", "status"],
    defaultPageSize: 5,
    supabaseTable: "settings_users",
  });

  const moduleSettingsTable = useTable<ModuleSettingRecord>({
    initialData: [],
    searchFields: ["name", "status", "access", "priority"],
    defaultPageSize: 5,
    supabaseTable: "module_settings",
  });

  const displayedModuleSettings = moduleSettingsTable.data.length > 0 ? moduleSettingsTable.data : fallbackModuleSettingsData;

  // Form
  const [form, setForm] = useState<Omit<UserRecord, "id">>({
    name: "",
    role: "Associate",
    access: "",
    status: "Active",
  });

  // Dynamic KPIs
  const activeUsers = usersTable.data.filter((u) => u.status === "Active").length;
  const uniqueRoles = new Set(usersTable.data.map((u) => u.role)).size;
  const enabledModules = displayedModuleSettings.filter((m) => m.status === "Enabled").length;

  const kpis = [
    { label: "Users", value: String(usersTable.data.length), change: "—", trend: "positive", icon: Users, color: "#1a73e8", bg: "bg-blue-50" },
    { label: "Active", value: String(activeUsers), change: "—", trend: "positive", icon: Shield, color: "#16a34a", bg: "bg-green-50" },
    { label: "Roles", value: String(uniqueRoles), change: "—", trend: "positive", icon: Columns3, color: "#7c3aed", bg: "bg-violet-50" },
    { label: "Modules", value: String(enabledModules), change: "—", trend: "positive", icon: Bell, color: "#f97316", bg: "bg-orange-50" },
  ];

  // CRUD
  const openAdd = () => {
    setForm({ name: "", role: "Associate", access: "", status: "Active" });
    usersTable.setIsAddOpen(true);
  };

  const openEdit = (u: UserRecord) => {
    setForm({ name: u.name, role: u.role, access: u.access, status: u.status });
    usersTable.selectItemForAction(u, "edit");
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    usersTable.addItem({ id: String(Date.now()), ...form });
    usersTable.setIsAddOpen(false);
    showToast(`User "${form.name}" added successfully!`);
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usersTable.selectedItem) return;
    usersTable.updateItem({ id: usersTable.selectedItem.id, ...form });
    usersTable.setIsEditOpen(false);
    showToast("User updated!");
  };

  // Notification toggles
  const [notifications, setNotifications] = useState({
    "Payment overdue alerts": true,
    "Deadline reminders": true,
    "New client notifications": true,
    "Weekly analytics digest": true,
  });

  const toggleNotification = (key: string) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    showToast(`${key} ${notifications[key as keyof typeof notifications] ? "disabled" : "enabled"}`, "info");
  };

  const columns = ["#", "User", "Role", "Access", "Status", "Actions"];

  return (
    <section className="space-y-6">
      <Toast message={toastMessage} type={toastType} isOpen={toastOpen} onClose={() => setToastOpen(false)} />

      {/* KPIs */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          {/* Firm Profile */}
          <Card
            title="Firm Profile"
            subtext="Core firm information used across reports, invoices, and dashboards."
            action={
              <button onClick={handleSaveFirm} className="h-10 rounded-xl bg-brand px-4 text-sm font-extrabold text-white shadow-soft bg-blue-600 hover:bg-blue-700 transition">
                Save Changes
              </button>
            }
          >
            <div className="grid gap-4 p-5 md:grid-cols-2">
              {[
                { label: "Firm Name", key: "firmName" as const },
                { label: "Business Type", key: "businessType" as const },
                { label: "Default Currency", key: "currency" as const },
                { label: "Timezone", key: "timezone" as const },
              ].map(({ label, key }) => (
                <label key={label} className="block">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</span>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand"
                    value={firmProfile[key]}
                    onChange={(e) => setFirmProfile({ ...firmProfile, [key]: e.target.value })}
                  />
                </label>
              ))}
            </div>
          </Card>

          {/* Users & Roles Table */}
          <Card
            title="Users & Roles"
            subtext="Manage staff access, module ownership, and account status."
            action={
              <button onClick={openAdd} className="h-10 rounded-xl bg-brand px-4 text-sm font-extrabold text-white shadow-soft bg-blue-600 hover:bg-blue-700 transition">
                + Add User
              </button>
            }
          >
            <div className="p-4 border-b border-slate-100">
              <TableActions searchQuery={usersTable.searchQuery} onSearchChange={usersTable.setSearchQuery} searchPlaceholder="Search users..." columns={columns} visibleColumns={usersTable.visibleColumns} onToggleColumn={(col) => usersTable.setVisibleColumns((c) => ({ ...c, [col]: c[col] === false }))} />
            </div>
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[880px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {columns.map((h) => usersTable.visibleColumns[h] !== false && (
                      <th key={h} className="px-4 py-3 font-extrabold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersTable.paginatedData.map((row, i) => (
                    <tr key={row.id} className="text-sm hover:bg-slate-50 transition duration-100">
                      {usersTable.visibleColumns["#"] !== false && <td className="px-4 py-3 font-extrabold text-slate-400">{(usersTable.currentPage - 1) * usersTable.pageSize + i + 1}</td>}
                      {usersTable.visibleColumns["User"] !== false && <td className="px-4 py-3 font-extrabold text-slate-900">{row.name}</td>}
                      {usersTable.visibleColumns["Role"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.role}</td>}
                      {usersTable.visibleColumns["Access"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.access}</td>}
                      {usersTable.visibleColumns["Status"] !== false && (
                        <td className="px-4 py-3"><SystemStatusBadge status={row.status} /></td>
                      )}
                      {usersTable.visibleColumns["Actions"] !== false && (
                        <td className="px-4 py-3">
                          <ActionIcons
                            onView={() => usersTable.selectItemForAction(row, "view")}
                            onEdit={() => openEdit(row)}
                            onDelete={() => usersTable.selectItemForAction(row, "delete")}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                  {usersTable.paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-12 text-center text-sm font-bold text-slate-400">
                        No users found. Click "+ Add User" to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginatedTableFooter currentPage={usersTable.currentPage} totalPages={usersTable.totalPages} pageSize={usersTable.pageSize} totalItems={usersTable.filteredData.length} onPageChange={usersTable.setCurrentPage} onPageSizeChange={usersTable.setPageSize} />
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Card title="Module Settings">
            <div className="divide-y divide-slate-100">
              {displayedModuleSettings.map((mod) => (
                <div key={mod.name} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-extrabold text-slate-900">{mod.name}</p>
                    <SystemStatusBadge status={mod.status} />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{mod.access}</p>
                  <p className="mt-2 text-xs font-extrabold text-slate-400">Audit priority: {mod.priority}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Notification Rules">
            <div className="space-y-3 p-5">
              {Object.entries(notifications).map(([item, checked]) => (
                <label
                  key={item}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-100 cursor-pointer transition"
                >
                  <span>{item}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleNotification(item)}
                    className="h-4 w-4 accent-blue-600"
                  />
                </label>
              ))}
            </div>
          </Card>

          <Card title="Data Management">
            <div className="space-y-4 p-5">
              <p className="text-sm font-semibold leading-6 text-slate-500">
                Clear all data from every module. This will reset clients, tasks, payments, reports, and all service records
                across the entire system.
              </p>
              {clearDone ? (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-extrabold text-green-700 border border-green-200">
                  <CheckCircle size={18} />
                  All data cleared. System resetting...
                </div>
              ) : showClearConfirm ? (
                <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-extrabold text-red-700">Are you sure? This action cannot be undone.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleClearData}
                      className="h-10 rounded-xl bg-red-600 px-5 text-sm font-extrabold text-white shadow-soft hover:bg-red-700 transition"
                    >
                      Yes, Clear All Data
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="h-10 rounded-xl border border-slate-300 px-5 text-sm font-extrabold text-slate-600 hover:bg-white bg-white transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border-2 border-red-200 bg-red-50 text-sm font-extrabold text-red-700 transition hover:border-red-400 hover:bg-red-100"
                >
                  <Circle size={18} />
                  Clear All Data
                </button>
              )}
            </div>
          </Card>
        </aside>
      </section>

      {/* CRUD MODALS */}
      <Modal isOpen={usersTable.isAddOpen} onClose={() => usersTable.setIsAddOpen(false)} title="Add New User">
        <form onSubmit={submitAdd} className="space-y-4">
          <FormField label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Muhammad Ali" required />
          <FormSelect label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={roleOptions} />
          <FormField label="Module Access" value={form.access} onChange={(v) => setForm({ ...form, access: v })} placeholder="e.g. Taxation, Law, Immigration" required />
          <FormSelect label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={statusOptions} />
          <FormActions onCancel={() => usersTable.setIsAddOpen(false)} submitLabel="Add User" />
        </form>
      </Modal>

      <Modal isOpen={usersTable.isEditOpen} onClose={() => usersTable.setIsEditOpen(false)} title="Edit User Details">
        <form onSubmit={submitEdit} className="space-y-4">
          <FormField label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <FormSelect label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={roleOptions} />
          <FormField label="Module Access" value={form.access} onChange={(v) => setForm({ ...form, access: v })} required />
          <FormSelect label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={statusOptions} />
          <FormActions onCancel={() => usersTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>

      <ViewDrawer isOpen={usersTable.isViewOpen} onClose={() => usersTable.setIsViewOpen(false)} title={usersTable.selectedItem?.name || "User"}>
        {usersTable.selectedItem && (
          <div className="space-y-4">
            <DetailCard label="User Profile" items={[["Full Name", usersTable.selectedItem.name], ["Role", usersTable.selectedItem.role]]} />
            <DetailCard label="Permissions" items={[["Module Access", usersTable.selectedItem.access], ["Account Status", usersTable.selectedItem.status]]} />
          </div>
        )}
      </ViewDrawer>

      <ConfirmDialog isOpen={usersTable.isConfirmOpen} onClose={() => usersTable.setIsConfirmOpen(false)} onConfirm={() => { if (usersTable.selectedItem) usersTable.deleteItem(usersTable.selectedItem.id); showToast("User removed", "error"); }} title="Remove User" message={`Remove "${usersTable.selectedItem?.name}" from the system?`} />
    </section>
  );
}

// Subcomponents
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
