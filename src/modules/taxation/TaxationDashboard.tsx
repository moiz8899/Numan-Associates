import { useState, useMemo } from "react";
import {
  ChevronDown,
  Printer,
  Users,
  CheckSquare,
  Target,
  ClipboardList,
  Circle,
  Plus,
  Download,
  type LucideIcon,
} from "lucide-react";
import { TaxTableSection } from "../../components/shared/TaxTableSection";
import { TaxStatusBadge } from "../../components/shared/badges";
import { ActionIcons } from "../../components/shared/ActionIcons";
import { TableActions } from "../../components/shared/TableActions";
import { Modal } from "../../components/shared/Modal";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { ViewDrawer } from "../../components/shared/ViewDrawer";
import { Toast, type ToastType } from "../../components/shared/Toast";
import { useTable } from "../../hooks/useTable";
import { exportToPDF, exportToExcel, triggerPrint } from "../../utils/export";
import { taxationTabs } from "../../data/taxation";

// ── Data Interfaces ──────────────────────────────────────────────────────

interface PKFinanceRecord { id: string; name: string; cnic: string; phone: string; pin: string; amount: string; status: string; date: string; }
interface PKTaxationRecord { id: string; name: string; year: string; status: string; filedOn: string; remarks: string; }
interface PKLitigationRecord { id: string; name: string; caseType: string; status: string; amount: string; received: string; nextHearing: string; }

interface PKSalesFinanceRecord { id: string; name: string; strn: string; phone: string; serviceType: string; amount: string; status: string; }
interface PKSalesTaxationRecord { id: string; name: string; period: string; status: string; filedOn: string; remarks: string; }

interface PKCompanyRegRecord { id: string; name: string; companyName: string; phone: string; regType: string; amount: string; status: string; }
interface PKCompanyReturnRecord { id: string; companyName: string; year: string; status: string; filedOn: string; remarks: string; }

interface InternationalTaxRecord { id: string; name: string; taxId: string; phone: string; serviceType: string; amount: string; status: string; }

// ── Initial Mock Data ────────────────────────────────────────────────────

const initialPKFinance: PKFinanceRecord[] = [
  { id: "pk-f1", name: "Numan Ali", cnic: "35201-1234567-1", phone: "0300-1234567", pin: "8821", amount: "PKR 45,000", status: "Paid", date: "15 May 2026" },
  { id: "pk-f2", name: "Zainab Bibi", cnic: "35201-9876543-2", phone: "0312-7654321", pin: "9123", amount: "PKR 35,000", status: "Partial", date: "10 May 2026" }
];

const initialPKTaxation: PKTaxationRecord[] = [
  { id: "pk-t1", name: "Numan Ali", year: "2025", status: "Filed", filedOn: "12 Oct 2025", remarks: "Direct filing complete" },
  { id: "pk-t2", name: "Zainab Bibi", year: "2025", status: "In Review", filedOn: "18 Oct 2025", remarks: "Awaiting audit" }
];

const initialPKLitigation: PKLitigationRecord[] = [
  { id: "pk-l1", name: "Siddique & Co.", caseType: "Income Understatement Notice", status: "Ongoing", amount: "PKR 150,000", received: "PKR 75,000", nextHearing: "14 Jun 2026" }
];

const initialSalesFinance: PKSalesFinanceRecord[] = [
  { id: "sf-1", name: "Hassan Retailers", strn: "3277876123456", phone: "0321-4455667", serviceType: "Retail Audit", amount: "PKR 60,000", status: "Paid" }
];

const initialSalesTaxation: PKSalesTaxationRecord[] = [
  { id: "st-1", name: "Hassan Retailers", period: "May 2026", status: "Filed", filedOn: "20 May 2026", remarks: "Filed on time" }
];

const initialSalesLitigation: PKLitigationRecord[] = [
  { id: "sl-1", name: "Karachi Logistics", caseType: "Input Tax Credit Dispute", status: "Hearing", amount: "PKR 250,000", received: "PKR 125,000", nextHearing: "22 Jun 2026" }
];

const initialCompanyReg: PKCompanyRegRecord[] = [
  { id: "cr-1", name: "Apex Tech LLC", companyName: "Apex Tech Private Limited", phone: "0333-9988776", regType: "Private Limited", amount: "PKR 85,000", status: "Paid" }
];

const initialCompanyReturn: PKCompanyReturnRecord[] = [
  { id: "crt-1", companyName: "Apex Tech Private Limited", year: "2025", status: "Filed", filedOn: "15 Jan 2026", remarks: "Form 29 submitted" }
];

const initialUSTax: InternationalTaxRecord[] = [
  { id: "us-1", name: "Moiz Chaudhry", taxId: "SSN: ***-**-6789", phone: "+1 650-555-0199", serviceType: "Form 1040 Filing", amount: "PKR 110,000", status: "Paid" }
];

const initialDETax: InternationalTaxRecord[] = [
  { id: "de-1", name: "Hans Müller", taxId: "Steuer-ID: DE123456789", phone: "+49 176-5555-1234", serviceType: "Einkommensteuer", amount: "PKR 140,000", status: "Paid" }
];

export function TaxationDashboard() {
  const [activeCountry, setActiveCountry] = useState("PK");
  const [activePakistanService, setActivePakistanService] = useState("Income Tax");

  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const showToast = (msg: string, type: ToastType = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // ── useTable Hooks ─────────────────────────────────────────────────────
  const pkFinanceTable = useTable<PKFinanceRecord>({
    initialData: [],
    searchFields: ["name", "cnic", "status"],
    defaultPageSize: 5,
    supabaseTable: "clients",
    supabaseFilter: { column: "department", value: "taxation-pk-income-finance" },
  });
  const pkTaxationTable = useTable<PKTaxationRecord>({
    initialData: [],
    searchFields: ["name", "status"],
    defaultPageSize: 5,
    supabaseTable: "taxation_returns",
    supabaseFilter: { column: "tax_type", value: "income" },
  });
  const pkLitigationTable = useTable<PKLitigationRecord>({
    initialData: [],
    searchFields: ["name", "caseType", "status"],
    defaultPageSize: 5,
    supabaseTable: "litigation_cases",
    supabaseFilter: { column: "case_type", value: "income" },
  });

  const salesFinanceTable = useTable<PKSalesFinanceRecord>({
    initialData: [],
    searchFields: ["name", "strn", "status"],
    defaultPageSize: 5,
    supabaseTable: "clients",
    supabaseFilter: { column: "department", value: "taxation-pk-sales-finance" },
  });
  const salesTaxationTable = useTable<PKSalesTaxationRecord>({
    initialData: [],
    searchFields: ["name", "status"],
    defaultPageSize: 5,
    supabaseTable: "taxation_returns",
    supabaseFilter: { column: "tax_type", value: "sales" },
  });
  const salesLitigationTable = useTable<PKLitigationRecord>({
    initialData: [],
    searchFields: ["name", "caseType", "status"],
    defaultPageSize: 5,
    supabaseTable: "litigation_cases",
    supabaseFilter: { column: "case_type", value: "sales" },
  });

  const companyRegTable = useTable<PKCompanyRegRecord>({
    initialData: [],
    searchFields: ["name", "companyName", "status"],
    defaultPageSize: 5,
    supabaseTable: "clients",
    supabaseFilter: { column: "department", value: "taxation-pk-company-reg" },
  });
  const companyReturnTable = useTable<PKCompanyReturnRecord>({
    initialData: [],
    searchFields: ["companyName", "status"],
    defaultPageSize: 5,
    supabaseTable: "taxation_returns",
    supabaseFilter: { column: "tax_type", value: "company" },
  });

  const usTaxTable = useTable<InternationalTaxRecord>({
    initialData: [],
    searchFields: ["name", "taxId", "status"],
    defaultPageSize: 5,
    supabaseTable: "clients",
    supabaseFilter: { column: "department", value: "taxation-us" },
  });
  const deTaxTable = useTable<InternationalTaxRecord>({
    initialData: [],
    searchFields: ["name", "taxId", "status"],
    defaultPageSize: 5,
    supabaseTable: "clients",
    supabaseFilter: { column: "department", value: "taxation-de" },
  });

  // ── Forms FormStates ───────────────────────────────────────────────────
  const [pkFinForm, setPkFinForm] = useState<Omit<PKFinanceRecord, "id">>({ name: "", cnic: "", phone: "", pin: "", amount: "PKR 0", status: "Pending", date: "Today" });
  const [pkTaxForm, setPkTaxForm] = useState<Omit<PKTaxationRecord, "id">>({ name: "", year: "2026", status: "Pending", filedOn: "\u2014", remarks: "" });
  const [pkLitForm, setPkLitForm] = useState<Omit<PKLitigationRecord, "id">>({ name: "", caseType: "", status: "Ongoing", amount: "PKR 0", received: "PKR 0", nextHearing: "" });

  const [salesFinForm, setSalesFinForm] = useState<Omit<PKSalesFinanceRecord, "id">>({ name: "", strn: "", phone: "", serviceType: "Retail Audit", amount: "PKR 0", status: "Pending" });
  const [salesTaxForm, setSalesTaxForm] = useState<Omit<PKSalesTaxationRecord, "id">>({ name: "", period: "June 2026", status: "Pending", filedOn: "\u2014", remarks: "" });
  const [salesLitForm, setSalesLitForm] = useState<Omit<PKLitigationRecord, "id">>({ name: "", caseType: "", status: "Ongoing", amount: "PKR 0", received: "PKR 0", nextHearing: "" });

  const [compRegForm, setCompRegForm] = useState<Omit<PKCompanyRegRecord, "id">>({ name: "", companyName: "", phone: "", regType: "Private Limited", amount: "PKR 0", status: "Pending" });
  const [compRetForm, setCompRetForm] = useState<Omit<PKCompanyReturnRecord, "id">>({ companyName: "", year: "2025", status: "Pending", filedOn: "\u2014", remarks: "" });

  const [intlForm, setIntlForm] = useState<Omit<InternationalTaxRecord, "id">>({ name: "", taxId: "", phone: "", serviceType: "Income Tax filing", amount: "PKR 0", status: "Pending" });

  const [showExportMenu, setShowExportMenu] = useState(false);

  // ── Export Trigger ────────────────────────────────────────────────────
  const handleExport = (format: "pdf" | "excel") => {
    setShowExportMenu(false);
    let title = "";
    let headers: string[] = [];
    let rows: string[][] = [];
    let fileName = "";

    if (activeCountry === "PK") {
      if (activePakistanService === "Income Tax") {
        title = "Income Tax Finance Report";
        headers = ["#", "Client Name", "CNIC", "Phone", "PIN", "Amount", "Status", "Date"];
        rows = pkFinanceTable.data.map((r, i) => [String(i + 1), r.name, r.cnic, r.phone, r.pin, r.amount, r.status, r.date]);
        fileName = "pk_income_tax_finance";
      } else if (activePakistanService === "Sales Tax") {
        title = "Sales Tax Finance Report";
        headers = ["#", "Client Name", "STRN", "Phone", "Service Type", "Amount", "Status"];
        rows = salesFinanceTable.data.map((r, i) => [String(i + 1), r.name, r.strn, r.phone, r.serviceType, r.amount, r.status]);
        fileName = "pk_sales_tax_finance";
      } else {
        title = "Company Registrations Report";
        headers = ["#", "Client Name", "Company Name", "Phone", "Registration Type", "Amount", "Status"];
        rows = companyRegTable.data.map((r, i) => [String(i + 1), r.name, r.companyName, r.phone, r.regType, r.amount, r.status]);
        fileName = "pk_company_registrations";
      }
    } else {
      title = activeCountry === "US" ? "USA Taxation Clients" : "Germany Taxation Clients";
      const idCol = activeCountry === "US" ? "Tax ID / SSN" : "Steuer-ID";
      headers = ["#", "Client Name", idCol, "Phone Number", "Service Type", "Payment Amount", "Payment Status"];
      const activeTable = activeCountry === "US" ? usTaxTable : deTaxTable;
      rows = activeTable.data.map((r, i) => [String(i + 1), r.name, r.taxId, r.phone, r.serviceType, r.amount, r.status]);
      fileName = `${activeCountry.toLowerCase()}_tax_clients`;
    }

    if (format === "pdf") {
      exportToPDF({ title, headers, rows, fileName });
    } else {
      exportToExcel({ title, headers, rows, fileName });
    }
    showToast(`Taxation report exported to ${format.toUpperCase()}`);
  };

  return (
    <>
      <Toast message={toastMessage} type={toastType} isOpen={toastOpen} onClose={() => setToastOpen(false)} />

      {/* Country Select Navigation Bar */}
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-card lg:flex-row lg:items-center">
        {taxationTabs.map((tab) => (
          <button
            key={tab.title}
            onClick={() => setActiveCountry(tab.country)}
            className={`flex min-h-16 flex-1 items-center gap-3 rounded-xl border px-4 text-left transition ${
              activeCountry === tab.country
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                activeCountry === tab.country ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {tab.country}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-extrabold text-slate-950">{tab.title}</span>
              <span className="mt-1 block text-xs font-bold text-slate-500">{tab.subtitle}</span>
              {activeCountry === tab.country ? <span className="mt-2 block h-1 w-20 rounded-full bg-emerald-500" /> : null}
            </span>
          </button>
        ))}
      </section>

      {/* Main Workspace based on Country Selection */}
      {activeCountry === "PK" ? (
        <section className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          
          {/* Left Service Selector Panel */}
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-card">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-extrabold text-white">
                  PK
                </span>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-950">Pakistan Taxation</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Select a service category</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <TaxAccordion
                title="Income Tax"
                icon={ClipboardList}
                tone="text-emerald-600"
                expanded={activePakistanService === "Income Tax"}
                onSelect={setActivePakistanService}
                items={["Chief Finance Office", "Chief Taxation Office", "Chief Litigation Office"]}
                activeItem={activePakistanService === "Income Tax" ? "Chief Finance Office" : undefined}
              />
              <TaxAccordion
                title="Sales Tax"
                icon={Circle}
                tone="text-orange-500"
                expanded={activePakistanService === "Sales Tax"}
                onSelect={setActivePakistanService}
                items={["Chief Finance Office", "Chief Taxation Office", "Chief Litigation Office"]}
                activeItem={activePakistanService === "Sales Tax" ? "Chief Finance Office" : undefined}
              />
              <TaxAccordion
                title="Company Registration"
                icon={Circle}
                tone="text-blue-500"
                expanded={activePakistanService === "Company Registration"}
                onSelect={setActivePakistanService}
                items={["Company Registrations", "Company Returns Status"]}
                activeItem={activePakistanService === "Company Registration" ? "Company Registrations" : undefined}
              />
            </div>
          </aside>

          {/* Right Workspace tables */}
          <div className="space-y-6">
            
            {/* Header section with print & export buttons */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-950">{activePakistanService}</h2>
                  <p className="mt-1 text-lg font-extrabold text-emerald-600">Pakistan compliance files</p>
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
                    <Printer size={16} className="mr-2 inline" />
                    Print
                  </button>
                  <button
                    onClick={() => {
                      if (activePakistanService === "Income Tax") {
                        setPkFinForm({ name: "", cnic: "", phone: "", pin: "", amount: "PKR 0", status: "Pending", date: "Today" });
                        pkFinanceTable.setIsAddOpen(true);
                      } else if (activePakistanService === "Sales Tax") {
                        setSalesFinForm({ name: "", strn: "", phone: "", serviceType: "Retail Audit", amount: "PKR 0", status: "Pending" });
                        salesFinanceTable.setIsAddOpen(true);
                      } else {
                        setCompRegForm({ name: "", companyName: "", phone: "", regType: "Private Limited", amount: "PKR 0", status: "Pending" });
                        companyRegTable.setIsAddOpen(true);
                      }
                    }}
                    className="flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-extrabold text-white shadow-soft hover:bg-emerald-700 transition"
                  >
                    <Plus size={18} />
                    Onboard Client
                  </button>
                </div>
              </div>
            </section>

            {/* Income Tax Service Workspace */}
            {activePakistanService === "Income Tax" && (
              <>
                <TaxTableSection
                  title="Chief Finance Office"
                  columns={["#", "Client Name", "CNIC", "Phone Number", "PIN", "Payment Amount", "Payment Status", "Last Payment Date", "Actions"]}
                  footer={`Showing ${pkFinanceTable.paginatedData.length} entries`}
                >
                  {pkFinanceTable.paginatedData.map((row, i) => (
                    <tr key={row.id} className="text-sm hover:bg-slate-50">
                      <td className="px-4 py-3 font-extrabold text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-950">{row.name}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.cnic}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.phone}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.pin}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{row.amount}</td>
                      <td className="px-4 py-3"><TaxStatusBadge status={row.status} /></td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.date}</td>
                      <td className="px-4 py-3">
                        <ActionIcons
                          onView={() => pkFinanceTable.selectItemForAction(row, "view")}
                          onEdit={() => {
                            setPkFinForm({ name: row.name, cnic: row.cnic, phone: row.phone, pin: row.pin, amount: row.amount, status: row.status, date: row.date });
                            pkFinanceTable.selectItemForAction(row, "edit");
                          }}
                          onDelete={() => pkFinanceTable.selectItemForAction(row, "delete")}
                        />
                      </td>
                    </tr>
                  ))}
                </TaxTableSection>

                <TaxTableSection
                  title="Chief Taxation Office"
                  description="Track return filing status and compliance returns."
                  columns={["#", "Client Name", "Tax Year", "Return File Status", "Filed On", "Remarks", "Actions"]}
                  footer={`Showing ${pkTaxationTable.paginatedData.length} entries`}
                  greenTitle
                >
                  {pkTaxationTable.paginatedData.map((row, i) => (
                    <tr key={row.id} className="text-sm hover:bg-slate-50">
                      <td className="px-4 py-3 font-extrabold text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-950">{row.name}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.year}</td>
                      <td className="px-4 py-3"><TaxStatusBadge status={row.status} /></td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.filedOn}</td>
                      <td className="px-4 py-3 font-semibold text-slate-500">{row.remarks}</td>
                      <td className="px-4 py-3">
                        <ActionIcons
                          onEdit={() => {
                            setPkTaxForm({ name: row.name, year: row.year, status: row.status, filedOn: row.filedOn, remarks: row.remarks });
                            pkTaxationTable.selectItemForAction(row, "edit");
                          }}
                          onDelete={() => pkTaxationTable.selectItemForAction(row, "delete")}
                        />
                      </td>
                    </tr>
                  ))}
                  {pkTaxationTable.paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm font-bold text-slate-400">
                        No return records. Register client return below.
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={7} className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setPkTaxForm({ name: "", year: "2026", status: "Pending", filedOn: "\u2014", remarks: "" });
                          pkTaxationTable.setIsAddOpen(true);
                        }}
                        className="text-sm font-extrabold text-emerald-600 hover:text-emerald-700"
                      >
                        + Create Tax Return Entry
                      </button>
                    </td>
                  </tr>
                </TaxTableSection>

                <TaxTableSection
                  title="Chief Litigation Cases Office"
                  description="Manage litigation cases, FBR notices, and court appeals."
                  columns={["#", "Client Name", "Case Type", "Case Status", "Payment Amount", "Payment Received", "Next Hearing Date", "Actions"]}
                  footer={`Showing ${pkLitigationTable.paginatedData.length} entries`}
                  greenTitle
                >
                  {pkLitigationTable.paginatedData.map((row, i) => (
                    <tr key={row.id} className="text-sm hover:bg-slate-50">
                      <td className="px-4 py-3 font-extrabold text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-950">{row.name}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.caseType}</td>
                      <td className="px-4 py-3"><TaxStatusBadge status={row.status} /></td>
                      <td className="px-4 py-3 font-bold text-slate-800">{row.amount}</td>
                      <td className="px-4 py-3 font-extrabold text-emerald-600">{row.received}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.nextHearing}</td>
                      <td className="px-4 py-3">
                        <ActionIcons
                          onEdit={() => {
                            setPkLitForm({ name: row.name, caseType: row.caseType, status: row.status, amount: row.amount, received: row.received, nextHearing: row.nextHearing });
                            pkLitigationTable.selectItemForAction(row, "edit");
                          }}
                          onDelete={() => pkLitigationTable.selectItemForAction(row, "delete")}
                        />
                      </td>
                    </tr>
                  ))}
                  {pkLitigationTable.paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm font-bold text-slate-400">
                        No litigation case records active.
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={8} className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setPkLitForm({ name: "", caseType: "", status: "Ongoing", amount: "PKR 0", received: "PKR 0", nextHearing: "" });
                          pkLitigationTable.setIsAddOpen(true);
                        }}
                        className="text-sm font-extrabold text-emerald-600 hover:text-emerald-700"
                      >
                        + Register Litigation Case
                      </button>
                    </td>
                  </tr>
                </TaxTableSection>
              </>
            )}

            {/* Sales Tax Service Workspace */}
            {activePakistanService === "Sales Tax" && (
              <>
                <TaxTableSection
                  title="Chief Finance Office (Sales Tax)"
                  columns={["#", "Client Name", "STRN", "Phone Number", "Service Type", "Payment Amount", "Payment Status", "Actions"]}
                  footer={`Showing ${salesFinanceTable.paginatedData.length} entries`}
                >
                  {salesFinanceTable.paginatedData.map((row, i) => (
                    <tr key={row.id} className="text-sm hover:bg-slate-50">
                      <td className="px-4 py-3 font-extrabold text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-950">{row.name}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.strn}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.phone}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.serviceType}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{row.amount}</td>
                      <td className="px-4 py-3"><TaxStatusBadge status={row.status} /></td>
                      <td className="px-4 py-3">
                        <ActionIcons
                          onView={() => salesFinanceTable.selectItemForAction(row, "view")}
                          onEdit={() => {
                            setSalesFinForm({ name: row.name, strn: row.strn, phone: row.phone, serviceType: row.serviceType, amount: row.amount, status: row.status });
                            salesFinanceTable.selectItemForAction(row, "edit");
                          }}
                          onDelete={() => salesFinanceTable.selectItemForAction(row, "delete")}
                        />
                      </td>
                    </tr>
                  ))}
                </TaxTableSection>

                <TaxTableSection
                  title="Chief Taxation Office (Sales Tax)"
                  description="Track monthly and quarterly sales tax return filing."
                  columns={["#", "Client Name", "Tax Period", "Return Status", "Filed On", "Remarks", "Actions"]}
                  footer={`Showing ${salesTaxationTable.paginatedData.length} entries`}
                  greenTitle
                >
                  {salesTaxationTable.paginatedData.map((row, i) => (
                    <tr key={row.id} className="text-sm hover:bg-slate-50">
                      <td className="px-4 py-3 font-extrabold text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-950">{row.name}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.period}</td>
                      <td className="px-4 py-3"><TaxStatusBadge status={row.status} /></td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.filedOn}</td>
                      <td className="px-4 py-3 font-semibold text-slate-500">{row.remarks}</td>
                      <td className="px-4 py-3">
                        <ActionIcons
                          onEdit={() => {
                            setSalesTaxForm({ name: row.name, period: row.period, status: row.status, filedOn: row.filedOn, remarks: row.remarks });
                            salesTaxationTable.selectItemForAction(row, "edit");
                          }}
                          onDelete={() => salesTaxationTable.selectItemForAction(row, "delete")}
                        />
                      </td>
                    </tr>
                  ))}
                  {salesTaxationTable.paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm font-bold text-slate-400">
                        No return logs found.
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={7} className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSalesTaxForm({ name: "", period: "June 2026", status: "Pending", filedOn: "\u2014", remarks: "" });
                          salesTaxationTable.setIsAddOpen(true);
                        }}
                        className="text-sm font-extrabold text-emerald-600 hover:text-emerald-700"
                      >
                        + Create Sales Tax Return
                      </button>
                    </td>
                  </tr>
                </TaxTableSection>

                <TaxTableSection
                  title="Chief Litigation Office (Sales Tax)"
                  columns={["#", "Client Name", "Case Type", "Case Status", "Payment Amount", "Payment Received", "Next Hearing Date", "Actions"]}
                  footer={`Showing ${salesLitigationTable.paginatedData.length} entries`}
                  greenTitle
                >
                  {salesLitigationTable.paginatedData.map((row, i) => (
                    <tr key={row.id} className="text-sm hover:bg-slate-50">
                      <td className="px-4 py-3 font-extrabold text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-950">{row.name}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.caseType}</td>
                      <td className="px-4 py-3"><TaxStatusBadge status={row.status} /></td>
                      <td className="px-4 py-3 font-bold text-slate-800">{row.amount}</td>
                      <td className="px-4 py-3 font-extrabold text-emerald-600">{row.received}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.nextHearing}</td>
                      <td className="px-4 py-3">
                        <ActionIcons
                          onEdit={() => {
                            setSalesLitForm({ name: row.name, caseType: row.caseType, status: row.status, amount: row.amount, received: row.received, nextHearing: row.nextHearing });
                            salesLitigationTable.selectItemForAction(row, "edit");
                          }}
                          onDelete={() => salesLitigationTable.selectItemForAction(row, "delete")}
                        />
                      </td>
                    </tr>
                  ))}
                  {salesLitigationTable.paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm font-bold text-slate-400">
                        No sales tax litigation records active.
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={8} className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSalesLitForm({ name: "", caseType: "", status: "Ongoing", amount: "PKR 0", received: "PKR 0", nextHearing: "" });
                          salesLitigationTable.setIsAddOpen(true);
                        }}
                        className="text-sm font-extrabold text-emerald-600 hover:text-emerald-700"
                      >
                        + Register Litigation Case
                      </button>
                    </td>
                  </tr>
                </TaxTableSection>
              </>
            )}

            {/* Company Registration Service Workspace */}
            {activePakistanService === "Company Registration" && (
              <>
                <TaxTableSection
                  title="Company Registrations"
                  description="Manage SECP / Registrar company incorporations."
                  columns={["#", "Client Name", "Company Name", "Phone Number", "Registration Type", "Payment Amount", "Payment Status", "Actions"]}
                  footer={`Showing ${companyRegTable.paginatedData.length} entries`}
                >
                  {companyRegTable.paginatedData.map((row, i) => (
                    <tr key={row.id} className="text-sm hover:bg-slate-50">
                      <td className="px-4 py-3 font-extrabold text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-950">{row.name}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.companyName}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.phone}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.regType}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{row.amount}</td>
                      <td className="px-4 py-3"><TaxStatusBadge status={row.status} /></td>
                      <td className="px-4 py-3">
                        <ActionIcons
                          onView={() => companyRegTable.selectItemForAction(row, "view")}
                          onEdit={() => {
                            setCompRegForm({ name: row.name, companyName: row.companyName, phone: row.phone, regType: row.regType, amount: row.amount, status: row.status });
                            companyRegTable.selectItemForAction(row, "edit");
                          }}
                          onDelete={() => companyRegTable.selectItemForAction(row, "delete")}
                        />
                      </td>
                    </tr>
                  ))}
                </TaxTableSection>

                <TaxTableSection
                  title="Company Returns Status"
                  description="Track annual returns filing status (SECP Form 29, etc.)."
                  columns={["#", "Company Name", "Return Year", "Return Status", "Filed On", "Remarks", "Actions"]}
                  footer={`Showing ${companyReturnTable.paginatedData.length} entries`}
                  greenTitle
                >
                  {companyReturnTable.paginatedData.map((row, i) => (
                    <tr key={row.id} className="text-sm hover:bg-slate-50">
                      <td className="px-4 py-3 font-extrabold text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-950">{row.companyName}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.year}</td>
                      <td className="px-4 py-3"><TaxStatusBadge status={row.status} /></td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{row.filedOn}</td>
                      <td className="px-4 py-3 font-semibold text-slate-500">{row.remarks}</td>
                      <td className="px-4 py-3">
                        <ActionIcons
                          onEdit={() => {
                            setCompRetForm({ companyName: row.companyName, year: row.year, status: row.status, filedOn: row.filedOn, remarks: row.remarks });
                            companyReturnTable.selectItemForAction(row, "edit");
                          }}
                          onDelete={() => companyReturnTable.selectItemForAction(row, "delete")}
                        />
                      </td>
                    </tr>
                  ))}
                  {companyReturnTable.paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm font-bold text-slate-400">
                        No statutory returns logged.
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={7} className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setCompRetForm({ companyName: "", year: "2025", status: "Pending", filedOn: "\u2014", remarks: "" });
                          companyReturnTable.setIsAddOpen(true);
                        }}
                        className="text-sm font-extrabold text-emerald-600 hover:text-emerald-700"
                      >
                        + Create Annual Return Log
                      </button>
                    </td>
                  </tr>
                </TaxTableSection>
              </>
            )}
          </div>
        </section>
      ) : (
        /* USA or DE Taxation Services Workspaces */
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-sm font-extrabold text-white">
                  {activeCountry}
                </span>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-950">{activeCountry === "US" ? "USA Taxation" : "Germany Taxation"}</h2>
                  <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-slate-500">
                    {activeCountry === "US"
                      ? "US federal and state tax compliance, IRS filings, and advisory services."
                      : "German tax law compliance including Einkommensteuer, Umsatzsteuer, and corporate filings."}
                  </p>
                </div>
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
                  <Printer size={16} className="mr-2 inline" />
                  Print
                </button>
                <button
                  onClick={() => {
                    setIntlForm({ name: "", taxId: activeCountry === "US" ? "SSN: ***-**-xxxx" : "Steuer-ID: DExxxxxxxxx", phone: "", serviceType: "Income Tax Filing", amount: "PKR 0", status: "Pending" });
                    const activeTable = activeCountry === "US" ? usTaxTable : deTaxTable;
                    activeTable.setIsAddOpen(true);
                  }}
                  className="flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-extrabold text-white shadow-soft hover:bg-emerald-700 transition"
                >
                  <Plus size={18} />
                  Onboard Client
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InternationalTaxCard icon={Users} title="Clients" value={String(activeCountry === "US" ? usTaxTable.data.length : deTaxTable.data.length)} detail="Client records logged" />
            <InternationalTaxCard icon={CheckSquare} title="Tasks" value="0" detail="Filing preparations active" />
            <InternationalTaxCard icon={Target} title="Goals" value="0" detail="Milestones registered" />
          </div>

          <TaxTableSection
            title="International Clients"
            description={activeCountry === "US" ? "US federal and state tax client records." : "German and EU compliance client records."}
            columns={["#", "Client Name", activeCountry === "US" ? "Tax ID / SSN" : "Steuer-ID", "Phone Number", "Service Type", "Payment Amount", "Payment Status", "Actions"]}
            footer={`Showing ${(activeCountry === "US" ? usTaxTable : deTaxTable).paginatedData.length} entries`}
            greenTitle
          >
            {(activeCountry === "US" ? usTaxTable : deTaxTable).paginatedData.map((row, i) => (
              <tr key={row.id} className="text-sm hover:bg-slate-50">
                <td className="px-4 py-3 font-extrabold text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 font-extrabold text-slate-950">{row.name}</td>
                <td className="px-4 py-3 font-semibold text-slate-600">{row.taxId}</td>
                <td className="px-4 py-3 font-semibold text-slate-600">{row.phone}</td>
                <td className="px-4 py-3 font-semibold text-slate-600">{row.serviceType}</td>
                <td className="px-4 py-3 font-bold text-slate-800">{row.amount}</td>
                <td className="px-4 py-3"><TaxStatusBadge status={row.status} /></td>
                <td className="px-4 py-3">
                  <ActionIcons
                    onView={() => (activeCountry === "US" ? usTaxTable : deTaxTable).selectItemForAction(row, "view")}
                    onEdit={() => {
                      setIntlForm({ name: row.name, taxId: row.taxId, phone: row.phone, serviceType: row.serviceType, amount: row.amount, status: row.status });
                      (activeCountry === "US" ? usTaxTable : deTaxTable).selectItemForAction(row, "edit");
                    }}
                    onDelete={() => (activeCountry === "US" ? usTaxTable : deTaxTable).selectItemForAction(row, "delete")}
                  />
                </td>
              </tr>
            ))}
            {(activeCountry === "US" ? usTaxTable : deTaxTable).paginatedData.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm font-bold text-slate-400 bg-slate-50/20">
                  No clients onboarded. Click "+ Onboard Client" to begin.
                </td>
              </tr>
            )}
          </TaxTableSection>
        </section>
      )}

      {/* ========================================================================= */}
      {/* CRUD MODALS & DIALOGS */}
      {/* ========================================================================= */}

      {/* PK Finance CFO Modal Add/Edit */}
      <Modal isOpen={pkFinanceTable.isAddOpen} onClose={() => pkFinanceTable.setIsAddOpen(false)} title="Onboard Income Tax Client (PK)">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            pkFinanceTable.addItem({ id: String(Date.now()), ...pkFinForm });
            pkFinanceTable.setIsAddOpen(false);
            showToast(`Income Tax client ${pkFinForm.name} onboarded!`);
          }}
          className="space-y-4"
        >
          <FormField label="Client Name" value={pkFinForm.name} onChange={(v) => setPkFinForm({ ...pkFinForm, name: v })} placeholder="e.g. Tariq Javed" required />
          <div className="flex gap-3">
            <FormField label="CNIC" value={pkFinForm.cnic} onChange={(v) => setPkFinForm({ ...pkFinForm, cnic: v })} placeholder="35201-xxxxxxx-x" required />
            <FormField label="Phone" value={pkFinForm.phone} onChange={(v) => setPkFinForm({ ...pkFinForm, phone: v })} required />
          </div>
          <div className="flex gap-3">
            <FormField label="FBR Pin" value={pkFinForm.pin} onChange={(v) => setPkFinForm({ ...pkFinForm, pin: v })} required />
            <FormField label="Payment Amount" value={pkFinForm.amount} onChange={(v) => setPkFinForm({ ...pkFinForm, amount: v })} required />
          </div>
          <FormSelect label="Payment Status" value={pkFinForm.status} onChange={(v) => setPkFinForm({ ...pkFinForm, status: v })} options={["Pending", "Partial", "Paid"]} />
          <FormActions onCancel={() => pkFinanceTable.setIsAddOpen(false)} submitLabel="Onboard Client" />
        </form>
      </Modal>
      <Modal isOpen={pkFinanceTable.isEditOpen} onClose={() => pkFinanceTable.setIsEditOpen(false)} title="Edit Client Finance details">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!pkFinanceTable.selectedItem) return;
            pkFinanceTable.updateItem({ id: pkFinanceTable.selectedItem.id, ...pkFinForm });
            pkFinanceTable.setIsEditOpen(false);
            showToast("Finance record updated!");
          }}
          className="space-y-4"
        >
          <FormField label="Client Name" value={pkFinForm.name} onChange={(v) => setPkFinForm({ ...pkFinForm, name: v })} required />
          <div className="flex gap-3">
            <FormField label="CNIC" value={pkFinForm.cnic} onChange={(v) => setPkFinForm({ ...pkFinForm, cnic: v })} required />
            <FormField label="Phone" value={pkFinForm.phone} onChange={(v) => setPkFinForm({ ...pkFinForm, phone: v })} required />
          </div>
          <div className="flex gap-3">
            <FormField label="FBR Pin" value={pkFinForm.pin} onChange={(v) => setPkFinForm({ ...pkFinForm, pin: v })} required />
            <FormField label="Payment Amount" value={pkFinForm.amount} onChange={(v) => setPkFinForm({ ...pkFinForm, amount: v })} required />
          </div>
          <FormSelect label="Payment Status" value={pkFinForm.status} onChange={(v) => setPkFinForm({ ...pkFinForm, status: v })} options={["Pending", "Partial", "Paid"]} />
          <FormActions onCancel={() => pkFinanceTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ViewDrawer isOpen={pkFinanceTable.isViewOpen} onClose={() => pkFinanceTable.setIsViewOpen(false)} title={pkFinanceTable.selectedItem?.name || "Client File"}>
        {pkFinanceTable.selectedItem && (
          <div className="space-y-4">
            <DetailCard label="Client Identity" items={[["Name", pkFinanceTable.selectedItem.name], ["CNIC", pkFinanceTable.selectedItem.cnic], ["Phone", pkFinanceTable.selectedItem.phone], ["FBR PIN Code", pkFinanceTable.selectedItem.pin]]} />
            <DetailCard label="Financial overview" items={[["Agreed Amount", pkFinanceTable.selectedItem.amount], ["Status", pkFinanceTable.selectedItem.status], ["Last Payment Date", pkFinanceTable.selectedItem.date]]} />
          </div>
        )}
      </ViewDrawer>
      <ConfirmDialog isOpen={pkFinanceTable.isConfirmOpen} onClose={() => pkFinanceTable.setIsConfirmOpen(false)} onConfirm={() => { if (pkFinanceTable.selectedItem) pkFinanceTable.deleteItem(pkFinanceTable.selectedItem.id); showToast("Client removed", "error"); }} title="Delete Client" message={`Delete client "${pkFinanceTable.selectedItem?.name}" from FBR records?`} />

      {/* PK Tax Return Add/Edit */}
      <Modal isOpen={pkTaxationTable.isAddOpen} onClose={() => pkTaxationTable.setIsAddOpen(false)} title="Create Tax Return Log">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            pkTaxationTable.addItem({ id: String(Date.now()), ...pkTaxForm });
            pkTaxationTable.setIsAddOpen(false);
            showToast("Tax Return record generated.");
          }}
          className="space-y-4"
        >
          <FormField label="Client Name" value={pkTaxForm.name} onChange={(v) => setPkTaxForm({ ...pkTaxForm, name: v })} placeholder="e.g. Tariq Javed" required />
          <FormField label="Tax Year" value={pkTaxForm.year} onChange={(v) => setPkTaxForm({ ...pkTaxForm, year: v })} required />
          <FormSelect label="Filing Status" value={pkTaxForm.status} onChange={(v) => setPkTaxForm({ ...pkTaxForm, status: v })} options={["Pending", "In Review", "Filed"]} />
          <FormField label="Filed On Date" value={pkTaxForm.filedOn} onChange={(v) => setPkTaxForm({ ...pkTaxForm, filedOn: v })} />
          <FormField label="Remarks" value={pkTaxForm.remarks} onChange={(v) => setPkTaxForm({ ...pkTaxForm, remarks: v })} />
          <FormActions onCancel={() => pkTaxationTable.setIsAddOpen(false)} submitLabel="Create Return" />
        </form>
      </Modal>
      <Modal isOpen={pkTaxationTable.isEditOpen} onClose={() => pkTaxationTable.setIsEditOpen(false)} title="Modify Tax Return Log">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!pkTaxationTable.selectedItem) return;
            pkTaxationTable.updateItem({ id: pkTaxationTable.selectedItem.id, ...pkTaxForm });
            pkTaxationTable.setIsEditOpen(false);
            showToast("Tax Return record saved.");
          }}
          className="space-y-4"
        >
          <FormField label="Client Name" value={pkTaxForm.name} onChange={(v) => setPkTaxForm({ ...pkTaxForm, name: v })} required />
          <FormField label="Tax Year" value={pkTaxForm.year} onChange={(v) => setPkTaxForm({ ...pkTaxForm, year: v })} required />
          <FormSelect label="Filing Status" value={pkTaxForm.status} onChange={(v) => setPkTaxForm({ ...pkTaxForm, status: v })} options={["Pending", "In Review", "Filed"]} />
          <FormField label="Filed On Date" value={pkTaxForm.filedOn} onChange={(v) => setPkTaxForm({ ...pkTaxForm, filedOn: v })} />
          <FormField label="Remarks" value={pkTaxForm.remarks} onChange={(v) => setPkTaxForm({ ...pkTaxForm, remarks: v })} />
          <FormActions onCancel={() => pkTaxationTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={pkTaxationTable.isConfirmOpen} onClose={() => pkTaxationTable.setIsConfirmOpen(false)} onConfirm={() => { if (pkTaxationTable.selectedItem) pkTaxationTable.deleteItem(pkTaxationTable.selectedItem.id); showToast("Return record cleared", "error"); }} title="Delete Tax Return" message={`Delete Return record for "${pkTaxationTable.selectedItem?.name}"?`} />

      {/* PK Litigation Add/Edit */}
      <Modal isOpen={pkLitigationTable.isAddOpen} onClose={() => pkLitigationTable.setIsAddOpen(false)} title="Register Litigation Case">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            pkLitigationTable.addItem({ id: String(Date.now()), ...pkLitForm });
            pkLitigationTable.setIsAddOpen(false);
            showToast("Litigation Case registered.");
          }}
          className="space-y-4"
        >
          <FormField label="Client Name" value={pkLitForm.name} onChange={(v) => setPkLitForm({ ...pkLitForm, name: v })} placeholder="e.g. Tariq Javed" required />
          <FormField label="Case Type/Description" value={pkLitForm.caseType} onChange={(v) => setPkLitForm({ ...pkLitForm, caseType: v })} required />
          <FormSelect label="Case Status" value={pkLitForm.status} onChange={(v) => setPkLitForm({ ...pkLitForm, status: v })} options={["Ongoing", "Hearing", "Closed"]} />
          <div className="flex gap-3">
            <FormField label="Agreed Fee" value={pkLitForm.amount} onChange={(v) => setPkLitForm({ ...pkLitForm, amount: v })} required />
            <FormField label="Fee Received" value={pkLitForm.received} onChange={(v) => setPkLitForm({ ...pkLitForm, received: v })} required />
          </div>
          <FormField label="Next Hearing Date" value={pkLitForm.nextHearing} onChange={(v) => setPkLitForm({ ...pkLitForm, nextHearing: v })} placeholder="e.g. 18 Jun 2026" />
          <FormActions onCancel={() => pkLitigationTable.setIsAddOpen(false)} submitLabel="Register Case" />
        </form>
      </Modal>
      <Modal isOpen={pkLitigationTable.isEditOpen} onClose={() => pkLitigationTable.setIsEditOpen(false)} title="Edit Litigation Case Details">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!pkLitigationTable.selectedItem) return;
            pkLitigationTable.updateItem({ id: pkLitigationTable.selectedItem.id, ...pkLitForm });
            pkLitigationTable.setIsEditOpen(false);
            showToast("Litigation Case details saved.");
          }}
          className="space-y-4"
        >
          <FormField label="Client Name" value={pkLitForm.name} onChange={(v) => setPkLitForm({ ...pkLitForm, name: v })} required />
          <FormField label="Case Type/Description" value={pkLitForm.caseType} onChange={(v) => setPkLitForm({ ...pkLitForm, caseType: v })} required />
          <FormSelect label="Case Status" value={pkLitForm.status} onChange={(v) => setPkLitForm({ ...pkLitForm, status: v })} options={["Ongoing", "Hearing", "Closed"]} />
          <div className="flex gap-3">
            <FormField label="Agreed Fee" value={pkLitForm.amount} onChange={(v) => setPkLitForm({ ...pkLitForm, amount: v })} required />
            <FormField label="Fee Received" value={pkLitForm.received} onChange={(v) => setPkLitForm({ ...pkLitForm, received: v })} required />
          </div>
          <FormField label="Next Hearing Date" value={pkLitForm.nextHearing} onChange={(v) => setPkLitForm({ ...pkLitForm, nextHearing: v })} />
          <FormActions onCancel={() => pkLitigationTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={pkLitigationTable.isConfirmOpen} onClose={() => pkLitigationTable.setIsConfirmOpen(false)} onConfirm={() => { if (pkLitigationTable.selectedItem) pkLitigationTable.deleteItem(pkLitigationTable.selectedItem.id); showToast("Litigation Case cleared", "error"); }} title="Delete Litigation Case" message={`Delete litigation case for "${pkLitigationTable.selectedItem?.name}"?`} />

      {/* PKSalesFinance Add/Edit */}
      <Modal isOpen={salesFinanceTable.isAddOpen} onClose={() => salesFinanceTable.setIsAddOpen(false)} title="Onboard Sales Tax Client (PK)">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            salesFinanceTable.addItem({ id: String(Date.now()), ...salesFinForm });
            salesFinanceTable.setIsAddOpen(false);
            showToast(`Sales Tax client ${salesFinForm.name} onboarded!`);
          }}
          className="space-y-4"
        >
          <FormField label="Client Name" value={salesFinForm.name} onChange={(v) => setSalesFinForm({ ...salesFinForm, name: v })} required />
          <div className="flex gap-3">
            <FormField label="STRN" value={salesFinForm.strn} onChange={(v) => setSalesFinForm({ ...salesFinForm, strn: v })} placeholder="13-digit STRN" required />
            <FormField label="Phone" value={salesFinForm.phone} onChange={(v) => setSalesFinForm({ ...salesFinForm, phone: v })} required />
          </div>
          <FormField label="Service Type" value={salesFinForm.serviceType} onChange={(v) => setSalesFinForm({ ...salesFinForm, serviceType: v })} required />
          <div className="flex gap-3">
            <FormField label="Payment Amount" value={salesFinForm.amount} onChange={(v) => setSalesFinForm({ ...salesFinForm, amount: v })} required />
            <FormSelect label="Payment Status" value={salesFinForm.status} onChange={(v) => setSalesFinForm({ ...salesFinForm, status: v })} options={["Pending", "Partial", "Paid"]} />
          </div>
          <FormActions onCancel={() => salesFinanceTable.setIsAddOpen(false)} submitLabel="Onboard Client" />
        </form>
      </Modal>
      <Modal isOpen={salesFinanceTable.isEditOpen} onClose={() => salesFinanceTable.setIsEditOpen(false)} title="Edit Sales Tax Client details">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!salesFinanceTable.selectedItem) return;
            salesFinanceTable.updateItem({ id: salesFinanceTable.selectedItem.id, ...salesFinForm });
            salesFinanceTable.setIsEditOpen(false);
            showToast("Finance record updated!");
          }}
          className="space-y-4"
        >
          <FormField label="Client Name" value={salesFinForm.name} onChange={(v) => setSalesFinForm({ ...salesFinForm, name: v })} required />
          <div className="flex gap-3">
            <FormField label="STRN" value={salesFinForm.strn} onChange={(v) => setSalesFinForm({ ...salesFinForm, strn: v })} required />
            <FormField label="Phone" value={salesFinForm.phone} onChange={(v) => setSalesFinForm({ ...salesFinForm, phone: v })} required />
          </div>
          <FormField label="Service Type" value={salesFinForm.serviceType} onChange={(v) => setSalesFinForm({ ...salesFinForm, serviceType: v })} required />
          <div className="flex gap-3">
            <FormField label="Payment Amount" value={salesFinForm.amount} onChange={(v) => setSalesFinForm({ ...salesFinForm, amount: v })} required />
            <FormSelect label="Payment Status" value={salesFinForm.status} onChange={(v) => setSalesFinForm({ ...salesFinForm, status: v })} options={["Pending", "Partial", "Paid"]} />
          </div>
          <FormActions onCancel={() => salesFinanceTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ViewDrawer isOpen={salesFinanceTable.isViewOpen} onClose={() => salesFinanceTable.setIsViewOpen(false)} title={salesFinanceTable.selectedItem?.name || "Client File"}>
        {salesFinanceTable.selectedItem && (
          <div className="space-y-4">
            <DetailCard label="Sales Tax Client Profile" items={[["Name", salesFinanceTable.selectedItem.name], ["STRN", salesFinanceTable.selectedItem.strn], ["Phone", salesFinanceTable.selectedItem.phone]]} />
            <DetailCard label="Finance" items={[["Service", salesFinanceTable.selectedItem.serviceType], ["Amount", salesFinanceTable.selectedItem.amount], ["Status", salesFinanceTable.selectedItem.status]]} />
          </div>
        )}
      </ViewDrawer>
      <ConfirmDialog isOpen={salesFinanceTable.isConfirmOpen} onClose={() => salesFinanceTable.setIsConfirmOpen(false)} onConfirm={() => { if (salesFinanceTable.selectedItem) salesFinanceTable.deleteItem(salesFinanceTable.selectedItem.id); showToast("Record deleted", "error"); }} title="Delete Client" message={`Delete client "${salesFinanceTable.selectedItem?.name}" from FBR records?`} />

      {/* PKSalesTaxation Add/Edit */}
      <Modal isOpen={salesTaxationTable.isAddOpen} onClose={() => salesTaxationTable.setIsAddOpen(false)} title="Create Sales Tax Return Log">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            salesTaxationTable.addItem({ id: String(Date.now()), ...salesTaxForm });
            salesTaxationTable.setIsAddOpen(false);
            showToast("Sales Tax Return logged.");
          }}
          className="space-y-4"
        >
          <FormField label="Client Name" value={salesTaxForm.name} onChange={(v) => setSalesTaxForm({ ...salesTaxForm, name: v })} required />
          <FormField label="Tax Period" value={salesTaxForm.period} onChange={(v) => setSalesTaxForm({ ...salesTaxForm, period: v })} required />
          <FormSelect label="Filing Status" value={salesTaxForm.status} onChange={(v) => setSalesTaxForm({ ...salesTaxForm, status: v })} options={["Pending", "In Review", "Filed"]} />
          <FormField label="Filed On Date" value={salesTaxForm.filedOn} onChange={(v) => setSalesTaxForm({ ...salesTaxForm, filedOn: v })} />
          <FormField label="Remarks" value={salesTaxForm.remarks} onChange={(v) => setSalesTaxForm({ ...salesTaxForm, remarks: v })} />
          <FormActions onCancel={() => salesTaxationTable.setIsAddOpen(false)} submitLabel="Create Return" />
        </form>
      </Modal>
      <Modal isOpen={salesTaxationTable.isEditOpen} onClose={() => salesTaxationTable.setIsEditOpen(false)} title="Modify Sales Tax Return">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!salesTaxationTable.selectedItem) return;
            salesTaxationTable.updateItem({ id: salesTaxationTable.selectedItem.id, ...salesTaxForm });
            salesTaxationTable.setIsEditOpen(false);
            showToast("Return details updated.");
          }}
          className="space-y-4"
        >
          <FormField label="Client Name" value={salesTaxForm.name} onChange={(v) => setSalesTaxForm({ ...salesTaxForm, name: v })} required />
          <FormField label="Tax Period" value={salesTaxForm.period} onChange={(v) => setSalesTaxForm({ ...salesTaxForm, period: v })} required />
          <FormSelect label="Filing Status" value={salesTaxForm.status} onChange={(v) => setSalesTaxForm({ ...salesTaxForm, status: v })} options={["Pending", "In Review", "Filed"]} />
          <FormField label="Filed On Date" value={salesTaxForm.filedOn} onChange={(v) => setSalesTaxForm({ ...salesTaxForm, filedOn: v })} />
          <FormField label="Remarks" value={salesTaxForm.remarks} onChange={(v) => setSalesTaxForm({ ...salesTaxForm, remarks: v })} />
          <FormActions onCancel={() => salesTaxationTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={salesTaxationTable.isConfirmOpen} onClose={() => salesTaxationTable.setIsConfirmOpen(false)} onConfirm={() => { if (salesTaxationTable.selectedItem) salesTaxationTable.deleteItem(salesTaxationTable.selectedItem.id); showToast("Record deleted", "error"); }} title="Delete Return Record" message={`Remove return record for "${salesTaxationTable.selectedItem?.name}"?`} />

      {/* PKSalesLitigation Add/Edit */}
      <Modal isOpen={salesLitigationTable.isAddOpen} onClose={() => salesLitigationTable.setIsAddOpen(false)} title="Register Sales Tax Litigation Case">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            salesLitigationTable.addItem({ id: String(Date.now()), ...salesLitForm });
            salesLitigationTable.setIsAddOpen(false);
            showToast("Litigation Case registered.");
          }}
          className="space-y-4"
        >
          <FormField label="Client Name" value={salesLitForm.name} onChange={(v) => setSalesLitForm({ ...salesLitForm, name: v })} placeholder="e.g. Tariq Javed" required />
          <FormField label="Case Type/Description" value={salesLitForm.caseType} onChange={(v) => setSalesLitForm({ ...salesLitForm, caseType: v })} required />
          <FormSelect label="Case Status" value={salesLitForm.status} onChange={(v) => setSalesLitForm({ ...salesLitForm, status: v })} options={["Ongoing", "Hearing", "Closed"]} />
          <div className="flex gap-3">
            <FormField label="Agreed Fee" value={salesLitForm.amount} onChange={(v) => setSalesLitForm({ ...salesLitForm, amount: v })} required />
            <FormField label="Fee Received" value={salesLitForm.received} onChange={(v) => setSalesLitForm({ ...salesLitForm, received: v })} required />
          </div>
          <FormField label="Next Hearing Date" value={salesLitForm.nextHearing} onChange={(v) => setSalesLitForm({ ...salesLitForm, nextHearing: v })} placeholder="e.g. 18 Jun 2026" />
          <FormActions onCancel={() => salesLitigationTable.setIsAddOpen(false)} submitLabel="Register Case" />
        </form>
      </Modal>
      <Modal isOpen={salesLitigationTable.isEditOpen} onClose={() => salesLitigationTable.setIsEditOpen(false)} title="Edit Sales Tax Litigation Details">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!salesLitigationTable.selectedItem) return;
            salesLitigationTable.updateItem({ id: salesLitigationTable.selectedItem.id, ...salesLitForm });
            salesLitigationTable.setIsEditOpen(false);
            showToast("Litigation Case details saved.");
          }}
          className="space-y-4"
        >
          <FormField label="Client Name" value={salesLitForm.name} onChange={(v) => setSalesLitForm({ ...salesLitForm, name: v })} required />
          <FormField label="Case Type/Description" value={salesLitForm.caseType} onChange={(v) => setSalesLitForm({ ...salesLitForm, caseType: v })} required />
          <FormSelect label="Case Status" value={salesLitForm.status} onChange={(v) => setSalesLitForm({ ...salesLitForm, status: v })} options={["Ongoing", "Hearing", "Closed"]} />
          <div className="flex gap-3">
            <FormField label="Agreed Fee" value={salesLitForm.amount} onChange={(v) => setSalesLitForm({ ...salesLitForm, amount: v })} required />
            <FormField label="Fee Received" value={salesLitForm.received} onChange={(v) => setSalesLitForm({ ...salesLitForm, received: v })} required />
          </div>
          <FormField label="Next Hearing Date" value={salesLitForm.nextHearing} onChange={(v) => setSalesLitForm({ ...salesLitForm, nextHearing: v })} />
          <FormActions onCancel={() => salesLitigationTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={salesLitigationTable.isConfirmOpen} onClose={() => salesLitigationTable.setIsConfirmOpen(false)} onConfirm={() => { if (salesLitigationTable.selectedItem) salesLitigationTable.deleteItem(salesLitigationTable.selectedItem.id); showToast("Litigation Case cleared", "error"); }} title="Delete Litigation Case" message={`Delete litigation case for "${salesLitigationTable.selectedItem?.name}"?`} />

      {/* PKCompanyReg Add/Edit */}
      <Modal isOpen={companyRegTable.isAddOpen} onClose={() => companyRegTable.setIsAddOpen(false)} title="Onboard SECP Company Registration">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            companyRegTable.addItem({ id: String(Date.now()), ...compRegForm });
            companyRegTable.setIsAddOpen(false);
            showToast(`Company ${compRegForm.companyName} registered!`);
          }}
          className="space-y-4"
        >
          <FormField label="Client Name" value={compRegForm.name} onChange={(v) => setCompRegForm({ ...compRegForm, name: v })} required />
          <FormField label="Company Name" value={compRegForm.companyName} onChange={(v) => setCompRegForm({ ...compRegForm, companyName: v })} placeholder="e.g. Apex Tech Pvt Ltd" required />
          <FormField label="Phone Number" value={compRegForm.phone} onChange={(v) => setCompRegForm({ ...compRegForm, phone: v })} required />
          <div className="flex gap-3">
            <FormSelect label="Registration Type" value={compRegForm.regType} onChange={(v) => setCompRegForm({ ...compRegForm, regType: v })} options={["Private Limited", "Single Member Company", "Partnership (AOP)", "Sole Proprietorship"]} />
            <FormField label="Payment Amount" value={compRegForm.amount} onChange={(v) => setCompRegForm({ ...compRegForm, amount: v })} required />
          </div>
          <FormSelect label="Payment Status" value={compRegForm.status} onChange={(v) => setCompRegForm({ ...compRegForm, status: v })} options={["Pending", "Partial", "Paid"]} />
          <FormActions onCancel={() => companyRegTable.setIsAddOpen(false)} submitLabel="Onboard Client" />
        </form>
      </Modal>
      <Modal isOpen={companyRegTable.isEditOpen} onClose={() => companyRegTable.setIsEditOpen(false)} title="Edit Registration Details">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!companyRegTable.selectedItem) return;
            companyRegTable.updateItem({ id: companyRegTable.selectedItem.id, ...compRegForm });
            companyRegTable.setIsEditOpen(false);
            showToast("Registration records updated.");
          }}
          className="space-y-4"
        >
          <FormField label="Client Name" value={compRegForm.name} onChange={(v) => setCompRegForm({ ...compRegForm, name: v })} required />
          <FormField label="Company Name" value={compRegForm.companyName} onChange={(v) => setCompRegForm({ ...compRegForm, companyName: v })} required />
          <FormField label="Phone Number" value={compRegForm.phone} onChange={(v) => setCompRegForm({ ...compRegForm, phone: v })} required />
          <div className="flex gap-3">
            <FormSelect label="Registration Type" value={compRegForm.regType} onChange={(v) => setCompRegForm({ ...compRegForm, regType: v })} options={["Private Limited", "Single Member Company", "Partnership (AOP)", "Sole Proprietorship"]} />
            <FormField label="Payment Amount" value={compRegForm.amount} onChange={(v) => setCompRegForm({ ...compRegForm, amount: v })} required />
          </div>
          <FormSelect label="Payment Status" value={compRegForm.status} onChange={(v) => setCompRegForm({ ...compRegForm, status: v })} options={["Pending", "Partial", "Paid"]} />
          <FormActions onCancel={() => companyRegTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ViewDrawer isOpen={companyRegTable.isViewOpen} onClose={() => companyRegTable.setIsViewOpen(false)} title={companyRegTable.selectedItem?.companyName || "Company File"}>
        {companyRegTable.selectedItem && (
          <div className="space-y-4">
            <DetailCard label="Company Details" items={[["Company Legal Name", companyRegTable.selectedItem.companyName], ["Sponsor / Contact Client", companyRegTable.selectedItem.name], ["Phone Number", companyRegTable.selectedItem.phone]]} />
            <DetailCard label="Incorporation details" items={[["Registration Class", companyRegTable.selectedItem.regType], ["Consulting Fee", companyRegTable.selectedItem.amount], ["Fee Status", companyRegTable.selectedItem.status]]} />
          </div>
        )}
      </ViewDrawer>
      <ConfirmDialog isOpen={companyRegTable.isConfirmOpen} onClose={() => companyRegTable.setIsConfirmOpen(false)} onConfirm={() => { if (companyRegTable.selectedItem) companyRegTable.deleteItem(companyRegTable.selectedItem.id); showToast("Registration deleted", "error"); }} title="Delete Registration Record" message={`Remove SECP file for "${companyRegTable.selectedItem?.companyName}"?`} />

      {/* PKCompanyReturn Add/Edit */}
      <Modal isOpen={companyReturnTable.isAddOpen} onClose={() => companyReturnTable.setIsAddOpen(false)} title="Create Statutory Return Log">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            companyReturnTable.addItem({ id: String(Date.now()), ...compRetForm });
            companyReturnTable.setIsAddOpen(false);
            showToast("Statutory Return logged.");
          }}
          className="space-y-4"
        >
          <FormField label="Company Legal Name" value={compRetForm.companyName} onChange={(v) => setCompRetForm({ ...compRetForm, companyName: v })} required />
          <FormField label="Return Calendar Year" value={compRetForm.year} onChange={(v) => setCompRetForm({ ...compRetForm, year: v })} required />
          <FormSelect label="SECP Filing Status" value={compRetForm.status} onChange={(v) => setCompRetForm({ ...compRetForm, status: v })} options={["Pending", "In Review", "Filed"]} />
          <FormField label="Filed On Date" value={compRetForm.filedOn} onChange={(v) => setCompRetForm({ ...compRetForm, filedOn: v })} />
          <FormField label="Remarks" value={compRetForm.remarks} onChange={(v) => setCompRetForm({ ...compRetForm, remarks: v })} />
          <FormActions onCancel={() => companyReturnTable.setIsAddOpen(false)} submitLabel="Create Return" />
        </form>
      </Modal>
      <Modal isOpen={companyReturnTable.isEditOpen} onClose={() => companyReturnTable.setIsEditOpen(false)} title="Modify Statutory Return">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!companyReturnTable.selectedItem) return;
            companyReturnTable.updateItem({ id: companyReturnTable.selectedItem.id, ...compRetForm });
            companyReturnTable.setIsEditOpen(false);
            showToast("Statutory Return details saved.");
          }}
          className="space-y-4"
        >
          <FormField label="Company Legal Name" value={compRetForm.companyName} onChange={(v) => setCompRetForm({ ...compRetForm, companyName: v })} required />
          <FormField label="Return Calendar Year" value={compRetForm.year} onChange={(v) => setCompRetForm({ ...compRetForm, year: v })} required />
          <FormSelect label="SECP Filing Status" value={compRetForm.status} onChange={(v) => setCompRetForm({ ...compRetForm, status: v })} options={["Pending", "In Review", "Filed"]} />
          <FormField label="Filed On Date" value={compRetForm.filedOn} onChange={(v) => setCompRetForm({ ...compRetForm, filedOn: v })} required />
          <FormField label="Remarks" value={compRetForm.remarks} onChange={(v) => setCompRetForm({ ...compRetForm, remarks: v })} />
          <FormActions onCancel={() => companyReturnTable.setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ConfirmDialog isOpen={companyReturnTable.isConfirmOpen} onClose={() => companyReturnTable.setIsConfirmOpen(false)} onConfirm={() => { if (companyReturnTable.selectedItem) companyReturnTable.deleteItem(companyReturnTable.selectedItem.id); showToast("Return log cleared", "error"); }} title="Delete Return Log" message={`Remove statutory returns log for "${companyReturnTable.selectedItem?.companyName}"?`} />

      {/* US/DE International Tax Modal Add/Edit */}
      <Modal isOpen={(activeCountry === "US" ? usTaxTable : deTaxTable).isAddOpen} onClose={() => (activeCountry === "US" ? usTaxTable : deTaxTable).setIsAddOpen(false)} title={`Onboard ${activeCountry === "US" ? "USA" : "Germany"} Taxation Client`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const table = activeCountry === "US" ? usTaxTable : deTaxTable;
            table.addItem({ id: String(Date.now()), ...intlForm });
            table.setIsAddOpen(false);
            showToast(`International Client ${intlForm.name} onboarded!`);
          }}
          className="space-y-4"
        >
          <FormField label="Client Name" value={intlForm.name} onChange={(v) => setIntlForm({ ...intlForm, name: v })} placeholder="e.g. Hans Müller" required />
          <FormField label={activeCountry === "US" ? "Tax ID / SSN" : "Steuer-ID"} value={intlForm.taxId} onChange={(v) => setIntlForm({ ...intlForm, taxId: v })} required />
          <FormField label="Phone Number" value={intlForm.phone} onChange={(v) => setIntlForm({ ...intlForm, phone: v })} required />
          <FormField label="Service Type" value={intlForm.serviceType} onChange={(v) => setIntlForm({ ...intlForm, serviceType: v })} required />
          <div className="flex gap-3">
            <FormField label="Payment Amount" value={intlForm.amount} onChange={(v) => setIntlForm({ ...intlForm, amount: v })} required />
            <FormSelect label="Payment Status" value={intlForm.status} onChange={(v) => setIntlForm({ ...intlForm, status: v })} options={["Pending", "Partial", "Paid"]} />
          </div>
          <FormActions onCancel={() => (activeCountry === "US" ? usTaxTable : deTaxTable).setIsAddOpen(false)} submitLabel="Onboard Client" />
        </form>
      </Modal>
      <Modal isOpen={(activeCountry === "US" ? usTaxTable : deTaxTable).isEditOpen} onClose={() => (activeCountry === "US" ? usTaxTable : deTaxTable).setIsEditOpen(false)} title={`Edit ${activeCountry === "US" ? "USA" : "Germany"} Client details`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const table = activeCountry === "US" ? usTaxTable : deTaxTable;
            if (!table.selectedItem) return;
            table.updateItem({ id: table.selectedItem.id, ...intlForm });
            table.setIsEditOpen(false);
            showToast("International client records updated.");
          }}
          className="space-y-4"
        >
          <FormField label="Client Name" value={intlForm.name} onChange={(v) => setIntlForm({ ...intlForm, name: v })} required />
          <FormField label={activeCountry === "US" ? "Tax ID / SSN" : "Steuer-ID"} value={intlForm.taxId} onChange={(v) => setIntlForm({ ...intlForm, taxId: v })} required />
          <FormField label="Phone Number" value={intlForm.phone} onChange={(v) => setIntlForm({ ...intlForm, phone: v })} required />
          <FormField label="Service Type" value={intlForm.serviceType} onChange={(v) => setIntlForm({ ...intlForm, serviceType: v })} required />
          <div className="flex gap-3">
            <FormField label="Payment Amount" value={intlForm.amount} onChange={(v) => setIntlForm({ ...intlForm, amount: v })} required />
            <FormSelect label="Payment Status" value={intlForm.status} onChange={(v) => setIntlForm({ ...intlForm, status: v })} options={["Pending", "Partial", "Paid"]} />
          </div>
          <FormActions onCancel={() => (activeCountry === "US" ? usTaxTable : deTaxTable).setIsEditOpen(false)} submitLabel="Save Changes" />
        </form>
      </Modal>
      <ViewDrawer isOpen={(activeCountry === "US" ? usTaxTable : deTaxTable).isViewOpen} onClose={() => (activeCountry === "US" ? usTaxTable : deTaxTable).setIsViewOpen(false)} title={(activeCountry === "US" ? usTaxTable : deTaxTable).selectedItem?.name || "Client File"}>
        {((activeCountry === "US" ? usTaxTable : deTaxTable).selectedItem) && (
          <div className="space-y-4">
            <DetailCard label="International Client Profile" items={[
              ["Name", (activeCountry === "US" ? usTaxTable : deTaxTable).selectedItem!.name],
              [activeCountry === "US" ? "Tax ID / SSN" : "Steuer-ID", (activeCountry === "US" ? usTaxTable : deTaxTable).selectedItem!.taxId],
              ["Phone Number", (activeCountry === "US" ? usTaxTable : deTaxTable).selectedItem!.phone]
            ]} />
            <DetailCard label="Service Overview" items={[
              ["Service Class", (activeCountry === "US" ? usTaxTable : deTaxTable).selectedItem!.serviceType],
              ["Total Fee", (activeCountry === "US" ? usTaxTable : deTaxTable).selectedItem!.amount],
              ["Filing Status", (activeCountry === "US" ? usTaxTable : deTaxTable).selectedItem!.status]
            ]} />
          </div>
        )}
      </ViewDrawer>
      <ConfirmDialog isOpen={(activeCountry === "US" ? usTaxTable : deTaxTable).isConfirmOpen} onClose={() => (activeCountry === "US" ? usTaxTable : deTaxTable).setIsConfirmOpen(false)} onConfirm={() => {
        const table = activeCountry === "US" ? usTaxTable : deTaxTable;
        if (table.selectedItem) table.deleteItem(table.selectedItem.id);
        showToast("International record removed", "error");
      }} title="Delete Client" message={`Delete client "${(activeCountry === "US" ? usTaxTable : deTaxTable).selectedItem?.name}" from international tax records?`} />

    </>
  );
}

// ── Taxation Accordion Navigation ────────────────────────────────────────

function TaxAccordion({
  title,
  icon: Icon,
  tone,
  items,
  activeItem,
  expanded = false,
  onSelect,
}: {
  title: string;
  icon: LucideIcon;
  tone: string;
  items: string[];
  activeItem?: string;
  expanded?: boolean;
  onSelect: (service: string) => void;
}) {
  return (
    <div>
      <button
        onClick={() => onSelect(title)}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
          expanded ? "bg-emerald-50" : "bg-slate-50 hover:bg-slate-100"
        }`}
      >
        <Icon size={18} className={tone} />
        <span className="flex-1 text-sm font-extrabold text-slate-900">{title}</span>
        <ChevronDown size={16} className={`text-slate-400 ${expanded ? "" : "-rotate-90"}`} />
      </button>
      <div className={`mt-2 space-y-1 pl-4 ${expanded ? "" : "hidden"}`}>
        {items.map((item) => (
          <div
            key={item}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-500`}
          >
            <span className="h-2 w-2 rounded-full border border-slate-300 bg-slate-400" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── International Tax Summary KPI Card ───────────────────────────────────

function InternationalTaxCard({
  icon: Icon,
  title,
  value,
  detail,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm font-extrabold text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-950">{value}</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">{detail}</p>
        </div>
      </div>
    </div>
  );
}

// Form Actions subcomponent
function FormActions({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) {
  return (
    <div className="flex justify-end gap-3 pt-3">
      <button type="button" onClick={onCancel} className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-extrabold text-slate-600 hover:bg-slate-50 bg-white">Cancel</button>
      <button type="submit" className="h-10 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-soft bg-emerald-600 hover:bg-emerald-700">{submitLabel}</button>
    </div>
  );
}

// Form Field subcomponent
function FormField({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <label className="block flex-1">
      <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</span>
      <input type="text" required={required} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand bg-white" placeholder={placeholder} />
    </label>
  );
}

// Form Select subcomponent
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

// Detail Card subcomponent
function DetailCard({ label, items }: { label: string; items: [string, string][] }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card space-y-3">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{label}</span>
      {items.map(([k, v]) => <p key={k} className="text-sm font-semibold text-slate-600">{k}: <b className="text-slate-800">{v}</b></p>)}
    </div>
  );
}
