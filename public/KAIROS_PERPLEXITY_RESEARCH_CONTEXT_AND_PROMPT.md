# KAIROS — FULL PROJECT CONTEXT, CURRENT APP INVENTORY, RESEARCH CONTRACT, AND PERPLEXITY BRIEF

**Document purpose:** This is the expanded, source-grounded handoff for external research and subsequent implementation planning. It is intentionally much more detailed than a short prompt. It describes the project as it exists across (A) the original research design, (B) the small Python research-foundation repository described by the Team Guide, and (C) the separate Hatchable dashboard currently in the project workspace.

**Project name:** Kairos Metadata Lineage Dashboard  
**Hatchable project ID:** proj_HTYAd2BCLtMt  
**Slug:** kairos-metadata  
**App URL:** https://kairos-metadata.hatchable.site  
**Hatchable registry version checked for this document:** 301  
**Document update date:** 2026-10-28  
**Visibility / deployment note:** This document is saved as a project-file draft. It has NOT been deployed or published by this edit. Do not deploy unless the owner explicitly asks.

---

# PART A — HOW TO READ THIS DOCUMENT

## A1. Evidence labels

Every downstream agent must keep these categories separate.

- **SOURCE-DESIGN REQUIREMENT:** stated in the Final Architecture & Research Execution Pack or Team Guide.
- **CURRENT-CODE OBSERVATION:** found by reading a specific current Hatchable file.
- **PRIOR READ-ONLY CHECK:** reported in the existing Hatchable changelog from a prior test. It may be stale and must be rechecked before implementation decisions.
- **DEMO / SYNTHETIC:** illustrative records or UI examples, not real source observations.
- **MOCK / SIMULATED:** code intentionally produces artificial values or curated responses.
- **EMPTY-BUT-WORKING:** a query/route has worked against an empty or nearly empty store; this is not proof of a populated end-to-end feature.
- **PARTIALLY VERIFIED:** one layer or path was checked, but the complete user workflow was not.
- **UNVERIFIED:** code exists or a plan says it should exist, but working end-to-end behavior has not been demonstrated.
- **OPEN DECISION:** needs team/owner agreement or experiment; do not silently decide.
- **RESEARCH HYPOTHESIS:** an idea that must be evaluated empirically, not marketed as a proven result.

## A2. Rules for any research or coding agent

1. Do not treat a file existing as proof that its feature works end-to-end.
2. Do not treat an API returning HTTP 200 as proof that a connector, lineage algorithm, or UI workflow is correct.
3. Do not treat a database row as proof that an external connector is active or that runtime lineage was independently observed.
4. Do not silently fill empty connected-source data with demo fixtures.
5. Do not claim the research hypothesis has been validated.
6. Do not invent performance numbers, benchmark outcomes, connector coverage, or security guarantees.
7. Do not alter production records, database schema, permissions, visibility, secrets, or deployment state without explicit authorization.
8. Keep all proposed changes tied to actual current file paths and acceptance tests.
9. If a research source disagrees with the architecture pack, report the conflict instead of silently replacing the contract.
10. If information is not available in these materials, mark it unknown and state how it should be verified.

---

# PART B — EXECUTIVE SUMMARY AND PROJECT IDENTITY

## B1. What Kairos is

Kairos is a university project about metadata, data lineage, evidence provenance, historical reconstruction, and careful reasoning about execution-specific dependencies when runtime observations are incomplete.

The project has two related but distinct surfaces:

### Surface 1: Research foundation

The intended research foundation is the Python repository described by `TEAM_GUIDE.md`, named `data-lineage-engine/`. It has shared contracts, a four-state reasoning engine, five baselines, metrics, fixture plumbing, import-boundary checks, tests, and a small FastAPI slice. The Team Guide says the wider ingestion, database, ground-truth provider, full API/UI, and experiment implementation are assigned workstreams rather than already complete in that foundation repository.

**Important:** The Team Guide describes a foundation codebase and expected test counts; those descriptions are not proof that the team has run the current repository on every machine. This Python repository is not the same thing as the larger Hatchable website.

### Surface 2: Hatchable product/dashboard

The current Hatchable project is a full-stack prototype called **Kairos Metadata Lineage Dashboard**. It contains a vanilla HTML/CSS/JavaScript frontend, serverless JavaScript API handlers, PostgreSQL migrations and tables, metadata ingestion/preview routes, lineage/evidence endpoints, catalog/search/governance areas, and an interactive 3D Observatory module.

This dashboard has grown beyond the small research MVP. Some areas are persisted and API-backed; some are demo-driven; some are prototypes or planned plumbing. The dashboard being online does not prove that the original research contribution is implemented or validated.

## B2. Product ambition

The product direction is an adaptable metadata workspace that should show what the user's actual sources and permissions support.

Examples of intended user situations:
- An individual imports local JSON metadata or a file inventory.
- A developer provides a GitHub repository or supported repository metadata artifact.
- A data team imports dbt artifacts.
- A data engineering team sends OpenLineage run events.
- A user eventually connects a supported database/catalog adapter.

The dashboard should derive its available sections from source capabilities and real data. A file inventory should not be presented as though it has SQL schema or pipeline execution history. A source without column lineage should not receive invented column edges. A connected store with zero records should remain honestly empty.

**Current boundary:** The existing backend code documents generic JSON preview, generic metadata-graph import, persisted catalog reads, and partial dbt/OpenLineage artifact handling. It explicitly does not establish arbitrary authenticated live connectors, universal scheduled scans, or universal SQL/lineage inference.

## B3. Current platform details

- Hosted on Hatchable.
- Project ID: `proj_HTYAd2BCLtMt`.
- Slug: `kairos-metadata`.
- URL: `https://kairos-metadata.hatchable.site`.
- Project tier: personal.
- Current registry version checked: 301.
- Owner role in project registry: owner.
- Frontend is static files under `public/`; no conventional build step.
- API handlers are under `api/` and use Hatchable's serverless runtime.
- Persistence is a project-dedicated PostgreSQL database accessed using the Hatchable SDK's `db.query`.
- There is no evidence in the project registry of configured environment variables at the time checked.
- The app's own UI includes Demo Workspace and Connected Catalog modes.
- Do not make the project public or deploy this context file unless the owner asks.

---

# PART C — THE ORIGINAL RESEARCH PROBLEM

## C1. Why simple lineage is insufficient

A relationship between two columns or tables can be supported by different kinds of evidence:
- SQL syntax or static transformation analysis.
- A declared dependency in a dbt manifest.
- A runtime event from an instrumented pipeline.
- A complete negative evaluation for a specific dependency and run.
- A manually supplied or generic metadata relationship.
- No evidence at all, or evidence whose coverage is incomplete.

Those are not interchangeable. A graph arrow by itself does not establish that a source actually contributed to an output during a particular execution.

## C2. Running example

Consider:

```sql
CASE WHEN country = 'US' THEN salary ELSE 0 END AS adjusted_salary
```

Static analysis can identify both `country` and `salary` as possible dependencies of `adjusted_salary`. But for a particular run containing no US rows, `salary` may not have contributed at all. If a runtime event for `salary` is absent, that absence could mean:
- salary did not contribute in that run;
- instrumentation did not observe the relevant operation;
- an event was lost;
- the trace did not cover the relevant path;
- the identity mapping was insufficient to match the event.

The system must not collapse all of these possibilities into “no dependency.”

## C3. Research question

Can coverage-aware reasoning over static lineage and incomplete runtime evidence reduce false conclusions about execution-specific dependencies, compared with simpler lineage strategies such as static-only, runtime-only, naive union, or a strategy that assumes missing runtime events mean no propagation?

**Status:** Provisional hypothesis; must be validated by a reproducible pilot and controlled experiments.

## C4. Conservative contribution statement

The potential contribution is an operational, coverage-aware method for assigning established dependency semantics to lineage relationships under incomplete runtime evidence, together with an empirical evaluation of whether this reduces false conclusions compared with simpler lineage strategies.

This remains provisional until the experiment supports it. If the hypothesis fails, report the negative result and failure analysis honestly; the engineering system can still be useful.

## C5. What Kairos is NOT claiming

Do not claim Kairos invented:
- bitemporal data or bitemporal lineage;
- provenance tracking;
- incomplete-information semantics;
- the four-state vocabulary as a new theoretical logic;
- runtime lineage or OpenLineage;
- SQL parsing or graph lineage;
- generic lineage reconciliation or graph analytics.

Do not claim that combining familiar components is novel by itself, that an `as_of` parameter is novel, or that Kairos replaces DataHub, OpenMetadata, or Atlan.

Do not use the word “causal” to describe the research method. The project studies execution-specific dependency and runtime contribution; it does not establish causality.

---

# PART D — NON-NEGOTIABLE RESEARCH AND ARCHITECTURE CONTRACT

## D1. Persistence authority

- PostgreSQL is the authoritative persistent store.
- Neo4j, if ever adopted, is optional, derived, and rebuildable.
- Neo4j must never become the only source of truth.
- The research runner should work without the API, UI, or Neo4j.
- Do not introduce a second authoritative database or graph store without an explicit decision.

## D2. Core MVP input sources

The original research MVP names three core inputs:
1. SQL text parsed with SQLGlot.
2. dbt `manifest.json`.
3. OpenLineage runtime events.

The Hatchable prototype also accepts broader JSON artifacts and generic metadata graphs. Treat these as a product/onboarding extension, not as proof that the research adapters are complete.

## D3. Separate evidence layers

Keep separate:
1. Immutable raw source artifacts.
2. Normalized source metadata/evidence.
3. Derived reasoning/prediction results.
4. Independent ground-truth labels used for evaluation.

Never overwrite raw evidence with an interpretation. Never silently replace conflicting source claims; retain versions and surface the conflict. Provenance must identify where a claim came from and when it was recorded.

## D4. Temporal semantics

The design has two distinct times:
- **Valid time:** when a relationship or fact applies in the modeled world.
- **Transaction/knowledge time:** when Kairos recorded or knew that fact.

The conceptual query asks: “What lineage was valid at time X, according to what we had recorded by time Y?”

The API and UI must keep the two controls separate. A single timestamp must not be used to conflate these meanings.

Current Hatchable evidence and column-lineage query code uses `valid_from`, `valid_to`, `recorded_from`, and `recorded_to`. Undated valid-time records are counted separately in the relevant endpoints rather than silently included as temporally valid.

Current schema limitation: the table-level `kairos_lineage_edges` table has no bitemporal interval columns; lineage export explicitly states table-level edges are exported as currently stored relationships, while column mappings and evidence receive temporal filtering. Do not claim complete bitemporal history for every table-level edge without changing and testing the schema.

## D5. Four predictor states

The research predictor uses exactly these state labels:
- `OBSERVED`
- `REFUTED_FOR_RUN`
- `POSSIBLE`
- `UNKNOWN`

Do not treat these as an invented formal logic. They are operational labels mapping to established evidence/dependency semantics.

## D6. State semantics and safeguards

- **OBSERVED:** positive runtime evidence supports the dependency for the relevant run/scope.
- **REFUTED_FOR_RUN:** only a complete negative evaluation for the relevant dependency and run supports refutation. It must include run scope and explicit coverage; absence of an event is not enough.
- **POSSIBLE:** static analysis supports the dependency, but neither positive runtime evidence nor a complete negative evaluation resolves the run-specific question.
- **UNKNOWN:** identity is missing, static analysis is unsupported, or no reliable evidence supports a more specific conclusion.

The ingestion code currently validates `REFUTED_FOR_RUN` evidence by requiring a `run_id`, non-empty `coverage`, and `metadata.complete_negative_evaluation === true`. Preserve and test that guard.

## D7. Ground-truth separation

Ground truth has a different label vocabulary:
- `PROPAGATED`
- `NOT_PROPAGATED`

Ground truth is only used to score predictions. It must never be an input to the predictor or reasoning engine. The codebase described in the Team Guide enforces this with module/import boundaries and tests. Never weaken those tests to make a leaking implementation pass.

## D8. SQL and benchmark scope

The research benchmark uses a restricted deterministic SQL subset and independent ground truth. The architecture pack explicitly excludes from the MVP unless reopened:
- arbitrary SQL;
- dynamic SQL;
- user-defined functions;
- window functions;
- outer joins, including LEFT JOIN, in the ground-truth-backed benchmark;
- Airflow integration;
- enterprise IAM/policy engines;
- Kubernetes/cloud deployment;
- graph neural networks;
- LLM/RAG features as part of the research MVP;
- connector marketplace;
- multiple graph stores.

The Hatchable UI has an illustrative SQL-analysis screen with a LEFT JOIN example. That UI example must not be confused with a supported ground-truth-backed benchmark case.

## D9. Experimental integrity

- Run a pilot before the full experiment.
- Freeze result-classification rules and kill criteria before the full run.
- The loss grid in the architecture pack is 0, 10, 30, 50, 70, and 90 percent.
- Compare baselines B1–B5 plus the proposed method.
- Use the pack's metrics and ablations.
- Old self-reported prototype numbers are excluded as evidence because the code/evaluation was not independently reproducible.
- Mock fixture results are plumbing tests, not scientific findings.
- Thresholds and some open decisions remain pending; do not invent them.

---

# PART E — RESEARCH FOUNDATION REPOSITORY FROM TEAM_GUIDE.md

## E1. Important distinction

The supplied Team Guide describes a separate small repository named `data-lineage-engine/`. It is not the Hatchable project file tree. Do not imply that files listed here exist in Hatchable unless they are separately visible there.

## E2. Foundation repository structure

```text
data-lineage-engine/
├── README.md
├── pyproject.toml
├── .env.example
├── .gitignore
├── .github/
│   ├── CODEOWNERS
│   └── workflows/ci.yml
├── docs/
│   ├── FINAL_ARCHITECTURE_AND_RESEARCH_EXECUTION_PACK.md/.docx
│   └── TEAM_GUIDE.md/.docx
├── contracts/
│   ├── types.py
│   ├── evidence.py
│   ├── truth.py
│   ├── interfaces.py
│   ├── mocks/loaders.py
│   ├── mocks/providers.py
│   └── fixtures/w03_case_when*.json
├── research/
│   ├── reasoning/engine.py
│   ├── baselines/baselines.py
│   ├── metrics/metrics.py
│   ├── ground_truth/
│   ├── protocol/
│   ├── benchmarks/
│   ├── missingness/
│   ├── experiments/
│   └── results/
├── backend/app/main.py
├── ingestion/
├── frontend/
├── configs/
├── data/
├── scripts/
│   ├── check_import_boundaries.py
│   └── make_fixtures.py
└── tests/
```

## E3. Foundation module responsibilities

- `contracts/types.py`: four-state enum/types, dependency key, coverage vector. `CoverageVector.is_complete_for(key)` expresses the coverage side of the complete-negative-evaluation rule.
- `contracts/evidence.py`: `StaticEvidence`, `RuntimeEvidence`, `Prediction`, and `PredictorInput`. Runtime evidence must not be constructed as a negative evaluation without complete coverage.
- `contracts/truth.py`: ground-truth-only `TruthLabel` and `GroundTruthRecord`.
- `contracts/interfaces.py`: provider/repository seams for static lineage (M1), runtime evidence (M2), ground truth (M2), reasoning (M4), and storage (M3).
- `research/reasoning/engine.py`: four-state engine implementing rules R1–R5 and scanning predictor input for forbidden ground-truth tokens.
- `research/baselines/baselines.py`: B1 static-only, B2 negative assumption, B3 union, B4 three-state, B5 coverage-gated. M1 contributes the B1 adapter.
- `research/metrics/metrics.py`: scoring/evaluation metrics, including confusion counts and rates; zero denominators are handled as NA.
- `scripts/check_import_boundaries.py`: rejects forbidden dependency directions, including predictor access to ground truth.
- `tests/`: engine-rule, baseline, metrics, leakage, and fixture-plumbing tests.
- `backend/app/main.py`: tiny FastAPI slice with health and a mock-backed dependency route, according to the guide.
- The guide documents expected baseline tests of 31 passed and 1 skipped; with FastAPI and HTTPX it expects 34 passing. These are documented expectations, not current execution evidence.

## E4. Foundation engine rules in plain language

The first matching rule wins:
- R1: missing column identity or unsupported static analysis → UNKNOWN.
- R2: positive runtime evidence → OBSERVED.
- R3: static dependency is possible, the relevant static analysis is supported, and a complete negative evaluation exists → REFUTED_FOR_RUN.
- R4: static dependency is possible but neither positive evidence nor a complete negative evaluation exists → POSSIBLE.
- R5: nothing supports the dependency → UNKNOWN.

## E5. Fixture semantics

The `w03_case_when` fixture uses the CASE WHEN salary example and four illustrative runs:
- Run A: US rows exist; salary runtime contribution observed; mock truth PROPAGATED.
- Run B: no US rows; complete negative evaluation; mock truth NOT_PROPAGATED.
- Run C: no US rows; evidence lost; mock truth NOT_PROPAGATED.
- Run D: US rows exist; evidence lost; mock truth PROPAGATED.

The fixture demonstrates plumbing and the danger of treating missing events as negative evidence. It is not real-world experimental validation.

## E6. Team workstream matrix from the original pack/guide

The five-member split is a locked planning decision unless the team formally reopens it:
- **M1 — Static lineage:** SQLGlot parsing/lineage, schema snapshot, static evidence, dbt manifest ingestion, unsupported-SQL reporting, and static tests.
- **M2 — Runtime evidence and ground truth:** OpenLineage normalization, event/coverage handling, ground-truth provider, ProvSQL feasibility spike, and a fallback ReferenceInterpreterProvider if required.
- **M3 — Storage and bitemporal lineage:** PostgreSQL schema/repository, immutable raw evidence, temporal queries, identity, and optional Neo4j projection only if justified.
- **M4 — Reasoning and experiments:** four-state engine, B1–B5 baselines, metrics, loss mechanisms, pilot/full experiments, leakage checks, and research reporting.
- **M5 — API and UI:** versioned API contracts, thin UI, integration, error shape, and UI Stage 1 with separate valid-time and knowledge-time controls.

Do not reassign people or claim named-person assignments from this matrix without a team-approved record. The current Hatchable file `public/KAIROS_LINEAGE_EXECUTION_PLAN.md` names Pranav as owner of the Lineage Explorer UI task; that is a dashboard task note, not a replacement for the M1–M5 research split.

## E7. Foundation development rules

- Work independently against mocks; label all mock-derived outputs PLUMBING.
- Do not wait on other members before writing contract-compatible tests.
- Changes to shared contracts need cross-member review.
- Never commit `.env`, raw datasets, or ProvSQL build output.
- Use feature branches, pull requests, code-owner review, and green CI.
- Log design changes in a decision log and failed experiments in a research log.
- The four-day checkpoint checks feasibility and interfaces; it does not validate the hypothesis.

---

# PART F — CURRENT HATCHABLE FILE INVENTORY

This inventory reflects the current Hatchable project file list at the time this context was prepared. It is not the same as the Python foundation repository.

## F1. Root/platform files

- `AGENTS.md`: virtual platform-generated instructions. Read-only/generated; do not edit.
- `README.md`: project-level readme.
- `hatchable.toml`: Hatchable project configuration.
- `public/index.html`: main dashboard shell, sidebar navigation, header, theme bootstrapping, app container, modal/toast containers, external chart libraries, and script loading.
- `public/app.js`: main dashboard state, rendering, client-side navigation, demo fixtures, persisted catalog loading, lineage interactions, search/filter/export/time-travel interactions, and other view logic.
- `public/assets.css`: additional dashboard styles.
- `public/styles.css`: earlier/general stylesheet.
- `public/styles.neo.css`: current main Neo-style design stylesheet.
- `public/layout.css`: dashboard layout styles.
- `public/observatory.js`: separate Three.js-based 3D Observatory module.
- `public/stewardship.js`: stewardship/requests/glossary/related client-side module.
- `public/stewardship.css`: stewardship styling.
- `public/pii-lineage-enhancements.js`: PII/lineage enhancement script.
- `public/ingestion.html`: separate metadata onboarding/import page.
- `public/ingestion.js`: ingestion form, file reading, preview validation and import interactions.
- `public/accent-bg.png`, `public/empty-state.png`, `public/logo.png`: static image assets.
- `public/KAIROS_LINEAGE_EXECUTION_PLAN.md`: lineage explorer scope, acceptance tracker, and preservation guardrails.
- `public/KAIROS_TEAMMATE_CONTEXT_HANDOFF.md`: previous teammate handoff; contains earlier-version details and should not override current registry/code.
- `public/BACKEND_INSTRUCTIONS_AND_CHANGELOG.md`: backend guidance, version history, read-only checks, current feature-status notes, and remaining work. Its historical headings can lag the registry; always verify actual version.
- `public/PRANAV_HOME_CATALOG_COMPLETION.md`: prior Home/Catalog work note.
- `public/KAIROS_PERPLEXITY_RESEARCH_CONTEXT_AND_PROMPT.md`: the shorter research prompt this expanded document replaces.
- `public/sdk/kairos_ingest.py`: Python ingestion helper/template.
- `public/sdk/kairos.yaml`: sample/config contract for the ingestion helper.
- `public/sdk/github-actions-template.yml`: GitHub Actions template.
- `public/sdk/Integrations.jsx.txt`: saved integration UI/code reference; the .txt suffix matters and it is not a deployed JSX route.

## F2. API handler files

All these files exist in the current project inventory. Their existence alone does not prove every route's workflow is complete.

- `api/health.js`
- `api/jobs/simulate-quality.js`
- `api/jobs/sync-knowledge.js`
- `api/v1/catalog.js`
- `api/v1/column-lineage.js`
- `api/v1/competitor-research.js`
- `api/v1/data-products.js`
- `api/v1/evidence-at-time.js`
- `api/v1/incidents.js`
- `api/v1/ingest.js`
- `api/v1/lineage/export.js`
- `api/v1/metadata-preview.js`
- `api/v1/pii-classification.js`
- `api/v1/proposal-decision.js`
- `api/v1/proposals.js`
- `api/v1/raw-events.js`
- `api/v1/request-decision.js`
- `api/v1/request-submit.js`
- `api/v1/requests.js`
- `api/v1/search.js`
- `api/v1/webhook.js`
- `api/v1/worker/process.js`

## F3. SQL migrations

- `migrations/001_kairos_metadata.sql`: initial asset catalog, table-level lineage edges, evidence, pipeline-run, and quality-check tables/indexes.
- `migrations/002_kairos_raw_events.sql`: raw source-event ledger with source identifiers, event type/time, recorded time, JSON payload and indexes.
- `migrations/003_kairos_raw_events_immutable.sql`: immutability guard/trigger for raw source artifacts.
- `migrations/004_kairos_data_products.sql`: data products and their asset associations.
- `migrations/005_kairos_durable_jobs.sql`: durable job queue table and queue index.
- `migrations/006_kairos_pgvector_rag.sql`: asset embeddings and RAG trace tables; this schema does not prove a fully operational or grounded RAG user experience.
- `migrations/007_kairos_rls.sql`: enables row-level security on selected tables and declares policies. Several policy expressions use `USING (true)`; this is a security-review item, not by itself proof of a successful exploit. Tenant isolation must be tested and properly implemented before multi-tenant claims.
- `migrations/008_kairos_column_lineage.sql`: column lineage mappings, temporal fields, evidence references and indexes.
- `migrations/009_kairos_pii_classification.sql`: PII/sensitivity classifications and supporting schema.

---

# PART G — CURRENT DASHBOARD: NAVIGATION AND UI AREAS

The following describes the current shell and code-defined UI. It does not mean every page is fully wired to persistent data.

## G1. Global shell

Current `public/index.html` defines:
- A left sidebar with Kairos branding, collapsible/mobile navigation, grouped sections, workspace-mode status card, and a profile shortcut.
- A top bar with breadcrumbs, data-mode selector, environment badge, light/dark theme toggle, global search shortcut (Ctrl+K), help button, and profile avatar.
- A central `#mainContent` area where `app.js` renders the active view.
- A footer that labels Kairos metadata engine, demo/persisted mode, evidence-first lineage, prototype label, and build version.
- Shared toast region and modal dialog.
- Local-storage theme preference key `kairos_theme`.
- Local-storage data-mode preference key `kairos_dataMode`.
- Chart.js loaded from CDN and Three.js loaded from CDN.
- Additional script modules for Observatory and Stewardship.

## G2. Workspace/data-mode control

The topbar has two choices:
- **Demo workspace**
- **Connected catalog**

The sidebar shows a DEMO badge and synthetic-sample explanation in demo mode. The code state defaults to PostgreSQL unless local storage explicitly contains the demo mode value. The user-facing design intends a strict boundary between illustrative records and persisted PostgreSQL records.

Critical acceptance rule:
- Demo values must not be merged into Connected Catalog mode.
- An API failure must not be described as an empty catalog.
- Empty persisted data must not be filled with synthetic examples.
- Labels and counts must reflect the active source.
- Every chart/table/claim must be scoped to its actual data source.

## G3. Home / Overview

Navigation label: **Home**; view key `overview`.

In Demo mode, code builds an illustrative overview containing:
- dependency/evidence-state summary;
- refuted-for-run count;
- sample pipeline runs;
- mean sample quality for records with scores;
- a lineage activity chart;
- evidence-state distribution;
- a sample asset table;
- a recent-activity panel with illustrative events.

The demo overview explicitly says records are synthetic and that no production lineage backend or runtime collector is connected.

In Connected Catalog mode, the intended overview is persisted:
- asset count;
- stored table-level lineage edge count;
- pipeline-run count;
- evidence count;
- catalog asset rows and a lineage preview;
- empty/error states if the catalog cannot be read or has no assets.

The current persisted catalog endpoint is admin-gated. Do not assume every signed-in user can read it.

## G4. Catalog group

Sidebar group: **Catalog**.
Sub-views include:
- **All assets** / asset inventory;
- **Catalog structure**;
- **Catalog search**;
- **Data Products**.

### All assets / asset inventory

Code supports asset filtering/search/sorting and metadata-driven tables. The asset inspector can show:
- qualified path/name;
- type and kind;
- owner;
- quality if recorded;
- row and column counts if available;
- upstream/downstream counts;
- owner count for impacted downstream assets;
- evidence records matched by asset names/paths;
- tabs/sections for lineage, impact, and column-related inspection where supported.

Missing fields should be shown as missing/not recorded rather than fabricated. The current asset hero explicitly labels missing quality as “QUALITY NOT RECORDED”.

### Catalog structure

Intended to expose catalog hierarchy/metadata structure. Verify actual page behavior before asserting support for any source-specific hierarchy.

### Catalog search

There is a persisted keyword-search API, described in Part J. It is not verified semantic search, embeddings-based retrieval, or RAG.

### Data Products

A data-product endpoint and migrations exist. Confirm access controls, persistence, and whether each UI action is truly backed by the API before claiming production-ready data-product lifecycle management.

## G5. Lineage group

Sidebar group: **Lineage**.
Sub-views:
- **Visual explorer**
- **Time travel**
- **SQL analysis**
- **3D observatory** (marked BETA)

### Visual lineage explorer

The current Lineage Explorer implementation is in `public/app.js`. The existing execution-plan note records code/browser checks for:
- graph search and clear-search/no-match state;
- upstream/downstream direction filtering;
- depth control;
- evidence-state filter;
- edge detail/inspector;
- zoom/pan/reset/fullscreen controls;
- impact analysis;
- column mappings and a column inventory search;
- export behavior;
- valid-time and recorded-time controls.

A prior demo browser audit recorded demo counts and interactions; those values are demo-only and must not be presented as current connected-catalog counts. The execution plan specifically says persisted-mode behavior still needs verification in several areas.

Relationship state filtering uses four labels:
- OBSERVED
- POSSIBLE
- REFUTED_FOR_RUN
- UNKNOWN

Do not equate every visual edge with runtime proof. Keep table relationships, declared column mappings, static SQL candidates, and runtime evidence distinct.

### Time travel

The UI has separate valid-time and recorded/knowledge-time controls. The current `api/v1/evidence-at-time.js` and `api/v1/column-lineage.js` query persisted evidence/mappings using both dimensions and report undated valid-time rows separately. Prior tests exercised empty-store responses and invalid timestamps, but populated historical reconstruction and interval-boundary behavior still need deeper verification.

### SQL analysis

The dashboard contains a SQL-analysis view with an illustrative query using commerce customer orders/profiles and a LEFT JOIN to payments. This is an interface/example, not proof that SQLGlot is running in the Hatchable backend or that the research benchmark supports outer joins. The original research MVP calls for a separate SQLGlot-based static lineage provider in the Python research foundation.

### 3D Observatory

A dedicated `public/observatory.js` module uses Three.js and is loaded from the main page. It is marked BETA. The Lineage Explorer execution plan explicitly says preserve the current 3D Observatory and do not casually replace the visualization library or edit `public/observatory.js`, `public/styles.css`, or `public/styles.neo.css` as part of narrow lineage changes. Treat 3D as a visualization surface, not the research contribution.

## G6. Operations group

Sidebar group: **Operations**.
Sub-views:
- **Import metadata** (separate route `/ingestion.html`)
- **Pipeline runs**

### Import metadata / ingestion page

The ingestion page describes importing supported JSON artifacts into PostgreSQL and inspecting exactly what was persisted. It includes:
- artifact format selector;
- file/content input and preview;
- preview metrics, warnings/errors, and review step;
- explicit import-after-preview flow;
- connection/store status;
- import results and record summaries.

The format selector in the current HTML includes:
- dbt manifest.json;
- OpenLineage event JSON;
- auto-detect JSON records (object or array);
- generic metadata graph JSON (assets + supplied relationships);
- file inventory JSON (paths, hashes, directories).

The page includes a warning that dbt manifest dependencies are declared/static lineage, not run-specific proof. OpenLineage input/output boundaries are stored as run metadata; the app must not invent a direct edge between every input and output.

The browser-side JS validates/inspects payloads and requires preview before import. The server has separate preview and ingest endpoints. Preview explicitly returns `is_persistent:false` and warnings that it is preview-only, relationships are passed through rather than inferred, and source freshness is not verified.

### Pipeline runs

A `kairos_pipeline_runs` table and catalog API query exist. The demo overview includes synthetic run examples. The persisted run table was empty in a prior read-only check. Do not claim live pipeline orchestration or real-time monitoring without an actual connected producer and tested end-to-end event flow.

## G7. Trust & Governance group

Sidebar group: **Trust & governance**.
Sub-views:
- **Evidence & reasoning**
- **Data quality**
- **Incident console**
- **Stewardship**

### Evidence & reasoning

Intended to inspect evidence states, provenance, run scope, coverage, explanations, and temporal context. Backend tables/endpoints exist. The previously tested persisted evidence store was empty; evidence UI behavior with populated evidence remains to be demonstrated.

### Data quality

The database has `kairos_quality_checks`; a scheduled job `api/jobs/simulate-quality.js` currently generates random anomaly/freshness numbers and does not persist them. It explicitly comments that real evaluation would query external APIs or SQL aggregations and that the insert is simulated/commented out. Therefore this job is MOCK_ONLY and must not be described as real data-quality monitoring.

### Incident console

An incidents table and `api/v1/incidents.js` exist. The earlier backend audit reported the route declared public access and returned HTTP 200 anonymously; it has mutation paths. Anonymous mutations were not invoked, and no successful unauthorized write is claimed. This must receive an explicit authorization/security review before the product claims safe enterprise incident management.

### Stewardship

`public/stewardship.js` and `public/stewardship.css` exist, as do request/proposal APIs and tables. The intended UI surface includes governance requests, access requests, glossary proposals, decision workflows, and steward interactions. Check actual event handlers, access tiers, and persistence before claiming the entire workflow works. Profile notes explicitly say roles, permissions, task/activity history, incident ownership, and evidence coverage are not backed by a user-directory API and must not be inferred.

## G8. System group

Sidebar group: **System**.
Sub-views:
- **Integrations & API**
- **Preferences**

### Integrations & API

Intended as a source/integration configuration and API information surface. The current project has a metadata artifact importer, webhook route, ingestion SDK helper/template, and API endpoints. This is not proof of OAuth-based connectors or direct live integration with GitHub, PostgreSQL servers, dbt Cloud, Airflow, etc.

### Preferences

Includes local theme/profile preferences. The theme is stored in browser local storage. Profile UI code explicitly warns that profile fields are browser-local and are not backed by a real user-directory API. Do not treat a displayed profile name/title as authenticated identity, authorization, team membership, or audit actor.

## G9. Profile identity

Profile shortcuts exist in the sidebar and topbar. Current code has a “User Profile & Workspace Identity” view. It says profile fields are stored in the browser and that roles, permissions, tasks, activity history, incident ownership, and evidence coverage are not backed by a user-directory API and are not inferred. This is a local display profile, not enterprise identity management.

## G10. Global search, help, theme, responsive controls

The shell includes:
- global search shortcut button (Ctrl+K);
- help button;
- light/dark theme toggle;
- sidebar collapse and mobile open/close buttons;
- breadcrumbs;
- toast notifications and modal dialog.

These controls existing in HTML is not sufficient to claim every interaction is functional. Confirm each handler and keyboard/accessibility behavior before modifying it.

---

# PART H — CURRENT FRONTEND STATE AND DATA SHAPES

## H1. Main client state

The current `public/app.js` state includes fields for:
- current view;
- column mapping search;
- data mode;
- data-load error;
- asset filters/search/domain/owner/tag/trust/sort;
- selected asset;
- evidence filter/search/selected evidence;
- run filter/search;
- graph direction/depth;
- evidence state filter;
- graph zoom/pan;
- column graph mode;
- PII overlay;
- SQL text;
- valid-time and recorded-time values;
- temporal result/error;
- column mappings and classifications;
- undated mapping count;
- chart instances;
- cleanup callback.

This is evidence that the client has interaction state for these areas; it does not prove every interaction is wired correctly for every data mode.

## H2. Source normalization and extensibility

The product research notes favor a source-neutral asset contract:
- stable asset identity;
- qualified name;
- source/system namespace;
- asset type/kind;
- source-supplied metadata;
- timestamps when available;
- explicitly supplied or independently supported relationships;
- provenance/source identifiers.

Unknown safe metadata should be preserved rather than discarded merely because the UI has no dedicated field for it. Credential-like keys must be filtered from previews and display payloads.

Do not infer lineage from matching names. Generic JSON preview preserves explicit relationships but does not infer them. Generic graph import requires supplied assets and relationship endpoints.

## H3. Capability-aware rendering

The intended future product should maintain a capability registry per source/asset type, for example:
- asset discovery;
- metadata inspection;
- schema exploration;
- SQL analysis;
- table lineage;
- column lineage;
- execution history;
- quality checks;
- evidence inspection;
- bitemporal history;
- PII classification;
- export.

Capabilities should be based on real adapter support and actual available data, not on a universal fixed set of enabled cards. If a source lacks run history, show that it is unavailable/not supplied rather than an empty fake history. If a feature has no supporting records, use a truthful empty state.

---

# PART I — POSTGRESQL SCHEMA AND DATA MODEL

The database schema returned by Hatchable includes the following key tables. The exact full schema should be re-read from the current database before migrations are changed.

## I1. Core catalog and lineage

- `kairos_assets`: canonical asset records including ID, qualified name, schema, kind/type, owner, description, column count, extensible JSON metadata, creation/update timestamps, and asset-level PII/sensitivity fields.
- `kairos_lineage_edges`: table-level relationships with source/target asset IDs, edge type, optional evidence reference, metadata, and creation time. Current table-level edge schema has no explicit valid/recorded interval columns.
- `kairos_column_lineage`: source/target asset and column identities, mapping type, transformation, evidence reference, PII/sensitivity fields, valid-from/to, recorded-from/to, metadata, and timestamps.
- `kairos_column_classifications`: asset/column classification records with PII flag, sensitivity classification, classification source, metadata and update time.

## I2. Evidence and execution

- `kairos_evidence`: source/target names, four-state label, evidence type, run ID, coverage, rule name, explanation, valid-time interval, recorded-time interval, metadata and creation time.
- `kairos_raw_events`: source system, source record ID, event type, event time, recorded time, raw JSON payload. A unique constraint is defined over source system and source record ID; migration 003 adds immutability protection.
- `kairos_pipeline_runs`: pipeline/run name, status, start time, duration, environment, asset/event counts and metadata.
- `kairos_quality_checks`: rule, qualified asset, check type, score, status, evaluation time and metadata.

## I3. Governance and product workflows

- `access_requests`: asset, requester, reason, status, decision maker/time and created time.
- `glossary_proposals`: name, definition, proposer, status, decision time and creation time.
- `incidents`: asset, title, severity, status, created/resolved time.
- `kairos_data_products`: product records.
- `kairos_data_product_assets`: associations between products and assets.
- `requests` / proposal-related tables: verify exact names and columns from the live schema before making assumptions; current API files include request submit/decision and proposal decision handlers.

## I4. Jobs, embeddings and traces

- `kairos_durable_jobs`: durable queue records and queue state/indexing.
- `kairos_asset_embeddings`: asset/chunk text, domain, sensitivity, JSONB embedding field and timestamps.
- `kairos_rag_traces`: query text, retrieved context, generated answer, prompt/model versions, token usage, latency, optional user ID and timestamp.
- `_hv_catalog`: Hatchable platform-managed catalog/embedding table; do not mistake this platform table for proof that Kairos application-level semantic search is correctly implemented.
- `webhook_events`: webhook event type/source/payload/time.
- `project_checkpoints`: Hatchable project checkpoint/version snapshots.

## I5. Data-quality cautions

- A schema column named `embedding` does not prove that embeddings are populated or searched.
- A RAG trace table does not prove that the current UI performs grounded RAG.
- The current search handler explicitly implements keyword matching over stored metadata.
- A raw event table and event ingestion route do not prove the upstream source is connected or that the raw event set is complete.
- A table-level lineage edge is not automatically execution evidence.
- A NULL PII classification means unclassified/unknown, not PII-free.
- Do not infer tenancy isolation from RLS being enabled; inspect the policy predicates and test isolation.
- No database mutation was performed while preparing this context.

## I6. Prior data snapshot (stale until rechecked)

The existing changelog's prior read-only checks reported:
- 4 persisted assets;
- 2 table-level lineage edges;
- 2 raw events;
- 0 evidence rows;
- 0 pipeline runs;
- 0 quality checks;
- 0 column-lineage mappings.

These counts are historical observations, not guaranteed current values. Re-query before presenting as current.

---

# PART J — CURRENT API ROUTE INVENTORY AND SEMANTICS

All route access tiers and behavior must be rechecked before implementation. The list below combines current source inspection with prior read-only checks.

## J1. Health and background jobs

### `GET /api/health` (handler: `api/health.js`)
Health route exists. Inspect its response before using it as a readiness/connector-health guarantee.

### `POST /api/jobs/simulate-quality` (handler: `api/jobs/simulate-quality.js`)
- Access tier declared: scheduler.
- Generates random anomaly count and freshness percentage.
- Does not persist generated metrics; insert code is commented out.
- **Status: MOCK_ONLY.** Do not call it real quality monitoring.

### `POST /api/jobs/sync-knowledge` (handler: `api/jobs/sync-knowledge.js`)
- Access tier declared: admin.
- Reads assets and table edges from PostgreSQL.
- Builds text chunks for assets and edges and calls the Hatchable knowledge API's `knowledge.base("catalog", ...)` and `add()`.
- **Status: IMPLEMENTED CODE / END-TO-END UNVERIFIED.** Must verify knowledge-base configuration, indexing success, idempotency/update behavior, retrieval, access control, and whether the UI actually uses retrieved context.

## J2. Catalog and ingestion

### `GET /api/v1/catalog` — `api/v1/catalog.js`
- Access tier declared: admin; GET only.
- Reads persisted assets, table edges, evidence, pipeline runs, quality checks, column classifications and aggregate counts.
- Returns `source: "postgresql"`, counts, rows and limits.
- Prior read-only check: admin got 200; anonymous got 401; member got 403.
- Status: persisted catalog reads were verified in that narrow access context. Do not assume a real upstream connector populated the records.

### `POST /api/v1/ingest` — `api/v1/ingest.js`
- Access tier declared: admin; POST only.
- Accepts multiple payload kinds including `dbt_manifest`, `openlineage_event`, `metadata_graph`, and additional JSON/import paths in the handler.
- Has payload shape/size validation, duplicate IDs/qualified-name validation for generic metadata graphs, endpoint checks, optional column mappings, temporal checks, evidence validation, and four-state labels.
- Upserts assets by qualified name.
- Requires explicit source/target relationship IDs for generic metadata graph imports; it must not invent relationships.
- `REFUTED_FOR_RUN` requires run ID, coverage and complete-negative-evaluation metadata.
- Source inspection reveals substantial handler logic, but duplicate-import/idempotency and populated end-to-end imports still need tests.
- Prior deployment lint reported SQL CTE alias warnings in this handler around `lock_key`, `ts`, and `existing`; do not change those unrelated parts without coordinated review.

### `POST /api/v1/metadata-preview` — `api/v1/metadata-preview.js`
- Access tier declared: admin; POST only.
- Accepts a JSON object/array, discovers records from common collection keys, assigns IDs/names/types, filters credential-like keys, preserves safe metadata and returns summary/capabilities.
- Explicitly returns `is_persistent: false`.
- Explicit warnings: preview-only/not persisted; relationships passed through rather than inferred; source freshness not verified.
- Prior read-only check verified synthetic image/document metadata preview and anonymous 401.
- Do not describe preview as ingestion or as a real live source connector.

### `GET /api/v1/raw-events` — `api/v1/raw-events.js`
- Access tier declared: admin; GET only.
- Lists recent raw-event metadata and can return a full event by ID.
- Prior read-only check returned 200 for admin and 401 for anonymous.
- Retrieving stored events does not prove completeness of upstream instrumentation.

## J3. Lineage and temporal APIs

### `GET /api/v1/column-lineage` — `api/v1/column-lineage.js`
- Access tier declared: admin; GET only.
- Requires/uses `valid_as_of` and `recorded_as_of` values, defaulting missing values to current time.
- Applies both temporal dimensions to dated mappings.
- Counts undated valid-time mappings separately.
- Explicit semantics say a column mapping declares lineage and does not prove runtime execution.
- Prior read-only check returned a working empty response; populated mapping and boundary behavior remain unverified.

### `GET /api/v1/evidence-at-time` — `api/v1/evidence-at-time.js`
- Access tier declared: admin; GET only.
- Requires valid `valid_as_of` and `recorded_as_of` date-time query parameters.
- Applies both temporal dimensions, counts undated valid-time evidence separately, and returns state/provenance fields.
- Prior read-only check returned 200 with zero evidence; invalid timestamp validation was exercised.
- Populated historical reconstruction remains unverified.

### `GET /api/v1/lineage/export` — `api/v1/lineage/export.js`
- Access tier declared: admin; GET only.
- Exports assets, table edges, temporally filtered column mappings/evidence, and column classifications as a JSON snapshot.
- States limits and semantics, including the limitation that table-level edges have no bitemporal columns in the current schema.
- Verify actual download/CSV flows separately; this API is JSON.

## J4. Search and competitor research

### `POST /api/v1/search` — `api/v1/search.js`
- Access tier declared: admin; POST only.
- Splits the question into up to 12 keywords and performs case-insensitive SQL LIKE matching over qualified name, description, owner, type, schema and metadata text.
- Returns at most 10 matches and explicitly labels mode `persisted_keyword_search`.
- Explicitly states this is not semantic/RAG retrieval and matching assets are not proof of lineage or runtime behavior.
- Prior query for “customer orders” returned two persisted keyword matches.
- Do not market this as semantic search, vector search, or grounded question-answering.

### `GET /api/v1/competitor-research` — `api/v1/competitor-research.js`
- Access tier declared: admin; GET only.
- Returns a prepared array of curated findings for DataHub, OpenMetadata, OpenLineage/Marquez, Open Data Hub, and OpenMeter, plus recommendations and boundaries.
- Source code is static/curated, not live web research.
- Prior read-only check returned 200 for admin and 401 for anonymous.
- The UI integration was not proven by that API test.
- The curated content explicitly distinguishes direct competitors from adjacent products and notes no arbitrary authenticated live connectors or universal lineage inference.

## J5. Governance / classification / workflow APIs

- `GET/POST /api/v1/pii-classification`: reads/writes asset-level or column-level PII/sensitivity labels. Column classification requires the column to exist in stored schema metadata. This is manual/persisted classification code, not proof of automatic PII detection accuracy.
- `GET/POST /api/v1/incidents`: incidents route exists; prior audit flagged its declared public access and mutation paths for review. Anonymous mutations were not tested.
- `GET/POST /api/v1/data-products`: data products route exists; prior audit flagged declared public access for review. Do not claim safe access control without tests.
- `GET/POST /api/v1/proposals`: proposal records route exists.
- `POST /api/v1/proposal-decision`: proposal decision workflow endpoint exists.
- `GET/POST /api/v1/requests`: request records route exists.
- `POST /api/v1/request-submit`: request submission endpoint exists.
- `POST /api/v1/request-decision`: request decision endpoint exists.
- Exact methods, access tiers, persistence, validation, and UI wiring should be verified directly in each current handler before implementation.

## J6. Webhook and worker

- `api/v1/webhook.js`: webhook endpoint exists; inspect signature validation, replay protection, accepted event schema and persistence before claiming production webhook safety.
- `api/v1/worker/process.js`: worker endpoint exists; inspect queue claim/ack/retry behavior and idempotency before describing durable jobs as production-grade.
- `migrations/005_kairos_durable_jobs.sql` exists, but a queue table alone does not establish reliable background processing.

## J7. API conventions

- The intended research contract requires versioned endpoints under `/api/v1`.
- Current Hatchable handlers use `export const access` and `export const methods` with default `async function(req,res)`.
- Hatchable does not use Express/Next route handlers and the app has no build step; follow the current generated `AGENTS.md` platform rules.
- Use parameterized SQL with `db.query`; no ORM.
- Maintain stable error shapes and explicit access-tier tests.
- Do not expose credentials or private payloads in preview/log output.

---

# PART K — SECURITY, PRIVACY, AND TRUST ISSUES TO RESEARCH / VERIFY

## K1. Route access

Prior read-only checks found:
- catalog route returned 401 to anonymous;
- metadata-preview returned 401 to anonymous;
- raw-events returned 401 to anonymous;
- competitor-research returned 401 to anonymous;
- incidents and data-products returned 200 anonymously, with public route declarations and mutation paths.

The last finding is a review requirement, not a demonstrated exploit. No anonymous mutation was performed. Do not attempt destructive/security-sensitive mutations without explicit authorization. The owner must decide intended access policy and approve a controlled test plan.

## K2. RLS / tenancy

Migration 007 enables RLS on selected tables, but several policies use `USING (true)`. This is not evidence of working tenant isolation. The current app is a personal project; enterprise/multi-tenant guarantees must not be claimed without:
- a defined tenant identity model;
- a trusted server-side tenant context;
- policy predicates tied to that context;
- tests across two isolated tenants;
- verified handling of service-role access;
- explicit decisions on public vs member vs admin access.

## K3. Profile and audit identity

Browser-local profile labels are not a trustworthy identity source. Any audit actor, request submitter, steward decision-maker or incident owner should come from authenticated server-side identity, not editable local-storage values.

## K4. Secret handling

The metadata-preview endpoint filters keys matching token/secret/password/credential/private key/API key patterns and bounds nested depth/record counts. Review whether ingestion logs, raw-event views, generic metadata, webhook payloads and exports need equivalent protections. Do not send secrets to Perplexity or include them in this context file.

## K5. Webhooks / background work

Research proper signature verification, replay defense, retries, idempotency, least-privilege access and audit logging for webhook-driven ingest. Do not assume a route is safe because it exists.

---

# PART L — CURRENT FEATURE STATUS: HONEST BASELINE

This is a cautious baseline based on code and the existing changelog. It is not a complete QA report.

| Area | Current evidence | Safe status wording |
|---|---|---|
| Hatchable project/version | Registry reports active version 301 | Verified registry metadata |
| Main dashboard shell | Current HTML and app.js exist | Implemented shell; individual interactions need targeted tests |
| Demo workspace | Demo fixtures and synthetic overview code exist | Demo/synthetic |
| PostgreSQL catalog reads | Catalog handler reads persisted tables; prior admin test passed | Verified in a narrow read context |
| Generic metadata preview | Handler code and prior synthetic preview test | Preview works in tested case; not persisted |
| Generic metadata graph ingestion | Handler has validation/upsert logic | Implemented code; end-to-end/idempotency tests incomplete |
| dbt manifest ingestion | Kind-specific validation and handler path exist | Partial; test realistic artifacts and relationships |
| OpenLineage ingestion | Event-array/single-event path exists | Partial; upstream producer and run semantics unverified |
| Live PostgreSQL source connector | No proof of arbitrary remote DB connection | Not established |
| Live GitHub connector | GitHub template file exists, but no proof of OAuth/live adapter | Not established |
| Table lineage | Two stored edges were observed previously | Partial; provenance/completeness unknown |
| Column lineage | Endpoint/schema exist; prior query empty | Empty-but-working in tested snapshot |
| Bitemporal evidence query | Query code and empty-store tests exist | Empty-but-working; populated history unverified |
| Bitemporal table-edge history | Table edge schema lacks interval columns | Gap in current schema |
| Raw event ledger | Table/API/immutability migration exist; two rows observed previously | Partial |
| Four-state validation | Ingest validates states and guards refutation fields | Guard exists; reasoning-engine parity needs tests |
| Research reasoning engine in Hatchable | No proof this frontend/backend computes the Python engine | Not established |
| Python research engine | Described in Team Guide | Foundation design/code per guide; verify repository checkout and tests |
| Ground-truth provider | Team Guide says assigned work; ProvSQL is a candidate | Not established in Hatchable |
| Independent experiment | No results in architecture pack | Not yet run/validated |
| Keyword search | SQL LIKE implementation and prior two-match test | Verified keyword search in narrow case |
| Semantic/vector search | Embedding and trace schema exist, but endpoint is keyword search | Not established end-to-end |
| Knowledge sync | Code writes chunks to knowledge base | Implemented code; retrieval and UI grounding unverified |
| Competitor research | Curated static array | Static guidance, not live research |
| Quality monitoring | Random values, no persistence in simulate-quality job | Mock-only |
| PII classification | Persisted manual classification endpoint | Handler exists; automatic detection not established |
| Incidents / data products | Routes, tables and UI labels exist | Access and workflow verification required |
| Stewardship/request flows | UI module and APIs exist | End-to-end verification required |
| 3D Observatory | Separate Three.js module exists | Existing BETA visualization; preserve and test |
| Profile/roles | Browser-local profile notice exists | No real user-directory/enterprise IAM |
| Tenant isolation | RLS migration has broad predicates | Not established; security review required |

---

# PART M — COMPETITOR AND ECOSYSTEM RESEARCH TO PERFORM

Perplexity must browse the web and use citations. Prefer official docs, product documentation, technical architecture pages, API references, source repositories, release notes, and reproducible examples. Use community discussions only as supplemental user-experience context.

## M1. Direct metadata/catalog competitors

### DataHub
Research:
- metadata model and entity identity;
- ingestion architecture and source adapters;
- structured search vs graph traversal;
- lineage and column-lineage support by source;
- ingestion scheduling, incremental updates, state management, retries and ownership;
- access control/permissions and secret management;
- how UI features change by asset type or source capability;
- self-hosting and local development requirements.

### OpenMetadata
Research:
- connector framework and ingestion workflow;
- service connection configuration and credential handling;
- metadata ingestion vs profiler/data quality ingestion;
- asset-specific detail tabs and capability variation;
- table/column lineage, manual lineage, previews and exports;
- permissions/roles, bots/service accounts and secrets;
- pipeline scheduling, failures and re-ingestion;
- local files, database services, dbt, lineage events and other source coverage.

### Atlan
Research:
- lineage navigation, depth controls, exports and asset detail UX;
- connector setup, permissions, metadata refresh and supported source-dependent features;
- what is public documentation versus enterprise-only behavior;
- distinguish verified docs from marketing claims.

### OpenLineage and Marquez
Research:
- event schema: job, run, dataset, event time, producer, facets;
- lifecycle semantics and how input/output boundaries are represented;
- what the event standard does not guarantee;
- whether and how systems link inputs to outputs;
- how to preserve raw events and avoid turning event boundaries into fabricated direct column lineage.

### dbt ecosystem
Research:
- manifest/run-results/catalog artifacts and version differences;
- declared graph dependencies versus actual run events;
- incremental artifact ingestion, environment/target identity, source freshness and artifacts;
- stable IDs, aliases, schema names, exposures and tests.

## M2. Adjacent tools and source families

Consider only where relevant:
- GitHub repository metadata, SQL files and dbt project discovery;
- local files and file inventories;
- PostgreSQL catalogs/metadata discovery;
- workflow/job metadata;
- OpenLineage producers;
- data quality and observability tools;
- generic REST metadata APIs.

Do not treat Open Data Hub or OpenMeter as like-for-like metadata-lineage competitors. They appeared in the current curated research endpoint as adjacent examples, and their role should be accurately classified.

## M3. Required competitor comparison table

For each product, report:
- product category (direct competitor / adjacent tool / standard);
- source types/connectors;
- connection/auth setup;
- permission model;
- full scan vs incremental/continuous updates;
- refresh/scheduling model;
- supported asset types;
- table lineage vs column lineage vs runtime evidence;
- provenance and time/history support;
- empty/unsupported-source behavior;
- search type and relationship traversal;
- export/API options;
- self-hosting or deployment requirements;
- relevant implementation lesson for Kairos;
- official source URL and date checked;
- confidence and caveats.

Do not infer that every connector has every feature. Features often depend on source metadata, permissions, configuration and product edition.

---

# PART N — CONNECTOR AND ADAPTER ARCHITECTURE TO INVESTIGATE

## N1. Core principle

Separate:
1. source discovery/configuration;
2. authentication and permission verification;
3. extraction/snapshot/event acquisition;
4. normalization into a source-neutral contract;
5. raw evidence retention;
6. canonical persistence;
7. lineage/evidence reasoning;
8. capability computation;
9. UI rendering.

A UI should not itself act as a connector, parser, source-of-truth store or reasoning engine.

## N2. Proposed adapter contract to evaluate

Research a versioned adapter contract that could expose:
- connector ID and connector type;
- source instance identity and namespace;
- supported capabilities;
- connection status and permission/scopes;
- discovery operation;
- full and incremental extraction support;
- cursor/checkpoint state;
- rate limits and pagination;
- normalized assets and relationships;
- raw source records/event references;
- source version/schema and adapter version;
- source event time and Kairos recorded time;
- error/warning taxonomy;
- retry/idempotency rules;
- data freshness and last successful sync;
- source-specific metadata preserved safely.

Do not present this as implemented in the current app. It is a design proposal to evaluate.

## N3. Candidate adapters and ordering

Evaluate a small sequence based on usefulness, feasibility, and honest demos:
1. Generic JSON metadata preview/import (already has current code).
2. Generic metadata graph import with explicit relationships (current handler path; test it).
3. dbt manifest artifact import (current handler path; verify realistic fixtures/versioning).
4. OpenLineage event import (current handler path; verify event lifecycle and semantics).
5. GitHub repository/source adapter (currently not established; the template file is not a live connector).
6. PostgreSQL catalog discovery (desired future adapter; not established by the fact that Kairos itself uses PostgreSQL internally).

Make clear that Kairos's own PostgreSQL database is not equivalent to a connector that scans a user's remote PostgreSQL source.

## N4. Permission-aware capabilities

A connector may authenticate successfully but lack permission to read a schema, history, column comments or lineage metadata. Model the difference between:
- connector unavailable;
- authentication failed;
- connected but permission denied;
- connected and source empty;
- connected with partial permissions;
- ingestion in progress;
- last sync failed;
- stale snapshot;
- successfully ingested source with some unsupported capability.

Do not show an unsupported feature as a successful empty result. Do not fabricate lineage to make the dashboard look complete.

---

# PART O — FIVE DEMONSTRABLE END-TO-END WORKFLOWS TO PRIORITIZE

Perplexity should recommend five small, high-confidence workflows with acceptance criteria. The candidate set below is a starting point, not an authorization to implement without an audit.

## O1. Workflow A — Generic metadata file preview

1. User opens Import metadata.
2. User selects JSON records or file inventory and chooses a local file.
3. Browser reads the file and displays preview metrics/warnings.
4. Server preview sanitizes credential-like keys, discovers records, preserves safe metadata, and returns `is_persistent:false`.
5. UI makes it clear nothing has been persisted.
6. User can cancel without changing the database.

Acceptance:
- no network connector is falsely implied;
- preview does not write database rows;
- safe unknown fields survive;
- secret-like keys are filtered;
- empty/malformed/oversized payloads produce useful errors.

## O2. Workflow B — Explicit generic graph import

1. User supplies a graph JSON with assets and explicit relationships.
2. Preview checks IDs, qualified names, relationship endpoints, column mappings and temporal values.
3. User confirms import.
4. Ingest persists assets and only the supplied relationships.
5. User switches to Connected Catalog and sees persisted records.
6. Re-import behavior is tested for idempotency and conflicting identities.

Acceptance:
- no relationship inference from names;
- invalid endpoints rejected;
- duplicate IDs/qualified names handled safely;
- the UI distinguishes import success from lineage correctness;
- imported records remain traceable to source artifact.

## O3. Workflow C — dbt manifest import

1. User supplies a realistic dbt `manifest.json`.
2. Preview shows nodes, sources, exposures, columns and declared dependencies where available.
3. Import stores stable asset identities and declared relationships.
4. UI marks lineage as declared/static.
5. No runtime state is invented from the manifest.

Acceptance:
- fixture tied to a declared dbt artifact/version;
- unsupported/malformed manifests are reported;
- source IDs/namespaces are stable;
- repeat import does not silently duplicate or erase history;
- source-specific metadata is preserved safely.

## O4. Workflow D — OpenLineage event import

1. User supplies one event or a small event array.
2. Preview summarizes job/run, event type/time, input datasets and output datasets.
3. Import stores raw event evidence and normalized run metadata.
4. UI displays event provenance and run scope.
5. Inputs and outputs are not automatically converted to fabricated direct pairwise lineage edges.

Acceptance:
- raw payload is preserved with safe access;
- duplicate source event IDs are idempotent;
- event order/lifecycle is represented correctly;
- missing events do not become refutation;
- incomplete coverage is explicit.

## O5. Workflow E — Lineage evidence inspection and time query

1. User opens a real persisted asset/edge/mapping.
2. User inspects relationship type, source provenance and evidence state.
3. User chooses valid time and recorded/knowledge time separately.
4. UI queries current APIs and shows matching evidence/mappings.
5. Undated records and no-results states are disclosed.
6. Exports reflect the selected filters and temporal scope where supported.

Acceptance:
- no fake data in connected mode;
- temporal boundary tests cover start/end inclusivity;
- table-level edge temporal limitation is visible;
- declared mappings do not imply runtime execution;
- the output is reproducible from stored data.

## O6. Alternative workflow selection

If Perplexity finds a different set of five workflows more feasible or valuable, explain why and compare against the five candidates above. Classify every workflow as:
- LIVE INTEGRATION;
- FILE IMPORT;
- DETERMINISTIC FIXTURE / DEMO.

Never call a fixture a live integration.

---

# PART P — ARCHITECTURE QUESTIONS THE RESEARCH MUST ANSWER

1. What belongs to the research core and what belongs to the product/connector layer?
2. What is the minimal source-neutral asset and relationship contract that preserves source-specific fields?
3. How should connector capabilities be represented and computed?
4. How do mature platforms model connector identity, credentials, permissions, incremental sync, freshness and errors?
5. What should happen when a source is connected but some permissions or capabilities are missing?
6. How should generic file inventory, image metadata, SQL catalogs, dbt artifacts and runtime events coexist without forcing one rigid schema?
7. Which lineage types should be distinct: declared, static candidate, manually supplied, runtime-observed, and refuted-for-run?
8. How should raw events be preserved and normalized without creating unsupported direct relationships?
9. Which entities need valid-time and recorded-time intervals, and which current tables lack them?
10. How should imports be idempotent and how should identity conflicts be handled?
11. What is the minimal safe permission model for personal demos now, and what additional work is needed for multi-user/enterprise tenancy?
12. How should capability-aware navigation and asset details work in an understandable UI?
13. What should be the first five workflows for a credible demonstration?
14. Which current routes and UI modules can be reused, which require tests, and which need redesign?
15. Which features should be removed, hidden, disabled or explicitly labeled as demo-only until backed by real data?
16. How can the architecture preserve a standalone research runner and prevent ground-truth leakage?
17. What does each competitor do that is documented, edition-dependent, source-dependent, or merely a marketing claim?
18. What are the biggest security, privacy, reliability, provenance and research-integrity risks?
19. What tests would prove each workflow works end-to-end?
20. What is the smallest implementation roadmap that does not accidentally turn the research MVP into a sprawling enterprise platform?

---

# PART Q — REQUIRED PERPLEXITY OUTPUT

Return a detailed report with the following sections, in this order.

1. **Executive summary:** key findings, recommended architecture, five-workflow shortlist.
2. **Source inventory:** all official sources consulted, date checked, relevance, and limits.
3. **Competitor matrix:** DataHub, OpenMetadata, Atlan, OpenLineage/Marquez, dbt ecosystem, plus justified adjacent sources.
4. **Connector behavior matrix:** setup, auth, permissions, refresh, incremental sync, asset types, lineage granularity, limitations.
5. **Capability-aware dashboard design:** capability model, navigation rules, asset inspector rules, empty/error/partial states.
6. **Recommended source-neutral contract:** entity fields, relationship fields, capability model, provenance, time, connector state, sync state.
7. **Data flow and architecture:** Mermaid diagrams for source-to-catalog flow and research/prediction/ground-truth boundaries.
8. **Five end-to-end workflows:** step-by-step flows, data contracts, API needs, acceptance tests, limitations and demo classification.
9. **Current-code alignment:** map recommendations to the current Hatchable files/routes listed in this brief; clearly label inferred mappings and items that need source reinspection.
10. **Security and trust audit:** access, tenancy/RLS, secrets, webhooks, identity, raw evidence and exports.
11. **Prioritized backlog:** P0 correctness/security, P1 first five workflows, P2 capability/UX improvements, P3 later extensions. Give rationale, dependencies, acceptance criteria and estimated relative effort.
12. **Research/core preservation plan:** protect the Python research contract, separate predictor and ground truth, and prevent UI/product features from contaminating experiments.
13. **Claim ledger:** every consequential claim, source, whether official or secondary, date checked, and confidence.
14. **Implementation handoff:** concise brief for a coding agent that will inspect the actual files and original documents before changing code.

Use citations for all externally sourced claims. Prefer primary official documentation. Do not fabricate a source, version, API capability, connector, permission behavior or implementation detail. Clearly mark unresolved points.

---

# PART R — DOWNSTREAM CLAUDE / CODING AGENT INSTRUCTIONS

When the Perplexity report is brought back, the next coding agent must inspect the current Hatchable files and original documents before writing implementation code.

Required inputs:
- this full context document;
- `public/BACKEND_INSTRUCTIONS_AND_CHANGELOG.md`;
- `public/KAIROS_LINEAGE_EXECUTION_PLAN.md`;
- `public/KAIROS_TEAMMATE_CONTEXT_HANDOFF.md`;
- `public/PRANAV_HOME_CATALOG_COMPLETION.md`;
- `TEAM_GUIDE.md`;
- `FINAL_ARCHITECTURE_AND_RESEARCH_EXECUTION_PACK.docx`;
- the Perplexity report with citations;
- the current live code, migrations, database schema and route access configuration.

Required sequence:
1. Build a current file-to-feature map from the live project; do not rely only on this context.
2. Re-read current versions of all files that will be changed.
3. Recheck the data counts and route access behavior before relying on stale audit values.
4. Separate requirements into locked research invariants, current implemented behavior, demo/mock behavior, product aspirations, and open decisions.
5. Compare Perplexity recommendations with official-source citations and the architecture pack.
6. Produce a conflict/consistency report before implementing any large redesign.
7. Propose a minimal implementation plan with per-file changes and acceptance tests.
8. Ask for approval before changes that affect auth, permissions, RLS, public access, data deletion, secrets, schema migrations, visibility, or deployment.
9. Do not deploy unless explicitly asked.
10. Test every modified API route at relevant access tiers; test UI workflows in both Demo and Connected Catalog modes.
11. Do not use fake data in Connected Catalog mode or call simulated output real monitoring.
12. Preserve the current 3D Observatory and existing visual system unless the owner explicitly approves a redesign.
13. Keep `REFUTED_FOR_RUN` scoped and guarded; missing runtime events are never sufficient refutation.
14. Keep ground truth out of predictor inputs.
15. Report exactly what changed, what tests ran, what passed, what remains unverified, and whether anything was deployed.

## R1. Definition of done for the next implementation phase

A feature is not done merely because a button exists or an endpoint returns 200. It is done only when:
- the user can complete the stated workflow from the UI;
- the relevant backend stores or returns the correct shape;
- access rules behave as intended;
- source provenance is retained;
- no relationships or evidence are fabricated;
- empty, error, partial-permission and unsupported-capability states are clear;
- Demo and Connected Catalog remain separate;
- tests cover the normal and important negative paths;
- acceptance criteria are checked against real outputs;
- limitations are documented honestly.

---

# PART S — CURRENT OPEN QUESTIONS / DO NOT ASSUME

- Which five Hatchable workflows should be the official demonstration scope?
- Which connector should be implemented first after validating existing file-import paths?
- Is a real GitHub connector required now, or is a repository artifact import sufficient for the first demo?
- Should a direct PostgreSQL source connector be implemented now, and what read-only permissions can it require?
- Which dbt manifest versions/artifact versions must be supported?
- How should OpenLineage event lifecycle and source-specific facets be normalized?
- What stable identity strategy should handle renames, namespaces, duplicate names and multiple sources?
- How should connector status, last sync, stale data and partial permissions be persisted?
- Should capability state be stored, computed from adapters, or both?
- What exact authorization model should govern incidents, data products, requests and classifications?
- How should RLS policies be changed and tested for true tenant isolation?
- Should current embeddings/knowledge tables be used, disabled, or deferred until grounded retrieval is verified?
- What temporal model is required for table-level edges, and is a migration justified for the demo?
- How should conflicting source facts be displayed without silent overwrite?
- What current frontend features are unused or not wired to APIs?
- Which existing styles/modules are protected by current team work?
- What open decisions in the architecture pack remain unresolved and who owns them?
- Which local research repository version is canonical, and what tests have actually been run on it?

---

# PART T — FINAL INSTRUCTION TO PERPLEXITY

Treat this document as a project handoff, not as proof that every described feature is complete. Research external products and patterns, cite primary sources, and provide a concrete, evidence-backed recommendation for Kairos. Do not replace the original research contract with generic enterprise-catalog assumptions.

Most importantly, answer two questions distinctly:

1. **What is the best defensible architecture and workflow plan for the project we actually have?**
2. **What evidence must be collected from the current code/runtime before an implementation agent can safely make each change?**

Do not write implementation code. Do not claim to have inspected the live Hatchable project yourself. The current-code descriptions above are grounded in project-file inspection and a limited prior read-only audit, but Perplexity should focus on external research and recommendations. The downstream coding agent must re-inspect the current app before acting.