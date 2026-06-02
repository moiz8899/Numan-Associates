# Numan and Associates Web App - Knowledge Graph

This file is a compact handoff map for future Codex sessions or another account.

## Core Entities

```text
Project
  name: numan-associates-dashboard
  type: single-page React/Vite admin dashboard
  root: G:\numan and associates
  primary_file: src/App.tsx
  local_url: http://localhost:5174/
```

## Technical Stack

```text
Project -> uses -> React 18
Project -> uses -> TypeScript
Project -> uses -> Vite
Project -> uses -> Tailwind CSS
Project -> uses -> Recharts
Project -> uses -> lucide-react
Project -> runs_with -> Node.js at C:\Program Files\nodejs\node.exe
```

## App Architecture

```text
App
  -> owns state: activeModule
  -> renders: Sidebar(activeModule)
  -> renders: Topbar(activeModule)
  -> switches modules in main content

Sidebar
  -> renders mainNav
  -> renders systemNav
  -> expands contextual sub-items for:
       Taxation Services
       Amazon Services
       Law Services

Topbar
  -> derives title/icon/search placeholder from activeModule
  -> shared notification/chat/admin controls
```

## Module Routing Map

```text
activeModule = "Home Dashboard" -> HomeDashboard
activeModule = "Taxation Services" -> TaxationDashboard
activeModule = "Amazon Services" -> AmazonDashboard
activeModule = "Law Services" -> LawDashboard
activeModule = "Immigration Services" -> ImmigrationDashboard
activeModule = "Language Services" -> LanguageDashboard
activeModule = "Investment Services" -> InvestmentDashboard
activeModule = "Academic Services" -> AcademicDashboard
activeModule = "Marketing Services" -> MarketingDashboard
activeModule = "Training Services" -> TrainingDashboard
activeModule = "AI Assistant" -> AiAssistantDashboard
activeModule = "Calendar & Reminders" -> CalendarRemindersDashboard
activeModule = "Reports & Analytics" -> ReportsAnalyticsDashboard
activeModule = "Search & Filters" -> SearchFiltersDashboard
activeModule = "Settings" -> SettingsDashboard
activeModule = "FDS - Financial Diversification" -> FdsDashboard
other activeModule values -> ModuleDashboard placeholder
```

## Built Module Graph

```text
HomeDashboard
  -> notification center
  -> KPI cards
  -> recent tasks table
  -> department performance
  -> pending payments
  -> revenue chart
  -> task status donut
  -> quick actions

TaxationDashboard
  -> country tabs: PK, US, DE
  -> PK -> activePakistanService
       Income Tax -> detailed finance/tax/litigation tables
       Sales Tax -> finance/tax/litigation workspace
       Company Registration -> registrations/returns workspace
  -> US -> InternationalTaxDashboard
       cards: Clients, Tasks, Goals
       client table: Tax ID / SSN
  -> DE -> InternationalTaxDashboard
       cards: Clients, Tasks, Goals
       client table: Steuer-ID

AmazonDashboard
  -> activeTab: Clients, Tasks, Goals
  -> Clients -> AmazonClientsView
       client table
       revenue chart
       tasks donut
       sales donut
       categories table
       account health
  -> Tasks -> AmazonTasksView
  -> Goals -> AmazonGoalsView

LawDashboard
  -> activeTab: Clients, Tasks, Goals, Case Calendar, Reports
  -> Clients -> LawClientsView
       client table
       task donut
       recent tasks
       revenue chart
       matter type donut
       case status donut
       hearings list
       practice revenue bars
  -> other tabs -> LawSecondaryView

ImmigrationDashboard
  -> activeTab: Clients, Tasks, Goals
  -> Clients -> ImmigrationClientTable
  -> Tasks -> ImmigrationTasksTable
  -> Goals -> ImmigrationGoalsTable
  -> persistent right column -> ImmigrationRightColumn
       case status donut
       upcoming deadlines
       top visa categories by revenue

LanguageDashboard
  -> activeTab: Clients, Tasks, Goals
  -> Clients -> LanguageClientTable
  -> Tasks -> LanguageTasksTable
  -> Goals -> LanguageGoalsTable
  -> persistent right column -> LanguageRightColumn
       project status donut
       upcoming deadlines
       top language services by revenue

InvestmentDashboard
  -> activeTab:
       Client Portfolios
       Portfolio Management
       Profit Tracking
       Financial Reports
       Investment Goals
  -> Client Portfolios -> InvestmentPortfolioTable
  -> Portfolio Management -> InvestmentManagementTable
  -> Profit Tracking -> InvestmentProfitTable
  -> Financial Reports -> InvestmentReportsTable
  -> Investment Goals -> InvestmentGoalsTable
  -> persistent right column -> InvestmentRightColumn
       portfolio distribution donut
       upcoming reviews
       top portfolio types by AUM
       market overview widget

AcademicDashboard
  -> activeTab: Clients, Tasks, Goals
  -> Clients -> AcademicClientTable
  -> Tasks -> AcademicTasksTable
  -> Goals -> AcademicGoalsTable
  -> persistent right column -> AcademicRightColumn
       project status donut
       upcoming deadlines
       top academic services by revenue

MarketingDashboard
  -> activeTab: Facebook, LinkedIn, YouTube
  -> Facebook -> FacebookPageTable
  -> LinkedIn -> LinkedInPageTable
  -> YouTube -> YouTubePlaylistTable
  -> persistent right column -> MarketingRightColumn
       platform followers distribution donut
       top performing posts
       YouTube overview with bar chart
       scheduled posts

TrainingDashboard
  -> activeTab: Clients, Tasks, Goals
  -> Clients -> TrainingClientTable
  -> Tasks -> TrainingTasksTable
  -> Goals -> TrainingGoalsTable
  -> persistent right column -> TrainingRightColumn
       program status donut
       upcoming sessions
       top programs by revenue
       completion rates

AiAssistantDashboard
  -> optional API key input
  -> prompt workspace locked until key is entered
  -> use case cards
  -> recent drafts table

CalendarRemindersDashboard
  -> KPI cards
  -> reminders table
  -> reminder status donut
  -> quick schedule actions

ReportsAnalyticsDashboard
  -> KPI cards
  -> revenue analytics area chart
  -> report library table
  -> export center
  -> service mix progress bars

SearchFiltersDashboard
  -> filter panel
  -> global search input
  -> search results table
  -> saved filters
  -> index health progress bars

SettingsDashboard
  -> KPI cards
  -> firm profile form
  -> users and roles table
  -> module settings list
  -> notification rules toggles

FdsDashboard
  -> calculator state: income, currency, accounts, calculatedIncome, displayIncome, history
  -> editable allocation percentages
  -> pie chart and summary
```

## Shared Component / Helper Graph

```text
Card -> reusable panel wrapper
KpiCard -> KPI card with icon and sparkline
ChartLegend -> reusable legend for donut charts
StatusBadge -> task priority badge
AmazonPill -> payment/yes/no badge
AmazonTaskBadge -> task state badge
TaxStatusBadge -> taxation status badge
PriorityBadge -> hearing priority badge
ProgressBar -> reusable percentage progress bar
ImmigrationStatusBadge -> immigration task/goal status badge
TableFooter -> reusable table footer pagination
ActionIcons -> eye/pencil/more actions
TaxTableSection -> reusable table section with search/filter/columns/pagination
AmazonTableActions -> reusable table search/filter/columns actions
```

## Data Model Pattern

```text
Current data source: static arrays in src/App.tsx

Examples:
  kpiCards
  priorityTasks
  departmentPerformance
  pendingPayments
  taxationRows
  amazonClients
  lawClients

No backend/API yet.
No persistence yet.
```

## Design Rules Already Used

```text
Sidebar color: #0d1b2a
Active nav: brand blue
Brand color: #1a73e8
Cards: white, rounded-2xl, subtle border/shadow
Charts: Recharts
Icons: lucide-react
Tables: white background, light gray borders, hover rows
Status: rounded pill badges
Layout: one scrollable SPA, shared shell
```

## Future Build Order Recommendation

```text
1. Add real modal/actions/search/filter behavior
2. Split src/App.tsx into module files to reduce bundle size
3. Add persistence/backend if required
4. Connect optional AI Assistant to a backend/API proxy if AI generation is required
```

## Important Runtime Notes

```text
Node/npm may not be on PATH in the shell.
Known Node path:
  C:\Program Files\nodejs

Working build command pattern:
  cmd.exe /c "set PATH=C:\Program Files\nodejs;%PATH% && npm run build"

Dev server was launched with Vite and is available at:
  http://localhost:5174/
```
