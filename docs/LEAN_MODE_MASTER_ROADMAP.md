# LEAN MODE — MASTER BUILD ROADMAP & IMPLEMENTATION PROMPT
## One-pass implementation specification for the existing IDE workspace

**Project:** LEAN MODE  
**Target:** Responsive web application first; Android APK packaging later  
**Role:** Senior full-stack engineer, product designer, QA engineer and technical architect  
**Execution mode:** Inspect → plan → implement → test → document  
**Primary constraint:** Extend the existing application. Do not unnecessarily rebuild it.

---

# 0. INSTRUCTIONS TO THE CODING AGENT

You are working inside an existing project named **LEAN MODE**. You have been given two audit reports:

1. Development Progress Audit
2. Workspace Intelligence Audit

Use the actual current workspace as the source of truth. The audits describe the inspected state, but files may have changed since those reports were generated. Inspect the project before editing.

Your task is to implement the complete, reliable, mobile-first LEAN MODE calorie and nutrition tracking web application in this workspace in one coordinated development pass.

Do not stop after producing a plan. Implement the application, run the available tests, add tests for new functionality, build the production output, and document the result.

## Non-negotiable user boundaries

These rules override any generic fitness-app conventions:

### Rule A — Track what I eat. Do not decide what I eat.
The application must **not**:
- Recommend foods or meals.
- Generate meal plans.
- Suggest what the user should eat next.
- Suggest foods to meet remaining protein or calorie targets.
- Automatically propose healthier alternatives.
- Generate shopping lists or diet plans.

The application may:
- Record foods the user chooses to log.
- Estimate calories and macros from user-entered descriptions.
- Let the user manually enter or correct nutrition values.
- Display consumed and remaining calories/macros.
- Explain nutritional values when the user explicitly opens an explanation or asks for it.
- Display neutral status information, not food recommendations.

Never show “You should eat…”, “Try…”, “Recommended next meal”, “Foods to reach your protein goal”, or similar recommendation UI.

### Rule B — Record what I train. Do not decide how I train.
The application must **not**:
- Create or recommend a gym plan.
- Change the user's workout split or training days.
- Suggest exercises, sets, reps, weights, or additional sessions.
- Suggest workout substitutions.
- Automatically adjust the user's resistance-training routine.

The application may:
- Record workouts and cardio sessions reported by the user.
- Track duration, session type, notes, and optional performance details.
- Display historical records and summaries.
- Calculate a clearly labelled approximate cardio energy expenditure only when sufficient user-provided information and a transparent calculation method are available.
- Discuss or suggest cardio changes only after the user explicitly requests cardio advice.

Do not add an exercise library, workout generator, training calendar planner, or coaching recommendations.

### Rule C — This is a tracker, not a coach
The app is an accounting and measurement tool. It can be firm and factual about recorded data, targets and missing logs, but must not shame the user, encourage restriction, or prescribe compensatory exercise.

If calorie targets are exceeded, show the actual difference neutrally. Never advise skipping meals, fasting as punishment, or exercising to “burn it off”.

---

# 1. CURRENT WORKSPACE — PRESERVE AND EXTEND

The audited project is a dependency-free, offline-first PWA using vanilla JavaScript ES modules, CSS, HTML and Node's built-in tooling.

The audited structure is:

```text
C TRACKER/
├── dist/                       # generated production copy; currently reported stale
├── outputs/                    # empty auxiliary directory
├── scripts/
│   ├── build.mjs
│   └── server.mjs
├── src/
│   ├── food-estimator.js
│   ├── main.js
│   ├── store.js
│   └── style.css
├── tests/
│   └── store.test.js
├── work/                       # empty scratch directory
├── icon.svg
├── index.html
├── manifest.webmanifest
├── package.json
├── README.md
└── sw.js
```

The current audited architecture:
- Vanilla JavaScript ES modules (ES2022+).
- No frontend framework.
- No backend, cloud database, authentication or third-party API.
- `localStorage` key: `lean-mode-data`.
- Existing domain functions include BMR/TDEE calculations, nutrition aggregation, date handling and streak calculation.
- Existing Indian-food heuristic estimator recognises approximately 37 food entries.
- Existing UI views: Today, Food, Profile, Progress, Workouts and Data.
- Existing PWA manifest and service worker.
- Existing Node test runner tests.
- Existing scripts: `npm run start`, `npm run test`, `npm run build`, `npm run preview`.

## Preserve these strengths
1. Keep the zero-dependency vanilla JS architecture unless a specific requirement cannot reasonably be met without a dependency.
2. Preserve the existing visual identity and editorial athletic design.
3. Preserve the privacy-first, local-first approach.
4. Preserve the existing food estimator and extend it rather than replacing it.
5. Preserve the existing `lean-mode-data` records through backward-compatible migration.
6. Preserve the current app navigation and working features unless a usability improvement requires a carefully tested change.
7. Preserve the PWA approach and prepare a clean Capacitor path for a future Android APK.

## Audit findings to explicitly address
The two audits identify these known issues or gaps:
- `dist/` is stale relative to `src/`; rebuild it after implementation.
- Milk amount input may lose focus because the DOM is re-rendered during typing.
- Existing photo event-handler code is dead/orphaned; there is no working photo picker or analysis.
- Unknown/custom foods cannot currently be logged through the estimator.
- Free-form manual nutrition entry is missing.
- JSON import UI says “replace” but current behavior merges data.
- Food editing/deletion exists; test it end-to-end.
- Measurement and workout records can be deleted but may not be editable.
- PWA installation, cache refresh and offline behavior have not been fully tested.
- No `.git` repository was found during the audits.
- `localStorage` has a small quota and is unsuitable for storing many image files.
- No Android/Capacitor project has been initialized.

Verify each finding in the current code before changing it.

---

# 2. USER PROFILE AND DEFAULT ONBOARDING

The app is for one user's personal use. Provide an editable profile page and initialize the following values as **prefilled, user-confirmable defaults**, not immutable facts:

| Field | Initial value |
|---|---:|
| Age | 20 years |
| Sex | Male |
| Height | 178 cm |
| Weight | 80 kg |
| Estimated body-fat range | 25–30% (unverified, informational only) |
| Lower waist / abdominal measurement | 92 cm |
| Upper abdominal measurement | 85 cm |
| Weigh-in cadence | Weekly |
| Primary food environment | College mess |
| Dietary pattern | Eats both vegetarian and non-vegetarian foods |
| Food restrictions | None reported |
| Allergies | None reported |

Important:
- Do not treat the estimated body-fat percentage as a clinically measured value.
- Do not infer a target weight. The user has no target weight set.
- Do not set a target body-fat percentage unless the user enters one.
- Do not assume a fixed daily routine or meal times.
- The user will log meals and activity as they happen.
- Allow profile values to be edited at any time.
- Clearly distinguish profile inputs from calculated values.

## BMR and TDEE
Use the Mifflin–St Jeor equation:

For male:
`BMR = 10 × weightKg + 6.25 × heightCm − 5 × age + 5`

For female:
`BMR = 10 × weightKg + 6.25 × heightCm − 5 × age − 161`

Use the selected sex input and validate all required values.

For initial profile values (male, 20 years, 178 cm, 80 kg), BMR should calculate to approximately **1,783 kcal/day**.

TDEE should use a user-selected activity multiplier, clearly labelled as an estimate. Existing activity factors may be retained if they are already present. Do not add exercise calories to TDEE again if the activity multiplier already accounts for exercise; explain the selected method in the UI.

Provide:
- Calculated BMR.
- Estimated TDEE.
- User-editable daily calorie target.
- Optional macro targets.
- Clear indication whether the calorie target is calculated, manually entered or unset.

Do not silently set a fat-loss target from an unverified activity estimate. If a default calorie deficit is calculated, show it as a proposed starting calculation requiring user confirmation. The app must not recommend foods or meals.

Allow the user to choose a calorie target manually. Validate that it is a plausible positive value and show a non-alarmist safety notice if an entered target is unusually low. Do not silently overwrite it.

---

# 3. PRODUCT SCOPE AND NAVIGATION

Build a polished responsive web app with these primary sections:

1. **Today** — daily calorie and macro dashboard.
2. **Food Log** — add, view, edit and delete food entries.
3. **Progress** — weekly summaries, weight and waist history.
4. **Activity** — records of gym and cardio sessions only.
5. **Profile** — body details, BMR, TDEE and targets.
6. **Data & Settings** — backup, restore, export, storage and app settings.

You may retain the existing labels and navigation if they are already clear. On mobile, use a compact bottom navigation with safe-area support. On wider screens, use a centered app shell with the existing visual character.

Do not add a “Meal Planner”, “Coach”, “Workout Plan”, “Recommended Foods” or “AI Diet” section.

---

# 4. VISUAL DESIGN AND UX REQUIREMENTS

Preserve and refine the existing “Brutalist Paper” / editorial athletic visual identity.

Existing audited palette:
- Ink / primary dark: `#0d1712`
- Paper / background: `#f5f4ed`
- Soft surface: `#e7e7dd`
- Accent lime: `#c9f25b`
- Borders: `#d8d9d1`
- Cards: `#fffefa`
- Danger: `#b8392f`

Existing typography:
- Manrope for primary UI/headings.
- DM Mono for numeric metrics, dates and labels.

The app should feel premium, minimal, precise and data-oriented — not like a generic template dashboard.

Requirements:
- Mobile-first layout.
- Comfortable tap targets.
- Clear visual hierarchy.
- Legible numeric values.
- Responsive desktop layout.
- Keyboard-accessible controls.
- Visible focus states.
- Accessible labels and error messages.
- Semantic HTML.
- Empty states that explain how to add a record, without recommending food or exercise.
- Loading and success/error feedback where needed.
- Confirmation before destructive operations.
- No dead buttons or decorative controls pretending to work.
- Avoid excessive animation; respect reduced-motion preferences.
- Use safe-area insets on mobile.
- Do not let input fields lose focus or clear while typing.

Do not redesign needlessly if the existing design already meets these requirements. Improve consistency and usability while preserving its identity.

---

# 5. TODAY DASHBOARD

Build a useful daily view with date navigation and a clear summary.

Display:
- Selected date.
- Daily calorie target.
- Calories consumed.
- Calories remaining, or calories over target.
- Percentage of target consumed.
- Protein consumed / target / remaining.
- Carbohydrates consumed / target / remaining.
- Fat consumed / target / remaining.
- Fibre consumed / target / remaining.
- Number of food entries logged.
- Food log entries grouped by meal or time where available.
- Daily tracking status.

Use accurate arithmetic:
`remaining = target - consumed`

If remaining is negative, label the result as “over target”; do not show a misleading positive remainder.

If a macro target is unset, show “Target not set” rather than inventing a value.

Allow the user to navigate to previous and next dates. Historical dates must show historical records and must not accidentally write into today's log.

The dashboard must not contain meal suggestions or food recommendations.

---

# 6. FOOD LOGGING — CORE FEATURE

This is the most important area of the app.

The user can log food by:
1. Natural-language text, e.g. “2 dosas, one bowl sambar and chutney”.
2. Selecting a known item from the local Indian-food estimator.
3. Creating a custom food.
4. Manually entering calories and macros.
5. Attaching a photo to a food entry as a visual reference.

## 6.1 Natural-language estimator
Extend the existing `src/food-estimator.js` rather than replacing it.

Requirements:
- Retain the current known-food catalogue and parsing logic.
- Add common Indian foods only when useful and with sensible default serving assumptions.
- Keep portion parsing transparent.
- Avoid double-counting overlapping food-name matches.
- Support decimal quantities where reasonable.
- Support quantity units such as pieces, bowls, cups, plates, grams and millilitres only when the estimator has a defensible baseline for that unit.
- Do not imply that “one bowl” has a universally exact weight.
- Make serving assumptions visible and editable.
- Retain support for milk volume scaling and fix the reported input-focus issue.
- Never silently interpret an unknown food as zero calories.

Every estimate must be labelled **Estimated**. Show the recognised items and the serving assumptions before saving.

## 6.2 Custom food fallback
If a food is not recognised:
- Do not reject the entry.
- Offer a manual nutrition entry form.
- Let the user enter a food name, portion description, calories, protein, carbohydrates, fat and fibre.
- Permit saving it as a reusable custom food.
- Validate non-negative numeric values.
- Do not fill missing values with fabricated numbers. Allow the user to leave optional macros blank and show them as unavailable.
- If calories and macros conflict significantly, show a gentle validation warning, but allow the user to save after review.
- Preserve the source type: `estimate`, `manual` or `custom`.

## 6.3 Food entry data
Each entry should support:
- Unique ID.
- Date.
- Optional time.
- Food name / description.
- Meal label (optional; user-selected, not AI-assigned).
- Portion text.
- Calories.
- Protein.
- Carbohydrates.
- Fat.
- Fibre.
- Source (`estimate`, `manual`, `custom`).
- Estimator item breakdown where applicable.
- Optional photo attachment ID(s).
- Created and updated timestamps.

Support:
- Add.
- View.
- Edit.
- Delete.
- Duplicate an entry only through an explicit user action.
- Correct the date.
- Correct nutrition values.
- Avoid duplicate insertion during edit.
- Recalculate dashboard totals after every mutation.

Do not assume a meal was skipped if no entry exists.

## 6.4 Photo attachments
Implement photo attachment as a **local visual record**, not automatic AI calorie analysis.

Requirements:
- Allow image selection from the device gallery or camera where the browser supports it.
- Show preview, filename and attachment status.
- Allow removing/replacing the attachment.
- Associate images with a food entry.
- Compress/resize large images client-side when practical, without making the image unreadable.
- Store image blobs in IndexedDB, not localStorage.
- Store only attachment IDs and metadata in the main JSON state.
- Handle unsupported formats and oversized images with clear errors.
- Do not upload images anywhere.
- Do not claim that image recognition or AI calorie estimation exists.
- The user must still enter food details and nutrition values through text estimation or manual entry.
- Ensure the app remains usable if image storage fails.

Provide a clear privacy note: photos remain on this device unless the user exports or moves them.

---

# 7. NUTRITION ACCOUNTING

Track these fields:
- Calories (kcal).
- Protein (g).
- Carbohydrates (g).
- Fat (g).
- Fibre (g).

Optional future fields may include sodium and sugar, but do not delay core functionality. If added, make them optional and clearly distinguish missing from zero.

Requirements:
- Daily totals derived from saved entries; do not store independently duplicated totals unless there is a clear consistency mechanism.
- Correct aggregation for historical dates.
- Avoid floating-point display noise; store reasonable numeric precision and format display values consistently.
- Do not count a meal twice.
- Editing must replace the old values in the totals.
- Deleting must subtract the removed entry from totals.
- Entries with missing optional macro values must not be treated as confirmed zero in detailed views.
- Clearly show estimate/manual provenance.
- Do not add exercise calories back into the food budget automatically.
- Do not create a “net calories” number unless the user explicitly enables or requests that calculation and the method is explained.

No food recommendations, meal suggestions or automatic diet planning.

---

# 8. ACTIVITY LOG — RECORDING ONLY

The Activity section is for logging what the user actually did.

Allow records for:
- Gym / resistance training.
- Cardio.
- Other activity.

Fields may include:
- Date.
- Activity type.
- User-entered title.
- Duration in minutes.
- Optional notes.
- Optional distance.
- Optional treadmill speed and units.
- Optional incline.
- Optional heart rate.
- Optional user-entered sets/reps/weights as notes or structured fields, if the user chooses to record them.

Do not pre-populate exercises or generate a training plan.

Do not show exercise recommendations or workout suggestions.

Support add, edit and delete.

## Cardio energy estimate
Only calculate estimated cardio calories if the user supplies sufficient relevant data and a defensible method can be used. Show:
- Estimated value.
- Method or assumptions.
- Confidence/limitations.
- Clear “estimate, not measurement” wording.

Do not automatically deduct cardio calories from the daily food target or add them to remaining calories.

Do not suggest changes to the cardio routine unless the user explicitly requests cardio guidance.

Do not create an exercise prescription or suggest resistance-training modifications.

---

# 9. BODY MEASUREMENTS AND WEIGHT

Create a measurement history.

Support:
- Weight in kg.
- Lower waist / abdominal circumference in cm.
- Upper abdomen circumference in cm.
- Date.
- Optional notes.

Initial profile values should be available as editable baseline records, but avoid creating duplicate measurement entries if the user already has them.

The user prefers weekly weigh-ins. The app may display a weekly reminder or a neutral “weekly check-in due” status, but must not require daily weigh-ins.

Requirements:
- Add, edit and delete measurement records.
- Sort chronologically.
- Show latest value and change from the previous recorded value.
- Display trends over time.
- Use consistent units.
- Never infer a measurement from a photograph.
- Do not set a target weight automatically.
- Do not claim that a waist change proves a precise amount of fat loss.
- Distinguish measurement fluctuation from a confirmed trend.

If charts are included, make them responsive and accessible. Use native CSS/SVG charts if practical; avoid adding a heavy chart library.

---

# 10. STREAKS AND ACCOUNTABILITY

Track consistency without encouraging unhealthy behavior.

Define the primary daily streak as **food logging completed for the day**, not calorie-target compliance.

A day counts as logged when at least one food entry is saved and the user explicitly marks the day complete, or another clearly documented rule is used. Prefer a transparent “Complete day” action so accidental partial logging is not misrepresented.

Also track:
- Current logging streak.
- Longest logging streak.
- Days logged in the current month.
- Weekly logging consistency.
- Missing/incomplete days.

Do not make exceeding calories break the streak. A calorie target is a tracking reference, not a moral score.

Do not require a workout every day. Planned rest days must not be treated as failures.

Avoid punitive messages, shame language, or “you failed” messaging. Use factual statuses such as “Not completed”, “Partially logged” or “Complete”.

Make the streak calculation timezone-safe and test date boundaries.

---

# 11. WEEKLY REPORTS AND ANALYTICS

Provide a weekly report based only on recorded data.

Include:
- Date range.
- Days with food logs.
- Logging consistency.
- Average calories on days with sufficient logs.
- Average protein on days with sufficient logs.
- Macro averages where targets/data exist.
- Number of workout/cardio records.
- Total logged activity duration.
- Latest weight and change from previous measurement.
- Latest waist measurements and change from previous measurement.
- Daily calorie chart for the seven-day period.
- Data completeness warnings.

Important reporting rules:
- Do not treat days without food logs as zero-calorie days.
- Clearly state how many days contributed to each average.
- Do not infer an exact calorie deficit unless a usable TDEE estimate and sufficiently complete food logs are available.
- If estimating weekly energy balance, show assumptions and uncertainty.
- Do not make meal recommendations.
- Do not recommend workout changes.
- Do not automatically alter calorie targets.
- If the user explicitly asks for an analysis or target adjustment, show the evidence and let the user confirm changes.

Provide a weekly report view and a way to export the report as CSV or printable page.

---

# 12. DATA MODEL, STORAGE AND MIGRATION

The existing app uses:
- localStorage key: `lean-mode-data`
- schema version: `1`
- arrays for `entries`, `measurements`, and `workouts`
- profile object with age, sex, height, weight, activity, calorie target and macro targets.

Preserve all existing user data.

## 12.1 Storage strategy
Keep small structured records in localStorage initially if that is the simplest safe extension, but use IndexedDB for photo blobs and any larger binary content.

Do not store photos as base64 in localStorage.

Create a clear storage abstraction so the UI does not directly manipulate storage internals.

## 12.2 Schema migration
Introduce an explicit schema version and migration path.

Requirements:
- Read schema v1.
- Migrate v1 data to the new schema without data loss.
- Preserve existing IDs and dates wherever possible.
- Preserve the existing `lean-mode-data` key or provide a safe one-time migration from it.
- Validate imported records.
- Never silently discard malformed records; report what was skipped and why.
- Keep migration functions separately testable.
- Make migration idempotent.

## 12.3 Import/export
Correct the existing mismatch between “replace” UI and merge behavior.

Provide two explicit actions:
1. **Restore / Replace from backup** — after confirmation, replace current structured data with validated backup data.
2. **Import / Merge backup** — merge records using IDs and duplicate detection, with a clear preview of how many records will be added, skipped or updated.

Never merge and replace under the same button label.

Before replace:
- Show a destructive confirmation.
- Recommend exporting a backup first.
- Validate the file before changing current data.
- If validation fails, leave existing data untouched.

Export:
- Full JSON backup containing profile, entries, measurements, workouts, streak-related state and schema version.
- CSV export for food entries.
- CSV export for activity records.
- CSV export for measurements.
- Use correct escaping for commas, quotes and newlines.
- Include export timestamp and schema version.

Photo backup:
- Because photos live in IndexedDB, provide an explicit choice to include or exclude attachments in a full backup.
- If included, serialize them safely (for example, base64 within an export archive/JSON with a clear size warning).
- If excluded, clearly state that image files are not part of the backup.
- Do not silently omit attachments while claiming a complete backup.
- If a robust attachment export is not feasible without adding a dependency, implement a separate “Export photos” workflow or clearly document the limitation rather than pretending it works.

## 12.4 Storage error handling
Handle:
- localStorage unavailable.
- QuotaExceededError.
- IndexedDB unavailable.
- IndexedDB transaction failures.
- Corrupt JSON.
- Invalid backup schema.
- Missing attachment records.

Show actionable but non-destructive error messages. Never clear data automatically to recover from storage errors.

---

# 13. PWA AND OFFLINE REQUIREMENTS

Preserve and improve:
- `manifest.webmanifest`
- `sw.js`
- `icon.svg`
- service-worker registration.

Requirements:
- App shell loads offline after first successful visit.
- Core JS/CSS/HTML and icons are cached.
- Cache version changes when relevant assets change.
- Old caches are cleaned up safely.
- Avoid permanently serving stale HTML or JS after an update.
- Provide a visible update/reload path when a new service worker is waiting.
- Do not cache sensitive API responses; there should be no remote API in this scope.
- Test offline reload after installation/cache population.
- Ensure manifest icons and metadata are valid.
- Verify installability in supported browsers.

Google Fonts are currently network-hosted. Decide whether to retain the existing graceful fallback or bundle fonts locally; do not make offline app startup depend on Google Fonts.

---

# 14. ANDROID APK READINESS — FUTURE PHASE

The immediate deliverable is a working web application. Do not let Android packaging destabilize the web app.

Prepare for Capacitor:
- Keep a clean `dist/` build directory.
- Ensure relative asset paths work inside an Android WebView.
- Avoid hardcoded localhost URLs.
- Keep browser APIs behind small abstractions where native plugins may later be used.
- Ensure safe-area layout works.
- Keep image attachment storage compatible with a future Capacitor filesystem/SQLite migration if needed.
- Document the future Capacitor commands in README.

Do not install Android SDKs or generate a signed APK unless the workspace already has the necessary environment and the user explicitly requests APK creation. The current task is to make the web app APK-ready and document the next steps.

Future intended path:
1. Build web assets into `dist/`.
2. Install Capacitor packages.
3. Initialize Capacitor with `dist` as webDir.
4. Add Android platform.
5. Sync.
6. Open Android project in Android Studio.
7. Build and test APK on the user's phone.

Do not invent package IDs. Use a clear placeholder in documentation and ask the user to choose a final application ID before release.

---

# 15. RELIABILITY, SECURITY AND ACCESSIBILITY

Implement:
- Input validation at every data boundary.
- Safe rendering of user-entered text; avoid unsafe HTML injection.
- No `eval`.
- No external tracking or analytics.
- No hidden data upload.
- No credentials or API keys.
- Confirmation for destructive actions.
- Accessible dialogs/modals.
- Keyboard operation.
- Visible focus indicators.
- Labels for all inputs.
- Appropriate input types and units.
- Responsive behavior at narrow phone widths and desktop widths.
- Reduced-motion support.
- Clear error messages.
- Safe fallback if browser storage APIs are unavailable.

Treat imported JSON and filenames as untrusted input.

Use `textContent` or safe DOM APIs for user-generated text wherever practical. If template strings are retained, escape user-controlled content correctly.

---

# 16. TESTING REQUIREMENTS

Expand the existing `node:test` test suite. Keep tests dependency-free unless there is a compelling reason otherwise.

At minimum, test:

## Domain calculations
- Male BMR.
- Female BMR.
- Invalid or missing profile values.
- TDEE activity factors.
- Daily target handling.
- Nutrition aggregation.
- Missing macro values.
- Decimal quantities.
- Indian-food estimator matches.
- Unknown-food fallback.
- Milk quantity scaling.
- Portion scaling.
- No duplicate food matches.

## Records
- Add food record.
- Edit food record without duplicate insertion.
- Delete food record.
- Date-specific totals.
- Add/edit/delete measurements.
- Add/edit/delete activity records.
- Date navigation calculations.

## Streaks and weekly reports
- Consecutive logged days.
- Missing day breaks.
- Timezone/date boundary behavior.
- Rest days do not affect food logging streak.
- Days without food logs are not treated as zero intake.
- Weekly averages use only valid logged days.

## Persistence and migration
- Load blank data.
- Save and reload.
- Migrate schema v1.
- Preserve existing records and IDs.
- Corrupt storage recovery without data loss.
- JSON validation.
- Replace restore behavior.
- Merge behavior and duplicate handling.
- CSV escaping.

## Build and PWA
- Build script completes.
- `dist/` contains current source assets.
- Manifest is valid JSON.
- Service worker references current asset paths.
- Cache version is updated when needed.

If browser end-to-end automation is not already installed, do not add a heavy dependency just for the sake of it. Instead, provide a manual QA checklist and test pure business logic automatically.

Do not claim visual, camera, PWA or offline behavior passed unless actually tested in a browser/device.

---

# 17. DEVELOPMENT PROCESS — EXECUTE IN THIS ORDER

Follow this sequence in one coordinated implementation pass.

## Phase 0 — Inspect and protect
1. Inspect the current workspace and source files.
2. Check whether the user has existing local data or backup fixtures.
3. Confirm the current schema and key.
4. Check `package.json`, scripts and tests.
5. Check whether Git is available.
6. Do not overwrite or delete existing user data.
7. If Git is available and no repository exists, consider initializing version control only if safe and appropriate; do not stage secrets or personal data. If uncertain, leave Git setup documented as a user action.

## Phase 1 — Stabilize existing application
1. Fix the milk amount input focus/re-render issue.
2. Remove or repair dead photo event-handler code.
3. Verify food editing and deletion.
4. Correct JSON import labels and behavior.
5. Fix stale production output by rebuilding `dist/`.
6. Verify the local server and scripts.

## Phase 2 — Data architecture
1. Introduce schema versioning.
2. Add safe v1 migration.
3. Add storage abstraction.
4. Add IndexedDB attachment storage.
5. Preserve existing records.
6. Add tests for migration and storage behavior.

## Phase 3 — Food logging
1. Improve estimator UX and transparent assumptions.
2. Add unknown/custom food fallback.
3. Add manual nutrition entry.
4. Add reusable custom foods.
5. Add food photo attachment as local reference only.
6. Add robust edit/delete behavior.
7. Ensure all totals recalculate correctly.

## Phase 4 — Tracking dashboards
1. Refine Today dashboard.
2. Improve macro and fibre accounting.
3. Add measurement editing and trends.
4. Add activity record editing.
5. Improve streak logic.
6. Add weekly reports and data completeness indicators.

## Phase 5 — Data portability and PWA
1. Implement explicit replace and merge backup flows.
2. Add CSV exports for food, measurements and activity.
3. Handle attachment backup transparently.
4. Update service-worker cache strategy and version.
5. Verify manifest and PWA asset paths.
6. Rebuild `dist/`.

## Phase 6 — QA and documentation
1. Run all unit tests.
2. Run production build.
3. Run the local app and test core flows if the environment permits.
4. Inspect browser console if browser tooling is available.
5. Verify responsive layout if browser tooling is available.
6. Document untested items honestly.
7. Update README with startup, test, build, backup and future APK instructions.

---

# 18. ACCEPTANCE CRITERIA — DEFINITION OF DONE

The task is complete only when all applicable criteria below are satisfied.

## Core app
- [ ] Existing app still runs.
- [ ] Existing visual identity is preserved.
- [ ] Mobile-first layout works at phone width.
- [ ] Desktop layout remains usable.
- [ ] Navigation works.
- [ ] No dead buttons or placeholder controls remain in the delivered scope.

## Food tracking
- [ ] User can log a recognized Indian food description.
- [ ] Estimates show assumptions and are labelled as estimates.
- [ ] User can log an unknown food manually.
- [ ] User can save reusable custom foods.
- [ ] User can attach a local photo to a food entry.
- [ ] User can edit and delete food entries.
- [ ] Totals update correctly after add/edit/delete.
- [ ] No unsolicited food recommendation UI exists.

## Nutrition dashboard
- [ ] Calories and remaining/over values are correct.
- [ ] Protein, carbs, fats and fibre totals are correct.
- [ ] Unset targets are shown as unset.
- [ ] Historical dates show the correct records.
- [ ] No exercise calories are silently added to food allowance.

## Progress and activity
- [ ] User can add/edit/delete weight and waist records.
- [ ] User can add/edit/delete activity records.
- [ ] Activity section only records activity; it does not prescribe workouts.
- [ ] Weekly reports distinguish missing data from zero.
- [ ] Streak logic is tested and transparent.

## Data safety
- [ ] Existing schema v1 data migrates without loss.
- [ ] JSON replace restore works as labelled.
- [ ] JSON merge works as labelled.
- [ ] Invalid imports leave current data untouched.
- [ ] CSV exports are correctly escaped.
- [ ] Photo attachment limitations are clear.
- [ ] Storage errors do not cause automatic data deletion.

## PWA/build
- [ ] `npm test` passes.
- [ ] `npm run build` succeeds.
- [ ] `dist/` matches current source.
- [ ] `npm run start` works.
- [ ] `npm run preview` serves current production build.
- [ ] Manifest and service-worker paths are valid.
- [ ] Offline and install behavior are tested if browser tooling permits.
- [ ] README documents future Capacitor packaging.

## User-boundary compliance
- [ ] No meal plans.
- [ ] No food suggestions.
- [ ] No “what to eat next” prompts.
- [ ] No gym-plan modifications.
- [ ] No exercise prescriptions.
- [ ] Cardio advice is only surfaced after an explicit request.
- [ ] The app records what the user chooses to eat and do.

---

# 19. FINAL RESPONSE REQUIRED FROM THE CODING AGENT

When implementation is finished, provide a detailed completion report:

1. **Summary** — what was built.
2. **Files changed** — exact paths and purpose.
3. **Features implemented** — with status.
4. **Data migration** — how existing v1 data is preserved.
5. **Storage design** — localStorage and IndexedDB responsibilities.
6. **Tests executed** — exact commands and pass/fail results.
7. **Build result** — whether `dist/` was rebuilt successfully.
8. **How to run** — exact local commands and URL.
9. **Manual QA checklist** — anything that still needs a real browser/device check.
10. **Known limitations** — especially photo analysis, browser storage and offline behavior.
11. **APK readiness** — what is prepared and what remains for Capacitor/Android Studio.
12. **Next actions for the user** — only concrete actions required to run or verify the app.

Do not claim a feature is complete if it is only a UI mockup.

Do not claim tests passed unless they were actually run.

Do not claim camera/photo AI analysis exists. Photo support in this build is local attachment only.

Do not silently replace the user's existing data.

---

# 20. FINAL PRODUCT PRINCIPLE

LEAN MODE is a personal measurement and accounting system.

**Track what I eat. Do not decide what I eat.**  
**Record what I train. Do not decide how I train.**

Show the numbers. Preserve the history. Make estimates transparent. Keep the data under the user's control.

Implement the complete web application now, using the existing workspace as the foundation.
