// Pure vector SVG generator for Anterior (Front) and Posterior (Back) anatomical views
// Exactly 16 canonical muscles with shared IDs for bilateral left/right regions

import { CANONICAL_CATALOG, CANONICAL_MUSCLES } from "./muscle-data.js";

const DEFAULT_GREY = "#A7A9A5";
const BASE_OUTLINE = "#cfd4c8";
const BODY_BASE_FILL = "#e4e8dd";
const STROKE_COLOR = "#333d35";

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

/**
 * Render Front / Anterior SVG View
 * Canonical muscles visible:
 * chest, anterior_deltoids, lateral_deltoids, biceps, forearms, abs, obliques, quadriceps, calves
 */
export function renderAnteriorSvg(muscleColorMap = {}, options = {}) {
  const selectedMuscle = options.selectedMuscle || null;

  const c_chest = getColor(muscleColorMap, "chest");
  const c_ant_delt = getColor(muscleColorMap, "anterior_deltoids");
  const c_lat_delt = getColor(muscleColorMap, "lateral_deltoids");
  const c_biceps = getColor(muscleColorMap, "biceps");
  const c_forearms = getColor(muscleColorMap, "forearms");
  const c_abs = getColor(muscleColorMap, "abs");
  const c_obliques = getColor(muscleColorMap, "obliques");
  const c_quads = getColor(muscleColorMap, "quadriceps");
  const c_calves = getColor(muscleColorMap, "calves");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" class="anatomy-svg anterior-view" role="img" aria-label="Anterior Muscle Heatmap">
    <defs>
      <filter id="muscle-shadow" x="-8%" y="-8%" width="116%" height="116%">
        <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.18" />
      </filter>
    </defs>

    <!-- Head and Neck Base Silhouette -->
    <g class="anatomy-base" stroke="${BASE_OUTLINE}" stroke-width="1.2" fill="${BODY_BASE_FILL}">
      <path d="M100 16 C90 16 84 24 84 37 C84 52 91 60 100 60 C109 60 116 52 116 37 C116 24 110 16 100 16 Z" />
      <path d="M94 59 L91 76 L109 76 L106 59 Z" />
    </g>

    <!-- Chest (Pectoralis Major) -->
    <g class="muscle-group ${selectedMuscle === "chest" ? "is-selected" : ""}" data-muscle="chest" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "chest")}">
      <!-- Left Pectoral -->
      <path d="M98 78 L78 80 C68 83 62 89 61 98 C61 113 74 122 98 122 L98 78 Z"
        fill="${c_chest}" stroke="${STROKE_COLOR}" stroke-width="1.2" stroke-linejoin="round" />
      <!-- Right Pectoral -->
      <path d="M102 78 L122 80 C132 83 138 89 139 98 C139 113 126 122 102 122 L102 78 Z"
        fill="${c_chest}" stroke="${STROKE_COLOR}" stroke-width="1.2" stroke-linejoin="round" />
    </g>

    <!-- Anterior Deltoids (Front Shoulders) -->
    <g class="muscle-group ${selectedMuscle === "anterior_deltoids" ? "is-selected" : ""}" data-muscle="anterior_deltoids" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "anterior_deltoids")}">
      <path d="M60 84 C56 86 52 90 52 98 C52 106 56 112 60 112 C62 106 63 95 62 87 Z"
        fill="${c_ant_delt}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
      <path d="M140 84 C144 86 148 90 148 98 C148 106 144 112 140 112 C138 106 137 95 138 87 Z"
        fill="${c_ant_delt}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
    </g>

    <!-- Lateral Deltoids (Side Shoulders) -->
    <g class="muscle-group ${selectedMuscle === "lateral_deltoids" ? "is-selected" : ""}" data-muscle="lateral_deltoids" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "lateral_deltoids")}">
      <path d="M51 86 C46 90 44 98 44 106 C44 114 47 120 52 120 C50 112 50 96 51 86 Z"
        fill="${c_lat_delt}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
      <path d="M149 86 C154 90 156 98 156 106 C156 114 153 120 148 120 C150 112 150 96 149 86 Z"
        fill="${c_lat_delt}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
    </g>

    <!-- Biceps -->
    <g class="muscle-group ${selectedMuscle === "biceps" ? "is-selected" : ""}" data-muscle="biceps" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "biceps")}">
      <path d="M49 121 C43 124 41 133 42 145 C44 156 49 159 52 159 C54 152 54 135 52 121 Z"
        fill="${c_biceps}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
      <path d="M151 121 C157 124 159 133 158 145 C156 156 151 159 148 159 C146 152 146 135 148 121 Z"
        fill="${c_biceps}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
    </g>

    <!-- Forearms -->
    <g class="muscle-group ${selectedMuscle === "forearms" ? "is-selected" : ""}" data-muscle="forearms" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "forearms")}">
      <path d="M42 163 C36 170 33 186 34 204 C35 212 38 214 41 214 C44 202 48 184 49 164 Z"
        fill="${c_forearms}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
      <path d="M158 163 C164 170 167 186 166 204 C165 212 162 214 159 214 C156 202 152 184 151 164 Z"
        fill="${c_forearms}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
    </g>

    <!-- Abdominals (Rectus Abdominis) -->
    <g class="muscle-group ${selectedMuscle === "abs" ? "is-selected" : ""}" data-muscle="abs" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "abs")}">
      <!-- Upper Abs -->
      <rect x="88" y="126" width="10" height="15" rx="2" fill="${c_abs}" stroke="${STROKE_COLOR}" stroke-width="0.9" />
      <rect x="102" y="126" width="10" height="15" rx="2" fill="${c_abs}" stroke="${STROKE_COLOR}" stroke-width="0.9" />
      <!-- Mid Abs -->
      <rect x="88" y="144" width="10" height="16" rx="2" fill="${c_abs}" stroke="${STROKE_COLOR}" stroke-width="0.9" />
      <rect x="102" y="144" width="10" height="16" rx="2" fill="${c_abs}" stroke="${STROKE_COLOR}" stroke-width="0.9" />
      <!-- Lower Abs -->
      <path d="M88 163 L98 163 L97 183 C93 181 89 174 88 163 Z" fill="${c_abs}" stroke="${STROKE_COLOR}" stroke-width="0.9" />
      <path d="M102 163 L112 163 L112 174 C111 181 107 183 103 183 Z" fill="${c_abs}" stroke="${STROKE_COLOR}" stroke-width="0.9" />
    </g>

    <!-- Obliques -->
    <g class="muscle-group ${selectedMuscle === "obliques" ? "is-selected" : ""}" data-muscle="obliques" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "obliques")}">
      <path d="M74 125 C70 134 68 152 72 171 C76 175 84 179 85 174 C83 158 84 138 85 125 Z"
        fill="${c_obliques}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
      <path d="M126 125 C130 134 132 152 128 171 C124 175 116 179 115 174 C117 158 116 138 115 125 Z"
        fill="${c_obliques}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
    </g>

    <!-- Quadriceps -->
    <g class="muscle-group ${selectedMuscle === "quadriceps" ? "is-selected" : ""}" data-muscle="quadriceps" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "quadriceps")}">
      <!-- Left Quad -->
      <path d="M72 186 C64 200 62 232 64 265 C68 281 83 283 89 278 C95 264 96 230 96 195 C88 190 78 186 72 186 Z"
        fill="${c_quads}" stroke="${STROKE_COLOR}" stroke-width="1.2" stroke-linejoin="round" />
      <!-- Right Quad -->
      <path d="M128 186 C136 200 138 232 136 265 C132 281 117 283 111 278 C105 264 104 230 104 195 C112 190 122 186 128 186 Z"
        fill="${c_quads}" stroke="${STROKE_COLOR}" stroke-width="1.2" stroke-linejoin="round" />
    </g>

    <!-- Calves (Anterior/Tibialis/Gastrocnemius silhouette) -->
    <g class="muscle-group ${selectedMuscle === "calves" ? "is-selected" : ""}" data-muscle="calves" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "calves")}">
      <!-- Left Shin/Calf -->
      <path d="M68 296 C63 312 62 338 67 364 C70 376 77 377 82 376 C84 354 86 322 84 296 Z"
        fill="${c_calves}" stroke="${STROKE_COLOR}" stroke-width="1.1" stroke-linejoin="round" />
      <!-- Right Shin/Calf -->
      <path d="M132 296 C137 312 138 338 133 364 C130 376 123 377 118 376 C116 354 114 322 116 296 Z"
        fill="${c_calves}" stroke="${STROKE_COLOR}" stroke-width="1.1" stroke-linejoin="round" />
    </g>
  </svg>`;
}

/**
 * Render Back / Posterior SVG View
 * Canonical muscles visible:
 * traps, posterior_deltoids, lateral_deltoids, lats, triceps, lower_back, glutes, hamstrings, calves, forearms
 */
export function renderPosteriorSvg(muscleColorMap = {}, options = {}) {
  const selectedMuscle = options.selectedMuscle || null;

  const c_traps = getColor(muscleColorMap, "traps");
  const c_post_delt = getColor(muscleColorMap, "posterior_deltoids");
  const c_lat_delt = getColor(muscleColorMap, "lateral_deltoids");
  const c_lats = getColor(muscleColorMap, "lats");
  const c_triceps = getColor(muscleColorMap, "triceps");
  const c_lower_back = getColor(muscleColorMap, "lower_back");
  const c_glutes = getColor(muscleColorMap, "glutes");
  const c_hamstrings = getColor(muscleColorMap, "hamstrings");
  const c_calves = getColor(muscleColorMap, "calves");
  const c_forearms = getColor(muscleColorMap, "forearms");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" class="anatomy-svg posterior-view" role="img" aria-label="Posterior Muscle Heatmap">
    <defs>
      <filter id="muscle-shadow-p" x="-8%" y="-8%" width="116%" height="116%">
        <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.18" />
      </filter>
    </defs>

    <!-- Head and Neck Base Silhouette -->
    <g class="anatomy-base" stroke="${BASE_OUTLINE}" stroke-width="1.2" fill="${BODY_BASE_FILL}">
      <path d="M100 16 C90 16 84 24 84 37 C84 52 91 60 100 60 C109 60 116 52 116 37 C116 24 110 16 100 16 Z" />
      <path d="M94 59 L91 76 L109 76 L106 59 Z" />
    </g>

    <!-- Trapezius (Traps) -->
    <g class="muscle-group ${selectedMuscle === "traps" ? "is-selected" : ""}" data-muscle="traps" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "traps")}">
      <path d="M100 63 L80 82 L72 84 L96 122 L100 126 L104 122 L128 84 L120 82 Z"
        fill="${c_traps}" stroke="${STROKE_COLOR}" stroke-width="1.2" stroke-linejoin="round" />
    </g>

    <!-- Posterior Deltoids (Rear Shoulders) -->
    <g class="muscle-group ${selectedMuscle === "posterior_deltoids" ? "is-selected" : ""}" data-muscle="posterior_deltoids" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "posterior_deltoids")}">
      <path d="M69 86 C62 88 56 94 56 104 C56 112 62 117 68 116 C71 106 72 95 69 86 Z"
        fill="${c_post_delt}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
      <path d="M131 86 C138 88 144 94 144 104 C144 112 138 117 132 116 C129 106 128 95 131 86 Z"
        fill="${c_post_delt}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
    </g>

    <!-- Lateral Deltoids (Visible from Rear) -->
    <g class="muscle-group ${selectedMuscle === "lateral_deltoids" ? "is-selected" : ""}" data-muscle="lateral_deltoids" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "lateral_deltoids")}">
      <path d="M55 88 C49 92 46 99 46 107 C46 114 49 119 54 119 C52 112 52 98 55 88 Z"
        fill="${c_lat_delt}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
      <path d="M145 88 C151 92 154 99 154 107 C154 114 151 119 146 119 C148 112 148 98 145 88 Z"
        fill="${c_lat_delt}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
    </g>

    <!-- Triceps -->
    <g class="muscle-group ${selectedMuscle === "triceps" ? "is-selected" : ""}" data-muscle="triceps" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "triceps")}">
      <path d="M51 121 C44 125 42 135 44 148 C46 156 50 159 53 159 C55 150 55 134 53 121 Z"
        fill="${c_triceps}" stroke="${STROKE_COLOR}" stroke-width="1.1" stroke-linejoin="round" />
      <path d="M149 121 C156 125 158 135 156 148 C154 156 150 159 147 159 C145 150 145 134 147 121 Z"
        fill="${c_triceps}" stroke="${STROKE_COLOR}" stroke-width="1.1" stroke-linejoin="round" />
    </g>

    <!-- Latissimus Dorsi (Lats) -->
    <g class="muscle-group ${selectedMuscle === "lats" ? "is-selected" : ""}" data-muscle="lats" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "lats")}">
      <!-- Left Lat -->
      <path d="M72 108 C64 122 62 142 66 162 C73 166 84 163 90 159 L95 127 C84 120 76 114 72 108 Z"
        fill="${c_lats}" stroke="${STROKE_COLOR}" stroke-width="1.1" stroke-linejoin="round" />
      <!-- Right Lat -->
      <path d="M128 108 C136 122 138 142 134 162 C127 166 116 163 110 159 L105 127 C116 120 124 114 128 108 Z"
        fill="${c_lats}" stroke="${STROKE_COLOR}" stroke-width="1.1" stroke-linejoin="round" />
    </g>

    <!-- Lower Back (Erector Spinae) -->
    <g class="muscle-group ${selectedMuscle === "lower_back" ? "is-selected" : ""}" data-muscle="lower_back" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "lower_back")}">
      <path d="M92 132 L98 132 L97 178 C94 179 92 178 90 174 L92 132 Z"
        fill="${c_lower_back}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
      <path d="M102 132 L108 132 L110 174 C108 178 106 179 103 178 L102 132 Z"
        fill="${c_lower_back}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
    </g>

    <!-- Posterior Forearms -->
    <g class="muscle-group ${selectedMuscle === "forearms" ? "is-selected" : ""}" data-muscle="forearms" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "forearms")}">
      <path d="M43 164 C37 172 34 188 35 204 C36 212 39 214 42 214 C45 202 48 184 50 164 Z"
        fill="${c_forearms}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
      <path d="M157 164 C163 172 166 188 165 204 C164 212 161 214 158 214 C155 202 152 184 150 164 Z"
        fill="${c_forearms}" stroke="${STROKE_COLOR}" stroke-width="1" stroke-linejoin="round" />
    </g>

    <!-- Glutes (Gluteus Maximus / Medius) -->
    <g class="muscle-group ${selectedMuscle === "glutes" ? "is-selected" : ""}" data-muscle="glutes" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "glutes")}">
      <!-- Left Glute -->
      <path d="M98 180 C84 179 69 184 66 199 C64 214 74 227 98 227 L98 180 Z"
        fill="${c_glutes}" stroke="${STROKE_COLOR}" stroke-width="1.2" stroke-linejoin="round" />
      <!-- Right Glute -->
      <path d="M102 180 C116 179 131 184 134 199 C136 214 126 227 102 227 L102 180 Z"
        fill="${c_glutes}" stroke="${STROKE_COLOR}" stroke-width="1.2" stroke-linejoin="round" />
    </g>

    <!-- Hamstrings -->
    <g class="muscle-group ${selectedMuscle === "hamstrings" ? "is-selected" : ""}" data-muscle="hamstrings" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "hamstrings")}">
      <!-- Left Hamstring -->
      <path d="M68 230 C64 246 65 266 70 284 C76 288 88 288 92 284 C95 267 96 248 96 230 Z"
        fill="${c_hamstrings}" stroke="${STROKE_COLOR}" stroke-width="1.2" stroke-linejoin="round" />
      <!-- Right Hamstring -->
      <path d="M132 230 C136 246 135 266 130 284 C124 288 112 288 108 284 C105 267 104 248 104 230 Z"
        fill="${c_hamstrings}" stroke="${STROKE_COLOR}" stroke-width="1.2" stroke-linejoin="round" />
    </g>

    <!-- Calves (Gastrocnemius & Soleus) -->
    <g class="muscle-group ${selectedMuscle === "calves" ? "is-selected" : ""}" data-muscle="calves" tabindex="0" role="button" aria-label="${getAria(muscleColorMap, "calves")}">
      <!-- Left Calf -->
      <path d="M70 292 C62 308 60 334 66 360 C70 374 76 376 82 374 C87 356 88 326 86 292 Z"
        fill="${c_calves}" stroke="${STROKE_COLOR}" stroke-width="1.2" stroke-linejoin="round" />
      <!-- Right Calf -->
      <path d="M130 292 C138 308 140 334 134 360 C130 374 124 376 118 374 C113 356 112 326 114 292 Z"
        fill="${c_calves}" stroke="${STROKE_COLOR}" stroke-width="1.2" stroke-linejoin="round" />
    </g>
  </svg>`;
}

