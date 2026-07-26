import { useState } from "react";
import { supabase } from "../lib/supabase";

const CATEGORIES = [
  { value: "orphan_scholarship", label: "Orphan — scholarship support" },
  { value: "widow_pension", label: "Widow — pension support" },
  { value: "widow_remarriage", label: "Widow — remarriage assistance" },
  { value: "poor_girl_marriage", label: "Poor family — daughter's marriage assistance" },
  { value: "legal_aid_communal_violence", label: "Family affected by communal violence — legal aid" },
  { value: "institution_development", label: "Waqf institution (masjid/school/qabristan) — development funding" },
];

export default function Register() {
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [details, setDetails] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const proofUrls: string[] = [];
      if (files) {
        for (const file of Array.from(files)) {
          const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
          const { error: uploadError } = await supabase.storage.from("proof-documents").upload(path, file);
          if (uploadError) throw uploadError;
          proofUrls.push(supabase.storage.from("proof-documents").getPublicUrl(path).data.publicUrl);
        }
      }

      const { error: insertError } = await supabase.from("welfare_registrations").insert({
        applicant_name: name,
        category,
        details: { contact, notes: details },
        proof_document_urls: proofUrls,
      });
      if (insertError) throw insertError;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong submitting your registration.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-3">
        <div className="text-3xl">✅</div>
        <h1 className="text-xl font-semibold">Registration received</h1>
        <p className="text-sm text-ink-secondary">
          Your application has been logged for review. Funding comes from Waqf surplus and donations —
          approved applicants will be contacted using the details you provided.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-xl font-semibold">Register for support</h1>
      <p className="text-sm text-ink-secondary mt-1 mb-6">
        For orphans, widows, families affected by communal violence, poor families needing marriage
        assistance, or Waqf institutions needing development funding — funded from Waqf surplus and
        public donations, with proof documents for verification.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-[var(--border-hairline)] bg-surface px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Applicant / institution name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-[var(--border-hairline)] bg-surface px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contact *</label>
          <input
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Phone or email"
            className="w-full rounded-md border border-[var(--border-hairline)] bg-surface px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tell us more</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            placeholder="Your situation, and what support you're requesting."
            className="w-full rounded-md border border-[var(--border-hairline)] bg-surface px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Proof documents (ID, death/widow certificate, institution registration, etc.)</label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={(e) => setFiles(e.target.files)}
            className="w-full text-sm"
          />
        </div>

        {error && <p className="text-sm text-critical">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-good px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit registration"}
        </button>
      </form>
    </div>
  );
}
