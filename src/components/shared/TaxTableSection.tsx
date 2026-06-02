import type { ReactNode } from "react";
import { Search, Filter, Columns3 } from "lucide-react";

interface TaxTableSectionProps {
  title: string;
  description?: string;
  columns: string[];
  footer: string;
  children: ReactNode;
  greenTitle?: boolean;
}

export function TaxTableSection({
  title,
  description,
  columns,
  footer,
  children,
  greenTitle = false,
}: TaxTableSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className={`text-xl font-extrabold ${greenTitle ? "text-emerald-600" : "text-slate-950"}`}>{title}</h3>
          {description ? <p className="mt-1 text-sm font-semibold text-slate-500">{description}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-10 min-w-64 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
            <Search size={16} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
              placeholder="Search table..."
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
            <Filter size={17} />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
            <Columns3 size={17} />
          </button>
        </div>
      </div>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-extrabold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-500">{footer}</p>
        <div className="flex items-center gap-1">
          {["<", "1", "2", "3", "4", "5", ">"].map((page) => (
            <button
              key={page}
              className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-extrabold ${
                page === "1" ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
