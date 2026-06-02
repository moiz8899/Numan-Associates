interface ChartLegendItem {
  name: string;
  value: string | number;
  pct: string;
  color: string;
}

export function ChartLegend({ items }: { items: ChartLegendItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
          <span className="flex min-w-0 items-center gap-2 font-bold text-slate-700">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="truncate">{item.name}</span>
          </span>
          <span className="shrink-0 font-extrabold">
            {item.value} ({item.pct})
          </span>
        </div>
      ))}
    </div>
  );
}
