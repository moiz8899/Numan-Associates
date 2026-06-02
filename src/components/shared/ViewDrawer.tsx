import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function ViewDrawer({ isOpen, onClose, title, children }: ViewDrawerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in">
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-out Drawer Panel */}
      <div className="relative h-full w-full max-w-lg border-l border-slate-100 bg-white shadow-2xl transition-transform duration-300 transform translate-x-0 animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Record Overview</span>
            <h3 className="text-lg font-extrabold text-slate-950 mt-0.5">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6 bg-slate-50/50">
          {children}
        </div>
      </div>
    </div>
  );
}
