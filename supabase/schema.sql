-- andarTayo! Supabase Schema
-- Run this in your Supabase SQL editor to create the tables

-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- Fare matrices table
create table if not exists fare_matrices (
  id uuid primary key default gen_random_uuid(),
  transport_type text not null unique,
  effective_date date not null default current_date,
  note text,
  stations text[] not null,
  -- Rail fares (LRT-1, LRT-2, MRT-3)
  beep_card jsonb,
  single_journey jsonb,
  -- BRT fares (EDSA Carousel)
  regular jsonb,
  student jsonb,
  pwd jsonb,
  senior jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Stations table
create table if not exists stations (
  id uuid primary key default gen_random_uuid(),
  transport_type text not null,
  station_id text not null,
  name text not null,
  sequence int not null,
  latitude decimal(10, 7),
  longitude decimal(10, 7),
  municipality text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(transport_type, station_id)
);

-- Service alerts table (for future use)
create table if not exists service_alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  severity text check (severity in ('low', 'medium', 'high')) default 'low',
  affected_lines text[],
  affected_stops text[],
  disable_stops boolean default false,
  start_date timestamptz default now(),
  end_date timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_stations_transport on stations(transport_type);
create index if not exists idx_stations_sequence on stations(transport_type, sequence);
create index if not exists idx_alerts_active on service_alerts(is_active) where is_active = true;
create index if not exists idx_alerts_lines on service_alerts using gin(affected_lines);

-- Updated at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger fare_matrices_updated_at
  before update on fare_matrices
  for each row execute function update_updated_at();

create trigger stations_updated_at
  before update on stations
  for each row execute function update_updated_at();

create trigger service_alerts_updated_at
  before update on service_alerts
  for each row execute function update_updated_at();

-- Enable RLS (read-only for anon, full access for authenticated)
alter table fare_matrices enable row level security;
alter table stations enable row level security;
alter table service_alerts enable row level security;

-- Policies (read-only for public)
create policy "fare_matrices_read" on fare_matrices for select using (true);
create policy "stations_read" on stations for select using (true);
create policy "alerts_read" on service_alerts for select using (is_active = true);

-- Admin policies (for authenticated users / service role)
create policy "fare_matrices_admin" on fare_matrices for all using (auth.role() = 'authenticated');
create policy "stations_admin" on stations for all using (auth.role() = 'authenticated');
create policy "alerts_admin" on service_alerts for all using (auth.role() = 'authenticated');

comment on table fare_matrices is 'Fare matrix data for each transit line';
comment on table stations is 'Station/stop data for all transit lines';
comment on table service_alerts is 'Service disruption alerts';
