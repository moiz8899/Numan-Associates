import { useState } from "react";
import { FileText, ClipboardList, Columns3, Shield } from "lucide-react";
import { Card } from "../../components/shared/Card";
import { KpiCard } from "../../components/shared/KpiCard";
import { ActionIcons } from "../../components/shared/ActionIcons";
import { SystemStatusBadge } from "../../components/shared/badges";
import { aiAssistantUseCases } from "../../data/system";
import { useTable } from "../../hooks/useTable";
import { Toast, type ToastType } from "../../components/shared/Toast";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { PaginatedTableFooter } from "../../components/shared/TableFooter";

interface DraftRecord {
  id: string;
  name: string;
  category: string;
  period: string;
  preparedBy: string;
  status: string;
}

export function AiAssistantDashboard() {
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("Draft a client follow-up message for missing tax documents.");
  const [selectedService, setSelectedService] = useState("Taxation Services");
  const enabled = apiKey.trim().length > 0;

  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const showToast = (msg: string, type: ToastType = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // useTable hook for drafts (using reports table)
  const draftsTable = useTable<DraftRecord>({
    initialData: [],
    searchFields: ["name", "period", "status"],
    defaultPageSize: 5,
    supabaseTable: "reports",
    supabaseFilter: { column: "category", value: "AI Draft" },
  });

  const handleSelectService = (service: string) => {
    setSelectedService(service);
    if (service === "Taxation Services") {
      setPrompt("Draft a client follow-up message for missing tax documents.");
    } else if (service === "Law Services") {
      setPrompt("Draft a legal retainer agreement brief for corporate consulting.");
    } else if (service === "Immigration Services") {
      setPrompt("Draft a checklist for US B-1/B-2 visa documentation requirements.");
    }
  };

  const handleGenerateDraft = async () => {
    if (!enabled) return;
    try {
      const generatedTitle = prompt.length > 50 ? prompt.substring(0, 47) + "..." : prompt;
      const newDraft: DraftRecord = {
        id: String(Date.now()),
        name: `AI Draft: ${generatedTitle}`,
        category: "AI Draft",
        period: selectedService,
        preparedBy: "AI Assistant",
        status: "Needs Review",
      };
      await draftsTable.addItem(newDraft);
      showToast("AI Draft generated and saved!");
    } catch (err) {
      showToast("Failed to save draft to Supabase", "error");
    }
  };

  const draftCount = draftsTable.data.length;
  const summariesCount = draftsTable.data.filter((d) => d.status === "Completed").length;
  const templatesCount = aiAssistantUseCases.length;
  const needsReviewCount = draftsTable.data.filter((d) => d.status === "Needs Review").length;

  const kpis = [
    { label: "Drafts Created", value: String(draftCount), change: "", trend: "positive", icon: FileText, color: "#1a73e8", bg: "bg-blue-50" },
    { label: "Summaries", value: String(summariesCount), change: "", trend: "positive", icon: ClipboardList, color: "#16a34a", bg: "bg-green-50" },
    { label: "Templates", value: String(templatesCount), change: "", trend: "positive", icon: Columns3, color: "#7c3aed", bg: "bg-violet-50" },
    { label: "Needs Review", value: String(needsReviewCount), change: "", trend: "negative", icon: Shield, color: "#f97316", bg: "bg-orange-50" },
  ];

  return (
    <>
      <Toast message={toastMessage} type={toastType} isOpen={toastOpen} onClose={() => setToastOpen(false)} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.8fr)]">
        <div className="space-y-6">
          <Card
            title="AI Assistant Setup"
            subtext="AI features are optional. Add your API key to enable draft generation inside this workspace."
          >
            <div className="space-y-4 p-5">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
                <input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  type="password"
                  className="h-12 rounded-xl border border-slate-300 px-4 text-sm font-bold outline-none focus:border-brand"
                  placeholder="Put your API key to use AI"
                />
                <button
                  className={`h-12 rounded-xl px-5 text-sm font-extrabold shadow-soft ${
                    enabled ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {enabled ? "AI Enabled" : "AI Optional"}
                </button>
              </div>
              <p className="text-sm font-semibold leading-6 text-slate-500">
                The dashboard does not require AI to operate. Without a key, templates and manual notes remain
                available while generation controls stay locked.
              </p>
            </div>
          </Card>

          <Card
            title="Prompt Workspace"
            subtext="Choose a service context, write an instruction, then generate a draft after enabling AI."
            action={
              <button
                disabled={!enabled}
                onClick={handleGenerateDraft}
                className={`h-10 rounded-xl px-4 text-sm font-extrabold transition duration-150 ${
                  enabled ? "bg-brand text-white shadow-soft hover:bg-blue-700" : "bg-slate-100 text-slate-400"
                }`}
              >
                Generate Draft
              </button>
            }
          >
            <div className="space-y-4 p-5">
              <div className="grid gap-3 md:grid-cols-3">
                {["Taxation Services", "Law Services", "Immigration Services"].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSelectService(item)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-extrabold transition duration-150 ${
                      selectedService === item
                        ? "border-blue-600 bg-blue-50 text-brand"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-40 w-full rounded-xl border border-slate-300 p-4 text-sm font-semibold leading-6 outline-none focus:border-brand"
              />
              <div
                className={`rounded-xl border p-4 ${
                  enabled ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
                }`}
              >
                <p className={`text-sm font-extrabold ${enabled ? "text-emerald-700" : "text-slate-500"}`}>
                  {enabled ? "Ready to generate with your API key." : "AI generation is locked until an API key is entered."}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Recent AI Drafts">
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {["#", "Draft", "Service / Context", "Status", "Prepared By", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 font-extrabold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {draftsTable.paginatedData.map((row, index) => (
                    <tr key={row.id} className="text-sm hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {(draftsTable.currentPage - 1) * draftsTable.pageSize + index + 1}
                      </td>
                      <td className="px-4 py-3 font-extrabold text-slate-900">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {row.period}
                      </td>
                      <td className="px-4 py-3">
                        <SystemStatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {row.preparedBy}
                      </td>
                      <td className="px-4 py-3">
                        <ActionIcons
                          onDelete={() => draftsTable.selectItemForAction(row, "delete")}
                        />
                      </td>
                    </tr>
                  ))}
                  {draftsTable.paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm font-bold text-slate-400">
                        No drafts created yet
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <PaginatedTableFooter
              currentPage={draftsTable.currentPage}
              totalPages={draftsTable.totalPages}
              pageSize={draftsTable.pageSize}
              totalItems={draftsTable.filteredData.length}
              onPageChange={draftsTable.setCurrentPage}
              onPageSizeChange={draftsTable.setPageSize}
            />
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="AI Use Cases">
            <div className="divide-y divide-slate-100">
              {aiAssistantUseCases.map(([title, detail, service]) => (
                <div key={title} className="px-5 py-4">
                  <p className="text-sm font-extrabold text-slate-900">{title}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{detail}</p>
                  <span className="mt-2 inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-extrabold text-blue-700">
                    {service}
                  </span>
                </div>
              ))}
              {aiAssistantUseCases.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm font-bold text-slate-400">
                  No use cases listed. Set API key to show presets.
                </div>
              ) : null}
            </div>
          </Card>
          <Card title="Optional AI Policy">
            <div className="space-y-3 p-5 text-sm font-semibold leading-6 text-slate-500">
              <p>Use the app normally without AI, or enable generation by entering an API key.</p>
              <p>Generated drafts should be reviewed by staff before sending to clients.</p>
              <p>Keep sensitive client details limited to what is needed for the task.</p>
            </div>
          </Card>
        </aside>
      </section>

      <ConfirmDialog
        isOpen={draftsTable.isConfirmOpen}
        onClose={() => draftsTable.setIsConfirmOpen(false)}
        onConfirm={async () => {
          if (draftsTable.selectedItem) {
            await draftsTable.deleteItem(draftsTable.selectedItem.id);
            showToast("Draft deleted", "error");
          }
        }}
        title="Delete Draft"
        message="Are you sure you want to delete this draft?"
      />
    </>
  );
}
