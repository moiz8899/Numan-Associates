import { Eye, Pencil, Trash2 } from "lucide-react";

interface ActionIconsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ActionIcons({ onView, onEdit, onDelete }: ActionIconsProps) {
  return (
    <div className="flex items-center gap-2 text-slate-500">
      {onView ? (
        <button
          onClick={onView}
          className="rounded-lg p-1.5 hover:bg-blue-50 hover:text-brand transition duration-150"
          title="View Details"
        >
          <Eye size={16} />
        </button>
      ) : null}
      {onEdit ? (
        <button
          onClick={onEdit}
          className="rounded-lg p-1.5 hover:bg-emerald-50 hover:text-emerald-600 transition duration-150"
          title="Edit Record"
        >
          <Pencil size={16} />
        </button>
      ) : null}
      {onDelete ? (
        <button
          onClick={onDelete}
          className="rounded-lg p-1.5 hover:bg-rose-50 hover:text-rose-600 transition duration-150"
          title="Delete Record"
        >
          <Trash2 size={16} />
        </button>
      ) : null}
    </div>
  );
}
