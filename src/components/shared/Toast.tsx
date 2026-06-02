import { useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "success", isOpen, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  const config = {
    success: {
      bg: "bg-emerald-50 border-emerald-100",
      text: "text-emerald-800",
      iconColor: "text-emerald-500",
      icon: CheckCircle,
    },
    error: {
      bg: "bg-rose-50 border-rose-100",
      text: "text-rose-800",
      iconColor: "text-rose-500",
      icon: AlertCircle,
    },
    info: {
      bg: "bg-blue-50 border-blue-100",
      text: "text-blue-800",
      iconColor: "text-blue-500",
      icon: Info,
    },
  }[type];

  const Icon = config.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border p-4 shadow-xl transition-all duration-300 animate-slide-in-bottom max-w-sm bg-white">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.iconColor}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-extrabold ${config.text}`}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition"
      >
        <X size={14} />
      </button>
    </div>
  );
}
