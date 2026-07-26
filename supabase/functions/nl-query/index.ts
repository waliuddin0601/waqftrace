// WaqfTrace — natural-language property search ("ask in plain English" chatbot).
//
// Security note: this is deliberately NOT literal text-to-SQL. Letting an LLM emit
// raw SQL that gets executed is a real injection risk (prompt injection -> arbitrary
// query). Instead, Claude extracts a small, strictly-typed filter object; we validate
// every field against an allowlist and apply it via Supabase's parameterized query
// builder (.eq/.ilike), never string-concatenated SQL. Same UX, no injection surface.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CATEGORIES = ["mosque", "dargah", "graveyard", "ashoorkhana", "chillah", "land", "other"];
const DISTRICTS = [
  "Hyderabad", "Rangareddy", "Medchal-Malkajgiri", "Sangareddy", "Nalgonda",
  "Warangal", "Nizamabad", "Adilabad", "Karimnagar", "Khammam", "Mahbubnagar", "Medak",
];

type Filter = {
  category: string | null;
  district: string | null;
  status_keyword: string | null;
  name_contains: string | null;
  commercial_scope: boolean | null;
  limit: number;
};

async function extractFilter(question: string): Promise<Filter> {
  const fallback: Filter = {
    category: null, district: null, status_keyword: null,
    name_contains: null, commercial_scope: null, limit: 20,
  };
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return fallback;

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
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content:
              `Extract search filters from this question about a Waqf property database: "${question}". ` +
              `Respond with ONLY a JSON object, no prose: ` +
              `{"category": one of ${JSON.stringify(CATEGORIES)} or null, ` +
              `"district": one of ${JSON.stringify(DISTRICTS)} or null (match the closest, e.g. "hyderabad" -> "Hyderabad"), ` +
              `"status_keyword": a short lowercase word to match status like "encroach" or "litigation" or "registered", or null, ` +
              `"name_contains": a substring to search property names for, or null, ` +
              `"commercial_scope": true, false, or null, ` +
              `"limit": a number of results requested, default 20, max 100}`,
          },
        ],
      }),
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    const text = data?.content?.[0]?.text ?? "";
    const raw = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");

    return {
      category: CATEGORIES.includes(raw.category) ? raw.category : null,
      district: DISTRICTS.includes(raw.district) ? raw.district : null,
      status_keyword: typeof raw.status_keyword === "string" ? raw.status_keyword.slice(0, 40) : null,
      name_contains: typeof raw.name_contains === "string" ? raw.name_contains.slice(0, 80) : null,
      commercial_scope: typeof raw.commercial_scope === "boolean" ? raw.commercial_scope : null,
      limit: Math.min(Math.max(Number(raw.limit) || 20, 1), 100),
    };
  } catch {
    return fallback;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: CORS_HEADERS });
  }

  const body = await req.json().catch(() => ({}));
  const question = String(body.question ?? "").slice(0, 500);
  if (!question) {
    return new Response(JSON.stringify({ error: "question is required" }), { status: 400, headers: CORS_HEADERS });
  }

  const filter = await extractFilter(question);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, anonKey);

  let query = supabase.from("properties").select("id,name,category,district,locality_ward,status,caretaker_mutawalli", { count: "exact" });
  if (filter.category) query = query.eq("category", filter.category);
  if (filter.district) query = query.eq("district", filter.district);
  if (filter.status_keyword) query = query.ilike("status", `%${filter.status_keyword}%`);
  if (filter.name_contains) query = query.ilike("name", `%${filter.name_contains}%`);
  if (filter.commercial_scope !== null) query = query.eq("commercial_scope", filter.commercial_scope);
  query = query.limit(filter.limit);

  const { data, error, count } = await query;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS_HEADERS });
  }

  const parts: string[] = [];
  if (filter.category) parts.push(filter.category);
  if (filter.district) parts.push(`in ${filter.district}`);
  if (filter.status_keyword) parts.push(`with status matching "${filter.status_keyword}"`);
  if (filter.name_contains) parts.push(`named like "${filter.name_contains}"`);
  const descriptor = parts.length ? parts.join(" ") : "properties";
  const answer_text =
    count === 0
      ? `No properties found matching ${descriptor}.`
      : `Found ${count} ${descriptor}${(count ?? 0) > filter.limit ? ` (showing first ${filter.limit})` : ""}.`;

  return new Response(
    JSON.stringify({ answer_text, filter_used: filter, count, properties: data }),
    { headers: { "content-type": "application/json", ...CORS_HEADERS } }
  );
});
