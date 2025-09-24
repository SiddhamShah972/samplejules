-- Enable necessary extensions
create extension if not exists pgcrypto;

-- Profiles Table
-- This table stores public user data and links to Supabase's auth.users.
create table profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  full_name text,
  age int,
  gender text,
  weight numeric,
  height numeric,
  profile_photo text,
  -- Add a role field to distinguish between patients and admins
  role text default 'patient' not null,
  created_at timestamptz default now()
);

-- Vitals Table
-- Stores time-series data for patient vitals.
create table vitals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  recorded_at timestamptz default now(),
  spo2 int, -- Blood Oxygen
  systolic int, -- Blood Pressure
  diastolic int, -- Blood Pressure
  heart_rate int,
  hemoglobin numeric,
  weight numeric, -- Also tracking weight here as it can be a vital sign
  notes text
);

-- Symptoms Table
-- Stores patient-logged symptoms.
create table symptoms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  recorded_at timestamptz default now(),
  symptoms text[], -- Array of symptom keywords
  severity smallint check (severity between 1 and 5), -- 1-5 scale
  notes text
);

-- Messages Table
-- For secure messaging between patients and admins.
create table messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id) not null,
  receiver_id uuid references profiles(id) not null,
  content text,
  created_at timestamptz default now(),
  read boolean default false
);

-- Notifications Table
-- For in-app, email, or SMS notifications.
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null, -- e.g., 'vital_alert', 'new_message', 'ai_suggestion'
  payload jsonb,
  created_at timestamptz default now(),
  read boolean default false
);

-- Audit Logs Table
-- Records significant actions for security and compliance.
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid, -- Can be null if action is from the system
  action text not null,
  target_table text,
  target_record_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

-- Symptom Analysis Table
-- Stores the output from the AI Symptom Checker.
create table symptom_analysis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  symptoms_record_id uuid references symptoms(id) on delete set null,
  analysed_at timestamptz default now(),
  result jsonb
);

-- Function to automatically create a profile when a new user signs up
-- It also allows setting a role during sign-up via metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'role', 'patient'));
  return new;
end;
$$;

-- Trigger to call the function after a new user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper function to get user role from JWT
create or replace function get_my_claim(claim TEXT) returns jsonb
    language sql stable
    as $$
    select nullif(current_setting('request.jwt.claims', true), '')::jsonb -> claim
    $$;

-- Helper function to check if the current user is an admin
create or replace function is_admin() returns boolean
    language sql stable
    as $$
    select get_my_claim('role') = '"admin"'
    $$;

-- RLS (Row Level Security) Policies

-- 1. Enable RLS on all tables
alter table profiles enable row level security;
alter table vitals enable row level security;
alter table symptoms enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;
alter table symptom_analysis enable row level security;

-- 2. Define Policies for `profiles`
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Admins can view all profiles" on profiles
  for select using (is_admin());

-- 3. Define Policies for `vitals`
create policy "Users can manage their own vitals" on vitals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins can view all vitals" on vitals
  for select using (is_admin());

-- 4. Define Policies for `symptoms`
create policy "Users can manage their own symptoms" on symptoms
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins can view all symptoms" on symptoms
  for select using (is_admin());

-- 5. Define Policies for `messages`
create policy "Users can view messages they sent or received" on messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages" on messages
  for insert with check (auth.uid() = sender_id);

-- 6. Define Policies for `notifications`
create policy "Users can manage their own notifications" on notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins can view all notifications" on notifications
  for select using (is_admin());

-- 7. Define Policies for `symptom_analysis`
create policy "Users can view their own symptom analysis" on symptom_analysis
  for select using (auth.uid() = user_id);
create policy "Admins can view all symptom analysis" on symptom_analysis
  for select using (is_admin());

-- 8. Policies for `audit_logs` (Admins only)
create policy "Admins can view all audit logs" on audit_logs
  for select using (is_admin());

-- Function and Trigger for Audit Logging
create or replace function log_audit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  actor_id uuid;
  actor_role text;
begin
  actor_id := auth.uid();
  actor_role := get_my_claim('role');

  insert into audit_logs (actor_id, action, target_table, target_record_id, details)
  values (
    actor_id,
    TG_OP, -- INSERT, UPDATE, DELETE
    TG_TABLE_NAME,
    case TG_OP
      when 'INSERT' then new.id
      when 'UPDATE' then new.id
      when 'DELETE' then old.id
    end,
    jsonb_build_object(
      'user_agent', headers.user_agent,
      'ip', headers.host,
      'actor_role', actor_role
    ) ||
    case TG_OP
      when 'INSERT' then jsonb_build_object('new_data', to_jsonb(new))
      when 'UPDATE' then jsonb_build_object('old_data', to_jsonb(old), 'new_data', to_jsonb(new))
      when 'DELETE' then jsonb_build_object('deleted_data', to_jsonb(old))
    end
  );
  return coalesce(new, old);
end;
$$;

-- Apply trigger to sensitive tables
create trigger audit_vitals_trigger
after insert or update or delete on vitals
for each row execute function log_audit();

create trigger audit_symptoms_trigger
after insert or update or delete on symptoms
for each row execute function log_audit();

create trigger audit_profiles_trigger
after update on profiles
for each row execute function log_audit();
