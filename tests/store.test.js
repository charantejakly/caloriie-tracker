import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateBmr,
  calculateTdee,
  nutrition,
  streak,
  weeklySummary,
  calculateProgressAnalytics,
  validateBackup,
  migrateData,
  mergeData,
  DEFAULT_PROFILE
} from "../src/store.js";
import { estimateFood } from "../src/food-estimator.js";

test("calculates Mifflin-St Jeor BMR and TDEE correctly", () => {
  // Male: 10*80 + 6.25*178 - 5*20 + 5 = 800 + 1112.5 - 100 + 5 = 1817.5 => 1818
  const profileMale = { sex: "male", age: 20, height: 178, weight: 80, activity: "1.2" };
  assert.equal(calculateBmr(profileMale), 1818);
  assert.equal(calculateTdee(profileMale), 2182);

  // Female: 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25 => 1345
  const profileFemale = { sex: "female", age: 25, height: 165, weight: 60, activity: "1.55" };
  assert.equal(calculateBmr(profileFemale), 1345);
  assert.equal(calculateTdee(profileFemale), 2085);

  // Missing values return null
  assert.equal(calculateBmr({ sex: "male" }), null);
});

test("adds nutritional records without implicit data", () => {
  assert.deepEqual(
    nutrition([
      { calories: 100, protein: 10 },
      { calories: 200, carbs: 20, fibre: 4 }
    ]),
    { calories: 300, protein: 10, carbs: 20, fat: 0, fibre: 4 }
  );
});

test("counts consecutive logged days from today and completed days", () => {
  assert.equal(streak([{ date: "2026-11-02" }, { date: "2026-11-01" }], "2026-11-02"), 2);
  assert.equal(streak([{ date: "2026-11-01" }], "2026-11-02"), 0);
  // With completedDays
  assert.equal(streak([], "2026-11-02", ["2026-11-02", "2026-11-01"]), 2);
});

test("estimates quantities and combined Indian-food entries", () => {
  const rotisAndDal = estimateFood("2 rotis with dal");
  assert.equal(rotisAndDal.calories, 400);
  assert.equal(rotisAndDal.protein, 17);
  assert.equal(rotisAndDal.carbs, 71);
  assert.equal(rotisAndDal.fat, 7);
  assert.equal(rotisAndDal.fibre, 13);
  assert.deepEqual(rotisAndDal.matched, ["2 × roti", "dal"]);

  assert.equal(estimateFood("mystery food"), null);
  assert.equal(estimateFood("2 dosa").calories, 540);
});

test("estimates milk with quantity unit scaling", () => {
  const milk = estimateFood("milk");
  assert.equal(milk.quantityUnit, "ml");
  assert.equal(milk.baseAmount, 250);
  assert.equal(milk.calories, 150);

  // Custom food integration
  const customFoods = [
    { name: "Whey Protein Bar", calories: 200, protein: 20, carbs: 15, fat: 5, fibre: 3 }
  ];
  const customMatch = estimateFood("2 whey protein bar", customFoods);
  assert.equal(customMatch.calories, 400);
  assert.equal(customMatch.protein, 40);
});

test("calculates weeklySummary without assuming unlogged days are zero", () => {
  const entries = [
    { date: "2026-11-01", calories: 2000, protein: 100 },
    { date: "2026-11-02", calories: 2200, protein: 120 }
  ];
  const summary = weeklySummary(entries, "2026-11-02");
  assert.equal(summary.loggedDaysCount, 2);
  assert.equal(summary.avgCalories, 2100);
  assert.equal(summary.avgProtein, 110);
});

test("calculates comprehensive multi-domain progress analytics across food, workouts, and measurements", () => {
  const appData = {
    entries: [
      { date: "2026-11-05", calories: 2100, protein: 150, carbs: 200, fat: 60, fibre: 25 },
      { date: "2026-11-06", calories: 1900, protein: 130, carbs: 180, fat: 50, fibre: 20 }
    ],
    workouts: [
      {
        id: "w1",
        date: "2026-11-05",
        title: "Chest Day",
        type: "Gym",
        minutes: 45,
        exercises: [
          {
            name: "Bench Press",
            muscleMapping: { primary: ["chest", "anterior_deltoids"] },
            sets: [{ reps: 10, weight: 80 }, { reps: 8, weight: 85 }]
          }
        ]
      },
      {
        id: "w2",
        date: "2026-11-06",
        title: "Cardio Run",
        type: "Cardio",
        minutes: 30,
        distance: 5
      }
    ],
    measurements: [
      { date: "2026-11-05", weight: "75.5", waist: "82" }
    ],
    completedDays: ["2026-11-05"]
  };

  const analytics = calculateProgressAnalytics(appData, "2026-11-06", 7);
  assert.equal(analytics.days.length, 7);
  assert.equal(analytics.foodLoggedDays, 2);
  assert.equal(analytics.avgCalories, 2000);
  assert.equal(analytics.avgProtein, 140);
  assert.equal(analytics.workoutLoggedDays, 2);
  assert.equal(analytics.totalWorkouts, 2);
  assert.equal(analytics.totalSets, 2);
  assert.equal(analytics.totalMinutes, 75);
  assert.equal(analytics.bothLoggedDays, 2);
  assert.equal(analytics.completedDaysCount, 1);

  // Top muscles trained
  assert.equal(analytics.topMuscles.length, 2);
  assert.deepEqual(analytics.topMuscles.find((m) => m.id === "chest"), { id: "chest", sets: 2 });
  assert.deepEqual(analytics.topMuscles.find((m) => m.id === "anterior_deltoids"), { id: "anterior_deltoids", sets: 2 });

  // Day breakdown
  const day5 = analytics.days.find((d) => d.date === "2026-11-05");
  assert.equal(day5.hasFood, true);
  assert.equal(day5.hasWorkout, true);
  assert.equal(day5.hasBoth, true);
  assert.equal(day5.isCompleted, true);
  assert.equal(day5.sets, 2);
  assert.equal(day5.minutes, 45);
  assert.equal(day5.weight, "75.5");
  assert.equal(day5.waist, "82");

  const day6 = analytics.days.find((d) => d.date === "2026-11-06");
  assert.equal(day6.hasFood, true);
  assert.equal(day6.hasWorkout, true);
  assert.equal(day6.distance, 5);
  assert.equal(day6.minutes, 30);
});

test("migrates schema v1 to schema v3 preserving existing records", () => {
  const v1Data = {
    version: 1,
    profile: { name: "Tester", weight: "75" },
    entries: [{ id: "e1", name: "Dosa", calories: 270 }],
    measurements: [{ id: "m1", date: "2026-11-01", weight: "75" }],
    workouts: [{ id: "w1", title: "Walk", minutes: 30 }]
  };
  const migrated = migrateData(v1Data);
  assert.equal(migrated.version, 3);
  assert.equal(migrated.profile.name, "Tester");
  assert.equal(migrated.profile.weight, "75");
  assert.equal(migrated.entries.length, 1);
  assert.equal(migrated.customFoods.length, 0);
  assert.equal(migrated.customExercises.length, 0);
  assert.equal(migrated.completedDays.length, 0);
  assert.equal(migrated.workouts[0].isLegacy, true);
  assert.equal(migrated.workouts[0].detailStatus, "legacy");
});

test("merges data cleanly without duplicating existing IDs", () => {
  const existing = {
    version: 2,
    profile: { ...DEFAULT_PROFILE, name: "Original" },
    entries: [{ id: "e1", name: "Roti", calories: 110 }],
    measurements: [{ id: "m1", weight: "80" }],
    workouts: [],
    customFoods: [],
    completedDays: ["2026-11-01"]
  };
  const incoming = {
    version: 2,
    entries: [
      { id: "e1", name: "Roti duplicate", calories: 110 },
      { id: "e2", name: "Egg", calories: 78 }
    ],
    measurements: [{ id: "m2", weight: "79.5" }],
    workouts: [{ id: "w1", title: "Gym" }],
    customFoods: [{ name: "Protein Cookie", calories: 150 }],
    completedDays: ["2026-11-02"]
  };
  const merged = mergeData(existing, incoming);
  assert.equal(merged.entries.length, 2); // e1 kept, e2 added
  assert.equal(merged.measurements.length, 2);
  assert.equal(merged.workouts.length, 1);
  assert.equal(merged.customFoods.length, 1);
  assert.equal(merged.completedDays.length, 2);
});

test("validates backup schema strictly before restoring", () => {
  assert.deepEqual(validateBackup(null), { valid: false, error: "Backup must be a valid JSON object." });
  assert.deepEqual(validateBackup("not an object"), { valid: false, error: "Backup must be a valid JSON object." });
  assert.deepEqual(validateBackup({ entries: "not an array" }), { valid: false, error: "Invalid backup: 'entries' must be an array." });
  assert.deepEqual(validateBackup({ entries: [], measurements: "not an array" }), { valid: false, error: "Invalid backup: 'measurements' must be an array." });
  assert.deepEqual(validateBackup({ entries: [], measurements: [], workouts: [] }), { valid: true });
});

test("streak counts days regardless of exceeding calorie targets", () => {
  // 3 consecutive days logged, even with high calories (e.g. 3500 kcal when target is 2000)
  const entries = [
    { date: "2026-11-03", calories: 3500 },
    { date: "2026-11-02", calories: 2800 },
    { date: "2026-11-01", calories: 3200 }
  ];
  // Streak is 3 days
  assert.equal(streak(entries, "2026-11-03"), 3);
});

test("parses decimal portions and prevents NaN pollution in nutrition aggregation", () => {
  const decimalEstimate = estimateFood("1.5 rotis with 0.5 apple");
  assert.equal(decimalEstimate.calories, 212.5);
  assert.equal(decimalEstimate.protein, 5.6);
  assert.equal(decimalEstimate.carbs, 45.5);

  const dirtyInput = [
    { calories: "corrupted_text", protein: null, carbs: undefined, fat: NaN, fibre: -10 },
    { calories: 450, protein: 25 }
  ];
  const safeTotals = nutrition(dirtyInput);
  assert.equal(safeTotals.calories, 450);
  assert.equal(safeTotals.protein, 25);
  assert.equal(safeTotals.fat, 0);
  assert.equal(safeTotals.fibre, 0);
});
