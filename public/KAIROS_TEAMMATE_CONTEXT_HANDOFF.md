# Kairos Metadata Lineage — Detailed Teammate Handoff

**Prepared:** 26 October 2026  
**Audience:** Teammates joining or continuing the Kairos Metadata Lineage project  
**Purpose:** Explain what the project is, how the architecture is intended to work, what currently exists in the Hatchable dashboard, what has and has not changed, what is live, and how to continue safely.

> **Status discipline:** This handoff distinguishes implemented facts from plans, open decisions, mock/plumbing, and unverified behavior. The architecture pack and team guide define research intent and invariants; the Hatchable project notes describe the current web app. A live dashboard is not proof that every research component is complete or validated.

---

## 1. Executive Summary

Kairos is a metadata-lineage and evidence-reasoning project. Its goal is not merely to draw arrows between datasets. It aims to represent **what dependency is supported by which evidence, for which execution/run, and as known at what point in time**, without claiming more than the evidence supports.

The research direction studies execution-conditioned lineage reasoning when runtime observations may be incomplete or lost. A dependency may be statically possible, positively observed at runtime, refuted for a specific run after a complete negative evaluation, or unknown because evidence is insufficient. Missing events must never be treated automatically as proof that a dependency did not occur.

The system separates:
- Static lineage from SQL and metadata.
- Runtime evidence and coverage.
- Independent ground truth for benchmark evaluation.
- Predictor/reasoning methods and baselines.
- Canonical persistence and temporal history.
- API/UI presentation.

**PostgreSQL is the canonical source of truth.** Neo4j is optional, derived, and rebuildable. The UI should display lineage and evidence; it must not become a competing parsing, storage, or reasoning engine.

### Current live dashboard

- **Project:** Kairos Metadata Lineage Dashboard
- **Hatchable project ID:** `proj_HTYAd2BCLtMt`
- **Slug:** `kairos-metadata`
- **Live URL:** https://kairos-metadata.hatchable.site
- **Latest live version confirmed before this handoff file was added:** v184
- **Latest deploy request before this handoff file was added:** Hatchable reported that the unchanged files were already deployed as v184 and created no new version.
- **Validation before this handoff file was added:** zero blocking errors; three non-blocking lint warnings in `api/v1/ingest.js` around SQL CTE aliases `lock_key`, `ts`, and `existing`.
- **This handoff file is a new project-file change.** It must be deployed for the public path to be served by the live site. Its addition does not itself complete the lineage UI restoration.

---

## 2. What Problem Are We Solving?

Traditional lineage tools can make a relationship appear more certain than it is. An edge can be based on SQL structure, a declared mapping, a runtime observation, or a complete evaluation. These sources are not equivalent.

Examples:
- SQL references a source column inside a `CASE WHEN` expression. Static analysis can support that the source is a **possible dependency** of an output column.
- A valid runtime trace shows the source column contributing during a particular execution. This is positive runtime evidence.
- No event was observed. This alone does **not** prove that the dependency did not happen: the event may have been dropped, instrumentation may be incomplete, or the relevant execution path may not have been covered.
- Only a complete negative evaluation for the relevant dependency and run can support `REFUTED_FOR_RUN`.
- If identity is missing or static analysis is unsupported, the correct state may be `UNKNOWN`, rather than a guessed relationship.

Kairos is designed to preserve these distinctions and expose the evidence, scope, coverage, and temporal context behind a lineage claim.

### Research question and hypothesis

The research direction asks whether execution-conditioned evidence plus explicit coverage information improves dependency reasoning under incomplete/lost runtime observations compared with static-only and other baseline methods.

This is a **provisional research hypothesis**, not a validated conclusion. It requires a reproducible pilot and controlled experiments. Do not report old, self-reported AUC/speed figures as results; the architecture pack excludes earlier numbers as evidence because the code/evaluation was not independently reproducible.

### What we must not claim

- Bitemporal lineage by itself is not the novelty claim; it is infrastructure.
- Four-state semantics are not claimed as a newly invented logic.
- A graph edge alone does not prove actual runtime execution.
- The dashboard being online does not mean the research hypothesis is validated.
- Mock data is plumbing, not experimental evidence.
- Do not invent numeric confidence scores in v1.
- Missing observations are not proof of non-propagation.
- Do not claim ProvSQL feasibility or performance until the relevant experiment has actually run and been documented.

---

## 3. Two Related but Distinct Project Surfaces

Do not conflate the research foundation with the Hatchable dashboard.

### 3.1 Research foundation: `data-lineage-engine/`

The Team Guide describes a deliberately small foundation repository containing:
- Shared contracts in `contracts/`.
- Four-state reasoning engine in `research/reasoning/engine.py`.
- Five baselines in `research/baselines/baselines.py`.
- Metrics in `research/metrics/metrics.py`.
- Mock fixtures and providers.
- Import-boundary checks.
- Unit tests.
- A small FastAPI slice with `/health` and one mock-backed dependency route.

The guide explicitly states that the full database, ingestion, API, UI, ground-truth implementation, and experiments are not yet built in that foundation package and are assigned across the team. The mock fixture models a SQL `CASE WHEN` dependency and tests plumbing; it is not a research result.

Expected baseline commands from the guide, run from the repository root:

```bash
python -m venv .venv
# Linux/macOS
source .venv/bin/activate
# Windows
# .venv\Scripts\activate
pip install pytest
python scripts/check_import_boundaries.py
python -m pytest -q
```

The guide states that the expected baseline is `31 passed, 1 skipped`; the skipped API test requires FastAPI dependencies. With FastAPI and HTTPX installed, the guide expects 34 passing tests. These are expectations documented in the guide, not proof that every teammate's environment has run them.

### 3.2 Hatchable dashboard: `kairos-metadata`

The current web application is a larger dashboard:
- Vanilla HTML/CSS/JavaScript frontend.
- `public/index.html` loads `/styles.neo.css?v=2`.
- Main client behavior: `public/app.js`.
- 3D Observatory: `public/observatory.js`.
- Stewardship logic: `public/stewardship.js`.
- Chart.js and Three.js support chart and 3D features.
- Dashboard areas include overview, assets/catalog, lineage, SQL analysis, evidence, runs, time travel, quality, incidents, products, 3D observatory, integrations/API, settings, ingestion, and stewardship.
- API functions and PostgreSQL migrations are included.
- Current deployed version prior to this handoff-file change: v184.

The Hatchable dashboard is a product/UI implementation surface. Do not assume its JavaScript API is automatically the same as the Python research architecture. The architecture pack's contracts and research invariants remain authoritative for research logic.

---

## 4. Architecture Overview

Conceptual flow:

```text
SQL / metadata ──> static analysis ──┐
                                    │
runtime traces + coverage ──────────┼──> PredictorInput ──> reasoning/baseline
                                    │                           │
temporal context ───────────────────┘                           v
                                                        predicted four-state result
                                                                   │
independent ground truth ──────────────────────────────────────────┴──> metrics
```

**Ground truth meets predictions at evaluation/metrics only.** It must not be supplied to the predictor or used to derive predicted states.

### Components

1. **Static lineage provider (M1):** parse SQL/metadata; return supported static dependencies, schema snapshots, dataset/column lineage, and explicit unsupported-analysis reasons. SQLGlot is the parsing technology identified in the project context.
2. **Runtime evidence and ground truth (M2):** collect runtime evidence and coverage; independently establish benchmark truth. ProvSQL is the primary candidate, but feasibility is still provisional. A `ReferenceInterpreterProvider` fallback is planned behind the same interface.
3. **Storage and temporal model (M3):** PostgreSQL canonical storage, immutable evidence, bitemporal records, conflict retention, and temporal query behavior.
4. **Reasoning and experiments (M4):** four-state engine, baselines B1–B5 and proposed method, metrics, observation-loss simulation, pilot, and full experiment only if pilot criteria support proceeding.
5. **API/UI (M5):** versioned API contracts and Stage 1 interface focused on lineage, search, two temporal controls, historical banner, and evidence explanation.

### PostgreSQL vs Neo4j

- PostgreSQL is the authoritative source of truth.
- Neo4j is optional, derived, and rebuildable.
- Do not make Neo4j the only home for temporal/evidence truth.
- Raw evidence is immutable; derived states should be recomputable.
- Retain conflicting source versions and flag conflicts rather than silently overwriting them.

---

## 5. Four-State Semantics

The predictor uses four states:

| State | Meaning | Required interpretation |
|---|---|---|
| `OBSERVED` | Positive runtime evidence supports the dependency for the relevant run. | Requires valid positive runtime evidence. |
| `POSSIBLE` | Static evidence supports a possible dependency, but there is neither positive runtime evidence nor a complete negative evaluation. | Static possibility is not runtime proof. |
| `REFUTED_FOR_RUN` | Dependency ruled out for a particular run under a declared evaluation scope. | Run-scoped, not a universal claim that the dependency never exists. Requires complete negative evaluation. |
| `UNKNOWN` | The system cannot safely decide. | Use for missing identity, unsupported analysis, insufficient evidence, or no basis for a dependency claim. |

### Rules R1–R5 (first matching rule wins)

1. **R1:** Column identity is missing or static analysis is unsupported → `UNKNOWN`.
2. **R2:** Positive runtime evidence exists → `OBSERVED`.
3. **R3:** Static analysis supports a possible dependency and a complete negative evaluation exists → `REFUTED_FOR_RUN`.
4. **R4:** Static analysis supports a possible dependency, but there is no positive evidence and no complete negative evaluation → `POSSIBLE`.
5. **R5:** Nothing supports the dependency → `UNKNOWN`.

### Non-negotiable rules

- Missing evidence is not negative evidence.
- `REFUTED_FOR_RUN` requires complete run-scoped negative evaluation, not merely absence of an event.
- `UNKNOWN` is a legitimate output; do not fill gaps with guesses.
- Ground truth vocabulary is separate: `PROPAGATED` / `NOT_PROPAGATED`.
- Predictor output vocabulary is: `OBSERVED`, `POSSIBLE`, `REFUTED_FOR_RUN`, `UNKNOWN`.
- The predictor must not inspect truth labels. Import-boundary checks and tests should guard this.
- Do not report numeric confidence scores in v1; use a structured coverage vector.

---

## 6. Evidence and Coverage

The architecture requires structured coverage, not a single confidence number. The coverage vector helps determine whether a negative evaluation is complete for a particular dependency key.

The shared contract includes `CoverageVector.is_complete_for(key)`. The `RuntimeEvidence` contract is designed to reject a negative evaluation unless coverage is complete. This guards against converting “we saw nothing” into “it did not happen.”

Evidence should preserve provenance and scope, including run, evaluated dependency, coverage, and relevant temporal context. Raw evidence should remain immutable; derived states should be reproducible from evidence and the rules.

The UI evidence panel should explain the records and caveats behind a dependency. A colored edge without supporting detail is insufficient.

---

## 7. Bitemporal Model: Two Different Questions

Keep these time dimensions separate:

1. **Valid time — “Valid at”**: when the fact/relationship is considered valid in the modeled world.
2. **Transaction/recorded time — “Known as of”**: when the system had recorded or known that fact.

They answer different questions:
- “What lineage was valid at date X?”
- “What did the platform know by date Y?”

A fact can be valid at an earlier date but only recorded later. Historical queries need both dimensions.

### UI expectations

- Separate “Valid at” and “Known as of” controls.
- Show a clear historical/as-of banner for historical results.
- Display the selected temporal context.
- Preserve evidence/provenance and historical versions.
- Reject invalid timestamp parameters.

### Current Hatchable terminology

The app uses controls `validTime` and `recordedTime`; the frontend query parameters are `valid_as_of` and `recorded_as_of`. Names can differ, but the two meanings must never be collapsed.

---

## 8. Current Dashboard Files and Scope

| File/path | Role | Rule for current lineage task |
|---|---|---|
| `public/index.html` | Entry point; loads current theme. | Preserve unless a specific need is established. |
| `public/app.js` | Main UI and lineage behavior. | Primary area for interaction restoration. |
| `public/styles.neo.css` | Current main theme/design system. | **Do not modify.** |
| `public/styles.css` | Existing stylesheet. | **Do not modify.** |
| `public/observatory.js` | Three.js/3D Observatory. | **Keep unchanged.** |
| `public/stewardship.js` | Stewardship behavior. | Avoid unrelated edits. |
| `api/v1/ingest.js` | Ingestion endpoint. | Three CTE-alias lint warnings remain; inspect carefully if touching. |
| `/api/v1/column-lineage` | Retrieves stored column mappings. | Admin-only according to current notes. |
| `migrations/` | PostgreSQL schema migrations. | Eight migrations were included in the last dry run. |
| `kairos_column_lineage` | Column mapping table added by migration 008. | Schema exists; current notes say no mapping rows have been ingested. |

### Explicit design requirement

The user requested that the current CSS styling remain unchanged. Restore older lineage explorer functionality using the current app's design system, existing CSS variables, classes, typography, and shell. Do not copy the old black/dark styling or old project's CSS. Do not change the 3D Observatory.

---

## 9. Current Lineage Explorer: Existing Features

The current `lineagePage()` in `public/app.js` already has:
- Search input `graphSearch`.
- Direction selector `graphMode`: all/upstream/downstream.
- Depth selector `graphDepth`: 1, 2, full.
- Valid-time input `validTime`.
- Recorded-time input `recordedTime`.
- “Check time” action.
- “Column lineage” / “Table lineage” toggle.
- “Column mappings” inventory button.
- “Impact analysis”.
- “Export impact”.
- Zoom out/reset/zoom in.
- Fullscreen action.
- Evidence legend for Observed, Possible, Refuted for run, Unknown.
- Selected-asset details and impact panel.

Current graph behavior reported by code audit:
- SVG graph.
- Clickable and keyboard-accessible nodes and edges.
- Pan and zoom.
- Edge inspector modal with evidence state, relationship metadata, coverage vector, and warnings that a graph edge alone does not prove execution.
- Edge styles based on evidence state and current CSS variables.
- Column graph reads persisted `S.columnMappings` in PostgreSQL mode, or demo metadata mappings in demo mode.
- Empty state when mappings are absent; notes that table edges/column definitions do not prove column-to-column lineage.
- Persisted mode should not blend demo mappings into real stored mappings.

### Known gaps / work not yet verified

1. A functional evidence-state filter is **not currently exposed/implemented**, even though the graph styles edges by state.
2. Several visible actions need an audit to determine whether they work fully or are incomplete/no-op:
   - `column-mappings`
   - `export-column-mappings`
   - `trace-column`
   - `impact-analysis`
   - `export-impact`
   - `graph-zoom-*`
   - `fullscreen-lineage`
   - `column-lineage`
   - `compare-time`
3. A previous patch attempt failed because the exact source string did not match. That attempt made no UI change.
4. The latest deploy attempt was deduplicated to v184 because the files were unchanged. It did not ship UI restoration.

These are identified gaps, not proof that every listed handler is broken. Audit the actual source before changing anything.

---

## 10. Older Reference UI and Desired Behavior

Reference project:
- **Name:** Kairos Lineage Dashboard
- **Project ID:** `proj_pYDQ72YNPuk8`
- **Slug:** `kairos-lineage-tde4`
- **URL:** https://kairos-lineage-tde4.hatchable.site
- **Last known version in notes:** v10

The older app used React Flow and Dagre. Use it as a behavioral reference, not as the source of current CSS or production data.

### Functional parity targets

1. **Graph:** large canvas, pan/zoom, fit/reset, selectable nodes/edges, useful details, keyboard-accessible interactions.
2. **Granularity:** table/dataset and column modes; clear switch; column mapping trace/highlight.
3. **Direction/depth:** all/upstream/downstream; depth controls; impact analysis.
4. **Evidence-state filtering:** all plus Observed/Possible/Refuted-for-run/Unknown. The filter must actually change the visible edges, not just decorate the legend.
5. **Evidence inspector:** source/target dataset and column, operator/transform if available, run ID if available, evidence/provenance, coverage vector, valid/recorded time, warnings, unsupported-analysis reasons.
6. **Impact analysis:** upstream/downstream modes, affected-assets table/list, CSV export based on the real selected asset and calculated impact set.
7. **Temporal context:** separate “Valid at” and “Known as of”; historical banner; selected time values actually applied to the query or an explicit explanation of what was not applied.
8. **Column mapping inventory/export:** show persisted mappings and export the displayed/filtered set; honest empty state when no rows exist.
9. **Current theme:** existing classes and CSS variables only; no unrelated redesign; leave Observatory unchanged.

The current vanilla SVG implementation may be sufficient. Do not introduce React Flow/Dagre solely to copy the old implementation if existing code can meet the acceptance criteria.

---

## 11. Data Integrity: Do Not Turn Mock Data into Real Lineage

The older project uses mock-backed API/data (`is_mock: true`). Its sample catalog has 8 assets, 7 dataset edges, and 16 illustrative column mappings. Reported mock states: 8 Observed, 4 Possible, 2 Refuted for this run, and 2 Unknown.

These examples may help reproduce interactions, but **must not be copied into current production storage or presented as real evidence**.

Key distinctions:
- A static declared mapping is not runtime execution proof.
- A dataset-level edge does not establish reliable column-to-column lineage.
- Imported column mappings must carry provenance/disclosure.
- An edge by itself does not prove that a dependency executed.
- If persisted mappings are absent, show the honest empty state instead of substituting demo mappings.
- Persisted mode must not mix demo data with real stored mappings.
- Never invent evidence records, run IDs, coverage, dates, or states.
- Missing events must not be treated as negative evaluation.

### Current column-lineage storage/API notes

- Migration 008 created `kairos_column_lineage`.
- Frontend persisted mode fetches catalog and `/api/v1/column-lineage?valid_as_of=...&recorded_as_of=...`.
- The endpoint is admin-only according to the current notes: admin request 200, anonymous 401, member 403.
- Ingestion is admin-only.
- Importer validates source/target columns and temporal intervals.
- Mapping keys use a `generic-column:` prefix plus a fingerprint of edge ID/source column/target column.
- Imported mappings are disclosed as supplied mappings, not independently verified execution proof.
- **Latest notes say no mapping rows have been ingested.** A blank column-lineage view can therefore be correct.
- Mapping upsert uses advisory transaction locking and CTEs, but end-to-end idempotency against a real mapping row has not been verified in the notes. Add an integration test before claiming it is proven.

---

## 12. Temporal API and Access

- Temporal query parameters: `valid_as_of` and `recorded_as_of`.
- Invalid timestamps are rejected.
- The frontend sends both time values separately.
- Column-lineage retrieval and ingestion are admin-only.
- Project visibility is currently noted as personal/private. A live URL does not guarantee anonymous visitors can view the dashboard without signing in.

A temporary preview link can bypass only the platform sign-in wall for a limited time; it does not make the project permanently public and does not bypass the app's own authorization. Permanent visibility is a user-controlled setting.

---

## 13. Latest Deployment and Validation Before This File Was Added

- Latest live version: **v184**.
- Latest deploy request said the exact files were already live as v184 and returned `deduplicated: true`; no new version was created.
- The dry-run validator returned `ok: true`, with no blocking errors.
- The dry-run summary listed 15 public files, 15 API functions, 0 pages, 8 migrations, and `auth_enabled: false`; it would have created v185 if there had been a file change.

### Three non-blocking warnings

All refer to `api/v1/ingest.js:104`:
- `lock_key`
- `ts`
- `existing`

The missing-table linter interpreted these CTE aliases as physical table names. They may be false positives, but that is not yet independently confirmed. Do not create fake tables to silence them. Inspect the SQL and test actual runtime behavior.

### Previously recorded file hashes

These were recorded in earlier working notes; recompute before and after any future edit rather than assuming they remain current:

- `public/observatory.js`: `ad275205fd151a0f92e644a5e32b4f6e6734a7d1a2c2bc2d28cc63ff3a3e9286`
- `public/styles.css`: `8479e27d5d9cbc0da7346053c1b92374fe83c685d62cb23011d9b669669f16b7`
- `public/styles.neo.css`: `6d8b148966a936c4676159343376555b05f59a301970be4bde6c48aad3d3053e`
- `public/app.js`: `c19f91732df6305103f0cabc4ec74bb2da6c5664090ea813b4b96b561c349c8a`

Protected stylesheet and Observatory hashes must remain unchanged during the current lineage-only task.

---

## 14. Team Ownership (M1–M5)

Use the role IDs below; confirm exact names/handles with the team.

### M1 — Static metadata ingestion and SQL lineage
Responsibilities:
- SQL parsing/static lineage, using SQLGlot in the project context.
- Dataset and column lineage.
- Schema snapshot and normalization.
- Supported/unsupported SQL behavior with explicit unsupported reasons.
- dbt manifest support if selected.
- Static evidence adapter for shared contracts.
- Tests for extraction and unsupported cases.

Must not treat static possibility as runtime proof or invent runtime evidence/ground truth.

### M2 — Runtime evidence and ground truth
Responsibilities:
- Runtime evidence provider and coverage.
- Independent ground-truth provider.
- ProvSQL feasibility spike.
- Reference interpreter fallback behind the same interface if needed.
- Ground-truth protocol and provider tests.

Must not leak truth into predictor inputs or infer `NOT_PROPAGATED` from a missing event. Do not claim ProvSQL works before the spike is documented.

### M3 — Storage and bitemporal lineage
Responsibilities:
- PostgreSQL schema/repository.
- Bitemporal query semantics.
- Immutable raw evidence and separate derived states.
- Conflict retention/version handling.
- Temporal integration tests.
- Optional graph projection only if measured need justifies it.

Must not make Neo4j authoritative or collapse valid time and recorded time.

### M4 — Reasoning and experiments
Responsibilities:
- Four-state rules R1–R5.
- Baselines B1–B5 plus proposed method.
- Metrics and reproducible evaluation.
- Observation-loss mechanisms/levels.
- Pilot and kill-criteria process.
- Leakage tests/import-boundary checks.
- Analysis only after reproducible runs.

Must not import truth into predictor code, reuse excluded old numbers, skip the pilot decision, or present mock results as research results.

### M5 — API and UI
Responsibilities:
- Versioned `/api/v1` contracts and stable error shapes.
- Stage 1 UI: lineage explorer, search, two time controls, historical banner, evidence panel.
- API/UI integration.
- Acceptance tests for states, time context, empty/error cases.
- Clear static-vs-runtime disclosures.

Must not put parsing/storage/reasoning in UI code as a competing source of truth or merge the two time dimensions.

### Shared development rules
- Use labelled mocks so teams can work independently.
- Mock-derived behavior is **PLUMBING**, not a research result.
- Use feature branches and pull requests; protect main and require review/CI as described in the Team Guide.
- Shared contracts are the interface; coordinate changes through contract owners.
- If a shared-code test fails outside your module, stop and contact its owner rather than changing the test just to pass.

---

## 15. Baselines, Metrics, and Experiment Plan

The Architecture Pack locks baselines B1–B5 plus the proposed method:

- **B1:** Static-only.
- **B2:** Negative assumption.
- **B3:** Union.
- **B4:** Three-state.
- **B5:** Coverage-gated.
- **Proposed method:** Execution-conditioned reasoning with explicit evidence/coverage semantics.

Use the shared contracts and implementation for exact definitions; do not improvise definitions from these short labels.

### Observation loss
- Locked levels: `0, 10, 30, 50, 70, 90`.
- The contract's six named loss mechanisms are canonical.
- Some consistency rules and kill thresholds remain pending team decisions.

### Metrics and reporting
- Use metric definitions in `research/metrics/metrics.py` and the Architecture Pack.
- A zero-denominator rate should be `NA`, not silently forced to zero.
- The Architecture Pack replaced state-classification accuracy with commitment-rate reporting; do not map a truth label into a predictor state and call that a correct four-state prediction.
- Tie results to reproducible run/configuration records.
- Run the pilot first and record the decision; run the full experiment only if pre-agreed criteria support proceeding.
- Kill-criteria rule is locked, but numerical thresholds are pending.
- Dataset/license review and environment matrix are pending team input.

---

## 16. Open Decisions and Limitations

Keep these open until resolved with evidence:
1. **ProvSQL feasibility:** candidate, not confirmed.
2. **Column-level ground truth:** open; do not claim independent truth for every column dependency.
3. **Pilot kill thresholds:** process is locked; exact values pending.
4. **Dataset/license review:** pending.
5. **Environment matrix:** pending; Docker choice not fully settled.
6. **Neo4j:** optional and only if measured need exists.
7. **Conflict display precedence:** conflict retention is locked; exact precedence remains provisional.
8. **Extra API routes:** `/api/v1` prefix and stable error shape are locked; extra routes are provisional unless contract-specified.
9. **Loss-mechanism mapping details:** six contract mechanisms are canonical; some mapping details remain provisional.
10. **Dashboard UI parity:** state filter and action-handler audit remain outstanding.
11. **Column mapping ingestion:** schema/API exist; latest notes say no rows have been ingested.
12. **Ingestion upsert:** not fully verified end-to-end against a real mapping row.
13. **Validator warnings:** three CTE-alias warnings remain; likely false positives but not confirmed.
14. **Deployment:** v184 was live before this file was added; a new version is needed to serve the new handoff file.
15. **Private access:** teammates may need project authorization or a temporary preview link.

---

## 17. Active UI Task: Scope and Acceptance Criteria

The immediate task is to restore the older lineage explorer's useful interactions while preserving the current app styling and unrelated features.

### In scope
- Audit `public/app.js` state and event handlers.
- Add a functional evidence-state filter using current classes/variables.
- Fix controls that are demonstrably no-op or incomplete.
- Verify search, direction, depth, temporal controls, granularity toggle, impact, exports, zoom, fullscreen, and column tracing.
- Ensure the evidence inspector exposes available provenance/coverage without fabricating missing data.
- Preserve the current SVG implementation if it meets the requirements.
- Keep persisted-mode empty states honest.
- Test on preview before deployment.
- Recompute hashes to verify protected files remain unchanged.

### Explicitly out of scope without separate approval
- Editing `public/styles.neo.css`.
- Editing `public/styles.css`.
- Editing `public/observatory.js`.
- Redesigning unrelated dashboard sections.
- Copying old project's CSS.
- Importing mock relationships into production storage.
- Changing research semantics or database authority.
- Adding confidence scores.
- Claiming experimental validation.

### Suggested sequence
1. Read current `public/app.js` and locate state/handlers.
2. Record current hashes of CSS, Observatory, and app JS.
3. Audit each lineage control from markup to handler.
4. Add evidence-state filter state (default `all`) and apply it to graph edge rendering using the existing evidence-state resolver.
5. Ensure node/edge selection remains sensible when filters change.
6. Verify impact table/export, mapping inventory/export, temporal query, zoom/reset, fullscreen, and column trace.
7. Run syntax checks and Hatchable dry-run validation.
8. Use a preview/real browser to verify interactions and persisted-mode empty behavior.
9. Recompute hashes; CSS and Observatory hashes must be unchanged.
10. Deploy only after a meaningful change and verification; confirm the new version and live behavior. If deployment is deduplicated, report that accurately.

---

## 18. API and Data Verification Notes

Before claiming an endpoint works, test with the relevant role and record the result. A 401/403 may be the intended authorization behavior, not a server failure.

The current notes say:
- PostgreSQL is canonical persistence for lineage records.
- Migration 008 created the column-lineage table.
- Persisted mode calls the column-lineage endpoint with both temporal parameters.
- Demo and persisted modes must remain separate.
- Column-lineage read and ingestion are admin-only.
- Supplied mappings are disclosed as not independently verified execution proof.
- The graph inspector warns that an edge alone does not prove execution.
- Invalid timestamps are rejected.

Verify these behaviors against the current app before treating historical notes as proof of present behavior.

---

## 19. Teammate Checklist

### Understand the design
- [ ] Read `TEAM_GUIDE.md`.
- [ ] Read the Architecture Pack's sections on four-state semantics, bitemporal model, evidence, ground truth, API/UI, team roles, and decision log.
- [ ] Understand research foundation vs Hatchable dashboard.
- [ ] Confirm shared contract rules before changing semantics.

### Establish current UI state
- [ ] Open the Hatchable project and inspect current files.
- [ ] Confirm latest deployment version after the handoff file is deployed.
- [ ] Use preview access if needed.
- [ ] Recompute protected-file hashes.
- [ ] Compare current lineage interactions with the older reference.
- [ ] Confirm persisted mode does not fall back to demo mappings.

### Validate data integrity
- [ ] Check whether `kairos_column_lineage` has rows; last notes say none have been ingested.
- [ ] Do not copy old mock mappings into production.
- [ ] Test admin/member/anonymous access.
- [ ] Test valid and recorded time separately.
- [ ] Check evidence wording for overclaims.
- [ ] Test empty mappings and unsupported/missing identity cases.

### Complete UI restoration
- [ ] Add/verify evidence-state filtering.
- [ ] Audit every visible action and handler.
- [ ] Verify column mapping inventory/export.
- [ ] Verify trace-column and impact analysis.
- [ ] Verify impact CSV accuracy.
- [ ] Verify zoom/reset/fullscreen.
- [ ] Verify time controls affect actual queries.
- [ ] Keep CSS and Observatory unchanged.
- [ ] Verify on preview.
- [ ] Deploy only after changes exist and validation passes.

### Protect research integrity
- [ ] Run import-boundary checks.
- [ ] Run unit tests.
- [ ] Never feed ground truth into predictions.
- [ ] Never equate missing observations with refutation.
- [ ] Never publish mock-derived performance as results.
- [ ] Record ProvSQL spike, pilot decision, dataset/license review, and thresholds when available.

---

## 20. Deployment and Sharing

Current live URL: https://kairos-metadata.hatchable.site

The project is recorded as personal/private in the working notes. If a teammate cannot open the URL, check project authorization or create a temporary preview link. A preview link is temporary and does not make the project permanently public.

A deploy counts as a new deployment only when Hatchable returns a new version. The last deploy attempt before this file was added was deduplicated to v184. Because this handoff file is a new project file, deployment should be run and its returned version verified before telling teammates the file is live.

The previous dry run had zero blocking errors and three CTE-alias warnings. Do not silence them by creating fake tables; inspect the query and verify runtime behavior.

---

## 21. Status Vocabulary for Future Updates

Use these labels in issue trackers and handoffs:

- **IMPLEMENTED / VERIFIED:** tested in the target environment and evidence recorded.
- **IMPLEMENTED / NOT FULLY VERIFIED:** code exists, but end-to-end behavior has not been demonstrated.
- **PLANNED:** in the architecture/spec but not confirmed in implementation.
- **PENDING:** an explicit decision or experiment remains open.
- **MOCK / PLUMBING:** tests module wiring; not a research result.
- **KNOWN LIMITATION:** evidence does not support a stronger claim.
- **DEPLOYED:** a specific version is confirmed live; this does not mean every intended feature is complete.

Do not turn “the code exists” into “the feature works,” or “the app is live” into “the research is validated.”

---

## 22. Short Handoff

Kairos Metadata Lineage Dashboard is hosted at https://kairos-metadata.hatchable.site under Hatchable project `proj_HTYAd2BCLtMt`. The latest confirmed live version before this handoff file was added is v184. The last deployment request was deduplicated because no files had changed. A dry-run had no blocking errors but three non-blocking CTE-alias warnings at `api/v1/ingest.js:104` (`lock_key`, `ts`, `existing`).

The active task is to restore the older lineage explorer interactions while preserving current styling. Do not modify `public/styles.neo.css`, `public/styles.css`, or `public/observatory.js`. The current explorer already has search, direction/depth, separate valid/recorded time controls, table/column toggle, mapping inventory, impact analysis, export controls, zoom, fullscreen, and state styling. The clearest known gap is a functional evidence-state filter; other visible actions need a handler audit. A previous patch attempt failed to match the exact source and made no change.

Column-lineage storage exists after migration 008, and the endpoint is admin-only. Latest notes say no mappings have been ingested. Do not copy old mock mappings into production or present them as real lineage. The old project (`proj_pYDQ72YNPuk8`, `kairos-lineage-tde4`) is a behavioral reference, not a source of production evidence.

Research architecture: PostgreSQL is authoritative; Neo4j is optional/rebuildable. Valid time and recorded time are separate. The four states have strict semantics. `REFUTED_FOR_RUN` requires complete negative evaluation for that run. Ground truth (`PROPAGATED`/`NOT_PROPAGATED`) must never enter predictor inputs. The hypothesis is provisional; ProvSQL feasibility, column-level ground truth, pilot thresholds, dataset/license review, and experiments remain open.

**Recommended next move:** audit `public/app.js` handlers, implement and test the state filter using current CSS classes/variables, verify all lineage actions and persisted-mode empty behavior, prove protected CSS/Observatory hashes are unchanged, test via preview, then deploy and confirm a genuinely new version.