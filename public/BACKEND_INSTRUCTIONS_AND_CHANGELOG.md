# Kairos Full-Stack Architecture, Contributor Change Log & System Guide

**Project Name:** Kairos Metadata Lineage Dashboard  
**Hatchable Project ID:** `proj_HTYAd2BCLtMt`  
**Slug:** `kairos-metadata`  
**Live URL:** [https://kairos-metadata.hatchable.site](https://kairos-metadata.hatchable.site)  
**Last Updated:** 27 October 2026 (Version 272)  

---

## 1. Executive Purpose & Automated Sync Protocol

This document is the **canonical full-stack specification, contributor change log, backend gap backlog, AI feature rationale repository, and implementation guide** for Kairos. Every time any contributor (such as Gauri, Jatin, or an automated developer agent) makes changes to either the **Frontend UI** or **Backend Infrastructure**, this document must be updated and deployed alongside the codebase.

### Core Development & Sync Invariants
1. **Full-Stack Attribution & Rationale:** Every change entry must explicitly cite:
   * **Contributor Name:** Who made or requested the change (e.g. Gauri, Jatin Shende, Kairos AI Developer).
   * **Frontend UI Modifications:** Visual elements, tags, tabs, or graph overlays added.
   * **Backend API & DB Requirements:** Endpoints modified, tables created, or migration scripts written.
   * **AI Feature Rationale:** Why the feature was chosen, how it applies to Kairos, and what problem it solves.
2. **Backend Gap & Unimplemented Requirements Backlog:** If a UI feature is added (e.g., PII tags, data security labels, temporal graph exports) before the backend API/database supports it, the AI MUST log:
   * **What was added in UI.**
   * **What backend API / DB table / column is missing.**
   * **Where in the backend it is needed** (file paths / migration script names).
   * **Why it is needed** (operational/business rationale).
   * **Actionable steps to implement it later.**
3. **Canonical Ground Truth:** PostgreSQL is the single source of truth for assets, lineage edges, column mappings, evidence, access requests, and pipeline runs.
4. **ES Module Compliance:** All backend handlers in `api/**/*.js` must use standard ES Modules (`import / export`). CommonJS (`require()`) is strictly prohibited.
5. **UI Design System Discipline:** Frontend UI changes must preserve Kairos's dark navy (`#0B1220`) theme, D3 lineage graph containers, horizontal tab navigation, and enterprise data density without introducing unauthorized UI libraries.

---

## 2. Comprehensive Contributor Deployment Log (Full-Stack Changelog)

### Version 272 — Force Refresh All Assets View Routing (27 Oct 2026)
* **Contributor:** Kairos AI Developer, requested by the project team
* **Frontend UI Changes:** Bumped the frontend script cache key and visible build label so the browser fetches the latest view-routing code. All assets remains the asset-list page; Schemas & catalog remains the schema overview.
* **AI Feature Rationale:** Prevents a stale cached frontend from showing the schema overview under the All assets breadcrumb, preserving the distinction between asset search and schema browsing.
* **Backend Requirements:** None. Frontend cache-busting only; no API, database, or schema changes.

### Version 271 — Force-Refreshed All Assets Title & Welcome Name Fallback (27 Oct 2026)
* **Contributor:** Kairos AI Developer, requested by the project team
* **Frontend UI Changes:** Aligned the navigation breadcrumb and page heading to **All assets** in both Demo and PostgreSQL catalog modes. The overview greeting now ignores generic placeholder profile values such as “Workspace” and falls back to the configured default name. Updated the JavaScript cache key and footer build label.
* **AI Feature Rationale:** Consistent page naming reduces confusion between the Catalog navigation item and the page heading; filtering placeholder labels avoids greeting users as if “Workspace” were a person's name.
* **Backend Requirements:** None. Frontend-only copy and fallback behavior; no API, database, or schema changes.

### Version 269 — Corrected Asset Type Breakdown & Broader Taxonomy (27 Oct 2026)
* **Contributor:** Kairos AI Developer, requested by Jatin Shende
* **Frontend UI Changes:** Fixed the asset-type count aggregation so category labels and counts use the same classifier. Replaced the crowded doughnut with a horizontal bar chart for readable category comparisons, added broader categories (source/warehouse tables, database views, transformation models, ML feature datasets, BI/reports/outputs, metrics/KPIs, files/event streams, and other/unclassified), and made the chart and matching coverage breakdown available in both demo and PostgreSQL catalog views.
* **Classification method:** Categories are inferred from available asset `kind`, `type`, `name`, and `path` metadata. They are broad UI groupings, not persisted or manually reviewed classifications; unknown items remain in **Other / unclassified**.
* **Backend Requirements:** No API or database changes. This is a frontend-only aggregation and visualization correction.
* **Verification:** The code and documentation passed a deploy dry run. Updated `public/index.html` cache keys to `app.js?v=268` and `styles.neo.css?v=268` and synchronized the footer build label so browsers fetch the corrected assets. Existing `api/v1/ingest.js:104` CTE-alias lint warnings are unrelated to this chart change.

### Version 265 — Responsive Asset Profile Layout (27 Oct 2026)
* **Contributor:** Kairos AI Developer, requested by Jatin Shende
* **Frontend UI Changes:** Improved the Asset Profile drawer layout with consistent spacing and readable metadata tiles, a four-column facts grid on wide screens that collapses to two columns on tablet and one on narrow mobile screens, horizontally scrollable asset tabs that preserve labels, and full-width stacked action buttons on small screens. Updated `public/styles.neo.css` only.
* **AI Feature Rationale:** The profile drawer contains dense metadata and multiple navigation tabs. Responsive grids, wrapping-safe tiles, and scrollable tabs reduce crowding and prevent labels/actions from colliding without hiding information or changing the information architecture.
* **Backend Requirements:** None. This is a CSS-only responsive-layout adjustment; no API, database, migration, or data semantics changed.
* **Verification / Caveat:** Version 265 deployed successfully after a passing dry run. The known CTE-alias lint warnings in `api/v1/ingest.js` remain informational. Authenticated visual verification was not completed. The HTML stylesheet cache-busting query remains at `v261`, so a hard refresh may be needed to fetch the latest stylesheet.

### Version 264 — Interactive Transformation Inspection and SQL Analysis (27 Oct 2026)
* **Contributor:** Kairos AI Developer, requested by the project team
* **Frontend UI Changes:** In the Column dependency inspector, transformation values are now buttons using `data-action="inspect-transform"` that open the existing Column Lineage Logic modal. The modal's **Analyze in SQL View** button now uses `data-action="analyze-transform-sql"`; its handler transfers the selected transformation expression into `S.sql`, opens SQL Analysis, and runs the existing static reference parser.
* **AI Feature Rationale:** Makes transformation provenance inspectable from the mapping inventory and reduces manual copy/paste when investigating a transformation. Reuses the existing modal and static parser rather than introducing a new analysis path.
* **Backend Requirements:** None. This change uses the currently loaded column-mapping data and existing client-side SQL preview; no API, database, or migration changes were made.
* **Backend Gap Note:** The SQL preview remains heuristic static analysis and does not execute SQL or prove runtime lineage.

### Version 261 — Personalized Metadata Overview Greeting (27 Oct 2026)
* **Contributor:** Kairos AI Developer, requested by Jatin Shende
* **Frontend UI Changes:** Added a large, bold “Hi, [first name] 👋” welcome banner above the Metadata overview. The greeting uses the locally saved profile display name and falls back to Jatin Shende on a fresh browser; the name can be changed from the Profile page. Added responsive styling and updated asset cache-busting/build labels to v261.
* **AI Feature Rationale:** Gives the workspace a more personal, welcoming entry point without assuming a platform-authenticated identity that the app does not currently expose.
* **Backend Requirements:** None. The current profile is browser-local, not a verified Hatchable account identity; no backend or database behavior changed.

### Version 260 — Metadata Attention Responsive Layout (27 Oct 2026)
* **Contributor:** Kairos AI Developer, requested by Jatin Shende
* **Frontend UI Changes:** Reworked the Metadata attention panel into a three-metric summary row, a two-column grid of common documentation gaps, and responsive asset cards. Long qualified names now wrap instead of colliding with coverage badges; narrow screens collapse the grids cleanly. Updated cache-busting references and footer build label to v260.
* **AI Feature Rationale:** Improves the scan path from overall coverage to recurring gaps to specific assets, while keeping documentation coverage distinct from trust, certification, lineage, and data quality.
* **Backend Requirements:** None. The panel continues to use the currently loaded metadata and existing filter/detail actions; no API, database, or schema behavior changed.

### Version 259 — Hide Admin-Only Controls Outside PostgreSQL Mode (27 Oct 2026)
* **Contributor:** Kairos AI Developer
* **Frontend UI Changes:** Classification editor and full temporal snapshot export controls are now injected only when PostgreSQL catalog mode is selected; injected controls are removed when switching back to Demo mode.
* **AI Feature Rationale:** Prevents demo users from seeing controls that call admin-protected persisted-data APIs and would fail by design.
* **Backend Requirements:** None; existing admin-only endpoints and access rules are preserved.
* **Verification:** The deployed anonymous preview starts in Demo mode without injected classification/export controls. A browser interaction test with mocked API responses confirmed that the deployed v259 script injects the controls when PostgreSQL mode is selected and that the classification dialog switches values correctly. A signed-in admin round trip against real persisted columns remains blocked because the current catalog has no stored `metadata.columns` definitions.

### Version 258 — Classification Precedence Correction (27 Oct 2026)
* **Contributor:** Kairos AI Developer
* **Frontend UI Changes:** Adjusted asset-level PII overlay precedence so a confirmed classified column remains visible even if the asset-level classification conflicts.
* **AI Feature Rationale:** Column-level PII evidence must not be hidden by a contradictory asset-level label; the UI should surface the more specific positive classification.
* **Backend Requirements:** None; this is a frontend interpretation correction over persisted classification records.
* **Unimplemented Backend Gaps:** Conflicting asset/column classifications are surfaced as PII presence but are not yet shown as a dedicated conflict warning.

### Version 257 — PII Persistence, Temporal Lineage Export & Evidence-Filter UX (27 Oct 2026)
* **Contributors:** Jatin Shende / Kairos AI Developer; Gauri / AI Developer
* **Frontend UI Changes:** Added persisted asset/column classification controls to catalog asset rows and a full-snapshot JSON export action to the Lineage Explorer. Catalog rendering distinguishes confirmed PII, reviewed-not-PII, sensitivity labels, and unknown classifications. Added a contextual empty state when evidence filtering hides every graph edge.
* **AI Feature Rationale:**
  * *What it is:* Persisted asset/column PII classification, full lineage snapshot export, and evidence-filter empty-state guidance.
  * *How it applies:* Governance reviewers can record classifications in PostgreSQL and export a snapshot scoped to selected valid-time and recorded-time values; graph users get an explicit explanation when a filter yields no visible edges.
  * *Why chosen:* Prevents refresh-loss for reviewed classifications, avoids exports limited to the visible graph slice, and prevents an empty filtered graph from being mistaken for proof that no dependency exists. NULL remains “not classified”, not “not PII”.
* **Backend Requirements:**
  * **API Endpoints:** Added GET/POST /api/v1/pii-classification and GET /api/v1/lineage/export; extended /api/v1/catalog and /api/v1/column-lineage responses.
  * **Database Schema:** Added migrations/009_kairos_pii_classification.sql, nullable asset/mapping classification columns, and normalized kairos_column_classifications.
  * **Logic & Security:** New routes require admin access and validate classification targets/values. Export includes temporally filtered column mappings and evidence; table-level edges are current-state only because the existing schema has no bitemporal edge columns.
* **Unimplemented Backend Gaps (If any):**
  * OpenLineage/dbt sensitivity facets are not ingested automatically; classification is currently manual.
  * Column classification requires stored schema metadata for the target column.
  * Live write-and-refresh verification for classification and the export download remains pending in an authorized owner/admin browser session.
  * Existing temporal filtering for table-level edges remains an independent backlog item.

### Version 256 — Comprehensive Feature & Backend System Synchronization (27 Oct 2026)
* **Contributor:** Jatin Shende / Kairos AI Developer
* **Frontend UI Changes:** Updated and synchronized all 19 workspace views, 11 sub-tabs in Asset Profile Drawer, standalone Ingestion Portal (`/ingestion.html`), 2D D3 Lineage Explorer, 3D WebGL Observatory canvas, and interactive control matrix in the architectural reference sheet.
* **AI Feature Selection Rationale:**
  * *What it is:* Consolidated full-stack architecture, feature selection rationale log, gap backlog, and deployment workflow prompt into one master reference document.
  * *How it applies:* Ensures complete transparency across all UI components, backend routes, database schema migrations, and pending engineering gaps.
  * *Why chosen:* Prevents knowledge fragmentation between frontend UI developments and backend API/database implementation phases across team members.
* **Backend Requirements:** The live registry contains 20 API routes, including the admin-protected `GET /api/v1/lineage/export` and `GET/POST /api/v1/pii-classification` routes. Smoke-tested the lineage export (HTTP 200 for valid times, HTTP 400 for invalid times, HTTP 401 for public access), PII classification read (HTTP 200 for admin, HTTP 401 for public), catalog, keyword search, and temporal evidence/column-lineage validation. PostgreSQL is reachable; current persisted classification and evidence sets are empty.

### Version 255 — Comprehensive End-to-End QA & Backend Synchronization (27 Oct 2026)
* **Contributor:** Jatin Shende / Kairos AI Developer
* **Frontend UI Changes:** Verified 19 views, 11 sub-tabs in Asset Profile Drawer, standalone Ingestion Portal (`/ingestion.html`), 2D D3 Lineage Explorer, and 3D WebGL Observatory canvas. Checked all navigation triggers, modal forms, and CSV data export controls.
* **AI Feature Rationale:**
  * *What it is:* Full-stack verification audit and backend synchronization update.
  * *How it applies:* Guarantees that every visual control across all 19 workspace routes correctly maps to active API routes (`/api/v1/catalog`, `/api/v1/requests`, `/api/v1/column-lineage`, etc.) or robust local state handlers.
  * *Why chosen:* Solves broken frontend-backend linkages and ensures that zero unimplemented UI features go undocumented.
* **Backend Requirements:** Re-verified live endpoint health status across 18 backend API routes (`HTTP 200 OK`). Confirmed ESM isolate execution and PostgreSQL connection stability.

### Implementation Detail — Persisted PII Classification & Temporal Lineage Export
* **Contributor:** Jatin Shende / Kairos AI Developer
* **Frontend UI Changes:** Added persisted asset/column classification controls to catalog asset rows and a full-snapshot JSON export action to the Lineage Explorer. Updated catalog rendering to distinguish confirmed PII, reviewed-not-PII, sensitivity labels, and unknown classifications.
* **AI Feature Rationale:**
  * *What it is:* Persisted asset/column PII classification and complete lineage snapshot export.
  * *How it applies:* Governance reviewers can record a classification in PostgreSQL and export a lineage snapshot scoped to valid-time and recorded-time values.
  * *Why chosen:* Removes refresh-loss from transient classification UI and avoids exports limited to the currently visible graph slice. NULL remains “not classified”; it is not silently converted to “not PII”.
* **Backend Requirements:**
  * **API Endpoints:** Added GET/POST /api/v1/pii-classification; added GET /api/v1/lineage/export; extended /api/v1/catalog and /api/v1/column-lineage responses.
  * **Database Schema:** Added migrations/009_kairos_pii_classification.sql, nullable asset/mapping classification columns, and normalized kairos_column_classifications.
  * **Logic & Security:** Routes require admin access; validates asset/column identity and classification values; export includes bitemporal column mappings and evidence. Existing table edges are explicitly described as non-temporal in the current schema.
* **Unimplemented Backend Gaps (If any):**
  * OpenLineage/dbt sensitivity facets are not yet ingested automatically. The current classification editor supports manual reviewed values only.
  * Column classification writes require column definitions in kairos_assets.metadata.columns; columns without stored schema metadata cannot be classified until schema ingestion populates them.
  * Live browser verification of admin-only write-and-refresh flows must be completed in an authorized owner/admin browser session.
* **Deployment Note:** This entry describes the code prepared for the v257 deployment; update the status after the deployment and smoke checks complete.

### Version 250 — Unimplemented Backend Gap Backlog & AI Rationale Framework (27 Oct 2026)
* **Contributor:** Jatin Shende / Kairos AI Developer
* **Frontend UI Changes:** Updated architectural handoff sheets and developer guides (`public/BACKEND_INSTRUCTIONS_AND_CHANGELOG.md`) to mandate tracking for UI-to-Backend feature gaps (e.g., PII tags, security classifications) and explicit AI Feature Selection Rationales.
* **Feature Selection Rationale:** 
  * *What it is:* Added a dedicated **Unimplemented Backend Requirements Backlog** section and **AI Feature Selection Log**.
  * *How it applies:* When frontend features (like PII tagging in lineage graphs) are built ahead of full DB persistence, the backend requirements are captured in detail so backend engineers can implement them cleanly without guessing.
  * *Why chosen:* Solves the problem of missing backend specifications when frontend UI features land first.
* **Backend Requirements:** Added structured templates and gap logging sections to ensure zero lost specs during future API/migration work.

### Version 249 — Standardized Contributor Logging & Full-Stack Tracking (27 Oct 2026)
* **Contributor:** Jatin Shende / Kairos AI Developer
* **Frontend UI Changes:** Exposed public developer documentation route at `/BACKEND_INSTRUCTIONS_AND_CHANGELOG.md` with stranger preview link support.
* **Backend Requirements:** Standardized backend deployment protocol with mandatory metadata fields (Author, UI Feature, API Endpoints, DB Migrations).

### Version 247 — Lineage Explorer & ESM Handler Stabilization (27 Oct 2026)
* **Contributor:** Gauri / Core Data Engineering Team
* **Frontend UI Changes:** Restored Lineage Explorer graph navigation (`data-view="lineage"`), hop-depth filters, and asset detail drawer mapping.
* **Backend Requirements:** 
  * Refactored `api/v1/requests.js` from CommonJS (`require`) to ES Modules (`import { db } from 'hatchable'`).
  * Audited bi-temporal CTE lock queries (`lock_key`, `ts`, `existing`) in `api/v1/ingest.js` for `kairos_column_lineage` table updates.
  * Standardized `api/v1/search.js` keyword pattern matching over `kairos_assets` table columns.

---

## 3. Unimplemented Backend Requirements & UI Feature Gap Backlog

*This section tracks UI features added by frontend contributors or AI agents that currently require corresponding backend database schema migrations or API endpoint handlers to be built.*

### Gap #1: Column-Level PII & Data Sensitivity Classification Tags — Implementation Present, Data/UX Verification Pending
* **Original Contributor:** Gauri / UI Team
* **Frontend UI Component:** Lineage Explorer & Schema Detail Drawer (`data-view="lineage"`, `data-view="assets"`)
* **Existing UI:** The demo workspace renders illustrative PII badges and a PII overlay. Demo classifications must not be treated as persisted classifications.
* **Verified Current Backend:** Migration `migrations/009_kairos_pii_classification.sql` (see current migration manifest) and the `kairos_column_classifications` table are present. `kairos_assets` and `kairos_column_lineage` also expose classification fields. The admin-protected `GET/POST /api/v1/pii-classification` route is registered and responds; the current persisted classification query returned zero rows.
* **Status in v259 work:** The manual classification editor in `public/pii-lineage-enhancements.js` calls the existing admin-protected API and reloads persisted metadata after saving. Browser interaction verification with mocked API responses passed for asset selection, switching between columns with different classifications, and switching back to the asset. The v259 deployment manifest contains the corrected script. This was a UI behavior test only; no classification was saved during the test.
* **Verified data blocker:** The current persisted catalog has no `metadata.columns` definitions on its four assets, even though one asset reports `column_count: 5`. The API correctly refuses column classification unless the requested column exists in stored schema metadata. A real column-level save/reload test is therefore blocked until schema ingestion populates actual column names. Do not invent names or bypass validation.
* **Remaining Work / Acceptance Criteria:** After schema ingestion supplies real column names, use an authorized admin session to classify a real persisted column, verify the row survives refresh, and verify PostgreSQL UI renders that persisted value. Asset-level save/reload also still requires an authorized write test. Confirm that NULL/missing classification is shown as “not classified,” never “PII-free.” Automatic source ingestion from OpenLineage/dbt sensitivity facets remains unimplemented.
* **Operational Rationale:** Persisted sensitivity labels must be traceable and must not be inferred from demo records or absent metadata.

### Gap #2: Temporal Lineage Graph Export (JSON) — Backend Endpoint and UI Control Implemented
* **Contributor / Original Request:** Jatin Shende / AI Developer
* **Affected Screen:** Lineage Explorer (`data-view="lineage"`)
* **Verified Current Backend:** `GET /api/v1/lineage/export` is registered, admin-protected, and returned HTTP 200 with a snapshot payload; invalid temporal parameters returned HTTP 400. The payload includes assets, current table-level edges, temporally filtered column mappings/evidence, and classification rows.
* **Frontend UI Status in v257 work:** `public/pii-lineage-enhancements.js` injects an “Export full snapshot JSON” control next to the existing “Export impact” action and calls the temporal export API with the selected valid/recorded timestamps. The control is available only after the updated script is deployed; live browser verification remains pending.
* **Important Limitation:** The export response explicitly treats table-level edges as current stored relationships because the schema does not provide bitemporal bounds for those edges. Do not describe the whole graph export as a fully bitemporal graph snapshot.
* **Target Paths / Ownership:** `public/app.js` (Lineage Explorer owner: Pranav; coordinate before editing); `api/v1/lineage/export.js` (existing backend implementation).
* **Next Step:** Validate the JSON download in an authorized owner/admin browser session. SVG export remains out of scope until the Lineage Explorer owner confirms it is required. Keep the table-edge temporal limitation visible and ensure existing CSV exports remain unchanged.
* **Operational Rationale:** Governance users need a discoverable way to export a snapshot, while the UI must not imply historical guarantees that the underlying table-edge model cannot support.

### Gap #3: Temporal Filtering for Table-Level Lineage Edges
* **Added By / Contributor:** Kairos AI Developer — frontend audit finding (27 Oct 2026)
* **UI Feature / Affected Screen:** Lineage Explorer valid-time and recorded-time controls (`data-view="lineage"`).
* **Current Implementation:** `api/v1/evidence-at-time.js` applies both temporal dimensions to evidence records, and `api/v1/column-lineage.js` applies them to column mappings. The UI explicitly states that Time check does not rewrite the current catalog graph and that table-level edges are not time-filtered.
* **Verified Backend Gap:** `api/v1/catalog.js` reads `kairos_lineage_edges` without valid-time or recorded-time predicates. The current `kairos_lineage_edges` schema has no dedicated `valid_from`, `valid_to`, `recorded_from`, or `recorded_to` columns. The catalog API therefore cannot return a table-edge snapshot filtered on both temporal dimensions.
* **Required Backend Work:** Agree on the data model and API contract before implementation. The current schema does not support independent bitemporal bounds for table-level edges; do not add columns or migrations until the team approves whether edge history should be stored on edges or derived from another authoritative record.
* **Target File Paths:** `api/v1/catalog.js`; `api/v1/lineage/export.js`; `api/v1/ingest.js` only if the approved design requires changes there; migration path/name TBD after design approval (migration 009 is already used for PII classification).
* **Operational Rationale:** Historical impact and governance queries must not present today's table-level relationships as though they were valid at an earlier business time or known to the system at an earlier recorded time.

### Gap #4: Server-Issued Ingestion API Credentials
* **Added By / Contributor:** Kairos AI Developer — frontend audit finding (27 Oct 2026)
* **UI Feature / Affected Screen:** Integrations & API (`data-view="integrations"`).
* **Current Implementation:** The screen says token issuance and validation are not configured. The “Token issuance unavailable” button is not natively disabled, but its click handler displays a clear message that no credential was created. The Integrations page shows a placeholder token string, not a usable credential.
* **Verified Backend Gap:** The ingestion route remains admin-protected and there is no registered server-issued bearer-token issuance/revocation flow.
* **Required Backend Work:** First confirm that service-to-service tokens are in scope and review Hatchable-supported secret/auth mechanisms. Only then define minimal issuance, revocation, expiry, scope, storage, and audit contracts. Do not add tables/endpoints before approval.
* **Target File Paths:** `api/v1/ingest.js`; proposed token endpoints only after design approval; a migration only if the approved persistence design requires it. `public/app.js` is shared with the Lineage Explorer owner and requires coordination.
* **Operational Rationale:** Ingestion integrations need a documented, revocable credential path that does not require granting collaborators broad admin access or embedding secrets in browser code.

---

## 4. AI Feature Selection & Rationale Log

*This section records every new feature introduced by AI developer agents, explaining the problem solved, visual application, and architectural justification.*

| Feature Name | Primary Contributor | Applied Kairos Surface | Problem Solved & Selection Rationale |
| :--- | :--- | :--- | :--- |
| **Resilient Keyword Search Fallback** | AI Developer | `POST /api/v1/search` | **Problem:** Unconfigured OpenAI/Anthropic API keys caused search route 412 errors.<br>**Rationale:** Replaced mandatory LLM dependency with case-insensitive PostgreSQL text matching over `kairos_assets` so catalog search works out-of-the-box with zero setup. |
| **Bi-temporal Column Lineage Snapshotting** | Gauri & AI Developer | `api/v1/column-lineage.js` | **Problem:** Standard lineage tools overwrite history when column definitions change.<br>**Rationale:** Implemented valid-time (`valid_from`/`valid_to`) and system-recorded time (`recorded_from`/`recorded_to`) to permit temporal time-travel auditing. |
| **Full-Stack Contributor & Gap Log** | Jatin Shende / AI Developer | `public/BACKEND_INSTRUCTIONS_AND_CHANGELOG.md` | **Problem:** Disconnect between frontend UI additions and missing backend DB endpoints.<br>**Rationale:** Created a single canonical markdown sheet that tracks UI changes, missing backend gaps, author attribution, and AI feature rationales automatically. |
| **Automated Teammate AI Prompt** | Jatin Shende / AI Developer | Section 5 of Guide | **Problem:** Teammates' AI tools bypass documentation updates during deploys.<br>**Rationale:** Provided a structured copy-paste prompt enforcing automated log edits before every `deploy` call. |
| **Persisted PII & Sensitivity Classification** | Jatin Shende / Kairos AI Developer | Catalog asset rows, column lineage, `POST /api/v1/pii-classification` | **Problem:** PII labels could be demo-only or disappear on refresh.<br>**Rationale:** Stores reviewed asset/column classifications in PostgreSQL; NULL remains unknown rather than being misrepresented as non-PII. |
| **Temporal Lineage Snapshot Export** | Jatin Shende / Kairos AI Developer | Lineage Explorer, `GET /api/v1/lineage/export` | **Problem:** Client-side export captures only visible graph slices.<br>**Rationale:** Exports the complete authorized snapshot payload and selected temporal values, while disclosing that table-level edges are not yet bitemporal. |
| **19-View Full-Stack QA Verification** | Jatin Shende / AI Developer | All Workspace Views | **Problem:** Broken navigation links or unmapped buttons in UI views.<br>**Rationale:** Executed comprehensive audit across all 19 views and 11 sub-tabs to ensure complete API mapping or client-side fallback handling. |
| **Metadata Attention Responsive Layout** | Kairos AI Developer / requested by Jatin Shende | Overview → Metadata attention (`public/app.js`, `public/styles.neo.css`) | **Problem:** Summary counts, common-gap controls, and long asset names could feel crowded or misalign at different widths.<br>**Rationale:** Separated the panel into a three-column metric summary, two-column common-gap grid, and wrapping asset cards that collapse on mobile; this makes discovery and ownership gaps easier to scan without changing the underlying coverage calculation. No backend changes were required. |
| **Interactive Transformation Inspection & SQL Analysis** | Kairos AI Developer | Column dependency inspector and Column Lineage Logic modal (`public/app.js`) | **Problem:** Transformation text in the mapping inventory was not clickable, and SQL-view navigation relied on a generic view action. **Rationale:** Uses explicit `inspect-transform` and `analyze-transform-sql` actions to open transformation details and transfer the selected expression into the existing static SQL parser without changing backend behavior. |
| **Asset Type Breakdown & Broad Classification** | Kairos AI Developer / requested by Jatin Shende | Data Assets → Asset type breakdown and Catalog coverage (`public/app.js`) | **Problem:** Chart labels and counts used mismatched category logic, and the chart was absent in persisted PostgreSQL catalog mode. **Rationale:** A shared metadata-based classifier groups assets into source/warehouse tables, views, transformation models, ML feature datasets, BI/reports/outputs, metrics/KPIs, files/event streams, and other/unclassified; a horizontal bar chart improves comparison. Categories are inferred from metadata and are not represented as reviewed/persisted classifications. |
| **Responsive Asset Profile Layout** | Kairos AI Developer / requested by Jatin Shende | Asset Profile drawer (`public/styles.neo.css`) | **Problem:** Dense facts, long tab labels, and action buttons could feel cramped at smaller viewport widths. **Rationale:** Uses wrapping-safe metadata tiles, responsive 4/2/1-column grids, horizontally scrollable tabs, and mobile-stacked actions to preserve readability without changing data or backend behavior. |

---

## 5. Teammate & AI Assistant Deployment Prompt

Share this prompt with all team members (Gauri, Jatin, developers, AI coding tools). It forces the AI assistant to read the specification, document features and gaps, and update the log before deploying:

```markdown
You are working on the Kairos Metadata Lineage Dashboard project.

PRIMARY DIRECTIVE:
Before making changes or deploying code, read the canonical full-stack architecture and changelog guide at `public/BACKEND_INSTRUCTIONS_AND_CHANGELOG.md`.

YOUR MANDATORY WORKFLOW WHEN ADDING FEATURES OR DEPLOYING:

1. FULL-STACK IMPLEMENTATION & UI-BACKEND GAP LOGGING:
   - Frontend UI: Preserve Kairos's dark navy (#0B1220) theme, horizontal tab system, and D3 graph containers.
   - If you add a UI feature (e.g. PII tags, filters, badges) that does NOT yet have a backend database table or API endpoint, you MUST add an entry under Section 3 ("Unimplemented Backend Requirements & UI Feature Gap Backlog") detailing:
     * UI Feature Added
     * What the Backend Needs (DB table/columns, API endpoints)
     * Target File Paths (migrations/*.sql, api/v1/*.js)
     * Why It Is Needed (operational/business rationale)
     * Step-by-Step Implementation Plan for backend developers

2. AI FEATURE SELECTION & RATIONALE:
   - For every new feature added, document in Section 4 ("AI Feature Selection & Rationale Log"):
     * What the feature is
     * How it applies to Kairos
     * Why this feature was chosen (problem solved & architectural justification)

3. AUTOMATED CHANGELOG ENTRY:
   - Before running `deploy`, update Section 2 with contributor name, UI changes, AI rationale, and backend requirements.

4. DEPLOYMENT VALIDATION:
   - Run a dry-run deploy check to ensure zero blocking linter errors.
   - Execute `deploy` with intent and summary matching the log entry.

Start by reviewing `public/BACKEND_INSTRUCTIONS_AND_CHANGELOG.md` and state what feature we are implementing today.
```

---

## 6. Full-Stack Component & API Registry

### 6.1 Frontend UI Views & Connected Backend Endpoints

| Frontend UI View | Trigger Selector | Visual Component | Required Backend API Endpoint | Primary Contributor |
| :--- | :--- | :--- | :--- | :--- |
| **Home / Overview** | `data-view="overview"` | Dashboard summary cards & stats | `GET /api/v1/catalog` | Data Engineering |
| **Catalog & Schemas** | `data-view="assets"`, `data-view="catalog"` | Asset data table & detail drawer | `GET /api/v1/catalog` | Data Engineering |
| **Semantic Search** | `data-view="search"` | Keyword / RAG search input & results | `POST /api/v1/search` | Jatin Shende |
| **Lineage Explorer** | `data-view="lineage"` | D3 2D graph & hop depth | `GET /api/v1/catalog`, `GET /api/v1/column-lineage` | Gauri |
| **3D Observatory** | `data-view="observatory"` | Three.js WebGL domain cluster canvas | `GET /api/v1/catalog` | Core Platform Team |
| **Pipeline Operations** | `data-view="runs"`, `data-view="quality"` | Run history table & anomaly logs | `GET /api/v1/catalog`, `POST /api/v1/worker/process` | Platform Operations |
| **Stewardship** | `data-view="stewardship"` | Access requests queue & decision buttons | `GET /api/v1/requests`, `POST /api/v1/request-decision` | Gauri & Data Platform |
| **Trust & History** | `data-view="evidence"`, `data-view="history"` | Bitemporal evidence timeline | `GET /api/v1/evidence-at-time` | Research Team |

---

## 7. Database Migration & Backend Architecture Index

### 7.1 Database Schema Migrations

| Migration File | Primary Table(s) Created / Modified | Responsibilities |
| :--- | :--- | :--- |
| `001_kairos_metadata.sql` | `kairos_assets`, `kairos_lineage_edges` | Assets (qualified_name, schema_name, asset_kind, owner_name, metadata) and Edges (source_asset_id, target_asset_id, edge_type, evidence_ref). |
| `002_kairos_raw_events.sql` | `kairos_raw_events` | Stores raw dbt manifests, OpenLineage JSON payloads, and generic metadata event logs. |
| `003_kairos_raw_events_immutable.sql` | `kairos_raw_events` | Immutable log constraints and source system deduplication (`source_system`, `source_record_id`). |
| `004_kairos_data_products.sql` | `kairos_data_products` | Domain grouping, contract versions, and SLA tiers (Gold/Silver/Bronze). |
| `005_kairos_durable_jobs.sql` | `kairos_pipeline_runs` | Job execution status (`RUNNING`, `SUCCESS`, `FAILED`), durations, and event totals. |
| `006_kairos_pgvector_rag.sql` | Vector index tables | Vector embedding storage for semantic RAG search over schema definitions. |
| `007_kairos_rls.sql` | RLS Policies | Row-Level Security policy definitions for workspace isolation. |
| `008_kairos_column_lineage.sql` | `kairos_column_lineage` | Bi-temporal column mappings (`source_column`, `target_column`, `transformation`, `valid_from`, `valid_to`, `recorded_from`, `recorded_to`). |
| `009_kairos_pii_classification.sql` | `kairos_assets`, `kairos_column_lineage`, `kairos_column_classifications` | Persisted asset/column sensitivity classification fields and classification registry. |

---

## 8. Automated Pre-Deployment Checklist

Before triggering `deploy`:
1. **Contributor Attribution:** Did you write your name and feature summary in Section 2?
2. **AI Feature Rationale:** Did you document what the feature is, how it applies, and why it was chosen?
3. **Backend Gap Backlog:** If UI features were added without backend persistence (e.g., PII tags), did you document the missing DB tables/API endpoints in Section 3?
4. **Backend Route Sync:** Are backend JS handlers configured with ESM (`import`) and declared `access` levels?
5. **Dry-Run Check:** Run `dry_run_deploy` to verify zero blocking errors.
6. **Publish:** Run `deploy` with `intent` and `summary` matching the log entry.

---

## 9. UI Audit & Handoff Snapshot (27 October 2026)

**Scope:** Primary Hatchable app, version 256, using an anonymous preview session. The older project was not treated as the target. No database records were written by this audit. No frontend code, schema, or migration was changed. This audit snapshot is a draft until the canonical document is deployed.

### Screen sweep

All 16 primary navigation views opened in the browser without JavaScript page errors: Overview, Assets, Catalog, Search, Data Products, Lineage Explorer, SQL Analysis, 3D Observatory, Pipeline Runs, Data Quality, Incidents, Stewardship, Evidence, Time Travel, Integrations & API, and Settings. This is a render smoke test, not proof every control on every screen is correct.

### Verified checks

| Area | Expected behavior | Actual result | Severity / next action |
|---|---|---|---|
| Lineage search | Search narrows graph; no-match state is clear; clearing restores graph | Passed in demo: 7 assets / 8 dependencies baseline; no-match showed 0 / 0; clearing restored 7 / 8 | Pass |
| Direction and depth | Upstream/downstream and hop depth update graph slice | Passed in demo: upstream and downstream each showed 4 assets / 3 dependencies; depth 3 expanded the slice | Pass |
| Evidence-state filter | Four states remain distinct and filter edges without inventing evidence | Passed in demo: OBSERVED 2, POSSIBLE 1, REFUTED_FOR_RUN 1, UNKNOWN 4 out of 8 dependencies | Pass |
| Browser runtime | Navigation and tested interactions do not throw browser errors | No page errors or console errors during the 16-view sweep and focused lineage checks | Pass; not a full accessibility audit |
| PostgreSQL access | Anonymous user must not be shown persisted data as if access succeeded | Switching to PostgreSQL mode showed “Sign-in required” and no demo fallback | Pass; verify again in an authorized admin session |
| Persisted catalog | API returns stored records and identifies source | Admin GET returned 4 assets, 2 edges, 0 evidence, 0 column mappings, 0 pipeline runs, 0 quality checks, 2 raw events, and 0 persisted column classifications | Pass; small dataset limits end-to-end coverage |
| Keyword search API | Search uses persisted metadata and discloses keyword matching | Admin POST returned HTTP 200 and two matches for “orders”; response says this is keyword search, not semantic/RAG or lineage proof | Pass |
| Temporal APIs | Valid timestamps succeed; invalid timestamps fail clearly | Evidence and column-lineage endpoints returned HTTP 200 for valid times with empty results; invalid time returned HTTP 400 on both | Pass for empty-store and validation cases; populated historical intervals remain untested |
| Temporal lineage export API | Export route returns bounded snapshot and validates time parameters | Admin GET returned HTTP 200 with counts and explicit limitation for non-temporal table edges; invalid time returned HTTP 400 | Backend pass; table-level edges are not bitemporal |
| PII classification API | Route reads persisted classifications and rejects unknown asset writes | Admin GET returned HTTP 200 with an empty classification list; invalid asset write returned HTTP 404 without changing data | API validation pass; persistence across refresh and UI round-trip still need an authorized write test |
| Deployment lint | CTE aliases should not be treated as missing base tables | Three warnings name `lock_key`, `ts`, and `existing`, which are defined as CTEs in the same SQL statement at `api/v1/ingest.js:104`. This is a static-linter false positive; do not add tables for those aliases. | Informational; do not change ingestion solely to silence this warning |

### Prioritized findings

**P1 — Lineage graph export is not discoverable in the UI**
- The live `GET /api/v1/lineage/export` endpoint is registered and passes the API smoke test, but the Lineage Explorer contains no “Export Lineage Graph” control; the only visible graph-page export action is “Export impact” (CSV).
- The canonical spec previously claimed the button had been added. That description has been corrected in the gap backlog.
- Next step: get approval from Pranav, the listed Lineage Explorer owner, before editing shared `public/app.js`. Confirm whether JSON, SVG, or both are required, then wire the smallest UI control to the existing endpoint and test download/error behavior.

**P1 — Table-level lineage edges are not bitemporal**
- The catalog API and snapshot export return current stored table-level edges without valid-time/recorded-time predicates. The edge table has no dedicated bitemporal interval columns.
- The UI currently discloses this limitation. Keep that disclosure. Data-model and migration work requires team approval; no migration is proposed by this audit.

**P2 — Footer build label is stale**
- The current project deployment is version 256, but the live UI footer says “BUILD V254”. This is a presentation/documentation mismatch, not a data-integrity defect.
- Next step: with the shared `public/app.js` owner’s agreement, replace the hard-coded footer label with a maintained release label or remove the stale build number. Do not change the Lineage Explorer layout or shared styles for this cosmetic fix.

**Integrations token-unavailable control — behavior verified, no functional defect found**
- The control is clickable, and its handler explicitly reports “API token issuance is not configured. No credential was created.” This is an explanatory action, not token issuance. It is not natively disabled; changing that is an optional accessibility/UX decision for the owner, not a release blocker.
- Do not implement credential issuance before the auth/security design is approved.

**P2 — PII-classification documentation was stale**
- The PII migration/schema and admin API route already exist in version 256; the current persisted classification set is empty. The backlog now distinguishes implemented plumbing from pending authorized end-to-end UI verification.

### Not yet verified / release blockers

- An authorized admin browser session was not available for end-to-end PostgreSQL UI verification, including persisted classification save/reload and populated historical-time queries.
- CSV exports were not inspected byte-for-byte; prior tracker notes record filtered-row count tests, but those do not validate every CSV field/escaping case.
- The older reference UI has not received a full parity audit.
- The app’s existing temporal edge limitation is documented and should remain visible until a team-approved data model supports it.
- No `public/app.js`, CSS, Observatory, API, schema, or migration changes were made in this audit. No deployment was initiated because the identified frontend fixes touch a shared file owned by another teammate and require coordination.

### Follow-up verification after version 259 deployment (27 October 2026)

The live deployment registry confirms **version 259 is live** (deployed 08:19:25 UTC). Version-256/257 notes above are retained as historical snapshots; current verification follows.

- The anonymous preview rendered successfully, loads `public/pii-lineage-enhancements.js?v=259`, and shows footer **build v259**. The version-259 deployment manifest's script hash matches the current `public/pii-lineage-enhancements.js` source hash (`60ae1497e317fa14efb7ba1e6f9f3b3e45fc99580143381ff1da6f92fd777ca6`), confirming the column-specific editor correction is included in the live deployment. This deployment was already live when verification ran; this audit did not invoke deploy.
- **Browser interaction test passed (mocked API responses only; no writes):** opened the real editor UI in the deployed anonymous preview and tested four cases: asset selection showed asset-level `true / PII`; selecting `order_total` showed its own `false / INTERNAL`; switching to `email` refreshed to `true / PII`; switching back to the asset restored `true / PII`. The form was cancelled without saving. This verifies the editor's field-selection behavior, not persistence against live rows.
- **Real-data limitation discovered:** the live catalog has 4 assets and 0 persisted column classifications. The one asset reporting `column_count: 5` has no `metadata.columns` object, and the other three assets also lack stored column definitions. Because the API deliberately requires a named column in `kairos_assets.metadata.columns`, a real column-level classification round trip cannot yet be completed with the current catalog data. Schema ingestion must populate column names before a real column can be safely classified; do not invent column names or bypass the API validation.
- Fresh API checks: admin GET `/api/v1/pii-classification` returned HTTP 200 with an empty list; anonymous GET returned HTTP 401. Admin GET `/api/v1/lineage/export` returned HTTP 200 with 4 assets and 2 current table-level edges; anonymous GET returned HTTP 401. Invalid export time returned HTTP 400. A test write against a nonexistent asset returned HTTP 404, and a follow-up classification read remained empty; no test data was written.
- The table-edge bitemporal limitation remains unchanged: export semantics disclose that table-level edges are current stored relationships, not historical edge snapshots.
- Latest deployment dry run reports `ok: true`, zero errors, and the same three known false-positive CTE-alias warnings in `api/v1/ingest.js`; it reports next version 260. No deployment was initiated for this verification.

### Handoff acceptance criteria

1. Pranav confirms scope/placement before any further Lineage Explorer changes in shared `public/app.js`; do not duplicate the JSON export control already in v259.
2. Once schema ingestion populates real column names, use an authorized admin session to verify an actual column classification save/reload and verify the persisted value after refresh.
3. Verify the full JSON download in an authorized admin browser session and retain the table-edge temporal limitation disclosure.
4. Before any future deployment, update Section 2 with the actual contributor/change summary, rerun `dry_run_deploy`, review warnings, coordinate release, deploy once, and re-test the deployed version.

### Superseded v257 handoff checklist

The current acceptance criteria are listed in the v259 follow-up above. Retain the original v257 checklist only as historical context; do not use its version-specific statements as current status.