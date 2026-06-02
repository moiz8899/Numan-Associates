import { useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { HomeDashboard } from "./modules/home/HomeDashboard";
import { TaxationDashboard } from "./modules/taxation/TaxationDashboard";
import { AmazonDashboard } from "./modules/amazon/AmazonDashboard";
import { LawDashboard } from "./modules/law/LawDashboard";
import { ImmigrationDashboard } from "./modules/immigration/ImmigrationDashboard";
import { LanguageDashboard } from "./modules/language/LanguageDashboard";
import { InvestmentDashboard } from "./modules/investment/InvestmentDashboard";
import { AcademicDashboard } from "./modules/academic/AcademicDashboard";
import { MarketingDashboard } from "./modules/marketing/MarketingDashboard";
import { TrainingDashboard } from "./modules/training/TrainingDashboard";
import { AiAssistantDashboard } from "./modules/ai-assistant/AiAssistantDashboard";
import { CalendarRemindersDashboard } from "./modules/calendar/CalendarRemindersDashboard";
import { ReportsAnalyticsDashboard } from "./modules/reports/ReportsAnalyticsDashboard";
import { SearchFiltersDashboard } from "./modules/search/SearchFiltersDashboard";
import { SettingsDashboard } from "./modules/settings/SettingsDashboard";
import { FdsDashboard } from "./modules/fds/FdsDashboard";
import { ModuleDashboard } from "./modules/placeholder/ModuleDashboard";
import { fdsModule, moduleDetails } from "./data/navigation";

export function App() {
  const [activeModule, setActiveModule] = useState("Home Dashboard");

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f8fafc] font-sans text-slate-900">
      <Sidebar activeModule={activeModule} onSelect={setActiveModule} />
      <div className="min-w-0 lg:pl-72">
        <Topbar activeModule={activeModule} onModuleSelect={setActiveModule} />
        <main className="w-full min-w-0 space-y-6 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          {activeModule === "Home Dashboard" ? (
            <HomeDashboard onNavigate={setActiveModule} />
          ) : activeModule === "Taxation Services" ? (
            <TaxationDashboard />
          ) : activeModule === "Amazon Services" ? (
            <AmazonDashboard />
          ) : activeModule === "Law Services" ? (
            <LawDashboard />
          ) : activeModule === "Immigration Services" ? (
            <ImmigrationDashboard />
          ) : activeModule === "Language Services" ? (
            <LanguageDashboard />
          ) : activeModule === "Investment Services" ? (
            <InvestmentDashboard />
          ) : activeModule === "Academic Services" ? (
            <AcademicDashboard />
          ) : activeModule === "Marketing Services" ? (
            <MarketingDashboard />
          ) : activeModule === "Training Services" ? (
            <TrainingDashboard />
          ) : activeModule === "AI Assistant" ? (
            <AiAssistantDashboard />
          ) : activeModule === "Calendar & Reminders" ? (
            <CalendarRemindersDashboard />
          ) : activeModule === "Reports & Analytics" ? (
            <ReportsAnalyticsDashboard />
          ) : activeModule === "Search & Filters" ? (
            <SearchFiltersDashboard />
          ) : activeModule === "Settings" ? (
            <SettingsDashboard />
          ) : activeModule === fdsModule ? (
            <FdsDashboard />
          ) : (
            <ModuleDashboard detail={moduleDetails[activeModule]} />
          )}
          <p className="pb-4 text-center text-sm italic text-slate-500">
            #NomanAssociates&nbsp;&nbsp; #FinancialPlanning&nbsp;&nbsp; #GrowTogether
          </p>
        </main>
      </div>
    </div>
  );
}
