# Graph Report - C TRACKER  (2026-11-05)

## Corpus Check
- Corpus is ~35,540 words - fits in a single context window. You may not need a graph.

## Summary
- 149 nodes · 374 edges · 16 communities (6 shown, 10 thin omitted)
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

## God Nodes (most connected - your core abstractions)
1. `esc()` - 13 edges
2. `workoutView()` - 13 edges
3. `todayView()` - 11 edges
4. `layout()` - 11 edges
5. `isValidSet()` - 11 edges
6. `migrateData()` - 10 edges
7. `calculateDailyHeatmap()` - 9 edges
8. `isValidExercise()` - 9 edges
9. `renderAnteriorSvg()` - 8 edges
10. `renderPosteriorSvg()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `renderWorkoutViewSimulation()` --calls--> `renderAnteriorSvg()`  [EXTRACTED]
  tests/ui.test.js → src/anatomy-svg.js
- `renderWorkoutViewSimulation()` --calls--> `renderPosteriorSvg()`  [EXTRACTED]
  tests/ui.test.js → src/anatomy-svg.js
- `renderWorkoutViewSimulation()` --calls--> `calculateDailyHeatmap()`  [EXTRACTED]
  tests/ui.test.js → src/heatmap.js
- `detailedBadgeText()` --indirect_call--> `isValidSet()`  [INFERRED]
  src/main.js → src/muscle-data.js
- `workoutView()` --indirect_call--> `isValidSet()`  [INFERRED]
  src/main.js → src/muscle-data.js

## Import Cycles
- None detected.

## Communities (16 total, 10 thin omitted)

### Community 0 - "UI Views and App Shell"
Cohesion: 0.14
Nodes (33): activeDate, app, customExerciseFormModalHtml(), customExercisesManagerModalHtml(), data, dataView(), dateLabel(), detailedBadgeText() (+25 more)

### Community 1 - "Anatomy SVG & Heatmap Rendering"
Cohesion: 0.22
Nodes (22): getAria(), getColor(), renderAnteriorSvg(), renderPosteriorSvg(), calculateDailyHeatmap(), DEFAULT_HEATMAP_THRESHOLDS, HEATMAP_PALETTE, validateHeatmapThresholds() (+14 more)

### Community 2 - "Capacitor Package Config"
Cohesion: 0.13
Nodes (17): dependencies, @capacitor/android@^8.6.0, @capacitor/cli@^8.6.0, @capacitor/core@^8.6.0, name, private, scripts, build (+9 more)

### Community 3 - "Build Scripts & Dev Server"
Cohesion: 0.15
Nodes (11): output, root, base, mime, server, add(), estimateFood(), foods (+3 more)

### Community 4 - "Store State & Muscle Data Model"
Cohesion: 0.32
Nodes (12): evaluateLoggingStatus(), blankData(), DEFAULT_PROFILE, loadData(), localDate(), mergeData(), migrateData(), nutrition() (+4 more)

### Community 6 - "IndexedDB Image Attachments"
Cohesion: 0.60
Nodes (5): deleteAttachment(), getAllAttachmentIds(), getAttachment(), openDb(), saveAttachment()

## Knowledge Gaps
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `estimateFood()` connect `Build Scripts & Dev Server` to `UI Views and App Shell`, `Store State & Muscle Data Model`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `workoutView()` (e.g. with `layout()` and `isValidSet()`) actually correct?**
  _`workoutView()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `UI Views and App Shell` be split into smaller, more focused modules?**
  _Cohesion score 0.1365079365079365 - nodes in this community are weakly interconnected._
- **Why does `renderAnteriorSvg()` connect `Anatomy SVG & Heatmap Rendering` to `UI Views and App Shell`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `todayView()` (e.g. with `layout()` and `foodCard()`) actually correct?**
  _`todayView()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Capacitor Package Config` be split into smaller, more focused modules?**
  _Cohesion score 0.13071895424836602 - nodes in this community are weakly interconnected._
- **Are the 7 inferred relationships involving `layout()` (e.g. with `dataView()` and `foodView()`) actually correct?**
  _`layout()` has 7 INFERRED edges - model-reasoned connections that need verification._