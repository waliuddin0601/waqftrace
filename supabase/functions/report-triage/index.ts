// WaqfTrace — AI triage for public encroachment/corruption reports.
// Takes a citizen-submitted description (+ optional photo) and returns a structured
// classification to help the Waqf board/admins prioritize review. Never blocks report
// submission if the API key is missing or the call fails — triage is an enhancement,
// not a gate on the public reporting feature.
const MODEL = "claude-sonnet-5";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function classify(description: string, photoUrl: string | null) {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return { classified: false, reason: "no_api_key" };

  const content: Record<string, unknown>[] = [
    {
      type: "text",
      text:
        "A citizen submitted this report about a Waqf (Islamic endowment) property in Telangana, India: " +
        `"${description}". ` +
        "Classify it. Respond with ONLY a JSON object, no prose, matching this shape: " +
        `{"report_type": "encroachment"|"illegal_sale"|"corruption"|"other", ` +
        `"severity": "low"|"medium"|"high"|"critical", ` +
        `"summary": "one plain-language sentence", ` +
        `"suggested_action": "one short recommended next step for the Waqf board"}`,
    },
  ];

  if (photoUrl) {
    try {
      const imgRes = await fetch(photoUrl);
      if (imgRes.ok) {
        const buf = new Uint8Array(await imgRes.arrayBuffer());
        const b64 = btoa(String.fromCharCode(...buf));
        const mediaType = imgRes.headers.get("content-type") || "image/jpeg";
        content.unshift({
          type: "image",
          source: { type: "base64", media_type: mediaType, data: b64 },
        });
      }
    } catch {
      // proceed text-only if photo fetch fails
    }
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [{ role: "user", content }],
      }),
    });
    if (!res.ok) return { classified: false, reason: `api_error_${res.status}` };
    const data = await res.json();
    const text = data?.content?.[0]?.text ?? "";
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
    return { classified: true, ...parsed };
  } catch (e) {
    return { classified: false, reason: "parse_or_network_error" };
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
  const description = String(body.description ?? "").slice(0, 2000);
  const photo_url = body.photo_url ?? null;

  if (!description) {
    return new Response(JSON.stringify({ error: "description is required" }), { status: 400, headers: CORS_HEADERS });
  }

  const result = await classify(description, photo_url);
  return new Response(JSON.stringify(result), { headers: { "content-type": "application/json", ...CORS_HEADERS } });
});
