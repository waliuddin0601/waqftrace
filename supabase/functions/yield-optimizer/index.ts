// WaqfTrace — free v1 yield optimizer for vacant/under-utilized Waqf land.
// Deterministic heuristic core (transparent, defensible to judges) with an optional
// LLM narrative layer if ANTHROPIC_API_KEY is set — falls back to heuristic-only otherwise.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Illustrative base rent (INR per acre per year) by locality tier — seeded from
// real comparables we could source (e.g. Madina Complex, Hyderabad core) and
// standard peri-urban/rural discount ratios. Replace with a live rent-index API later.
const LOCALITY_TIER_RATE: Record<string, number> = {
  hyderabad_core: 4_000_000,
  hyderabad_metro: 2_200_000,
  district_urban: 900_000,
  district_rural: 250_000,
};

const CORE_DISTRICTS = new Set(["Hyderabad"]);
const METRO_DISTRICTS = new Set(["Rangareddy", "Medchal-Malkajgiri", "Sangareddy"]);

function localityTier(district?: string | null): keyof typeof LOCALITY_TIER_RATE {
  if (!district) return "district_rural";
  if (CORE_DISTRICTS.has(district)) return "hyderabad_core";
  if (METRO_DISTRICTS.has(district)) return "hyderabad_metro";
  return "district_urban";
}

function recommendUse(areaAcres: number, tier: string, commercialScope: boolean) {
  if (tier === "hyderabad_core" && areaAcres < 1) return "Retail/shop complex lease (high footfall, small footprint)";
  if (tier === "hyderabad_core" || tier === "hyderabad_metro") {
    return areaAcres > 3
      ? "Mixed-use development: community hall/school + commercial lease block"
      : "Commercial lease (offices/retail) — high locality demand";
  }
  if (commercialScope && areaAcres > 5) return "Warehousing/logistics lease or solar land-lease";
  if (areaAcres > 10) return "Agricultural lease or solar land-lease (low-maintenance yield)";
  return "Community facility (school/madrasa) or residential lease, subject to local need";
}

async function narrateWithLLM(input: Record<string, unknown>, heuristic: Record<string, unknown>) {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content:
              `You are grounding a rental-yield estimate for a Waqf land transparency platform. ` +
              `Given these computed numbers (do not invent new figures, only explain/contextualize them): ` +
              `${JSON.stringify({ input, heuristic })}. ` +
              `Write a 2-3 sentence plain-language recommendation for the Waqf board on how to use this land, referencing the numbers given.`,
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.content?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: CORS_HEADERS });
  }
  const body = await req.json().catch(() => ({}));
  const area_acres = Number(body.area_acres);
  const district = body.district ?? null;
  const commercial_scope = !!body.commercial_scope;
  const property_id = body.property_id ?? null;

  if (!area_acres || area_acres <= 0) {
    return new Response(JSON.stringify({ error: "area_acres (>0) is required" }), { status: 400, headers: CORS_HEADERS });
  }

  const tier = localityTier(district);
  const rate = LOCALITY_TIER_RATE[tier];
  const estimated_annual_yield = Math.round(area_acres * rate);
  const estimated_monthly_rent = Math.round(estimated_annual_yield / 12);
  const recommended_use = recommendUse(area_acres, tier, commercial_scope);

  const heuristic = {
    locality_tier: tier,
    base_rate_per_acre_per_year_inr: rate,
    estimated_annual_yield_inr: estimated_annual_yield,
    estimated_monthly_rent_inr: estimated_monthly_rent,
    recommended_use,
    method_note:
      "v1 heuristic: illustrative locality-tier rate table, not a live market feed. " +
      "For production, replace LOCALITY_TIER_RATE with a real comparable-rent index API.",
  };

  const narrative = await narrateWithLLM({ area_acres, district, commercial_scope }, heuristic);

  // Best-effort persistence — don't fail the response if this errors.
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseUrl && serviceKey) {
      const supabase = createClient(supabaseUrl, serviceKey);
      await supabase.from("yield_estimates").insert({
        property_id,
        area_acres,
        locality: district,
        estimated_monthly_rent,
        estimated_annual_yield,
        method_note: heuristic.method_note,
      });
    }
  } catch {
    // non-fatal
  }

  return new Response(JSON.stringify({ ...heuristic, ai_narrative: narrative }), {
    headers: { "content-type": "application/json", ...CORS_HEADERS },
  });
});
