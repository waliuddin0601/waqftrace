-- WaqfTrace core schema
create extension if not exists "uuid-ossp";

create table if not exists properties (
  id uuid primary key default uuid_generate_v4(),
  external_id text,
  name text not null,
  category text not null default 'other',
  district text,
  locality_ward text,
  address_text text,
  lat double precision,
  lon double precision,
  area_text text,
  area_acres numeric,
  survey_number text,
  boundaries jsonb,
  status text default 'unknown',
  caretaker_mutawalli text,
  estimated_value_inr text,
  litigation jsonb,
  commercial_scope boolean default false,
  source_type text,
  source_url text,
  is_demo_placeholder boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_properties_district on properties(district);
create index if not exists idx_properties_category on properties(category);
create index if not exists idx_properties_status on properties(status);

create table if not exists district_stats (
  district text primary key,
  district_scheme text,
  institutions_total int,
  area_acres_total numeric,
  area_encroached_acres numeric,
  category_counts jsonb,
  notes text
);

create table if not exists litigation_cases (
  id uuid primary key default uuid_generate_v4(),
  case_name text not null,
  citation text,
  court text,
  year text,
  property_involved text,
  location text,
  area text,
  dispute_summary text,
  outcome_status text,
  source_url text,
  linked_property_id uuid references properties(id)
);

create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_name text,
  reporter_contact text,
  property_id uuid references properties(id),
  report_type text not null check (report_type in ('encroachment','illegal_sale','corruption','other')),
  description text not null,
  photo_urls text[] default '{}',
  lat double precision,
  lon double precision,
  status text not null default 'pending' check (status in ('pending','verified','rejected','resolved')),
  created_at timestamptz default now()
);

create table if not exists lease_listings (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id),
  title text not null,
  description text,
  area_available text,
  monthly_rent_estimate numeric,
  status text not null default 'available' check (status in ('available','leased','under_review')),
  contact_info text,
  created_at timestamptz default now()
);

create table if not exists donations (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id),
  donor_name text,
  donor_contact text,
  amount numeric not null,
  purpose text check (purpose in ('masjid_construction','school','orphanage','general')),
  payment_status text not null default 'pending' check (payment_status in ('pending','completed','failed','refunded')),
  created_at timestamptz default now()
);

create table if not exists welfare_registrations (
  id uuid primary key default uuid_generate_v4(),
  applicant_name text not null,
  category text not null check (category in (
    'orphan_scholarship','widow_pension','widow_remarriage',
    'poor_girl_marriage','legal_aid_communal_violence','institution_development'
  )),
  details jsonb,
  proof_document_urls text[] default '{}',
  status text not null default 'submitted' check (status in ('submitted','under_review','approved','rejected','funded')),
  created_at timestamptz default now()
);

create table if not exists yield_estimates (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id),
  area_acres numeric,
  locality text,
  estimated_monthly_rent numeric,
  estimated_annual_yield numeric,
  method_note text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table properties enable row level security;
alter table district_stats enable row level security;
alter table litigation_cases enable row level security;
alter table reports enable row level security;
alter table lease_listings enable row level security;
alter table donations enable row level security;
alter table welfare_registrations enable row level security;
alter table yield_estimates enable row level security;

-- Public read access (this is a transparency platform — most data is meant to be public)
create policy "public read properties" on properties for select using (true);
create policy "public read district_stats" on district_stats for select using (true);
create policy "public read litigation_cases" on litigation_cases for select using (true);
create policy "public read lease_listings" on lease_listings for select using (true);
create policy "public read yield_estimates" on yield_estimates for select using (true);

-- Reports: anyone can submit (anonymous reporting is core to the product), only verified/resolved are publicly visible;
-- pending/rejected are only visible to authenticated (admin) users.
create policy "public insert reports" on reports for insert with check (true);
create policy "public read verified reports" on reports for select using (status in ('verified','resolved'));
create policy "admin read all reports" on reports for select to authenticated using (true);
create policy "admin update reports" on reports for update to authenticated using (true);

-- Donations & welfare registrations: public can insert (submit a donation intent / apply), only admins can read raw PII.
create policy "public insert donations" on donations for insert with check (true);
create policy "admin read donations" on donations for select to authenticated using (true);

create policy "public insert welfare_registrations" on welfare_registrations for insert with check (true);
create policy "admin read welfare_registrations" on welfare_registrations for select to authenticated using (true);

-- Storage bucket for report photos and proof documents (run once)
insert into storage.buckets (id, name, public)
values ('report-photos', 'report-photos', true)
on conflict (id) do nothing;

create policy "public upload report photos" on storage.objects
  for insert with check (bucket_id = 'report-photos');
create policy "public read report photos" on storage.objects
  for select using (bucket_id = 'report-photos');
