export type Category =
  | "mosque"
  | "dargah"
  | "graveyard"
  | "ashoorkhana"
  | "chillah"
  | "land"
  | "other";

export interface Property {
  id: string;
  external_id: string | null;
  name: string;
  category: Category;
  district: string | null;
  locality_ward: string | null;
  address_text: string | null;
  lat: number | null;
  lon: number | null;
  area_text: string | null;
  survey_number: string | null;
  boundaries: unknown;
  status: string | null;
  caretaker_mutawalli: string | null;
  estimated_value_inr: string | null;
  litigation: { case_name?: string; note?: string } | null;
  commercial_scope: boolean;
  source_type: string | null;
  source_url: string | null;
  is_demo_placeholder: boolean;
  created_at: string;
}

export interface DistrictStat {
  district: string;
  district_scheme: string | null;
  institutions_total: number | null;
  area_acres_total: number | null;
  area_encroached_acres: number | null;
  category_counts: Record<string, number> | null;
  notes: string | null;
}

export interface LitigationCase {
  id: string;
  case_name: string;
  citation: string | null;
  court: string | null;
  year: string | null;
  property_involved: string | null;
  location: string | null;
  area: string | null;
  dispute_summary: string | null;
  outcome_status: string | null;
  source_url: string | null;
}

export interface Report {
  id?: string;
  reporter_name?: string | null;
  reporter_contact?: string | null;
  property_id?: string | null;
  report_type: "encroachment" | "illegal_sale" | "corruption" | "other";
  description: string;
  photo_urls?: string[];
  lat?: number | null;
  lon?: number | null;
  status?: string;
  created_at?: string;
}
