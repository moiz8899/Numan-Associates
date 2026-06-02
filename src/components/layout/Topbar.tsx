import { useEffect, useState } from "react";
import {
  Bell,
  Calendar,
  ChevronDown,
  Menu,
  MessageSquare,
  Search,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { fdsModule, mainNav, moduleDetails, systemNav } from "../../data/navigation";
import { supabase } from "../../lib/supabase";
import { Toast, type ToastType } from "../shared/Toast";
import { ConfirmDialog } from "../shared/ConfirmDialog";

interface TopbarProps {
  activeModule: string;
  onModuleSelect: (label: string) => void;
}

function IconButton({ icon: Icon, badge, onClick, label }: { icon: LucideIcon; badge?: string; onClick?: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative hidden h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 sm:flex"
    >
      <Icon size={19} />
      {badge ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export function Topbar({ activeModule, onModuleSelect }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("info");
  const [notificationPermission, setNotificationPermission] = useState("default");
  const [accountName, setAccountName] = useState("Admin User");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("topbarAccountName");
      const savedImage = localStorage.getItem("topbarProfileImageUrl");
      if (savedName) setAccountName(savedName);
      if (savedImage) setProfileImageUrl(savedImage);
    }
  }, []);

  const asDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const tableNames = [
    "clients",
    "tasks",
    "goals",
    "taxation_returns",
    "litigation_cases",
    "law_hearings",
    "reports",
    "reminders",
    "settings_users",
    "fds_history",
  ];

  const showToast = (message: string, type: ToastType = "info") => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const saveAccountProfile = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("topbarAccountName", accountName);
      localStorage.setItem("topbarProfileImageUrl", profileImageUrl);
    }
    showToast("Profile settings saved.", "success");
  };

  const handleProfileImageChange = async (file: File | null) => {
    if (!file) return;
    try {
      const dataUrl = await asDataUrl(file);
      setProfileImageUrl(dataUrl);
      if (typeof window !== "undefined") {
        localStorage.setItem("topbarProfileImageUrl", dataUrl);
      }
      showToast("Profile photo uploaded.", "success");
    } catch (error) {
      console.error(error);
      showToast("Unable to load photo.", "error");
    }
  };

  const clearAllData = async () => {
    setShowClearConfirm(false);
    showToast("Clearing all data...", "info");

    if (typeof window !== "undefined") {
      localStorage.clear();
    }

    for (const table of tableNames) {
      const { error } = await supabase.from(table).delete().neq("id", "");
      if (error) {
        console.error(`Clear data failed for ${table}:`, error.message || error);
      }
    }

    setProfileImageUrl("");
    setAccountName("Admin User");
    setShowNotifications(false);
    setShowMessages(false);
    setShowProfileMenu(false);
    showToast("All data cleared from Supabase and local storage.", "success");

    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const requestBrowserNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const sendBrowserNotification = (title: string, body: string) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  const handleCalendarClick = () => {
    setShowNotifications(false);
    setShowMessages(false);
    setShowProfileMenu(false);
    showToast("Opening calendar actions.", "info");
  };

  const notifications = [
    { id: "1", title: "New client onboarded", detail: "A new client has been added to the system." },
    { id: "2", title: "Invoice pending", detail: "Invoice #493 is due tomorrow." },
    { id: "3", title: "System update", detail: "New dashboard improvements are available." },
  ];

  const messages = [
    { id: "1", title: "Support request", detail: "A user requested access to the reports module." },
    { id: "2", title: "Task note", detail: "Please review the client follow-up task." },
    { id: "3", title: "Reminder", detail: "Meeting with legal team at 3:00 PM." },
  ];

  const handleBellClick = async () => {
    setShowNotifications((prev) => !prev);
    setShowMessages(false);
    setShowProfileMenu(false);
    await requestBrowserNotificationPermission();
    if (Notification.permission === "granted") {
      sendBrowserNotification("Dashboard Alert", "You have new notifications waiting.");
    }
  };

  const handleMessageClick = () => {
    setShowMessages((prev) => !prev);
    setShowNotifications(false);
    setShowProfileMenu(false);
    showToast("Opening messages.", "info");
  };

  const handleProfileClick = () => {
    setShowProfileMenu((prev) => !prev);
    setShowNotifications(false);
    setShowMessages(false);
    showToast("Opening profile menu.", "info");
  };

  const handleMobileNavigation = (label: string) => {
    onModuleSelect(label);
    setShowMobileNav(false);
  };

  useEffect(() => {
    if (!showProfileMenu && !showMobileNav) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowProfileMenu(false);
        setShowMobileNav(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showProfileMenu, showMobileNav]);

  const initials = accountName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const detail = moduleDetails[activeModule];
  const Icon = activeModule === fdsModule ? WalletCards : detail.icon;
  const title = activeModule === fdsModule ? "Financial Diversification System" : detail.title;
  const subtitle = activeModule === fdsModule ? "Surplus Allocation System" : detail.subtitle;

  const placeholder =
    activeModule === "Home Dashboard"
      ? "Search clients, tasks, invoices..."
      : activeModule === "Taxation Services"
      ? "Search clients, CNIC, PIN, return status..."
      : activeModule === "Amazon Services"
      ? "Search clients, ASIN, SKU, orders..."
      : activeModule === "Law Services"
      ? "Search clients, case number, matter, status..."
      : activeModule === "Immigration Services"
      ? "Search clients, visa type, case number, status..."
      : activeModule === "Language Services"
      ? "Search clients, language, project, status..."
      : activeModule === "Investment Services"
      ? "Search clients, portfolio, asset class, status..."
      : activeModule === "Academic Services"
      ? "Search clients, thesis, research project, status..."
      : activeModule === "Marketing Services"
      ? "Search pages, campaigns, platforms, status..."
      : activeModule === "Training Services"
      ? "Search clients, programs, workshops, status..."
      : activeModule === "AI Assistant"
      ? "Search prompts, drafts, templates..."
      : activeModule === "Calendar & Reminders"
      ? "Search reminders, events, clients, owners..."
      : activeModule === "Reports & Analytics"
      ? "Search reports, metrics, services, exports..."
      : activeModule === "Search & Filters"
      ? "Search all clients, files, tasks, reports..."
      : activeModule === "Settings"
      ? "Search users, roles, modules, preferences..."
      : `Search ${title.toLowerCase()}...`;

  return (
    <header className="sticky top-0 z-20 w-full max-w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-20 min-w-0 items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setShowMobileNav(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 lg:hidden"
          aria-label="Open mobile menu"
        >
          <Menu size={22} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <Icon size={28} className="shrink-0 text-slate-800" />
            <h1 className="truncate text-xl font-extrabold text-slate-950 sm:text-2xl">{title}</h1>
          </div>
          <p className="ml-10 mt-1 line-clamp-1 text-sm font-semibold text-slate-500">{subtitle}</p>
        </div>
        <div className="mx-auto hidden max-w-xl flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:flex">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
            placeholder={placeholder}
          />
        </div>
        <div className="relative flex shrink-0 items-center gap-2">
          <IconButton icon={Calendar} label="Calendar actions" onClick={handleCalendarClick} />
          <IconButton icon={Bell} badge="8" label="Notifications" onClick={handleBellClick} />
          <IconButton icon={MessageSquare} badge="3" label="Messages" onClick={handleMessageClick} />
          <button
            type="button"
            onClick={handleProfileClick}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-2 shadow-sm sm:gap-3 sm:px-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-extrabold text-white">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span>{initials || "AU"}</span>
              )}
            </div>
            <div className="hidden text-left xl:block">
              <p className="text-sm font-bold text-slate-900">{accountName}</p>
              <p className="text-xs font-medium text-slate-500">Super Admin</p>
            </div>
            <ChevronDown size={17} className="text-slate-500" />
          </button>

          {showNotifications ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 z-20 w-80 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
                <p className="text-sm font-bold text-slate-900">Notifications</p>
                <div className="mt-3 space-y-3">
                  {notifications.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {showMessages ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMessages(false)} />
              <div className="absolute right-0 top-full mt-2 z-20 w-80 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
                <p className="text-sm font-bold text-slate-900">Messages</p>
                <div className="mt-3 space-y-3">
                  {messages.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {showProfileMenu ? (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 top-full mt-2 z-40 w-96 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-slate-900">Profile Settings</p>
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(false)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:bg-slate-100"
                    aria-label="Close profile settings"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-3xl bg-slate-200">
                    {profileImageUrl ? (
                      <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-extrabold uppercase text-slate-600">
                        {initials || "AU"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{accountName}</p>
                    <p className="text-xs text-slate-500">Super Admin</p>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Account Name</span>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Upload profile picture</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProfileImageChange(e.target.files?.[0] ?? null)}
                      className="mt-2 w-full text-sm text-slate-600"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={saveAccountProfile}
                    className="w-full rounded-2xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-soft hover:bg-blue-700 transition"
                  >
                    Save profile settings
                  </button>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-sm font-extrabold text-rose-700 hover:bg-rose-100 transition"
                  >
                    Clear all data from modules
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
      {showMobileNav ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/40" onClick={() => setShowMobileNav(false)} />
          <div className="relative h-full w-full max-w-xs bg-slate-950 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div>
                <p className="text-sm font-extrabold">NUMAN AND ASSOCIATES</p>
                <p className="text-xs text-slate-400">Mobile navigation</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileNav(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
                aria-label="Close mobile menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-4 py-4">
              <div className="space-y-3">
                {mainNav.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleMobileNavigation(item.label)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                      activeModule === item.label ? "bg-white text-slate-950" : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">System</p>
                <div className="mt-3 space-y-3">
                  {systemNav.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleMobileNavigation(item.label)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                        activeModule === item.label ? "bg-white text-slate-950" : "text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      <item.icon size={18} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <Toast message={toastMessage} type={toastType} isOpen={toastOpen} onClose={() => setToastOpen(false)} />
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={clearAllData}
        title="Clear all application data"
        message="This will permanently delete all module records from Supabase and clear local storage. Do you want to continue?"
        confirmLabel="Clear data"
        cancelLabel="Cancel"
      />
    </header>
  );
}
