import BuilderCard from "../components/BuilderCard";
import DataSourceCards from "../components/DataSourceCards";
import PipelineDiagram from "../components/PipelineDiagram";

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-10">
      <div className="rounded-2xl bg-gradient-to-br from-series7 via-series1 to-series3 px-6 py-10 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold">About WaqfTrace</h1>
        <p className="text-sm sm:text-base text-white/90 mt-2 max-w-2xl">
          A crowd-sourced anti-encroachment &amp; transparency platform for Waqf land, starting with
          Hyderabad and Telangana — built in a single day for the Algorism hackathon (Ummah track).
        </p>
        <div className="mt-5 inline-block rounded-lg bg-white/95 p-1">
          <BuilderCard />
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-1">Where the data comes from</h2>
        <p className="text-sm text-ink-secondary mb-4">
          Five real sources, programmatically pulled — nothing hand-typed, nothing invented.
        </p>
        <DataSourceCards />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-1">How raw records become the platform you see</h2>
        <p className="text-sm text-ink-secondary mb-6">
          End to end: from a government PDF to a pin on the map, plus everything the public feeds back in.
        </p>
        <div className="rounded-2xl border border-[var(--border-hairline)] bg-page p-4 sm:p-8">
          <PipelineDiagram />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Known limitations — stated up front, not hidden</h2>
        <div className="space-y-2">
          {[
            "Deep, named property data is concentrated in Hyderabad district; other districts currently have official aggregate stats only.",
            "No public source anywhere discloses real tenant/rent data at property level — the transparency module uses a small number of real, sourced precedents rather than a live feed. That gap is the product's reason to exist.",
            "The \"Ask WaqfTrace\" chatbot uses Claude to extract a structured filter from your question (category/district/status), then runs that through Supabase's parameterized query builder — never raw SQL — so it's safe from injection but only as good as what it can express as a filter.",
            "45,191 properties are confirmed to exist nationally, but only ID/district codes were retrievable in bulk — full detail scraping is a planned Phase 2 integration.",
          ].map((text) => (
            <div key={text} className="flex gap-2 rounded-lg border border-[var(--border-hairline)] bg-surface p-3 text-sm text-ink-secondary">
              <span className="text-series4" aria-hidden>⚠</span>
              {text}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
