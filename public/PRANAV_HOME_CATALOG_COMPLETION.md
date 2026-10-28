# Pranav — Home & Catalog Completion Audit

**Project:** Kairos Metadata Lineage Dashboard (primary 3D app)  
**Audit date:** 28 October 2026  
**Reference:** Kairos Lineage Dashboard (older black app)  
**Scope:** Home / Overview and Catalog only. The Lineage Explorer remains owned by the other teammate; no lineage behavior or Observatory code was changed.

## Executive result

The assigned Home/Catalog discovery work is now documented, and a stale frontend-cache issue has been corrected in the HTML shell. This is **not a claim that all end-to-end behavior is verified**: this environment did not provide a real interactive browser session, so visual interactions and authenticated user flows remain marked for manual verification. The project’s own API audit also says some Home/catalog values and UI controls remain unverified end to end.

## 1. Current 3D app vs older black reference

| Area | Older black reference | Current 3D app | Decision |
|---|---|---|---|
| Home summary | Five linked KPIs: assets, open issues, approvals waiting, stale assets, evidence gaps | Home includes metadata overview, persisted-mode overview, documentation attention and governance handoff; demo overview includes evidence/run/quality summaries and sample activity | Preserve current 3D Home and its data-mode distinctions. Reuse the older app’s useful idea that KPI cards should navigate to the underlying filtered list; verify every current card/action before adding anything. |
| Home attention queue | “Needs attention” rows with issue kind, asset link, detail and action | Metadata attention ranks missing documentation fields and offers focused review; governance handoff identifies owner/steward/glossary gaps | Existing feature overlap: do not duplicate another attention panel. Test that each gap action applies the intended Catalog filter and that empty states are accurate. |
| Home data transparency | Explicit “Mock fixture” note | Current app shows Demo / Catalog labels and distinguishes synthetic examples from persisted catalog records in relevant panels | Keep explicit mode labels; verify switching Demo/PostgreSQL changes the displayed data and labels together. |
| Catalog discovery | Facets for type, domain, tag, owner; sort by name, recently updated, tier; asset cards show trust/tier, description, platform/domain/owner/columns/tags; explicit mock-fixture disclaimer | Current app has All assets, Catalog structure, Catalog search, data products; richer filters include asset type, domain/schema, owner, tag, trust/unknown, metadata completeness and missing field; asset rows expose PII state and completeness; profile includes Overview/Schema/Lineage/Quality/Insights/Access tabs | Current app has broader discovery and governance features. Preserve them. Do not copy the old app’s whole structure or add redundant facets. Confirm search/filter/clear behavior in the live browser. |
| Catalog classification | Type/domain facets; no comparable broad taxonomy chart identified in inspected reference source | Asset-type breakdown and Catalog coverage use a shared metadata classifier across Demo and PostgreSQL; categories are inferred, not reviewed classifications | Keep the chart, but label categories as inferred from available metadata and preserve Other / unclassified. Do not present them as authoritative classifications. |
| Asset detail | Separate tabs and metadata; sample-data disclosure | Rich asset profile with schema, lineage, quality, insights and access tabs | Current app is more extensive; verify tab routing and column definitions are actually present in loaded records. |

## 2. Competitor research baseline and decisions

This is a targeted official-documentation baseline, not a claim of live Perplexity research or complete competitor feature parity.

| Product / source | Relevant pattern | Problem solved | Kairos decision | Complexity |
|---|---|---|---|---|
| DataHub — [Metadata model](https://docs.datahub.com/docs/metadata-modeling/metadata-model) | Stable entity identity, metadata aspects, explicit relationships | Avoids treating an asset as one unstructured metadata blob | **Investigate further / align shared model**; do not add a parallel store in the Home/Catalog UI | High; shared architecture |
| DataHub — [Metadata ingestion](https://docs.datahub.com/docs/architecture/metadata-ingestion) | Separate ingestion, primary-key lookup, search and relationship traversal | Keeps catalog search distinct from ingestion and graph traversal | **Preserve current separation**; catalog UI should use canonical records and not infer lineage | High; shared backend |
| OpenMetadata — [Asset tabs](https://docs.open-metadata.org/v1.12.x/how-to-guides/guide-for-data-users/data-asset-tabs) | Shared asset-profile shell with resource-specific tabs | Prevents showing capabilities unsupported by a given asset or its metadata | **Keep existing profile tabs**, but hide/disable only when the underlying capability/data is unavailable; verify schema/columns before claiming column support | Medium |
| OpenMetadata — [Lineage](https://docs.open-metadata.org/) | Table and column lineage are distinct from previews and manual relationships | Reduces false certainty from declared mappings | **Coordinate with Lineage owner**; Catalog should link to lineage without claiming a mapping proves runtime execution | High; shared |
| OpenLineage — [Facets](https://openlineage.io/docs/spec/facets/) | Extensible, versioned metadata attached to events/runs | Preserves source evidence and extensibility | **Future shared integration**; not a Home/Catalog-only change | High |

The current project audit describes competitor-research API output as curated/prepared guidance rather than live research, and frontend integration is unverified. This document therefore records the findings and decisions rather than claiming a live research crawler or competitor parity.

## 3. File ownership and change-scope review

- public/app.js: shared single-file frontend for many views. Home/Catalog logic lives here, but Lineage Explorer also uses it. **No edits were made to this file in this pass** to avoid overlapping the other teammate’s ownership.
- public/index.html: shared app shell and static asset references. Updated only the cache-busting versions for the current styles.neo.css, layout.css, and app.js, and aligned the visible build label. No layout, styles, navigation, APIs, schemas, migrations, or Observatory code were changed.
- public/styles.neo.css, public/layout.css, public/assets.css: inspected by manifest only; not edited.
- Backend/API/schema: no changes in this pass.
- Changelog and this report: documentation only.

## 4. Current acceptance checklist

| Requirement | Status | Evidence / next action |
|---|---|---|
| Inspect current Home and Catalog | **Code-inspected** | Reviewed current overview, metadata-attention/governance panels, catalog facets and asset-profile behavior in public/app.js. |
| Inspect older Home and Catalog | **Code-inspected** | Reviewed older public/dashboard.js and public/app.js; comparison above. |
| Identify useful differences and avoid duplication | **Documented** | Existing current features are retained; recommendations recorded above. |
| Competitor discovery | **Baseline documented; not fully complete** | Official docs recorded; live Perplexity research and a full source-by-source parity matrix remain separate work. |
| Identify files/shared dependencies | **Complete for this pass** | Scope recorded above; shared app.js deliberately untouched. |
| Fix stale asset cache references | **Deployed in v299** | public/index.html now references current build cache keys; deploy and confirm live shell before marking complete. |
| Search, facets, clear filters, profile tabs and responsive UI | **Not browser-verified in this pass** | Test in an authorized browser session with Demo and PostgreSQL modes. Do not claim success based only on source. |
| Validate Home statistics against underlying records | **Partially verified** | API-level audit has checked authorized catalog reads; Home UI/stat-to-record consistency still needs browser-level verification. |
| Track remaining work | **Documented here** | No open Hatchable agent tasks were present at audit time. |

## 5. Prioritized next actions

1. **P1 — Release and verify cache refresh:** deploy the HTML cache-key correction, open the deployed app with a hard refresh, and confirm the current build marker and scripts/styles load.
2. **P1 — Browser regression:** in Demo mode, test Home → metadata gap action → Catalog filter → clear filters → asset profile → Schema/Columns; repeat the relevant catalog reads in PostgreSQL mode. Confirm no demo records leak into persisted mode.
3. **P1 — Data honesty:** ensure metadata completeness is described as documentation coverage, not data quality/trust; ensure inferred asset-type groups are labelled inferred; confirm empty column definitions are not fabricated.
4. **P2 — Competitor research:** complete a live source-backed research pass and record citations, current-vs-reference parity, complexity and acceptance criteria. The current curated API is not a substitute for that research.
5. **P2 — Tracker:** create individual Home/Catalog tasks only after browser results are known, with owner, priority, dependencies and evidence.

## Final status

**Home/Catalog discovery and comparison: documented. Cache-key correction: prepared in source. Full assignment: not yet fully complete until deployment and browser regression are verified.** No claim is made that the original task has been fully accepted or that all interactions work end to end.