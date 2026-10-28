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
- No writes were made during API verification. No authenticated interactive browser session was available for end-to-end UI regression.

## Data limitations that prevent a truthful “fully complete” claim
- Persisted catalog is sparse: 4 assets and 2 edges only; 0 evidence, runs, quality checks and column classifications.
- Three records report zero columns; one record reports five columns but has no actual column definitions in the returned metadata.
- The current search API is keyword-based. Do not market it as semantic search/RAG.
- Competitor API content is curated guidance, not dynamic crawling or competitor parity proof.
- Visual responsive checks, browser click-throughs, profile tab checks and authenticated data-mode transitions remain unverified.

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
- [ ] Browser regression: Home gap action → Catalog filter → clear filters → asset profile → Schema; test Demo and PostgreSQL separately.
- [ ] Confirm personalized greeting, saved workspace label, responsive breakpoints and navigation behavior in browser.
- [x] Review three ingest SQL lint warnings against the actual CTE query: `lock_key`, `ts`, and `existing` are CTE aliases declared in the statement, not missing physical tables; the validator appears to be a false positive for these aliases.
- [ ] Exercise the authorized ingestion path with a controlled valid fixture in a safe test environment to verify the CTE query executes end-to-end; do not send test writes into production catalog without approval.
- [ ] Populate real column metadata through supported ingestion before accepting column-level classification/profile completeness.
- [ ] Re-run smoke tests and record screenshots/observations after browser verification.

**Status (v302 documentation reconciliation):** Research and code comparison are source-backed; API smoke tests pass; v301 is deployed and the live shell source references the v301 asset keys. The three SQL lint warnings were reviewed and appear to be CTE-alias false positives, but an end-to-end ingestion execution test is still required. Full assignment remains open until authenticated browser regression is completed and sparse column metadata is populated through supported ingestion or explicitly accepted. No columns, evidence, runs, quality checks, or classifications have been fabricated.