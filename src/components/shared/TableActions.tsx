import { useState } from "react";
import { Search, Filter, Columns3, Check } from "lucide-react";

interface TableActionsProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (val: string) => void;
  filterOptions?: { label: string; value: string }[];
  columns?: string[];
  visibleColumns?: Record<string, boolean>;
  onToggleColumn?: (col: string) => void;
}

export function AmazonTableActions({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  filterValue = "",
  onFilterChange,
  filterOptions = [],
  columns = [],
  visibleColumns = {},
  onToggleColumn,
}: TableActionsProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3 relative">
      {/* Search Input */}
      <div className="flex h-10 min-w-64 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-brand transition">
        <Search size={16} className="text-slate-400" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400 text-slate-800"
          placeholder={searchPlaceholder}
        />
      </div>

      {/* Filter Button & Popover */}
      {filterOptions.length > 0 ? (
        <div className="relative">
          <button
            onClick={() => {
              setShowFilters(!showFilters);
              setShowColumns(false);
            }}
            className={`flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-extrabold transition shadow-sm bg-white ${
              filterValue
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Filter size={15} />
            Filters {filterValue ? `(Active)` : ""}
          </button>

          {showFilters ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 mt-2 z-20 w-56 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl animate-scale-up space-y-3">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Quick Filters</p>
                <div className="space-y-1">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onFilterChange?.(opt.value);
                        setShowFilters(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold transition ${
                        filterValue === opt.value
                          ? "bg-brand text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {opt.label}
                      {filterValue === opt.value ? <Check size={14} /> : null}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {/* Columns Toggle Popover */}
      {columns.length > 0 && onToggleColumn ? (
        <div className="relative">
          <button
            onClick={() => {
              setShowColumns(!showColumns);
              setShowFilters(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-sm"
            title="Toggle Columns"
          >
            <Columns3 size={17} />
          </button>

          {showColumns ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowColumns(false)} />
              <div className="absolute right-0 mt-2 z-20 w-56 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl animate-scale-up space-y-3 max-h-72 overflow-y-auto scrollbar-thin">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Visible Columns</p>
                <div className="space-y-1">
                  {columns.map((col) => {
                    const isVisible = visibleColumns[col] !== false;
                    return (
                      <button
                        key={col}
                        onClick={() => onToggleColumn(col)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                      >
                        {col}
                        {isVisible ? <Check size={14} className="text-emerald-500" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export const TableActions = AmazonTableActions;
