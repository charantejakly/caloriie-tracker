import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { renderAnteriorSvg, renderPosteriorSvg } from "../src/anatomy-svg.js";
import { CANONICAL_MUSCLES, CANONICAL_CATALOG } from "../src/muscle-data.js";
import { calculateDailyHeatmap, DEFAULT_HEATMAP_THRESHOLDS, HEATMAP_PALETTE } from "../src/heatmap.js";
import { calculateMuscleRecovery, DEFAULT_RECOVERY_HOURS } from "../src/recovery.js";

test("Anatomical Heatmap: 1. Both anatomy views render correctly with valid SVG markup", () => {
  const frontSvg = renderAnteriorSvg();
  const backSvg = renderPosteriorSvg();

  assert.ok(frontSvg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert.ok(frontSvg.includes('viewBox="0 0 500 1024"'));
  assert.ok(frontSvg.includes('class="anatomy-svg anterior-view"'));
  assert.ok(frontSvg.includes('/assets/anatomy/front.png'));

  assert.ok(backSvg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert.ok(backSvg.includes('viewBox="0 0 500 1024"'));
  assert.ok(backSvg.includes('class="anatomy-svg posterior-view"'));
  assert.ok(backSvg.includes('/assets/anatomy/back.png'));
});

test("Anatomical Heatmap: 2. All 16 canonical IDs are represented across the two views", () => {
  const frontSvg = renderAnteriorSvg();
  const backSvg = renderPosteriorSvg();

  const anteriorCanonical = [
    "chest", "anterior_deltoids", "lateral_deltoids", "biceps",
    "forearms", "abs", "obliques", "quadriceps", "calves"
  ];

  const posteriorCanonical = [
    "traps", "posterior_deltoids", "lateral_deltoids", "triceps",
    "lats", "lower_back", "forearms", "glutes", "hamstrings", "calves"
  ];

  for (const id of anteriorCanonical) {
    assert.ok(frontSvg.includes(`data-muscle="${id}"`), `Front view must include ${id}`);
  }

  for (const id of posteriorCanonical) {
    assert.ok(backSvg.includes(`data-muscle="${id}"`), `Back view must include ${id}`);
  }

  // Combined set must equal exact 16 canonical muscles
  const union = new Set([...anteriorCanonical, ...posteriorCanonical]);
  assert.equal(union.size, 16);
  for (const m of CANONICAL_MUSCLES) {
    assert.ok(union.has(m), `Canonical muscle ${m} must be in union`);
  }
});

test("Anatomical Heatmap: 3. Bilateral paths share the correct canonical IDs without split IDs", () => {
  const frontSvg = renderAnteriorSvg();
  const backSvg = renderPosteriorSvg();

  // No left/right sub-muscle identifiers in data-muscle
  assert.ok(!frontSvg.includes('data-muscle="chest_left"'));
  assert.ok(!frontSvg.includes('data-muscle="chest_right"'));
  assert.ok(!frontSvg.includes('data-muscle="quad_left"'));
  assert.ok(!backSvg.includes('data-muscle="glute_left"'));

  // Multi-subdivision groups have multiple paths inside the canonical group
  const chestMatch = frontSvg.match(/<g[^>]*data-muscle="chest"[^>]*>([\s\S]*?)<\/g>/);
  assert.ok(chestMatch, "Must find chest group");
  const chestPaths = chestMatch[1].match(/<path/g);
  assert.ok(chestPaths && chestPaths.length >= 2, "Chest must have multiple subdivision paths");

  const quadsMatch = frontSvg.match(/<g[^>]*data-muscle="quadriceps"[^>]*>([\s\S]*?)<\/g>/);
  assert.ok(quadsMatch, "Must find quads group");
  const quadsPaths = quadsMatch[1].match(/<path/g);
  assert.ok(quadsPaths && quadsPaths.length >= 2, "Quads must have multiple subdivision paths");

  const glutesMatch = backSvg.match(/<g[^>]*data-muscle="glutes"[^>]*>([\s\S]*?)<\/g>/);
  assert.ok(glutesMatch, "Must find glutes group");
  const glutesPaths = glutesMatch[1].match(/<path/g);
  assert.ok(glutesPaths && glutesPaths.length >= 2, "Glutes must have multiple subdivision paths");
});

test("Anatomical Heatmap: 4. Multiple SVG paths for a muscle receive identical colors", () => {
  const colorMap = {
    chest: { color: "#D83B43", sets: 15, label: "Good" },
    abs: { color: "#E98A32", sets: 8, label: "Moderate" },
    quadriceps: { color: "#51406F", sets: 22, label: "Elite" }
  };

  const frontSvg = renderAnteriorSvg(colorMap);

  // All chest paths must have fill="#D83B43"
  const chestMatch = frontSvg.match(/<g[^>]*data-muscle="chest"[^>]*>([\s\S]*?)<\/g>/)[1];
  const chestFillRegex = /fill="([^"]+)"/g;
  let match;
  let count = 0;
  while ((match = chestFillRegex.exec(chestMatch)) !== null) {
    assert.equal(match[1], "#D83B43");
    count++;
  }
  assert.ok(count >= 2, "At least 2 chest paths checked");
});

test("Anatomical Heatmap: 5. Muscle selection correctly marks group as is-selected", () => {
  const frontSelected = renderAnteriorSvg({}, { selectedMuscle: "chest" });
  assert.ok(frontSelected.includes('<g class="muscle-group is-selected" data-muscle="chest"'));
  assert.ok(frontSelected.includes('<g class="muscle-group " data-muscle="biceps"'));

  const backSelected = renderPosteriorSvg({}, { selectedMuscle: "lats" });
  assert.ok(backSelected.includes('<g class="muscle-group is-selected" data-muscle="lats"'));
  assert.ok(backSelected.includes('<g class="muscle-group " data-muscle="glutes"'));
});

test("Anatomical Heatmap: 6 & 7. Date changes reset/reapply colors and verify approved thresholds", () => {
  // Day 1: Chest workout 14 sets => Red (#D83B43)
  const day1Workouts = [
    {
      id: "w1",
      date: "2026-11-04",
      detailStatus: "detailed",
      exercises: [
        {
          id: "e1",
          name: "Bench Press",
          muscleMapping: { primary: ["chest"], secondary: ["triceps"] },
          sets: Array(14).fill({ reps: 10, weightKg: 80, effort: 8 })
        }
      ]
    }
  ];

  // Day 2: Leg workout 6 sets => Orange (#E98A32) for quads, Chest should be 0 sets => Grey (#A7A9A5)
  const day2Workouts = [
    {
      id: "w2",
      date: "2026-11-05",
      detailStatus: "detailed",
      exercises: [
        {
          id: "e2",
          name: "Squat",
          muscleMapping: { primary: ["quadriceps"], secondary: ["glutes"] },
          sets: Array(6).fill({ reps: 8, weightKg: 100, effort: 8 })
        }
      ]
    }
  ];

  const heatmapDay1 = calculateDailyHeatmap(day1Workouts, DEFAULT_HEATMAP_THRESHOLDS);
  assert.equal(heatmapDay1.muscles.chest.color, "#D83B43");
  assert.equal(heatmapDay1.muscles.quadriceps.color, "#A7A9A5");

  const svgDay1 = renderAnteriorSvg(heatmapDay1.muscles);
  assert.ok(svgDay1.includes('data-muscle="chest"'));
  assert.ok(svgDay1.includes('fill="#D83B43"'));

  const heatmapDay2 = calculateDailyHeatmap(day2Workouts, DEFAULT_HEATMAP_THRESHOLDS);
  assert.equal(heatmapDay2.muscles.quadriceps.color, "#E98A32");
  assert.equal(heatmapDay2.muscles.chest.color, "#A7A9A5"); // Reset cleanly!

  const svgDay2 = renderAnteriorSvg(heatmapDay2.muscles);
  assert.ok(svgDay2.includes('fill="#E98A32"'));
});

test("Anatomical Heatmap: 8. Secondary involvement receives zero set credit", () => {
  const workouts = [
    {
      id: "w1",
      date: "2026-11-05",
      detailStatus: "detailed",
      exercises: [
        {
          id: "e1",
          name: "Barbell Bench Press",
          muscleMapping: { primary: ["chest"], secondary: ["anterior_deltoids", "triceps"] },
          sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }]
        }
      ]
    }
  ];

  const map = calculateDailyHeatmap(workouts, DEFAULT_HEATMAP_THRESHOLDS);
  assert.equal(map.muscles.chest.sets, 3);
  assert.equal(map.muscles.anterior_deltoids.sets, 0);
  assert.equal(map.muscles.triceps.sets, 0);
  assert.equal(map.muscles.anterior_deltoids.color, "#A7A9A5");
  assert.ok(map.muscles.anterior_deltoids.secondaryInvolvement.includes("Barbell Bench Press"));
});

test("Anatomical Heatmap: 9. No heatmap appears on non-detailed or empty dates", () => {
  // Empty
  assert.equal(calculateDailyHeatmap([]), null);
  // General cardio / legacy
  assert.equal(calculateDailyHeatmap([{ id: "w_leg", date: "2026-11-05", type: "Gym", durationMinutes: 60 }]), null);
});

test("Anatomical Heatmap: 10 & 11. Recovery calculations and Gate C missing-time behavior", () => {
  const primaryWorkout = {
    id: "w1",
    date: "2026-11-05",
    time: null, // missing workout time! Gate C requires date-only calculation
    detailStatus: "detailed",
    exercises: [
      {
        id: "e1",
        name: "Push-up",
        muscleMapping: { primary: ["chest"], secondary: [] },
        sets: [{ reps: 20 }]
      }
    ]
  };

  const rec = calculateMuscleRecovery("chest", [primaryWorkout], DEFAULT_RECOVERY_HOURS, {}, new Date(2026, 10, 5, 12, 0, 0));
  assert.equal(rec.hasExactTime, false);
  assert.equal(rec.state, "date-only");
  assert.ok(rec.statusLabel.includes("date-only estimate"));
});

test("Anatomical Heatmap: 12. Both PNG assets exist on disk in assets/anatomy/", () => {
  const frontPath = path.resolve("assets/anatomy/front.png");
  const backPath = path.resolve("assets/anatomy/back.png");

  assert.ok(fs.existsSync(frontPath), "front.png must exist");
  assert.ok(fs.existsSync(backPath), "back.png must exist");

  const frontStat = fs.statSync(frontPath);
  const backStat = fs.statSync(backPath);
  assert.ok(frontStat.size > 100000, "front.png must be non-empty");
  assert.ok(backStat.size > 100000, "back.png must be non-empty");
});

test("Anatomical Heatmap: 13. Service worker includes both anatomy assets in precache list", () => {
  const swContent = fs.readFileSync("sw.js", "utf8");
  assert.ok(swContent.includes("/assets/anatomy/front.png"), "sw.js must precache front.png");
  assert.ok(swContent.includes("/assets/anatomy/back.png"), "sw.js must precache back.png");
});

test("Anatomical Heatmap: 14. Build script copies assets directory to dist/", () => {
  const buildContent = fs.readFileSync("scripts/build.mjs", "utf8");
  assert.ok(buildContent.includes('"assets"'), "scripts/build.mjs must copy assets directory");
});

test("Anatomical Heatmap: 15. Obliques and Abs corrections verified", () => {
  const frontSvg = renderAnteriorSvg();

  // Abs must have exactly 6 rectus abdominis subdivision paths (V-cut removed)
  const absMatch = frontSvg.match(/<g[^>]*data-muscle="abs"[^>]*>([\s\S]*?)<\/g>/);
  assert.ok(absMatch, "Must find abs group");
  const absPaths = absMatch[1].match(/<path/g);
  assert.equal(absPaths.length, 6, "Abs must represent exactly the 6 rectus abdominis segments");

  // Obliques must exclusively represent external oblique flanks (serratus anterior removed)
  const oblMatch = frontSvg.match(/<g[^>]*data-muscle="obliques"[^>]*>([\s\S]*?)<\/g>/);
  assert.ok(oblMatch, "Must find obliques group");
  const oblPaths = oblMatch[1].match(/<path/g);
  assert.equal(oblPaths.length, 4, "Obliques must represent left and right external oblique regions");

  // Ensure no serratus anterior canonical muscle ID exists
  assert.ok(!frontSvg.includes('data-muscle="serratus'));
  assert.ok(!CANONICAL_MUSCLES.has("serratus_anterior"));
  assert.equal(CANONICAL_MUSCLES.size, 16);
});
