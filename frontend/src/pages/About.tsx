import BuilderCard from "../components/BuilderCard";
import DistrictEncroachmentChart from "../components/DistrictEncroachmentChart";
import { useDistrictStats } from "../hooks/useSupabaseQuery";

export default function About() {
  const { data: districtStats, loading } = useDistrictStats();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">About WaqfTrace</h1>
        <p className="text-sm text-ink-secondary mt-2">
          A crowd-sourced anti-encroachment &amp; transparency platform for Waqf land, starting with
          Hyderabad and Telangana — built in a single day for the Algorism hackathon (Ummah track).
        </p>
      </div>

      <section>
        <h2 className="text-sm font-semibold mb-2">Data sources</h2>
        <ul className="list-disc pl-5 text-sm text-ink-secondary space-y-1">
          <li>Official Telangana State Waqf Board — district-wise institution &amp; encroachment stats, and the 398-page "Kitabul Aukaf" Hyderabad property register (programmatically extracted, 340 named records)</li>
          <li>Indian Kanoon — 17 real Supreme Court / High Court litigation cases</li>
          <li>OpenStreetMap — 704 geocoded mosques, dargahs, and graveyards</li>
          <li>News archives (The Federal, Siasat Daily, Telangana Today, Deccan Chronicle, The News Minute) — named encroachment case studies</li>
          <li>ZFI USA's mirror of the Government's WAMSI/UMEED registry — confirms 45,191 total registered Telangana properties exist nationally</li>
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-2">Official government context (aggregate, not individually verified)</h2>
        <p className="text-sm text-ink-secondary mb-3">
          The dashboard's stats only reflect properties we individually fetched and can show you.
          These district-wide figures come directly from the Telangana Waqf Board's own published
          reports — useful context, but they're a government aggregate estimate, not something we've
          verified property-by-property, so they're kept separate rather than blended into "fetched" counts.
        </p>
        {!loading && <DistrictEncroachmentChart stats={districtStats} />}
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-2">Known limitations — stated up front, not hidden</h2>
        <ul className="list-disc pl-5 text-sm text-ink-secondary space-y-1">
          <li>Deep, named property data is concentrated in Hyderabad district; other districts currently have official aggregate stats only.</li>
          <li>No public source anywhere discloses real tenant/rent data at property level — the transparency module uses a small number of real, sourced precedents rather than a live feed. That gap is the product's reason to exist.</li>
          <li>The "Ask WaqfTrace" chatbot uses Claude to extract a structured filter from your question (category/district/status), then runs that through Supabase's parameterized query builder — never raw SQL — so it's safe from injection but only as good as what it can express as a filter.</li>
          <li>45,191 properties are confirmed to exist nationally, but only ID/district codes were retrievable in bulk — full detail scraping is a planned Phase 2 integration.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3">Built by</h2>
        <BuilderCard />
      </section>
    </div>
  );
}
