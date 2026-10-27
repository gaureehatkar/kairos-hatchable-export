# Kairos Full-Stack Architecture, Contributor Change Log & System Guide

**Project Name:** Kairos Metadata Lineage Dashboard  
**Hatchable Project ID:** `proj_HTYAd2BCLtMt`  
**Slug:** `kairos-metadata`  
**Live URL:** [https://kairos-metadata.hatchable.site](https://kairos-metadata.hatchable.site)  
**Last Updated:** 27 October 2026 (Version 249)  

---

## 1. Executive Purpose & Automated Sync Protocol

This document is the **canonical full-stack specification, contributor change log, and implementation guide** for Kairos. Every time any contributor (such as Gauri, Jatin, or an automated developer agent) makes changes to either the **Frontend UI** or **Backend Infrastructure**, this document must be updated and deployed alongside the codebase.

### Core Development Invariants
1. **Full-Stack Attribution:** Every change entry must explicitly cite the **Contributor Name**, **Frontend UI Modifications**, **Backend API Requirements**, and **Database Schema Impact**.
2. **Canonical Ground Truth:** PostgreSQL is the single source of truth for assets, lineage edges, column mappings, evidence, access requests, and pipeline runs.
3. **ES Module Compliance:** All backend handlers in `api/**/*.js` must use standard ES Modules (`import / export`). CommonJS (`require()`) is strictly prohibited.
4. **UI Design System Discipline:** Frontend UI changes must preserve Kairos's dark navy (`#0B1220`) theme, D3 lineage graph containers, horizontal tab navigation, and enterprise data density without introducing unauthorized UI libraries.

---

## 2. Comprehensive Contributor Deployment Log (Full-Stack Changelog)

### Version 249 — Standardized Contributor Logging & Full-Stack Tracking (27 Oct 2026)
* **Contributor:** Jatin Shende / Kairos AI Developer
* **Frontend UI Changes:** Updated architectural handoff sheets and developer guides (`public/BACKEND_INSTRUCTIONS_AND_CHANGELOG.md`) to require explicit Contributor Name tracking, Frontend UI impact specs, and corresponding Backend requirements for every feature iteration.
* **Backend Requirements:** Standardized backend deployment protocol with mandatory metadata fields (Author, UI Feature, API Endpoints, DB Migrations) to ensure complete alignment between frontend state and backend APIs without manual guessing.
* **Deployment Validation:** Verified build pass via Hatchable dry-run and deployment engine.

### Version 248 — Architecture Specification & Deploy Sheet (27 Oct 2026)
* **Contributor:** Jatin Shende / Kairos AI Developer
* **Frontend UI Changes:** Exposed public developer documentation route at `/BACKEND_INSTRUCTIONS_AND_CHANGELOG.md` with stranger preview link support.
* **Backend Requirements:** Documented 8 SQL migrations, 18 API handler routes, access level gating rules (`admin`, `public`, `member`), and fallback keyword search mechanisms.

### Version 247 — Lineage Explorer & ESM Handler Stabilization (27 Oct 2026)
* **Contributor:** Gauri / Core Data Engineering Team
* **Frontend UI Changes:** Restored Lineage Explorer graph navigation (`data-view="lineage"`), hop-depth filters, and asset detail drawer mapping.
* **Backend Requirements:** 
  * Refactored `api/v1/requests.js` from CommonJS (`require`) to ES Modules (`import { db } from 'hatchable'`).
  * Audited bi-temporal CTE lock queries (`lock_key`, `ts`, `existing`) in `api/v1/ingest.js` for `kairos_column_lineage` table updates.
  * Standardized `api/v1/search.js` keyword pattern matching over `kairos_assets` table columns.

### Version 246 — Bitemporal Column Lineage & Row-Level Isolation (26 Oct 2026)
* **Contributor:** Gauri & Data Platform Team
* **Frontend UI Changes:** Added column-level lineage overlay toggles in the visual lineage graph and Stewardship tab (`data-view="stewardship"`).
* **Backend Requirements:** Created `migrations/008_kairos_column_lineage.sql` for bi-temporal valid-time (`valid_from`/`valid_to`) and system time (`recorded_from`/`recorded_to`) mapping, and `migrations/007_kairos_rls.sql` for workspace isolation.

---

## 3. Mandatory Deployment Log Entry Template

Every developer (human or agent) MUST use this exact template when adding entries to Section 2 prior to running `deploy`:

```markdown
### Version <Version_Number> — <Brief_Title> (<Date>)
* **Contributor:** <Contributor Name, e.g. Gauri / Jatin Shende>
* **Frontend UI Changes:** <What was added or modified in HTML/JS/CSS, e.g. Added new filter tab in Lineage Explorer>
* **Backend Requirements:**
  * **API Endpoints:** <e.g. GET /api/v1/lineage-filter or updated POST /api/v1/ingest>
  * **Database Schema:** <e.g. Added column to kairos_lineage_edges in migration 009>
  * **Logic & Security:** <e.g. Handled admin access gating and fallback handling>
```

---

## 4. Full-Stack Component & API Registry

### 4.1 Frontend UI Views & Connected Backend Endpoints

| Frontend UI View | Trigger Selector | Visual Component | Required Backend API Endpoint |
| :--- | :--- | :--- | :--- |
| **Home / Overview** | `data-view="overview"` | Dashboard summary cards & stats | `GET /api/v1/catalog` |
| **Catalog & Schemas** | `data-view="assets"`, `data-view="catalog"` | Asset data table & detail drawer | `GET /api/v1/catalog` |
| **Semantic Search** | `data-view="search"` | Keyword / RAG search input & results | `POST /api/v1/search` |
| **Lineage Visual Explorer** | `data-view="lineage"` | D3 2D graph with hop depth & edge inspection | `GET /api/v1/catalog`, `GET /api/v1/column-lineage` |
| **3D Observatory** | `data-view="observatory"` | Three.js WebGL domain cluster canvas | `GET /api/v1/catalog` |
| **Pipeline Operations** | `data-view="runs"`, `data-view="quality"` | Run history table & anomaly logs | `GET /api/v1/catalog`, `POST /api/v1/worker/process` |
| **Stewardship & Requests** | `data-view="stewardship"` | Access requests queue & decision buttons | `GET /api/v1/requests`, `POST /api/v1/request-decision` |
| **Trust & History** | `data-view="evidence"`, `data-view="history"` | Bitemporal evidence timeline | `GET /api/v1/evidence-at-time` |

---

## 5. Automated Pre-Deployment Checklist

Before triggering `deploy`:
1. **Contributor Attribution:** Did you write your name and feature summary in Section 2 using the Section 3 Template?
2. **Frontend UI Sync:** Are all new buttons, views, or modal forms connected to backend API response fields?
3. **Backend Route Sync:** Are backend JS handlers configured with ESM (`import`) and declared `access` levels?
4. **Dry-Run Check:** Run `dry_run_deploy` to verify zero blocking errors.
5. **Publish:** Run `deploy` with `intent` and `summary` matching the log entry.