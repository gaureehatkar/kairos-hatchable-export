# Pranav — Home & Catalog Completion Audit
**Project:** Kairos Metadata Lineage Dashboard  
**Audit date:** 28 October 2026  
**Scope:** Home / Overview and Catalog only. The Lineage Explorer remains owned by the other teammate.

## Current implementation result
The main app has source-adaptive Home metrics, metadata-attention and governance queues, dynamic catalog fields, search, filters, clear-filter navigation, inferred type coverage, and an asset profile. The old black reference has five linked KPIs, an attention queue, pending work, lineage evidence, domain health and recent updates. The current app offers richer metadata-discovery and source-mode separation, but several details still require interactive browser verification.

## Current vs older black app — page-level decisions
| Requirement | Older black reference | Current app evidence | Acceptance criteria / action |
|---|---|---|---|
| Home KPIs | Assets, open issues, approvals, stale assets, evidence gaps; every figure links to its list | Source-adaptive metrics in persisted mode; sample evidence/run/quality metrics in Demo mode | Ensure each actionable metric has a meaningful destination; do not display synthetic activity in persisted mode |
| Home attention | Failing tests, incidents, stale assets, undated dependencies | Metadata Attention ranks missing documentation; Governance Handoff counts owner/steward/glossary gaps | Every review action must set the correct filters; empty state must mean no gaps in the currently loaded source, not a source error |
| Home data mode | Explicit mock fixture notice | Demo and persisted modes are distinguished in labels and content | Test switching both ways and prove no demo fixtures leak into PostgreSQL mode |
| Catalog facets | Type, domain, tag, owner; name/updated/tier sort | Type, domain/schema, owner, tag, trust/unknown, completeness, missing field, search, sorting | Verify combinations, zero results, reset, keyboard use and URL/navigation behavior |
| Catalog categories | Facets derived from sample records | Dynamic type breakdown; some categories inferred from metadata | Keep categories explicitly inferred and preserve unclassified/unknown; do not imply reviewed taxonomy |
| Asset profile | Overview/schema/lineage/quality/insights/access patterns | Rich profile and metadata presentation; current DB has incomplete column metadata | Show unavailable values as unavailable; never invent columns or claim lineage evidence without stored support |
| Refresh/polling | Reference app loads API data through hooks | Main app uses focus/visibility refresh throttling; demo heartbeat is visual only | Confirm no repeated full-catalog polling and that manual refresh/focus updates data |

## Source-backed competitor research (official documentation checked 28 October 2026)
This is a source-backed documentation comparison, not a claim of product parity or a live crawler.

| Product | Documented pattern | Kairos implication | Complexity / boundary |
|---|---|---|---|
| DataHub — metadata model and ingestion | Typed entities, extensible metadata aspects and explicit ingestion/change-proposal patterns | Keep stable identity and source metadata distinct; preserve source-specific fields and provenance | High; shared data model and ingestion architecture |
| OpenMetadata — asset tabs | A shared asset profile with tabs that vary by asset type; schema, quality/profiling, lineage, execution and custom properties are capability-specific | Keep the profile shell but make tab contents depend on actual asset type and available records | Medium UI, high shared capability/data requirements |
| Atlan — asset profiles and discovery | Asset profile overview, columns, lineage, related assets, usage; discovery supports structured facets and natural-language search | Make asset context scannable; retain structured filters and avoid labeling keyword search as semantic AI | Medium UI, high for real usage integrations or semantic search |
| OpenLineage — facets | Versioned/extensible facets attach metadata to run, job and dataset entities | Preserve event provenance and versioned custom metadata; distinguish a declared edge from execution evidence | High integration/data contract work |
| OpenMetadata — manual lineage | Explicit user-defined table and column relationships | If relationship editing is ever exposed, label it as declared/manual and retain provenance | High and coordinated with Lineage owner; out of this Home/Catalog scope |

### Official source links
- DataHub metadata model: https://docs.datahub.com/docs/metadata-modeling/metadata-model
- DataHub ingestion: https://docs.datahub.com/docs/architecture/metadata-ingestion
- OpenMetadata asset tabs: https://docs.open-metadata.org/v1.12.x/how-to-guides/guide-for-data-users/data-asset-tabs
- Atlan asset profiles: https://docs.atlan.com/product/capabilities/discovery/concepts/what-are-asset-profiles
- Atlan discovery: https://docs.atlan.com/product/capabilities/discovery
- OpenLineage facets: https://openlineage.io/docs/spec/facets/
- OpenMetadata manual lineage: https://docs.open-metadata.org/v1.12.x/how-to-guides/data-lineage/manual

## Automated verification (28 October 2026)
- `GET /api/v1/catalog`: HTTP 200. PostgreSQL source; 4 assets, 2 table-level edges, 0 evidence records, 0 pipeline runs, 0 quality checks, 2 raw events, 0 column classifications.
- `POST /api/v1/search` with `{question:"customer orders"}`: HTTP 200, returns two matching persisted assets. The API explicitly describes this as persisted keyword search, **not** semantic/RAG retrieval.
- `GET /api/v1/competitor-research`: HTTP 200, returns curated design guidance and source links; it is not a live research crawler.
- `dry_run_deploy`: zero blocking errors; three warnings at `api/v1/ingest.js:108` about CTE aliases `lock_key`, `ts`, `existing`. These need source inspection before dismissing as false positives.
- Read-only browser run 1 (`b26720ad-30c5-4f47-b5b9-84aa0324f34b`) using the saved TinyFish profile reached the Hatchable sign-in gateway; this was an access blocker for that session. A second read-only run (`bf09a132-9c4c-4012-ad8f-a00533a18391`) used a temporary Hatchable preview link and successfully tested the Demo UI. Home, metadata gap action to Catalog, search/zero-results, filter controls, sorting controls, clear/reset, asset profile tabs, and Demo/PostgreSQL mode switching were observed. PostgreSQL mode displayed an explicit sign-in-required message; persisted data-mode behavior beyond this gate remains blocked. Viewport resizing was not available through the UI, so tablet/mobile responsiveness remains unverified. No writes or ingestion were performed.

## Data limitations that prevent a truthful “fully complete” claim
- Persisted catalog is sparse: 4 assets and 2 edges only; 0 evidence, runs, quality checks and column classifications.
- Three records report zero columns; one record reports five columns but has no actual column definitions in the returned metadata.
- The current search API is keyword-based. Do not market it as semantic search/RAG.
- Competitor API content is curated guidance, not dynamic crawling or competitor parity proof.
- Demo-mode browser click-throughs, Home greeting/workspace label, Catalog search/filters/sorting/zero-results/reset, profile tab navigation, and mode-switch control were verified in run `bf09a132-9c4c-4012-ad8f-a00533a18391`. PostgreSQL mode itself remained gated by the app’s authorized Hatchable project-session requirement. Tablet/mobile responsive behavior is still unverified because no viewport resizing control was available in the browser run.

## Ownership and release boundary
- `public/app.js` is shared across Home, Catalog and Lineage Explorer. Lineage Explorer belongs to another teammate; avoid broad rewrites or changes to lineage behavior without coordination.
- No changes to the Lineage Explorer, Observatory or database were made as part of this audit.
- Current HTML asset cache keys and visible build marker are aligned to v301 in source; deploy and verify the live shell before calling the cache-refresh requirement complete.

## Acceptance checklist
- [x] Current Home/Catalog and older black reference source-inspected.
- [x] Source-backed competitor comparison and official source links recorded.
- [x] Catalog and search API smoke-tested without writes.
- [x] No blocking deploy validator errors.
- [x] Deploy v301 and confirm source/live shell cache keys and build marker are aligned to v301 (deployment record and source inspection).
- [x] **PARTIAL PASS 29 Oct 2026 (Demo preview):** Home metadata-gap action → Catalog with metadata-gap filters → clear filters → open `inventory_snapshot` profile → Structure/Schema. Observed schema empty state accurately says the catalog reports 13 columns but no column definitions were returned. PostgreSQL-mode version of this workflow remains blocked by authorized project-session requirement.
- [x] **PASS in Demo preview:** Personalized greeting (`WELCOME BACK`, `Hi, Research workspace 👋`), workspace labels (`Demo workspace`, `Research workspace`), sidebar navigation and Catalog sub-navigation observed. [ ] Responsive breakpoints remain unverified; browser run did not expose viewport resizing.
- [x] Review three ingest SQL lint warnings against the actual CTE query: `lock_key`, `ts`, and `existing` are CTE aliases declared in the statement, not missing physical tables; the validator appears to be a false positive for these aliases.
- [ ] Exercise the authorized ingestion path with a controlled valid fixture in a safe test environment to verify the CTE query executes end-to-end; do not send test writes into production catalog without approval.
- [ ] Populate real column metadata through supported ingestion before accepting column-level classification/profile completeness.
- [ ] Re-run smoke tests and record screenshots/observations after browser verification.

**Status (acceptance follow-up, 29 October 2026):** The first TinyFish attempt (`b26720ad-30c5-4f47-b5b9-84aa0324f34b`) was blocked at the Hatchable sign-in gateway. The second run (`bf09a132-9c4c-4012-ad8f-a00533a18391`) used a temporary preview link and passed the Demo-mode Home/Catalog read-only interaction checks: greeting/workspace/navigation; metadata-gap action into Catalog; search and zero-result empty state; available filter controls and sorting options; clear/reset; `inventory_snapshot` asset profile, All Metadata and Structure/Schema empty state; profile-tab navigation; and Demo/PostgreSQL switch control. PostgreSQL mode correctly showed “Sign-in required” because preview access does not grant an authorized project session. Responsive tablet/mobile verification remains blocked because viewport resizing was not available. Read-only API checks: `GET /api/v1/catalog` HTTP 200 (PostgreSQL source, 4 assets, 2 edges, 0 evidence, 0 runs, 0 quality checks, 2 raw events, 0 column classifications) and `GET /api/v1/competitor-research` HTTP 200. Deploy dry-run reports zero blocking errors and three existing `api/v1/ingest.js:108` CTE-alias lint warnings. Ingestion E2E remains pending because no approved safe test environment has been established; no import payload was submitted. Full assignment remains open until authorized PostgreSQL browser checks, responsive checks and controlled safe-environment ingestion are completed, and real column metadata is populated through supported ingestion or explicitly accepted. No columns, evidence, runs, quality checks or classifications have been fabricated.

## Browser regression snapshot — 29 October 2026 (live v304)

This is an additional anonymous-preview test pass. It does not replace the required authorized PostgreSQL and safe-ingestion tests.

| Acceptance criterion | Test input / actual result | Status |
|---|---|---|
| Home greeting and navigation | Home rendered `Hi, Research workspace`; main navigation was present. The separate workspace-label control was not located in the inspected DOM and is not independently verified. | PARTIAL |
| Home metadata-attention action | Clicked `Review assets needing metadata`; Catalog opened with completeness filter `needs`. | PASS (Demo) |
| Catalog clear/reset | Clicked Clear filters; search blank, completeness `all`, missing field `all`, 12 demo assets shown. | PASS (Demo) |
| Catalog search → profile → Schema | Search `customer_orders` returned one row; opening the row displayed Asset profile; Structure tab rendered five defined demo columns. | PASS (Demo) |
| PostgreSQL mode | Anonymous preview showed Sign-in required and an explicit catalog-load error, with zero persisted rows and no demo fallback. | PASS for anonymous guard; authorized workflow BLOCKED |
| Responsive layout | At 390 px, document/body width was 568 px and `.top-actions` extended to x=568. At 768, 1024 and 1440 px, document width matched the viewport. | FAIL at 390 px |
| Full filter matrix, sorting, zero results, keyboard behavior, remaining profile tabs | Not exhaustively exercised in this pass. | NOT TESTED |
| Controlled ingestion with valid fixture | Not run; requires approved safe test environment and authorization. | BLOCKED |
| Real column metadata / column classification | Persisted catalog remains sparse; do not invent column definitions. | BLOCKED on actual source metadata |

**Files changed in this pass:** documentation only. No application code, CSS, API, schema, migration or catalog records were changed. Current live deployment verified after publishing this report: v308. Mobile header overflow remains a confirmed UI issue; no shared CSS/app code was changed because the header styles are shared and require owner coordination.
## Follow-up acceptance verification — 29 October 2026 (pre-release v309 audit)

The prior v304 responsive failure is historical and must not be treated as the current result without rechecking. The project changelog records a mobile-header fix in v305 and responsive filter-grid work in v306. A fresh anonymous-preview browser run on the current project was completed read-only.

| Acceptance criterion | Latest observation | Status |
|---|---|---|
| Home greeting and workspace context | Demo preview rendered “Hi, Research workspace 👋”, the Demo badge/source label, and primary navigation. | PASS (Demo) |
| Home metadata attention → Catalog | Review-assets action opened Catalog with the metadata-completeness filter set to Needs metadata. | PASS (Demo) |
| Catalog search / zero-result / reset | An impossible search term displayed the no-match state; Clear filters restored the 12 demo assets and cleared search. | PASS (Demo) |
| Filter and sort availability | Asset type, domain/schema, owner, tag, trust, completeness, missing-field and sort controls were present. The entire pairwise filter matrix and keyboard behavior were not exhaustively tested. | PARTIAL |
| Asset profile | Profile opened; 12 tabs were present. Overview and Governance content were inspected; other tab contents were not all individually verified. | PARTIAL |
| Responsive widths | Browser automation reported no horizontal overflow at 390, 768, 1024 and 1440 px. This is a browser-agent observation, not a captured automated DOM-width assertion; keep it as a provisional pass until directly reproduced if the team requires hard measurements. | PROVISIONAL PASS |
| Connected/PostgreSQL UI | Preview mode did not provide an authorized app session. No authentication was bypassed and no persisted-mode workflow was attempted. | BLOCKED on authorized session |
| Controlled ingestion | Not executed: the only confirmed target is the working project's live database, and there is no approved isolated test environment. | BLOCKED on safe test environment / approval |
| Real column definitions | Persisted catalog reports 4 assets and 2 table-level edges, but no persisted column classifications; reported column counts do not provide actual column definitions for the sparse persisted records. | BLOCKED on genuine source metadata / approved ingestion |

### Release issue found and fixed in source

Although Hatchable's deployment registry showed v309 live, the deployed shell still referenced older asset keys (styles and app v305; layout and PII enhancement script v304; assets CSS v4), and the footer said build v305. The draft now aligns the shell cache keys and footer marker to v310. A deploy-time validation and live post-deploy check are required before considering that fix shipped.

### Remaining work that genuinely requires another person / environment

1. An authorized project session for PostgreSQL-mode UI acceptance, using the project's real access controls.
2. Approval and access to a safe isolated environment for a valid ingestion fixture. Do not submit writes to the live catalog just to silence the CTE-alias lint warnings.
3. Real schema/column metadata from a source adapter or a teammate who owns the source system; do not fabricate column names or classifications.

No ingestion or catalog writes were performed during this audit. The full assignment is not marked complete: the Demo interaction checks are substantially covered, but authorized persisted-mode acceptance, safe ingestion execution, and real column metadata remain external dependencies.