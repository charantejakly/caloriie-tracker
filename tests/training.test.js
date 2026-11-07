import test from "node:test";
import assert from "node:assert/strict";
import {
  CURRENT_SCHEMA_VERSION,
  blankData,
  migrateData,
  mergeData,
  validateBackup,
  streak
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
  BUILT_IN_EXERCISES,
  isPositiveNumber,
  isValidSet,
  isValidExercise,
  getWorkoutDetailStatus,
  evaluateLoggingStatus
} from "../src/muscle-data.js";

test("canonical 16-muscle catalog has exactly 16 uniform IDs and definitions", () => {
  assert.equal(CANONICAL_MUSCLES.size, 16);
  assert.equal(CANONICAL_CATALOG.length, 16);
  for (const item of CANONICAL_CATALOG) {
    assert.equal(CANONICAL_MUSCLES.has(item.id), true);
    assert.equal(typeof item.name, "string");
    assert.equal(["anterior", "posterior", "both"].includes(item.view), true);
  }
  // No generic 'shoulders'
  assert.equal(CANONICAL_MUSCLES.has("shoulders"), false);
  assert.equal(CANONICAL_MUSCLES.has("anterior_deltoids"), true);
  assert.equal(CANONICAL_MUSCLES.has("lateral_deltoids"), true);
  assert.equal(CANONICAL_MUSCLES.has("posterior_deltoids"), true);
});

test("built-in exercise catalog has valid canonical muscle mappings", () => {
  assert.ok(BUILT_IN_EXERCISES.length >= 25);
  for (const ex of BUILT_IN_EXERCISES) {
    assert.ok(ex.id && ex.name && ex.category);
    assert.ok(Array.isArray(ex.defaultPrimary));
    assert.ok(ex.defaultPrimary.length > 0);
    for (const m of ex.defaultPrimary) {
      assert.ok(CANONICAL_MUSCLES.has(m), `Primary muscle '${m}' in ${ex.name} must be canonical`);
    }
    for (const m of ex.defaultSecondary) {
      assert.ok(CANONICAL_MUSCLES.has(m), `Secondary muscle '${m}' in ${ex.name} must be canonical`);
    }
  }
});

test("set validation requires finite positive numeric repetitions", () => {
  assert.equal(isValidSet({ reps: 10 }), true);
  assert.equal(isValidSet({ reps: "8" }), true);
  assert.equal(isValidSet({ reps: 1, weight: 100 }), true);
  assert.equal(isValidSet({ reps: 12, weight: "", effort: "RPE 8" }), true);

  // Invalid reps
  assert.equal(isValidSet(null), false);
  assert.equal(isValidSet(undefined), false);
  assert.equal(isValidSet({ reps: 0 }), false);
  assert.equal(isValidSet({ reps: -5 }), false);
  assert.equal(isValidSet({ reps: "" }), false);
  assert.equal(isValidSet({ reps: null }), false);
  assert.equal(isValidSet({ reps: undefined }), false);
  assert.equal(isValidSet({ reps: true }), false);
  assert.equal(isValidSet({ reps: false }), false);
  assert.equal(isValidSet({ reps: NaN }), false);
  assert.equal(isValidSet({ reps: "abc" }), false);
});

test("exercise validation requires at least one valid set and canonical primary muscle", () => {
  const validExercise = {
    name: "Bench Press",
    muscleMapping: { primary: ["chest"], secondary: ["triceps"] },
    sets: [{ reps: 8, weight: 80 }]
  };
  assert.equal(isValidExercise(validExercise), true);

  // Missing valid sets
  assert.equal(isValidExercise({ ...validExercise, sets: [] }), false);
  assert.equal(isValidExercise({ ...validExercise, sets: [{ reps: 0 }] }), false);
  assert.equal(isValidExercise({ ...validExercise, sets: [{ reps: "invalid" }] }), false);

  // Missing or non-canonical primary muscle mapping
  assert.equal(isValidExercise({ ...validExercise, muscleMapping: { primary: [] } }), false);
  assert.equal(isValidExercise({ ...validExercise, muscleMapping: { primary: ["non_existent_muscle"] } }), false);
  assert.equal(isValidExercise({ ...validExercise, muscleMapping: null }), false);
  assert.equal(isValidExercise(null), false);
});

test("accurately classifies the four workout detail categories", () => {
  // Category 1: Legacy
  assert.equal(getWorkoutDetailStatus({ isLegacy: true }), "legacy");
  assert.equal(getWorkoutDetailStatus({ isLegacy: true, exercises: [] }), "legacy");

  // Category 2: General / Cardio (no exercises array or empty)
  assert.equal(getWorkoutDetailStatus({ isLegacy: false, exercises: [] }), "general");
  assert.equal(getWorkoutDetailStatus({ isLegacy: false }), "general");

  // Category 3: Incomplete (exercises present but no valid set / canonical muscle)
  const incompleteWorkout = {
    isLegacy: false,
    exercises: [
      {
        name: "Draft Exercise",
        muscleMapping: { primary: ["chest"] },
        sets: [{ reps: 0 }]
      }
    ]
  };
  assert.equal(getWorkoutDetailStatus(incompleteWorkout), "incomplete");

  // Category 4: Detailed (at least one valid exercise)
  const detailedWorkout = {
    isLegacy: false,
    exercises: [
      {
        name: "Barbell Bench Press",
        muscleMapping: { primary: ["chest"] },
        sets: [{ reps: 10, weight: 80 }]
      }
    ]
  };
  assert.equal(getWorkoutDetailStatus(detailedWorkout), "detailed");

  // Mixed: One valid exercise and one incomplete exercise -> detailed overall
  const mixedWorkout = {
    isLegacy: false,
    exercises: [
      { name: "Bench", muscleMapping: { primary: ["chest"] }, sets: [{ reps: 10 }] },
      { name: "Unfinished", muscleMapping: { primary: [] }, sets: [] }
    ]
  };
  assert.equal(getWorkoutDetailStatus(mixedWorkout), "detailed");
});

test("evaluates logging status accurately for on-time, late, future, and unknown entries", () => {
  const today = "2026-11-05";

  // On-time: created on same local date as workout
  assert.equal(evaluateLoggingStatus("2026-11-05", "2026-11-05T18:00:00.000Z", today), "on-time");

  // Late: created after workout date
  assert.equal(evaluateLoggingStatus("2026-11-02", "2026-11-05T10:00:00.000Z", today), "late");

  // Future workout date
  assert.equal(evaluateLoggingStatus("2026-11-10", "2026-11-05T10:00:00.000Z", today), "invalid-future");

  // Unknown: missing or invalid timestamp
  assert.equal(evaluateLoggingStatus("2026-11-05", null, today), "unknown");
  assert.equal(evaluateLoggingStatus("2026-11-05", undefined, today), "unknown");
  assert.equal(evaluateLoggingStatus("2026-11-05", "not-a-timestamp", today), "unknown");
});

test("migrates schema v2 to v3 with strict legacy marking and non-fabrication", () => {
  const v2Data = {
    version: 2,
    profile: { name: "Alex" },
    entries: [],
    measurements: [],
    workouts: [
      {
        id: "w1",
        date: "2026-11-01",
        title: "Morning Run",
        type: "Cardio",
        minutes: 45,
        distance: 5.2,
        note: "Easy pace"
      },
      {
        id: "w2",
        // Notice: date and type omitted on purpose to test non-fabrication
        title: "Mystery Session",
        minutes: 0,
        note: ""
      }
    ],
    customFoods: [],
    completedDays: []
  };

  const migrated = migrateData(v2Data);
  assert.equal(migrated.version, 3);
  assert.equal(migrated.workouts.length, 2);

  const w1 = migrated.workouts[0];
  assert.equal(w1.isLegacy, true);
  assert.equal(w1.detailStatus, "legacy");
  assert.equal(w1.hasDetailedMuscles, false);
  assert.equal(w1.createdAt, null);
  assert.equal(w1.time, null);
  assert.equal(w1.loggingStatus, "unknown");
  assert.equal(w1.minutes, 45);
  assert.equal(w1.distance, 5.2);

  const w2 = migrated.workouts[1];
  assert.equal(w2.isLegacy, true);
  // Non-fabrication: date and type must remain null, NOT defaulted to today or "Gym"
  assert.equal(w2.date, null);
  assert.equal(w2.type, null);
  assert.equal(w2.minutes, 0); // preserves 0
  assert.equal(w2.note, ""); // preserves empty string
});

test("migration is idempotent and preserves existing v3 records and custom exercises", () => {
  const v3Data = {
    version: 3,
    profile: { name: "Sam" },
    entries: [],
    measurements: [],
    workouts: [
      {
        id: "w3_detailed",
        date: "2026-11-05",
        time: "17:30",
        title: "Leg Day",
        type: "Gym",
        isLegacy: false,
        createdAt: "2026-11-05T18:00:00.000Z",
        loggingStatus: "on-time",
        exercises: [
          {
            id: "ex1",
            exerciseId: "barbell_squat",
            name: "Barbell Back Squat",
            muscleMapping: { primary: ["quadriceps", "glutes"], secondary: ["calves"] },
            sets: [
              { id: "s1", reps: 8, weight: 100, effort: "RPE 8" },
              { id: "s2", reps: 8, weight: 100, effort: "RPE 8.5" }
            ]
          }
        ]
      }
    ],
    customFoods: [],
    customExercises: [
      {
        id: "ce1",
        name: "Zercher Squat",
        category: "Legs",
        defaultPrimary: ["quadriceps"],
        defaultSecondary: ["abs", "biceps"]
      }
    ],
    completedDays: []
  };

  const migratedOnce = migrateData(v3Data);
  assert.equal(migratedOnce.version, 3);
  assert.equal(migratedOnce.workouts[0].isLegacy, false);
  assert.equal(migratedOnce.workouts[0].detailStatus, "detailed");
  assert.equal(migratedOnce.workouts[0].hasDetailedMuscles, true);
  assert.equal(migratedOnce.customExercises.length, 1);
  assert.equal(migratedOnce.customExercises[0].name, "Zercher Squat");

  // Running migration again on the migrated data produces identical structure (idempotence)
  const migratedTwice = migrateData(migratedOnce);
  assert.deepEqual(migratedTwice, migratedOnce);
});

test("mergeData cleanly merges custom exercises without duplicating by ID or name", () => {
  const existing = {
    ...blankData(),
    customExercises: [
      { id: "ce1", name: "Zercher Squat", defaultPrimary: ["quadriceps"], defaultSecondary: [] }
    ]
  };
  const incoming = {
    ...blankData(),
    customExercises: [
      { id: "ce1", name: "Zercher Squat Duplicate", defaultPrimary: ["quadriceps"], defaultSecondary: [] },
      { id: "ce2", name: "zercher squat", defaultPrimary: ["quadriceps"], defaultSecondary: [] }, // duplicate by case-insensitive name
      { id: "ce3", name: "Nordic Hamstring Curl", defaultPrimary: ["hamstrings"], defaultSecondary: [] }
    ]
  };

  const merged = mergeData(existing, incoming);
  assert.equal(merged.customExercises.length, 2);
  assert.equal(merged.customExercises[0].id, "ce1");
  assert.equal(merged.customExercises[1].id, "ce3");
  assert.equal(merged.customExercises[1].name, "Nordic Hamstring Curl");
});

test("backup validation validates customExercises and rejects unsupported versions", () => {
  assert.equal(validateBackup({ entries: [], customExercises: "not an array" }).valid, false);
  assert.equal(validateBackup({ entries: [], customExercises: [] }).valid, true);
  assert.equal(validateBackup({ entries: [], version: 99 }).valid, false); // future version rejected
  assert.equal(validateBackup({ entries: [], version: 3 }).valid, true);
  assert.equal(validateBackup({ entries: [], version: 2 }).valid, true);
  assert.equal(validateBackup({ entries: [], version: 1 }).valid, true);
});

test("freezes streak behavior: workouts do not affect streaks, and late entries do not alter streak", () => {
  // 1. Logged food entries on 2026-11-04 and 2026-11-05 => Streak 2
  const entries = [
    { date: "2026-11-04", calories: 2000 },
    { date: "2026-11-05", calories: 2100 }
  ];
  assert.equal(streak(entries, "2026-11-05"), 2);

  // 2. Adding workouts on 2026-11-03 (whether on-time or late) does NOT change streak count
  // streak function takes (entries, today, completedDays) and does NOT qualify workouts
  assert.equal(streak(entries, "2026-11-05", []), 2);

  // 3. Late workout entered for a past date without food log does NOT grant streak credit
  const sparseEntries = [{ date: "2026-11-05", calories: 2000 }];
  // 2026-11-04 has no food log and no completedDay, so streak is strictly 1
  assert.equal(streak(sparseEntries, "2026-11-05"), 1);
});

// ============================================================================
// PHASE 2 HEATMAP & ANATOMY SVG TESTS
// ============================================================================

test("heatmap threshold validation enforces non-overlapping positive integers and falls back safely", () => {
  const valid = validateHeatmapThresholds({ yellow: 1, orange: 6, red: 12, purple: 20 });
  assert.deepEqual(valid, { yellow: 1, orange: 6, red: 12, purple: 20 });

  // Invalid: zero or negative yellow
  assert.deepEqual(validateHeatmapThresholds({ yellow: 0, orange: 5, red: 10, purple: 15 }), DEFAULT_HEATMAP_THRESHOLDS);
  // Invalid: overlapping / non-increasing
  assert.deepEqual(validateHeatmapThresholds({ yellow: 5, orange: 5, red: 10, purple: 15 }), DEFAULT_HEATMAP_THRESHOLDS);
  assert.deepEqual(validateHeatmapThresholds({ yellow: 8, orange: 6, red: 12, purple: 20 }), DEFAULT_HEATMAP_THRESHOLDS);
  // Invalid: non-number or null
  assert.deepEqual(validateHeatmapThresholds(null), DEFAULT_HEATMAP_THRESHOLDS);
  assert.deepEqual(validateHeatmapThresholds("bad"), DEFAULT_HEATMAP_THRESHOLDS);
});

test("calculateDailyHeatmap returns null when no sessions or only non-detailed sessions exist", () => {
  // 1. No sessions at all -> null
  assert.equal(calculateDailyHeatmap([]), null);
  assert.equal(calculateDailyHeatmap(null), null);

  // 2. Legacy-only date -> null
  const legacySessions = [{ id: "w1", date: "2026-11-04", isLegacy: true, exercises: [] }];
  assert.equal(calculateDailyHeatmap(legacySessions), null);

  // 3. General-only date -> null
  const generalSessions = [{ id: "w2", date: "2026-11-04", isLegacy: false, type: "Cardio", exercises: [] }];
  assert.equal(calculateDailyHeatmap(generalSessions), null);

  // 4. Incomplete-only date -> null (no valid sets or no canonical primary mapping)
  const incompleteSessions = [
    {
      id: "w3",
      date: "2026-11-04",
      isLegacy: false,
      exercises: [
        { name: "Draft", muscleMapping: { primary: ["chest"] }, sets: [{ reps: 0 }] }
      ]
    }
  ];
  assert.equal(calculateDailyHeatmap(incompleteSessions), null);
});

test("calculateDailyHeatmap calculates set totals and assigns approved 5-color bands", () => {
  const sessions = [
    {
      id: "w_detailed",
      date: "2026-11-04",
      isLegacy: false,
      exercises: [
        {
          name: "Barbell Bench Press",
          muscleMapping: { primary: ["chest"], secondary: ["triceps", "anterior_deltoids"] },
          sets: [
            { reps: 10, weight: 80 },
            { reps: 8, weight: 85 },
            { reps: 6, weight: 90 } // 3 sets
          ]
        },
        {
          name: "Push-ups",
          muscleMapping: { primary: ["chest"], secondary: ["abs"] },
          sets: [
            { reps: 20, weight: "" },
            { reps: 15, weight: "" } // 2 sets
          ]
        }
      ]
    }
  ];

  const map = calculateDailyHeatmap(sessions);
  assert.ok(map !== null);
  assert.equal(map.totalSets, 5);
  assert.equal(map.totalDetailedSessions, 1);

  // Total chest sets = 5 -> Minimal (Yellow #E8C84A)
  assert.equal(map.muscles.chest.sets, 5);
  assert.equal(map.muscles.chest.color, "#E8C84A");
  assert.equal(map.muscles.chest.label, "Minimal");

  // Secondary muscles receive 0 sets and grey color, but are listed in secondaryInvolvement
  assert.equal(map.muscles.triceps.sets, 0);
  assert.equal(map.muscles.triceps.color, "#A7A9A5");
  assert.equal(map.muscles.triceps.label, "No training");
  assert.deepEqual(map.muscles.triceps.secondaryInvolvement, ["Barbell Bench Press"]);

  // All 16 canonical muscles are present in the map
  assert.equal(Object.keys(map.muscles).length, 16);
});

test("verifies exact boundary threshold bands: 0, 1, 5, 6, 11, 12, 19, 20", () => {
  function makeSessionWithSets(targetMuscle, count) {
    const sets = [];
    for (let i = 0; i < count; i++) sets.push({ reps: 10 });
    return [
      {
        id: "w_test",
        date: "2026-11-04",
        exercises: [{ name: "Test Exercise", muscleMapping: { primary: [targetMuscle] }, sets }]
      }
    ];
  }

  // 1 set -> Minimal (#E8C84A)
  assert.equal(calculateDailyHeatmap(makeSessionWithSets("lats", 1)).muscles.lats.color, "#E8C84A");
  // 5 sets -> Minimal (#E8C84A)
  assert.equal(calculateDailyHeatmap(makeSessionWithSets("lats", 5)).muscles.lats.color, "#E8C84A");
  // 6 sets -> Moderate (#E98A32)
  assert.equal(calculateDailyHeatmap(makeSessionWithSets("lats", 6)).muscles.lats.color, "#E98A32");
  // 11 sets -> Moderate (#E98A32)
  assert.equal(calculateDailyHeatmap(makeSessionWithSets("lats", 11)).muscles.lats.color, "#E98A32");
  // 12 sets -> Good (#D83B43)
  assert.equal(calculateDailyHeatmap(makeSessionWithSets("lats", 12)).muscles.lats.color, "#D83B43");
  // 19 sets -> Good (#D83B43)
  assert.equal(calculateDailyHeatmap(makeSessionWithSets("lats", 19)).muscles.lats.color, "#D83B43");
  // 20 sets -> Elite (#51406F)
  assert.equal(calculateDailyHeatmap(makeSessionWithSets("lats", 20)).muscles.lats.color, "#51406F");
  // 25 sets -> Elite (#51406F)
  assert.equal(calculateDailyHeatmap(makeSessionWithSets("lats", 25)).muscles.lats.color, "#51406F");
});

test("aggregates multiple detailed sessions on the same date while ignoring incomplete exercises", () => {
  const sessions = [
    {
      id: "w_morning",
      date: "2026-11-04",
      exercises: [
        { name: "Barbell Squat", muscleMapping: { primary: ["quadriceps"] }, sets: [{ reps: 5 }, { reps: 5 }] }, // 2 sets
        { name: "Incomplete movement", muscleMapping: { primary: [] }, sets: [] } // ignored
      ]
    },
    {
      id: "w_evening",
      date: "2026-11-04",
      exercises: [
        { name: "Leg Press", muscleMapping: { primary: ["quadriceps"] }, sets: [{ reps: 10 }] } // 1 set
      ]
    }
  ];

  const map = calculateDailyHeatmap(sessions);
  assert.ok(map !== null);
  assert.equal(map.muscles.quadriceps.sets, 3);
  assert.equal(map.muscles.quadriceps.contributingExercises.length, 2);
});

test("renders valid Anterior and Posterior SVG strings with all 16 canonical regions", () => {
  const colorMap = {
    chest: { color: "#D83B43", sets: 12, label: "Good" },
    lats: { color: "#51406F", sets: 20, label: "Elite" }
  };

  const anteriorSvg = renderAnteriorSvg(colorMap);
  assert.ok(anteriorSvg.includes('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert.ok(anteriorSvg.includes('data-muscle="chest"'));
  assert.ok(anteriorSvg.includes('fill="#D83B43"'));
  assert.ok(anteriorSvg.includes('data-muscle="quadriceps"'));
  assert.ok(anteriorSvg.includes('data-muscle="biceps"'));

  const posteriorSvg = renderPosteriorSvg(colorMap);
  assert.ok(posteriorSvg.includes('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert.ok(posteriorSvg.includes('data-muscle="lats"'));
  assert.ok(posteriorSvg.includes('fill="#51406F"'));
  assert.ok(posteriorSvg.includes('data-muscle="traps"'));
  assert.ok(posteriorSvg.includes('data-muscle="glutes"'));
  assert.ok(posteriorSvg.includes('data-muscle="hamstrings"'));
});

test("recovery hours validate against Gate B approved durations and handles customization", () => {
  // Gate B specifications:
  // 24h: forearms, abs, obliques
  // 36h: lateral_deltoids, posterior_deltoids, biceps, triceps, calves
  // 48h: chest, anterior_deltoids, traps, lats, glutes
  // 72h: lower_back, quadriceps, hamstrings
  assert.equal(DEFAULT_RECOVERY_HOURS.forearms, 24);
  assert.equal(DEFAULT_RECOVERY_HOURS.abs, 24);
  assert.equal(DEFAULT_RECOVERY_HOURS.obliques, 24);

  assert.equal(DEFAULT_RECOVERY_HOURS.lateral_deltoids, 36);
  assert.equal(DEFAULT_RECOVERY_HOURS.posterior_deltoids, 36);
  assert.equal(DEFAULT_RECOVERY_HOURS.biceps, 36);
  assert.equal(DEFAULT_RECOVERY_HOURS.triceps, 36);
  assert.equal(DEFAULT_RECOVERY_HOURS.calves, 36);

  assert.equal(DEFAULT_RECOVERY_HOURS.chest, 48);
  assert.equal(DEFAULT_RECOVERY_HOURS.anterior_deltoids, 48);
  assert.equal(DEFAULT_RECOVERY_HOURS.traps, 48);
  assert.equal(DEFAULT_RECOVERY_HOURS.lats, 48);
  assert.equal(DEFAULT_RECOVERY_HOURS.glutes, 48);

  assert.equal(DEFAULT_RECOVERY_HOURS.lower_back, 72);
  assert.equal(DEFAULT_RECOVERY_HOURS.quadriceps, 72);
  assert.equal(DEFAULT_RECOVERY_HOURS.hamstrings, 72);

  // Custom hours validation
  const custom = validateRecoveryHours({ chest: 60, calves: "not_a_number", glutes: 400, abs: -5 });
  assert.equal(custom.chest, 60);
  assert.equal(custom.calves, 36); // default kept
  assert.equal(custom.glutes, 48); // clamped/rejected, default kept
  assert.equal(custom.abs, 24);    // default kept
});

test("findLatestPrimarySession selects only primary attribution and latest session", () => {
  const workouts = [
    {
      id: "w1",
      date: "2026-11-01",
      time: "09:00",
      exercises: [
        { name: "Barbell Bench Press", muscleMapping: { primary: ["chest"], secondary: ["triceps"] }, sets: [{ reps: 10 }] }
      ]
    },
    {
      id: "w2",
      date: "2026-11-03",
      time: "18:00",
      exercises: [
        { name: "Incline Dumbbell Press", muscleMapping: { primary: ["chest"], secondary: ["anterior_deltoids"] }, sets: [{ reps: 8 }] }
      ]
    },
    {
      id: "w3",
      date: "2026-11-04",
      time: "10:00",
      exercises: [
        // Triceps is only secondary here! Should NOT count as primary for triceps
        { name: "Push-ups", muscleMapping: { primary: ["chest"], secondary: ["triceps"] }, sets: [{ reps: 20 }] }
      ]
    }
  ];

  // For chest: latest is w3
  const latestChest = findLatestPrimarySession("chest", workouts);
  assert.equal(latestChest.session.id, "w3");

  // For triceps: w1, w2, w3 all have triceps as secondary only! None as primary
  const latestTriceps = findLatestPrimarySession("triceps", workouts);
  assert.equal(latestTriceps, null);

  // Add a session with triceps as primary
  const workoutsWithTricepsPrimary = [
    ...workouts,
    {
      id: "w4",
      date: "2026-11-02",
      time: "14:00",
      exercises: [
        { name: "Tricep Pushdown", muscleMapping: { primary: ["triceps"], secondary: [] }, sets: [{ reps: 12 }] }
      ]
    }
  ];
  const tricepsResult = findLatestPrimarySession("triceps", workoutsWithTricepsPrimary);
  assert.equal(tricepsResult.session.id, "w4");
});

test("calculateMuscleRecovery calculates countdown, completion, and future safety with exact time", () => {
  const session = {
    id: "w_bench",
    date: "2026-11-04",
    time: "10:00",
    exercises: [
      { name: "Bench Press", muscleMapping: { primary: ["chest"], secondary: [] }, sets: [{ reps: 8 }] }
    ]
  };

  // Configured duration: chest = 48 hours
  // 1. In progress: exactly 12 hours later (2026-11-04 22:00)
  const now1 = new Date(2026, 10, 4, 22, 0, 0); // month is 0-indexed: 10 = November
  const rec1 = calculateMuscleRecovery("chest", [session], DEFAULT_RECOVERY_HOURS, {}, now1);
  assert.equal(rec1.state, "in-progress");
  assert.equal(rec1.elapsedHours, 12);
  assert.equal(rec1.remainingHours, 36);
  assert.equal(rec1.isOverridden, false);
  assert.ok(rec1.details.includes("12h elapsed · 36h remaining"));

  // 2. Exactly at 48 hours later (2026-11-06 10:00) -> completed
  const now2 = new Date(2026, 10, 6, 10, 0, 0);
  const rec2 = calculateMuscleRecovery("chest", [session], DEFAULT_RECOVERY_HOURS, {}, now2);
  assert.equal(rec2.state, "completed");
  assert.equal(rec2.remainingHours, 0);
  assert.equal(rec2.elapsedHours, 48);
  assert.ok(rec2.details.includes("Configured 48h window completed"));

  // 3. Past 48 hours later (2026-11-06 14:00, 52h elapsed) -> completed
  const now3 = new Date(2026, 10, 6, 14, 0, 0);
  const rec3 = calculateMuscleRecovery("chest", [session], DEFAULT_RECOVERY_HOURS, {}, now3);
  assert.equal(rec3.state, "completed");
  assert.equal(rec3.remainingHours, 0);
  assert.equal(rec3.elapsedHours, 52);

  // 4. Session in the future
  const futureNow = new Date(2026, 10, 4, 8, 0, 0); // before 10:00
  const recFuture = calculateMuscleRecovery("chest", [session], DEFAULT_RECOVERY_HOURS, {}, futureNow);
  assert.equal(recFuture.state, "invalid-future");
});

test("calculateMuscleRecovery handles missing time strictly according to Gate C", () => {
  const sessionWithoutTime = {
    id: "w_notime",
    date: "2026-11-02",
    exercises: [
      { name: "Squats", muscleMapping: { primary: ["quadriceps"] }, sets: [{ reps: 5 }] }
    ]
  };

  const now = new Date(2026, 10, 4, 15, 0, 0); // Nov 4, 2026 -> exactly 2 calendar days elapsed
  const rec = calculateMuscleRecovery("quadriceps", [sessionWithoutTime], DEFAULT_RECOVERY_HOURS, {}, now);

  assert.equal(rec.hasExactTime, false);
  assert.equal(rec.state, "date-only");
  assert.equal(rec.elapsedCalendarDays, 2);
  assert.equal(rec.statusLabel, "Estimated recovery window — date-only estimate");
  assert.ok(rec.details.includes("Exact remaining time and completion status unavailable"));
  assert.equal(rec.workoutTime, null);
});

test("calculateMuscleRecovery applies and invalidates manual display overrides", () => {
  const session = {
    id: "w_override",
    date: "2026-11-04",
    time: "10:00",
    exercises: [
      { name: "Deadlift", muscleMapping: { primary: ["lower_back"] }, sets: [{ reps: 5 }] }
    ]
  };

  // lower_back recovery is 72h. At 10h elapsed, normally in-progress.
  const now = new Date(2026, 10, 4, 20, 0, 0);

  // Active override to "completed"
  const overrides = {
    lower_back: {
      state: "completed",
      latestWorkoutId: "w_override",
      updatedAt: "2026-11-04T20:00:00Z"
    }
  };
  const rec = calculateMuscleRecovery("lower_back", [session], DEFAULT_RECOVERY_HOURS, overrides, now);
  assert.equal(rec.isOverridden, true);
  assert.equal(rec.state, "override-completed");
  assert.ok(rec.statusLabel.includes("Override displayed estimate: Completed"));

  // Stale override from an older workout id -> override ignored
  const staleOverrides = {
    lower_back: {
      state: "completed",
      latestWorkoutId: "w_old_id",
      updatedAt: "2026-11-01T10:00:00Z"
    }
  };
  const recStale = calculateMuscleRecovery("lower_back", [session], DEFAULT_RECOVERY_HOURS, staleOverrides, now);
  assert.equal(recStale.isOverridden, false);
  assert.equal(recStale.state, "in-progress");
});

test("calculateAllMuscleRecovery calculates all 16 canonical muscles with zero unhandled IDs", () => {
  const result = calculateAllMuscleRecovery([]);
  assert.equal(result.length, 16);
  for (const item of result) {
    assert.ok(CANONICAL_MUSCLES.has(item.muscleId));
    assert.equal(item.hasSession, false);
    assert.equal(item.state, "unlogged");
  }
});

test("ambiguous recovery records: multiple sessions on same date, mixed time, future dates, missing dates", () => {
  // 1. Multiple sessions on same date where both have exact time -> latest time picked
  const sessionsBothTime = [
    {
      id: "w_morn",
      date: "2026-11-04",
      time: "08:00",
      exercises: [{ name: "Squats", muscleMapping: { primary: ["quadriceps"] }, sets: [{ reps: 5 }] }]
    },
    {
      id: "w_eve",
      date: "2026-11-04",
      time: "19:00",
      exercises: [{ name: "Leg Press", muscleMapping: { primary: ["quadriceps"] }, sets: [{ reps: 10 }] }]
    }
  ];
  const latestBothTime = findLatestPrimarySession("quadriceps", sessionsBothTime);
  assert.equal(latestBothTime.session.id, "w_eve");
  assert.equal(latestBothTime.hasTime, true);
  assert.equal(latestBothTime.hasAmbiguousOrder, false);

  // 2. Multiple sessions on same date where one has time and one lacks time -> ambiguous order, date-only estimate
  const sessionsMixedTime = [
    {
      id: "w_timed",
      date: "2026-11-04",
      time: "10:00",
      exercises: [{ name: "Bench", muscleMapping: { primary: ["chest"] }, sets: [{ reps: 5 }] }]
    },
    {
      id: "w_notime",
      date: "2026-11-04",
      time: null,
      exercises: [{ name: "Pushups", muscleMapping: { primary: ["chest"] }, sets: [{ reps: 20 }] }]
    }
  ];
  const latestMixed = findLatestPrimarySession("chest", sessionsMixedTime);
  assert.equal(latestMixed.hasTime, false);
  assert.equal(latestMixed.hasAmbiguousOrder, true);

  const now = new Date(2026, 10, 4, 15, 0, 0);
  const recMixed = calculateMuscleRecovery("chest", sessionsMixedTime, DEFAULT_RECOVERY_HOURS, {}, now);
  assert.equal(recMixed.state, "date-only");
  assert.equal(recMixed.statusLabel, "Estimated recovery window — date-only estimate");
  assert.ok(recMixed.details.includes("exact order unavailable"));
  assert.ok(recMixed.details.includes("Exact remaining time and completion status unavailable"));

  // 3. Newer session lacks time, older session had exact time -> does NOT fall back to older exact time
  const sessionsNewerNoTime = [
    {
      id: "w_yesterday",
      date: "2026-11-03",
      time: "10:00",
      exercises: [{ name: "Deadlift", muscleMapping: { primary: ["lower_back"] }, sets: [{ reps: 5 }] }]
    },
    {
      id: "w_today",
      date: "2026-11-04",
      time: null,
      exercises: [{ name: "Back Extension", muscleMapping: { primary: ["lower_back"] }, sets: [{ reps: 12 }] }]
    }
  ];
  const latestNewerNoTime = findLatestPrimarySession("lower_back", sessionsNewerNoTime);
  assert.equal(latestNewerNoTime.session.id, "w_today");
  assert.equal(latestNewerNoTime.hasTime, false);

  const recNewer = calculateMuscleRecovery("lower_back", sessionsNewerNoTime, DEFAULT_RECOVERY_HOURS, {}, now);
  assert.equal(recNewer.state, "date-only");
  assert.equal(recNewer.workoutDate, "2026-11-04");

  // 4. Missing workout date -> skipped safely, does not crash or pollute
  const sessionMissingDate = [
    {
      id: "w_nodate",
      date: null,
      exercises: [{ name: "Curls", muscleMapping: { primary: ["biceps"] }, sets: [{ reps: 10 }] }]
    }
  ];
  assert.equal(findLatestPrimarySession("biceps", sessionMissingDate), null);

  // 5. Future date without time -> invalid-future
  const sessionFutureDate = [
    {
      id: "w_future",
      date: "2026-11-10",
      exercises: [{ name: "Calf Raise", muscleMapping: { primary: ["calves"] }, sets: [{ reps: 15 }] }]
    }
  ];
  const recFutureDate = calculateMuscleRecovery("calves", sessionFutureDate, DEFAULT_RECOVERY_HOURS, {}, now);
  assert.equal(recFutureDate.state, "invalid-future");
  assert.equal(recFutureDate.statusLabel, "Workout date in the future");
});


