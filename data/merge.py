import json, re
from pathlib import Path

RAW = Path(__file__).parent / "raw"
OUT = Path(__file__).parent / "processed"

def load(name):
    return json.load(open(RAW / name, encoding="utf-8"))

properties = []
pid = 0
def next_id():
    global pid
    pid += 1
    return f"WT-{pid:05d}"

# 1. Kitabul Aukaf register — 340 structured, named, official Hyderabad properties
ka = load("kitabul_aukaf_full_extract.json")
for r in ka["records"]:
    properties.append({
        "id": next_id(),
        "name": (r.get("name") or "").strip()[:300],
        "category": r.get("category") or "other",
        "district": "Hyderabad",
        "locality_ward": r.get("ward"),
        "address_text": r.get("locality") or r.get("property_description"),
        "lat": None, "lon": None,
        "area_text": r.get("area_or_valuation"),
        "survey_number": r.get("survey_number"),
        "boundaries": r.get("boundaries"),
        "status": r.get("registration_status") or "registered",
        "caretaker_mutawalli": r.get("muttawali") or r.get("wakif_name"),
        "estimated_value_inr": None,
        "litigation": None,
        "source_type": "official_register",
        "source_url": ka["source_url"],
        "is_demo_placeholder": False,
    })

# 2. Named case studies — 29 real encroachment/litigation cases across 7 districts
cs = load("case_studies.json")
for c in cs["cases"]:
    properties.append({
        "id": next_id(),
        "name": c.get("name"),
        "category": c.get("category") or "other",
        "district": c.get("district"),
        "locality_ward": c.get("location"),
        "address_text": c.get("location"),
        "lat": None, "lon": None,
        "area_text": f'{c["area_acres"]} acres' if c.get("area_acres") else None,
        "survey_number": None,
        "boundaries": None,
        "status": c.get("status"),
        "caretaker_mutawalli": None,
        "estimated_value_inr": c.get("estimated_value_inr"),
        "litigation": {"case_name": c.get("court_case")} if c.get("court_case") else None,
        "source_type": "news_case_study",
        "source_url": c.get("source_url"),
        "is_demo_placeholder": False,
    })

# 3. OSM geocoded sites — 704 real lat/lon points (mosques/dargahs/graveyards), map base layer
osm = load("osm_islamic_sites.json")
for s in osm["sites"]:
    properties.append({
        "id": next_id(),
        "name": s.get("name") or f"Unnamed {s.get('category_guess')}",
        "category": s.get("category_guess") or "other",
        "district": None,
        "locality_ward": None,
        "address_text": s.get("tags", {}).get("addr:full") or s.get("tags", {}).get("addr:street"),
        "lat": s.get("lat"), "lon": s.get("lon"),
        "area_text": None,
        "survey_number": None,
        "boundaries": None,
        "status": "unverified_geo_point",
        "caretaker_mutawalli": None,
        "estimated_value_inr": None,
        "litigation": None,
        "source_type": "osm",
        "source_url": f"https://www.openstreetmap.org/{s.get('osm_type')}/{s.get('osm_id')}",
        "is_demo_placeholder": False,
    })

# 4. zfiusa fully-detail-scraped sample (only 1 real, rest are ID-only stubs — keep only the real one)
zf = load("zfiusa_waqf_db.json")
for p in zf["properties"]:
    if p.get("category") and p.get("status"):  # only the fully detail-scraped record(s)
        properties.append({
            "id": next_id(),
            "name": p.get("name"),
            "category": p.get("category"),
            "district": p.get("district"),
            "locality_ward": p.get("locality"),
            "address_text": p.get("address"),
            "lat": None, "lon": None,
            "area_text": p.get("area"),
            "survey_number": p.get("other_fields", {}).get("waqf_id"),
            "boundaries": None,
            "status": p.get("status"),
            "caretaker_mutawalli": None,
            "estimated_value_inr": None,
            "litigation": {"note": "See status field — active litigation per WAMSI mirror"} if "Litigation" in (p.get("status") or "") else None,
            "source_type": "zfiusa_wamsi_mirror",
            "source_url": p.get("other_fields", {}).get("detail_url"),
            "is_demo_placeholder": False,
        })

# Reference / context tables (kept separate, not property rows)
district_stats = load("official_district_stats.json")
litigation_cases = load("litigation_cases.json")
transparency_context = load("transparency_context.json")
zfiusa_scale = {
    "total_confirmed_via_api": zf["site_assessment"].get("total_claimed_properties"),
    "bulk_index_count": load("zfiusa_waqf_bulk_index_full_45191.json")["recordsTotal"],
    "note": "Full state property index confirmed at 45,191 records via ZFI USA's mirror of WAMSI/UMEED data (snapshot ~Oct 2024). Only ID/code fields available in bulk; per-property name/address/status requires detail-page scraping, which the site's fragile hosting interrupted after 1 record. Treat as a future live-data integration target, not part of the curated demo set.",
    "district_code_sample_counts": {p["district"]: None for p in []},
}

master = {
    "meta": {
        "project": "WaqfTrace",
        "scope": "Hyderabad / Telangana, India",
        "total_properties": len(properties),
        "by_source_type": {},
        "by_category": {},
    },
    "properties": properties,
    "district_aggregate_stats": district_stats,
    "litigation_cases": litigation_cases["cases"],
    "transparency_and_welfare_context": transparency_context,
    "state_scale_reference": zfiusa_scale,
}

from collections import Counter
master["meta"]["by_source_type"] = dict(Counter(p["source_type"] for p in properties))
master["meta"]["by_category"] = dict(Counter(p["category"] for p in properties))
master["meta"]["by_district"] = dict(Counter(p["district"] for p in properties if p["district"]))
master["meta"]["with_lat_lon"] = sum(1 for p in properties if p["lat"] is not None)

OUT.mkdir(exist_ok=True)
json.dump(master, open(OUT / "waqftrace_master_dataset.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

print(json.dumps(master["meta"], indent=2, ensure_ascii=False))
