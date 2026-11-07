# LEAN MODE — Muscle Heatmap & Recovery Tracker
## Feature Understanding, Development Roadmap & Phase-by-Phase Control Protocol

**Purpose:** Give the existing IDE coding agent a clear understanding of the feature and a controlled roadmap. This is deliberately **not an implementation prompt**. The agent must not modify code, install packages, change schemas, generate assets, or begin development until the user explicitly authorizes a specific phase.

---

# Part 1 — Feature understanding only

## 1. Project context

LEAN MODE is an existing privacy-focused, offline-first personal calorie, nutrition and training tracker. It is implemented as a mobile-first web app using vanilla HTML, CSS and JavaScript ES modules, and it has been packaged for Android using Capacitor.

The new feature belongs **inside the existing Training section**. It is an extension of the current training-session logging experience, not a separate application.

The IDE agent must inspect the current workspace before making assumptions about file paths, schema versions, implementation details or installed dependencies.

## 2. Feature summary

The proposed feature is a **Muscle Heatmap & Recovery Tracker**.

When recording a training session, the user should be able to:
- Add multiple exercises.
- Record individual sets for each exercise.
- Enter repetitions completed in each set.
- Optionally enter the weight used for each set.
- Optionally record effort information.
- Associate exercises with the muscles the user says were involved.
- Correct muscle attribution when an exercise mapping is inaccurate.
- Track left and right sides independently where relevant.

LEAN MODE then displays a colour-coded anatomical heatmap showing which muscle groups were logged as trained.

The feature also includes estimated recovery information, a training calendar with daily heatmap previews, and transparent PNG export.

## 3. Anatomical views

The heatmap must support four views:

1. Front / anterior
2. Back / posterior
3. Left lateral
4. Right lateral

The intended visual is an anatomical muscular illustration with separately selectable and colourable muscle regions. A generic silhouette with no individually addressable muscle regions is not sufficient.

The user should be able to inspect a muscle and see the recorded information behind its displayed colour, including relevant set counts and session details.

## 4. Heatmap colours and meaning

The heatmap uses exactly five visual states:

| Colour | User-facing label | Meaning |
|---|---|---|
| Dark purple | Elite training | Highest configured logged-set band |
| Red | Good training | Higher configured logged-set band |
| Orange | Moderate training | Middle configured logged-set band |
| Yellow | Minimal training | Lowest non-zero configured logged-set band |
| Grey | No training recorded | No applicable training record for the selected date/range |

Suggested starting colours:
- Dark purple: `#51406F`
- Red: `#D83B43`
- Orange: `#E98A32`
- Yellow: `#E8C84A`
- Grey: `#A7A9A5`

The heatmap is intended to show **logged sets and the user's explicit inputs**. The user wants a simple five-colour heatmap, not separate workload and set-count modes.

Set-count thresholds should be configurable and documented. The colours and labels are the user's visual classification system; they must not be presented as scientific ratings, proof of muscle activation, or an assessment of athletic ability.

The app must not silently count every secondary muscle as if it received the same full set as the primary muscle. Exercise-to-muscle mappings must be transparent, editable and correctable by the user. If attribution is uncertain, let the user correct it rather than inventing certainty.

## 5. Exercise and set recording

Each training session may contain multiple exercises. Each exercise may contain multiple individually recorded sets.

A set can include:
- Repetitions.
- Optional weight.
- Optional effort information.

Users must be able to add, edit and delete exercises and sets. Bodyweight exercises and sets without a weight value must be supported. Blank optional values must remain blank rather than being silently converted to zero.

Support a searchable exercise library and user-created custom exercises. A custom exercise should allow the user to define its muscle mapping.

Left and right muscle involvement should be independently representable. Bilateral exercises may affect both sides, but the data model must not erase an explicitly recorded difference between sides.

## 6. Recovery tracking

The feature should show **estimated recovery**, not claim to measure actual biological recovery.

Sets and reps alone cannot establish exactly when a muscle is physiologically recovered. The recovery display must clearly identify itself as an estimate and explain that it is based on recorded training information and configurable assumptions.

Intended capabilities:
- Display estimated recovery status for relevant muscle groups.
- Show the estimate and its assumptions clearly.
- Allow the user to manually mark a muscle as recovered or still recovering.
- Allow return to the automatic estimate.
- Recalculate estimates when relevant sessions are added, edited or deleted.

Recovery must never be used to recommend what the user should train next. No workout scheduling, exercise prescriptions or training-plan generation should be added.

Local notifications may be considered for estimated recovery-window completion. They must be optional, user-controlled, neutral in wording and compatible with offline operation. Do not request notification permission without user consent.

## 7. Training calendar

Include a calendar showing daily training activity. Each date can display a small heatmap thumbnail. Selecting a date should open the training records and corresponding heatmap for that date.

The calendar must distinguish a day with no training record from a day explicitly marked as rest, if explicit rest-day marking is implemented. An unlogged date must not automatically be treated as a rest day.

Multiple sessions on one date should be supported, with a combined daily heatmap available.

## 8. Transparent PNG export

The initial export requirement is **transparent anatomy PNG only**.

The export should:
- Include the four anatomical views.
- Preserve the five heatmap colours.
- Have a genuinely transparent background.
- Include a clear legend.
- Optionally include date, muscle labels and LEAN MODE branding.
- Be generated locally without capturing the application UI.
- Support web download and an appropriate Android save/share flow.

A saved PNG gallery is optional and is **not part of the initial required scope**. Do not build it unless the user authorizes it later.

## 9. Non-negotiable product boundaries

LEAN MODE is a tracker, not a coach.

The feature must never:
- Recommend which muscles to train.
- Recommend exercises.
- Suggest workout splits or training days.
- Generate workout routines.
- Prescribe sets, reps or weights.
- Tell the user what to train next.
- Automatically create training sessions.
- Shame the user for low activity, missed sessions or training choices.

It must only record, organize, calculate transparent estimates from, and visualize information the user provides.

## 10. Technical constraints

Preserve the existing project unless inspection proves a change is necessary and the user approves it.

Expected constraints:
- Vanilla HTML, CSS and JavaScript ES modules.
- Existing zero-dependency approach wherever practical.
- Existing local-first storage architecture.
- Existing IndexedDB usage where applicable.
- Existing Capacitor Android packaging.
- Existing PWA/offline behaviour.
- Existing design system and navigation.
- Existing food, calorie, measurement and workout functionality.
- Existing backup/import/export compatibility.

Do not add a backend, cloud account, analytics service or external image dependency for this feature.

Do not install packages, change the schema, edit files or generate assets during the understanding-only stage.

---

# Part 2 — Proposed development roadmap

These phases are proposed. The IDE agent must inspect the actual project and may identify dependencies or risks that require a revised proposal. It must explain any proposed change and wait for user approval.

## Phase 0 — Workspace inspection and feature impact report

**Purpose:** Understand the current implementation and identify exactly where the feature belongs.

Inspect:
- Project structure and package configuration.
- Existing Training section and session form.
- Existing workout/session data model.
- Current schema version and migration approach.
- Store and persistence modules.
- Existing IndexedDB implementation.
- Existing navigation and UI patterns.
- Existing PWA/service-worker configuration.
- Capacitor configuration and Android project.
- Existing tests and build scripts.
- Backup/import/export implementation.

Deliverables:
- Summary of current architecture relevant to this feature.
- Existing training data structure.
- Proposed data structure additions.
- Exact files likely to be created or modified.
- Data migration and backup compatibility risks.
- SVG anatomy asset strategy.
- Recovery estimation approach requiring user approval.
- Notification feasibility and platform constraints.
- Test strategy.
- Revised phase-by-phase plan, if necessary.

**No code or configuration changes are allowed in Phase 0.**

## Phase 1 — Training data model and session-entry experience

**Purpose:** Make training records capable of storing exercises and individual sets reliably.

Proposed scope:
- Multiple exercises per session.
- Individual sets per exercise.
- Repetitions per set.
- Optional weight per set.
- Optional effort information.
- Add/edit/delete exercises and sets.
- Built-in and custom exercise records.
- Editable primary/secondary muscle mapping.
- Left/right/bilateral attribution.
- Stable IDs and safe schema migration.
- Preservation of existing workout records.
- Backup/import/export compatibility.

Acceptance checks:
- Existing workout records remain intact.
- A session can contain multiple exercises.
- Each exercise can contain multiple individually editable sets.
- Blank optional weight remains blank.
- Custom exercises persist.
- Muscle mappings can be corrected.
- Left and right sides can be represented independently.
- Tests cover the new data model and migration.

## Phase 2 — Four-view anatomical heatmap

**Purpose:** Display logged training information visually.

Proposed scope:
- Front, back, left and right anatomical SVG views.
- Individually identifiable muscle regions.
- Responsive touch and mouse interaction.
- Five heatmap colours.
- Configurable set-count thresholds.
- Correct muscle attribution from session records.
- Muscle detail interaction showing underlying logged sets.
- Manual correction of attribution where needed.
- Daily and selected-date heatmap rendering.

Acceptance checks:
- All four views render correctly.
- Muscle regions are individually selectable.
- Colour changes reflect configured set-count bands.
- Grey means no applicable training record.
- Displayed set count can be inspected.
- Primary and secondary attribution is transparent.
- Left/right differences are visible.
- No workout recommendations are introduced.

## Phase 3 — Estimated recovery system

**Purpose:** Display clear, non-prescriptive recovery estimates.

Proposed scope:
- Documented recovery assumptions and calculation.
- Per-muscle estimated recovery state.
- Last relevant training record.
- Estimated completion time.
- Manual recovered/still-recovering override.
- Return-to-automatic option.
- Recalculation after session creation, editing and deletion.
- Clear explanation that estimates are not physiological measurements.

Acceptance checks:
- Estimates are reproducible and tested.
- Assumptions are visible and documented.
- Manual overrides behave predictably.
- Editing/deleting sessions updates affected estimates.
- The UI never presents estimates as guaranteed recovery.
- No training advice or next-workout recommendations appear.

## Phase 4 — Optional local recovery notifications

**Purpose:** Notify users when an estimated recovery window ends, only if they opt in.

Proposed scope:
- Assess compatibility with installed Capacitor version.
- Add the smallest suitable local-notification integration, if approved.
- Ask permission only after the user enables notifications.
- Schedule, cancel and reschedule notifications correctly.
- Prevent duplicates.
- Respect manual recovery overrides.
- Use neutral notification wording.
- Document Android permission and scheduling limitations.

Acceptance checks:
- Notifications are off by default.
- No permission prompt appears without user intent.
- Notifications work locally without internet where platform behaviour permits.
- Editing/deleting a session updates pending notifications.
- No notification recommends an exercise or workout.

## Phase 5 — Training calendar and daily heatmap history

**Purpose:** Make historical training activity easy to review.

Proposed scope:
- Monthly calendar.
- Daily heatmap thumbnails.
- Date selection.
- Session list for selected date.
- Combined daily heatmap for multiple sessions.
- Historical session editing and deletion.
- Clear distinction between unlogged days and explicitly marked rest days, if rest marking is included.

Acceptance checks:
- Dates map to the correct local calendar day.
- Multiple sessions on a date are handled correctly.
- Unlogged days are not assumed to be rest days.
- Selecting a date opens the correct records and heatmap.
- Existing historical training data remains accessible.

## Phase 6 — Transparent anatomy PNG export

**Purpose:** Let users export a clean, shareable heatmap image.

Proposed scope:
- Local SVG/canvas-based rendering.
- Four anatomical views.
- Transparent PNG alpha channel.
- Heatmap legend.
- Optional date, muscle labels and branding.
- High-resolution export.
- Web download.
- Android save/share flow using supported capabilities.

Acceptance checks:
- PNG background is genuinely transparent.
- All four views are included.
- Colours match the selected heatmap.
- Export does not capture app navigation or unrelated UI.
- Image opens correctly in common image viewers and sharing apps.
- Export works offline.

A saved PNG gallery remains optional and deferred.

## Phase 7 — Integration, regression testing and Android release candidate

**Purpose:** Verify the complete feature without damaging existing LEAN MODE functionality.

Proposed scope:
- Run the complete existing test suite.
- Add and run feature-specific tests.
- Test schema migration and old/new backups.
- Test add/edit/delete flows.
- Test heatmap attribution and thresholds.
- Test recovery recalculation.
- Test notifications if implemented.
- Test calendar history.
- Test transparent PNG export.
- Test responsive web UI.
- Test Android UI and touch interactions.
- Test offline behaviour.
- Update service-worker cache version.
- Run production build.
- Run Capacitor sync.
- Build and install a new debug APK only after user approval.

Acceptance checks:
- Existing food and calorie tracking still works.
- Existing measurements and workout records remain intact.
- Backup/import/export still works.
- New feature works offline on Android.
- All tests pass or failures are explicitly reported.
- No unapproved feature or dependency has been added.

---

# Part 3 — Strict phase-by-phase working protocol

This protocol is mandatory. It defines how the user and IDE agent will collaborate.

## 1. Understanding stage

When this document is first provided:

1. Read the entire document.
2. Inspect the workspace only to understand relevant existing architecture if needed.
3. Do not edit files.
4. Do not install packages.
5. Do not create or modify schema.
6. Do not generate SVGs or other assets.
7. Do not begin Phase 1.
8. Summarize your understanding of the feature.
9. Present the proposed phases and dependencies.
10. Identify ambiguities, technical risks and questions.
11. Wait for the user's explicit approval.

## 2. Starting a phase

The user will explicitly authorize one phase at a time, for example:

`APPROVED — BEGIN PHASE 1`

Do not start a later phase unless the user explicitly authorizes it.

Work only within the approved phase's scope. If a necessary change belongs to a later phase, explain the dependency and ask before expanding scope.

## 3. Mandatory end-of-phase report

When the approved phase is complete, STOP. Do not silently continue to the next phase.

Provide a complete report using this exact structure:

### LEAN MODE — PHASE [NUMBER] COMPLETION REPORT

**A. Overall status**
- Completed / Partially completed / Blocked / Failed.
- Brief explanation.

**B. Successfully completed**
For every completed item:
- What was implemented.
- How it works.
- Relevant files created or modified.
- Any relevant data/schema changes.

**C. Not completed**
List every planned item that remains incomplete.
Explain why it was not completed.

**D. Errors and blockers**
For every error:
- Exact error message.
- Command or action that produced it.
- Relevant file or component.
- Investigation performed.
- Current diagnosis.
- Whether it is fixed, unresolved or requires user input.

Never hide warnings or known limitations.

**E. Tests**
List:
- Tests added.
- Tests executed.
- Exact pass/fail counts.
- Failed test names and reasons.
- Manual tests performed.
- Manual tests not performed.

Do not claim a test passed if it was not run.

**F. Build and platform status**
Report:
- Production build result.
- Capacitor sync result, if relevant.
- Android build result, if relevant.
- Offline verification, if performed.
- Device verification, if performed.

Do not claim Android functionality was verified merely because a web build passed.

**G. Data safety**
Confirm:
- Whether existing data structures were migrated.
- Whether old records were preserved.
- Whether backup compatibility was checked.
- Whether any destructive or irreversible operation occurred.

If data safety is uncertain, say so clearly.

**H. Known issues and risks**
List remaining bugs, limitations, assumptions and technical debt.

**I. Files changed**
Provide a clear list of created, modified and deleted files. State explicitly if no files were deleted.

**J. Exact next step**
Recommend one of:
- Phase complete; ready for user review.
- Fix the listed issue before proceeding.
- Await a user decision.
- Phase blocked.

Do not start the next phase automatically.

## 4. User-controlled review loop

After the phase report:

1. Stop all development.
2. Wait for the user to share the report with ChatGPT.
3. The user and ChatGPT will review the report.
4. ChatGPT may identify bugs, missing requirements, risky assumptions or corrections.
5. The user will provide the IDE agent with any correction prompt.
6. The IDE agent must address only the approved correction scope.
7. The IDE agent must provide an updated report.
8. Only after the user approves the next phase may development continue.

## 5. Scope and safety rules

- Never claim completion for unfinished work.
- Never hide errors to make a phase look successful.
- Never silently skip acceptance criteria.
- Never change unrelated features.
- Never remove existing functionality to make new tests pass.
- Never overwrite user data.
- Never change dependencies without explaining why.
- Never introduce a backend or cloud dependency.
- Never add workout recommendations.
- Never start the next phase automatically.
- If a requirement is ambiguous, ask before implementing it.
- If a migration could risk data loss, stop and request approval.
- Preserve the existing architecture unless a necessary change is explained and approved.

---

# Part 4 — First instruction to the IDE agent

**This is an understanding-only handoff. It is not permission to implement the feature.**

Read this complete specification and explain your understanding of the LEAN MODE Muscle Heatmap & Recovery Tracker.

Then:

1. Summarize the feature in your own words.
2. Confirm the four anatomical views.
3. Confirm the five colour states and set-count-based heatmap behaviour.
4. Explain your understanding of individual set, rep, optional weight and left/right recording.
5. Explain the limits and intended behaviour of estimated recovery.
6. Confirm transparent PNG export is required and a saved PNG gallery is deferred.
7. Summarize the proposed development phases.
8. Inspect the current workspace only as needed to identify relevant architecture and likely dependencies. Do not modify anything.
9. Identify technical risks, missing decisions and questions.
10. Recommend whether the phase sequence needs adjustment, with reasons.

**Do not edit, create, delete or generate project files. Do not install packages. Do not change configuration or data. Do not begin Phase 1.**

Finish by stating:

`UNDERSTANDING COMPLETE — NO FILES MODIFIED — WAITING FOR USER APPROVAL`

Wait for the user to explicitly authorize the next action.
