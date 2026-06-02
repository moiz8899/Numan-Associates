import { useState, useMemo } from "react";
import { Megaphone, BriefcaseBusiness, FileText, Plus, Download, Printer, ChevronDown } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../../components/shared/Card";
import { KpiCard } from "../../components/shared/KpiCard";
import { ActionIcons } from "../../components/shared/ActionIcons";
import { TableActions } from "../../components/shared/TableActions";
import { ChartLegend } from "../../components/shared/ChartLegend";
import {
  AmazonPill,
  MarketingStatusBadge,
  EngagementBadge,
} from "../../components/shared/badges";
import { PaginatedTableFooter } from "../../components/shared/TableFooter";
import { Modal } from "../../components/shared/Modal";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { ViewDrawer } from "../../components/shared/ViewDrawer";
import { Toast, type ToastType } from "../../components/shared/Toast";
import { useTable } from "../../hooks/useTable";
import { exportToPDF, exportToExcel, triggerPrint } from "../../utils/export";

// Data Types
interface FacebookPage {
  id: string;
  name: string;
  admin: string;
  followers: string;
  engagementRate: string;
  lastPost: string;
  status: string;
  department?: string;
}

interface LinkedInPage {
  id: string;
  name: string;
  connections: string;
  postFrequency: string;
  engagementRate: string;
  lastUpdated: string;
  status: string;
  department?: string;
}

interface YouTubePlaylist {
  id: string;
  name: string;
  department: string;
  totalVideos: string;
  totalViews: string;
  subscribers: string;
  lastUpload: string;
}

// Initial Mock Data
const initialFacebookPages: FacebookPage[] = [
  {
    id: "fb-1",
    name: "Numan & Associates Law",
    admin: "Sara Khan",
    followers: "12,500",
    engagementRate: "3.2%",
    lastPost: "12 hours ago",
    status: "Active",
  },
  {
    id: "fb-2",
    name: "Tax Consult Pakistan",
    admin: "Ali Raza",
    followers: "8,200",
    engagementRate: "2.8%",
    lastPost: "1 day ago",
    status: "Active",
  },
  {
    id: "fb-3",
    name: "Immigration News PK",
    admin: "Fatima Sheikh",
    followers: "5,400",
    engagementRate: "4.5%",
    lastPost: "2 hours ago",
    status: "Active",
  },
];

const initialLinkedInPages: LinkedInPage[] = [
  {
    id: "li-1",
    name: "Advocate Numan - Corporate Law",
    connections: "4,800",
    postFrequency: "3 / week",
    engagementRate: "5.4%",
    lastUpdated: "2 days ago",
    status: "Active",
  },
  {
    id: "li-2",
    name: "Numan & Associates Partners",
    connections: "15,200",
    postFrequency: "5 / week",
    engagementRate: "4.1%",
    lastUpdated: "Today",
    status: "Active",
  },
];

const initialYouTubePlaylists: YouTubePlaylist[] = [
  {
    id: "yt-1",
    name: "Pakistan Taxation Guide 2026",
    department: "Taxation Services",
    totalVideos: "24",
    totalViews: "18,400",
    subscribers: "3,500",
    lastUpload: "3 days ago",
  },
  {
    id: "yt-2",
    name: "Corporate Registration Process",
    department: "Corporate Law",
    totalVideos: "12",
    totalViews: "9,200",
    subscribers: "1,200",
    lastUpload: "1 week ago",
  },
];

export function MarketingDashboard() {
  const [activeTab, setActiveTab] = useState("Facebook");

  // Toast State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");

  const showToast = (msg: string, type: ToastType = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // Table Hooks
  const facebookTable = useTable<FacebookPage>({
    initialData: [],
    searchFields: ["name", "admin", "status"],
    defaultPageSize: 5,
    supabaseTable: "clients",
    supabaseFilter: { column: "service_type", value: "Facebook Page" },
  });

  const linkedinTable = useTable<LinkedInPage>({
    initialData: [],
    searchFields: ["name", "status"],
    defaultPageSize: 5,
    supabaseTable: "clients",
    supabaseFilter: { column: "service_type", value: "LinkedIn Page" },
  });

  const youtubeTable = useTable<YouTubePlaylist>({
    initialData: [],
    searchFields: ["name", "department"],
    defaultPageSize: 5,
    supabaseTable: "clients",
    supabaseFilter: { column: "service_type", value: "YouTube Playlist" },
  });

  // Export dropdown state
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Form States
  const [fbForm, setFbForm] = useState<Omit<FacebookPage, "id">>({
    name: "",
    admin: "Admin User",
    followers: "0",
    engagementRate: "0.0%",
    lastPost: "Just now",
    status: "Active",
  });

  const [liForm, setLiForm] = useState<Omit<LinkedInPage, "id">>({
    name: "",
    connections: "0",
    postFrequency: "3 / week",
    engagementRate: "0.0%",
    lastUpdated: "Just now",
    status: "Active",
  });

  const [ytForm, setYtForm] = useState<Omit<YouTubePlaylist, "id">>({
    name: "",
    department: "Taxation Services",
    totalVideos: "0",
    totalViews: "0",
    subscribers: "0",
    lastUpload: "Just now",
  });

  // Dynamic KPIs calculations
  const totalFbFollowers = facebookTable.data.reduce(
    (sum, p) => sum + (parseInt(p.followers.replace(/[^\d]/g, "")) || 0),
    0
  );
  const totalLiFollowers = linkedinTable.data.reduce(
    (sum, p) => sum + (parseInt(p.connections.replace(/[^\d]/g, "")) || 0),
    0
  );
  const totalYtSubscribers = youtubeTable.data.reduce(
    (sum, p) => sum + (parseInt(p.subscribers.replace(/[^\d]/g, "")) || 0),
    0
  );
  const totalFollowersSum = totalFbFollowers + totalLiFollowers + totalYtSubscribers;

  const totalYtViews = youtubeTable.data.reduce(
    (sum, p) => sum + (parseInt(p.totalViews.replace(/[^\d]/g, "")) || 0),
    0
  );

  const avgEngagementRate = useMemo(() => {
    let totalRate = 0;
    let count = 0;
    facebookTable.data.forEach((p) => {
      totalRate += parseFloat(p.engagementRate.replace(/[^\d.]/g, "")) || 0;
      count++;
    });
    linkedinTable.data.forEach((p) => {
      totalRate += parseFloat(p.engagementRate.replace(/[^\d.]/g, "")) || 0;
      count++;
    });
    return count > 0 ? `${(totalRate / count).toFixed(2)}%` : "0.0%";
  }, [facebookTable.data, linkedinTable.data]);

  const marketingKpis = [
    {
      label: "Total Platforms",
      value: String(facebookTable.data.length + linkedinTable.data.length + youtubeTable.data.length),
      change: "\u2014",
      trend: "neutral",
      icon: Megaphone,
      color: "#7c3aed",
      bg: "bg-violet-50",
    },
    {
      label: "Total Followers",
      value: totalFollowersSum.toLocaleString(),
      change: "\u2014",
      trend: "positive",
      icon: BriefcaseBusiness,
      color: "#1a73e8",
      bg: "bg-blue-50",
    },
    {
      label: "Total Video Views",
      value: totalYtViews.toLocaleString(),
      change: "\u2014",
      trend: "positive",
      icon: FileText,
      color: "#16a34a",
      bg: "bg-green-50",
    },
    {
      label: "Avg Engagement Rate",
      value: avgEngagementRate,
      change: "\u2014",
      trend: "positive",
      icon: FileText,
      color: "#f97316",
      bg: "bg-orange-50",
    },
    {
      label: "Total YouTube Videos",
      value: String(youtubeTable.data.reduce((sum, p) => sum + (parseInt(p.totalVideos.replace(/[^\d]/g, "")) || 0), 0)),
      change: "\u2014",
      trend: "positive",
      icon: FileText,
      color: "#0d9488",
      bg: "bg-teal-50",
    },
  ];

  // Right Column Donut Distribution data
  const platformFollowersData = [
    { name: "Facebook", value: totalFbFollowers, color: "#1877F2" },
    { name: "LinkedIn", value: totalLiFollowers, color: "#0A66C2" },
    { name: "YouTube", value: totalYtSubscribers, color: "#FF0000" },
  ];

  const youtubeViewsData = youtubeTable.data.map((p) => ({
    name: p.name.length > 20 ? p.name.slice(0, 20) + "..." : p.name,
    views: parseInt(p.totalViews.replace(/[^\d]/g, "")) || 0,
  }));

  // Export handlers
  const handleExport = (format: "pdf" | "excel") => {
    setShowExportMenu(false);
    if (activeTab === "Facebook") {
      const headers = ["#", "Facebook Page", "Admin", "Followers", "Engagement Rate", "Last Post", "Status"];
      const rows = facebookTable.data.map((p, i) => [
        String(i + 1),
        p.name,
        p.admin,
        p.followers,
        p.engagementRate,
        p.lastPost,
        p.status,
      ]);
      if (format === "pdf") {
        exportToPDF({ title: "Facebook Pages Report", headers, rows, fileName: "facebook_marketing" });
      } else {
        exportToExcel({ title: "Facebook Marketing", headers, rows, fileName: "facebook_marketing" });
      }
    } else if (activeTab === "LinkedIn") {
      const headers = ["#", "Profile / Page", "Connections", "Post Frequency", "Engagement Rate", "Last Updated", "Status"];
      const rows = linkedinTable.data.map((p, i) => [
        String(i + 1),
        p.name,
        p.connections,
        p.postFrequency,
        p.engagementRate,
        p.lastUpdated,
        p.status,
      ]);
      if (format === "pdf") {
        exportToPDF({ title: "LinkedIn Management Report", headers, rows, fileName: "linkedin_marketing" });
      } else {
        exportToExcel({ title: "LinkedIn Marketing", headers, rows, fileName: "linkedin_marketing" });
      }
    } else {
      const headers = ["#", "Playlist Name", "Department", "Total Videos", "Total Views", "Subscribers", "Last Upload"];
      const rows = youtubeTable.data.map((p, i) => [
        String(i + 1),
        p.name,
        p.department,
        p.totalVideos,
        p.totalViews,
        p.subscribers,
        p.lastUpload,
      ]);
      if (format === "pdf") {
        exportToPDF({ title: "YouTube Playlists Report", headers, rows, fileName: "youtube_marketing" });
      } else {
        exportToExcel({ title: "YouTube Marketing", headers, rows, fileName: "youtube_marketing" });
      }
    }
    showToast(`${activeTab} data exported to ${format.toUpperCase()}`);
  };

  // CRUD Opens & Submits
  const openAddRecord = () => {
    if (activeTab === "Facebook") {
      setFbForm({ name: "", admin: "Admin User", followers: "0", engagementRate: "0.0%", lastPost: "Just now", status: "Active" });
      facebookTable.setIsAddOpen(true);
    } else if (activeTab === "LinkedIn") {
      setLiForm({ name: "", connections: "0", postFrequency: "3 / week", engagementRate: "0.0%", lastUpdated: "Just now", status: "Active" });
      linkedinTable.setIsAddOpen(true);
    } else {
      setYtForm({ name: "", department: "Taxation Services", totalVideos: "0", totalViews: "0", subscribers: "0", lastUpload: "Just now" });
      youtubeTable.setIsAddOpen(true);
    }
  };

  const submitAddFb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbForm.name.trim()) return;
    facebookTable.addItem({ id: String(Date.now()), department: "marketing", ...fbForm });
    facebookTable.setIsAddOpen(false);
    showToast(`Facebook page "${fbForm.name}" registered!`);
  };

  const submitAddLi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liForm.name.trim()) return;
    linkedinTable.addItem({ id: String(Date.now()), department: "marketing", ...liForm });
    linkedinTable.setIsAddOpen(false);
    showToast(`LinkedIn account "${liForm.name}" registered!`);
  };

  const submitAddYt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytForm.name.trim()) return;
    youtubeTable.addItem({ id: String(Date.now()), ...ytForm });
    youtubeTable.setIsAddOpen(false);
    showToast(`YouTube Playlist "${ytForm.name}" registered!`);
  };

  const openEditFb = (p: FacebookPage) => {
    setFbForm({ name: p.name, admin: p.admin, followers: p.followers, engagementRate: p.engagementRate, lastPost: p.lastPost, status: p.status });
    facebookTable.selectItemForAction(p, "edit");
  };

  const submitEditFb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facebookTable.selectedItem) return;
    facebookTable.updateItem({ id: facebookTable.selectedItem.id, ...fbForm });
    facebookTable.setIsEditOpen(false);
    showToast("Facebook page details updated!");
  };

  const openEditLi = (p: LinkedInPage) => {
    setLiForm({ name: p.name, connections: p.connections, postFrequency: p.postFrequency, engagementRate: p.engagementRate, lastUpdated: p.lastUpdated, status: p.status });
    linkedinTable.selectItemForAction(p, "edit");
  };

  const submitEditLi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinTable.selectedItem) return;
    linkedinTable.updateItem({ id: linkedinTable.selectedItem.id, ...liForm });
    linkedinTable.setIsEditOpen(false);
    showToast("LinkedIn page details updated!");
  };

  const openEditYt = (p: YouTubePlaylist) => {
    setYtForm({ name: p.name, department: p.department, totalVideos: p.totalVideos, totalViews: p.totalViews, subscribers: p.subscribers, lastUpload: p.lastUpload });
    youtubeTable.selectItemForAction(p, "edit");
  };

  const submitEditYt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeTable.selectedItem) return;
    youtubeTable.updateItem({ id: youtubeTable.selectedItem.id, ...ytForm });
    youtubeTable.setIsEditOpen(false);
    showToast("YouTube Playlist details updated!");
  };

  const confirmDeleteFb = () => {
    if (!facebookTable.selectedItem) return;
    facebookTable.deleteItem(facebookTable.selectedItem.id);
    showToast("Facebook page removed", "error");
  };

  const confirmDeleteLi = () => {
    if (!linkedinTable.selectedItem) return;
    linkedinTable.deleteItem(linkedinTable.selectedItem.id);
    showToast("LinkedIn account removed", "error");
  };

  const confirmDeleteYt = () => {
    if (!youtubeTable.selectedItem) return;
    youtubeTable.deleteItem(youtubeTable.selectedItem.id);
    showToast("YouTube Playlist removed", "error");
  };

  return (
    <>
      <Toast message={toastMessage} type={toastType} isOpen={toastOpen} onClose={() => setToastOpen(false)} />

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {marketingKpis.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </section>

      {/* Navigation Tabs and Quick Actions bar */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-6">
          <AmazonTab icon={Megaphone} label="Facebook" active={activeTab === "Facebook"} onClick={() => setActiveTab("Facebook")} />
          <AmazonTab icon={BriefcaseBusiness} label="LinkedIn" active={activeTab === "LinkedIn"} onClick={() => setActiveTab("LinkedIn")} />
          <AmazonTab icon={FileText} label="YouTube" active={activeTab === "YouTube"} onClick={() => setActiveTab("YouTube")} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
                  <button onClick={() => handleExport("pdf")} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                    Export to PDF
                  </button>
                  <button onClick={() => handleExport("excel")} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                    Export to Excel
                  </button>
                </div>
              </>
            )}
          </div>
          <button onClick={triggerPrint} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition shadow-sm">
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={openAddRecord}
            className="h-11 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700 transition"
          >
            <Plus size={18} className="mr-2 inline" />
            {activeTab === "Facebook" ? "Add Facebook Page" : activeTab === "LinkedIn" ? "Add LinkedIn Page" : "Add Playlist"}
          </button>
        </div>
      </section>

      {/* Main Workspace content */}
      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.75fr)]">
        <div>
          {activeTab === "Facebook" ? (
            <FacebookPageTableComponent table={facebookTable} openEdit={openEditFb} />
          ) : activeTab === "LinkedIn" ? (
            <LinkedInPageTableComponent table={linkedinTable} openEdit={openEditLi} />
          ) : (
            <YouTubePlaylistTableComponent table={youtubeTable} openEdit={openEditYt} />
          )}
        </div>
        <MarketingRightColumn platformFollowersData={platformFollowersData} totalFollowersSum={totalFollowersSum} youtubeViewsData={youtubeViewsData} youtubeTableData={youtubeTable.data} facebookTableData={facebookTable.data} linkedinTableData={linkedinTable.data} />
      </section>

      {/* CRUD MODALS & DIALOGS */}

      {/* Facebook Modal Add/Edit */}
      <Modal isOpen={facebookTable.isAddOpen} onClose={() => facebookTable.setIsAddOpen(false)} title="Onboard Facebook Page">
        <form onSubmit={submitAddFb} className="space-y-4">
          <FormField label="Page Name" value={fbForm.name} onChange={(v) => setFbForm({ ...fbForm, name: v })} placeholder="e.g. Numan Associates" required />
          <FormField label="Admin Name" value={fbForm.admin} onChange={(v) => setFbForm({ ...fbForm, admin: v })} required />
          <div className="flex gap-3">
            <FormField label="Followers Count" value={fbForm.followers} onChange={(v) => setFbForm({ ...fbForm, followers: v })} required />
            <FormField label="Engagement Rate" value={fbForm.engagementRate} onChange={(v) => setFbForm({ ...fbForm, engagementRate: v })} placeholder="3.5%" required />
          </div>
          <FormSelect label="Status" value={fbForm.status} onChange={(v) => setFbForm({ ...fbForm, status: v })} options={["Active", "Under Review", "Suspended"]} />
          <FormActions onCancel={() => facebookTable.setIsAddOpen(false)} submitLabel="Onboard Page" />
        </form>
      </Modal>
      <Modal isOpen={facebookTable.isEditOpen} onClose={() => facebookTable.setIsEditOpen(false)} title="Edit Facebook Page Details">
        <form onSubmit={submitEditFb} className="space-y-4">
          <FormField label="Page Name" value={fbForm.name} onChange={(v) => setFbForm({ ...fbForm, name: v })} required />
          <FormField label="Admin Name" value={fbForm.admin} onChange={(v) => setFbForm({ ...fbForm, admin: v })} required />
          <div className="flex gap-3">
            <FormField label="Followers Count" value={fbForm.followers} onChange={(v) => setFbForm({ ...fbForm, followers: v })} required />
            <FormField label="Engagement Rate" value={fbForm.engagementRate} onChange={(v) => setFbForm({ ...fbForm, engagementRate: v })} required />
          </div>
          <FormSelect label="Status" value={fbForm.status} onChange={(v) => setFbForm({ ...fbForm, status: v })} options={["Active", "Under Review", "Suspended"]} />
          <FormActions onCancel={() => facebookTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ViewDrawer isOpen={facebookTable.isViewOpen} onClose={() => facebookTable.setIsViewOpen(false)} title={facebookTable.selectedItem?.name || "Page Details"}>
        {facebookTable.selectedItem && (
          <div className="space-y-4">
            <DetailCard label="Page Info" items={[["Page Name", facebookTable.selectedItem.name], ["Manager/Admin", facebookTable.selectedItem.admin]]} />
            <DetailCard label="Engagement" items={[["Followers", facebookTable.selectedItem.followers], ["Engagement Rate", facebookTable.selectedItem.engagementRate], ["Last Post", facebookTable.selectedItem.lastPost]]} />
            <DetailCard label="Status" items={[["Current Status", facebookTable.selectedItem.status]]} />
          </div>
        )}
      </ViewDrawer>
      <ConfirmDialog isOpen={facebookTable.isConfirmOpen} onClose={() => facebookTable.setIsConfirmOpen(false)} onConfirm={confirmDeleteFb} title="Delete Facebook Page" message={`Remove "${facebookTable.selectedItem?.name}" from marketing database?`} />

      {/* LinkedIn Modal Add/Edit */}
      <Modal isOpen={linkedinTable.isAddOpen} onClose={() => linkedinTable.setIsAddOpen(false)} title="Onboard LinkedIn Corporate Account">
        <form onSubmit={submitAddLi} className="space-y-4">
          <FormField label="Profile/Page Name" value={liForm.name} onChange={(v) => setLiForm({ ...liForm, name: v })} placeholder="e.g. Numan Corporate Law" required />
          <div className="flex gap-3">
            <FormField label="Connections Count" value={liForm.connections} onChange={(v) => setLiForm({ ...liForm, connections: v })} required />
            <FormField label="Post Frequency" value={liForm.postFrequency} onChange={(v) => setLiForm({ ...liForm, postFrequency: v })} placeholder="5 / week" required />
          </div>
          <FormField label="Engagement Rate" value={liForm.engagementRate} onChange={(v) => setLiForm({ ...liForm, engagementRate: v })} placeholder="4.2%" required />
          <FormSelect label="Status" value={liForm.status} onChange={(v) => setLiForm({ ...liForm, status: v })} options={["Active", "Under Review", "Inactive"]} />
          <FormActions onCancel={() => linkedinTable.setIsAddOpen(false)} submitLabel="Onboard Profile" />
        </form>
      </Modal>
      <Modal isOpen={linkedinTable.isEditOpen} onClose={() => linkedinTable.setIsEditOpen(false)} title="Edit LinkedIn Details">
        <form onSubmit={submitEditLi} className="space-y-4">
          <FormField label="Profile/Page Name" value={liForm.name} onChange={(v) => setLiForm({ ...liForm, name: v })} required />
          <div className="flex gap-3">
            <FormField label="Connections Count" value={liForm.connections} onChange={(v) => setLiForm({ ...liForm, connections: v })} required />
            <FormField label="Post Frequency" value={liForm.postFrequency} onChange={(v) => setLiForm({ ...liForm, postFrequency: v })} required />
          </div>
          <FormField label="Engagement Rate" value={liForm.engagementRate} onChange={(v) => setLiForm({ ...liForm, engagementRate: v })} required />
          <FormSelect label="Status" value={liForm.status} onChange={(v) => setLiForm({ ...liForm, status: v })} options={["Active", "Under Review", "Inactive"]} />
          <FormActions onCancel={() => linkedinTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={linkedinTable.isConfirmOpen} onClose={() => linkedinTable.setIsConfirmOpen(false)} onConfirm={confirmDeleteLi} title="Delete LinkedIn Account" message={`Remove "${linkedinTable.selectedItem?.name}" from marketing database?`} />

      {/* YouTube Modal Add/Edit */}
      <Modal isOpen={youtubeTable.isAddOpen} onClose={() => youtubeTable.setIsAddOpen(false)} title="Register YouTube Playlist">
        <form onSubmit={submitAddYt} className="space-y-4">
          <FormField label="Playlist Name" value={ytForm.name} onChange={(v) => setYtForm({ ...ytForm, name: v })} placeholder="e.g. Income Tax Lectures" required />
          <FormSelect label="Department" value={ytForm.department} onChange={(v) => setYtForm({ ...ytForm, department: v })} options={["Taxation Services", "Law Services", "Immigration Services", "Academic Services", "Training Services", "General"]} />
          <div className="flex gap-3">
            <FormField label="Total Videos" value={ytForm.totalVideos} onChange={(v) => setYtForm({ ...ytForm, totalVideos: v })} required />
            <FormField label="Total Views" value={ytForm.totalViews} onChange={(v) => setYtForm({ ...ytForm, totalViews: v })} required />
          </div>
          <FormField label="Subscribers" value={ytForm.subscribers} onChange={(v) => setYtForm({ ...ytForm, subscribers: v })} required />
          <FormActions onCancel={() => youtubeTable.setIsAddOpen(false)} submitLabel="Register Playlist" />
        </form>
      </Modal>
      <Modal isOpen={youtubeTable.isEditOpen} onClose={() => youtubeTable.setIsEditOpen(false)} title="Edit Playlist Details">
        <form onSubmit={submitEditYt} className="space-y-4">
          <FormField label="Playlist Name" value={ytForm.name} onChange={(v) => setYtForm({ ...ytForm, name: v })} required />
          <FormSelect label="Department" value={ytForm.department} onChange={(v) => setYtForm({ ...ytForm, department: v })} options={["Taxation Services", "Law Services", "Immigration Services", "Academic Services", "Training Services", "General"]} />
          <div className="flex gap-3">
            <FormField label="Total Videos" value={ytForm.totalVideos} onChange={(v) => setYtForm({ ...ytForm, totalVideos: v })} required />
            <FormField label="Total Views" value={ytForm.totalViews} onChange={(v) => setYtForm({ ...ytForm, totalViews: v })} required />
          </div>
          <FormField label="Subscribers" value={ytForm.subscribers} onChange={(v) => setYtForm({ ...ytForm, subscribers: v })} required />
          <FormActions onCancel={() => youtubeTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={youtubeTable.isConfirmOpen} onClose={() => youtubeTable.setIsConfirmOpen(false)} onConfirm={confirmDeleteYt} title="Delete Playlist" message={`Remove playlist "${youtubeTable.selectedItem?.name}"?`} />
    </>
  );
}

// Subcomponents
function AmazonTab({
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

// Table views
function FacebookPageTableComponent({ table, openEdit }: { table: ReturnType<typeof useTable<FacebookPage>>; openEdit: (p: FacebookPage) => void }) {
  const columns = ["#", "Facebook Page", "Admin", "Followers", "Engagement Rate", "Last Post", "Status", "Actions"];
  return (
    <Card
      title="Facebook Page Management"
      subtext="The Marketing Services module centralizes all digital marketing operations including social media management, content scheduling, campaign tracking, and analytics."
      action={<TableActions searchQuery={table.searchQuery} onSearchChange={table.setSearchQuery} searchPlaceholder="Search pages..." columns={columns} visibleColumns={table.visibleColumns} onToggleColumn={(col: string) => table.setVisibleColumns((c: Record<string, boolean>) => ({ ...c, [col]: c[col] === false }))} />}
    >
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[940px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((h) => table.visibleColumns[h] !== false && <th key={h} className="px-4 py-3 font-extrabold">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.paginatedData.map((row, index) => (
              <tr key={row.id} className="text-sm hover:bg-slate-50 transition duration-100">
                {table.visibleColumns["#"] !== false && <td className="px-4 py-3 font-extrabold text-slate-400">{(table.currentPage - 1) * table.pageSize + index + 1}</td>}
                {table.visibleColumns["Facebook Page"] !== false && <td className="px-4 py-3 font-extrabold text-slate-950">{row.name}</td>}
                {table.visibleColumns["Admin"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.admin}</td>}
                {table.visibleColumns["Followers"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.followers}</td>}
                {table.visibleColumns["Engagement Rate"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.engagementRate}</td>}
                {table.visibleColumns["Last Post"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.lastPost}</td>}
                {table.visibleColumns["Status"] !== false && <td className="px-4 py-3"><AmazonPill value={row.status} /></td>}
                {table.visibleColumns["Actions"] !== false && (
                  <td className="px-4 py-3">
                    <ActionIcons onView={() => table.selectItemForAction(row, "view")} onEdit={() => openEdit(row)} onDelete={() => table.selectItemForAction(row, "delete")} />
                  </td>
                )}
              </tr>
            ))}
            {table.paginatedData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm font-bold text-slate-400 bg-slate-50/20">
                  No pages. Click "+ Add Facebook Page" to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginatedTableFooter currentPage={table.currentPage} totalPages={table.totalPages} pageSize={table.pageSize} totalItems={table.filteredData.length} onPageChange={table.setCurrentPage} onPageSizeChange={table.setPageSize} />
    </Card>
  );
}

function LinkedInPageTableComponent({ table, openEdit }: { table: ReturnType<typeof useTable<LinkedInPage>>; openEdit: (p: LinkedInPage) => void }) {
  const columns = ["#", "Profile / Page", "Connections", "Post Frequency", "Engagement Rate", "Last Updated", "Status", "Actions"];
  return (
    <Card
      title="LinkedIn Management"
      subtext="Manage LinkedIn profiles and company pages, track connections, post frequency, and engagement performance."
      action={<TableActions searchQuery={table.searchQuery} onSearchChange={table.setSearchQuery} searchPlaceholder="Search profiles..." columns={columns} visibleColumns={table.visibleColumns} onToggleColumn={(col: string) => table.setVisibleColumns((c: Record<string, boolean>) => ({ ...c, [col]: c[col] === false }))} />}
    >
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((h) => table.visibleColumns[h] !== false && <th key={h} className="px-4 py-3 font-extrabold">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.paginatedData.map((row, index) => (
              <tr key={row.id} className="text-sm hover:bg-slate-50 transition duration-100">
                {table.visibleColumns["#"] !== false && <td className="px-4 py-3 font-extrabold text-slate-400">{(table.currentPage - 1) * table.pageSize + index + 1}</td>}
                {table.visibleColumns["Profile / Page"] !== false && <td className="px-4 py-3 font-extrabold text-slate-950">{row.name}</td>}
                {table.visibleColumns["Connections"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.connections}</td>}
                {table.visibleColumns["Post Frequency"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.postFrequency}</td>}
                {table.visibleColumns["Engagement Rate"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.engagementRate}</td>}
                {table.visibleColumns["Last Updated"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.lastUpdated}</td>}
                {table.visibleColumns["Status"] !== false && <td className="px-4 py-3"><AmazonPill value={row.status} /></td>}
                {table.visibleColumns["Actions"] !== false && (
                  <td className="px-4 py-3">
                    <ActionIcons onEdit={() => openEdit(row)} onDelete={() => table.selectItemForAction(row, "delete")} />
                  </td>
                )}
              </tr>
            ))}
            {table.paginatedData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm font-bold text-slate-400 bg-slate-50/20">
                  No profiles. Click "+ Add LinkedIn Page" to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginatedTableFooter currentPage={table.currentPage} totalPages={table.totalPages} pageSize={table.pageSize} totalItems={table.filteredData.length} onPageChange={table.setCurrentPage} onPageSizeChange={table.setPageSize} />
    </Card>
  );
}

function YouTubePlaylistTableComponent({ table, openEdit }: { table: ReturnType<typeof useTable<YouTubePlaylist>>; openEdit: (p: YouTubePlaylist) => void }) {
  const columns = ["#", "Playlist Name", "Department", "Total Videos", "Total Views", "Subscribers", "Last Upload", "Actions"];
  return (
    <Card
      title="YouTube Playlist Management"
      subtext="Track YouTube playlists for each department, monitor video counts, total views, subscriber growth, and latest upload activity."
      action={<TableActions searchQuery={table.searchQuery} onSearchChange={table.setSearchQuery} searchPlaceholder="Search playlists..." columns={columns} visibleColumns={table.visibleColumns} onToggleColumn={(col: string) => table.setVisibleColumns((c: Record<string, boolean>) => ({ ...c, [col]: c[col] === false }))} />}
    >
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((h) => table.visibleColumns[h] !== false && <th key={h} className="px-4 py-3 font-extrabold">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.paginatedData.map((row, index) => (
              <tr key={row.id} className="text-sm hover:bg-slate-50 transition duration-100">
                {table.visibleColumns["#"] !== false && <td className="px-4 py-3 font-extrabold text-slate-400">{(table.currentPage - 1) * table.pageSize + index + 1}</td>}
                {table.visibleColumns["Playlist Name"] !== false && <td className="px-4 py-3 font-extrabold text-slate-950">{row.name}</td>}
                {table.visibleColumns["Department"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.department}</td>}
                {table.visibleColumns["Total Videos"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.totalVideos}</td>}
                {table.visibleColumns["Total Views"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.totalViews}</td>}
                {table.visibleColumns["Subscribers"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.subscribers}</td>}
                {table.visibleColumns["Last Upload"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.lastUpload}</td>}
                {table.visibleColumns["Actions"] !== false && (
                  <td className="px-4 py-3">
                    <ActionIcons onEdit={() => openEdit(row)} onDelete={() => table.selectItemForAction(row, "delete")} />
                  </td>
                )}
              </tr>
            ))}
            {table.paginatedData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm font-bold text-slate-400 bg-slate-50/20">
                  No playlists. Click "+ Add Playlist" to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginatedTableFooter currentPage={table.currentPage} totalPages={table.totalPages} pageSize={table.pageSize} totalItems={table.filteredData.length} onPageChange={table.setCurrentPage} onPageSizeChange={table.setPageSize} />
    </Card>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  const styles: Record<string, { bg: string; label: string }> = {
    Facebook: { bg: "#1877F2", label: "f" },
    LinkedIn: { bg: "#0A66C2", label: "in" },
    YouTube: { bg: "#FF0000", label: "play" },
  };
  const detail = styles[platform] ?? { bg: "#64748b", label: platform.slice(0, 1) };
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
      style={{ backgroundColor: detail.bg }}
    >
      {detail.label}
    </span>
  );
}

function MarketingRightColumn({
  platformFollowersData,
  totalFollowersSum,
  youtubeViewsData,
  youtubeTableData,
  facebookTableData,
  linkedinTableData,
}: {
  platformFollowersData: { name: string; value: number; color: string }[];
  totalFollowersSum: number;
  youtubeViewsData: { name: string; views: number }[];
  youtubeTableData: YouTubePlaylist[];
  facebookTableData: FacebookPage[];
  linkedinTableData: LinkedInPage[];
}) {
  const computedTopMarketingPosts = [
    ...facebookTableData.map((p) => ({
      platform: "Facebook",
      title: p.name,
      meta: `Followers: ${p.followers}`,
      metric: `Engagement ${p.engagementRate}`,
      tone: "High",
      sortValue: parseInt(p.followers.replace(/[^\d]/g, "")) || 0,
    })),
    ...linkedinTableData.map((p) => ({
      platform: "LinkedIn",
      title: p.name,
      meta: `Connections: ${p.connections}`,
      metric: `Engagement ${p.engagementRate}`,
      tone: "Medium",
      sortValue: parseInt(p.connections.replace(/[^\d]/g, "")) || 0,
    })),
    ...youtubeTableData.map((p) => ({
      platform: "YouTube",
      title: p.name,
      meta: `Views: ${p.totalViews}`,
      metric: `Subscribers ${p.subscribers}`,
      tone: "High",
      sortValue: parseInt(p.totalViews.replace(/[^\d]/g, "")) || 0,
    })),
  ]
    .sort((a, b) => b.sortValue - a.sortValue)
    .slice(0, 3)
    .map(({ sortValue, ...rest }) => rest);

  const topMarketingPosts = computedTopMarketingPosts;

  const scheduledPosts = [
    ...facebookTableData.map((p) => [p.lastPost ?? "Pending", "Facebook", `Plan update for ${p.name}`, p.admin] as const),
    ...linkedinTableData.map((p) => [p.lastUpdated ?? "Pending", "LinkedIn", `Schedule post for ${p.name}`, p.name] as const),
    ...youtubeTableData.map((p) => [p.lastUpload ?? "Pending", "YouTube", `Publish ${p.name}`, p.department] as const),
  ].slice(0, 3);

  return (
    <aside className="space-y-6">
      <Card title="Platform Followers Distribution">
        <div className="p-5">
          {totalFollowersSum > 0 ? (
            <>
              <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={platformFollowersData} innerRadius={72} outerRadius={104} paddingAngle={3} dataKey="value">
                      {platformFollowersData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Followers"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-xl font-extrabold text-slate-950">{totalFollowersSum.toLocaleString()}</p>
                  <p className="text-xs font-bold text-slate-500">Total Followers</p>
                </div>
              </div>
              <ChartLegend items={platformFollowersData.map((item) => ({ ...item, pct: totalFollowersSum > 0 ? `${Math.round((item.value / totalFollowersSum) * 100)}%` : "0%" }))} />
            </>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm font-bold text-slate-400">
              No followers logged yet.
            </div>
          )}
        </div>
      </Card>

      <Card
        title="Top Performing Posts"
        action={<span className="text-xs font-bold text-slate-400">This Month</span>}
      >
        <div className="divide-y divide-slate-100">
          {topMarketingPosts.length > 0 ? (
            topMarketingPosts.map(({ platform, title, meta, metric, tone }) => (
              <div key={title} className="grid grid-cols-[32px_minmax(0,1fr)_auto] gap-3 px-5 py-4">
                <PlatformIcon platform={platform} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-900">{title}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{meta}</p>
                </div>
                <EngagementBadge tone={tone} label={metric} />
              </div>
            ))
          ) : (
            <div className="px-5 py-12 text-center text-sm font-bold text-slate-400">
              No marketing posts available yet.
            </div>
          )}
        </div>
      </Card>

      <Card title="YouTube Performance Overview">
        <div className="space-y-3 p-5">
          {[
            ["Total Playlists", String(youtubeTableData.length)],
            ["Total Videos", String(youtubeTableData.reduce((sum, p) => sum + (parseInt(p.totalVideos.replace(/[^\d]/g, "")) || 0), 0))],
            ["Total Views", String(youtubeTableData.reduce((sum, p) => sum + (parseInt(p.totalViews.replace(/[^\d]/g, "")) || 0), 0).toLocaleString())],
            ["Total Subscribers", String(youtubeTableData.reduce((sum, p) => sum + (parseInt(p.subscribers.replace(/[^\d]/g, "")) || 0), 0).toLocaleString())],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
              <span className="font-bold text-slate-600">{label}</span>
              <span className="font-extrabold text-slate-950">{value}</span>
            </div>
          ))}
          {youtubeViewsData.some((v) => v.views > 0) && (
            <div className="h-44 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={youtubeViewsData}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis hide />
                  <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Views"]} />
                  <Bar dataKey="views" fill="#FF0000" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </Card>

      <Card
        title="Scheduled Posts"
        action={<span className="text-xs font-bold text-slate-400">Pipeline</span>}
      >
        <div className="divide-y divide-slate-100">
          {scheduledPosts.length > 0 ? (
            scheduledPosts.map(([date, platform, title, page]) => (
              <div key={`${date}-${title}`} className="grid grid-cols-[48px_32px_minmax(0,1fr)] gap-3 px-5 py-4">
                <div className="text-center">
                  <p className="text-2xl font-extrabold leading-none text-slate-950">{date}</p>
                  <p className="mt-1 text-xs font-extrabold text-slate-400">JUN</p>
                </div>
                <PlatformIcon platform={platform} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-900">{title}</p>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-500">{page}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-12 text-center text-sm font-bold text-slate-400">
              No scheduled marketing posts found.
            </div>
          )}
        </div>
      </Card>
    </aside>
  );
}
