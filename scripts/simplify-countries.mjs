import fs from "fs";
import path from "path";
import { simplify } from "@turf/simplify";

const inputPath = path.resolve(
  "assets/data/ne_110m_admin_0_countries.geojson"
);

const outputPath = path.resolve(
  "assets/data/countries-simplified.json"
);

console.log("Reading:", inputPath);

const input = JSON.parse(
  fs.readFileSync(inputPath, "utf8")
);

console.log(
  `Found ${input.features.length} country features`
);

// Larger tolerance = fewer points = better performance.
// Start with 0.1.
const simplified = simplify(input, {
  tolerance: 0.1,
  highQuality: false,
  mutate: false,
});

fs.writeFileSync(
  outputPath,
  JSON.stringify(simplified)
);

const inputSize = fs.statSync(inputPath).size;
const outputSize = fs.statSync(outputPath).size;

console.log("");
console.log("Done!");
console.log(
  `Original:   ${(inputSize / 1024).toFixed(1)} KB`
);
console.log(
  `Simplified: ${(outputSize / 1024).toFixed(1)} KB`
);
console.log(
  `Saved:      ${(
    (1 - outputSize / inputSize) *
    100
  ).toFixed(1)}%`
);