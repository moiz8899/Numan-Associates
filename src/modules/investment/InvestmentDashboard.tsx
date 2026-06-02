import { useState, useMemo } from "react";
import {
  FileBarChart,
  BriefcaseBusiness,
  DollarSign,
  FileText,
  Target,
  Users,
  Calendar,
  Plus,
  Download,
  Printer,
  ChevronDown,
  WalletCards,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { Card } from "../../components/shared/Card";
import { KpiCard } from "../../components/shared/KpiCard";
import {
  PriorityBadge,
  ProgressBar,
  InvestmentStatusBadge,
  AmazonPill,
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

// Data Types
interface PortfolioRecord {
  id: string;
  clientName: string;
  portfolioType: string;
  totalInvestment: string;
  currentValue: string;
  roiPct: string;
  status: string;
}

interface ManagementRecord {
  id: string;
  portfolioName: string;
  assetClasses: string;
  totalValue: string;
  manager: string;
  lastReview: string;
  nextReview: string;
}

interface ProfitRecord {
  id: string;
  clientName: string;
  monthlyProfit: string;
  quarterlyProfit: string;
  annualProfit: string;
  ytdTotal: string;
  trend: string;
}

interface ReportRecord {
  id: string;
  reportTitle: string;
  period: string;
  generatedOn: string;
  preparedBy: string;
  deliveryStatus: string;
}

interface GoalRecord {
  id: string;
  clientName: string;
  goalDescription: string;
  targetAmount: string;
  currentProgress: string;
  targetDate: string;
  status: string;
}

export function InvestmentDashboard() {
  const [activeTab, setActiveTab] = useState("Client Portfolios");

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
  const portfoliosTable = useTable<PortfolioRecord>({
    initialData: [],
    searchFields: ["clientName", "portfolioType", "status"],
    defaultPageSize: 5,
    supabaseTable: "clients",
    supabaseFilter: { column: "department", value: "investment" },
  });

  const managementTable = useTable<ManagementRecord>({
    initialData: [],
    searchFields: ["portfolioName", "assetClasses", "manager"],
    defaultPageSize: 5,
  });

  const profitTable = useTable<ProfitRecord>({
    initialData: [],
    searchFields: ["clientName", "trend"],
    defaultPageSize: 5,
  });

  const reportsTable = useTable<ReportRecord>({
    initialData: [],
    searchFields: ["reportTitle", "preparedBy", "deliveryStatus"],
    defaultPageSize: 5,
    supabaseTable: "reports",
    supabaseFilter: { column: "category", value: "Investment" },
  });

  const goalsTable = useTable<GoalRecord>({
    initialData: [],
    searchFields: ["clientName", "goalDescription", "status"],
    defaultPageSize: 5,
    supabaseTable: "goals",
    supabaseFilter: { column: "department", value: "investment" },
  });

  // Export dropdown
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Form States
  const [portfolioForm, setPortfolioForm] = useState<Omit<PortfolioRecord, "id">>({
    clientName: "",
    portfolioType: "Mutual Funds",
    totalInvestment: "PKR 0",
    currentValue: "PKR 0",
    roiPct: "0.0%",
    status: "Active",
  });

  const [managementForm, setManagementForm] = useState<Omit<ManagementRecord, "id">>({
    portfolioName: "",
    assetClasses: "Equities / Fixed Income",
    totalValue: "PKR 0",
    manager: "Finance Manager",
    lastReview: "Today",
    nextReview: "1 Month",
  });

  const [profitForm, setProfitForm] = useState<Omit<ProfitRecord, "id">>({
    clientName: "",
    monthlyProfit: "PKR 0",
    quarterlyProfit: "PKR 0",
    annualProfit: "PKR 0",
    ytdTotal: "PKR 0",
    trend: "up",
  });

  const [reportForm, setReportForm] = useState<Omit<ReportRecord, "id">>({
    reportTitle: "",
    period: "May 2024",
    generatedOn: "Today",
    preparedBy: "Admin User",
    deliveryStatus: "Completed",
  });

  const [goalForm, setGoalForm] = useState<Omit<GoalRecord, "id">>({
    clientName: "",
    goalDescription: "",
    targetAmount: "PKR 0",
    currentProgress: "0%",
    targetDate: "",
    status: "Active",
  });

  // Dynamic KPIs
  const totalClients = portfoliosTable.data.length;
  const totalAum = portfoliosTable.data.reduce(
    (sum, p) => sum + (parseInt(p.currentValue.replace(/[^\d]/g, "")) || 0),
    0
  );
  const totalRevenue = profitTable.data.reduce(
    (sum, p) => sum + (parseInt(p.ytdTotal.replace(/[^\d]/g, "")) || 0),
    0
  );
  const pendingPayments = profitTable.data.filter(
    (p) => parseInt(p.monthlyProfit.replace(/[^\d]/g, "")) === 0
  ).length;

  const avgRoi = useMemo(() => {
    if (portfoliosTable.data.length === 0) return 0;
    const totalRoi = portfoliosTable.data.reduce(
      (sum, p) => sum + (parseFloat(p.roiPct.replace(/[^\d.-]/g, "")) || 0),
      0
    );
    return totalRoi / portfoliosTable.data.length;
  }, [portfoliosTable.data]);

  const investmentKpis = [
    { label: "Total Clients", value: String(totalClients), change: "\u2014", trend: "positive", icon: Users, color: "#7c3aed", bg: "bg-violet-50" },
    { label: "Total AUM", value: `PKR ${totalAum.toLocaleString()}`, change: "\u2014", trend: "positive", icon: FileBarChart, color: "#1a73e8", bg: "bg-blue-50" },
    { label: "Total Revenue", value: `PKR ${totalRevenue.toLocaleString()}`, change: "\u2014", trend: "positive", icon: DollarSign, color: "#16a34a", bg: "bg-green-50" },
    { label: "Pending Payments", value: String(pendingPayments), change: "\u2014", trend: "negative", icon: WalletCards, color: "#f97316", bg: "bg-orange-50" },
    { label: "Avg Portfolio ROI", value: `${avgRoi.toFixed(1)}%`, change: "\u2014", trend: "positive", icon: TrendingUp, color: "#0d9488", bg: "bg-teal-50" },
  ];

  // Right Column Dynamic Data
  const portfolioDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    portfoliosTable.data.forEach((p) => {
      counts[p.portfolioType] = (counts[p.portfolioType] || 0) + 1;
    });
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  }, [portfoliosTable.data]);

  const topPortfolioTypes = useMemo(() => {
    const types: Record<string, number> = {};
    portfoliosTable.data.forEach((p) => {
      const aum = parseInt(p.currentValue.replace(/[^\d]/g, "")) || 0;
      types[p.portfolioType] = (types[p.portfolioType] || 0) + aum;
    });
    const total = Object.values(types).reduce((s, v) => s + v, 0);
    return Object.entries(types).map(([label, rev]) => {
      const pct = total > 0 ? `${Math.round((rev / total) * 100)}%` : "0%";
      const width = total > 0 ? `${(rev / total) * 100}%` : "0%";
      return [label, `PKR ${rev.toLocaleString()}`, pct, width];
    });
  }, [portfoliosTable.data]);

  // Export
  const handleExport = (format: "pdf" | "excel") => {
    setShowExportMenu(false);
    if (activeTab === "Client Portfolios") {
      const headers = ["#", "Client Name", "Portfolio Type", "Total Investment", "Current Value", "ROI %", "Status"];
      const rows = portfoliosTable.data.map((p, i) => [String(i + 1), p.clientName, p.portfolioType, p.totalInvestment, p.currentValue, p.roiPct, p.status]);
      format === "pdf"
        ? exportToPDF({ title: "Client Portfolios Report", headers, rows, fileName: "client_portfolios" })
        : exportToExcel({ title: "Client Portfolios", headers, rows, fileName: "client_portfolios" });
    } else if (activeTab === "Portfolio Management") {
      const headers = ["#", "Portfolio Name", "Asset Classes", "Total Value", "Manager", "Last Review", "Next Review"];
      const rows = managementTable.data.map((m, i) => [String(i + 1), m.portfolioName, m.assetClasses, m.totalValue, m.manager, m.lastReview, m.nextReview]);
      format === "pdf"
        ? exportToPDF({ title: "Portfolio Management Report", headers, rows, fileName: "portfolio_management" })
        : exportToExcel({ title: "Portfolio Management", headers, rows, fileName: "portfolio_management" });
    } else if (activeTab === "Profit Tracking") {
      const headers = ["#", "Client Name", "Monthly Profit", "Quarterly Profit", "Annual Profit", "YTD Total", "Trend"];
      const rows = profitTable.data.map((p, i) => [String(i + 1), p.clientName, p.monthlyProfit, p.quarterlyProfit, p.annualProfit, p.ytdTotal, p.trend]);
      format === "pdf"
        ? exportToPDF({ title: "Profit Tracking Report", headers, rows, fileName: "profit_tracking" })
        : exportToExcel({ title: "Profit Tracking", headers, rows, fileName: "profit_tracking" });
    } else if (activeTab === "Financial Reports") {
      const headers = ["#", "Report Title", "Period", "Generated On", "Prepared By", "Delivery Status"];
      const rows = reportsTable.data.map((r, i) => [String(i + 1), r.reportTitle, r.period, r.generatedOn, r.preparedBy, r.deliveryStatus]);
      format === "pdf"
        ? exportToPDF({ title: "Financial Reports Report", headers, rows, fileName: "financial_reports" })
        : exportToExcel({ title: "Financial Reports", headers, rows, fileName: "financial_reports" });
    } else {
      const headers = ["#", "Client Name", "Goal Description", "Target Amount", "Current Progress", "Target Date", "Status"];
      const rows = goalsTable.data.map((g, i) => [String(i + 1), g.clientName, g.goalDescription, g.targetAmount, g.currentProgress, g.targetDate, g.status]);
      format === "pdf"
        ? exportToPDF({ title: "Investment Goals Report", headers, rows, fileName: "investment_goals" })
        : exportToExcel({ title: "Investment Goals", headers, rows, fileName: "investment_goals" });
    }
    showToast(`${activeTab} exported to ${format.toUpperCase()}`);
  };

  // Portfolio CRUD
  const openAddPortfolio = () => {
    setPortfolioForm({ clientName: "", portfolioType: "Mutual Funds", totalInvestment: "PKR 0", currentValue: "PKR 0", roiPct: "0.0%", status: "Active" });
    portfoliosTable.setIsAddOpen(true);
  };
  const submitAddPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioForm.clientName.trim()) return;
    portfoliosTable.addItem({ id: String(Date.now()), ...portfolioForm });
    portfoliosTable.setIsAddOpen(false);
    showToast(`Portfolio for ${portfolioForm.clientName} added!`);
  };
  const openEditPortfolio = (p: PortfolioRecord) => {
    setPortfolioForm({ clientName: p.clientName, portfolioType: p.portfolioType, totalInvestment: p.totalInvestment, currentValue: p.currentValue, roiPct: p.roiPct, status: p.status });
    portfoliosTable.selectItemForAction(p, "edit");
  };
  const submitEditPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfoliosTable.selectedItem) return;
    portfoliosTable.updateItem({ id: portfoliosTable.selectedItem.id, ...portfolioForm });
    portfoliosTable.setIsEditOpen(false);
    showToast("Portfolio details updated!");
  };
  const confirmDeletePortfolio = () => {
    if (!portfoliosTable.selectedItem) return;
    portfoliosTable.deleteItem(portfoliosTable.selectedItem.id);
    showToast("Portfolio removed", "error");
  };

  // Management CRUD
  const openAddManagement = () => {
    setManagementForm({ portfolioName: "", assetClasses: "Equities / Fixed Income", totalValue: "PKR 0", manager: "Finance Manager", lastReview: "Today", nextReview: "1 Month" });
    managementTable.setIsAddOpen(true);
  };
  const submitAddManagement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managementForm.portfolioName.trim()) return;
    managementTable.addItem({ id: String(Date.now()), ...managementForm });
    managementTable.setIsAddOpen(false);
    showToast("Managed portfolio added!");
  };
  const openEditManagement = (m: ManagementRecord) => {
    setManagementForm({ portfolioName: m.portfolioName, assetClasses: m.assetClasses, totalValue: m.totalValue, manager: m.manager, lastReview: m.lastReview, nextReview: m.nextReview });
    managementTable.selectItemForAction(m, "edit");
  };
  const submitEditManagement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managementTable.selectedItem) return;
    managementTable.updateItem({ id: managementTable.selectedItem.id, ...managementForm });
    managementTable.setIsEditOpen(false);
    showToast("Portfolio management updated!");
  };

  // Profit CRUD
  const openAddProfit = () => {
    setProfitForm({ clientName: "", monthlyProfit: "PKR 0", quarterlyProfit: "PKR 0", annualProfit: "PKR 0", ytdTotal: "PKR 0", trend: "up" });
    profitTable.setIsAddOpen(true);
  };
  const submitAddProfit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profitForm.clientName.trim()) return;
    profitTable.addItem({ id: String(Date.now()), ...profitForm });
    profitTable.setIsAddOpen(false);
    showToast("Profit tracking registered!");
  };
  const openEditProfit = (p: ProfitRecord) => {
    setProfitForm({ clientName: p.clientName, monthlyProfit: p.monthlyProfit, quarterlyProfit: p.quarterlyProfit, annualProfit: p.annualProfit, ytdTotal: p.ytdTotal, trend: p.trend });
    profitTable.selectItemForAction(p, "edit");
  };
  const submitEditProfit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profitTable.selectedItem) return;
    profitTable.updateItem({ id: profitTable.selectedItem.id, ...profitForm });
    profitTable.setIsEditOpen(false);
    showToast("Profit tracking updated!");
  };

  // Report CRUD
  const openAddReport = () => {
    setReportForm({ reportTitle: "", period: "May 2024", generatedOn: "Today", preparedBy: "Admin User", deliveryStatus: "Completed" });
    reportsTable.setIsAddOpen(true);
  };
  const submitAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.reportTitle.trim()) return;
    reportsTable.addItem({ id: String(Date.now()), ...reportForm });
    reportsTable.setIsAddOpen(false);
    showToast("Report generated!");
  };
  const openEditReport = (r: ReportRecord) => {
    setReportForm({ reportTitle: r.reportTitle, period: r.period, generatedOn: r.generatedOn, preparedBy: r.preparedBy, deliveryStatus: r.deliveryStatus });
    reportsTable.selectItemForAction(r, "edit");
  };
  const submitEditReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportsTable.selectedItem) return;
    reportsTable.updateItem({ id: reportsTable.selectedItem.id, ...reportForm });
    reportsTable.setIsEditOpen(false);
    showToast("Report updated!");
  };

  // Goal CRUD
  const openAddGoal = () => {
    setGoalForm({ clientName: "", goalDescription: "", targetAmount: "PKR 0", currentProgress: "0%", targetDate: "", status: "Active" });
    goalsTable.setIsAddOpen(true);
  };
  const submitAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.clientName.trim()) return;
    goalsTable.addItem({ id: String(Date.now()), ...goalForm });
    goalsTable.setIsAddOpen(false);
    showToast("Goal registered!");
  };
  const openEditGoal = (g: GoalRecord) => {
    setGoalForm({ clientName: g.clientName, goalDescription: g.goalDescription, targetAmount: g.targetAmount, currentProgress: g.currentProgress, targetDate: g.targetDate, status: g.status });
    goalsTable.selectItemForAction(g, "edit");
  };
  const submitEditGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalsTable.selectedItem) return;
    goalsTable.updateItem({ id: goalsTable.selectedItem.id, ...goalForm });
    goalsTable.setIsEditOpen(false);
    showToast("Goal details updated!");
  };

  const portfolioTypeOptions = [
    "Mutual Funds",
    "Stocks & Equities",
    "Fixed Income",
    "Real Estate Fund",
    "Balanced Growth",
    "Aggressive Growth",
  ];

  return (
    <>
      <Toast message={toastMessage} type={toastType} isOpen={toastOpen} onClose={() => setToastOpen(false)} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {investmentKpis.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-6">
          <Tab
            icon={FileBarChart}
            label="Client Portfolios"
            active={activeTab === "Client Portfolios"}
            onClick={() => setActiveTab("Client Portfolios")}
          />
          <Tab
            icon={BriefcaseBusiness}
            label="Portfolio Management"
            active={activeTab === "Portfolio Management"}
            onClick={() => setActiveTab("Portfolio Management")}
          />
          <Tab
            icon={DollarSign}
            label="Profit Tracking"
            active={activeTab === "Profit Tracking"}
            onClick={() => setActiveTab("Profit Tracking")}
          />
          <Tab
            icon={FileText}
            label="Financial Reports"
            active={activeTab === "Financial Reports"}
            onClick={() => setActiveTab("Financial Reports")}
          />
          <Tab
            icon={Target}
            label="Investment Goals"
            active={activeTab === "Investment Goals"}
            onClick={() => setActiveTab("Investment Goals")}
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
              activeTab === "Client Portfolios"
                ? openAddPortfolio
                : activeTab === "Portfolio Management"
                ? openAddManagement
                : activeTab === "Profit Tracking"
                ? openAddProfit
                : activeTab === "Financial Reports"
                ? openAddReport
                : openAddGoal
            }
            className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            {activeTab === "Financial Reports"
              ? "Generate Report"
              : activeTab === "Investment Goals"
              ? "Add Goal"
              : "Add Portfolio"}
          </button>
        </div>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.75fr)]">
        <div>
          {activeTab === "Client Portfolios" ? (
            <CrudTable type="portfolio" table={portfoliosTable} openEdit={openEditPortfolio} />
          ) : activeTab === "Portfolio Management" ? (
            <CrudTable type="management" table={managementTable} openEdit={openEditManagement} />
          ) : activeTab === "Profit Tracking" ? (
            <CrudTable type="profit" table={profitTable} openEdit={openEditProfit} />
          ) : activeTab === "Financial Reports" ? (
            <CrudTable type="report" table={reportsTable} openEdit={openEditReport} />
          ) : (
            <CrudTable type="goal" table={goalsTable} openEdit={openEditGoal} />
          )}
        </div>
        <InvestmentRightColumn
          portfolioDistribution={portfolioDistribution}
          totalAum={totalAum}
          topPortfolioTypes={topPortfolioTypes}
          reviewsData={managementTable.data}
        />
      </section>

      {/* Portfolio Modals */}
      <Modal isOpen={portfoliosTable.isAddOpen} onClose={() => portfoliosTable.setIsAddOpen(false)} title="Add Client Portfolio">
        <form onSubmit={submitAddPortfolio} className="space-y-4">
          <FormField label="Client Name" value={portfolioForm.clientName} onChange={(v) => setPortfolioForm({ ...portfolioForm, clientName: v })} placeholder="e.g. Asif Ali" required />
          <FormSelect label="Portfolio Type" value={portfolioForm.portfolioType} onChange={(v) => setPortfolioForm({ ...portfolioForm, portfolioType: v })} options={portfolioTypeOptions} />
          <div className="flex gap-3">
            <FormField label="Total Investment" value={portfolioForm.totalInvestment} onChange={(v) => setPortfolioForm({ ...portfolioForm, totalInvestment: v })} placeholder="PKR 0" required />
            <FormField label="Current Value" value={portfolioForm.currentValue} onChange={(v) => setPortfolioForm({ ...portfolioForm, currentValue: v })} placeholder="PKR 0" required />
          </div>
          <FormField label="ROI %" value={portfolioForm.roiPct} onChange={(v) => setPortfolioForm({ ...portfolioForm, roiPct: v })} placeholder="e.g. +15.5%" required />
          <FormSelect label="Status" value={portfolioForm.status} onChange={(v) => setPortfolioForm({ ...portfolioForm, status: v })} options={["Active", "Under Review", "At Risk"]} />
          <FormActions onCancel={() => portfoliosTable.setIsAddOpen(false)} submitLabel="Save Portfolio" />
        </form>
      </Modal>
      <Modal isOpen={portfoliosTable.isEditOpen} onClose={() => portfoliosTable.setIsEditOpen(false)} title="Edit Client Portfolio">
        <form onSubmit={submitEditPortfolio} className="space-y-4">
          <FormField label="Client Name" value={portfolioForm.clientName} onChange={(v) => setPortfolioForm({ ...portfolioForm, clientName: v })} required />
          <FormSelect label="Portfolio Type" value={portfolioForm.portfolioType} onChange={(v) => setPortfolioForm({ ...portfolioForm, portfolioType: v })} options={portfolioTypeOptions} />
          <div className="flex gap-3">
            <FormField label="Total Investment" value={portfolioForm.totalInvestment} onChange={(v) => setPortfolioForm({ ...portfolioForm, totalInvestment: v })} required />
            <FormField label="Current Value" value={portfolioForm.currentValue} onChange={(v) => setPortfolioForm({ ...portfolioForm, currentValue: v })} required />
          </div>
          <FormField label="ROI %" value={portfolioForm.roiPct} onChange={(v) => setPortfolioForm({ ...portfolioForm, roiPct: v })} required />
          <FormSelect label="Status" value={portfolioForm.status} onChange={(v) => setPortfolioForm({ ...portfolioForm, status: v })} options={["Active", "Under Review", "At Risk"]} />
          <FormActions onCancel={() => portfoliosTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ViewDrawer isOpen={portfoliosTable.isViewOpen} onClose={() => portfoliosTable.setIsViewOpen(false)} title={portfoliosTable.selectedItem?.clientName || "Portfolio"}>
        {portfoliosTable.selectedItem ? (
          <div className="space-y-4">
            <DetailCard label="Portfolio Overview" items={[["Client", portfoliosTable.selectedItem.clientName], ["Type", portfoliosTable.selectedItem.portfolioType]]} />
            <DetailCard label="Investment Metrics" items={[["Total Invested", portfoliosTable.selectedItem.totalInvestment], ["Current Value", portfoliosTable.selectedItem.currentValue], ["ROI", portfoliosTable.selectedItem.roiPct]]} />
            <DetailCard label="Status" items={[["Current Status", portfoliosTable.selectedItem.status]]} />
          </div>
        ) : null}
      </ViewDrawer>
      <ConfirmDialog isOpen={portfoliosTable.isConfirmOpen} onClose={() => portfoliosTable.setIsConfirmOpen(false)} onConfirm={confirmDeletePortfolio} title="Delete Portfolio" message={`Remove portfolio for ${portfoliosTable.selectedItem?.clientName}?`} />

      {/* Management Modals */}
      <Modal isOpen={managementTable.isAddOpen} onClose={() => managementTable.setIsAddOpen(false)} title="Add Managed Portfolio">
        <form onSubmit={submitAddManagement} className="space-y-4">
          <FormField label="Portfolio Name" value={managementForm.portfolioName} onChange={(v) => setManagementForm({ ...managementForm, portfolioName: v })} placeholder="e.g. BlueChip Equities" required />
          <FormField label="Asset Classes" value={managementForm.assetClasses} onChange={(v) => setManagementForm({ ...managementForm, assetClasses: v })} placeholder="e.g. Stocks / Bonds" required />
          <FormField label="Total Value" value={managementForm.totalValue} onChange={(v) => setManagementForm({ ...managementForm, totalValue: v })} placeholder="PKR 0" required />
          <FormField label="Manager" value={managementForm.manager} onChange={(v) => setManagementForm({ ...managementForm, manager: v })} placeholder="e.g. Adv. Numan" required />
          <div className="flex gap-3">
            <FormField label="Last Review" value={managementForm.lastReview} onChange={(v) => setManagementForm({ ...managementForm, lastReview: v })} placeholder="e.g. 10 May 2024" required />
            <FormField label="Next Review" value={managementForm.nextReview} onChange={(v) => setManagementForm({ ...managementForm, nextReview: v })} placeholder="e.g. 10 Jun 2024" required />
          </div>
          <FormActions onCancel={() => managementTable.setIsAddOpen(false)} submitLabel="Add Portfolio" />
        </form>
      </Modal>
      <Modal isOpen={managementTable.isEditOpen} onClose={() => managementTable.setIsEditOpen(false)} title="Edit Managed Portfolio">
        <form onSubmit={submitEditManagement} className="space-y-4">
          <FormField label="Portfolio Name" value={managementForm.portfolioName} onChange={(v) => setManagementForm({ ...managementForm, portfolioName: v })} required />
          <FormField label="Asset Classes" value={managementForm.assetClasses} onChange={(v) => setManagementForm({ ...managementForm, assetClasses: v })} required />
          <FormField label="Total Value" value={managementForm.totalValue} onChange={(v) => setManagementForm({ ...managementForm, totalValue: v })} required />
          <FormField label="Manager" value={managementForm.manager} onChange={(v) => setManagementForm({ ...managementForm, manager: v })} required />
          <div className="flex gap-3">
            <FormField label="Last Review" value={managementForm.lastReview} onChange={(v) => setManagementForm({ ...managementForm, lastReview: v })} required />
            <FormField label="Next Review" value={managementForm.nextReview} onChange={(v) => setManagementForm({ ...managementForm, nextReview: v })} required />
          </div>
          <FormActions onCancel={() => managementTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={managementTable.isConfirmOpen} onClose={() => managementTable.setIsConfirmOpen(false)} onConfirm={() => { if (managementTable.selectedItem) managementTable.deleteItem(managementTable.selectedItem.id); showToast("Portfolio management entry deleted", "error"); }} title="Delete Portfolio Entry" message={`Remove portfolio manager sheet for "${managementTable.selectedItem?.portfolioName}"?`} />

      {/* Profit Modals */}
      <Modal isOpen={profitTable.isAddOpen} onClose={() => profitTable.setIsAddOpen(false)} title="Register Profit Record">
        <form onSubmit={submitAddProfit} className="space-y-4">
          <FormField label="Client Name" value={profitForm.clientName} onChange={(v) => setProfitForm({ ...profitForm, clientName: v })} placeholder="e.g. Malik & Co." required />
          <div className="flex gap-3">
            <FormField label="Monthly Profit" value={profitForm.monthlyProfit} onChange={(v) => setProfitForm({ ...profitForm, monthlyProfit: v })} placeholder="PKR 0" required />
            <FormField label="Quarterly Profit" value={profitForm.quarterlyProfit} onChange={(v) => setProfitForm({ ...profitForm, quarterlyProfit: v })} placeholder="PKR 0" required />
          </div>
          <div className="flex gap-3">
            <FormField label="Annual Profit" value={profitForm.annualProfit} onChange={(v) => setProfitForm({ ...profitForm, annualProfit: v })} placeholder="PKR 0" required />
            <FormField label="YTD Total" value={profitForm.ytdTotal} onChange={(v) => setProfitForm({ ...profitForm, ytdTotal: v })} placeholder="PKR 0" required />
          </div>
          <FormSelect label="Trend" value={profitForm.trend} onChange={(v) => setProfitForm({ ...profitForm, trend: v })} options={["up", "down"]} />
          <FormActions onCancel={() => profitTable.setIsAddOpen(false)} submitLabel="Register" />
        </form>
      </Modal>
      <Modal isOpen={profitTable.isEditOpen} onClose={() => profitTable.setIsEditOpen(false)} title="Edit Profit Record">
        <form onSubmit={submitEditProfit} className="space-y-4">
          <FormField label="Client Name" value={profitForm.clientName} onChange={(v) => setProfitForm({ ...profitForm, clientName: v })} required />
          <div className="flex gap-3">
            <FormField label="Monthly Profit" value={profitForm.monthlyProfit} onChange={(v) => setProfitForm({ ...profitForm, monthlyProfit: v })} required />
            <FormField label="Quarterly Profit" value={profitForm.quarterlyProfit} onChange={(v) => setProfitForm({ ...profitForm, quarterlyProfit: v })} required />
          </div>
          <div className="flex gap-3">
            <FormField label="Annual Profit" value={profitForm.annualProfit} onChange={(v) => setProfitForm({ ...profitForm, annualProfit: v })} required />
            <FormField label="YTD Total" value={profitForm.ytdTotal} onChange={(v) => setProfitForm({ ...profitForm, ytdTotal: v })} required />
          </div>
          <FormSelect label="Trend" value={profitForm.trend} onChange={(v) => setProfitForm({ ...profitForm, trend: v })} options={["up", "down"]} />
          <FormActions onCancel={() => profitTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={profitTable.isConfirmOpen} onClose={() => profitTable.setIsConfirmOpen(false)} onConfirm={() => { if (profitTable.selectedItem) profitTable.deleteItem(profitTable.selectedItem.id); showToast("Profit record removed", "error"); }} title="Delete Profit Record" message={`Remove profit data for "${profitTable.selectedItem?.clientName}"?`} />

      {/* Report Modals */}
      <Modal isOpen={reportsTable.isAddOpen} onClose={() => reportsTable.setIsAddOpen(false)} title="Generate Investment Report">
        <form onSubmit={submitAddReport} className="space-y-4">
          <FormField label="Report Title" value={reportForm.reportTitle} onChange={(v) => setReportForm({ ...reportForm, reportTitle: v })} placeholder="e.g. Q2 Asset Allocation Review" required />
          <FormField label="Period" value={reportForm.period} onChange={(v) => setReportForm({ ...reportForm, period: v })} placeholder="e.g. Q2 2024" required />
          <FormField label="Prepared By" value={reportForm.preparedBy} onChange={(v) => setReportForm({ ...reportForm, preparedBy: v })} placeholder="e.g. Lead Planner" required />
          <FormSelect label="Delivery Status" value={reportForm.deliveryStatus} onChange={(v) => setReportForm({ ...reportForm, deliveryStatus: v })} options={["Completed", "Pending", "Not Sent", "Delivered"]} />
          <FormActions onCancel={() => reportsTable.setIsAddOpen(false)} submitLabel="Generate" />
        </form>
      </Modal>
      <Modal isOpen={reportsTable.isEditOpen} onClose={() => reportsTable.setIsEditOpen(false)} title="Edit Report Details">
        <form onSubmit={submitEditReport} className="space-y-4">
          <FormField label="Report Title" value={reportForm.reportTitle} onChange={(v) => setReportForm({ ...reportForm, reportTitle: v })} required />
          <FormField label="Period" value={reportForm.period} onChange={(v) => setReportForm({ ...reportForm, period: v })} required />
          <FormField label="Prepared By" value={reportForm.preparedBy} onChange={(v) => setReportForm({ ...reportForm, preparedBy: v })} required />
          <FormSelect label="Delivery Status" value={reportForm.deliveryStatus} onChange={(v) => setReportForm({ ...reportForm, deliveryStatus: v })} options={["Completed", "Pending", "Not Sent", "Delivered"]} />
          <FormActions onCancel={() => reportsTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={reportsTable.isConfirmOpen} onClose={() => reportsTable.setIsConfirmOpen(false)} onConfirm={() => { if (reportsTable.selectedItem) reportsTable.deleteItem(reportsTable.selectedItem.id); showToast("Report deleted", "error"); }} title="Delete Report" message={`Remove report "${reportsTable.selectedItem?.reportTitle}"?`} />

      {/* Goal Modals */}
      <Modal isOpen={goalsTable.isAddOpen} onClose={() => goalsTable.setIsAddOpen(false)} title="Register Investment Goal">
        <form onSubmit={submitAddGoal} className="space-y-4">
          <FormField label="Client Name" value={goalForm.clientName} onChange={(v) => setGoalForm({ ...goalForm, clientName: v })} placeholder="e.g. Asif Ali" required />
          <FormField label="Goal Description" value={goalForm.goalDescription} onChange={(v) => setGoalForm({ ...goalForm, goalDescription: v })} placeholder="e.g. Retirement planning milestone" required />
          <div className="flex gap-3">
            <FormField label="Target Amount" value={goalForm.targetAmount} onChange={(v) => setGoalForm({ ...goalForm, targetAmount: v })} placeholder="PKR 0" required />
            <FormField label="Target Date" value={goalForm.targetDate} onChange={(v) => setGoalForm({ ...goalForm, targetDate: v })} placeholder="e.g. 31 Dec 2025" required />
          </div>
          <FormActions onCancel={() => goalsTable.setIsAddOpen(false)} submitLabel="Save Goal" />
        </form>
      </Modal>
      <Modal isOpen={goalsTable.isEditOpen} onClose={() => goalsTable.setIsEditOpen(false)} title="Edit Goal Details">
        <form onSubmit={submitEditGoal} className="space-y-4">
          <FormField label="Client Name" value={goalForm.clientName} onChange={(v) => setGoalForm({ ...goalForm, clientName: v })} required />
          <FormField label="Goal Description" value={goalForm.goalDescription} onChange={(v) => setGoalForm({ ...goalForm, goalDescription: v })} required />
          <div className="flex gap-3">
            <FormField label="Target Amount" value={goalForm.targetAmount} onChange={(v) => setGoalForm({ ...goalForm, targetAmount: v })} required />
            <FormField label="Current Progress" value={goalForm.currentProgress} onChange={(v) => setGoalForm({ ...goalForm, currentProgress: v })} required />
          </div>
          <div className="flex gap-3">
            <FormField label="Target Date" value={goalForm.targetDate} onChange={(v) => setGoalForm({ ...goalForm, targetDate: v })} required />
            <FormSelect label="Status" value={goalForm.status} onChange={(v) => setGoalForm({ ...goalForm, status: v })} options={["Active", "Under Review", "At Risk", "Completed"]} />
          </div>
          <FormActions onCancel={() => goalsTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={goalsTable.isConfirmOpen} onClose={() => goalsTable.setIsConfirmOpen(false)} onConfirm={() => { if (goalsTable.selectedItem) goalsTable.deleteItem(goalsTable.selectedItem.id); showToast("Goal removed", "error"); }} title="Delete Goal" message={`Remove goal for "${goalsTable.selectedItem?.clientName}"?`} />
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

function InvestmentMoney({ value }: { value: string }) {
  const negative = value.trim().startsWith("-");
  return (
    <span className={`font-extrabold ${negative ? "text-red-600" : "text-emerald-600"}`}>
      {negative ? "▼" : "▲"} {value}
    </span>
  );
}

function InvestmentSparkline({ trend }: { trend: string }) {
  const down = trend === "down";
  const data = down
    ? [{ v: 24 }, { v: 22 }, { v: 18 }, { v: 16 }, { v: 12 }, { v: 9 }]
    : [{ v: 9 }, { v: 13 }, { v: 12 }, { v: 18 }, { v: 22 }, { v: 27 }];
  return (
    <div className="h-8 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" dot={false} stroke={down ? "#dc2626" : "#16a34a"} strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
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

function CrudTable({ type, table, openEdit }: { type: "portfolio" | "management" | "profit" | "report" | "goal"; table: any; openEdit: (item: any) => void }) {
  const configs = {
    portfolio: {
      title: "Client Investment Portfolios",
      subtext: "Track investment assets, portfolio allocations, total investment, and ROI metrics.",
      columns: ["#", "Client Name", "Portfolio Type", "Total Investment", "Current Value", "ROI %", "Status", "Actions"],
      emptyMsg: 'No portfolios. Click "+ Add Portfolio" to begin.',
      searchPlaceholder: "Search portfolios...",
    },
    management: {
      title: "Portfolio Management",
      subtext: "Manage asset allocations, active portfolio managers, and review logs.",
      columns: ["#", "Portfolio Name", "Asset Classes", "Total Value", "Manager", "Last Review", "Next Review", "Actions"],
      emptyMsg: 'No managed portfolios. Click "+ Add Portfolio" to begin.',
      searchPlaceholder: "Search portfolios...",
    },
    profit: {
      title: "Profit Tracking",
      subtext: "Track monthly, quarterly, and annual profits for all client portfolios.",
      columns: ["#", "Client Name", "Monthly Profit", "Quarterly Profit", "Annual Profit", "YTD Total", "Trend", "Actions"],
      emptyMsg: 'No profits recorded. Click "+ Register Profit" to begin.',
      searchPlaceholder: "Search profits...",
    },
    report: {
      title: "Financial Reports",
      subtext: "Access prepared portfolio statements and asset valuation reports.",
      columns: ["#", "Report Title", "Period", "Generated On", "Prepared By", "Delivery Status", "Actions"],
      emptyMsg: 'No financial reports found. Click "+ Generate Report" to begin.',
      searchPlaceholder: "Search reports...",
    },
    goal: {
      title: "Investment Goals",
      subtext: "Monitor portfolio target goals, deadline dates, and milestone completion percentages.",
      columns: ["#", "Client Name", "Goal Description", "Target Amount", "Current Progress", "Target Date", "Status", "Actions"],
      emptyMsg: 'No goals set. Click "+ Add Goal" to begin.',
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
                {type === "portfolio" && (
                  <>
                    {table.visibleColumns["Client Name"] !== false && <td className="px-4 py-3 font-extrabold text-slate-950">{row.clientName}</td>}
                    {table.visibleColumns["Portfolio Type"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.portfolioType}</td>}
                    {table.visibleColumns["Total Investment"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.totalInvestment}</td>}
                    {table.visibleColumns["Current Value"] !== false && <td className="px-4 py-3 font-bold text-slate-900">{row.currentValue}</td>}
                    {table.visibleColumns["ROI %"] !== false && <td className="px-4 py-3"><InvestmentMoney value={row.roiPct} /></td>}
                    {table.visibleColumns["Status"] !== false && <td className="px-4 py-3"><InvestmentStatusBadge status={row.status} /></td>}
                  </>
                )}
                {type === "management" && (
                  <>
                    {table.visibleColumns["Portfolio Name"] !== false && <td className="px-4 py-3 font-extrabold text-slate-950">{row.portfolioName}</td>}
                    {table.visibleColumns["Asset Classes"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.assetClasses}</td>}
                    {table.visibleColumns["Total Value"] !== false && <td className="px-4 py-3 font-bold text-slate-900">{row.totalValue}</td>}
                    {table.visibleColumns["Manager"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.manager}</td>}
                    {table.visibleColumns["Last Review"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.lastReview}</td>}
                    {table.visibleColumns["Next Review"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.nextReview}</td>}
                  </>
                )}
                {type === "profit" && (
                  <>
                    {table.visibleColumns["Client Name"] !== false && <td className="px-4 py-3 font-extrabold text-slate-950">{row.clientName}</td>}
                    {table.visibleColumns["Monthly Profit"] !== false && <td className="px-4 py-3"><InvestmentMoney value={row.monthlyProfit} /></td>}
                    {table.visibleColumns["Quarterly Profit"] !== false && <td className="px-4 py-3"><InvestmentMoney value={row.quarterlyProfit} /></td>}
                    {table.visibleColumns["Annual Profit"] !== false && <td className="px-4 py-3"><InvestmentMoney value={row.annualProfit} /></td>}
                    {table.visibleColumns["YTD Total"] !== false && <td className="px-4 py-3"><InvestmentMoney value={row.ytdTotal} /></td>}
                    {table.visibleColumns["Trend"] !== false && <td className="px-4 py-3"><InvestmentSparkline trend={row.trend} /></td>}
                  </>
                )}
                {type === "report" && (
                  <>
                    {table.visibleColumns["Report Title"] !== false && <td className="px-4 py-3 font-extrabold text-slate-900">{row.reportTitle}</td>}
                    {table.visibleColumns["Period"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.period}</td>}
                    {table.visibleColumns["Generated On"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.generatedOn}</td>}
                    {table.visibleColumns["Prepared By"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.preparedBy}</td>}
                    {table.visibleColumns["Delivery Status"] !== false && <td className="px-4 py-3"><InvestmentStatusBadge status={row.deliveryStatus} /></td>}
                  </>
                )}
                {type === "goal" && (
                  <>
                    {table.visibleColumns["Client Name"] !== false && <td className="px-4 py-3 font-extrabold text-slate-950">{row.clientName}</td>}
                    {table.visibleColumns["Goal Description"] !== false && <td className="px-4 py-3 font-semibold text-slate-600">{row.goalDescription}</td>}
                    {table.visibleColumns["Target Amount"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.targetAmount}</td>}
                    {table.visibleColumns["Current Progress"] !== false && <td className="px-4 py-3"><ProgressBar value={row.currentProgress} /></td>}
                    {table.visibleColumns["Target Date"] !== false && <td className="px-4 py-3 font-semibold text-slate-700">{row.targetDate}</td>}
                    {table.visibleColumns["Status"] !== false && <td className="px-4 py-3"><InvestmentStatusBadge status={row.status} /></td>}
                  </>
                )}
                {table.visibleColumns["Actions"] !== false && (
                  <td className="px-4 py-3">
                    <ActionIcons onView={type === "portfolio" ? () => table.selectItemForAction(row, "view") : undefined} onEdit={() => openEdit(row)} onDelete={() => table.selectItemForAction(row, "delete")} />
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

function InvestmentRightColumn({
  portfolioDistribution,
  totalAum,
  topPortfolioTypes,
  reviewsData,
}: {
  portfolioDistribution: { name: string; value: number; color: string }[];
  totalAum: number;
  topPortfolioTypes: string[][];
  reviewsData: ManagementRecord[];
}) {
  const marketOverview = [
    ["KSE-100 Index", "72,450", "+1.2%"],
    ["Gold (per tola)", "PKR 241,500", "-0.8%"],
    ["USD to PKR", "278.20", "+0.1%"],
    ["PKR Treasury Bills (6M)", "21.60%", "+0.0%"],
  ];

  return (
    <aside className="space-y-6">
      <Card title="Portfolio Distribution">
        <div className="p-5">
          {portfolioDistribution.length > 0 ? (
            <>
              <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioDistribution}
                      innerRadius={72}
                      outerRadius={104}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {portfolioDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value)} Portfolios`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-xl font-extrabold text-slate-950">PKR {totalAum.toLocaleString()}</p>
                  <p className="text-xs font-bold text-slate-500">Total AUM</p>
                </div>
              </div>
              <ChartLegend items={portfolioDistribution.map((item) => ({ ...item, pct: portfolioDistribution.reduce((s, d) => s + d.value, 0) > 0 ? `${Math.round((item.value / portfolioDistribution.reduce((s, d) => s + d.value, 0)) * 100)}%` : "0%" }))} />
            </>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm font-bold text-slate-400">
              No portfolios available
            </div>
          )}
        </div>
      </Card>

      <Card
        title="Upcoming Reviews"
        action={<button className="text-sm font-extrabold text-brand">View All →</button>}
      >
        <div className="divide-y divide-slate-100">
          {reviewsData.slice(0, 3).map((row) => (
            <div key={row.id} className="grid grid-cols-[48px_minmax(0,1fr)_auto] gap-3 px-5 py-4">
              <div className="text-center">
                <p className="text-2xl font-extrabold leading-none text-slate-950">
                  {row.nextReview.split(" ")[0] || "15"}
                </p>
                <p className="mt-1 text-xs font-extrabold text-slate-400">
                  {row.nextReview.split(" ")[1]?.toUpperCase() || "MAY"}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-500">{row.manager}</p>
                <p className="mt-1 truncate text-sm font-extrabold text-slate-900">{row.portfolioName}</p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-500">{row.assetClasses}</p>
              </div>
              <PriorityBadge label="Medium Priority" />
            </div>
          ))}
          {reviewsData.length === 0 && (
            <div className="px-5 py-8 text-center text-sm font-bold text-slate-400">
              No upcoming reviews
            </div>
          )}
        </div>
      </Card>

      <Card title="Top Portfolio Types by AUM">
        <div className="space-y-4 p-5">
          {topPortfolioTypes.length > 0 ? (
            topPortfolioTypes.map(([label, amount, pct, width]) => (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="font-extrabold text-slate-700">{label}</span>
                  <span className="shrink-0 font-extrabold text-slate-950">
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
              No portfolio analytics available
            </div>
          )}
        </div>
      </Card>

      <Card title="Market Overview (Today)">
        <div className="divide-y divide-slate-100">
          {marketOverview.map(([name, value, change]) => {
            const positive = change.startsWith("+");
            return (
              <div
                key={name}
                className="grid grid-cols-[minmax(0,1fr)_100px_80px] items-center gap-3 px-5 py-3 text-sm"
              >
                <span className="font-extrabold text-slate-700">{name}</span>
                <span className="text-right font-extrabold text-slate-950">{value}</span>
                <span className={`text-right font-extrabold ${positive ? "text-emerald-600" : "text-red-600"}`}>
                  {positive ? "▲" : "▼"} {change}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </aside>
  );
}
