# Numan & Associates — Full Stack Refactor + Supabase Backend

Transform the 4,495-line monolithic UI mockup into a modular, functional full-stack dashboard with Supabase persistence, real CRUD modals, working search/filter/export, and code-split module files.

## User Review Required

> [!IMPORTANT]
> **Supabase Credentials**: I will need your Supabase project URL and anon/public key to wire up the client. Do you already have a Supabase project created, or should I design the schema first and you create it?

> [!IMPORTANT]
> **Scope Phasing**: This is a very large change (~4,500 lines of monolithic code to refactor + add full CRUD + backend). I recommend we execute in **3 phases** so the app stays working at every step. Each phase is independently buildable and testable. Do you approve this phased approach?

> [!WARNING]
> **Data Migration**: All current hardcoded data will become seed data in Supabase tables. The first time you load the app after Phase 3, the UI will show real database data instead of static arrays. During Phase 1-2, the app will continue using static data but in modular files.

## Open Questions

> [!IMPORTANT]
> 1. **Auth**: Should user login/authentication be part of this build? Currently the app has a hardcoded "Admin User". If yes, I'll add Supabase Auth with email/password login.
> 2. **Row-Level Security (RLS)**: Should different users see different data, or is this a single-admin dashboard for now?
> 3. **AI Assistant**: Should the API key be stored in Supabase (encrypted) or remain local/session-only?

---

## Phase 1 — Split App.tsx Into Modules (No Behavior Change)

**Goal**: Break the 239KB monolith into ~30+ focused files. Zero functional changes — the app looks and works identically after this phase.

### File Organization

```
src/
├── App.tsx                     # ~50 lines: shell, router, sidebar + topbar
├── main.tsx                    # unchanged
├── styles.css                  # unchanged
├── types/
│   └── index.ts                # All shared TypeScript types (NavItem, Account, etc.)
├── data/
│   ├── navigation.ts           # mainNav, systemNav, moduleDetails
│   ├── home.ts                 # kpiCards, priorityTasks, departmentPerformance, etc.
│   ├── taxation.ts             # taxationTabs, financeRows, taxationRows, litigationRows, etc.
│   ├── amazon.ts               # amazonKpis, amazonClients, amazonRevenueData, etc.
│   ├── law.ts                  # lawKpis, lawClients, lawTasks, etc.
│   ├── immigration.ts          # immigrationKpis, immigrationClients, etc.
│   ├── language.ts             # languageKpis, languageClients, etc.
│   ├── investment.ts           # investmentKpis, investmentPortfolios, etc.
│   ├── academic.ts             # academicKpis, academicClients, etc.
│   ├── marketing.ts            # marketingKpis, facebookPages, etc.
│   ├── training.ts             # trainingKpis, trainingClients, etc.
│   ├── system.ts               # AI assistant, calendar, reports, search, settings data
│   └── fds.ts                  # initialAccounts, FDS-specific data
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         # Sidebar, SidebarItem, TaxSidebarSubItem
│   │   └── Topbar.tsx          # Topbar, IconButton
│   ├── shared/
│   │   ├── Card.tsx            # Card wrapper
│   │   ├── KpiCard.tsx         # KPI card with sparkline
│   │   ├── ChartLegend.tsx     # Donut chart legend
│   │   ├── ProgressBar.tsx     # Reusable progress bar
│   │   ├── TableFooter.tsx     # Pagination footer (TableFooter, SimpleTableFooter)
│   │   ├── ActionIcons.tsx     # Eye/Pencil/More actions
│   │   ├── TableActions.tsx    # Search/Filter/Columns bar (AmazonTableActions)
│   │   ├── TaxTableSection.tsx # Reusable table section wrapper
│   │   └── badges/
│   │       ├── StatusBadge.tsx
│   │       ├── TaxStatusBadge.tsx
│   │       ├── AmazonPill.tsx
│   │       ├── AmazonTaskBadge.tsx
│   │       ├── PriorityBadge.tsx
│   │       ├── ImmigrationStatusBadge.tsx
│   │       ├── InvestmentStatusBadge.tsx
│   │       ├── MarketingStatusBadge.tsx
│   │       ├── SystemStatusBadge.tsx
│   │       └── EngagementBadge.tsx
│   └── tabs/
│       └── TabBar.tsx          # Reusable AmazonTab → generic TabBar
├── modules/
│   ├── home/
│   │   └── HomeDashboard.tsx
│   ├── taxation/
│   │   └── TaxationDashboard.tsx   # + InternationalTaxDashboard, PakistanServiceWorkspace, TaxationServicePanel, TaxAccordion
│   ├── amazon/
│   │   └── AmazonDashboard.tsx     # + AmazonClientsView, AmazonTasksView, AmazonGoalsView, AmazonClientTable
│   ├── law/
│   │   └── LawDashboard.tsx        # + LawClientsView, LawClientTable, LawSecondaryView
│   ├── immigration/
│   │   └── ImmigrationDashboard.tsx  # + tables + right column
│   ├── language/
│   │   └── LanguageDashboard.tsx
│   ├── investment/
│   │   └── InvestmentDashboard.tsx   # + all 5 tab tables + right column
│   ├── academic/
│   │   └── AcademicDashboard.tsx
│   ├── marketing/
│   │   └── MarketingDashboard.tsx    # + Facebook/LinkedIn/YouTube tables + right column
│   ├── training/
│   │   └── TrainingDashboard.tsx
│   ├── ai-assistant/
│   │   └── AiAssistantDashboard.tsx
│   ├── calendar/
│   │   └── CalendarRemindersDashboard.tsx
│   ├── reports/
│   │   └── ReportsAnalyticsDashboard.tsx
│   ├── search/
│   │   └── SearchFiltersDashboard.tsx
│   ├── settings/
│   │   └── SettingsDashboard.tsx
│   ├── fds/
│   │   └── FdsDashboard.tsx
│   └── placeholder/
│       └── ModuleDashboard.tsx
```

#### [MODIFY] [App.tsx](file:///g:/numan%20and%20associates/src/App.tsx)
- Reduce from 4,495 lines to ~50 lines
- Import Sidebar, Topbar, and all module dashboards
- Keep the `activeModule` state and conditional rendering switch

#### [NEW] All files listed above
- Each file is a direct extraction of existing code — no logic changes
- All imports are updated to reference the new paths

---

## Phase 2 — Add Real Modal/Action/Search/Filter/Export Behavior

**Goal**: Make every placeholder button functional with modals, drawers, and client-side logic.

### Shared Infrastructure

#### [NEW] `src/components/shared/Modal.tsx`
- Reusable overlay modal component (open/close, title, content area, footer with Save/Cancel)
- Smooth fade + scale animation
- Click-outside-to-close and Escape key support

#### [NEW] `src/components/shared/ConfirmDialog.tsx`
- "Are you sure?" confirmation dialog for delete actions

#### [NEW] `src/components/shared/ViewDrawer.tsx`
- Side drawer that slides in from the right for "View" (Eye icon) actions
- Shows read-only detail card for any record

#### [NEW] `src/components/shared/Toast.tsx`
- Success/error/info toast notifications (bottom-right, auto-dismiss)

### Functional Behaviors

#### Action Icons (View / Edit / Delete)
- **Eye (View)**: Opens `ViewDrawer` showing full record details
- **Pencil (Edit)**: Opens `Modal` with pre-filled form fields matching the table columns
- **MoreVertical**: Opens a dropdown menu with options: Edit, Delete, Duplicate, Export Row
- **Delete**: Shows `ConfirmDialog`, then removes the row from state

#### Add / Create Buttons
- "+ Add New Client", "+ Create Task", "+ Add Goal" buttons open a `Modal` with empty form fields
- Form fields match the columns of the relevant table
- On submit, the new record is added to state (and later, to Supabase)

#### Search
- **Topbar search**: Filters the active module's data in real-time (debounced, 300ms)
- **Table search** (within `TaxTableSection` and `AmazonTableActions`): Filters rows by any column match
- Both search inputs become controlled components connected to filter state

#### Filters
- Filter button opens a dropdown/popover with checkboxes for status, priority, date range
- Applied filters update the table data in real-time
- Active filter count shown as a badge on the Filter button

#### Column Visibility
- Columns button opens a checkbox list of all table columns
- Unchecked columns are hidden from the table
- Stored in local state per table

#### Export / Print
- **Export PDF**: Generates a client-side PDF of the current table/view using `jspdf` + `jspdf-autotable`
- **Export Excel**: Generates a `.xlsx` file using `xlsx` (SheetJS)
- **Print**: Calls `window.print()` with a print-friendly stylesheet

#### Pagination
- Real pagination: tables show the correct page of data
- Page size selector (5, 10, 25, 50 rows)
- "Showing X to Y of Z entries" updates dynamically

### Dependencies to Install

```
npm install jspdf jspdf-autotable xlsx
npm install -D @types/jspdf
```

---

## Phase 3 — Supabase Backend + Persistence

**Goal**: Replace all static data arrays with live Supabase queries. Full CRUD with real-time updates.

### Supabase Setup

#### [NEW] `src/lib/supabase.ts`
- Supabase client initialization with project URL + anon key (from `.env`)
- Typed client using generated types

#### [NEW] `.env`
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database Schema (Supabase Tables)

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `clients` | id, name, service_type, department, phone, cnic, payment_amount, payment_status, last_activity, created_at | All clients across all modules |
| `tasks` | id, title, department, assigned_to, due_date, priority, status, progress, client_id | All tasks across all modules |
| `goals` | id, description, department, target, current_progress, pct_achieved, deadline, status | All goals across all modules |
| `payments` | id, client_id, amount, status, date, service | Payment records |
| `taxation_returns` | id, client_id, tax_year, status, filed_on, remarks, country, tax_type | Tax return tracking |
| `litigation_cases` | id, client_id, case_type, status, payment_amount, payment_received, next_hearing | Litigation case management |
| `amazon_stores` | id, client_id, marketplace, services, active_store, revenue_30d, profit_30d | Amazon store data |
| `law_cases` | id, client_id, matter_type, advocate, status, hearing_date | Law case data |
| `immigration_cases` | id, client_id, visa_type, status, documents_pending | Immigration applications |
| `investment_portfolios` | id, client_id, portfolio_type, total_investment, current_value, roi_pct, status | Investment portfolios |
| `marketing_pages` | id, platform, page_name, admin, followers, engagement_rate, status | Social media pages |
| `reminders` | id, title, service, client, due_date, priority, status | Calendar reminders |
| `reports` | id, name, category, period, prepared_by, status | Generated reports |
| `settings_users` | id, name, role, access, status | User management |
| `fds_history` | id, date, income, currency, allocations | FDS calculation history |

### Data Access Layer

#### [NEW] `src/lib/api/`
```
src/lib/api/
├── clients.ts      # CRUD: getClients, createClient, updateClient, deleteClient
├── tasks.ts        # CRUD: getTasks, createTask, updateTask, deleteTask
├── goals.ts        # CRUD
├── taxation.ts     # Tax-specific queries
├── amazon.ts       # Amazon-specific queries
├── law.ts          # Law-specific queries
├── immigration.ts  # Immigration-specific queries
├── investment.ts   # Investment-specific queries
├── marketing.ts    # Marketing-specific queries
├── reminders.ts    # Calendar/reminder queries
├── reports.ts      # Report queries
├── settings.ts     # Settings/user queries
└── fds.ts          # FDS history queries
```

Each API file follows the same pattern:
```typescript
// Example: src/lib/api/clients.ts
import { supabase } from '../supabase';

export async function getClients(department?: string, page = 1, pageSize = 10) {
  let query = supabase.from('clients').select('*', { count: 'exact' });
  if (department) query = query.eq('department', department);
  const { data, count, error } = await query
    .range((page - 1) * pageSize, page * pageSize - 1)
    .order('created_at', { ascending: false });
  return { data, total: count, error };
}
```

### React Query / State Management

#### [NEW] `src/hooks/`
```
src/hooks/
├── useClients.ts       # React hook wrapping clients API with loading/error state
├── useTasks.ts
├── useGoals.ts
├── usePagination.ts    # Shared pagination logic
├── useSearch.ts        # Shared search/filter logic
├── useModal.ts         # Modal open/close state management
└── useToast.ts         # Toast notification state
```

Each module dashboard will:
1. Call the appropriate hook (e.g., `useClients('immigration')`)
2. Get `{ data, loading, error, refetch }` 
3. Pass data to the table components
4. Show loading skeleton while fetching
5. Show error state with retry button if query fails

### Data Seeding

#### [NEW] `supabase/seed.sql`
- SQL file containing INSERT statements for all current hardcoded data
- This ensures the app looks identical after migration
- Includes all ~50+ rows across all data arrays currently in App.tsx

### Real-time Updates
- Use Supabase Realtime subscriptions for tables that benefit from live updates (tasks, reminders)
- When one user adds a task, other open tabs see it immediately

---

## Verification Plan

### After Phase 1 (Code Split)
- `npm run build` — must pass with zero errors
- Visual comparison: every module looks identical before/after
- All navigation and tab switching works
- FDS calculator still functions

### After Phase 2 (Functional UI)
- Every "Add" button opens a modal with correct form fields
- Every Eye/Pencil/More action works
- Search filters table data in real-time
- Export generates real PDF/Excel files
- Pagination shows correct pages
- Delete shows confirmation and removes row

### After Phase 3 (Supabase)
- App loads data from Supabase on first render
- Create, update, delete operations persist to database
- Page refresh retains all changes
- Search/filter queries run against Supabase
- Loading and error states display correctly
