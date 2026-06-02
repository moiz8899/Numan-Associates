interface PaginatedTableFooterProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function PaginatedTableFooter({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginatedTableFooterProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Build page number buttons: show max 5 pages around current
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <p className="text-sm font-bold text-slate-500">
          Showing {startItem} to {endItem} of {totalItems} entries
        </p>
        {onPageSizeChange ? (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 outline-none focus:border-brand"
          >
            {[5, 10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        ) : null}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-extrabold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
        >
          &lt;
        </button>
        {pages.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="flex h-8 min-w-8 items-center justify-center text-sm font-bold text-slate-400">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-extrabold transition ${
                page === currentPage ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {page}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-extrabold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

// Legacy components kept for backward compatibility
interface TableFooterProps {
  text: string;
  pages: string[];
}

export function TableFooter({ text, pages }: TableFooterProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-bold text-slate-500">{text}</p>
      <div className="flex items-center gap-1">
        {pages.map((page) => (
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
  );
}

export function SimpleTableFooter({ text }: { text: string }) {
  return <div className="border-t border-slate-100 px-5 py-4 text-sm font-bold text-slate-500">{text}</div>;
}
