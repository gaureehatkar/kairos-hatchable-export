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

## Browser regression snapshot — 29 October 2026 (live v304, anonymous preview)

Scope note: this pass inspected the current source and exercised the deployed app through a short-lived anonymous preview. It did not modify application code, perform database writes, or deploy. Because the preview is anonymous, PostgreSQL-backed UI workflows requiring admin access are BLOCKED rather than passed.

| Criterion | Original issue / expected behavior | Files changed | Actual test input and result | Mode | Status / limitation |
|---|---|---|---|---|---|
| Transformation SQL association | Actual SQL must be attached to the mapping and kept distinct from its description. | None in this pass; inspected `public/app.js`, `api/v1/column-lineage.js`, `migrations/008_kairos_column_lineage.sql`. | Source inspection: `transformSqlFor` accepts top-level `sql` / `transformation_sql` and `metadata.sql` / `metadata.transformation_sql`. The API returns the mapping `metadata` JSONB field, so no schema change is needed to carry these fields. | Source inspection | PARTIAL. Document a canonical field contract and verify a real persisted mapping with actual SQL. |
| SUM transformation drawer | Do not fabricate SQL that misrepresents `SUM(total_amount)`. | None. | Opened the demo mapping `commerce.customer_orders.total_amount → analytics.orders_enriched.net_revenue`, description `SUM(total_amount) in grouped example`. Drawer showed `NOT RECORDED`, explained that no SQL was available, and did not render an enabled SQL-analysis action. | Demo | PASS for this mapping; it contains no actual SQL. |
| Direct mapping SQL behavior | If actual SQL is unavailable, show the limitation rather than inventing SQL. | None. | Opened `commerce.customer_orders.order_id → analytics.orders_enriched.order_id`. Current UI generated `SELECT order_id AS order_id FROM commerce.customer_orders`, labeled it illustrative/not source SQL, and offered Analyze generated example. | Demo | FAIL against the strict handoff wording: the disclaimer is clear, but generated SQL is still offered when actual SQL is unavailable. Requires Lineage Explorer owner approval before changing shared `public/app.js`. |
| Copy Logic | Copy actual SQL when recorded; never confuse a description with SQL. | None. | With the direct mapping drawer open, intercepted clipboard writes. Copy generated example wrote the exact labeled illustrative SQL snippet, not `Direct mapping`. SUM mapping offered a separate Copy description control. | Demo | PARTIAL. Current behavior separates description from generated SQL, but strict no-invented-SQL requirement means this should be revised after coordination. Actual-source-SQL copy was not testable because no mapping with recorded SQL was present. |
| Analyze in SQL View | Pass the intended SQL, not the human-readable description; unavailable SQL must not be analyzed. | None. | Clicked Analyze generated example on the direct mapping. SQL View contained the exact generated snippet and displayed a warning that it was a generated example, not source SQL; the lightweight matcher found one catalog reference and stated that no SQL was executed. | Demo | PARTIAL. Correct handoff of the generated content, but should not be offered for missing source SQL under the strict acceptance requirement. Actual-source-SQL branch remains untested. |
| Graph search / direction / evidence filter | Search and graph filters must update the visible graph and recover when cleared. | None. | Demo baseline: 7 visible assets / 8 dependencies. Search for `Finance` returned 0 assets (search matches asset name/path, not owner); upstream and downstream each showed 4 assets / 3 dependencies; Observed filter showed 2 of 8 dependencies. | Demo | PASS for tested controls. Clearing search was exercised before direction/filter checks; broader edge cases remain. |
| Column mapping search | Search must narrow explicit mappings and show a truthful count. | None. | Column-lineage panel search `email` returned 2 of 7 mappings: customer_profiles.email → orders_enriched.customer_email, and orders_enriched.customer_email → marketing_attribution.email_hash. | Demo | PASS. Exported CSV bytes not inspected in this pass. |
| Impact analysis | Report must disclose heuristic nature and show dependency scope. | None. | Opened impact analysis for `analytics.orders_enriched`; report showed upstream/downstream rows and 8 affected assets, and explicitly said the risk score is heuristic, not a measured SLA or runtime failure probability. | Demo | PARTIAL. Report opening/content passed; direction filter and downloaded CSV bytes not tested in this pass. |
| Source/target focus and graph highlighting | Focus controls must navigate to the owning asset and highlight the relevant column/path. | None. | Not successfully executed in this pass. | Demo | NOT TESTED; needs a focused browser pass. |
| Home gap action → Catalog → clear → profile → Schema | Action should apply the expected filter; clear should reset filters; profile/schema should show stored fields. | None. | Demo: clicked Review assets needing metadata; Catalog opened with completeness `needs`. Clicked Clear filters; completeness reset to `all`, missing-field reset to `all`, search blank and 12 demo assets shown. Searched `customer_orders`, got 1 row, opened profile, selected Structure; 5 defined sample columns rendered. | Demo | PASS for the tested path. Other filter combinations, sorting, zero-results and keyboard behavior remain. |
| PostgreSQL separation | Failed authorization must not fall back to demo data. | None. | In anonymous preview, switched to Connected catalog. UI displayed Sign-in required, zero persisted records, and an explicit catalog-load error rather than showing demo records as persisted. | PostgreSQL mode / anonymous | PASS for anonymous error handling. Authorized PostgreSQL UI and write workflows remain BLOCKED without an authorized session. |
| Responsive layout | Critical controls should fit at mobile widths without horizontal page overflow. | None. | Chromium viewport checks at 390, 768, 1024 and 1440 CSS pixels. At 390 px, document/body scroll width was 568 px; `.top-actions` extended to x=568. At 768/1024/1440 px, document width matched viewport. | Demo | FAIL at 390 px; mobile header overflow needs owner review. Do not change shared CSS or `public/app.js` without coordination. |
| Export behavior | Exported rows/bytes should match the current filtered report. | None. | Existing controls were visible; no downloaded CSV bytes were captured in this pass. Prior tracker records count-level export checks only. | Demo | PARTIAL / NOT TESTED for actual file contents. |
| Safe section navigation smoke test | All safe main sections should render without a startup failure. | None. | Anonymous-preview browser loop navigated Home, All assets, Catalog & schemas, Catalog search, Lineage explorer, SQL analysis, Evidence & reasoning, Pipeline runs, Time travel, 3D observatory, Data quality, Incident console, Stewardship, Data Products, Preferences, Integrations & API, and User Profile. Each rendered its expected heading; no workspace-startup error was detected. Some sections correctly displayed paused/access-limited states. | Demo | PASS for page render/navigation only; not proof that each section's controls or backing workflows work. |

### Current source contract and coordination item

The current database table `kairos_column_lineage` has a `metadata JSONB` field, and the read API returns it. The UI currently checks SQL candidates in this order: top-level `sql`, top-level `transformation_sql`, `metadata.sql`, then `metadata.transformation_sql`. Proposed canonical contract: store source-derived SQL as `metadata.transformation_sql`, preserve `transformation` as a human-readable description, and use `evidence_ref` / provenance metadata to identify the source artifact. Compatibility aliases may be read during transition. This is a proposal, not yet an approved shared contract.

Before removing the illustrative SQL branch or changing the shared mapping contract, coordinate with Pranav / the Lineage Explorer owner. No application-code change was made in this audit.