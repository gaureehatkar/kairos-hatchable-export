# Kairos Full-Stack Architecture, Contributor Change Log & System Guide

**Project Name:** Kairos Metadata Lineage Dashboard  
**Hatchable Project ID:** `proj_HTYAd2BCLtMt`  
**Slug:** `kairos-metadata`  
**Live URL:** [https://kairos-metadata.hatchable.site](https://kairos-metadata.hatchable.site)  
**Last Updated:** 27 October 2026 (Version 256)  

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

### Version 256 — Comprehensive Feature & Backend System Synchronization (27 Oct 2026)
* **Contributor:** Jatin Shende / Kairos AI Developer
* **Frontend UI Changes:** Updated and synchronized all 19 workspace views, 11 sub-tabs in Asset Profile Drawer, standalone Ingestion Portal (`/ingestion.html`), 2D D3 Lineage Explorer, 3D WebGL Observatory canvas, and interactive control matrix in the architectural reference sheet.
* **AI Feature Selection Rationale:**
  * *What it is:* Consolidated full-stack architecture, feature selection rationale log, gap backlog, and deployment workflow prompt into one master reference document.
  * *How it applies:* Ensures complete transparency across all UI components, backend routes, database schema migrations, and pending engineering gaps.
  * *Why chosen:* Prevents knowledge fragmentation between frontend UI developments and backend API/database implementation phases across team members.
* **Backend Requirements:** Re-verified live API health across 18 backend endpoints (`HTTP 200 OK`). Confirmed ESM isolate execution, PostgreSQL table reachability, and bi-temporal lineage snapshot engines.

### Version 255 — Comprehensive End-to-End QA & Backend Synchronization (27 Oct 2026)
* **Contributor:** Jatin Shende / Kairos AI Developer
* **Frontend UI Changes:** Verified 19 views, 11 sub-tabs in Asset Profile Drawer, standalone Ingestion Portal (`/ingestion.html`), 2D D3 Lineage Explorer, and 3D WebGL Observatory canvas. Checked all navigation triggers, modal forms, and CSV data export controls.
* **AI Feature Rationale:**
  * *What it is:* Full-stack verification audit and backend synchronization update.
  * *How it applies:* Guarantees that every visual control across all 19 workspace routes correctly maps to active API routes (`/api/v1/catalog`, `/api/v1/requests`, `/api/v1/column-lineage`, etc.) or robust local state handlers.
  * *Why chosen:* Solves broken frontend-backend linkages and ensures that zero unimplemented UI features go undocumented.
* **Backend Requirements:** Re-verified live endpoint health status across 18 backend API routes (`HTTP 200 OK`). Confirmed ESM isolate execution and PostgreSQL connection stability.

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

### Gap #1: Column-Level PII & Data Sensitivity Classification Tags
* **Added By / Contributor:** Gauri / UI Team
* **Frontend UI Component:** Lineage Explorer & Schema Detail Drawer (`data-view="lineage"`, `data-view="assets"`)
* **What Was Added in UI:** Rendered visual PII badges (`[PII]`, `[CONFIDENTIAL]`, `[PHI]`) next to sensitive column names in column lineage trees and asset schema tables.
* **What the Backend Needs:**
  * **Database Table / Column:** Add `is_pii BOOLEAN DEFAULT false` and `sensitivity_classification VARCHAR(50)` columns to `kairos_column_lineage` and `kairos_assets`.
  * **Target File Paths:** `migrations/009_pii_classification.sql`, `api/v1/column-lineage.js`, `api/v1/catalog.js`.
* **Why It Is Needed:** Currently, PII tags are rendered in UI state but revert on page refresh. Persisting PII classifications in PostgreSQL ensures compliance auditing and automated row/column masking policy generation.
* **Implementation Plan:**
  1. Write `migrations/009_pii_classification.sql` adding `sensitivity_level` enum and columns.
  2. Update `api/v1/column-lineage.js` SELECT and INSERT statements to return and persist `is_pii`.
  3. Update `api/v1/ingest.js` metadata parser to extract `pii_tag` from ingested OpenLineage / dbt column facets.

### Gap #2: Temporal Lineage Graph Export (JSON / SVG)
* **Added By / Contributor:** Jatin Shende / AI Developer
* **Frontend UI Component:** Visual Lineage Explorer Header (`data-view="lineage"`)
* **What Was Added in UI:** Added "Export Lineage Graph" button supporting JSON structure download and D3 SVG snapshot rendering.
* **What the Backend Needs:**
  * **API Endpoint:** `GET /api/v1/lineage/export`
  * **Target File Path:** `api/v1/lineage/export.js`
* **Why It Is Needed:** Client-side canvas export only captures visible rendered nodes. A backend export endpoint generates a full upstream/downstream dependency graph payload matching exact bitemporal `valid_as_of` timestamps for governance compliance reports.

### Gap #3: Temporal Filtering for Table-Level Lineage Edges
* **Added By / Contributor:** Kairos AI Developer — frontend audit finding (27 Oct 2026)
* **UI Feature / Affected Screen:** Lineage Explorer valid-time and recorded-time controls (`data-view="lineage"`).
* **Current Implementation:** `api/v1/evidence-at-time.js` applies both temporal dimensions to evidence records, and `api/v1/column-lineage.js` applies them to column mappings. The UI explicitly states that Time check does not rewrite the current catalog graph and that table-level edges are not time-filtered.
* **Verified Backend Gap:** `api/v1/catalog.js` reads `kairos_lineage_edges` without valid-time or recorded-time predicates. The current `kairos_lineage_edges` schema has no dedicated `valid_from`, `valid_to`, `recorded_from`, or `recorded_to` columns. The catalog API therefore cannot return a table-edge snapshot filtered on both temporal dimensions.
* **Required Backend Work:** Define the API contract and determine whether a migration is necessary.
* **Target File Paths:** `api/v1/catalog.js`; `api/v1/ingest.js`; `migrations/009_temporal_edges.sql`.
* **Operational Rationale:** Historical impact and governance queries must not present today's table-level relationships as though they were valid at an earlier business time or known to the system at an earlier recorded time.

### Gap #4: Server-Issued Ingestion API Credentials
* **Added By / Contributor:** Kairos AI Developer — frontend audit finding (27 Oct 2026)
* **UI Feature / Affected Screen:** Integrations & API (`data-view="integrations"`).
* **Current Implementation:** The screen explicitly says token issuance and validation are not configured and displays a disabled/unavailable token-issuance action.
* **Verified Backend Gap:** The UI cannot issue a usable ingestion credential, and the inspected ingestion endpoint is configured for admin access rather than a server-issued bearer-token flow.
* **Required Backend Work:** Implement token issuance, revocation, and scope validation backend tables and endpoints.
* **Target File Paths:** `api/v1/ingest.js`; `api/v1/tokens.js`; `migrations/010_api_tokens.sql`.
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
| **19-View Full-Stack QA Verification** | Jatin Shende / AI Developer | All Workspace Views | **Problem:** Broken navigation links or unmapped buttons in UI views.<br>**Rationale:** Executed comprehensive audit across all 19 views and 11 sub-tabs to ensure complete API mapping or client-side fallback handling. |

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

---

## 8. Automated Pre-Deployment Checklist

Before triggering `deploy`:
1. **Contributor Attribution:** Did you write your name and feature summary in Section 2?
2. **AI Feature Rationale:** Did you document what the feature is, how it applies, and why it was chosen?
3. **Backend Gap Backlog:** If UI features were added without backend persistence (e.g., PII tags), did you document the missing DB tables/API endpoints in Section 3?
4. **Backend Route Sync:** Are backend JS handlers configured with ESM (`import`) and declared `access` levels?
5. **Dry-Run Check:** Run `dry_run_deploy` to verify zero blocking errors.
6. **Publish:** Run `deploy` with `intent` and `summary` matching the log entry.