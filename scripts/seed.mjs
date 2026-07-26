// Zero-dependency seed script — talks to Supabase's PostgREST API directly via fetch,
// so it runs with nothing but Node itself (no npm install required).
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars. See ../.env.example");
  process.exit(1);
}

const dataset = JSON.parse(
  readFileSync(path.join(__dirname, "..", "data", "processed", "waqftrace_master_dataset.json"), "utf-8")
);

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function restInsert(table, rows, { upsertOn } = {}) {
  const headers = {
    "content-type": "application/json",
    apikey: SERVICE_KEY,
    authorization: `Bearer ${SERVICE_KEY}`,
    prefer: upsertOn ? `resolution=merge-duplicates,return=minimal` : "return=minimal",
  };
  const url = `${SUPABASE_URL}/rest/v1/${table}${upsertOn ? `?on_conflict=${upsertOn}` : ""}`;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(rows) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${table} insert failed (${res.status}): ${text}`);
  }
}

function normalizeCategory(cat) {
  if (!cat) return "other";
  const c = cat.toLowerCase();
  if (c.includes("dargah") || c.includes("mazaar") || c.includes("makbara")) return "dargah";
  if (c.includes("grave")) return "graveyard";
  if (c.includes("mosque") || c.includes("masjid")) return "mosque";
  if (c.includes("ashoor") || c.includes("ashur")) return "ashoorkhana";
  if (c.includes("chilla")) return "chillah";
  if (c.includes("land")) return "land";
  return "other";
}

async function seedProperties() {
  const rows = dataset.properties.map((p) => ({
    external_id: p.id,
    name: (p.name || "Unnamed property").slice(0, 500),
    category: normalizeCategory(p.category),
    district: p.district,
    locality_ward: p.locality_ward,
    address_text: p.address_text,
    lat: p.lat,
    lon: p.lon,
    area_text: p.area_text,
    survey_number: p.survey_number,
    boundaries: p.boundaries ? { raw: p.boundaries } : null,
    status: p.status || "unknown",
    caretaker_mutawalli: p.caretaker_mutawalli,
    estimated_value_inr: p.estimated_value_inr,
    litigation: p.litigation || null,
    commercial_scope: /commercial|lease|shop|complex/i.test(p.address_text || p.name || ""),
    source_type: p.source_type,
    source_url: p.source_url,
    is_demo_placeholder: !!p.is_demo_placeholder,
  }));

  let inserted = 0;
  for (const batch of chunk(rows, 500)) {
    await restInsert("properties", batch);
    inserted += batch.length;
    process.stdout.write(`\rInserted ${inserted}/${rows.length} properties`);
  }
  console.log();
}

async function seedDistrictStats() {
  const rows = (dataset.district_aggregate_stats?.districts || []).map((d) => ({
    district: d.district,
    district_scheme: d.district_scheme,
    institutions_total: d.institutions_total,
    area_acres_total: d.area_acres_total,
    area_encroached_acres: d.area_encroached_acres,
    category_counts: d.category_counts,
    notes: d.notes,
  }));
  await restInsert("district_stats", rows, { upsertOn: "district" });
  console.log(`Upserted ${rows.length} district_stats rows`);
}

async function seedLitigation() {
  const rows = (dataset.litigation_cases || []).map((c) => ({
    case_name: c.case_name,
    citation: c.citation,
    court: c.court,
    year: c.year,
    property_involved: c.property_involved,
    location: c.location,
    area: c.area,
    dispute_summary: c.dispute_summary,
    outcome_status: c.outcome_status,
    source_url: c.source_url,
  }));
  await restInsert("litigation_cases", rows);
  console.log(`Inserted ${rows.length} litigation_cases rows`);
}

async function main() {
  console.log(
    `Seeding ${dataset.properties.length} properties, ` +
      `${dataset.district_aggregate_stats?.districts?.length || 0} district stats, ` +
      `${dataset.litigation_cases?.length || 0} litigation cases...`
  );
  await seedProperties();
  await seedDistrictStats();
  await seedLitigation();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
