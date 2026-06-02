import type { ReactNode } from "react";

interface CardProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  subtext?: string;
}

export function Card({ title, children, action, subtext }: CardProps) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="flex min-w-0 flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
          {subtext ? <p className="mt-1 text-sm font-medium text-slate-500">{subtext}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
