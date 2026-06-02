# Numan and Associates Web App - Project Status

Last updated: 2026-05-31

## App Overview

- Stack: React 18, TypeScript, Vite, Tailwind CSS, Recharts, lucide-react.
- App type: Single-page admin dashboard.
- Runtime: Node/Vite dev server.
- Current local URL: `http://localhost:5174/`
- Main implementation file: `src/App.tsx`
- Shared styling: `src/styles.css`, `tailwind.config.ts`

## Built So Far

### Global Shell

- Dark navy fixed left sidebar.
- Shared top navbar with dynamic module title, search placeholder, notification icons, chat badge, admin avatar.
- Module switching inside one web app, not separate pages.
- Shared cards, KPI cards, table sections, chart legends, status badges, action icons.
- Sidebar expands contextual sub-items for Taxation, Amazon, and Law modules.

### Home Dashboard

- Notification center bar.
- Five KPI cards with sparklines.
- Recent high-priority tasks table.
- Department performance progress bars.
- Pending payments panel.
- Revenue overview Recharts area chart.
- Tasks status donut chart.
- Quick actions grid.

### Taxation Services

- Taxation-specific navbar search.
- Country tabs:
  - Pakistan Taxation
  - USA Taxation
  - Germany Taxation
- Pakistan Taxation:
  - Left service panel.
  - Income Tax workspace.
  - Sales Tax workspace.
  - Company Registration workspace.
  - Tables, pagination, status badges, actions.
- USA Taxation:
  - Clients, Tasks, Goals cards.
  - Clients table with Tax ID / SSN.
  - Export, Print, Add Client buttons.
- Germany Taxation:
  - Clients, Tasks, Goals cards.
  - Clients table with Steuer-ID.
  - Export, Print, Add Client buttons.

### Amazon Services

- Amazon-specific navbar search.
- Sidebar sub-items:
  - Clients
  - Tasks
  - Goals
- Five KPI cards.
- Working top tabs:
  - Clients
  - Tasks
  - Goals
- Clients view:
  - Client management table.
  - Revenue overview chart.
  - Tasks summary donut chart.
  - Sales overview donut chart.
  - Top categories table.
  - Account health progress bars.
- Tasks view:
  - Amazon tasks table.
  - Task snapshot donut.
- Goals view:
  - Amazon goals table.
  - Goal overview progress bars.

### Law Services

- Law-specific navbar search.
- Sidebar sub-items:
  - Clients
  - Tasks
  - Goals
  - Case Calendar
  - Reports
- Five KPI cards.
- Working top tabs:
  - Clients
  - Tasks
  - Goals
  - Case Calendar
  - Reports
- Clients view:
  - Client management table.
  - Tasks overview donut chart.
  - Recent high-priority tasks table.
  - Revenue overview chart.
  - Matter type distribution donut.
  - Case status overview donut.
  - Upcoming hearings list.
  - Top practice areas progress bars.
- Secondary views:
  - Tasks
  - Goals
  - Case Calendar
  - Reports

### Immigration Services

- Immigration-specific navbar search.
- Sidebar sub-items:
  - Clients
  - Tasks
  - Goals
- Five KPI cards.
- Working top tabs:
  - Clients
  - Tasks
  - Goals
- Clients view:
  - Client management table.
  - Payment status badges.
  - Pagination and table controls.
- Tasks view:
  - Tasks for Growth table.
  - Priority badges.
  - Progress bars.
  - Status badges.
- Goals view:
  - Goals Status table.
  - Achievement progress bars.
  - Goal status badges.
- Persistent right column:
  - Case status donut chart.
  - Upcoming deadlines list.
  - Top visa categories by revenue progress bars.

### Language Services

- Language-specific navbar search.
- Sidebar sub-items:
  - Clients
  - Tasks
  - Goals
- Five KPI cards.
- Working top tabs:
  - Clients
  - Tasks
  - Goals
- Clients view:
  - Client management table.
  - Payment status badges.
  - Pagination and table controls.
- Tasks view:
  - Tasks for Growth table.
  - Priority badges.
  - Progress bars.
  - Status badges.
- Goals view:
  - Goals Status table.
  - Achievement progress bars.
  - Goal status badges.
- Persistent right column:
  - Project status donut chart.
  - Upcoming deadlines list.
  - Top language services by revenue progress bars.

### Investment Services

- Investment-specific navbar search.
- Sidebar sub-items:
  - Client Portfolios
  - Portfolio Management
  - Profit Tracking
  - Financial Reports
  - Investment Goals
- Five KPI cards.
- Working top tabs:
  - Client Portfolios
  - Portfolio Management
  - Profit Tracking
  - Financial Reports
  - Investment Goals
- Client Portfolios view:
  - Client investment portfolios table.
  - ROI formatting for positive and negative returns.
  - Portfolio status badges.
- Portfolio Management view:
  - Portfolio review and allocation table.
- Profit Tracking view:
  - Monthly, quarterly, annual, and YTD profit table.
  - Positive/negative profit styling.
  - Inline Recharts sparklines.
- Financial Reports view:
  - Reports table.
  - Generate Report visual button.
  - Delivery status badges.
- Investment Goals view:
  - Client goal progress table.
  - Progress bars and status badges.
- Persistent right column:
  - Portfolio distribution donut chart.
  - Upcoming reviews list.
  - Top portfolio types by AUM progress bars.
  - Market overview widget.

### Academic Services

- Academic-specific navbar search.
- Sidebar sub-items:
  - Clients
  - Tasks
  - Goals
- Five KPI cards.
- Working top tabs:
  - Clients
  - Tasks
  - Goals
- Clients view:
  - Client management table.
  - Payment status badges.
  - Pagination and table controls.
- Tasks view:
  - Tasks for Growth table.
  - Priority badges.
  - Progress bars.
  - Status badges.
- Goals view:
  - Goals Status table.
  - Achievement progress bars.
  - Goal status badges.
- Persistent right column:
  - Project status donut chart.
  - Upcoming deadlines list.
  - Top academic services by revenue progress bars.

### Marketing Services

- Marketing-specific navbar search.
- Sidebar sub-items:
  - Clients
  - Tasks
  - Goals
- Five KPI cards.
- Working top tabs:
  - Facebook
  - LinkedIn
  - YouTube
- Facebook view:
  - Facebook page management table.
  - Platform status badges.
- LinkedIn view:
  - LinkedIn profile and company page table.
  - Platform status badges.
- YouTube view:
  - YouTube playlist management table.
  - Fixed nine-department playlist list.
- Persistent right column:
  - Platform followers distribution donut chart.
  - Top performing posts list.
  - YouTube overview stat card with bar chart.
  - Scheduled posts list.

### Training Services

- Training-specific navbar search.
- Sidebar sub-items:
  - Clients
  - Tasks
  - Goals
- Five KPI cards.
- Working top tabs:
  - Clients
  - Tasks
  - Goals
- Clients view:
  - Client management table.
  - Payment status badges.
  - Pagination and table controls.
- Tasks view:
  - Tasks for Growth table.
  - Priority badges.
  - Progress bars.
  - Status badges.
- Goals view:
  - Goals Status table.
  - Achievement progress bars.
  - Goal status badges.
- Persistent right column:
  - Program status donut chart.
  - Upcoming sessions list.
  - Top programs by revenue progress bars.
  - Completion rates progress card.

### FDS - Financial Diversification

- Existing working calculator retained.
- Monthly surplus income input.
- Currency selector.
- Editable account allocation percentages.
- Distribution table.
- Pie chart overview.
- Allocation summary.
- Calculation history.
- Export buttons are present visually.

### System Modules

- AI Assistant:
  - Optional API key input.
  - Prompt workspace remains locked until a key is entered.
  - Use case cards.
  - Recent drafts table.
- Calendar & Reminders:
  - KPI cards.
  - Reminders table.
  - Reminder status donut chart.
  - Quick schedule actions.
- Reports & Analytics:
  - KPI cards.
  - Revenue analytics chart.
  - Report library table.
  - Export center and service mix bars.
- Search & Filters:
  - Filter panel.
  - Global search input.
  - Search results table.
  - Saved filters and index health cards.
- Settings:
  - Firm profile form.
  - Users and roles table.
  - Module settings list.
  - Notification rules toggles.

## Modules Still Left To Build

- None for the current service/system dashboard surface.

## Known Gaps / Follow-Up Work

- Most table actions are UI-only: view/edit/more buttons do not open modals yet.
- Export, Print, Add Client, Create Task, Add Goal buttons are visual placeholders.
- Search/filter/column controls are visual placeholders.
- AI Assistant does not call a backend/API yet; API key entry only unlocks the UI workspace.
- Data is static in `src/App.tsx`; no backend/API/local persistence yet.
- FDS export buttons are visual only.
- Mobile sidebar hamburger is visual only; no drawer behavior yet.
- Bundle size warning appears during build because everything is currently in one large file/chunk.
- React runtime is 18.x while type packages are 19.x in `package.json`; build currently passes, but aligning versions later is cleaner.

## Verification

Latest build command used:

```bash
npm run build
```

Build status: passing.
