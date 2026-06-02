export function StatusBadge({ status }: { status: string }) {
  const high = status === "High";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${
        high ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-800"
      }`}
    >
      {status}
    </span>
  );
}

export function TaxStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Paid: "bg-green-100 text-green-700",
    Partial: "bg-yellow-100 text-yellow-700",
    Filed: "bg-green-100 text-green-700",
    "In Review": "bg-orange-100 text-orange-700",
    Pending: "bg-red-100 text-red-700",
    Ongoing: "bg-yellow-100 text-yellow-700",
    Hearing: "bg-orange-100 text-orange-700",
    Closed: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${
        styles[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export function AmazonPill({ value }: { value: string }) {
  const styles: Record<string, string> = {
    Yes: "bg-green-100 text-green-700",
    No: "bg-red-100 text-red-700",
    Paid: "bg-green-100 text-green-700",
    Partial: "bg-orange-100 text-orange-700",
    Overdue: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${
        styles[value] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {value}
    </span>
  );
}

export function AmazonTaskBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Not Started": "bg-blue-100 text-blue-700",
    "In Progress": "bg-yellow-100 text-yellow-800",
    Completed: "bg-green-100 text-green-700",
    "On Hold": "bg-violet-100 text-violet-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${
        styles[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export function PriorityBadge({ label }: { label: string }) {
  const styles: Record<string, string> = {
    "High Priority": "bg-red-100 text-red-700",
    "Medium Priority": "bg-yellow-100 text-yellow-800",
    "Low Priority": "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`inline-flex h-fit whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-extrabold ${
        styles[label] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {label}
    </span>
  );
}

export function LanguagePriorityBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${
        styles[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export function InvestmentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    "Under Review": "bg-yellow-100 text-yellow-700",
    "At Risk": "bg-red-100 text-red-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
    Delivered: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    "Not Sent": "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${
        styles[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export function EngagementBadge({ tone, label }: { tone: string; label: string }) {
  const styles: Record<string, string> = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`inline-flex h-fit whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-extrabold ${
        styles[tone] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {label}
    </span>
  );
}

export function MarketingStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    "Needs Attention": "bg-yellow-100 text-yellow-700",
    Inactive: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${
        styles[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export function SystemStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Enabled: "bg-green-100 text-green-700",
    Completed: "bg-green-100 text-green-700",
    Reviewed: "bg-green-100 text-green-700",
    "Draft Ready": "bg-blue-100 text-blue-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Scheduled: "bg-violet-100 text-violet-700",
    Draft: "bg-slate-100 text-slate-700",
    Saved: "bg-slate-100 text-slate-700",
    Optional: "bg-orange-100 text-orange-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${
        styles[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export function ImmigrationStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "In Progress": "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
    "Not Started": "bg-slate-100 text-slate-700",
    "At Risk": "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${
        styles[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export function ProgressBar({ value }: { value: string }) {
  const pct = Number(value.replace("%", ""));
  const color = pct > 70 ? "bg-emerald-500" : pct >= 40 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="flex min-w-40 items-center gap-2">
      <div className="h-2 w-28 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${color}`} style={{ width: value }} />
      </div>
      <span className="text-xs font-extrabold text-slate-600">{value}</span>
    </div>
  );
}
