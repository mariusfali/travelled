const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const basePath = path.join(root, 'assets/data/countries110.json');
const detailPath = path.join(root, 'assets/data/countries.json');
const outputPath = path.join(root, 'assets/data/countries110_merged_small.json');

const targetNames = [
  'Vatican',
  'Vatican City',
  'San Marino',
  'Monaco',
  'Liechtenstein',
  'Andorra',
  'Luxembourg',
  'Malta',
  'Singapore',
  'Gibraltar',
];

const targetIso = new Set(['VAT', 'SMR', 'MCO', 'LIE', 'AND', 'LUX', 'MLT', 'SGP', 'GIB']);

const normalize = (value = '') => String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');

const validFeature = (feature) => feature && feature.type === 'Feature' && feature.properties;

const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));
const detail = JSON.parse(fs.readFileSync(detailPath, 'utf8'));

const micro = detail.features.filter((feature) => {
  if (!validFeature(feature)) return false;

  const p = feature.properties;
  const iso = String(
    p['ISO3166-1-Alpha-3'] || p.ISO_A3 || p.ADM0_A3 || p.SOV_A3 || ''
  ).trim().toUpperCase();

  const names = [p.name, p.NAME, p.ADMIN, p.SOVEREIGNT].filter(Boolean).map(String);
  return targetIso.has(iso) || names.some((name) => targetNames.some((target) => normalize(name).includes(normalize(target))));
});

const detailByIso = new Map();
const detailByName = new Map();

for (const feature of micro) {
  const p = feature.properties;
  const iso = String(
    p['ISO3166-1-Alpha-3'] || p.ISO_A3 || p.ADM0_A3 || p.SOV_A3 || ''
  ).trim().toUpperCase();

  if (iso) detailByIso.set(iso, feature);

  for (const key of ['name', 'NAME', 'ADMIN', 'SOVEREIGNT']) {
    const raw = p[key];
    if (!raw) continue;
    detailByName.set(normalize(raw), feature);
  }
}

const mergedFeatures = [];
const seen = new Set();

for (const feature of base.features) {
  if (!validFeature(feature)) {
    mergedFeatures.push(feature);
    continue;
  }

  const p = feature.properties;
  const iso = String(
    p.ADM0_A3 || p.SOV_A3 || p.ISO_A3 || p['ISO3166-1-Alpha-3'] || ''
  ).trim().toUpperCase();
  const name = String(p.name || p.NAME || p.ADMIN || p.SOVEREIGNT || '').trim();

  const replacement = iso ? detailByIso.get(iso) : null;
  const byName = name ? detailByName.get(normalize(name)) : null;
  const chosen = replacement || byName || feature;

  const key = String(
    chosen.properties['ISO3166-1-Alpha-3'] ||
    chosen.properties.ISO_A3 ||
    chosen.properties.ADM0_A3 ||
    chosen.properties.SOV_A3 ||
    chosen.properties.name ||
    chosen.properties.NAME ||
    chosen.properties.ADMIN ||
    chosen.properties.SOVEREIGNT ||
    ''
  ).trim().toUpperCase();

  if (key && !seen.has(key)) {
    seen.add(key);
    mergedFeatures.push(chosen);
  }
}

for (const feature of micro) {
  const p = feature.properties;
  const key = String(
    p['ISO3166-1-Alpha-3'] ||
    p.ISO_A3 ||
    p.ADM0_A3 ||
    p.SOV_A3 ||
    p.name ||
    p.NAME ||
    p.ADMIN ||
    p.SOVEREIGNT ||
    ''
  ).trim().toUpperCase();

  if (key && !seen.has(key)) {
    seen.add(key);
    mergedFeatures.push(feature);
  }
}

const merged = {
  ...base,
  features: mergedFeatures,
};

fs.writeFileSync(outputPath, JSON.stringify(merged));

const microNames = merged.features
  .filter((feature) => validFeature(feature))
  .filter((feature) => {
    const p = feature.properties;
    const values = [
      p.name,
      p.NAME,
      p.ADMIN,
      p.SOVEREIGNT,
      p['ISO3166-1-Alpha-3'],
      p.ISO_A3,
      p.ADM0_A3,
      p.SOV_A3,
    ].filter(Boolean).map(String);

    return targetNames.some((target) => values.some((value) => normalize(value).includes(normalize(target))));
  })
  .map((feature) => feature.properties.name || feature.properties.NAME || feature.properties.ADMIN || feature.properties.SOVEREIGNT);

console.log('Tiny-country features in merged file:', microNames);
console.log('Merged feature count:', merged.features.length);
