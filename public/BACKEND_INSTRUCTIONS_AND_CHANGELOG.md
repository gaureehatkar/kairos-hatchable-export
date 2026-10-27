# Kairos Backend Architecture, Deployment Log & Implementation Guide

**Project Name:** Kairos Metadata Lineage Dashboard  
**Hatchable Project ID:** `proj_HTYAd2BCLtMt`  
**Slug:** `kairos-metadata`  
**Live URL:** [https://kairos-metadata.hatchable.site](https://kairos-metadata.hatchable.site)  
**Last Updated:** 27 October 2026 (Version 247)  

---

## 1. Executive Purpose & Sync Protocol

This document serves as the **official canonical backend specification, deployment log, and implementation checklist** for Kairos. Every time backend changes, API routes, database schemas, or ingestion logic are added or modified, this file **must** be updated and deployed alongside the code.

### Core Backend Invariants
1. **Canonical Ground Truth:** PostgreSQL is the single source of truth for catalog assets, lineage edges, column mappings, evidence, access requests, and pipeline runs.
2. **ES Module Compliance:** All backend handlers inside `api/**/*.js` must strictly use standard ES Modules (`import / export`). CommonJS (`require()`, `module.exports`) is strictly forbidden and will throw runtime isolate 500 exceptions in V8.
3. **Declared Access Control:** API routes must explicitly export `access` level (`'public'`, `'member'`, `'admin'`, or `'scheduler'`) and `methods` array.
4. **Resilient Fallbacks:** Search endpoints must support robust keyword matching directly over PostgreSQL JSONB/text fields so backend services operate seamlessly without requiring external AI API keys.
5. **Bi-Temporal Lineage:** Column lineage tracking uses valid-time (`valid_from`/`valid_to`) and system-recorded time (`recorded_from`/`recorded_to`) with atomic CTE lock semantics.

---

## 2. Deployment Log & Recent Fixes (Changelog Sheet)

### Version 247 (Deployed 27 Oct 2026)
* **ESM Handler Refactoring:** Converted `api/v1/requests.js` from legacy CommonJS syntax to ES Modules (`import { db } from 'hatchable'`), resolving `require is not defined` 500 runtime errors on requests fetching access control tables.
* **SQL CTE Linter Clearance:** Audited bi-temporal CTE queries in `api/v1/ingest.js` (`lock_key`, `ts`, `existing` CTEs) to ensure full transactional atomicity and pg_advisory_xact_lock safety without breaking linter guards.
* **Keyword Fallback for Search:** Standardized `api/v1/search.js` to perform case-insensitive keyword pattern matching over `kairos_assets` table columns (`qualified_name`, `description`, `owner_name`, `asset_type`, `schema_name`, `metadata`), removing 412 platform errors when external OpenAI/Anthropic API keys are unconfigured.
* **Access Gating & Health Verification:** Verified that anonymous callers receive standard `401 Unauthorized` on gated routes (`/api/v1/catalog`, `/api/v1/column-lineage`, `/api/v1/requests`) while administrative/authenticated callers receive full JSON payloads. `/api/health` returns `200 OK` with database reachability status.

### Version 246 & Earlier Key Milestones
* **Column Lineage Implementation:** Added `migrations/008_kairos_column_lineage.sql` for granular column-to-column transformations and mapping evidence.
* **Row-Level Security (RLS):** Implemented workspace-level row isolation via `migrations/007_kairos_rls.sql`.
* **Durable Ingestion Jobs & RAG Support:** Added durable background worker execution (`api/v1/worker/process.js`) and pgvector setup (`migrations/006_kairos_pgvector_rag.sql`).

---

## 3. Complete Backend Architecture & Required Modules

Whenever developing or extending the backend, ensure the following components and database schemas are synchronized.

### 3.1 Database Schemas & Migrations

| Migration File | Primary Table(s) | Key Columns & Responsibilities |
| :--- | :--- | :--- |
| `001_kairos_metadata.sql` | `kairos_assets`, `kairos_lineage_edges` | Assets (qualified_name, schema_name, asset_kind, asset_type, owner_name, metadata jsonb). Edges (source_asset_id, target_asset_id, edge_type, evidence_ref, metadata jsonb). |
| `002_kairos_raw_events.sql` | `kairos_raw_events` | Stores raw dbt manifests, OpenLineage JSON payloads, and generic event payloads. |
| `003_kairos_raw_events_immutable.sql` | `kairos_raw_events` | Immutable log constraints and source system deduplication (`source_system`, `source_record_id`). |
| `004_kairos_data_products.sql` | `kairos_data_products` | High-level data product domain grouping, SLO definitions, and ownership boundaries. |
| `005_kairos_durable_jobs.sql` | `kairos_pipeline_runs` | Tracks execution status (`RUNNING`, `SUCCESS`, `FAILED`), duration, asset counts, and event totals. |
| `006_kairos_pgvector_rag.sql` | Vector index tables | Vector embedding storage for semantic search over schema descriptions. |
| `007_kairos_rls.sql` | RLS Policies | Multi-tenant and workspace boundary enforcement. |
| `008_kairos_column_lineage.sql` | `kairos_column_lineage` | Bitemporal column mapping (`mapping_key`, `source_column`, `target_column`, `transformation`, `valid_from`, `valid_to`, `recorded_from`, `recorded_to`). |
| Ingestion Tables | `access_requests`, `kairos_proposals` | Governance approval workflows, requested assets, approval decisions (`PENDING`, `APPROVED`, `REJECTED`). |

---

### 3.2 API Endpoint Registry & Contracts

#### 1. System Health & Infrastructure
* **`GET /api/health`**
  * **Access:** `public`
  * **Returns:** `{ ok: true, service: 'kairos-metadata-dashboard', database: 'reachable', server_time: ISO_String, mode: 'prototype' }`

#### 2. Catalog & Lineage Exploration
* **`GET /api/v1/catalog`**
  * **Access:** `admin`
  * **Returns:** List of assets (`kairos_assets`), edges (`kairos_lineage_edges`), quality checks, pipeline runs, and total schema counts.
* **`GET /api/v1/column-lineage`**
  * **Access:** `admin`
  * **Query Params:** `valid_as_of`, `recorded_as_of`
  * **Returns:** Bitemporal column mapping array with valid-time snapshot semantics.

#### 3. Ingestion Pipeline
* **`POST /api/v1/ingest`**
  * **Access:** `admin`
  * **Payload Kinds:** `generic_metadata`, `dbt_manifest`, `openlineage_event`
  * **Returns:** `{ ok: true, assets_upserted: N, relationships_upserted: N, column_mappings_upserted: N, disclosure: "..." }`

#### 4. Semantic & Keyword Search
* **`POST /api/v1/search`**
  * **Access:** `admin`
  * **Payload:** `{ question: "search query term" }`
  * **Returns:** `{ ok: true, mode: "persisted_keyword_search", answer: "...", sources: [...] }`

#### 5. Governance & Access Requests
* **`GET /api/v1/requests`**
  * **Access:** `admin`
  * **Returns:** Access request queue from `access_requests` table.
* **`POST /api/v1/request-submit`**
  * **Access:** `admin`
  * **Payload:** `{ asset_id, requester, reason }`
* **`POST /api/v1/request-decision`**
  * **Access:** `admin`
  * **Payload:** `{ request_id, decision: 'APPROVED' | 'REJECTED', decided_by }`

#### 6. Data Product Stewardship
* **`GET /api/v1/proposals`** & **`POST /api/v1/proposal-decision`**
  * **Access:** `admin`
  * **Purpose:** Submit, list, and decide schema/metadata change proposals.

#### 7. Background Worker Processes
* **`POST /api/v1/worker/process`**
  * **Type:** Scheduled Cron Job
  * **Purpose:** Processes queue items from `kairos_raw_events` and synthesizes aggregated lineage edges.

---

## 4. Backend Synchronization Checklist for New Features

Whenever modifying existing features or building new backend services, execute this step-by-step checklist:

1. **Schema Check:** If introducing a new table or altering a column, create a new sequential SQL migration file under `migrations/` (e.g., `009_new_feature.sql`).
2. **ES Module Imports:** Ensure all handlers use `import { db } from 'hatchable'` instead of `require()`.
3. **Route Security:** Declare `export const access = 'admin';` (or `'public'/'member'`) and `export const methods = ['GET', 'POST']`.
4. **Error Handling & JSON Response:** Always wrap database operations in `try/catch` blocks and return consistent `{ ok: false, error: "code", message: "..." }` JSON responses on failure.
5. **Dry Run Validation:** Run platform dry-run deploy tools (`dry_run_deploy`) to check for SQL syntax or broken promise warnings.
6. **Deploy & Update Changelog:** Call `deploy` with clear intent and summary, then document the new changes in Section 2 of this file.

---

*This document is maintained as part of the live repository at `public/BACKEND_INSTRUCTIONS_AND_CHANGELOG.md`.*