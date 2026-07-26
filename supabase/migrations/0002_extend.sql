-- Lease inquiries: citizens expressing interest in commercial-scope / vacant land listings
create table if not exists lease_inquiries (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id),
  name text not null,
  contact text not null,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz default now()
);

alter table lease_inquiries enable row level security;
create policy "public insert lease_inquiries" on lease_inquiries for insert with check (true);
create policy "admin read lease_inquiries" on lease_inquiries for select to authenticated using (true);

-- Storage bucket for welfare-registration proof documents
insert into storage.buckets (id, name, public)
values ('proof-documents', 'proof-documents', true)
on conflict (id) do nothing;

create policy "public upload proof documents" on storage.objects
  for insert with check (bucket_id = 'proof-documents');
create policy "public read proof documents" on storage.objects
  for select using (bucket_id = 'proof-documents');
