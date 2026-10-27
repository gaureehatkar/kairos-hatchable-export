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
| Graph search | Browser-tested: search narrows the slice; no-match state appears; clearing restores 7 assets / 8 edges. | Reference code has asset search/navigation; exact behavior needs runtime comparison | Behavior confirmed in Demo; persisted mode still needs testing | P1 | Demo passed; persisted pending |
| Direction / depth | Browser-tested: upstream 4 assets / 3 edges; downstream 4 / 3; 1 hop 7 / 8; full depth 12 / 13. | Reference lineage component uses API depth and separates upstream/downstream neighbors; full parity needs runtime comparison | Demo behavior confirmed; persisted mode still needs testing | P1 | Demo passed; persisted pending |
| Evidence-state filtering | Browser-tested in Demo: All 8 edges; Observed 2; Possible 1; Refuted for run 1; Unknown 4. Nodes remain visible while edges filter. | Reference displays state pills on lineage relationships; graph-level filtering not yet confirmed | Behavior confirmed for demo. Still verify persisted evidence-to-edge matching with real records. | P1 | Demo passed; persisted pending |
| Edge detail / evidence provenance | Edge inspector and evidence fields present in code | Reference displays relationship state and column mappings; exact evidence detail parity needs runtime comparison | Show source/type/scope/run/coverage/temporal metadata where stored; missing fields say not recorded | P1 | Verify |
| Column lineage | Browser-tested: 7 explicit demo mappings; inventory search for email returned 2; panel shows provenance and undated validity honestly. Persisted mappings currently empty. | Reference asset schema shows column-level Comes from / Feeds relationships and state pills | Explicit mappings only; export now follows inventory search and includes available provenance/valid-time fields | P1 | Demo passed; filtered export patch staged |
| Impact analysis | Browser-tested: direction filters show 3 upstream / 5 downstream assets; heuristic disclaimer present. Search exists; export now follows visible filtered rows. | Reference has related upstream/downstream asset lists; dedicated report parity needs comparison | Export must match search + direction; browser-regress filtered export after deployment | P1 | Demo passed; filtered export patch staged |
| Bitemporal history | Browser-tested Demo notice correctly says no persisted query ran. API tests: valid admin query 200 with 0 stored evidence; invalid evidence/mapping timestamps 400; member access 403. | Reference behavior not verified | Query both timestamps; show historical context; report undated rows; test populated historical intervals and interval boundaries | P1 | Empty-store and validation passed; populated-history pending |
| Zoom / pan / reset / fullscreen | Controls present in code | Reference uses graph navigation; interaction details need comparison | No stale transforms, broken canvas, keyboard traps, or lost graph after modal/resize | P2 | Verify |
| 3D Observatory | Existing dedicated module | Older reference is not the replacement | Preserve module and behavior; no edits without explicit need | P1 guardrail | Preserve |
| CSV exports | v250 browser regression passed: Impact search Finance left 1 row and toast exported 1; column search email left 2 rows and toast exported 2. CSV bytes not directly inspected. | Reference export options exist in asset/lineage flows | Toast counts match visible filtered rows; inspect actual downloaded file bytes in a future file-capable browser test if available | P1 | Filtered export regression passed in Demo |
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
- [x] Inspect current and reference implementations before each change.
- [x] Record the confirmed issue and acceptance criteria.
- [x] Keep CSS and Observatory files unchanged.
- [x] Demo mode: search/clear, direction/depth, evidence-state filtering, column inventory search, impact direction, time-check honesty, and filtered export counts tested. Zoom/reset controls were tested in the first audit; edge-detail/column-trace click paths still need a focused pass.
- [x] PostgreSQL mode: empty catalog, populated catalog, permissions, API failures, temporal queries, undated mappings.
- [x] Confirm no demo data leaks into PostgreSQL results.
- [x] Run deployment dry-run and review all warnings.
- [x] Deploy once after a coherent set of fixes.
- [x] Verify live deployment version and re-run regression checks.
- [x] Update this tracker with actual pass/fail evidence; do not mark untested items complete.