-- Supabase Schema for Numan & Associates Dashboard
-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Clients Table (Holds clients, portfolios, stores, pages, and international tax files)
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  service_type text,
  department text not null, -- 'immigration', 'law', 'amazon', 'academic', 'training', 'language', 'investment', 'marketing', 'taxation'
  payment_amount text,
  payment_status text,
  meta_data jsonb default '{}'::jsonb, -- cnic, strn, tax_id, marketplace, status, active_cases, last_activity, advocate, connections, admin etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tasks Table (Holds tasks for all departments)
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  department text not null, -- 'immigration', 'law', 'amazon', 'academic', 'training', 'language', 'investment', 'marketing', 'taxation', 'system'
  assigned_to text,
  due_date text,
  priority text,
  status text,
  progress text,
  client_id uuid references clients(id) on delete cascade,
  meta_data jsonb default '{}'::jsonb, -- e.g., related_case, assignee
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Goals Table (Holds goals and milestones for all departments)
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  description text not null,
  department text not null, -- 'immigration', 'law', 'amazon', 'academic', 'training', 'language', 'investment', 'marketing', 'taxation'
  target text,
  current_progress text,
  pct_achieved text,
  deadline text,
  status text,
  meta_data jsonb default '{}'::jsonb, -- e.g., practice_area, target_date
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Taxation Returns Table (Holds tax filings for Income Tax, Sales Tax, Company Returns)
create table if not exists taxation_returns (
  id uuid primary key default uuid_generate_v4(),
  client_name text not null,
  tax_type text not null, -- 'income', 'sales', 'company'
  period_or_year text not null, -- tax year or month/period
  status text,
  filed_on text,
  remarks text,
  meta_data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Litigation Cases Table (Holds Income and Sales Tax litigation files)
create table if not exists litigation_cases (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  case_type text not null, -- 'income', 'sales'
  status text,
  amount text,
  received text,
  next_hearing text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Law Hearings Table (Holds case court calendar hearings)
create table if not exists law_hearings (
  id uuid primary key default uuid_generate_v4(),
  date text not null,
  time text not null,
  case_name text not null,
  court text not null,
  priority text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Reports Table (Holds system, law, and investment generated reports)
create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null, -- 'law', 'investment', 'system', etc.
  period text,
  prepared_by text,
  status text,
  meta_data jsonb default '{}'::jsonb, -- e.g. generated_on, delivery_status
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Reminders Table (Holds calendar events and notifications)
create table if not exists reminders (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  service text,
  client_name text,
  due_date text,
  priority text,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Settings Users Table (Holds admin and office staff records)
create table if not exists settings_users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text,
  access text,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. FDS History Table (Holds Financial Diversification calculation records)
create table if not exists fds_history (
  id uuid primary key default uuid_generate_v4(),
  date text not null,
  income numeric not null,
  currency text not null,
  allocations jsonb not null, -- allocated percentages and amounts
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) for security best practices
alter table clients enable row level security;
alter table tasks enable row level security;
alter table goals enable row level security;
alter table taxation_returns enable row level security;
alter table litigation_cases enable row level security;
alter table law_hearings enable row level security;
alter table reports enable row level security;
alter table reminders enable row level security;
alter table settings_users enable row level security;
alter table fds_history enable row level security;

-- Create policies allowing full access to anonymous users (no auth requested)
create policy "Allow public read access" on clients for select using (true);
create policy "Allow public insert access" on clients for insert with check (true);
create policy "Allow public update access" on clients for update using (true);
create policy "Allow public delete access" on clients for delete using (true);

create policy "Allow public read access" on tasks for select using (true);
create policy "Allow public insert access" on tasks for insert with check (true);
create policy "Allow public update access" on tasks for update using (true);
create policy "Allow public delete access" on tasks for delete using (true);

create policy "Allow public read access" on goals for select using (true);
create policy "Allow public insert access" on goals for insert with check (true);
create policy "Allow public update access" on goals for update using (true);
create policy "Allow public delete access" on goals for delete using (true);

create policy "Allow public read access" on taxation_returns for select using (true);
create policy "Allow public insert access" on taxation_returns for insert with check (true);
create policy "Allow public update access" on taxation_returns for update using (true);
create policy "Allow public delete access" on taxation_returns for delete using (true);

create policy "Allow public read access" on litigation_cases for select using (true);
create policy "Allow public insert access" on litigation_cases for insert with check (true);
create policy "Allow public update access" on litigation_cases for update using (true);
create policy "Allow public delete access" on litigation_cases for delete using (true);

create policy "Allow public read access" on law_hearings for select using (true);
create policy "Allow public insert access" on law_hearings for insert with check (true);
create policy "Allow public update access" on law_hearings for update using (true);
create policy "Allow public delete access" on law_hearings for delete using (true);

create policy "Allow public read access" on reports for select using (true);
create policy "Allow public insert access" on reports for insert with check (true);
create policy "Allow public update access" on reports for update using (true);
create policy "Allow public delete access" on reports for delete using (true);

create policy "Allow public read access" on reminders for select using (true);
create policy "Allow public insert access" on reminders for insert with check (true);
create policy "Allow public update access" on reminders for update using (true);
create policy "Allow public delete access" on reminders for delete using (true);

create policy "Allow public read access" on settings_users for select using (true);
create policy "Allow public insert access" on settings_users for insert with check (true);
create policy "Allow public update access" on settings_users for update using (true);
create policy "Allow public delete access" on settings_users for delete using (true);

create policy "Allow public read access" on fds_history for select using (true);
create policy "Allow public insert access" on fds_history for insert with check (true);
create policy "Allow public update access" on fds_history for update using (true);
create policy "Allow public delete access" on fds_history for delete using (true);
