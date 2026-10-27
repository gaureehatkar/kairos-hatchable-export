# Kairos Lineage Explorer — execution plan and tracker

Updated: 2026-10-27
Primary app: https://kairos-metadata.hatchable.site
Reference app: https://kairos-lineage-tde4.hatchable.site
Owner: Pranav — Lineage Explorer

## Guardrails
- Current 3D app is the destination; the older black app is a reference only.
- Preserve current layout, styling, navigation, CSS, and 3D Observatory.
- Do not edit `public/styles.css`, `public/styles.neo.css`, or `public/observatory.js`.
- Keep changes scoped to lineage behavior in `public/app.js` unless a shared API/schema change is explicitly agreed.
- No changes to Home/Catalog features.
- Demo records, modeled edges, static SQL matches, declared column mappings, and runtime evidence must remain clearly distinct.
- Missing events alone never prove non-propagation. `REFUTED_FOR_RUN` must remain run-scoped and require complete negative-evaluation coverage.
- Bitemporal queries must apply valid time and recorded time independently; undated valid-time records are reported separately.
- Do not claim connector, RAG, execution, or historical capability is working unless verified.

## Initial code inspection (confirmed)
- Current `public/app.js` has graph search, direction and depth controls, evidence-state selector, graph zoom/fullscreen, edge details, impact analysis, column mappings, and valid/recorded-time controls.
- Current `api/v1/evidence-at-time.js` queries persisted evidence using both valid-time and recorded-time intervals and counts undated valid-time rows separately.
- Current `api/v1/column-lineage.js` applies both temporal dimensions, returns undated mappings separately, and describes mappings as declarations rather than execution proof.
- Current persisted catalog has previously been observed with 4 assets, 2 table-level edges, 0 evidence records, 0 column mappings, 0 runs and 0 quality checks. Re-check before relying on these counts.
- The public pages cannot be fetched without the platform preview context (HTTP 401). Short-lived preview links were minted for manual/browser verification.
- Deployment dry-run previously reported three warnings in `api/v1/ingest.js:104` for CTE aliases `lock_key`, `ts`, and `existing`. This is outside the Lineage Explorer UI scope; do not alter ingestion without a coordinated decision.

## Comparison tracker

| Area | Current 3D app | Older black reference | Decision / acceptance criteria | Priority | Status |
|---|---|---|---|---|---|
| Graph search | Present in code; runtime test needed | Reference code has asset search/navigation; exact behavior needs runtime comparison | Search must retain input focus, narrow/highlight the intended slice, and recover cleanly when cleared | P1 | Verify |
| Direction / depth | All/upstream/downstream and hop depth controls present | Reference lineage component uses API depth and separates upstream/downstream neighbors; full parity needs runtime comparison | No direction/depth bleed-through; root stays visible; counts match rendered nodes/edges | P1 | Verify |
| Evidence-state filtering | Selector present; behavior must be verified against edges and connected nodes | Reference displays state pills on lineage relationships; equivalent graph-level filtering not yet confirmed | Filtering affects edges and derived graph slice consistently; no false claim from missing evidence | P1 | Verify |
| Edge detail / evidence provenance | Edge inspector and evidence fields present in code | Reference displays relationship state and column mappings; exact evidence detail parity needs runtime comparison | Show source/type/scope/run/coverage/temporal metadata where stored; missing fields say not recorded | P1 | Verify |
| Column lineage | Inventory, filter, trace action, transformation drawer, and export exist in code | Reference asset schema shows column-level Comes from / Feeds relationships and state pills | Trace only explicit mappings; no invented mappings; filter and selected-column path must be correct | P1 | Verify |
| Impact analysis | Upstream/downstream report and heuristic scorecard exist in code | Reference has related upstream/downstream asset lists; dedicated report parity needs comparison | Report clearly labels heuristic vs measured values, shows hop/direction/owner/type, and export behavior is deterministic | P1 | Verify |
| Bitemporal history | Separate valid/recorded inputs and persisted evidence/mapping endpoints exist | Reference behavior not verified | Query both timestamps; show historical context; report undated rows; validate bad dates and interval boundaries | P1 | Verify |
| Zoom / pan / reset / fullscreen | Controls present in code | Reference uses graph navigation; interaction details need comparison | No stale transforms, broken canvas, keyboard traps, or lost graph after modal/resize | P2 | Verify |
| 3D Observatory | Existing dedicated module | Older reference is not the replacement | Preserve module and behavior; no edits without explicit need | P1 guardrail | Preserve |
| CSV exports | Export controls exist; targeted export behavior was restored in v246 | Reference export options exist in asset/lineage flows | Exports match documented semantics and do not silently mislabel modeled dependencies as runtime proof | P1 | Regression test |
| Demo vs PostgreSQL | Explicit mode switch and demo notices exist | Reference has mock/API-backed distinction | No demo fallback blended into persisted mode; labels match the actual data source | P1 | Verify |

## Competitor research notes
- DataHub official lineage guide: https://docs.datahub.com/docs/features/feature-guides/lineage — column-level lineage describes movement/dependencies at column granularity. Use this as a product capability reference, not as proof Kairos has equivalent coverage.
- Atlan export guide: https://docs.atlan.com/product/capabilities/lineage/how-tos/download-and-export-lineage — offers lineage download/export flows; compare user value and export semantics rather than copying the UI.
- Atlan lineage view guide: https://docs.atlan.com/product/capabilities/lineage/how-tos/view-lineage — includes depth controls for column lineage.
- These official docs support prioritizing traceability, depth control, and exportability. They do not prove that every connector yields column lineage; availability depends on source/metadata support.

## Prioritized execution backlog

### P1 — correctness and trust
1. Browser-regress search, direction, depth, evidence-state filtering, selected node, graph counts, and clearing filters.
2. Verify edge inspector shows available provenance and uses honest fallbacks for missing fields.
3. Verify impact report filters, scorecard caveats, and CSV export semantics.
4. Verify column inventory filtering, trace interactions, and export shape.
5. Verify valid/recorded-time queries, invalid timestamps, undated rows, and no-result/error states.
6. Verify demo/PostgreSQL separation and that all claims are scoped to available records.
7. Fix only confirmed Lineage Explorer defects, with minimal changes in `public/app.js`.

### P2 — high-value improvements after parity audit
1. Add missing high-value lineage interactions only when the comparison confirms a real gap.
2. Improve column tracing or impact table context only where the existing data model supports it.
3. Ensure accessible keyboard/focus states and meaningful empty/loading/error states within existing styles.

### P3 — backend/architecture work (coordinate first)
1. Real connector/runtime evidence and richer coverage contracts.
2. Historical graph snapshots only if the canonical store can support them without guessing.
3. Any shared API/schema change must be agreed before implementation.

### P4 — defer
1. Large graph redesigns, replacement visualization libraries, or a rebuild of the 3D Observatory.
2. Numeric confidence claims without a validated calibration method.
3. Features that cannot be supported by available evidence/data.

## Test and release checklist
- [ ] Inspect current and reference implementations before each change.
- [ ] Record the confirmed issue and acceptance criteria.
- [ ] Keep CSS and Observatory files unchanged.
- [ ] Demo mode: search/filter/direction/depth/zoom/edge details/impact/column tracing/exports.
- [ ] PostgreSQL mode: empty catalog, populated catalog, permissions, API failures, temporal queries, undated mappings.
- [ ] Confirm no demo data leaks into PostgreSQL results.
- [ ] Run deployment dry-run and review all warnings.
- [ ] Deploy once after a coherent set of fixes.
- [ ] Verify live deployment version and re-run regression checks.
- [ ] Update this tracker with actual pass/fail evidence; do not mark untested items complete.