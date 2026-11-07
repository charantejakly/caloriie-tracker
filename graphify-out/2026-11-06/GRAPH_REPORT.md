# Graph Report - C TRACKER  (2026-11-06)

## Corpus Check
- 31 files · ~40,392 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 20 file(s) not represented in the graph (top: .xml 10, (none) 3, .properties 2)

## Summary
- 175 nodes · 418 edges · 19 communities (6 shown, 13 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- UI Views and App Shell
- Anatomy SVG & Heatmap Rendering
- Capacitor Package Config
- Build Scripts & Dev Server
- Store State & Muscle Data Model
- Android Instrumentation Tests
- IndexedDB Image Attachments
- Android Bridge Activity
- Service Worker PWA Cache
- trace_anatomy.py
- MuscleHeatmapController
- heatmap setup/anatomy-svg.js

## God Nodes (most connected - your core abstractions)
1. `esc()` - 13 edges
2. `workoutView()` - 13 edges
3. `todayView()` - 11 edges
4. `layout()` - 11 edges
5. `isValidSet()` - 11 edges
6. `calculateDailyHeatmap()` - 10 edges
7. `migrateData()` - 10 edges
8. `renderAnteriorSvg()` - 9 edges
9. `renderPosteriorSvg()` - 9 edges
10. `isValidExercise()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `detailedBadgeText()` --indirect_call--> `isValidSet()`  [INFERRED]
  src/main.js → src/muscle-data.js
- `workoutView()` --indirect_call--> `isValidSet()`  [INFERRED]
  src/main.js → src/muscle-data.js
- `renderWorkoutViewSimulation()` --calls--> `renderAnteriorSvg()`  [EXTRACTED]
  tests/ui.test.js → src/anatomy-svg.js
- `renderWorkoutViewSimulation()` --calls--> `renderPosteriorSvg()`  [EXTRACTED]
  tests/ui.test.js → src/anatomy-svg.js
- `renderWorkoutViewSimulation()` --calls--> `calculateDailyHeatmap()`  [EXTRACTED]
  tests/ui.test.js → src/heatmap.js

## Import Cycles
- None detected.

## Communities (19 total, 13 thin omitted)

### Community 0 - "UI Views and App Shell"
Cohesion: 0.14
Nodes (30): activeDate, app, createDefaultWorkoutSession(), customExerciseFormModalHtml(), customExercisesManagerModalHtml(), data, dataView(), dateLabel() (+22 more)

### Community 1 - "Anatomy SVG & Heatmap Rendering"
Cohesion: 0.19
Nodes (24): BACK_PATHS, FRONT_PATHS, getAria(), getColor(), renderAnteriorSvg(), renderPosteriorSvg(), calculateDailyHeatmap(), DEFAULT_HEATMAP_THRESHOLDS (+16 more)

### Community 2 - "Capacitor Package Config"
Cohesion: 0.13
Nodes (17): dependencies, @capacitor/android@^8.6.0, @capacitor/cli@^8.6.0, @capacitor/core@^8.6.0, name, private, scripts, build (+9 more)

### Community 3 - "Build Scripts & Dev Server"
Cohesion: 0.15
Nodes (11): output, root, base, mime, server, add(), estimateFood(), foods (+3 more)

### Community 4 - "Store State & Muscle Data Model"
Cohesion: 0.25
Nodes (16): progressView(), evaluateLoggingStatus(), blankData(), calculateBmr(), calculateTdee(), DEFAULT_PROFILE, loadData(), localDate() (+8 more)

### Community 6 - "IndexedDB Image Attachments"
Cohesion: 0.60
Nodes (5): deleteAttachment(), getAllAttachmentIds(), getAttachment(), openDb(), saveAttachment()

## Knowledge Gaps
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `estimateFood()` connect `Build Scripts & Dev Server` to `UI Views and App Shell`, `Store State & Muscle Data Model`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `workoutView()` (e.g. with `layout()` and `isValidSet()`) actually correct?**
  _`workoutView()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `UI Views and App Shell` be split into smaller, more focused modules?**
  _Cohesion score 0.14015151515151514 - nodes in this community are weakly interconnected._
- **Why does `renderAnteriorSvg()` connect `Anatomy SVG & Heatmap Rendering` to `UI Views and App Shell`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `todayView()` (e.g. with `layout()` and `foodCard()`) actually correct?**
  _`todayView()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Capacitor Package Config` be split into smaller, more focused modules?**
  _Cohesion score 0.13071895424836602 - nodes in this community are weakly interconnected._
- **Are the 7 inferred relationships involving `layout()` (e.g. with `dataView()` and `foodView()`) actually correct?**
  _`layout()` has 7 INFERRED edges - model-reasoned connections that need verification._