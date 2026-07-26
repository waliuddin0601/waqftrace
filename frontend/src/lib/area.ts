// Best-effort area parser. Source text (`area_text`) is free-form — for the 340
// official register records it's frequently a rent/valuation note ("Per Month:
// Rs.150...") rather than an area at all, and units are inconsistent (acres, sq
// yards, sq meters, sq feet) even when an area IS present. We only count a
// property if we find an explicit area unit attached to a number — never guess
// from a bare number, since that risks silently summing rupee amounts as if they
// were acreage. Function returns null (not 0) when nothing parses, so the caller
// can report real coverage ("N of 1074 properties") instead of overclaiming.
const UNIT_TO_ACRES: Record<string, number> = {
  acre: 1,
  sqyard: 1 / 4840,
  sqmeter: 1 / 4046.8564224,
  sqfeet: 1 / 43560,
};

const UNIT_PATTERNS: { key: keyof typeof UNIT_TO_ACRES; label: RegExp; number: RegExp }[] = [
  { key: "acre", label: /acres?\s*:?\s*([\d,]+(?:\.\d+)?)/i, number: /([\d,]+(?:\.\d+)?)\s*acres?\b/i },
  { key: "sqyard", label: /sq\.?\s*ya?rds?\s*:?\s*([\d,]+(?:\.\d+)?)/i, number: /([\d,]+(?:\.\d+)?)\s*sq\.?\s*ya?rds?\b/i },
  { key: "sqmeter", label: /sq\.?\s*(?:mtrs?|meters?)\s*:?\s*([\d,]+(?:\.\d+)?)/i, number: /([\d,]+(?:\.\d+)?)\s*sq\.?\s*(?:mtrs?|meters?)\b/i },
  { key: "sqfeet", label: /sq\.?\s*(?:ft|feet)\s*:?\s*([\d,]+(?:\.\d+)?)/i, number: /([\d,]+(?:\.\d+)?)\s*sq\.?\s*(?:ft|feet)\b/i },
];

export function parseAreaAcres(text: string | null | undefined): number | null {
  if (!text) return null;
  for (const { key, label, number } of UNIT_PATTERNS) {
    const match = text.match(label) ?? text.match(number);
    if (match) {
      const value = parseFloat(match[1].replace(/,/g, ""));
      if (Number.isFinite(value) && value > 0) {
        return value * UNIT_TO_ACRES[key];
      }
    }
  }
  return null;
}

export function sumParsedAcres(areaTexts: (string | null | undefined)[]) {
  let totalAcres = 0;
  let matchedCount = 0;
  for (const text of areaTexts) {
    const acres = parseAreaAcres(text);
    if (acres !== null) {
      totalAcres += acres;
      matchedCount += 1;
    }
  }
  return { totalAcres, matchedCount };
}
