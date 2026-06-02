export function ProgressBar({ value }: { value: string }) {
  const pct = Number(value.replace("%", ""));
  const color =
    pct > 70
      ? "bg-emerald-500"
      : pct >= 40
      ? "bg-orange-500"
      : "bg-red-500";

  return (
    <div className="flex min-w-40 items-center gap-2">
      <div className="h-2 w-28 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${color}`} style={{ width: value }} />
      </div>
      <span className="text-xs font-extrabold text-slate-600">{value}</span>
    </div>
  );
}
