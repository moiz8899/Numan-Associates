import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Bookmark, BookmarkCheck } from "lucide-react";
import { Card } from "../../components/shared/Card";
import { ActionIcons } from "../../components/shared/ActionIcons";
import { ProgressBar } from "../../components/shared/ProgressBar";
import { ViewDrawer } from "../../components/shared/ViewDrawer";
import { Toast, type ToastType } from "../../components/shared/Toast";
import { supabase } from "../../lib/supabase";

interface SearchRecord {
  id: string;
  title: string;
  type: string;
  service: string;
  match: string;
  updated: string;
}

const serviceOptions = [
  "All Service",
  "Taxation Services",
  "Immigration Services",
  "Amazon Services",
  "Law Services",
  "Company Registration",
  "Marketing Services",
  "Investment Services",
  "Academic Services",
  "Training Services",
  "Management",
];

const typeOptions = ["All Record Type", "Client", "Task", "Goal", "Report", "Reminder"];
const statusOptions = ["All Status", "Active", "Pending", "Completed", "Draft"];
const priorityOptions = ["All Priority", "High", "Medium", "Low"];

interface SavedFilter {
  id: string;
  name: string;
  rule: string;
  count: string;
}

const defaultSavedFilters: SavedFilter[] = [];

export function SearchFiltersDashboard() {
  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const showToast = (msg: string, type: ToastType = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterService, setFilterService] = useState("All Service");
  const [filterType, setFilterType] = useState("All Record Type");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [filterPriority, setFilterPriority] = useState("All Priority");

  // ViewDrawer
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SearchRecord | null>(null);

  // Saved Filters
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(defaultSavedFilters);

  useEffect(() => {
    const stored = window.localStorage.getItem("savedSearchFilters");
    if (stored) {
      try {
        setSavedFilters(JSON.parse(stored));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("savedSearchFilters", JSON.stringify(savedFilters));
  }, [savedFilters]);

  // DB Data State
  const [allRecords, setAllRecords] = useState<SearchRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Real-time Database Aggregate Query
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [
          { data: clients },
          { data: tasks },
          { data: goals },
          { data: reports },
          { data: reminders }
        ] = await Promise.all([
          supabase.from("clients").select("id, name, service_type, department, created_at"),
          supabase.from("tasks").select("id, title, department, created_at"),
          supabase.from("goals").select("id, description, department, created_at"),
          supabase.from("reports").select("id, name, category, created_at"),
          supabase.from("reminders").select("id, title, service, created_at")
        ]);

        const mappedClients: SearchRecord[] = (clients || []).map((c) => ({
          id: c.id,
          title: c.name,
          type: "Client",
          service: c.department
            ? c.department.charAt(0).toUpperCase() + c.department.slice(1)
            : c.service_type || "General",
          match: "100%",
          updated: c.created_at
            ? new Date(c.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : "Today",
        }));

        const mappedTasks: SearchRecord[] = (tasks || []).map((t) => ({
          id: t.id,
          title: t.title,
          type: "Task",
          service: t.department
            ? t.department.charAt(0).toUpperCase() + t.department.slice(1)
            : "General",
          match: "95%",
          updated: t.created_at
            ? new Date(t.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : "Today",
        }));

        const mappedGoals: SearchRecord[] = (goals || []).map((g) => ({
          id: g.id,
          title: g.description,
          type: "Goal",
          service: g.department
            ? g.department.charAt(0).toUpperCase() + g.department.slice(1)
            : "General",
          match: "90%",
          updated: g.created_at
            ? new Date(g.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : "Today",
        }));

        const mappedReports: SearchRecord[] = (reports || []).map((r) => ({
          id: r.id,
          title: r.name,
          type: "Report",
          service: r.category || "General",
          match: "85%",
          updated: r.created_at
            ? new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : "Today",
        }));

        const mappedReminders: SearchRecord[] = (reminders || []).map((rem) => ({
          id: rem.id,
          title: rem.title,
          type: "Reminder",
          service: rem.service || "General",
          match: "80%",
          updated: rem.created_at
            ? new Date(rem.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : "Today",
        }));

        setAllRecords([
          ...mappedClients,
          ...mappedTasks,
          ...mappedGoals,
          ...mappedReports,
          ...mappedReminders,
        ]);
      } catch (err) {
        console.error("Failed to load global search database", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter Logic
  const filteredRecords = useMemo(() => {
    return allRecords.filter((record) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === "" ||
        record.title.toLowerCase().includes(q) ||
        record.type.toLowerCase().includes(q) ||
        record.service.toLowerCase().includes(q);

      const matchesService =
        filterService === "All Service" ||
        record.service.toLowerCase().includes(filterService.replace(" Services", "").toLowerCase());

      const matchesType = filterType === "All Record Type" || record.type === filterType;
      return matchesSearch && matchesService && matchesType;
    });
  }, [allRecords, searchQuery, filterService, filterType]);

  const handleApplyFilters = () => {
    showToast(`Filters applied — ${filteredRecords.length} records found`, "info");
  };

  const handleSaveFilter = () => {
    if (searchQuery.trim() === "" && filterService === "All Service" && filterType === "All Record Type") {
      showToast("Set at least one filter to save", "error");
      return;
    }
    const newFilter: SavedFilter = {
      id: String(Date.now()),
      name: `Custom: ${searchQuery || filterService}`,
      rule: `Search = "${searchQuery}", Service = ${filterService}, Type = ${filterType}`,
      count: `${filteredRecords.length} matches`,
    };
    setSavedFilters((prev) => [newFilter, ...prev]);
    showToast("Filter saved!");
  };

  const handleLoadFilter = (f: SavedFilter) => {
    showToast(`Loaded filter: "${f.name}"`, "info");
    // Parse simulated loaded filter
    if (f.rule.includes("Search =")) {
      const match = f.rule.match(/Search = "([^"]*)"/);
      if (match) setSearchQuery(match[1]);
    }
  };

  const handleDeleteFilter = (id: string) => {
    setSavedFilters((prev) => prev.filter((f) => f.id !== id));
    showToast("Saved filter removed", "error");
  };

  // Index Health (computed)
  const clientCount = allRecords.filter((r) => r.type === "Client").length;
  const taskCount = allRecords.filter((r) => r.type === "Task").length;
  const reportCount = allRecords.filter((r) => r.type === "Report").length;
  const totalCount = allRecords.length || 1;
  const clientPct = `${Math.round((clientCount / totalCount) * 100)}%`;
  const taskPct = `${Math.round((taskCount / totalCount) * 100)}%`;
  const reportPct = `${Math.round((reportCount / totalCount) * 100)}%`;
  const otherPct = `${Math.round(((totalCount - clientCount - taskCount - reportCount) / totalCount) * 100)}%`;

  return (
    <>
      <Toast message={toastMessage} type={toastType} isOpen={toastOpen} onClose={() => setToastOpen(false)} />

      <section className="grid gap-6 2xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        {/* Filters Panel */}
        <Card title="Filters">
          <div className="space-y-4 p-5">
            <label className="block">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Service</span>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-700 outline-none focus:border-brand"
              >
                {serviceOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Record Type</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-700 outline-none focus:border-brand"
              >
                {typeOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Status</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-700 outline-none focus:border-brand"
              >
                {statusOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Priority</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-700 outline-none focus:border-brand"
              >
                {priorityOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <button
              onClick={handleApplyFilters}
              className="h-11 w-full rounded-xl bg-brand text-sm font-extrabold text-white shadow-soft bg-blue-600 hover:bg-blue-700 transition"
            >
              <Filter size={14} className="inline mr-2" />
              Apply Filters
            </button>
            <button
              onClick={handleSaveFilter}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition"
            >
              <Bookmark size={14} className="inline mr-2" />
              Save Current Filter
            </button>
          </div>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Search Bar */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
              <Search size={20} className="text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                placeholder="Search all clients, files, tasks, reports..."
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-xs font-extrabold text-slate-400 hover:text-slate-600 transition">Clear</button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-3 text-xs font-extrabold text-slate-400">
                Found <b className="text-slate-700">{filteredRecords.length}</b> result{filteredRecords.length !== 1 ? "s" : ""} for "{searchQuery}"
              </p>
            )}
          </section>

          {/* Results Table */}
          <Card
            title="Global Search Results"
            subtext={loading ? "Searching Supabase..." : `Search across clients, tasks, reports, reminders, and service records. Showing ${filteredRecords.length} of ${allRecords.length}.`}
          >
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {["#", "Title", "Type", "Service", "Match", "Updated", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 font-extrabold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((row, i) => (
                    <tr key={row.id} className="text-sm hover:bg-slate-50 transition duration-100">
                      <td className="px-4 py-3 font-extrabold text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-900">{row.title}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${
                          row.type === "Client" ? "bg-blue-100 text-blue-700" :
                          row.type === "Task" ? "bg-violet-100 text-violet-700" :
                          row.type === "Report" ? "bg-emerald-100 text-emerald-700" :
                          row.type === "Goal" ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.service}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-700">{row.match}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.updated}</td>
                      <td className="px-4 py-3">
                        <ActionIcons
                          onView={() => { setSelectedRecord(row); setViewOpen(true); }}
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm font-bold text-slate-400">
                        {loading ? "Searching..." : "No results match your search criteria. Try adjusting filters."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Card title="Saved Filters">
            <div className="divide-y divide-slate-100">
              {savedFilters.map((f) => (
                <div key={f.id} className="flex items-start justify-between gap-2 px-5 py-4 hover:bg-slate-50 transition">
                  <button onClick={() => handleLoadFilter(f)} className="text-left flex-1">
                    <div className="flex items-center gap-2">
                      <BookmarkCheck size={14} className="text-blue-600 shrink-0" />
                      <p className="text-sm font-extrabold text-slate-900">{f.name}</p>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{f.rule}</p>
                    <p className="mt-2 text-xs font-extrabold text-blue-600">{f.count}</p>
                  </button>
                  <button onClick={() => handleDeleteFilter(f.id)} className="text-xs font-extrabold text-red-500 hover:text-red-700 transition mt-1">×</button>
                </div>
              ))}
              {savedFilters.length === 0 && (
                <div className="px-5 py-8 text-center text-sm font-bold text-slate-400">
                  No saved filters
                </div>
              )}
            </div>
          </Card>
          <Card title="Index Health">
            <div className="space-y-4 p-5">
              {[
                ["Clients", clientPct],
                ["Tasks", taskPct],
                ["Reports", reportPct],
                ["Other", otherPct],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="mb-1.5 flex justify-between text-sm font-extrabold">
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                  <ProgressBar value={value} />
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </section>

      {/* View Drawer */}
      <ViewDrawer isOpen={viewOpen} onClose={() => setViewOpen(false)} title={selectedRecord?.title || "Record"}>
        {selectedRecord && (
          <div className="space-y-4">
            <DetailCard label="Record Details" items={[["Title", selectedRecord.title], ["Type", selectedRecord.type]]} />
            <DetailCard label="Service Info" items={[["Service", selectedRecord.service], ["Match Score", selectedRecord.match], ["Last Updated", selectedRecord.updated]]} />
          </div>
        )}
      </ViewDrawer>
    </>
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
