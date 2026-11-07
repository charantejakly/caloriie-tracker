# LEAN MODE — Complete Development Roadmap
## Phase 2: Muscle Heatmap · Phase 3: Estimated Recovery Tracker

**Document purpose:** A single implementation handoff containing the complete remaining development roadmap and the detailed prompts for Phase 2 and Phase 3.

**Execution model:** Phase 2 and Phase 3 are intended to be implemented sequentially as one approved work batch, with **one consolidated completion report** after both phases. Phase 3 depends on the session data model delivered by Phase 1 and must not begin until Phase 2 is implemented and its tests pass.

**Important approval gates:**
- Phase 1 must first be completed, reviewed, and explicitly accepted by the user.
- The heatmap threshold values must be presented to and explicitly approved by the user before Phase 2 implementation.
- The complete set of recovery-window durations for all 16 muscles, and the behavior when workout time is missing, must be presented to and explicitly approved by the user before Phase 3 implementation.
- This document prepares the prompts; it does **not** authorize the IDE agent to begin Phase 2 or Phase 3 immediately.
- The user must explicitly authorize the combined Phase 2 + Phase 3 batch after the preceding gates are satisfied.

---

# PART I — PRODUCT RULES AND LOCKED ARCHITECTURE

## 1. LEAN MODE product boundaries

These rules apply to every phase and override implementation suggestions that conflict with them.

### Food tracking
**Track what I eat. Do not decide what I eat.**

LEAN MODE must not provide meal recommendations, food recommendations, meal plans, shopping lists, automatic substitutions, or dietary coaching. Preserve existing calorie and nutrition tracking functionality.

### Training tracking
**Record what I train. Do not decide how I train.**

LEAN MODE must not prescribe workouts, training splits, schedules, exercises, sets, repetitions, weights, effort targets, or what to train next. It is a logging, accounting, measurement, and visualization application—not a coaching application.

### Product and technical boundaries
- Local-first and offline-capable.
- Existing vanilla HTML/CSS/JavaScript ES-module architecture.
- No backend, cloud account, or external service requirement.
- No new npm/runtime dependency unless a genuine technical requirement is demonstrated and the user approves it first.
- Preserve existing PWA and Capacitor Android compatibility.
- Preserve existing food logs, calorie calculations, measurements, custom foods, workout history, backup/import/export, and data persistence.
- Preserve the existing visual language. Do not redesign unrelated application sections.
- Never fabricate historical workout dates, times, timestamps, sets, repetitions, muscle activation, or recovery precision.
- Do not infer rest days from missing records.
- Do not claim that an estimated timer measures actual biological recovery, tissue repair, or training readiness.

## 2. Locked anatomy and muscle catalog

There are exactly **two anatomical views**:
1. Front / Anterior.
2. Back / Posterior.

No left or right lateral views. No independent left/right tracking. Left and right paths for a bilateral muscle group may share one canonical muscle ID and one displayed set count.

The canonical catalog has exactly 16 IDs. Use these IDs consistently across session snapshots, SVGs, heatmap calculations, recovery settings, inspection cards, and backups.

| # | Canonical ID | Display name | Anatomy view |
|---:|---|---|---|
| 1 | `chest` | Chest | Anterior |
| 2 | `anterior_deltoids` | Front Shoulders | Anterior |
| 3 | `lateral_deltoids` | Side Shoulders | Both |
| 4 | `posterior_deltoids` | Rear Shoulders | Posterior |
| 5 | `biceps` | Biceps | Anterior |
| 6 | `triceps` | Triceps | Posterior |
| 7 | `forearms` | Forearms | Both |
| 8 | `abs` | Abdominals | Anterior |
| 9 | `obliques` | Obliques | Anterior |
| 10 | `traps` | Traps | Posterior |
| 11 | `lats` | Lats | Posterior |
| 12 | `lower_back` | Lower Back | Posterior |
| 13 | `glutes` | Glutes | Posterior |
| 14 | `quadriceps` | Quadriceps | Anterior |
| 15 | `hamstrings` | Hamstrings | Posterior |
| 16 | `calves` | Calves | Both |

There must be no generalized stored ID such as `shoulders`. Use the three explicit deltoid IDs.

## 3. Locked workout detail categories

The Phase 1 data model is expected to distinguish these four states. Phase 2 and Phase 3 must use the actual implemented Phase 1 validation and migration behavior; inspect the code rather than blindly assuming the schema matches this document.

| Status | Meaning | Heatmap / recovery eligibility |
|---|---|---|
| `legacy` | Historical pre-v3 record with no reliable granular muscle data | Never eligible |
| `general` | New session with no exercises attempted, e.g. general/cardio entry | Never eligible |
| `incomplete` | New exercise entries exist, but no valid detailed exercise qualifies | Never eligible |
| `detailed` | At least one valid exercise has a finite positive-rep set and at least one canonical primary muscle mapping | Eligible, using valid detailed exercise data only |

A new session with both valid and incomplete exercises may be `detailed` if at least one valid exercise qualifies. Retain incomplete entries for editing, but do not count their sets or mappings. A record is not legacy merely because detailed data is absent.

A valid set requires a real numeric value or a non-empty numeric string for repetitions, with a finite value greater than zero. Reject booleans, `null`, empty strings, malformed values, and non-finite values. Optional blank weight and effort remain allowed.

## 4. Locked attribution rules

- Each valid recorded set is credited to every canonical muscle ID listed in that exercise's **primary** mapping. This is direct set attribution, not a scientific measurement of activation.
- Secondary muscles are recorded as involved metadata only. They receive **zero** set credit and must never receive fractional or full automatic credit.
- Do not invent muscle activation or mappings. Built-in mappings are editable by the user and must be presented as editable logging defaults, not scientific certainty.
- A saved session must preserve an exercise name and muscle-mapping snapshot so later edits to the exercise library do not silently rewrite historical sessions.
- A session with valid detailed data may produce a heatmap for its actual workout date, including a late-entered historical session. Late entry does not earn retroactive streak credit. Existing streak logic remains outside the heatmap/recovery implementation and must not be changed.

## 5. Locked five-state heatmap palette

Use these exact colours and labels:

| State | Colour | Label |
|---|---|---|
| Elite training | `#51406F` | Elite |
| Good training | `#D83B43` | Good |
| Moderate training | `#E98A32` | Moderate |
| Minimal training | `#E8C84A` | Minimal |
| No primary sets recorded | `#A7A9A5` | No training |

These labels are the user's visual classification based on configurable recorded-set thresholds. They are not scientific performance, fitness, hypertrophy, or muscle-activation assessments.

Grey has a specific meaning: **zero primary sets for that muscle within an otherwise valid daily heatmap**. Grey must not represent a missing date, legacy workout, incomplete session, or unlogged day.

## 6. Locked recovery language and scope

Recovery is a **time-based estimate only**. It compares elapsed time since the latest qualifying detailed session where that muscle was a primary target against a user-configured duration for that muscle.

Preferred UI wording:
- `Estimated recovery window in progress`
- `Estimated recovery window completed`
- `Workout time not recorded`
- `Estimated window unavailable`
- `Override displayed estimate`
- `Revert to automatic estimate`

Never say a muscle is physically recovered, repaired, biologically ready, safe to train, or ready for maximum load. Never recommend an exercise or tell the user what to train next.

Only primary muscle attribution starts that muscle's estimated recovery window. Secondary involvement alone does not start or extend it.

Manual overrides, if implemented, affect only the displayed estimate state. They do not alter workout history or imply actual recovery.

---

# PART II — COMPLETE DEVELOPMENT ROADMAP

## Phase 1 — Training Data Model & Session Entry UI

**Status:** Separately authorized in the prior project workflow; completion and review are prerequisites for Phase 2.

Scope:
- Schema v3 migration and backward-compatible data handling.
- Canonical 16-muscle catalog and built-in exercise catalog.
- Custom exercise creation and editable primary/secondary mappings.
- Individual exercise and set entry, repetitions, optional weight, optional effort.
- Workout date, optional actual workout time, internally assigned `createdAt`, and logging status.
- Four workout detail categories.
- Preserve historical legacy records, existing food and measurement data, backups, streak semantics, offline/PWA/Capacitor structure.

Exit gate:
- Full existing and new tests pass.
- Migration and backup safety reviewed.
- User explicitly accepts Phase 1 completion.

## Phase 2 — Front/Back Daily Muscle Heatmap

**Detailed implementation prompt:** Part III of this document.

Scope:
- Pure SVG anatomy renderers for Front/Anterior and Back/Posterior only.
- Exactly 16 canonical muscle groups, with shared IDs for bilateral regions.
- Daily set-count aggregation from valid detailed sessions on the selected local calendar date.
- Five configurable colour states.
- All-muscle rendering for a valid daily heatmap; grey for zero primary sets.
- Secondary involvement displayed separately with zero set credit.
- Interactive muscle inspection showing count, contributing exercises, secondary involvement, and the selected date.
- No calendar redesign, recovery timer, notifications, or PNG export in this phase.

Exit gate:
- Thresholds explicitly approved before implementation.
- Aggregation and SVG tests pass.
- App remains functional offline and existing features regress cleanly.
- Agent stops after Phase 2 work is complete and proceeds to Phase 3 only within the explicitly approved combined batch.

## Phase 3 — Time-Based Estimated Recovery Tracker

**Detailed implementation prompt:** Part IV of this document.

Scope:
- Dedicated `src/recovery.js` module.
- Per-muscle configurable estimated recovery durations.
- Elapsed and remaining time based on actual recorded workout date/time when available.
- Explicit, honest behavior when actual workout time is missing.
- Latest qualifying primary-target session determines each muscle's current timer.
- Recalculation after workout/exercise/set edits or deletions.
- Optional display-only manual override and automatic reset.
- Neutral wording only; no readiness advice.

Exit gate:
- All 16 muscle durations explicitly approved before implementation.
- Missing-time behavior explicitly approved before implementation.
- Recovery calculations and override tests pass.
- Agent stops after Phase 3 and returns one consolidated Phase 2 + Phase 3 report.

## Phase 4 — Optional Local Recovery Notifications

Not included in the Phase 2 + Phase 3 batch.

Possible scope, only after explicit approval:
- Feasibility review of Capacitor/local notification support on the actual project versions and target Android device.
- Opt-in permission flow and clear explanation.
- Local notifications only; no backend or cloud push service.
- Neutral message such as `Your configured estimated recovery window has ended`.
- Respect disabled permissions and app-level opt-out.
- Recalculate/cancel/reschedule notifications when a workout or duration changes.
- Do not notify by default without consent.

## Phase 5 — Training Calendar & History

Not included in the Phase 2 + Phase 3 batch.

Possible scope, only after explicit approval:
- Monthly calendar integrated with Training history.
- Detailed workout date: daily heatmap thumbnail if valid data exists.
- Legacy/general/incomplete date: session indicator and corresponding status, but no heatmap.
- Unlogged date: no heatmap and no inferred rest-day marker.
- Multiple detailed sessions on the same date merge into one daily heatmap.
- Late-entered historical sessions appear on their actual workout date and are visibly marked late.
- No retroactive streak credit.

## Phase 6 — Transparent Anatomy PNG Export

Not included in the Phase 2 + Phase 3 batch.

Possible scope, only after explicit approval:
- Export only Front and Back anatomy views.
- Generate locally, without using an app screenshot.
- Genuine transparent alpha channel.
- Optional date, muscle labels, legend, and LEAN MODE branding.
- Web download and Android save/share support, based on verified platform capabilities.
- No saved PNG gallery in the initial export phase.

## Phase 7 — Integration, Regression, Offline and Android QA

The Phase 2 + Phase 3 batch must perform its own tests/build verification. Phase 7 remains the final end-to-end QA milestone after Phases 4–6 or any approved scope changes.

Possible final checks:
- Full test suite and production build.
- Service-worker cache version and offline assets.
- Existing food, calorie, measurements, and workout functions.
- Backup/restore and data migration.
- Android Capacitor sync/build and actual device testing.
- Verify no unexpected network/backend dependency.

---

# PART III — PHASE 2 IMPLEMENTATION PROMPT
## Front/Back Daily Muscle Heatmap

> This prompt may be executed only after Phase 1 is reviewed and accepted, heatmap thresholds are explicitly approved, and the user explicitly authorizes the combined Phase 2 + Phase 3 batch.

## 2.1 Preflight inspection — no code changes yet

Inspect the actual post-Phase-1 code and report internally in the working plan:
- Current schema version and exact structured workout shape.
- How `getWorkoutDetailStatus()` or its equivalent validates sessions and exercises.
- How exercise-level validity is represented when a session contains mixed valid and incomplete exercises.
- The exact canonical catalog export and identifiers.
- How dates are normalized to the device's local calendar date.
- How workout edits/deletions are persisted.
- Existing Training page layout and modal/component patterns.
- Existing build and service-worker asset registration.

Do not assume Phase 1 implemented the report's proposed shape exactly. Adapt to the actual code while preserving locked semantics.

## 2.2 Threshold approval gate

Before implementing Phase 2, present the threshold proposal to the user and wait for explicit approval. The historical proposal is:

| Colour | Label | Proposed daily primary-set range |
|---|---|---:|
| Yellow `#E8C84A` | Minimal | 1–5 |
| Orange `#E98A32` | Moderate | 6–11 |
| Red `#D83B43` | Good | 12–19 |
| Dark purple `#51406F` | Elite | 20+ |
| Grey `#A7A9A5` | No training | 0 |

**These values are proposals, not approved defaults.** Do not hardcode them as final values or begin heatmap implementation until the user approves the exact boundaries. If the user changes them, use the approved values.

Threshold configuration must be data-driven, validated, and stored using the existing profile/settings conventions. Avoid scattering numeric boundaries across UI and calculation modules. Ensure thresholds form a complete, non-overlapping, monotonically increasing set of ranges. Do not allow invalid, negative, overlapping, or missing boundaries to silently generate misleading colours.

## 2.3 Required modules

Create, where appropriate:
- `src/anatomy-svg.js` — pure Front and Back SVG generation.
- `src/heatmap.js` — daily aggregation, validation, thresholds, colour states, and muscle detail data.

Modify only necessary integration files, likely `src/main.js`, `src/style.css`, `src/store.js` if settings persistence is needed, `sw.js`, and tests. Do not create `heatmap-export.js` in Phase 2; PNG export belongs to Phase 6.

## 2.4 Anatomy SVG requirements

Export two pure functions or equivalent interfaces:
- `renderAnteriorSvg(muscleColorMap)`
- `renderPosteriorSvg(muscleColorMap)`

Requirements:
- Exactly two anatomy views: Front/Anterior and Back/Posterior.
- Use inline vector paths; no remote image, web font, API, or network resource.
- All 16 canonical muscle groups represented according to their catalog view assignments.
- For muscles shown on both views, use the same canonical `data-muscle` ID on the corresponding paths.
- Bilateral left/right paths for one muscle group share the same canonical ID and colour; do not track sides independently.
- Each clickable region must expose a stable `data-muscle` attribute and an accessible label/title.
- Provide clear visual distinction between adjacent muscle groups without distorting anatomy.
- SVG should scale responsively inside the existing Training UI.
- Use safe SVG construction/escaping; do not inject untrusted exercise names or arbitrary strings into SVG markup.
- Selecting a muscle highlights or otherwise clearly identifies the corresponding unified muscle group and opens its detail panel.
- The SVG functions should be deterministic and testable without a browser DOM where practical.

Do not use image screenshots or generated raster anatomy as a substitute for editable vector SVG paths.

## 2.5 Daily heatmap validation and aggregation

Implement a deterministic function such as:

`calculateDailyHeatmap(sessionsForDate, thresholds)`

The function must use actual Phase 1 data and the shared validation functions. Do not duplicate or weaken detailed-session validation.

Rules:
1. Normalize/compare using the app's established local-date convention.
2. Only sessions whose workout date equals the selected date are candidates.
3. Only valid detailed sessions and valid detailed exercises contribute.
4. If no valid detailed exercise exists across sessions for that date, return `null` / an explicit no-heatmap result. Do not render an empty grey anatomy.
5. If at least one valid detailed exercise exists, aggregate all valid detailed sessions for that date into **one daily heatmap**.
6. A late-entered historical detailed session may contribute to the heatmap on its actual workout date. Its late status must remain visible in history and must not affect streaks.
7. For each valid set, add one set to each canonical muscle in that exercise's primary mapping. Do not use weight, reps magnitude, effort, duration, or a rolling 7-day window as a substitute for set count.
8. Secondary muscles get zero set credit. Preserve their involvement/exercise names as separate metadata for the inspection UI.
9. Ignore invalid or non-canonical muscle IDs for calculations and surface invalid mappings as data-quality issues for review; never silently create new muscle groups.
10. Iterate over the complete canonical catalog for every valid daily map. Muscles with zero primary sets receive grey. Grey only means zero primary sets on this valid heatmap date.
11. Do not generate heatmaps for dates without logs, legacy-only dates, general-only dates, or incomplete-only dates.
12. If a date has a mix of valid detailed and legacy/general/incomplete sessions, calculate from valid detailed exercises only. Keep the other session status labels visible; do not count their data.
13. Be idempotent: repeated calculations over the same records must return the same result and must not mutate source data.

Return enough structured data for the UI to display, for each canonical muscle:
- `muscleId`
- recorded primary `sets`
- colour and label
- contributing exercise names / IDs
- secondary involvement names / IDs, clearly marked as zero set credit

Do not create fictional zero-set records for muscles. Zero is a calculated display state only within a valid day's heatmap.

## 2.6 Heatmap UI integration

Integrate the heatmap within the existing Training section. Keep the existing workout list and session-entry workflow usable.

The user should be able to:
- Select or view a date that has workout records.
- Switch between Front and Back views.
- See the selected date and that the map represents that date only.
- Inspect a muscle by clicking/tapping its anatomy region.
- See the muscle's primary set total, contributing exercises, and secondary involvement separately.
- See the five-state legend with exact colours and labels.
- Understand that categories/labels describe logged set thresholds, not scientific training quality.

Do not build the full monthly calendar here; that belongs to Phase 5. A simple date selector or integration into existing session-date navigation is acceptable.

Empty/missing-state UX must distinguish:
- No workout recorded for this date.
- Workout exists but only legacy/general/incomplete data is available.
- Valid detailed heatmap exists.

Do not display an all-grey body for the first two states.

## 2.7 Phase 2 testing requirements

Add tests for:
- No sessions → no heatmap.
- Legacy-only date → no heatmap.
- General-only date → no heatmap.
- Incomplete-only date → no heatmap.
- Detailed session with one valid set → valid heatmap.
- Mixed detailed and incomplete exercises → only valid exercises count.
- Multiple detailed sessions on one date aggregate together.
- Different dates never mix.
- Late-entered detailed workout maps to its actual date.
- Each primary muscle receives one credit per valid set.
- Multiple primary mappings receive direct set counts as specified.
- Secondary mappings receive zero set credit but remain visible.
- Every one of the 16 muscles appears in a valid map.
- Zero-primary-set muscles are grey on a valid map.
- Grey is never returned for an unlogged date because no map is returned.
- Threshold boundaries are exact at one below, exactly at, and one above every boundary.
- Invalid threshold configuration is rejected safely.
- Invalid/non-canonical muscle IDs do not corrupt calculations.
- SVG output includes exactly Front and Back views, stable canonical IDs, and accessible labels.
- Bilateral paths share one ID and one colour.
- SVG rendering handles all five colour states and no-data state without errors.

Run all existing tests plus new tests. Record exact commands and results.

## 2.8 Phase 2 non-goals

Do not implement:
- Recovery calculation or timer.
- Recovery settings or manual override.
- Notifications.
- Monthly calendar redesign.
- PNG export or gallery.
- Left/right muscle accounting.
- Workout coaching, training recommendations, or targets.

After Phase 2 implementation and tests pass, proceed to Phase 3 only if the user's prior combined Phase 2 + Phase 3 authorization is still in effect and Phase 3 approval prerequisites have been satisfied. Otherwise stop and request approval.

---

# PART IV — PHASE 3 IMPLEMENTATION PROMPT
## Time-Based Estimated Recovery Tracker

> This prompt may be executed only after Phase 2 is implemented and passes its tests, the complete recovery configuration and missing-time behavior are explicitly approved, and the user has explicitly authorized the combined Phase 2 + Phase 3 batch.

## 3.1 Preflight inspection

Inspect the actual implemented Phase 1 and Phase 2 code:
- Actual session shape and local date/time helpers.
- Exercise-level valid-set and primary-mapping validation.
- Canonical muscle catalog and all IDs.
- How heatmap calculations identify valid detailed exercises.
- How edits/deletions update stored workout records.
- Existing profile/settings persistence and backup validation.
- Existing Training UI patterns.
- Service-worker asset list and tests.

Do not assume `time`, `createdAt`, or `loggingStatus` are populated. Handle historical unknown values honestly.

## 3.2 Recovery-duration approval gate

Before Phase 3 implementation, present a complete proposed duration table for **all 16 canonical muscles** and wait for explicit user approval.

The earlier architecture report contained examples such as chest 48h, quadriceps 72h, hamstrings 72h, abs 24h, and forearms 24h, but these were never approved final values. Do not treat them as final settings. Do not silently assign one generic duration or invent the remaining values.

The proposed table must contain:
- Canonical muscle ID and display name.
- Proposed duration in hours.
- Clear indication that this is a configurable tracking parameter, not a biological claim or training recommendation.

After user approval, use those exact values as editable initial defaults. Every muscle's duration must remain user-configurable in the app. Validate that each duration is a finite positive value within a documented reasonable software input range; do not silently clamp user values.

If a duration is not configured or invalid, display the estimate as unavailable for that muscle rather than inventing a default.

## 3.3 Missing workout-time approval gate

The workout time field is optional. Never substitute noon, midnight, or another invented time.

Before implementation, explicitly present the date-only behavior for approval. The safe default proposal is:
- If an actual workout time exists, calculate an exact elapsed/remaining duration from the local workout date and time.
- If time is missing, do not show a precise hourly countdown or fabricated end time. Show `Workout time not recorded — exact estimated window unavailable` and, if useful, show the recorded calendar date only.
- Do not calculate an invented timestamp from date-only data.

If the user approves a date-only calendar-day estimate instead, document its exact rounding and boundary rules and label it clearly as a date-level estimate, not an exact time-based countdown. Do not implement an ambiguous fallback.

## 3.4 Required module

Create `src/recovery.js` as a separate module responsible for pure time-based calculations and recovery-display state.

Keep UI integration in the existing Training section. Do not mix recovery calculations into SVG generation or the heatmap aggregator.

## 3.5 Which session determines a muscle's estimate

For a given muscle:
1. Consider only valid detailed exercises from sessions where that muscle is a canonical **primary** mapping.
2. Ignore secondary-only involvement for recovery timing.
3. Consider all relevant sessions, including late-entered historical sessions, using their actual workout date and actual workout time where available.
4. Choose the most recent qualifying actual workout timestamp for that muscle.
5. Use the approved configured duration for that muscle.
6. If the relevant latest session lacks an actual workout time, apply only the user-approved missing-time behavior. Do not silently skip it and fall back to an older session with an available timestamp; the latest relevant workout still matters.
7. If date/time or duration is unknown, display unavailable with a precise explanation rather than fabricating a result.

A muscle with no qualifying primary-target detailed session has no recovery estimate. Do not infer a recovery timer from legacy/general/incomplete sessions.

## 3.6 Calculation model

For a valid exact timestamp and approved duration:

- `elapsedMs = max(0, nowMs - workoutTimestampMs)`
- `targetMs = approvedDurationHours * 60 * 60 * 1000`
- `remainingMs = max(0, targetMs - elapsedMs)`
- Estimated window ends at `workoutTimestampMs + targetMs`.

Use the actual recorded local workout date and time. Construct/parse local date-time carefully using existing project helpers; avoid treating a local `YYYY-MM-DD` and `HH:mm` as UTC by accident. Handle daylight-saving/time-zone behavior consistently with the app's local-time conventions, even if the primary deployment is in India.

The calculation must be pure where possible: accept records, configuration, and `now` as inputs. Do not make tests depend on the real clock.

If the workout timestamp is in the future relative to `now`, do not emit negative elapsed time or a misleading active countdown. Return a safe invalid/unavailable status and surface the data issue.

## 3.7 UI and wording

Display neutral information for each muscle:
- Muscle display name.
- Most recent qualifying logged session date and time, if known.
- Approved configured estimate duration.
- Elapsed time.
- Remaining time, if the window is in progress.
- Estimated end date/time, only when exact time is known.
- Status label: `Estimated recovery window in progress` or `Estimated recovery window completed`.

When time is missing, use the exact approved date-only behavior and never imply precision that the record does not support.

Never display:
- `Muscle recovered` as a biological fact.
- `Ready to train` or `Safe to train`.
- `Fully repaired` or `Tissue repaired`.
- Exercise suggestions or instructions about what to train next.

Add a short explanation in the UI that this is a user-configured elapsed-time estimate based on logged sessions, not a measurement of physical recovery or readiness.

## 3.8 Manual display override

A manual override may be implemented only as a display-state override.

Use neutral actions such as:
- `Override displayed estimate: Completed`
- `Override displayed estimate: In progress`
- `Revert to automatic estimate`

Rules:
- Do not modify workout date/time, exercise data, set data, or the configured duration.
- Persist the override locally if appropriate, with a timestamp and muscle ID.
- Show clearly that the displayed state is manually overridden.
- Reverting restores the calculated automatic estimate.
- If the underlying qualifying workout changes or is deleted, do not silently retain a stale override that appears tied to a different session. Define and test how overrides are invalidated or associated with the relevant latest-session identity.
- An override is not evidence of actual recovery.

## 3.9 Recalculation and persistence

The displayed estimate must recalculate whenever:
- A workout is added.
- A workout date/time is edited.
- An exercise is added/removed.
- A set is added/removed or edited in a way that changes detailed validity.
- Primary muscle mapping is changed.
- A workout is deleted.
- A configured duration is changed.
- The app is reopened or the current time advances.

Do not store stale elapsed/remaining numbers as authoritative history. Store user configuration and any explicit display override; derive elapsed/remaining values from source workout records and the current time.

No background timer or notification service is needed in this phase. The UI may refresh its displayed values using the app's existing lifecycle/render patterns. Do not add polling infrastructure without need.

## 3.10 Backup compatibility

Include approved recovery-duration settings and manual display overrides in backup/export/import using the existing store conventions.

Verify:
- Older backups without recovery settings still import safely.
- Missing settings remain unconfigured or use only the user-approved defaults.
- Merge and Replace All Data preserve the documented semantics.
- Malformed settings/overrides are rejected or safely ignored without damaging workout records.
- No actual recovery state is persisted as a factual health record.

## 3.11 Phase 3 testing requirements

Add deterministic tests covering:
- Exact timestamp with window in progress.
- Exact timestamp at the completion boundary.
- Exact timestamp after the completion boundary.
- Different durations for different muscles.
- Most recent qualifying primary session selection.
- Secondary-only muscle involvement does not create a recovery estimate.
- Legacy/general/incomplete sessions do not create estimates.
- Multiple sessions and exercises on the same date.
- Late-entered historical records use workout date/time, not entry creation time, for the elapsed estimate.
- Missing workout time follows the exact user-approved behavior.
- Unknown date, unknown duration, malformed timestamp, invalid duration, and future timestamp safely return unavailable/invalid states.
- Edit/delete/mapping change/set change recalculates the estimate.
- Manual override changes display state only.
- Revert restores automatic calculation.
- Override invalidation or association works after the latest session changes.
- Backup/import round trips preserve settings and overrides.
- Time-zone/local-time parsing does not accidentally shift the workout time.

Run all existing tests plus Phase 2 and Phase 3 tests. Record exact commands and counts.

## 3.12 Phase 3 non-goals

Do not implement:
- Local notifications or push notifications.
- Physical recovery or readiness assessment.
- Medical, training, or exercise advice.
- Automatic workout or recovery recommendations.
- PNG export.
- Full calendar redesign.
- Backend/cloud synchronization.

After Phase 3 verification, stop. Do not start Phase 4.

---

# PART V — SHARED ENGINEERING AND REGRESSION RULES

## 1. Data integrity

- Inspect actual code before editing.
- Make the smallest justified changes.
- Never delete or rewrite unrelated user data.
- Do not fabricate historical fields.
- Preserve unknown values as unknown.
- Do not mutate source workout objects during calculations.
- Keep migration idempotent and backup-compatible.
- Validate all imported configuration and user-entered values.
- Do not make an irreversible schema or storage change without a tested migration and recovery path.

## 2. Offline and platform compatibility

- Add any new modules to the actual service-worker asset list.
- Bump cache version according to existing project convention.
- Verify no new remote resources are required for anatomy or calculations.
- Verify web build and app startup.
- Verify the app remains usable offline after assets are cached.
- Preserve Capacitor configuration and Android source project.
- Report Android build/device verification honestly; do not claim it if not performed.

## 3. Visual and interaction quality

- Fit the existing LEAN MODE design language.
- Responsive layout for phone and desktop.
- Accessible labels and keyboard/touch operability where applicable.
- Clear selected-date and front/back view state.
- Do not use colour as the only signal; include labels/counts or accessible text.
- Avoid cramped or overflowing anatomy views.
- Keep empty, unavailable, legacy, general, and incomplete states distinct.
- Do not turn the UI into a coaching dashboard.

## 4. Testing standards

- Run the complete test suite, not only newly added tests.
- Report exact command lines and exact pass/fail counts.
- Distinguish automated tests from manual visual checks.
- Do not claim a test passed if it was not run.
- Do not hide skipped tests, build warnings, or unresolved issues.
- Compare against the actual test baseline found before changes.

---

# PART VI — COMBINED PHASE 2 + PHASE 3 EXECUTION PROTOCOL

## 1. Before any code changes

The IDE agent must verify all of the following:
1. Phase 1 implementation is present, tested, and explicitly accepted by the user.
2. The user has explicitly authorized the combined Phase 2 + Phase 3 work batch.
3. Heatmap threshold values have been explicitly approved.
4. The full recovery duration table for all 16 muscles has been explicitly approved.
5. The missing-workout-time behavior has been explicitly approved.

If any item is missing, **do not modify code**. Return a concise preflight report identifying exactly which approval is missing. Do not infer consent from this document alone.

## 2. Execution order

Once all gates are satisfied:
1. Implement Phase 2.
2. Run Phase 2 tests and full regression suite.
3. Inspect Phase 2 results and resolve failures before continuing.
4. Implement Phase 3 on top of the verified Phase 2 result.
5. Run Phase 3 tests and the full combined regression suite.
6. Run the production/web build and offline checks.
7. Review all changed files and data migration/backup safety.
8. Produce **one consolidated completion report covering both Phase 2 and Phase 3**.

The agent may provide brief progress updates during implementation, but must not produce two separate final phase reports. The final deliverable is one report with distinct Phase 2 and Phase 3 subsections.

If Phase 2 is blocked or cannot pass its required tests, do not continue to Phase 3. Return one consolidated partial/blocked report explaining that Phase 3 was not started and why.

If Phase 2 passes but Phase 3 is blocked, keep the verified Phase 2 work intact, do not improvise recovery behavior, and return one consolidated report showing Phase 2 completed and Phase 3 partial/blocked.

## 3. Mandatory consolidated completion report

Return a single report with these exact sections:

### A. Overall Status
- Combined status: Completed / Partial / Blocked / Failed.
- Phase 2 status: Completed / Partial / Blocked / Not started.
- Phase 3 status: Completed / Partial / Blocked / Not started.
- Confirm whether any user approval gate was skipped (the correct answer should be no).

### B. Phase 2 — Successfully Completed
- Daily heatmap aggregation and validation.
- Front/Back SVG anatomy and 16-muscle mapping.
- Five colour states and exact approved thresholds.
- Primary and secondary attribution behavior.
- UI integration and muscle inspection.
- Files and functions changed.

### C. Phase 2 — Not Completed / Issues
- Every deferred or incomplete item.
- Exact reason and impact.

### D. Phase 3 — Successfully Completed
- Recovery calculation model.
- Approved duration configuration for all 16 muscles.
- Missing-time behavior.
- Primary-only latest-session selection.
- UI wording and per-muscle display.
- Manual override behavior, if implemented.
- Recalculation after edits/deletions.
- Files and functions changed.

### E. Phase 3 — Not Completed / Issues
- Every deferred or incomplete item.
- Exact reason and impact.

### F. Errors and Blockers
For each issue include:
- Exact error/message.
- Command/action that caused it.
- Affected file/module.
- Diagnosis.
- Whether fixed or unresolved.

### G. Tests
- Exact commands executed.
- Phase 2 test count and pass/fail/skip counts.
- Phase 3 test count and pass/fail/skip counts.
- Full regression result.
- Build result.
- Manual UI checks and their actual results.
- Offline checks and their actual results.
- Explicitly list tests not run.

### H. Build and Platform Status
- Production/web build.
- Service-worker asset list and cache version.
- Offline/PWA result.
- Capacitor sync/build result, if performed.
- Android APK result, if performed.
- Physical device verification result, if performed.
- Clearly distinguish not tested, not attempted, and failed.

### I. Data Safety and Backup Compatibility
- Starting and ending schema versions.
- Migration changes, if any.
- Legacy record preservation.
- Backup/export/import compatibility.
- Merge and Replace All Data verification.
- Recovery settings/override persistence.
- Any destructive operations or risk of data loss.

### J. Known Issues and Risks
- Accuracy limitations of editable exercise mappings.
- Thresholds are visual classifications, not scientific assessments.
- Recovery is an elapsed-time estimate, not biological recovery.
- Any remaining technical or UX risk.

### K. Complete File Change List
For every created, modified, or deleted file:
- Path.
- Change summary.
- Reason for change.

### L. Exact Next Step
State one of:
- `PHASES 2 AND 3 COMPLETE — AWAITING USER REVIEW — PHASE 4 NOT STARTED.`
- `PHASE 2 COMPLETE — PHASE 3 BLOCKED — AWAITING USER REVIEW.`
- `PHASE 2 BLOCKED — PHASE 3 NOT STARTED — AWAITING USER REVIEW.`
- `PHASES 2 AND 3 PARTIAL — AWAITING USER REVIEW.`

Do not start Phase 4 under any circumstance without separate explicit user approval.

---

# PART VII — QUICK AUTHORIZATION CHECKLIST FOR THE USER

Before the IDE agent starts the combined batch, the user must have:

- [ ] Reviewed and explicitly accepted Phase 1.
- [ ] Explicitly authorized Phase 2 + Phase 3 as one sequential implementation batch.
- [ ] Approved the exact heatmap set-count thresholds.
- [ ] Approved all 16 per-muscle recovery durations.
- [ ] Approved the missing-workout-time behavior.

The IDE agent must not mark a checkbox as approved on the user's behalf.

## Final instruction to the IDE agent

Implement only the scope authorized above. Follow the locked architecture, inspect the actual code, protect all existing user data and features, and be truthful about tests and platform verification. Execute Phase 2 and then Phase 3 sequentially only after every gate is satisfied. Return **one consolidated report for both phases**, then stop and wait for the user's review.

**No Phase 4 implementation. No automatic continuation. No unapproved defaults.**
