"""
Generates src/anatomy-svg.js using the extracted subdivisions.
"""

import json

with open('scripts/front_subdivisions.json') as f:
    front_data = json.load(f)

with open('scripts/back_subdivisions.json') as f:
    back_data = json.load(f)

js_content = '''// Pure vector SVG generator for Realistic Anatomical Muscle Heatmap (Front and Back)
// Trace-mapped directly to high-fidelity anatomical references (front.png & back.png)
// Exactly 16 canonical muscles with shared IDs for bilateral left/right regions

import { CANONICAL_CATALOG } from "./muscle-data.js";

const DEFAULT_GREY = "#A7A9A5";

function getColor(muscleColorMap, muscleId) {
  if (!muscleColorMap) return DEFAULT_GREY;
  if (typeof muscleColorMap[muscleId] === "string") return muscleColorMap[muscleId];
  if (muscleColorMap[muscleId] && typeof muscleColorMap[muscleId].color === "string") {
    return muscleColorMap[muscleId].color;
  }
  return DEFAULT_GREY;
}

function getAria(muscleColorMap, muscleId) {
  const meta = CANONICAL_CATALOG.find((c) => c.id === muscleId);
  const name = meta ? meta.name : muscleId;
  if (muscleColorMap && muscleColorMap[muscleId] && typeof muscleColorMap[muscleId].sets === "number") {
    const sets = muscleColorMap[muscleId].sets;
    const label = muscleColorMap[muscleId].label || (sets > 0 ? `${sets} sets` : "No training");
    return `${name}: ${label} (${sets} set${sets === 1 ? "" : "s"})`;
  }
  return name;
}

const FRONT_PATHS = ''' + json.dumps({g: [item['d'] for item in items] for g, items in front_data.items()}, indent=2) + ''';

const BACK_PATHS = ''' + json.dumps({g: [item['d'] for item in items] for g, items in back_data.items()}, indent=2) + ''';

/**
 * Render Front / Anterior SVG View
 * Canonical muscles visible:
 * chest, anterior_deltoids, lateral_deltoids, biceps, forearms, abs, obliques, quadriceps, calves
 */
export function renderAnteriorSvg(muscleColorMap = {}, options = {}) {
  const selectedMuscle = options.selectedMuscle || null;

  const groupsOrder = [
    "chest",
    "anterior_deltoids",
    "lateral_deltoids",
    "biceps",
    "forearms",
    "abs",
    "obliques",
    "quadriceps",
    "calves"
  ];

  const muscleGroupsHtml = groupsOrder.map((id) => {
    const c = getColor(muscleColorMap, id);
    const isSelected = selectedMuscle === id;
    const isTrained = c !== DEFAULT_GREY;
    const opacity = isTrained ? "0.65" : "0";
    const paths = (FRONT_PATHS[id] || []).map((d) => {
      return `<path class="muscle-path" d="${d}" fill="${c}" fill-opacity="${opacity}" />`;
    }).join("\\n      ");

    return `<g class="muscle-group ${isSelected ? "is-selected" : ""}" data-muscle="${id}" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, id)}">
      ${paths}
    </g>`;
  }).join("\\n\\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 500 1024" class="anatomy-svg anterior-view" role="img" aria-label="Anterior Muscle Heatmap">
    <defs>
      <filter id="muscle-shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.3" />
      </filter>
    </defs>

    <!-- Underlying Realistic Anatomical Reference Base Illustration -->
    <image href="/assets/anatomy/front.png" xlink:href="/assets/anatomy/front.png" x="0" y="0" width="500" height="1024" preserveAspectRatio="none" />

    <!-- Interactive Traced Vector Muscle Overlay -->
    ${muscleGroupsHtml}
  </svg>`;
}

/**
 * Render Back / Posterior SVG View
 * Canonical muscles visible:
 * traps, posterior_deltoids, lateral_deltoids, lats, triceps, lower_back, glutes, hamstrings, calves, forearms
 */
export function renderPosteriorSvg(muscleColorMap = {}, options = {}) {
  const selectedMuscle = options.selectedMuscle || null;

  const groupsOrder = [
    "traps",
    "posterior_deltoids",
    "lateral_deltoids",
    "triceps",
    "lats",
    "lower_back",
    "forearms",
    "glutes",
    "hamstrings",
    "calves"
  ];

  const muscleGroupsHtml = groupsOrder.map((id) => {
    const c = getColor(muscleColorMap, id);
    const isSelected = selectedMuscle === id;
    const isTrained = c !== DEFAULT_GREY;
    const opacity = isTrained ? "0.65" : "0";
    const paths = (BACK_PATHS[id] || []).map((d) => {
      return `<path class="muscle-path" d="${d}" fill="${c}" fill-opacity="${opacity}" />`;
    }).join("\\n      ");

    return `<g class="muscle-group ${isSelected ? "is-selected" : ""}" data-muscle="${id}" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, id)}">
      ${paths}
    </g>`;
  }).join("\\n\\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 500 1024" class="anatomy-svg posterior-view" role="img" aria-label="Posterior Muscle Heatmap">
    <defs>
      <filter id="muscle-shadow-p" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.3" />
      </filter>
    </defs>

    <!-- Underlying Realistic Anatomical Reference Base Illustration (Offset by +14 to center perfectly at x=250) -->
    <image href="/assets/anatomy/back.png" xlink:href="/assets/anatomy/back.png" x="14" y="0" width="472" height="1024" preserveAspectRatio="none" />

    <!-- Interactive Traced Vector Muscle Overlay -->
    ${muscleGroupsHtml}
  </svg>`;
}
'''

with open('src/anatomy-svg.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print('Generated src/anatomy-svg.js successfully!')

