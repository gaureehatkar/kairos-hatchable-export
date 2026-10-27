# Kairos Full-Stack Architecture, Contributor Change Log & System Guide

**Project Name:** Kairos Metadata Lineage Dashboard  
**Hatchable Project ID:** `proj_HTYAd2BCLtMt`  
**Slug:** `kairos-metadata`  
**Live URL:** [https://kairos-metadata.hatchable.site](https://kairos-metadata.hatchable.site)  
**Last Updated:** 27 October 2026 (Version 250)  

---

## 1. Executive Purpose & Automated Sync Protocol

This document is the **canonical full-stack specification, contributor change log, backend gap backlog, and implementation guide** for Kairos. Every time any contributor (such as Gauri, Jatin, or an automated developer agent) makes changes to either the **Frontend UI** or **Backend Infrastructure**, this document must be updated and deployed alongside the codebase.

### Core Development & Sync Invariants
1. **Full-Stack Attribution & Rationale:** Every change entry must explicitly cite:
   * **Contributor Name:** Who made or requested the change (e.g. Gauri, Jatin, AI Developer).
   * **Frontend UI Modifications:** Visual elements, tags, tabs, or graph overlays added.
   * **Backend API & DB Requirements:** Endpoints modified, tables created, or migration scripts written.
   * **AI Feature Rationale:** Why the feature was chosen, how it applies to Kairos, and what problem it solves.
2. **Backend Gap & Unimplemented Requirements Backlog:** If a UI feature is added (e.g., PII tags, data security labels) before the backend API/database supports it, the AI MUST log:
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

---

## 4. AI Feature Selection & Rationale Log

*This section records every new feature introduced by AI developer agents, explaining the problem solved, visual application, and architectural justification.*

| Feature Name | Primary Contributor | Applied Kairos Surface | Problem Solved & Selection Rationale |
| :--- | :--- | :--- | :--- |
| **Resilient Keyword Search Fallback** | AI Developer | `POST /api/v1/search` | **Problem:** Unconfigured OpenAI/Anthropic API keys caused search route 412 errors.<br>**Rationale:** Replaced mandatory LLM dependency with case-insensitive PostgreSQL text matching over `kairos_assets` so catalog search works out-of-the-box with zero setup. |
| **Bi-temporal Column Lineage Snapshotting** | Gauri & AI Developer | `api/v1/column-lineage.js` | **Problem:** Standard lineage tools overwrite history when column definitions change.<br>**Rationale:** Implemented valid-time (`valid_from`/`valid_to`) and system-recorded time (`recorded_from`/`recorded_to`) to permit temporal time-travel auditing. |
| **Full-Stack Contributor & Gap Log** | Jatin Shende / AI Developer | `public/BACKEND_INSTRUCTIONS_AND_CHANGELOG.md` | **Problem:** Disconnect between frontend UI additions and missing backend DB endpoints.<br>**Rationale:** Created a single canonical markdown sheet that tracks UI changes, missing backend gaps, author attribution, and AI feature rationales automatically. |

---

## 5. Mandatory Deployment Log Entry Template

Every developer (human or agent) MUST use this exact template when adding entries to Section 2 prior to running `deploy`:

```markdown
### Version <Version_Number> — <Brief_Title> (<Date>)
* **Contributor:** <Contributor Name, e.g. Gauri / Jatin Shende / AI Developer>
* **Frontend UI Changes:** <What was added or modified in HTML/JS/CSS>
* **AI Feature Rationale:**
  * *What it is:* <Brief description of feature>
  * *How it applies:* <Application to Kairos metadata/lineage>
  * *Why chosen:* <Problem solved & architectural justification>
* **Backend Requirements:**
  * **API Endpoints:** <New or updated routes in api/v1/>
  * **Database Schema:** <New tables, columns, or migration files added>
  * **Logic & Security:** <Access levels and error handling implemented>
* **Unimplemented Backend Gaps (If any):**
  * *UI Feature Added:* <e.g. Added PII tag badges to column lineage>
  * *Backend Needed:* <e.g. Need is_pii column in kairos_column_lineage>
  * *Target Files:* <e.g. migrations/009_pii_classification.sql>
  * *Why Needed:* <Operational rationale for persistence>
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

## 7. Automated Pre-Deployment Checklist

Before triggering `deploy`:
1. **Contributor Attribution:** Did you write your name and feature summary in Section 2?
2. **AI Feature Rationale:** Did you document what the feature is, how it applies, and why it was chosen?
3. **Backend Gap Backlog:** If UI features were added without backend persistence (e.g., PII tags), did you document the missing DB tables/API endpoints in Section 3?
4. **Backend Route Sync:** Are backend JS handlers configured with ESM (`import`) and declared `access` levels?
5. **Dry-Run Check:** Run `dry_run_deploy` to verify zero blocking errors.
6. **Publish:** Run `deploy` with `intent` and `summary` matching the log entry.