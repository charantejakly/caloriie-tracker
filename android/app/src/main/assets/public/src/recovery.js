// Time-Based Estimated Recovery Tracker
// Pure mathematical calculations comparing elapsed time against user-configured durations
// Strictly a logging and accounting estimator — does not assess biological recovery or training readiness

import { CANONICAL_CATALOG, CANONICAL_MUSCLES, isValidExercise, isValidSet } from "./muscle-data.js";

export const DEFAULT_RECOVERY_HOURS = {
  chest: 48,
  anterior_deltoids: 48,
  lateral_deltoids: 36,
  posterior_deltoids: 36,
  biceps: 36,
  triceps: 36,
  forearms: 24,
  abs: 24,
  obliques: 24,
  traps: 48,
  lats: 48,
  lower_back: 72,
  glutes: 48,
  quadriceps: 72,
  hamstrings: 72,
  calves: 36
};

export function validateRecoveryHours(userHours) {
  const result = { ...DEFAULT_RECOVERY_HOURS };
  if (!userHours || typeof userHours !== "object") return result;

  for (const mId of CANONICAL_MUSCLES) {
    const val = Number(userHours[mId]);
    if (Number.isFinite(val) && val >= 1 && val <= 336) { // between 1 hour and 14 days
      result[mId] = Math.round(val);
    }
  }
  return result;
}

/**
 * Finds the latest qualifying session where targetMuscle is a canonical primary target
 */
export function findLatestPrimarySession(targetMuscle, workouts) {
  if (!Array.isArray(workouts) || workouts.length === 0) return null;
  if (!CANONICAL_MUSCLES.has(targetMuscle)) return null;

  const qualifying = [];

  for (const session of workouts) {
    if (!session || typeof session !== "object" || !session.date || typeof session.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(session.date)) continue;
    const exercises = Array.isArray(session.exercises) ? session.exercises : [];

    const hasPrimaryTarget = exercises.some((ex) => {
      if (!isValidExercise(ex)) return false;
      const primary = ex.muscleMapping?.primary || [];
      return primary.includes(targetMuscle);
    });

    if (hasPrimaryTarget) {
      qualifying.push(session);
    }
  }

  if (qualifying.length === 0) return null;

  // Find the latest calendar date
  let maxDate = qualifying[0].date;
  for (const s of qualifying) {
    if (s.date > maxDate) maxDate = s.date;
  }

  // Filter all qualifying sessions on the latest date
  const sessionsOnMaxDate = qualifying.filter((s) => s.date === maxDate);

  // Check if ALL sessions on maxDate have a valid exact time string (HH:mm)
  const allHaveTime = sessionsOnMaxDate.every(
    (s) => s.time && typeof s.time === "string" && /^\d{2}:\d{2}$/.test(s.time)
  );

  if (allHaveTime) {
    // Sort descending by time
    sessionsOnMaxDate.sort((a, b) => b.time.localeCompare(a.time));
    return {
      session: sessionsOnMaxDate[0],
      hasTime: true,
      hasAmbiguousOrder: false
    };
  }

  // At least one session on the latest date lacks exact time.
  // Minute-level chronological ordering cannot be established.
  // Return date-only without falling back to older sessions or inventing chronological precision.
  return {
    session: sessionsOnMaxDate[0],
    hasTime: false,
    hasAmbiguousOrder: sessionsOnMaxDate.length > 1
  };
}

/**
 * Calculates recovery status for a single muscle
 */
export function calculateMuscleRecovery(
  targetMuscle,
  workouts,
  userRecoveryHours = DEFAULT_RECOVERY_HOURS,
  recoveryOverrides = {},
  now = new Date()
) {
  const meta = CANONICAL_CATALOG.find((c) => c.id === targetMuscle);
  const muscleName = meta ? meta.name : targetMuscle;
  const validatedHours = validateRecoveryHours(userRecoveryHours);
  const targetDurationHours = validatedHours[targetMuscle] || DEFAULT_RECOVERY_HOURS[targetMuscle] || 48;

  const latestInfo = findLatestPrimarySession(targetMuscle, workouts);

  if (!latestInfo) {
    return {
      muscleId: targetMuscle,
      muscleName,
      hasSession: false,
      state: "unlogged",
      statusLabel: "No qualifying primary session recorded",
      details: "Recovery tracking begins when an exercise with this muscle as a primary target is logged.",
      configuredDurationHours: targetDurationHours,
      latestSession: null,
      isOverridden: false
    };
  }

  const { session, hasTime, hasAmbiguousOrder } = latestInfo;
  const nowMs = now.getTime();

  // Check for manual display override linked to this latest session
  const override = recoveryOverrides && recoveryOverrides[targetMuscle];
  const isOverrideActive = Boolean(
    override &&
    override.latestWorkoutId === session.id &&
    (override.state === "completed" || override.state === "in-progress")
  );

  // Case C: Missing workout time behavior (Gate C approved)
  if (!hasTime) {
    const [wYear, wMonth, wDay] = session.date.split("-").map(Number);
    const workoutDayStart = new Date(wYear, wMonth - 1, wDay, 0, 0, 0, 0).getTime();

    const localYear = now.getFullYear();
    const localMonth = now.getMonth();
    const localDay = now.getDate();
    const todayDayStart = new Date(localYear, localMonth, localDay, 0, 0, 0, 0).getTime();

    // Guard against future workout date
    if (workoutDayStart > todayDayStart) {
      return {
        muscleId: targetMuscle,
        muscleName,
        hasSession: true,
        hasExactTime: false,
        workoutDate: session.date,
        workoutTime: null,
        state: "invalid-future",
        statusLabel: "Workout date in the future",
        details: `Session date ${session.date} is in the future. Recovery calculations begin after session date arrives.`,
        configuredDurationHours: targetDurationHours,
        latestSession: session,
        isOverridden: false
      };
    }

    const elapsedCalendarDays = Math.max(0, Math.floor((todayDayStart - workoutDayStart) / (86400 * 1000)));

    let statusLabel = "Estimated recovery window — date-only estimate";
    let state = "date-only";

    if (isOverrideActive) {
      state = override.state === "completed" ? "override-completed" : "override-in-progress";
      statusLabel = override.state === "completed"
        ? "Override displayed estimate: Completed"
        : "Override displayed estimate: In progress";
    }

    const orderNote = hasAmbiguousOrder
      ? "multiple sessions recorded on this date; exact order unavailable"
      : "time not recorded";

    return {
      muscleId: targetMuscle,
      muscleName,
      hasSession: true,
      hasExactTime: false,
      workoutDate: session.date,
      workoutTime: null,
      state,
      statusLabel,
      elapsedCalendarDays,
      configuredDurationHours: targetDurationHours,
      details: `Workout recorded: ${session.date} (${orderNote}). Elapsed: ${elapsedCalendarDays} calendar day${elapsedCalendarDays === 1 ? "" : "s"}. Configured duration: ${targetDurationHours} hours. Exact remaining time and completion status unavailable.`,
      latestSession: session,
      isOverridden: isOverrideActive,
      overrideState: isOverrideActive ? override.state : null
    };
  }

  // Case A: Exact workout date and time available
  const [wYear, wMonth, wDay] = session.date.split("-").map(Number);
  const [wHour, wMin] = session.time.split(":").map(Number);
  const workoutTimestamp = new Date(wYear, wMonth - 1, wDay, wHour, wMin, 0, 0);
  const workoutMs = workoutTimestamp.getTime();

  // Guard against future timestamps
  if (workoutMs > nowMs) {
    return {
      muscleId: targetMuscle,
      muscleName,
      hasSession: true,
      hasExactTime: true,
      state: "invalid-future",
      statusLabel: "Workout timestamp in the future",
      details: `Session timestamp ${session.date} ${session.time} is in the future. Recovery calculations begin after session time passes.`,
      configuredDurationHours: targetDurationHours,
      latestSession: session,
      isOverridden: false
    };
  }

  const elapsedMs = Math.max(0, nowMs - workoutMs);
  const elapsedHours = elapsedMs / (3600 * 1000);
  const remainingHours = Math.max(0, targetDurationHours - elapsedHours);
  const isAutoCompleted = elapsedHours >= targetDurationHours;
  const estimatedEndTime = new Date(workoutMs + targetDurationHours * 3600 * 1000);

  let state = isAutoCompleted ? "completed" : "in-progress";
  let statusLabel = isAutoCompleted
    ? "Estimated recovery window completed"
    : "Estimated recovery window in progress";

  if (isOverrideActive) {
    state = override.state === "completed" ? "override-completed" : "override-in-progress";
    statusLabel = override.state === "completed"
      ? "Override displayed estimate: Completed"
      : "Override displayed estimate: In progress";
  }

  const roundedElapsed = Math.floor(elapsedHours);
  const roundedRemaining = Math.ceil(remainingHours);

  const endLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(estimatedEndTime);

  const details = isAutoCompleted
    ? `${roundedElapsed}h elapsed since session (${session.date} at ${session.time}). Configured ${targetDurationHours}h window completed.`
    : `${roundedElapsed}h elapsed · ${roundedRemaining}h remaining (window ends ${endLabel}).`;

  return {
    muscleId: targetMuscle,
    muscleName,
    hasSession: true,
    hasExactTime: true,
    workoutDate: session.date,
    workoutTime: session.time,
    workoutTimestamp: workoutTimestamp.toISOString(),
    estimatedEndTimestamp: estimatedEndTime.toISOString(),
    state,
    statusLabel,
    elapsedHours: roundedElapsed,
    remainingHours: roundedRemaining,
    configuredDurationHours: targetDurationHours,
    details,
    latestSession: session,
    isOverridden: isOverrideActive,
    overrideState: isOverrideActive ? override.state : null
  };
}

/**
 * Calculates recovery for all 16 canonical muscles
 */
export function calculateAllMuscleRecovery(
  workouts,
  userRecoveryHours = DEFAULT_RECOVERY_HOURS,
  recoveryOverrides = {},
  now = new Date()
) {
  const result = [];
  for (const item of CANONICAL_CATALOG) {
    result.push(calculateMuscleRecovery(item.id, workouts, userRecoveryHours, recoveryOverrides, now));
  }
  return result;
}

