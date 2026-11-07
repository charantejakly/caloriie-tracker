// Canonical 16-muscle definitions, built-in exercise catalog, and crash-proof validation helpers

export const CANONICAL_MUSCLES = new Set([
  "chest",
  "anterior_deltoids",
  "lateral_deltoids",
  "posterior_deltoids",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "obliques",
  "traps",
  "lats",
  "lower_back",
  "glutes",
  "quadriceps",
  "hamstrings",
  "calves"
]);

export const CANONICAL_CATALOG = [
  { id: "chest", name: "Chest", view: "anterior" },
  { id: "anterior_deltoids", name: "Front Shoulders", view: "anterior" },
  { id: "lateral_deltoids", name: "Side Shoulders", view: "both" },
  { id: "posterior_deltoids", name: "Rear Shoulders", view: "posterior" },
  { id: "biceps", name: "Biceps", view: "anterior" },
  { id: "triceps", name: "Triceps", view: "posterior" },
  { id: "forearms", name: "Forearms", view: "both" },
  { id: "abs", name: "Abdominals", view: "anterior" },
  { id: "obliques", name: "Obliques", view: "anterior" },
  { id: "traps", name: "Traps", view: "posterior" },
  { id: "lats", name: "Lats", view: "posterior" },
  { id: "lower_back", name: "Lower Back", view: "posterior" },
  { id: "glutes", name: "Glutes", view: "posterior" },
  { id: "quadriceps", name: "Quadriceps", view: "anterior" },
  { id: "hamstrings", name: "Hamstrings", view: "posterior" },
  { id: "calves", name: "Calves", view: "both" }
];

export const BUILT_IN_EXERCISES = [
  // Chest
  {
    id: "barbell_bench_press",
    name: "Barbell Bench Press",
    category: "Chest",
    defaultPrimary: ["chest"],
    defaultSecondary: ["triceps", "anterior_deltoids"]
  },
  {
    id: "incline_dumbbell_press",
    name: "Incline Dumbbell Press",
    category: "Chest",
    defaultPrimary: ["chest", "anterior_deltoids"],
    defaultSecondary: ["triceps"]
  },
  {
    id: "dumbbell_chest_fly",
    name: "Dumbbell Chest Fly",
    category: "Chest",
    defaultPrimary: ["chest"],
    defaultSecondary: ["anterior_deltoids"]
  },
  {
    id: "push_up",
    name: "Push-up",
    category: "Chest",
    defaultPrimary: ["chest"],
    defaultSecondary: ["triceps", "anterior_deltoids", "abs"]
  },
  {
    id: "chest_dips",
    name: "Chest Dips",
    category: "Chest",
    defaultPrimary: ["chest", "triceps"],
    defaultSecondary: ["anterior_deltoids"]
  },

  // Back
  {
    id: "barbell_deadlift",
    name: "Barbell Deadlift",
    category: "Back",
    defaultPrimary: ["lower_back", "hamstrings", "glutes"],
    defaultSecondary: ["traps", "lats", "forearms"]
  },
  {
    id: "pull_up",
    name: "Pull-up / Chin-up",
    category: "Back",
    defaultPrimary: ["lats"],
    defaultSecondary: ["biceps", "traps", "forearms"]
  },
  {
    id: "lat_pulldown",
    name: "Lat Pulldown",
    category: "Back",
    defaultPrimary: ["lats"],
    defaultSecondary: ["biceps", "traps"]
  },
  {
    id: "barbell_bent_over_row",
    name: "Barbell Bent-Over Row",
    category: "Back",
    defaultPrimary: ["lats", "traps"],
    defaultSecondary: ["biceps", "posterior_deltoids", "lower_back"]
  },
  {
    id: "seated_cable_row",
    name: "Seated Cable Row",
    category: "Back",
    defaultPrimary: ["lats", "traps"],
    defaultSecondary: ["biceps", "posterior_deltoids"]
  },

  // Shoulders
  {
    id: "overhead_barbell_press",
    name: "Overhead Barbell Press",
    category: "Shoulders",
    defaultPrimary: ["anterior_deltoids", "lateral_deltoids"],
    defaultSecondary: ["triceps", "traps"]
  },
  {
    id: "dumbbell_lateral_raise",
    name: "Dumbbell Lateral Raise",
    category: "Shoulders",
    defaultPrimary: ["lateral_deltoids"],
    defaultSecondary: ["traps"]
  },
  {
    id: "face_pull",
    name: "Cable Face Pull",
    category: "Shoulders",
    defaultPrimary: ["posterior_deltoids", "traps"],
    defaultSecondary: ["lateral_deltoids"]
  },
  {
    id: "dumbbell_rear_delt_fly",
    name: "Dumbbell Rear Delt Fly",
    category: "Shoulders",
    defaultPrimary: ["posterior_deltoids"],
    defaultSecondary: ["traps"]
  },
  {
    id: "dumbbell_shrug",
    name: "Dumbbell Shrug",
    category: "Shoulders",
    defaultPrimary: ["traps"],
    defaultSecondary: ["forearms"]
  },

  // Arms
  {
    id: "barbell_bicep_curl",
    name: "Barbell Bicep Curl",
    category: "Arms",
    defaultPrimary: ["biceps"],
    defaultSecondary: ["forearms"]
  },
  {
    id: "dumbbell_hammer_curl",
    name: "Dumbbell Hammer Curl",
    category: "Arms",
    defaultPrimary: ["biceps", "forearms"],
    defaultSecondary: []
  },
  {
    id: "tricep_rope_pushdown",
    name: "Cable Tricep Pushdown",
    category: "Arms",
    defaultPrimary: ["triceps"],
    defaultSecondary: []
  },
  {
    id: "skull_crusher",
    name: "Barbell Skull Crusher",
    category: "Arms",
    defaultPrimary: ["triceps"],
    defaultSecondary: ["forearms"]
  },
  {
    id: "wrist_curl",
    name: "Wrist Curl",
    category: "Arms",
    defaultPrimary: ["forearms"],
    defaultSecondary: []
  },

  // Legs
  {
    id: "barbell_squat",
    name: "Barbell Back Squat",
    category: "Legs",
    defaultPrimary: ["quadriceps", "glutes"],
    defaultSecondary: ["hamstrings", "calves", "lower_back"]
  },
  {
    id: "leg_press",
    name: "Leg Press",
    category: "Legs",
    defaultPrimary: ["quadriceps", "glutes"],
    defaultSecondary: ["hamstrings"]
  },
  {
    id: "romanian_deadlift",
    name: "Romanian Deadlift",
    category: "Legs",
    defaultPrimary: ["hamstrings", "glutes"],
    defaultSecondary: ["lower_back", "forearms"]
  },
  {
    id: "leg_extension",
    name: "Leg Extension Machine",
    category: "Legs",
    defaultPrimary: ["quadriceps"],
    defaultSecondary: []
  },
  {
    id: "seated_leg_curl",
    name: "Leg Curl Machine",
    category: "Legs",
    defaultPrimary: ["hamstrings"],
    defaultSecondary: ["calves"]
  },
  {
    id: "standing_calf_raise",
    name: "Standing Calf Raise",
    category: "Legs",
    defaultPrimary: ["calves"],
    defaultSecondary: []
  },

  // Core
  {
    id: "hanging_leg_raise",
    name: "Hanging Leg Raise",
    category: "Core",
    defaultPrimary: ["abs"],
    defaultSecondary: ["obliques", "forearms"]
  },
  {
    id: "plank",
    name: "Plank",
    category: "Core",
    defaultPrimary: ["abs"],
    defaultSecondary: ["obliques", "lower_back"]
  },
  {
    id: "cable_woodchopper",
    name: "Cable Woodchopper",
    category: "Core",
    defaultPrimary: ["obliques"],
    defaultSecondary: ["abs"]
  },
  {
    id: "ab_wheel_rollout",
    name: "Ab Wheel Rollout",
    category: "Core",
    defaultPrimary: ["abs"],
    defaultSecondary: ["lats", "lower_back"]
  }
];

// Validation & detail-classification functions

export function isPositiveNumber(val) {
  if (typeof val === "boolean" || val === null || val === undefined || val === "") {
    return false;
  }
  const n = Number(val);
  return Number.isFinite(n) && n > 0;
}

export function isValidSet(set) {
  if (!set || typeof set !== "object") return false;
  return isPositiveNumber(set.reps);
}

export function isValidExercise(exercise) {
  if (!exercise || typeof exercise !== "object") return false;

  // 1. Must contain at least one valid set with finite positive reps
  const hasValidSet = Array.isArray(exercise.sets) && exercise.sets.some(isValidSet);
  if (!hasValidSet) return false;

  // 2. Must contain at least one primary muscle mapped to the 16 canonical catalog
  const primary = exercise.muscleMapping?.primary;
  if (!Array.isArray(primary) || primary.length === 0) return false;

  return primary.some((m) => typeof m === "string" && CANONICAL_MUSCLES.has(m));
}

export function getWorkoutDetailStatus(workout) {
  if (!workout || typeof workout !== "object") return "none";
  if (workout.isLegacy === true) return "legacy";

  const exercises = workout.exercises;
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return "general"; // Category 2: Detailed muscle data not recorded
  }

  const hasAnyValidExercise = exercises.some(isValidExercise);
  if (hasAnyValidExercise) {
    return "detailed"; // Category 4: Valid detailed session
  }

  return "incomplete"; // Category 3: Incomplete muscle data
}

export function evaluateLoggingStatus(workoutDate, createdAtIso, todayDate) {
  if (!createdAtIso || typeof createdAtIso !== "string") return "unknown";

  const createdTime = new Date(createdAtIso).getTime();
  if (!Number.isFinite(createdTime)) return "unknown";

  const createdD = new Date(createdAtIso);
  const createdLocalDate = new Date(createdD.getTime() - createdD.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  const today = todayDate || (() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  })();

  if (!workoutDate) return "unknown";

  if (workoutDate > today) {
    return "invalid-future";
  }
  if (createdLocalDate === workoutDate) {
    return "on-time";
  }
  if (createdLocalDate > workoutDate) {
    return "late";
  }
  return "unknown";
}

