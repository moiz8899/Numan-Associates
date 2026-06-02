# 🔗 Supabase Connection — Step by Step Guide

> Complete setup guide for connecting the **Numan & Associates Dashboard** to a Supabase backend.

---

## 📋 Prerequisites

- A modern web browser (Chrome, Edge, Firefox)
- This project already installed locally (`npm install` done)
- A free Supabase account — [Sign up here](https://supabase.com)

---

## Step 1 — Create a Supabase Project

1. Go to **[supabase.com](https://supabase.com)** and sign in (or create a free account)
2. Click the **"New Project"** button on the dashboard
3. Fill in:
   - **Project Name**: `numan-associates` (or any name you prefer)
   - **Database Password**: Choose a strong password and **save it somewhere safe**
   - **Region**: Pick the closest region to you (e.g., `South Asia (Mumbai)` for Pakistan)
4. Click **"Create new project"**
5. Wait 1-2 minutes for the project to finish provisioning

---

## Step 2 — Get Your API Credentials

Once the project is ready:

1. In the Supabase Dashboard sidebar, click **⚙️ Project Settings**
2. Go to **API** section (under Configuration)
3. You will see two important values:

| Field | What it looks like |
|---|---|
| **Project URL** | `https://abcdefghijkl.supabase.co` |
| **anon / public key** | A long string starting with `eyJhbGciOi...` |

4. **Copy both values** — you'll need them in Step 4

> ⚠️ **Important:** Copy the `anon` (public) key, NOT the `service_role` key. The service role key has admin privileges and should never be used in frontend code.

---

## Step 3 — Create the Database Tables

1. In the Supabase Dashboard sidebar, click **SQL Editor**
2. Click **"New query"**
3. Open the file `supabase/schema.sql` from this project
4. **Copy the entire contents** of `schema.sql` and paste it into the SQL Editor
5. Click **"Run"** (or press `Ctrl + Enter`)

You should see a success message. This creates the following **10 tables**:

| # | Table Name | Purpose |
|---|---|---|
| 1 | `clients` | Clients, portfolios, stores, social pages |
| 2 | `tasks` | Tasks for all departments |
| 3 | `goals` | Goals and milestones |
| 4 | `taxation_returns` | Income tax, sales tax, company returns |
| 5 | `litigation_cases` | Income and sales tax litigation |
| 6 | `law_hearings` | Court calendar hearings |
| 7 | `reports` | Generated reports and AI drafts |
| 8 | `reminders` | Calendar events and notifications |
| 9 | `settings_users` | Admin and staff records |
| 10 | `fds_history` | Financial Diversification calculations |

> ✅ The schema also enables **Row Level Security (RLS)** and creates public access policies for all tables automatically.

---

## Step 4 — Configure Environment Variables

1. Open the `.env` file in the project root (`d:\numan and associates\.env`)
2. Replace the placeholder values with your real credentials:

```env
VITE_SUPABASE_URL=https://abcdefghijkl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-full-key-here
```

> 🔒 **Security Note:** The `.env` file is already listed in `.gitignore` and will NOT be pushed to GitHub.

---

## Step 5 — (Optional) Load Sample Data

If you want the dashboard to start with sample data pre-loaded:

1. Go back to the **SQL Editor** in Supabase
2. Click **"New query"**
3. Open the file `supabase/seed.sql` from this project
4. **Copy the entire contents** and paste it into the SQL Editor
5. Click **"Run"**

This inserts demo data across all departments (immigration, law, taxation, amazon, etc.) so you can immediately see the dashboard populated with realistic entries.

---

## Step 6 — Start the Application

Open a terminal in the project folder and run:

```bash
npm run dev
```

The app will start at `http://localhost:5173` (or similar port).

---

## Step 7 — Verify the Connection

### ✅ Success Signs
- Dashboard loads without errors
- Tables show data (if you ran the seed script)
- Adding, editing, deleting records works and persists after page refresh
- Browser console shows no Supabase errors

### ❌ If You See Issues

| Problem | Solution |
|---|---|
| Console shows `Supabase credentials not configured` warning | Double-check your `.env` values are correct and not placeholders |
| Tables are empty after seeding | Go to Supabase → Table Editor and verify rows exist |
| `401 Unauthorized` errors | Make sure you copied the `anon` key (not the `service_role` key) |
| `404` or connection errors | Verify the Project URL is correct (no trailing slash) |
| Changes don't persist | Check that RLS policies were created (Step 3 schema includes them) |
| App doesn't pick up `.env` changes | **Restart the dev server** — Vite only reads `.env` on startup |

---

## 📁 Project Files Reference

| File | Purpose |
|---|---|
| `.env` | Your local Supabase credentials (not committed to git) |
| `.env.example` | Template showing required environment variables |
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/vite-env.d.ts` | TypeScript type declarations for env variables |
| `supabase/schema.sql` | Database table schemas + RLS policies |
| `supabase/seed.sql` | Sample data for all departments |

---

## 🗄️ Database Schema Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   clients    │     │    tasks     │     │    goals     │
│──────────────│     │──────────────│     │──────────────│
│ id (uuid)    │◄────│ client_id    │     │ id (uuid)    │
│ name         │     │ id (uuid)    │     │ description  │
│ service_type │     │ title        │     │ department   │
│ department   │     │ department   │     │ target       │
│ payment_amt  │     │ assigned_to  │     │ progress     │
│ payment_stat │     │ due_date     │     │ deadline     │
│ meta_data    │     │ priority     │     │ status       │
│ created_at   │     │ status       │     │ created_at   │
└──────────────┘     │ meta_data    │     └──────────────┘
                     │ created_at   │
                     └──────────────┘
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  tax_returns │     │ litigation   │     │ law_hearings │
│──────────────│     │──────────────│     │──────────────│
│ id (uuid)    │     │ id (uuid)    │     │ id (uuid)    │
│ client_name  │     │ name         │     │ date         │
│ tax_type     │     │ case_type    │     │ time         │
│ period_year  │     │ status       │     │ case_name    │
│ status       │     │ amount       │     │ court        │
│ filed_on     │     │ next_hearing │     │ priority     │
│ created_at   │     │ created_at   │     │ created_at   │
└──────────────┘     └──────────────┘     └──────────────┘
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   reports    │     │  reminders   │     │settings_users│
│──────────────│     │──────────────│     │──────────────│
│ id (uuid)    │     │ id (uuid)    │     │ id (uuid)    │
│ name         │     │ title        │     │ name         │
│ category     │     │ service      │     │ role         │
│ period       │     │ client_name  │     │ access       │
│ prepared_by  │     │ due_date     │     │ status       │
│ status       │     │ priority     │     │ created_at   │
│ created_at   │     │ status       │     └──────────────┘
└──────────────┘     │ created_at   │
                     └──────────────┘     ┌──────────────┐
                                          │ fds_history  │
                                          │──────────────│
                                          │ id (uuid)    │
                                          │ date         │
                                          │ income       │
                                          │ currency     │
                                          │ allocations  │
                                          │ created_at   │
                                          └──────────────┘
```

---

## 🚀 Quick Summary

```
1. Create Supabase project   →  supabase.com
2. Copy URL + anon key       →  Project Settings → API
3. Run schema.sql            →  SQL Editor
4. Update .env               →  Paste your credentials
5. (Optional) Run seed.sql   →  SQL Editor
6. npm run dev               →  Done! 🎉
```
