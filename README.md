# WaqfTrace

Crowd-sourced anti-encroachment & transparency platform for Waqf land, starting with Hyderabad/Telangana.

## Setup (do this at the venue)

1. Create a free project at https://supabase.com/dashboard (2 min).
2. Copy `.env.example` to `.env` and fill in your project's URL + service role key
   (Project Settings → API).
3. Install the Supabase CLI: `brew install supabase/tap/supabase`
4. Link and push the schema:
   ```
   supabase login
   supabase link --project-ref YOUR-PROJECT-REF
   supabase db push
   ```
5. Install JS deps and seed the database:
   ```
   npm install
   set -a; source .env; set +a
   npm run seed
   ```
6. Set the Claude API key as an edge function secret (do NOT put it in `.env` or commit it):
   ```
   supabase secrets set ANTHROPIC_API_KEY=sk-...
   ```
7. Deploy the edge functions:
   ```
   supabase functions deploy yield-optimizer
   supabase functions deploy report-triage
   ```

## What's in here

- `data/raw/` — raw pulls from each source (official Waqf Board site, news, OSM, court
  records, ZFI USA/WAMSI mirror). Kept for provenance/citations in the demo.
- `data/processed/waqftrace_master_dataset.json` — merged, deduped dataset (1,074 properties
  + district stats + litigation cases + transparency context) loaded by `scripts/seed.mjs`.
- `supabase/migrations/0001_init.sql` — full schema: properties, district_stats,
  litigation_cases, reports (public reporting), lease_listings, donations,
  welfare_registrations, yield_estimates. RLS enabled throughout — most tables are
  public-read (this is a transparency product), writes to reports/donations/
  welfare_registrations are open (anonymous reporting is the point), and only verified/
  resolved reports are publicly visible until an admin reviews them.
- `supabase/functions/yield-optimizer/` — heuristic rent/use estimate for vacant land,
  with an optional Claude narrative layer (grounded in the computed numbers, not free-form).
- `supabase/functions/report-triage/` — Claude-based classification of citizen reports
  (type/severity/summary/suggested action), text + optional photo. Never blocks report
  submission if the key is missing or the call fails.

## Known data caveats (be upfront about these in the pitch)

- Deep, named, structured property data is concentrated in Hyderabad district (340 records
  from the official Kitabul Aukaf register). Other districts currently have aggregate
  stats only — no individually-named properties surfaced in research for Khammam, Adilabad,
  Karimnagar, Mahbubnagar, Medak.
- No public source anywhere discloses real tenant/rent data at property level — the
  commercial-transparency view uses a small number of real, sourced precedents (e.g. Madina
  Commercial Complex rent-arrears case) rather than a full live feed. That gap is the
  product's thesis, not a bug to hide.
- 45,191 official Telangana Waqf properties are confirmed to exist via a third-party mirror
  of government WAMSI/UMEED data, but only ID/district codes are available in bulk — full
  detail-scraping was interrupted by the source site's fragile hosting. Framed as a Phase 2
  live-integration target (see `data/raw/zfiusa_waqf_db.json`).
