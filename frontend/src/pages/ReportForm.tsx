import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase, callFunction } from "../lib/supabase";
import { useProperties } from "../hooks/useSupabaseQuery";
import PropertySearch from "../components/PropertySearch";
import CategoryBadge from "../components/CategoryBadge";
import type { Property } from "../lib/types";

type Triage = {
  classified: boolean;
  report_type?: string;
  severity?: string;
  summary?: string;
  suggested_action?: string;
};

export default function ReportForm() {
  const [params] = useSearchParams();
  const preselectedId = params.get("property");
  const { data: properties } = useProperties();

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    () => properties.find((p) => p.id === preselectedId) ?? null
  );
  const [reportType, setReportType] = useState("encroachment");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [triage, setTriage] = useState<Triage | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      let photoUrl: string | null = null;
      if (photo) {
        const path = `${Date.now()}-${photo.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        const { error: uploadError } = await supabase.storage.from("report-photos").upload(path, photo);
        if (uploadError) throw uploadError;
        photoUrl = supabase.storage.from("report-photos").getPublicUrl(path).data.publicUrl;
      }

      const { error: insertError } = await supabase.from("reports").insert({
        reporter_name: reporterName || null,
        reporter_contact: reporterContact || null,
        property_id: selectedProperty?.id ?? null,
        report_type: reportType,
        description,
        photo_urls: photoUrl ? [photoUrl] : [],
      });
      if (insertError) throw insertError;

      try {
        const result = await callFunction<Triage>("report-triage", { description, photo_url: photoUrl });
        setTriage(result);
      } catch {
        // AI triage is a bonus — never block submission on it failing.
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong submitting your report.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-center space-y-4">
        <div className="text-3xl">✅</div>
        <h1 className="text-xl font-semibold">Report submitted</h1>
        <p className="text-sm text-ink-secondary">
          Thank you — this has been logged and will be reviewed. Verified reports become visible publicly
          on the dashboard.
        </p>
        {triage?.classified && (
          <div className="rounded-lg border border-[var(--border-hairline)] bg-surface p-4 text-left text-sm">
            <div className="text-xs uppercase tracking-wide text-ink-muted mb-1">AI triage preview</div>
            <p><strong>Type:</strong> {triage.report_type} · <strong>Severity:</strong> {triage.severity}</p>
            <p className="mt-1 text-ink-secondary">{triage.summary}</p>
            <p className="mt-1 text-ink-secondary"><strong>Suggested action:</strong> {triage.suggested_action}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-xl font-semibold">Report an issue</h1>
      <p className="text-sm text-ink-secondary mt-1 mb-6">
        Encroachment, illegal sale, or corruption involving Waqf land? Find the property, then report —
        anonymously if you prefer. Photos help a lot.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Which property? (optional)</label>
          <PropertySearch properties={properties} onSelect={setSelectedProperty} />
          {selectedProperty && (
            <div className="mt-2 flex items-center justify-between gap-2 rounded-md bg-page px-3 py-2 text-sm">
              <span className="flex items-center gap-2 truncate">
                <CategoryBadge category={selectedProperty.category} />
                <span className="truncate">{selectedProperty.name}</span>
              </span>
              <button type="button" onClick={() => setSelectedProperty(null)} className="text-ink-muted text-xs shrink-0">✕</button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Issue type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full rounded-md border border-[var(--border-hairline)] bg-surface px-3 py-2 text-sm"
          >
            <option value="encroachment">Encroachment</option>
            <option value="illegal_sale">Illegal sale</option>
            <option value="corruption">Corruption</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">What did you see? *</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the location, what's happening, and since when."
            className="w-full rounded-md border border-[var(--border-hairline)] bg-surface px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Photo (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Your name (optional)</label>
            <input
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="w-full rounded-md border border-[var(--border-hairline)] bg-surface px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact (optional)</label>
            <input
              value={reporterContact}
              onChange={(e) => setReporterContact(e.target.value)}
              className="w-full rounded-md border border-[var(--border-hairline)] bg-surface px-3 py-2 text-sm"
            />
          </div>
        </div>

        {error && <p className="text-sm text-critical">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-critical px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit report"}
        </button>
      </form>
    </div>
  );
}
