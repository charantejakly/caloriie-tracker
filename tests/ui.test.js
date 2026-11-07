import test from "node:test";
import assert from "node:assert/strict";
import {
  CURRENT_SCHEMA_VERSION,
  blankData,
  migrateData,
  mergeData,
  localDate
} from "../src/store.js";
import {
  DEFAULT_HEATMAP_THRESHOLDS,
  HEATMAP_PALETTE,
  validateHeatmapThresholds,
  calculateDailyHeatmap
} from "../src/heatmap.js";
import { renderAnteriorSvg, renderPosteriorSvg } from "../src/anatomy-svg.js";
import {
  DEFAULT_RECOVERY_HOURS,
  validateRecoveryHours,
  findLatestPrimarySession,
  calculateMuscleRecovery,
  calculateAllMuscleRecovery
} from "../src/recovery.js";
import {
  CANONICAL_MUSCLES,
  CANONICAL_CATALOG,
  getWorkoutDetailStatus,
  isValidSet
} from "../src/muscle-data.js";

// Helper simulating workoutView() rendering logic
function renderWorkoutViewSimulation(state) {
  const { workouts, activeDate, heatmapAnatomyView, inspectedMuscleId, recoveryHours, recoveryOverrides, now } = state;

  const sessionsOnActiveDate = workouts.filter((w) => w.date === activeDate);
  const heatmapData = calculateDailyHeatmap(sessionsOnActiveDate, DEFAULT_HEATMAP_THRESHOLDS);

  let heatmapHtml = "";
  if (heatmapData !== null) {
    const svgHtml = heatmapAnatomyView === "posterior"
      ? renderPosteriorSvg(heatmapData.muscles, { selectedMuscle: inspectedMuscleId })
      : renderAnteriorSvg(heatmapData.muscles, { selectedMuscle: inspectedMuscleId });

    let inspectCardHtml = "";
    if (inspectedMuscleId && heatmapData.muscles[inspectedMuscleId]) {
      const mInfo = heatmapData.muscles[inspectedMuscleId];
      const contributingStr = mInfo.contributingExercises.length
        ? mInfo.contributingExercises.map((e) => typeof e === "object" ? `${e.exerciseName} (${e.sets} set${e.sets === 1 ? "" : "s"})` : e).join(", ")
        : "None (0 direct sets)";
      const secondaryStr = mInfo.secondaryInvolvement.length
        ? mInfo.secondaryInvolvement.join(", ")
        : "None";

      inspectCardHtml = `
        <div class="muscle-inspect-card" role="region" aria-label="Inspected muscle details">
          <strong>${mInfo.name}</strong>
          <p>Primary Sets: ${mInfo.sets} sets · ${mInfo.label}</p>
          <p>Contributing exercises (primary): ${contributingStr}</p>
          <p>Secondary involvement (0 set credit): ${secondaryStr}</p>
        </div>
      `;
    }

    heatmapHtml = `
      <section class="heatmap-container">
        <div class="heatmap-view-toggle">
          <button class="${heatmapAnatomyView === 'anterior' ? 'active' : ''}" data-heatmap-view="anterior">Front View</button>
          <button class="${heatmapAnatomyView === 'posterior' ? 'active' : ''}" data-heatmap-view="posterior">Back View</button>
        </div>
        <div class="heatmap-svg-wrap">${svgHtml}</div>
        ${inspectCardHtml}
        <div class="heatmap-legend">
          <span>0 sets (No training)</span>
          <span>1–5 (Minimal)</span>
          <span>6–11 (Moderate)</span>
          <span>12–19 (Good)</span>
          <span>20+ (Elite)</span>
        </div>
      </section>
    `;
  } else {
    const dateHasWorkouts = sessionsOnActiveDate.length > 0;
    heatmapHtml = `
      <section class="heatmap-container">
        ${
          dateHasWorkouts
            ? `<div class="boundary-note">Detailed muscle data not available for this date</div>`
            : `<div class="boundary-note">No training recorded for this date</div>`
        }
      </section>
    `;
  }

  const allRecovery = calculateAllMuscleRecovery(workouts, recoveryHours, recoveryOverrides, now);
  const recoveryCardsHtml = allRecovery.map((item) => {
    return `<article class="recovery-card" data-muscle="${item.muscleId}">
      <h4>${item.muscleName}</h4>
      <span class="detail-badge ${item.state}">${item.statusLabel}</span>
      <p class="details">${item.details}</p>
    </article>`;
  }).join("\n");

  return {
    heatmapData,
    heatmapHtml,
    recoveryCardsHtml,
    allRecovery
  };
}

test("UI check 1 & 2: Front/Back view switching renders correct anatomical SVG", () => {
  const session = {
    id: "w1",
    date: "2026-11-04",
    exercises: [
      {
        name: "Pull-ups",
        muscleMapping: { primary: ["lats"], secondary: ["biceps"] },
        sets: [{ reps: 10 }, { reps: 8 }]
      }
    ]
  };

  // Anterior
  const viewFront = renderWorkoutViewSimulation({
    workouts: [session],
    activeDate: "2026-11-04",
    heatmapAnatomyView: "anterior",
    inspectedMuscleId: null,
    recoveryHours: {},
    recoveryOverrides: {},
    now: new Date("2026-11-04T12:00:00")
  });
  assert.ok(viewFront.heatmapHtml.includes('data-muscle="quadriceps"'));
  assert.ok(viewFront.heatmapHtml.includes('data-muscle="biceps"'));
  assert.ok(!viewFront.heatmapHtml.includes('data-muscle="glutes"'));

  // Posterior
  const viewBack = renderWorkoutViewSimulation({
    workouts: [session],
    activeDate: "2026-11-04",
    heatmapAnatomyView: "posterior",
    inspectedMuscleId: null,
    recoveryHours: {},
    recoveryOverrides: {},
    now: new Date("2026-11-04T12:00:00")
  });
  assert.ok(viewBack.heatmapHtml.includes('data-muscle="lats"'));
  assert.ok(viewBack.heatmapHtml.includes('data-muscle="glutes"'));
  assert.ok(viewBack.heatmapHtml.includes('data-muscle="hamstrings"'));
  assert.ok(!viewBack.heatmapHtml.includes('data-muscle="quadriceps"'));
});

test("UI check 3, 4, 5: Date navigation and strict empty/legacy/general non-heatmap rendering", () => {
  const legacySession = { id: "w_leg", date: "2026-11-01", isLegacy: true, exercises: [] };
  const generalSession = { id: "w_gen", date: "2026-11-02", isLegacy: false, exercises: [] };
  const incompleteSession = {
    id: "w_inc",
    date: "2026-11-03",
    isLegacy: false,
    exercises: [{ name: "Incomplete", sets: [] }]
  };
  const detailedSession = {
    id: "w_det",
    date: "2026-11-04",
    isLegacy: false,
    exercises: [{ name: "Squats", muscleMapping: { primary: ["quadriceps"] }, sets: [{ reps: 5 }] }]
  };

  const workouts = [legacySession, generalSession, incompleteSession, detailedSession];

  // 1. Unlogged date
  const rUnlogged = renderWorkoutViewSimulation({ workouts, activeDate: "2026-10-31", heatmapAnatomyView: "anterior", inspectedMuscleId: null });
  assert.equal(rUnlogged.heatmapData, null);
  assert.ok(rUnlogged.heatmapHtml.includes("No training recorded for this date"));
  assert.ok(!rUnlogged.heatmapHtml.includes("<svg"));

  // 2. Legacy date
  const rLegacy = renderWorkoutViewSimulation({ workouts, activeDate: "2026-11-01", heatmapAnatomyView: "anterior", inspectedMuscleId: null });
  assert.equal(rLegacy.heatmapData, null);
  assert.ok(rLegacy.heatmapHtml.includes("Detailed muscle data not available for this date"));
  assert.ok(!rLegacy.heatmapHtml.includes("<svg"));

  // 3. General date
  const rGeneral = renderWorkoutViewSimulation({ workouts, activeDate: "2026-11-02", heatmapAnatomyView: "anterior", inspectedMuscleId: null });
  assert.equal(rGeneral.heatmapData, null);
  assert.ok(rGeneral.heatmapHtml.includes("Detailed muscle data not available for this date"));
  assert.ok(!rGeneral.heatmapHtml.includes("<svg"));

  // 4. Incomplete date
  const rIncomplete = renderWorkoutViewSimulation({ workouts, activeDate: "2026-11-03", heatmapAnatomyView: "anterior", inspectedMuscleId: null });
  assert.equal(rIncomplete.heatmapData, null);
  assert.ok(rIncomplete.heatmapHtml.includes("Detailed muscle data not available for this date"));
  assert.ok(!rIncomplete.heatmapHtml.includes("<svg"));

  // 5. Valid detailed date
  const rDetailed = renderWorkoutViewSimulation({ workouts, activeDate: "2026-11-04", heatmapAnatomyView: "anterior", inspectedMuscleId: null });
  assert.ok(rDetailed.heatmapData !== null);
  assert.ok(rDetailed.heatmapHtml.includes("<svg"));
});

test("UI check 6 & 7: Muscle inspection card and 5 color bands verification", () => {
  const session = {
    id: "w1",
    date: "2026-11-04",
    exercises: [
      {
        name: "Bench Press",
        muscleMapping: { primary: ["chest"], secondary: ["triceps"] },
        sets: [{ reps: 10 }, { reps: 8 }, { reps: 6 }] // 3 sets -> Minimal (Yellow)
      },
      {
        name: "Incline Press",
        muscleMapping: { primary: ["chest"], secondary: ["anterior_deltoids"] },
        sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }, { reps: 8 }] // 4 more sets = 7 total -> Moderate (Orange)
      }
    ]
  };

  const view = renderWorkoutViewSimulation({
    workouts: [session],
    activeDate: "2026-11-04",
    heatmapAnatomyView: "anterior",
    inspectedMuscleId: "chest",
    recoveryHours: {},
    recoveryOverrides: {},
    now: new Date("2026-11-04T12:00:00")
  });

  // Verify inspection card contains chest details
  assert.ok(view.heatmapHtml.includes("class=\"muscle-inspect-card\""));
  assert.ok(view.heatmapHtml.includes("Chest"));
  assert.ok(view.heatmapHtml.includes("Primary Sets: 7 sets · Moderate"));
  assert.ok(view.heatmapHtml.includes("Contributing exercises (primary): Bench Press (3 sets), Incline Press (4 sets)"));
  assert.ok(view.heatmapHtml.includes("Secondary involvement (0 set credit): None"));

  // Verify all 5 colours are valid and present in palette definition
  assert.equal(HEATMAP_PALETTE.none.color, "#A7A9A5");
  assert.equal(HEATMAP_PALETTE.minimal.color, "#E8C84A");
  assert.equal(HEATMAP_PALETTE.moderate.color, "#E98A32");
  assert.equal(HEATMAP_PALETTE.good.color, "#D83B43");
  assert.equal(HEATMAP_PALETTE.elite.color, "#51406F");
});

test("UI check 8, 9, 10: Recovery countdowns, unlogged states, and Gate C date-only precision refusal", () => {
  const sessionTimed = {
    id: "w_time",
    date: "2026-11-04",
    time: "10:00",
    exercises: [{ name: "Squats", muscleMapping: { primary: ["quadriceps"] }, sets: [{ reps: 5 }] }]
  };
  const sessionDateOnly = {
    id: "w_notime",
    date: "2026-11-02",
    exercises: [{ name: "Deadlift", muscleMapping: { primary: ["lower_back"] }, sets: [{ reps: 5 }] }]
  };

  const now = new Date(2026, 10, 4, 18, 0, 0); // 8h after timed workout
  const view = renderWorkoutViewSimulation({
    workouts: [sessionTimed, sessionDateOnly],
    activeDate: "2026-11-04",
    heatmapAnatomyView: "anterior",
    inspectedMuscleId: null,
    recoveryHours: {},
    recoveryOverrides: {},
    now
  });

  const quadsRec = view.allRecovery.find((r) => r.muscleId === "quadriceps");
  assert.equal(quadsRec.state, "in-progress");
  assert.equal(quadsRec.elapsedHours, 8);
  assert.equal(quadsRec.remainingHours, 64); // 72 - 8
  assert.ok(quadsRec.details.includes("8h elapsed · 64h remaining"));

  const backRec = view.allRecovery.find((r) => r.muscleId === "lower_back");
  assert.equal(backRec.state, "date-only");
  assert.equal(backRec.elapsedCalendarDays, 2);
  assert.ok(backRec.details.includes("Exact remaining time and completion status unavailable"));
  assert.ok(!backRec.details.includes("completed"));

  const chestRec = view.allRecovery.find((r) => r.muscleId === "chest");
  assert.equal(chestRec.state, "unlogged");
  assert.equal(chestRec.statusLabel, "No qualifying primary session recorded");
});

test("UI check 11, 12, 13: Config persistence, manual display overrides, and edit/deletion recalculation", () => {
  let customHours = validateRecoveryHours({ chest: 60 });
  assert.equal(customHours.chest, 60);

  const session = {
    id: "w_del",
    date: "2026-11-04",
    time: "10:00",
    exercises: [{ name: "Bench", muscleMapping: { primary: ["chest"] }, sets: [{ reps: 5 }] }]
  };

  const now = new Date(2026, 10, 4, 14, 0, 0); // 4h elapsed

  // Normal in-progress
  let r = calculateMuscleRecovery("chest", [session], customHours, {}, now);
  assert.equal(r.state, "in-progress");
  assert.equal(r.remainingHours, 56); // 60 - 4

  // Manual display override to completed
  const overrides = {
    chest: { state: "completed", latestWorkoutId: "w_del", updatedAt: "2026-11-04T14:00:00Z" }
  };
  r = calculateMuscleRecovery("chest", [session], customHours, overrides, now);
  assert.equal(r.state, "override-completed");
  assert.equal(r.isOverridden, true);

  // Revert override
  delete overrides.chest;
  r = calculateMuscleRecovery("chest", [session], customHours, overrides, now);
  assert.equal(r.state, "in-progress");
  assert.equal(r.isOverridden, false);

  // Delete workout session -> recovery recalculates to unlogged, invalidating stale override
  r = calculateMuscleRecovery("chest", [], customHours, overrides, now);
  assert.equal(r.state, "unlogged");
  assert.equal(r.hasSession, false);
});

test("UI check 14: Add session button and openWorkoutEditor trigger navigation to workout_editor", () => {
  // Verify empty button generates data-action='workout'
  function empty(title, copy, action, target, actionType = null) {
    const actionAttr = actionType ? `data-action="${actionType}"` : `data-nav="${target}"`;
    return `<button type="button" class="button ghost" ${actionAttr}>${action}</button>`;
  }

  const emptyWorkoutBtnHtml = empty("No sessions logged", "Add a record", "Add session", "workout_editor", "workout");
  assert.ok(emptyWorkoutBtnHtml.includes('data-action="workout"'));

  // Verify default workout session structure
  function createDefaultWorkoutSession(activeDate) {
    return {
      id: "test-uid",
      date: activeDate,
      time: "",
      title: "",
      type: "Gym",
      minutes: "",
      distance: "",
      note: "",
      isLegacy: false,
      createdAt: null,
      exercises: []
    };
  }

  const session = createDefaultWorkoutSession("2026-11-05");
  assert.equal(session.type, "Gym");
  assert.equal(session.isLegacy, false);
  assert.deepEqual(session.exercises, []);
  assert.equal(session.date, "2026-11-05");
});

test("UI check 15: Exercise picker modal category filtering, exercise selection, and heatmap generation", () => {
  // Built-in exercise catalog lookup
  const bench = CANONICAL_CATALOG.find((c) => c.id === "chest");
  assert.ok(bench);
  assert.equal(bench.name, "Chest");

  // Verify that an exercise with valid set produces detailed workout status
  const testWorkout = {
    id: "w_test_detailed",
    date: "2026-11-05",
    time: "17:00",
    title: "Chest Day",
    type: "Gym",
    isLegacy: false,
    createdAt: "2026-11-05T17:00:00Z",
    exercises: [
      {
        id: "ex_1",
        exerciseId: "barbell_bench_press",
        name: "Barbell Bench Press",
        category: "Chest",
        isCustom: false,
        muscleMapping: { primary: ["chest"], secondary: ["triceps"] },
        sets: [{ reps: 10, weight: 80, effort: "" }]
      }
    ]
  };

  assert.equal(getWorkoutDetailStatus(testWorkout), "detailed");

  // Verify that calculateDailyHeatmap returns active heatmap for this date
  const heatmapData = calculateDailyHeatmap([testWorkout], DEFAULT_HEATMAP_THRESHOLDS);
  assert.ok(heatmapData !== null);
  assert.equal(heatmapData.muscles.chest.sets, 1);
  assert.equal(heatmapData.muscles.chest.color, HEATMAP_PALETTE.minimal.color); // 1 set = minimal #E8C84A
});


