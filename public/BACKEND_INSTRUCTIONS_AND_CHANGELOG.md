# Kairos Full-Stack Architecture, Contributor Change Log & System Guide

**Project Name:** Kairos Metadata Lineage Dashboard  
**Hatchable Project ID:** `proj_HTYAd2BCLtMt`  
**Slug:** `kairos-metadata`  
**Live URL:** [https://kairos-metadata.hatchable.site](https://kairos-metadata.hatchable.site)  
**Last Updated:** 28 October 2026 (Version 302)  

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

### Version 296 — Consolidated Research Baseline, API Verification & Remaining Work (27 Oct 2026)
* **Contributor:** Kairos AI Developer, requested by Jatin Shende.
* **Intent:** Consolidate external competitor-research principles, repository/API audit findings, security risks, feature statuses, test requirements, and remaining implementation backlog in this canonical Hatchable document. This is a baseline; it does not claim outstanding fixes have been implemented.
* **Scope / evidence boundary:** Inspected the Hatchable project registry, this canonical document, relevant frontend/backend files, and selected database migrations. Executed read-only API checks for catalog, metadata preview, competitor research, raw events, column lineage, evidence-at-time, search, and selected anonymous access paths. No application code, schema, or database records were changed during the audit. This is not a complete browser automation, penetration test, connector integration test, or exhaustive database audit.
* **Version note:** Hatchable reported version 295 at the time of inspection. This document is saved as a draft until deployed; verify the actual version in Hatchable after publishing. A changelog heading is not proof of successful deployment.

#### 296.1 External research baseline and design implications
These research principles are design guidance, not proof of Kairos feature parity:
* **DataHub metadata model:** Stable entity identity, independently modeled metadata aspects, and first-class relationships. Distinguish versioned descriptive metadata from time-series observations. Kairos implication: separate canonical asset identity, extensible metadata, relationships, and historical observations.
* **DataHub ingestion/search architecture:** Ingestion, primary-key lookup, structured search, and relationship traversal are distinct concerns. Keyword search or RAG must not replace canonical catalog queries and graph traversal.
* **OpenMetadata asset tabs:** Asset-detail capabilities differ by resource type and available data. Use a shared profile shell with type-specific sections, and only show tabs when the capability and supporting data are available.
* **OpenMetadata lineage:** Table lineage, column lineage, manual relationships, depth-limited traversal, and previews are distinct. Declared mappings must not be presented as proof of runtime execution.
* **OpenLineage events/facets:** Events can carry run, job, input/output, event time, producer, and extensible facets. Preserve source events as evidence artifacts; do not blindly convert every event into a confirmed edge. Kairos-specific facets, if introduced, should use a documented `kairos_` namespace and versioned schema URLs.
* **Official references recorded in the research notes:** [DataHub metadata model](https://docs.datahub.com/docs/metadata-modeling/metadata-model), [DataHub ingestion architecture](https://docs.datahub.com/docs/architecture/metadata-ingestion), [OpenMetadata asset tabs](https://docs.open-metadata.org/v1.12.x/how-to-guides/guide-for-data-users/data-asset-tabs), [OpenLineage facets](https://openlineage.io/docs/spec/facets/), [Open Data Hub documentation](https://docs.opendatahub.com/), and [OpenMeter documentation](https://openmeter.io/docs/get-started/overview). Open Data Hub and OpenMeter are adjacent ecosystem/product patterns, not proof of direct universal-catalog parity.
* **Research boundary:** These are research-derived principles. Revalidate official documentation versions when implementing integrations; this summary is not an exhaustive independent live web audit.

#### 296.2 Latest read-only verification
* **Persisted catalog:** `GET /api/v1/catalog` returned HTTP 200 for admin and identified PostgreSQL as its source. The response contains 4 assets and 2 table-level lineage edges. The prior audit also recorded 2 raw events, 0 evidence rows, 0 pipeline runs, 0 quality checks, and 0 column-lineage mappings. Persisted rows do not prove an active external connector or independently observed runtime lineage.
* **Anonymous catalog access:** The latest anonymous catalog request returned HTTP 401. The prior audit recorded a member caller receiving HTTP 403. These results cover only the tested route and access tiers.
* **Metadata preview:** `POST /api/v1/metadata-preview` returned HTTP 200 for synthetic image/document metadata. It classified one image and one document, preserved safe unknown metadata, and returned `is_persistent:false`. Warnings state preview is not persisted, relationships are passed through rather than inferred, and source freshness is not verified. Anonymous POST returned HTTP 401.
* **Competitor research:** `GET /api/v1/competitor-research` returned HTTP 200 for admin and HTTP 401 for anonymous. Source inspection shows prepared/curated guidance, not live web research. Frontend integration remains unverified.
* **Raw-event retrieval:** `GET /api/v1/raw-events` returned HTTP 200 for admin and HTTP 401 for anonymous. Source events are retrievable, but the small record count does not prove complete connector provenance.
* **Column lineage:** `GET /api/v1/column-lineage` returned HTTP 200 with zero included and zero undated mappings in the tested snapshot. This is an honest empty result, not proof of a populated lineage experience.
* **Evidence/time travel:** `GET /api/v1/evidence-at-time` returned HTTP 200 for valid and recorded timestamps, with zero included, zero undated, and zero total evidence. Temporal logic exists in source, but populated-history correctness remains unverified.
* **Search:** `POST /api/v1/search` for `customer orders` returned two persisted keyword matches. The endpoint is PostgreSQL keyword search, not verified vector/semantic search or grounded RAG.
* **Anonymous route checks:** `GET /api/v1/incidents` and `GET /api/v1/data-products` returned HTTP 200 anonymously. Their source declares public access and includes mutation paths. Anonymous mutations were not invoked; no exploit or successful unauthorized write is claimed. These route declarations require an explicit permission decision and controlled tests.
* **No mutation tests:** No write-path test, duplicate import, incident/product mutation, or database mutation was performed during this consolidated baseline.

#### 296.3 Current feature-status matrix
Use `VERIFIED` for directly checked behavior; `PARTIALLY_VERIFIED` for a narrow component/path; `MOCK_ONLY` for simulated/curated behavior; `EMPTY_BUT_WORKING` for a working query against an empty store; `UNVERIFIED` when end-to-end evidence is missing; and `GAP_CONFIRMED` for a limitation confirmed in source/schema.
* Hatchable registry/version: `VERIFIED` at version 295 at audit time; deployment of this documentation update must be separately confirmed.
* PostgreSQL-backed catalog reads: `VERIFIED` for the tested authorized endpoint.
* Canonical identity across imports/namespaces: `UNVERIFIED`; batch validation exists, but cross-import behavior needs tests.
* Generic JSON preview: `VERIFIED` for tested normalization and explicit non-persistence; actual file bytes and live discovery were not tested.
* Persistent ingestion/idempotency: `PARTIALLY_VERIFIED`; handlers/upsert logic exist, but duplicate non-empty imports have not been executed and compared.
* dbt/OpenLineage ingestion: `PARTIALLY_VERIFIED` at source/route level; authenticated upstream integration and event-to-graph correctness are unproven.
* Table lineage: `PARTIALLY_VERIFIED`; two persisted edges exist, but provenance/completeness are unverified.
* Column lineage: `EMPTY_BUT_WORKING` in the tested snapshot.
* Evidence states and temporal history: `EMPTY_BUT_WORKING` for the empty evidence store; populated-history correctness remains `UNVERIFIED`.
* Quality metrics: `MOCK_ONLY` for `api/jobs/simulate-quality.js`, which uses `Math.random()` and does not persist measured historical results.
* Competitor research: `MOCK_ONLY` for live research; the endpoint serves prepared guidance.
* Search: `VERIFIED` for persisted keyword matching; semantic search/RAG, embeddings, citation grounding, and permission-filtered retrieval are `UNVERIFIED`.
* Incidents/data products: anonymous GET is `VERIFIED`; authorization correctness for mutations is a `GAP_CONFIRMED` concern requiring controlled tests.
* Tenant isolation: `GAP_CONFIRMED` in inspected RLS migration policies; tenant-specific isolation is not implemented/verified by policies using `USING (true)`.
* Demo-mode separation: explicit demo fixtures and a persisted mode exist in frontend source. Complete browser-level behavior across screens remains `UNVERIFIED`; recheck error handling after frontend changes.
* Asset profiles, 2D lineage, 3D Observatory, PII propagation, incidents correlated to real runs, and all UI controls: `UNVERIFIED` end to end until rendered values are traced and exercised.

#### 296.4 Canonical source-to-UI audit contract
For each major displayed value/action, trace:
```
User action
  -> frontend component and event handler
  -> frontend state
  -> HTTP request and parameters
  -> backend route and declared access
  -> authentication and authorization
  -> validation and normalization
  -> canonical identity resolution
  -> database / connector / parser / external API
  -> computation and persistence (or explicitly transient preview)
  -> response serialization
  -> frontend response/error handling
  -> rendered result and visible provenance
```
A route existing in source, an HTTP 200, a fixture record, or a populated database row alone is not enough to mark a complete feature end-to-end verified.

#### 296.5 Proposed generalized resource contract — design reference only
Do not replace the current schema without compatibility and migration review. The target contract should include:
* Stable internal ID and canonical `urn` based on resource type, namespace, and source-native ID; display name is not identity.
* Extensible `resource_type` values such as table, column, file, document, image, dataset, pipeline, job, model, feature, dashboard, and data product.
* Separate namespace and environment fields.
* Source type/system/native ID and optional connection ID.
* Normalized metadata/schema plus `custom_metadata` preserving unfamiliar safe fields.
* Backend-derived capabilities distinguishing what a resource type supports from what is available for a particular record now, with reasons for unavailable capabilities.
* Provenance including source-updated time, ingestion time/run ID, and evidence state when known.
* Relationships with separate identity, endpoint validation, source/provenance, evidence, and validity intervals.
* Structured validation status and errors.
* Same display name in different namespaces remains distinct. Missing evidence means `UNKNOWN`, not proof of no relationship. Historical observations remain queryable; current state is a projection.
* Capabilities cannot be inferred merely from a frontend tab or the existence of a database table.

#### 296.6 Security and integrity backlog
**P0 — before public/sensitive or multi-tenant use**
1. Review `api/v1/data-products.js`, `api/v1/incidents.js`, and `api/v1/webhook.js`. Decide intended roles, restrict mutations as required, and test anonymous/member/admin behavior in an isolated environment. Do not use anonymous production mutations as an audit shortcut.
2. Define tenant/workspace identity and replace tenant-agnostic RLS policies where isolation is required. Enforce scope in database policies and privileged API queries. Test cross-tenant reads/writes through catalog, lineage, incidents, products, search, embeddings, and derived endpoints.
3. For every live-request failure, show an explicit error; never silently substitute demo fixtures unless demo mode was explicitly selected and visibly labeled.
4. Every displayed edge must trace to an explicit persisted/source-supplied relationship or supported analyzer output with provenance. Missing evidence remains `UNKNOWN`.
5. Remove random quality/freshness metrics from production views or visibly isolate them as simulation. Real metrics require named inputs, calculation, run timestamp, and stored result.
6. Ensure keyword/vector/graph retrieval follows the same authorization and tenant restrictions as direct asset reads.
7. Audit frontend bundles, API responses, logs, previews, stored metadata, and error messages for secret leakage. Existing key-name filtering is defensive, not comprehensive.
8. Validate relationship endpoints against persisted or explicitly staged assets. Reject or quarantine unresolved endpoints with a reason.
9. Repeat the same non-empty import in an isolated namespace; verify no duplicate assets, edges, evidence, or raw events and stable identity across retries/partial failures.

**P1 — correctness and provenance**
1. Define/version canonical URNs and source-native identity; prove identical names in different namespaces remain distinct.
2. Preserve unfamiliar safe fields through preview -> ingestion -> database -> API -> UI.
3. Test malformed payloads, coercion, size limits, duplicate IDs, and visible errors.
4. Validate `OBSERVED`, `POSSIBLE`, `REFUTED_FOR_RUN`, and `UNKNOWN` against documented evidence requirements. Refutation must be run-scoped and supported by complete negative-evaluation coverage.
5. Test valid-time/recorded-time boundaries, undated records, corrections, and historical snapshots using populated test records.
6. Keep catalog, detail, lineage, search, and profile IDs consistent.
7. Define capability contracts and prevent unsupported tabs from appearing functional.
8. Expose provenance and freshness limitations for metrics and relationships.

**P2 — generalization and integrations**
1. Build a shared profile shell and type-specific renderers for tables, files, documents, images, pipelines/jobs, models/features, dashboards, and data products.
2. Add a backend capability registry distinguishing type support from per-record availability.
3. Implement actual connectors incrementally for agreed sources; separate configured, authenticated, reachable, discovered, normalized, persisted, and tested states.
4. Prioritize dbt/OpenLineage if they remain in project scope. Do not imply arbitrary authenticated connectors or scheduled scans already exist.
5. Add deterministic acceptance datasets for SQL catalogs, file/image inventories, workflow/run metadata, and ML/model metadata.
6. Test pagination, rate limits, retries, timeouts, source freshness, incremental updates, schema drift, and secret handling.

**P3 — advanced capabilities**
1. Hybrid keyword + vector + graph retrieval with permission filtering.
2. Grounded answers where claims are tied to retrieved evidence/citations and unsupported claims are withheld.
3. Queryable dataset -> feature -> model-version -> prediction lineage.
4. OpenLineage ingestion that upgrades edge evidence only when event semantics and identity resolution justify it.
5. A connector SDK/adapter contract with conformance tests and versioned source facets.

#### 296.7 Required acceptance-test suite
Run these in an isolated/test namespace or database, not against production records without approval:
1. **Catalog truth:** API totals agree with authorized database counts; refresh retains persisted records.
2. **Import idempotency:** Import the same non-empty graph twice; counts and identities remain stable.
3. **Namespace collision:** Same display name in different namespaces remains distinct.
4. **Unknown metadata:** Safe custom fields survive preview, ingestion, database retrieval, and UI rendering.
5. **Credential filtering:** Token/password/private-key-like fields are excluded from previews/logs/responses; test nested fields and alternate casing.
6. **Relationship validation:** Missing endpoints and malformed column mappings are rejected or quarantined with explicit reasons.
7. **Provenance:** Each edge/evidence item identifies source, ingestion/run ID where applicable, timestamps, and state semantics.
8. **Evidence states:** Empty evidence yields `UNKNOWN`; `OBSERVED` requires support; `REFUTED_FOR_RUN` requires run ID, coverage, and complete negative-evaluation metadata.
9. **Temporal history:** Queries before/during/after validity and recorded intervals return expected immutable observations.
10. **Failure integrity:** Simulate timeout/401/500; verify explicit error, no silent fixture substitution, and no false success.
11. **Permissions:** Test public/member/admin and cross-tenant access for every read/write route, including search and derived stores.
12. **Resource profiles:** Only real capabilities render; empty sections explain why data is unavailable.
13. **Search/RAG:** Keyword results are labeled correctly; enable RAG only after retrieval, citation, and authorization tests pass.
14. **Quality:** Every score traces to deterministic assertion input and persisted run; simulations remain labeled.
15. **Browser smoke test:** Verify navigation, filters, search, asset detail, 2D/3D lineage, preview/import, temporal controls, incidents, products, empty/error states against actual APIs.

#### 296.8 Implementation and release procedure
1. Finish source-to-UI mapping and the complete feature matrix before broad refactoring.
2. Address P0 security and demo-integrity findings first using controlled data and an explicit permission model.
3. Add deterministic tests before changing ingestion identity/schema.
4. Propose migrations and rollback strategy separately; do not replace existing contracts wholesale without review.
5. Implement small, reviewable increments and update this document after meaningful changes.
6. Run Hatchable dry-run validation before deployment and inspect warnings as well as errors.
7. Deploy only when intended to go live and validation is acceptable; verify deployed version and smoke-test changed paths afterward.
8. Every changelog entry must distinguish changes made, tests run, and remaining unverified behavior.

#### 296.9 Remaining deliverables
* **A — Executive audit:** consolidated baseline recorded here.
* **B — Complete feature matrix:** each feature with status, source paths, endpoint, backing table/source, test evidence, and missing link.
* **C — Source-to-UI traces:** catalog, profiles, ingestion, table/column lineage, evidence/time travel, quality, incidents, products, search/RAG, PII, and Observatory.
* **D — Controlled test results:** idempotency, identity, metadata preservation, temporal correctness, authorization, and error/fallback tests.
* **E — P0 remediation plan:** approved permission model, tenant isolation design, no-silent-fallback proof, and real-metric policy.
* **F — Generalization design:** versioned asset/relationship contract, capability registry, type-specific profiles, and connector boundary.
* **G — Release readiness:** browser smoke-test evidence, actual deployment version, known limitations, rollback plan, and updated changelog.
* **Explicit non-claims:** Until the corresponding tests pass, do not claim universal connector support, full semantic/RAG search, real-time quality metrics, verified end-to-end lineage, tenant isolation, or complete browser verification.

### Version 295 — Live Repository Verification & Demo-Readiness Audit (27 Oct 2026)
* **Contributor:** Kairos AI Developer, requested by Jatin Shende
* **Intent:** Continue the research-led audit by inspecting the actual Hatchable project, tracing key UI/backend/data paths, and testing deployed APIs rather than inferring functionality from UI descriptions.
* **Scope and evidence boundary:** Inspected the current Hatchable project at version 294, its file inventory, canonical changelog, main frontend, ingestion frontend, catalog and ingestion routes, search, raw-event, column-lineage, evidence, incident, data-product, and quality-job handlers, plus core metadata and RLS migrations. Executed deployed API smoke tests with owner/admin and anonymous/member access tiers. This was a code/API audit, not a full browser automation, database mutation/idempotency run, or third-party connector test.
* **Live catalog observation:** `GET /api/v1/catalog` returned HTTP 200 for an authorized admin and reported PostgreSQL as the source, with 4 persisted assets, 2 persisted lineage edges, 0 evidence rows, 0 pipeline runs, 0 quality checks, and 2 raw source events. The returned records include generic SDK-import assets and a dbt-labelled test asset. These are real persisted database rows, but their presence does not prove an actively connected production source or independently verified execution lineage.
* **Access-gate tests:** The catalog endpoint returned HTTP 401 for an anonymous/public caller and HTTP 403 for a member caller, matching its declared admin access. The keyword-search endpoint also returned HTTP 401 for a public caller. This verifies those route gates, not every route in the application.
* **Generic metadata preview:** `POST /api/v1/metadata-preview` returned HTTP 200 for a synthetic image/document JSON payload. It preserved width, height, MIME type, page count, and an unknown safe field; filtered a `secret_token` field; passed through the explicitly supplied relationship; and declared `is_persistent:false`. This verifies JSON normalization and defensive key-name filtering, not access to the actual image/document bytes, live source discovery, or persistence.
* **Competitor research endpoint:** `GET /api/v1/competitor-research` returned HTTP 200. Source inspection shows the response is a curated static array of research findings and a roadmap. The existing changelog states that no frontend screen was wired to this endpoint in v293. This is a served research summary, not a live research crawler or proof of competitor feature parity.
* **Ingestion path:** `POST /api/v1/ingest` accepted an empty valid `metadata_graph` and returned HTTP 200 with zero assets and relationships upserted. This is a no-op validation smoke test only; it did not mutate catalog contents. Source inspection shows separate handlers for generic metadata graphs, dbt manifests, and OpenLineage events. The code uses PostgreSQL upserts and stable fingerprints in relevant paths, but duplicate-import idempotency has not been dynamically verified by submitting the same non-empty import twice.
* **Persisted evidence and column lineage:** The deployed evidence-at-time endpoint returned HTTP 200 with zero current/historical evidence and zero undated evidence. The column-lineage endpoint returned HTTP 200 with zero included mappings and zero undated mappings for the tested snapshot. The app can query these stores, but this snapshot does not demonstrate a populated evidence or column-lineage experience.
* **Search reality:** `POST /api/v1/search` returned HTTP 200 and found two persisted assets for “customer orders”. Source inspection confirms it is PostgreSQL keyword matching across names, descriptions, owners, types, schema names, and serialized metadata; the response explicitly states that this is not semantic/RAG retrieval. Do not describe this endpoint as verified semantic search or grounded RAG.
* **Explicit mock/simulation finding:** `api/jobs/simulate-quality.js` generates anomaly counts and freshness scores using `Math.random()`, does not query real quality inputs, and has its historical insert commented out. Any result from this job is simulated and must not be presented as a measured production quality result. The frontend also contains a dedicated `DEMO` snapshot of synthetic assets, edges, evidence, runs, and quality records. The UI labels demo mode as synthetic; persisted mode fetches the catalog and column-lineage APIs, and its error handler clears persisted arrays instead of silently substituting the demo arrays.
* **Access-control follow-up (high priority before public exposure):** Source inspection shows `api/v1/data-products.js` declares `access = "public"` for both GET and POST and permits anonymous product creation; `api/v1/incidents.js` also declares public access for GET and POST, including create/resolve actions. The public GET smoke test for data products returned one persisted product. No mutating anonymous POST was executed. Review and tighten access according to intended product permissions before making the app public or using it with sensitive data.
* **Tenant isolation follow-up:** Migration `007_kairos_rls.sql` enables RLS on selected tables, but its policies use `USING (true)` and comments describe tenant filtering as a future/illustrative claim. These policies do not currently implement tenant-specific isolation. Treat multi-tenant isolation as unverified/not implemented until real tenant identity and restrictive policies are implemented and tested.
* **Current classifications supported by evidence:**
  * **Verified at API/code level:** Authorized PostgreSQL catalog read; catalog route access gate; generic JSON preview normalization; curated competitor-research endpoint response; keyword search over persisted metadata; raw-event retrieval; evidence and column-lineage query routes returning honest empty snapshots; explicitly labelled demo/persisted mode paths in frontend source.
  * **Persisted but not proven live-connected:** Four catalog assets, two lineage edges, two raw source events, and one data product were returned from PostgreSQL. Provenance indicates imported/SDK or dbt/OpenLineage-labelled records, not a currently authenticated external connector.
  * **Demo/simulated:** The frontend's dedicated `DEMO` data arrays and the random quality-simulation job. Demo fixtures are visibly labelled in the relevant UI paths.
  * **Empty/unproven in the tested database snapshot:** Evidence, pipeline runs, quality checks, and column-lineage mappings.
  * **Not yet verified:** Full browser navigation and every control, duplicate non-empty import idempotency, complete persistence/refresh walkthrough, actual third-party source authentication/discovery, semantic/RAG retrieval and citation grounding, end-to-end lineage correctness, tenant isolation, and anonymous write protection across all routes.
* **P0/P1 follow-up recommendations:** (1) Restrict public data-product and incident mutations to the intended authorized roles; (2) replace or clearly isolate random quality simulation from any production-quality dashboard; (3) implement and test tenant-specific isolation before multi-tenant/sensitive use; (4) execute duplicate-import tests using a disposable namespace or isolated test database; (5) run browser-level demo checks against the persisted mode and verify every displayed count/edge against API data; (6) label keyword search accurately and only claim RAG after a retrieval-and-grounding test.
* **Database/deployment impact:** No application code or schema was changed as part of this audit entry. This entry records observed behavior and follow-up work; it does not claim that the recommended fixes have been implemented.
* **AI feature rationale:** The audit distinguishes actual PostgreSQL-backed catalog behavior from fixture-only presentation, generic preview from persisted ingestion, keyword matching from semantic RAG, and stored lineage declarations from run-specific execution proof. This is necessary to make a live demonstration defensible and to prevent mock values from being presented as measured facts.

### Version 293 — Universal Metadata Preview API & Competitor Research Synchronization (27 Oct 2026)
* **Contributor:** Kairos AI Developer, requested by Jatin Shende
* **User request / intent:** Make the project reflect the fact that metadata can vary by user and source, and record how comparable metadata/lineage platforms handle extensible metadata and asset-specific capabilities. This work is in the Hatchable project, not the GitHub repository.
* **Backend API additions:**
  * Added `api/v1/metadata-preview.js`, exposed as `POST /api/v1/metadata-preview`. The handler accepts JSON object/array payloads and common nested record collections, normalizes records into generic preview assets, preserves unfamiliar safe fields, reports discovered fields and capability hints, handles duplicate identifiers, and limits each preview to 1,000 records.
  * The preview infers only a broad record type when the source supplies a recognized type or MIME type; otherwise it uses the generic `json_record` label. It passes through an explicit top-level `relationships` array only. It does not invent lineage, persist preview records, or verify source freshness.
  * Obvious credential-like keys (for example keys containing token, secret, password, credential, private key, or API key) are filtered recursively from preview metadata. This is a defensive key-name filter, not a complete secrets or sensitive-data protection system.
  * Added `api/v1/competitor-research.js`, exposed as `GET /api/v1/competitor-research`, to serve the competitor findings, design principles, implementation boundaries, and next-step roadmap as JSON for the hosted project.
* **Frontend UI modifications:** No UI screen was changed in this version. These additions expose backend endpoints and document the research; connecting the research response to a new frontend screen remains a separate UI task.
* **Competitor research and architecture rationale:**
  * **DataHub:** its entity/aspect model and ingestion architecture support separating stable identity from extensible source-specific metadata. Kairos implication: preserve safe unknown fields and add source adapters incrementally.
  * **OpenMetadata:** asset details/tabs vary by asset type and available information. Kairos implication: use a shared asset inspector but show schema, lineage, quality, run, and governance features only when relevant data/capabilities exist.
  * **OpenLineage / Marquez:** standard job/run/dataset concepts and extensible facets support richer event metadata. Kairos implication: keep provenance and execution evidence explicit; absence of an event is not negative proof.
  * **Open Data Hub:** dataset discovery and data-access APIs illustrate separating discovery/catalog metadata from access paths and UI rendering.
  * **OpenMeter:** focuses on usage metering and billing, so it is an adjacent product pattern rather than a direct universal metadata-catalog competitor.
  * Official references: [DataHub metadata model](https://docs.datahub.com/docs/metadata-modeling/metadata-model), [DataHub ingestion architecture](https://docs.datahub.com/docs/architecture/metadata-ingestion), [OpenMetadata asset tabs](https://docs.open-metadata.org/v1.12.x/how-to-guides/guide-for-data-users/data-asset-tabs), [OpenLineage facets](https://openlineage.io/docs/spec/facets/), [Open Data Hub documentation](https://docs.opendatahub.com/), and [OpenMeter documentation](https://openmeter.io/docs/get-started/overview).
* **Implementation boundaries (must remain explicit in demos):**
  * The generic JSON preview and existing generic metadata-graph import are not equivalent to authenticated live connectors for every possible external system.
  * Arbitrary authenticated connectors, automatic discovery, scheduled scans, source-specific adapters, universal SQL parsing, and universal lineage inference are not delivered by this change.
  * Preview output is not persisted. To persist data, a caller must use the existing ingestion workflow with a validated metadata graph. Relationships should only be included when actually supplied or established by a supported analyzer.
  * Do not populate a connected user's catalog with synthetic records. Empty states must remain honest, and capability-specific tabs should not imply unsupported features.
* **Verification performed:** The deployed `POST /api/v1/metadata-preview` endpoint returned HTTP 200 for a synthetic two-record image metadata payload, preserved width/height/path/MIME fields, classified both records as images, reported zero relationships, and omitted an `api_token` field from the response. The deployed `GET /api/v1/competitor-research` endpoint returned HTTP 200 and returned the competitor findings and implementation roadmap. These are endpoint smoke tests, not full browser/UI tests or proof of real third-party connector interoperability.
* **Database / migration requirements:** No database schema change or migration was added for the preview endpoints. Preview records are transient and are not written to PostgreSQL.
* **Follow-up backlog:** (1) define and version the common asset/relationship contract; (2) introduce a connector capability registry; (3) implement and test selected real adapters incrementally (prioritize sources required by the project scope, such as dbt/OpenLineage); (4) add acceptance fixtures for structurally different source types such as files/images, workflow runs, and SQL catalogs; (5) validate auth, provenance, pagination, rate limits, source freshness, retries, secret handling, and empty states; (6) connect the competitor-research endpoint to a suitable UI section if the team wants it surfaced in-app.
* **AI feature rationale:** A source-neutral metadata preview makes the project demonstrably less tied to a financial or database-only sample shape while keeping the distinction between metadata normalization and actual connectivity honest. Competitor patterns inform the design, but they do not imply that Kairos already has feature parity with those products.

### Version 281 — Dedicated All Assets UI & Responsive Styling (27 Oct 2026)
* **Contributor:** Kairos AI Developer, requested by the project team
* **Frontend UI Changes:** Added a dedicated `public/assets.css` stylesheet and a prominent All Assets inventory overview showing total assets, filtered result count, ownership coverage, data mode, and asset-kind counts. Loaded the stylesheet from `public/index.html`, added the overview to demo and persisted catalog views, and bumped the app cache version to 280.
* **Backend API & DB Requirements:** No schema changes. Demo mode continues to use the synthetic sample list in `public/app.js`; PostgreSQL mode continues to use the persisted catalog response. The UI labels the selected mode so sample data is not confused with persisted records.
* **AI Feature Rationale:** Makes the catalog destination visually distinct and discoverable instead of relying only on a generic table layout; responsive CSS supports desktop and mobile layouts.

### Version 281 — Synchronize Column Transformation Drawer with Graph Selection (27 Oct 2026)
* **Contributor:** Kairos AI Developer, requested by Gauri
* **Frontend UI Changes:** Opening a transformation from the column dependency table or SVG label selects its source asset, pins the source column, and switches the Lineage Explorer to its existing column-graph mode. The drawer also provides explicit actions to focus either the source or target asset/column in the graph.
* **Backend API & DB Requirements:** None. This reuses `S.selected`, `S.colPin`, the existing column graph renderer, and current catalog mappings in `public/app.js`; no schema, API, or migration changes were made.
* **Verification Status:** Source-level implementation and deploy validation only. Manually verify table-row and SVG-label entry points, source/target focus actions, and the existing Analyze in SQL View flow in an authorized browser session before treating the UX as fully browser-verified.
* **AI Feature Rationale:** Keeps the transformation inspector, selected asset panel, and column graph synchronized so users can inspect a mapping without losing its context. The UI continues to present mappings as declared dependencies, not proof of runtime execution.

### Version 279 — Reset All Filters When Opening Demo Assets (27 Oct 2026)
* **Contributor:** Kairos AI Developer, requested by the project team
* **Frontend UI Changes:** The All assets navigation action now clears search, asset type, domain/schema, owner, tag, trust, metadata completeness and missing-field filters before opening the asset catalog. This restores the full demo sample list instead of silently retaining a restrictive filter from a previous visit.
* **Backend API & DB Requirements:** None; this is a client-side demo/catalog navigation fix. The All assets screen already exists in `public/app.js` as `assetsPage()` and the demo seed currently contains 12 sample assets.
* **AI Feature Rationale:** Makes the All assets destination reliably show all available records when reopened from the demo workspace.

### Version 278 — Stop Aggressive Catalog Polling (27 Oct 2026)
* **Contributor:** Kairos AI Developer, requested by the project team
* **Frontend UI Changes:** Removed the 3.5-second timer's repeated PostgreSQL catalog and column-lineage reload. The timer now only pulses the demo-mode live indicator; persisted data refresh remains event-driven and throttled on focus/visibility changes.
* **Backend API & DB Requirements:** No schema change. The previous polling loop called `/api/v1/catalog` and `/api/v1/column-lineage` repeatedly; these endpoints fan out into multiple database queries, causing Hatchable's per-project query rate limit to be exceeded and pages to fail with HTTP 500 / health HTTP 503.
* **AI Feature Rationale:** Prevents request storms, reduces unnecessary database load, and stops the app from repeatedly wiping/re-rendering persisted views when refresh calls fail.

### Version 277 — Full Workspace Label Greeting (27 Oct 2026)
* **Contributor:** Kairos AI Developer, requested by the project team
* **Frontend UI Changes:** The Home greeting reads and displays the entire saved workspace label rather than truncating it to the first word. Saving preferences synchronizes the sidebar label and icon with that same saved value. The Settings field is repopulated from browser storage whenever Settings renders, so it no longer visually resets to the default after saving.
* **AI Feature Rationale:** Ensures the name a user saves is reflected consistently in the workspace navigation and Home greeting instead of reading unrelated settings.
* **Backend Requirements:** None. The workspace label remains browser-local in `localStorage`; it is not account-level or cross-device persistence.

### Version 273 — Dedicated All Assets Navigation Action (27 Oct 2026)
* **Contributor:** Kairos AI Developer, requested by the project team
* **Frontend UI Changes:** Changed the All assets submenu item to use a dedicated click action that resets asset filters and explicitly calls the asset-list renderer; bumped the frontend script cache key and visible build marker.
* **AI Feature Rationale:** Prevents the All assets menu item from being handled by generic catalog navigation and makes the asset-list destination explicit.
* **Backend Requirements:** None. Frontend navigation only; no API, database, or schema changes.

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
| **Pranav Home/Catalog Acceptance Audit & Competitor Evidence** | Kairos AI Developer / requested by Pranav | Home, Catalog, `public/PRANAV_HOME_CATALOG_COMPLETION.md` | **Problem:** Previous completion notes did not provide enough source-backed page-by-page comparison or distinguish API verification from browser acceptance. **Rationale:** Added official vendor documentation links, explicit comparison criteria, real persisted API counts, ownership boundaries, and a checklist that does not overstate unverified behavior. App-shell cache keys and build marker were aligned to v301. No backend schema/API changes were required. |
| **Transformation-to-Graph Context Synchronization** | Kairos AI Developer / requested by Gauri | Lineage Explorer column graph and transformation drawer (`public/app.js`) | **Problem:** Opening a transformation did not carry its source asset/column context into the graph selection. **Rationale:** Reuses existing selected-asset and column-pin state, highlights the path in column-graph mode, and offers source/target focus actions without backend changes. |

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

### Version 299 — Pranav Home & Catalog Audit and Cache Refresh (28 October 2026)
* **Contributor:** Kairos AI Developer, requested by Pranav.
* **Frontend changes:** Updated `public/index.html` cache-busting references for `styles.neo.css`, `layout.css`, and `app.js` to the current release key and aligned the visible build marker to v298, so browsers request current Home/Catalog logic and styles. Added `public/PRANAV_HOME_CATALOG_COMPLETION.md` with a comparison of the main 3D app against the older black reference, competitor-documentation baseline, file-ownership boundaries, prioritized actions, and acceptance checklist.
* **Scope guard:** No edits to shared `public/app.js`, CSS source files, APIs, database schema, migrations, or Observatory. Existing UI and behavior were preserved.
* **Verification:** Dry run passed with zero blocking errors and three existing `api/v1/ingest.js` CTE-alias lint warnings. After deployment, admin `GET /api/v1/catalog` returned HTTP 200 with 4 persisted assets and 2 table-level edges, but 0 evidence rows, 0 runs, 0 quality checks, and 0 column classifications. A search smoke test using the wrong request field (`query`) returned HTTP 400 `Missing question`; source inspection confirms the endpoint expects `question`. No writes were made. Interactive Home/Catalog browser regression remains unverified and must not be marked complete until tested.
* **AI Feature Rationale:** Resolve stale browser assets and make ownership, comparison findings, and acceptance gaps explicit without overlapping the Lineage Explorer owner or redesigning the existing app.

### Version 301 — Pranav Home/Catalog Completion Pass (28 October 2026)
* **Contributor:** Kairos AI Developer, requested by Pranav.
* **Frontend changes:** Updated Home/Catalog audit report with a source-backed comparison against the older black app, official competitor documentation from DataHub, OpenMetadata, Atlan and OpenLineage, explicit acceptance criteria, current API results, and limitations. Updated the app shell cache keys for `styles.neo.css`, `layout.css`, and `app.js` to v301 and the visible build marker to v301.
* **Backend / database:** No API, schema, migration, data or Lineage Explorer changes in this pass.
* **Verification:** Dry-run validator reports zero blocking errors and three warnings at `api/v1/ingest.js:108`. Source inspection confirms `lock_key`, `ts`, and `existing` are named CTEs in the same SQL statement, not standalone database tables; these three specific missing-table warnings are validator false positives, though the SQL still requires a real ingestion-path execution test. `GET /api/v1/catalog` and `GET /api/v1/competitor-research` returned HTTP 200. `POST /api/v1/search` with `question` returned HTTP 200 and two keyword matches; it is not semantic/RAG search. Persisted source currently contains 4 assets, 2 edges, 0 evidence, 0 runs, 0 quality checks, and 0 column classifications. No writes were made. Authenticated browser regression remains outstanding.
* **AI Feature Rationale:** Convert the partial audit into a sourced acceptance plan and make data limitations explicit rather than claiming unsupported competitor parity or UI correctness.

### Version 302 — Protocol Reconciliation & Warning Review (28 October 2026)
* **Contributor:** Kairos AI Developer, requested by Pranav.
* **UI / Documentation:** Corrected this guide's stale header from Version 296 to Version 302. Added the v301 Home/Catalog audit as a Section 4 rationale entry and reconciled the completion report's deployment checklist with the deployed v301 record.
* **Backend / Database:** No API, schema, migration, catalog data, or Lineage Explorer changes. Reviewed the three dry-run warnings at `api/v1/ingest.js:108`: `lock_key`, `ts`, and `existing` are CTE aliases declared in that same SQL statement, so the missing-table lint messages appear to be false positives. This source review is not a substitute for executing a valid ingestion fixture end-to-end; that test remains open to avoid unapproved production writes.
* **Verification / Remaining acceptance:** Existing v301 smoke tests remain the latest executed API tests. Authenticated interactive Home/Catalog browser regression is still outstanding. Current catalog metadata has four assets but no stored column definitions for the reported five-column asset; no column names or classifications were invented. The completion report now distinguishes checks completed from execution/browser tests still pending.
* **AI Feature Rationale:** Restore consistency between the canonical guide, Section 2 deployment history, Section 3 open backend gaps, Section 4 feature rationale, and the Home/Catalog acceptance report without overstating completion.