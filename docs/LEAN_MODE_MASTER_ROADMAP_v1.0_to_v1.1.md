# LEAN MODE --- Master Roadmap

## Physical Device QA → Android APK → 30-Day Usage → Evidence-Based Improvements

**Project:** LEAN MODE\
**Current version:** v1.0.0\
**Architecture:** Vanilla JavaScript (ES modules), HTML, CSS,
localStorage, IndexedDB, and PWA\
**Reported workspace:** `C:\ROS PROJECT\ct\C TRACKER`\
**Purpose:** One execution plan covering physical-device QA, Android
packaging, 30-day real-world usage, and evidence-based improvements.

------------------------------------------------------------------------

## 1. Mission and non-negotiable principles

LEAN MODE is a personal tracking and measurement application. It records
information the user supplies and presents calculations and trends. It
is **not a coach**.

### Food boundary

-   Track what the user eats; do not decide what the user eats.
-   No food recommendations, meal plans, meal suggestions, "what to eat
    next" prompts, shopping lists, or automatic healthier alternatives.
-   Never invent nutrition values for unrecognized foods.
-   Allow manual nutrition entry when an item cannot be estimated
    reliably.
-   Analyze only food the user actually reports.

### Training boundary

-   Record what the user trains; do not decide how the user trains.
-   No workout split changes, training-day changes, exercise
    prescriptions, sets, reps, weights, or routine modifications.
-   Record user-reported gym, cardio, and other activity only.
-   Cardio suggestions or adjustments are allowed only when explicitly
    requested.
-   Safety concerns may be flagged without redesigning the user's
    training.

### Non-punitive tracking

-   Never shame the user for missing logs or exceeding calorie targets.
-   Do not recommend starvation, crash dieting, or compensatory
    exercise.
-   A tracking streak measures consistent logging/completion, not
    calorie compliance.
-   Exceeding a calorie target must not break a tracking streak.

### Privacy and data ownership

-   Keep personal records on-device unless the user explicitly chooses
    otherwise.
-   Do not add analytics, advertising trackers, remote accounts, or a
    backend as part of this roadmap.
-   Explain where data and photo attachments are stored and what backups
    include.

### Preserve the existing application

-   Keep the zero-dependency vanilla JavaScript architecture unless a
    concrete technical blocker is found and explained.
-   Do not rewrite in React, Flutter, or another framework.
-   Do not redesign the interface or change nutrition calculations as
    part of packaging.
-   Inspect the actual workspace before editing; do not assume paths or
    file contents from an old report.

------------------------------------------------------------------------

## 2. Starting point and reported status

The Phase 3 report describes LEAN MODE v1.0.0 with: - 11 automated tests
passing. - Production `dist/` reported synchronized with source. -
Schema v2 and migration from schema v1. - Food logging with Indian-food
estimation and manual/custom nutrition entry. - Food record
editing/deletion. - Measurements and workout/cardio records. - Daily
completion and logging streaks independent of calorie-target
compliance. - localStorage for structured application state. - IndexedDB
for meal photo blobs; food records store attachment IDs. - JSON backup
containing profile, food logs, custom foods, workouts, measurements, and
completed days. - Separate pre-validated Replace and Merge operations. -
PWA manifest and service worker using cache name `lean-mode-v5`. - Known
limitation: JSON backups do not include meal photos. - Physical Android
camera/file-picker behavior and PWA installation still require device
verification.

These are reported results, not independently re-tested by this
document. The implementation agent must inspect the actual workspace and
verify the current state before proceeding.

## 3. Overall execution sequence

  -----------------------------------------------------------------------
  Phase             Name              Main outcome      Completion gate
  ----------------- ----------------- ----------------- -----------------
  4                 Physical device   Confirm the       Required device
                    and PWA QA        existing PWA      checks pass or
                                      works on a real   blockers are
                                      Android phone     documented

  5                 Android APK       Build and install APK builds,
                    packaging         a debug APK using installs,
                                      Capacitor         launches, and
                                                        passes smoke
                                                        tests

  6                 30-day real-world Use the app       30-day review
                    usage             consistently and  completed
                                      collect genuine   
                                      usage evidence    

  7                 Evidence-based    Fix verified      Changes are
                    improvements      problems and      evidence-based
                                      prioritize        and pass
                                      justified         regression tests
                                      enhancements      
  -----------------------------------------------------------------------

**Do not skip ahead.** Complete Phase 4 before packaging. Complete Phase
5 before treating the APK as the primary mobile app. Begin the 30-day
usage period after the chosen app version is stable enough for daily
logging.

------------------------------------------------------------------------

# PHASE 4 --- Physical Device Testing

## 4.1 Objective

Verify the existing PWA on a physical Android phone, including the
actual browser, camera/file picker, storage persistence, installation,
and offline behavior.

This phase is verification, not a feature-development phase. Do not add
unrelated features or redesign screens.

## 4.2 Preparation

1.  Inspect the current workspace and confirm the app builds.

2.  Run the existing automated tests.

3.  Run the production build.

4.  Start the production preview using the project's documented command:

    ``` powershell
    node scripts/server.mjs dist
    ```

5.  Find the laptop's local IPv4 address:

    ``` powershell
    ipconfig
    ```

6.  Connect the phone and laptop to the same trusted Wi-Fi network.

7.  Open the app on the phone using the laptop's LAN address and port,
    for example:

    ``` text
    http://<LAPTOP-LAN-IP>:5173
    ```

8.  If a browser feature requires a secure context, use an appropriate
    HTTPS setup or supported secure origin. Do not assume plain LAN HTTP
    supports every browser API.

Do not expose the development server to public networks.

## 4.3 Physical-device test cases

### A. Initial load and responsive UI

-   [ ] App opens successfully on Android Chrome.
-   [ ] Dashboard loads without a blank screen.
-   [ ] No horizontal overflow.
-   [ ] Navigation and primary controls are usable.
-   [ ] Text, dialogs, inputs, and buttons fit the phone screen.
-   [ ] No visible overlap or clipped content.
-   [ ] No critical runtime errors.

### B. Food logging and persistence

1.  Add a recognized food description.
2.  Verify displayed calories and macros.
3.  Add an unknown food using Manual / Custom entry.
4.  Save a custom food if desired.
5.  Refresh the page.
6.  Confirm entries and nutrition values remain unchanged.
7.  Edit an entry and refresh again.
8.  Delete a test entry and confirm it stays deleted.

-   [ ] Recognized food logging works.
-   [ ] Unknown food can be entered manually.
-   [ ] Nutrition values persist accurately.
-   [ ] Custom food library persists.
-   [ ] Editing persists.
-   [ ] Deletion persists.
-   [ ] No duplicate entry appears after refresh.

### C. Photo attachment and IndexedDB

1.  Open food logging on the physical phone.
2.  Tap the photo attachment control.
3.  Test the device camera flow if offered.
4.  Capture or select a test image.
5.  Save the food entry.
6.  Confirm the thumbnail appears.
7.  Refresh the app and confirm the thumbnail remains.
8.  Edit the entry and confirm the attachment remains associated.
9.  Delete the test entry.
10. Confirm the attachment is deleted or no longer referenced according
    to the intended lifecycle.

-   [ ] Camera/file picker opens.
-   [ ] Image can be selected or captured.
-   [ ] Image compression completes without crashing.
-   [ ] Thumbnail appears after saving.
-   [ ] Thumbnail survives refresh.
-   [ ] Editing does not unexpectedly detach the photo.
-   [ ] Deleting the food entry handles its attachment correctly.
-   [ ] Missing attachment fallback does not crash the UI.

If the browser does not offer direct camera capture, record the actual
behavior. The Android system UI may expose camera capture through the
file picker depending on browser and input configuration.

### D. Measurements and activity records

-   [ ] Add a measurement.
-   [ ] Verify it appears in progress/history.
-   [ ] Refresh and verify persistence.
-   [ ] Test edit/delete if those actions exist.
-   [ ] Add a gym record.
-   [ ] Add a cardio record.
-   [ ] Add an Other activity record if supported.
-   [ ] Refresh and verify persistence.

Do not add workout prescriptions or change the user's training routine.

### E. Backup and recovery

1.  Export a JSON backup.
2.  Keep a copy outside browser storage.
3.  Test Merge using a copy of the backup.
4.  Confirm existing records are not duplicated.
5.  Test Replace only with a disposable/test dataset or after exporting
    a safety backup.
6.  Confirm malformed imports are rejected without changing current
    data.
7.  If possible, test restore in a separate clean browser profile.

-   [ ] JSON export downloads.
-   [ ] Backup includes structured records and profile data.
-   [ ] Merge deduplicates by ID.
-   [ ] Replace requires explicit confirmation.
-   [ ] Invalid backup leaves current data untouched.
-   [ ] Restore into a clean profile works.

**Photo-backup limitation:** The current JSON export does not include
IndexedDB photo blobs. Do not imply that a JSON backup contains meal
photos.

### F. PWA installation

1.  Open the app in Android Chrome from a supported secure origin.
2.  Use Chrome's install/Add to Home Screen option if offered.
3.  Install the app.
4.  Launch it from the home-screen icon.
5.  Verify standalone display and navigation.
6.  Close and relaunch it.

-   [ ] Browser offers an installation route.
-   [ ] App installs successfully.
-   [ ] App icon appears.
-   [ ] Standalone launch works.
-   [ ] App opens the correct start page.
-   [ ] No critical layout or navigation issue occurs.

Installation prompts vary by browser/platform. If the automatic banner
does not appear, test the browser's menu-based installation option and
record the result.

### G. Offline behavior

1.  Load the app successfully while online.
2.  Allow the service worker to install and activate.
3.  Confirm the expected cache is populated.
4.  Turn off Wi-Fi/mobile data or enable airplane mode.
5.  Close and reopen the app.
6.  Test navigation and locally stored records.
7.  Restore connectivity and check normal operation.

-   [ ] Service worker registers.
-   [ ] Required local assets are cached.
-   [ ] Offline launch works after initial online load.
-   [ ] Dashboard and core navigation work offline.
-   [ ] Existing local records remain accessible.
-   [ ] No infinite loading state appears.
-   [ ] Reconnecting does not duplicate or erase records.

External fonts may fall back to system fonts offline. This is acceptable
if the layout remains usable.

## 4.4 Phase 4 completion criteria

Phase 4 is complete when: - Core food logging and record persistence
pass on the physical phone. - Photo attachment behavior is verified or
its limitation is documented. - Backup and restore are verified without
risking the only copy of data. - PWA installation is verified or the
exact browser/platform blocker is documented. - Offline behavior is
verified. - No unresolved critical data-loss or crash issue remains.

Create a **Phase 4 Device QA Report** with device model, Android
version, browser/version, test date, pass/fail results, and unresolved
issues.

------------------------------------------------------------------------

# PHASE 5 --- Android APK Packaging with Capacitor

## 5.1 Objective

Package the existing web application as an Android application using
Capacitor while preserving the current vanilla JavaScript app and
behavior. This is not a framework rewrite.

## 5.2 Pre-packaging inspection

Before changing files: 1. Inspect `package.json`. 2. Inspect
`scripts/build.mjs`. 3. Inspect the actual output structure under
`dist/`. 4. Inspect `index.html` and asset paths. 5. Inspect service
worker registration and PWA paths. 6. Check whether Capacitor is already
installed or initialized. 7. Check whether an Android project already
exists. 8. Check Node.js, Java JDK, Android Studio, Android SDK, and
Gradle availability. 9. Check Git status if Git is initialized.

Do not overwrite existing Capacitor configuration or an Android project
without understanding it.

## 5.3 Capacitor setup

If Capacitor is not already configured: 1. Install the required
Capacitor packages using the project's package manager. 2. Initialize
Capacitor with: - App name: `LEAN MODE` - A stable reverse-domain app ID
selected by the project owner. - Web asset directory: `dist` 3. Add the
Android platform. 4. Keep the current source structure intact. 5. Add
only native configuration/plugins required for actual app functionality.

Do not invent a package ID that may conflict with a future published
app. Propose a sensible ID and report it clearly before finalizing if
the owner has not selected one.

## 5.4 Android project and asset integration

-   [ ] Capacitor configuration points to `dist/`.
-   [ ] Production build runs before Capacitor sync.
-   [ ] Android platform is added successfully.
-   [ ] Android project opens in Android Studio.
-   [ ] Web assets synchronize correctly.
-   [ ] App name and package ID are correct.
-   [ ] App icon and splash behavior are acceptable.
-   [ ] Status/navigation bar appearance is usable.
-   [ ] Back navigation behaves sensibly.
-   [ ] No unnecessary permissions are requested.

Use commands appropriate to the installed Capacitor version and package
scripts. Do not blindly copy commands from outdated guides.

## 5.5 Native photo and local storage verification

Verify on the actual APK: - Photo picker opens. - Camera capture works
if supported by the chosen input/plugin implementation. - Selected
images can be read and compressed. - IndexedDB attachments persist after
app restart. - localStorage records persist after app restart. -
Editing/deleting records behaves correctly. - Missing attachment
fallback remains safe.

Do not add broad storage permissions without a demonstrated need. Use
the narrowest platform-supported file/camera access path.

## 5.6 APK build

1.  Build the web app.
2.  Synchronize Capacitor assets.
3.  Open/sync the Android project.
4.  Build a debug APK.
5.  Confirm the APK file exists at the actual generated path.
6.  Record build output and warnings/errors.
7.  Do not claim success if Gradle or SDK setup is incomplete.

If Android SDK or Java is missing, report the exact prerequisite and
setup steps. Do not fabricate an APK path.

## 5.7 Install and smoke-test the APK

-   [ ] APK installs.
-   [ ] App launches.
-   [ ] App name and icon are correct.
-   [ ] Dashboard loads.
-   [ ] Food logging works.
-   [ ] Manual nutrition works.
-   [ ] Custom foods work.
-   [ ] Photos can be selected/captured as supported.
-   [ ] Photo attachments survive app restart.
-   [ ] Local records survive app restart.
-   [ ] Measurements and activity records work.
-   [ ] Backup export/import works.
-   [ ] Navigation and Android back behavior work.
-   [ ] No critical crash occurs.

## 5.8 Web/PWA versus Android app data

Treat browser PWA and installed Android APK as potentially separate
application storage environments. Do not assume localStorage or
IndexedDB transfers automatically between Chrome, an installed PWA, and
Capacitor.

Before switching daily use to the APK: 1. Export a JSON backup from the
existing app. 2. Install and launch the APK. 3. Import the JSON backup
into the APK. 4. Verify profile, foods, custom foods, measurements,
workouts, and completed days. 5. Remember that JSON backups do not
contain photo attachments. 6. Keep the original app and backup until APK
data is verified.

## 5.9 Phase 5 completion criteria

Phase 5 is complete when: - Capacitor configuration is valid. - Android
project builds successfully. - A real debug APK is generated. - APK
installs and launches on the physical phone. - Core functionality and
local persistence pass. - Photo behavior is verified. - Existing
structured data can be migrated using the supported backup workflow. -
APK path, build command, package ID, and limitations are documented.

Create a **Phase 5 Android Packaging Report**.

------------------------------------------------------------------------

# PHASE 6 --- 30-Day Real-World Usage

## 6.1 Objective

Use LEAN MODE consistently for 30 days and evaluate it using actual
records rather than assumptions. Do not add features simply because they
sound useful.

## 6.2 Select the daily app version

At the beginning: 1. Choose the PWA or installed Android APK as the
primary daily app. 2. Prefer the APK only after it passes Phase 5. 3.
Export a baseline JSON backup. 4. Record the start date and app version.
5. Keep the same primary app throughout the test where practical. 6.
Avoid switching between PWA and APK without a deliberate backup/restore
process.

## 6.3 Daily logging protocol

### Food

-   Log meals and snacks actually consumed.
-   Use the estimator only when food and portion are recognized
    sufficiently.
-   Use manual nutrition entry when an item is unknown or the estimate
    is unreliable.
-   Record actual portion information as accurately as practical.
-   Correct an entry if the original log was wrong.
-   Do not invent values to fill missing information.
-   Review consumed and remaining calories/macros as measurements, not
    moral judgments.

### Training and activity

-   Record gym sessions actually completed.
-   Record cardio sessions actually completed.
-   Record other activities if supported.
-   Enter duration and other details from the user's report.
-   Do not use the app to prescribe exercises or modify the user's
    routine.

### Measurements

-   Record weight and waist measurements weekly, using consistent
    measurement conditions.
-   Keep units consistent.
-   Avoid interpreting a single measurement as a definitive trend.
-   Preserve historical measurements rather than overwriting old
    records.

### Daily completion and streaks

-   Use Complete Day according to the app's defined meaning.
-   A tracking streak measures logging/completion only.
-   Exceeding a calorie target must not break the streak.
-   Missing data must remain missing; do not fabricate entries to
    preserve a streak.

## 6.4 30-day review cadence

  -----------------------------------------------------------------------
  Time                                Review
  ----------------------------------- -----------------------------------
  Day 1                               Confirm profile, targets, baseline
                                      measurements, backup, and app
                                      version

  Days 2--7                           Check logging reliability and
                                      identify confusing controls

  Day 7                               First weekly review

  Days 8--14                          Continue logging; note repeated
                                      friction

  Day 14                              Second weekly review and backup

  Days 15--21                         Continue usage; record missing or
                                      inaccurate functionality

  Day 21                              Third weekly review

  Days 22--29                         Continue usage without feature
                                      creep

  Day 30                              Final review, backup, and
                                      improvement prioritization
  -----------------------------------------------------------------------

## 6.5 What to track

### App reliability

-   Crashes or blank screens.
-   Failed saves or missing records.
-   Photo attachment failures.
-   Unexpected data duplication.
-   Backup/restore problems.
-   Slow or confusing interactions.

### Logging consistency

-   Days with food logs.
-   Days explicitly completed.
-   Missing or incomplete logs.
-   Manual nutrition entries.
-   Custom foods reused.

### Nutrition data quality

-   Whether estimated portions match what was consumed.
-   Whether the catalog recognizes frequently logged foods.
-   Whether unknown foods are correctly routed to manual entry.
-   Whether nutrition values appear implausible or inconsistent.

Estimates are not laboratory measurements. Record uncertainty where
appropriate.

### Activity and measurements

-   Whether gym/cardio logging is easy.
-   Whether session details are sufficient for recordkeeping.
-   Whether weekly weight and waist entries are preserved.
-   Whether progress charts represent the underlying data correctly.

### User experience issue log

For each issue, record: - Date. - Screen/feature. - What the user
tried. - What happened. - Expected behavior. - Whether it blocked
logging. - Screenshot or reproduction steps, when useful.

Collect evidence before implementing minor ideas.

## 6.6 Weekly review rules

Weekly summaries must: - Calculate averages only from days with actual
logged data. - Exclude unlogged days rather than treating them as
zero. - Distinguish missing data from zero consumption. - Show the
period covered. - Show the number of days represented. - Avoid claiming
a trend from insufficient data. - Keep logging consistency separate from
calorie-target compliance.

## 6.7 Data protection during the 30 days

-   Export a JSON backup at the start.
-   Export another backup at least weekly.
-   Keep backups outside app/browser storage.
-   Do not uninstall or clear app data before confirming a usable backup
    exists.
-   Remember JSON exports currently exclude IndexedDB meal photos.
-   When moving between PWA and APK, export/import structured data and
    verify it before deleting the old installation.

## 6.8 Day 30 completion criteria

Produce a usage report containing: 1. Number of days in the test period.
2. Days with food logging. 3. Explicitly completed days. 4. Logging
streak history. 5. Weekly calorie and macro summaries based only on
available data. 6. Manual food entries and custom-food reuses. 7. Weight
and waist measurement history, if recorded. 8. Activity logging summary.
9. Bugs, data-loss incidents, and failed saves. 10. Most frequent
usability friction points. 11. Features that worked reliably. 12.
Features to improve, defer, or leave unchanged.

Do not invent missing records or infer compliance from incomplete logs.

------------------------------------------------------------------------

# PHASE 7 --- Evidence-Based Improvements

## 7.1 Objective

Use the Phase 6 usage report to decide what should change. Every
proposed enhancement must solve an observed problem or a demonstrated
limitation.

## 7.2 Issue priority

### P0 --- Data safety or critical failure

Examples: - Lost or corrupted food records. - Backup restore corrupts
existing data. - App cannot launch. - A save reports success but fails
to persist.

Address these before other work.

### P1 --- Core workflow blocker

Examples: - Food logging cannot be completed reliably. - Photo
attachment causes a repeatable crash. - Editing/deleting records damages
other records. - App fails to preserve data after restart.

Fix before optional enhancements.

### P2 --- Repeated usability friction

Examples: - Frequently used input is difficult to access. - A common
food is repeatedly misparsed. - A frequently used control is unclear. -
Repeated navigation makes daily logging unnecessarily difficult.

Prioritize by frequency and impact.

### P3 --- Optional enhancement

Examples: - New charts. - Additional display preferences. - Extra export
formats. - Visual polish. - Convenience features.

Consider these only after P0--P2 issues are addressed.

## 7.3 Improvement decision process

For each proposed change, document: 1. Evidence from actual usage. 2.
Frequency of the issue. 3. User workflow affected. 4. Expected benefit.
5. Data migration or compatibility risk. 6. Whether it respects strict
user boundaries. 7. Required test cases. 8. Whether it is necessary now
or can be deferred.

Do not add features merely to make the application appear more
sophisticated.

## 7.4 Possible future enhancements --- only if justified

These are possibilities, not commitments: - ZIP backup containing
structured JSON and photo attachments. - Better custom-food matching for
frequently logged foods. - Faster food-entry editing based on repeated
friction. - Additional progress visualizations if current charts are
insufficient. - Improved accessibility and mobile input ergonomics. -
More robust export/recovery tooling. - Automated regression tests for
bugs found during the 30-day period.

Every enhancement must preserve the
no-food-recommendations/no-workout-prescriptions boundary.

## 7.5 Regression requirements

For every code change: 1. Reproduce the issue before fixing it. 2. Add a
regression test where practical. 3. Implement the smallest reliable fix.
4. Run the complete test suite. 5. Run the production build. 6. Verify
`dist/` is synchronized. 7. Test the changed workflow on the target
device if it affects mobile behavior. 8. Verify existing data remains
readable. 9. Update README and release notes.

Do not silently change schema formats. Use explicit migrations when
necessary.

## 7.6 Phase 7 completion criteria

Phase 7 is complete when: - Every selected change is linked to actual
usage evidence. - Critical data-integrity issues are resolved. -
Regression tests pass. - Production build succeeds. - Mobile behavior is
rechecked for affected features. - Release notes and known limitations
are updated. - Deferred requests are documented.

------------------------------------------------------------------------

# 8. Master acceptance checklist

## Phase 4 --- Physical device QA

-   [ ] Android browser opens the app.
-   [ ] Responsive layout works.
-   [ ] Food logging persists.
-   [ ] Manual entry persists.
-   [ ] Custom foods persist.
-   [ ] Photo selection/capture is tested.
-   [ ] Photo survives refresh.
-   [ ] Photo deletion lifecycle is tested.
-   [ ] Measurements and activity persist.
-   [ ] JSON backup and restore are tested.
-   [ ] PWA installation is tested.
-   [ ] Offline launch is tested.
-   [ ] Device QA report is written.

## Phase 5 --- Android APK

-   [ ] Existing project inspected.
-   [ ] Capacitor status checked.
-   [ ] App ID selected and documented.
-   [ ] `dist/` configured as web assets.
-   [ ] Android platform configured.
-   [ ] Android project builds.
-   [ ] Debug APK actually generated.
-   [ ] APK installed on physical phone.
-   [ ] Food logging works.
-   [ ] Manual/custom nutrition works.
-   [ ] Photo workflow works.
-   [ ] localStorage and IndexedDB persist after restart.
-   [ ] Backup import/export works.
-   [ ] Navigation and back behavior work.
-   [ ] Android packaging report is written.

## Phase 6 --- 30-day use

-   [ ] Start date and app version recorded.
-   [ ] Baseline backup saved.
-   [ ] Daily food logging performed as practical.
-   [ ] Actual activity records maintained.
-   [ ] Weekly measurements recorded if available.
-   [ ] Weekly backups saved.
-   [ ] Weekly summaries reviewed.
-   [ ] Issues documented with reproduction details.
-   [ ] Day 30 report completed.

## Phase 7 --- Improvements

-   [ ] Usage evidence reviewed.
-   [ ] Issues classified P0--P3.
-   [ ] Only justified changes selected.
-   [ ] Data migrations handled safely.
-   [ ] Regression tests added.
-   [ ] Full test suite passes.
-   [ ] Production build succeeds.
-   [ ] Mobile behavior rechecked.
-   [ ] README/release notes updated.
-   [ ] Remaining limitations documented.

------------------------------------------------------------------------

# 9. Instructions for the coding agent

Use this document as the master execution plan, but execute it in
controlled stages.

-   Start by inspecting the current workspace.
-   Confirm the actual project root and current version.
-   Do not assume previous reports prove the current state.
-   Do not overwrite user data or delete existing files unnecessarily.
-   Do not change nutrition logic or user boundaries during packaging.
-   Do not introduce a framework rewrite.
-   Do not add unnecessary dependencies.
-   Do not claim browser/device tests unless they were actually
    performed.
-   Do not claim an APK exists unless the build succeeded and the output
    file was verified.
-   Do not fabricate test results, usage data, or progress measurements.
-   Ask for user action only when a physical-device step, approval, or
    missing decision genuinely requires it.
-   When a phase is blocked, report the exact blocker and continue only
    with safe independent work.
-   At the end of each phase, provide a concise report and wait for
    approval before high-impact changes or optional enhancements.

## Final project principle

**Build it. Test it. Use it. Measure what happened. Improve only what
needs improving.**

LEAN MODE exists to record the user's actual food intake, activity, and
measurements. It must never decide what the user should eat or how the
user should train.
