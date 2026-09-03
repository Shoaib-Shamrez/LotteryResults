// src/utils/seoMirror.js
//
// Client-side mirror of the backend's generateSeoFields template. Used only
// for live preview in the admin form. The backend is the source of truth; if
// the two drift, the backend value is what gets persisted.

export const GAME_NAMES = Object.freeze({
  numbers: "New York Daily Numbers",
  win4: "New York Win 4",
  take5: "New York Take 5",
  lotto: "New York Lotto",
  powerball: "Powerball",
  megamillions: "Mega Millions"
});

const DESCRIPTION_MAX_LEN = 160;

function safe(v) { return v === null || v === undefined ? "" : String(v); }
function clean(v) { return safe(v).replace(/[\u0000-\u001f\u007f]+/g, "").trim(); }
function titleCaseSlug(slug) {
  return String(slug || "").replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function ymd(v) {
  if (!v) return "";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d.getTime())) return safe(v);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseNums(v) {
  if (Array.isArray(v)) return v.map((x) => clean(x)).filter(Boolean);
  if (typeof v === "string") return v.split(",").map((x) => x.trim()).filter(Boolean);
  return [];
}
function joinNums(v) {
  const arr = parseNums(v);
  return arr.length ? arr.join(", ") : null;
}

export function previewSeoFields({ category, date, middayWinningNumbers, eveningWinningNumbers, title }) {
  const cat = safe(category).toLowerCase();
  const gameName = GAME_NAMES[cat] || titleCaseSlug(cat);
  const dateStr = ymd(date);

  const cleanedTitle = clean(title);
  const metaTitle = cleanedTitle
    ? `${cleanedTitle} | ${gameName}`
    : `${gameName} Winning Numbers - ${dateStr}`;

  const mid = joinNums(middayWinningNumbers) ?? "N/A";
  const eve = joinNums(eveningWinningNumbers) ?? "N/A";
  let metaDescription = clean(
    `${gameName} winning numbers for ${dateStr}. Midday: ${mid} | Evening: ${eve}.`
  );
  if (metaDescription.length > DESCRIPTION_MAX_LEN) {
    metaDescription = metaDescription.slice(0, DESCRIPTION_MAX_LEN - 1).trimEnd() + "…";
  }
  return { metaTitle: clean(metaTitle) || `${gameName} Results`, metaDescription: metaDescription || `${gameName} results.` };
}
