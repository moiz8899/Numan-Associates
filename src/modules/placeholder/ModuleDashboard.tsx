import type { ModuleDetail } from "../../types";
import { Card } from "../../components/shared/Card";

export function ModuleDashboard({ detail }: { detail: ModuleDetail }) {
  const Icon = detail.icon;

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-brand text-blue-600">
              <Icon size={30} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">{detail.title}</h2>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">{detail.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="h-11 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700">New Record</button>
            <button className="h-11 rounded-xl border border-slate-300 px-5 text-sm font-extrabold text-slate-600 hover:bg-slate-50">View Report</button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {detail.stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-sm font-bold text-slate-500">{stat.label}</p>
            <p className={`mt-3 text-3xl font-extrabold ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <Card title={`${detail.title} Pipeline`} subtext="Use this area to test the module flow from intake to completion.">
          <div className="grid gap-4 p-5 md:grid-cols-2">
            {detail.workflow.map((step, index) => (
              <div key={step} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Step {index + 1}</p>
                <p className="mt-2 text-base font-extrabold text-slate-900">{step}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Module workspace card ready for real records, forms, and actions.</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent Activity">
          <div className="flex h-40 items-center justify-center text-sm font-bold text-slate-400">
            No recent activity
          </div>
        </Card>
      </section>
    </>
  );
}
