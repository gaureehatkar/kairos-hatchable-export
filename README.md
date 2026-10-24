# Kairos Metadata Lineage — implementation backlog

## Product contract
Kairos is a technology-neutral metadata lineage, evidence, and temporal reasoning system. SQL is one optional parser/provider, never the canonical asset or relationship model. Do not infer execution from a declared dependency or from the absence of events. Do not blend synthetic demo records into the persisted catalog.

## Priority backlog

### P0 — Generic metadata ingestion and safe canonical model
- [x] Add generic `metadata_graph` ingestion for typed assets and explicitly supplied relationships.
- [x] Support file, directory, script, API, dataset, model artifact, table, job, and workflow-task asset types via metadata.
- [x] Preserve source system, external ID, namespace, URI/path, format, relationship type, activity, provenance and metadata.
- [x] Permit attached evidence on relationships while preserving four-state semantics and run scope.
- [ ] Add idempotency and stronger external-ID/qualified-name collision handling.
- [ ] Add transactional batch writes and rollback on failure.
- [ ] Add payload size/count limits, stronger validation and import preview/dry-run.

### P0 — Canonical lineage graph
- [ ] In PostgreSQL mode, render persisted assets/edges only; never synthetic graph records.
- [ ] Use stable asset/edge IDs in UI and remove fuzzy evidence-to-edge matching for authoritative provenance.
- [ ] Render assets and activities as separate generic node types; support reads, writes, transforms, produces, consumes, trains, calls, depends_on.
- [ ] Show source/provider and evidence state without implying SQL is required.
- [ ] Add persisted empty states and import links.

### P1 — Multi-source adapters
- [x] Generic JSON graph importer initial implementation (harden next).
- [x] Existing OpenLineage run/dataset event importer (conservative about pairwise edges).
- [x] Existing dbt manifest importer (declared/static dependencies clearly disclosed).
- [x] File inventory JSON adapter (relative paths, hashes, formats, sizes, modification times, directory membership; does not read file contents and explicitly warns that membership is not data-flow lineage).
- [ ] Python lineage adapter (explicit read/write declarations or instrumentation; static inference labelled candidate).
- [ ] Workflow/ETL adapters and API/ML artifact metadata.
- [ ] SQLGlot as one provider, never the canonical model.

### P1 — Evidence and reasoning
- [ ] Stable evidence IDs and explicit edge references, provenance, coverage, run scope, confidence semantics.
- [ ] Validate OBSERVED, REFUTED_FOR_RUN, POSSIBLE, UNKNOWN; refutation requires complete run-scoped coverage.
- [ ] Inspect evidence from any asset/relationship.
- [ ] Tests ensure missing events remain UNKNOWN without a complete negative-evaluation contract.

### P1 — Temporal correctness
- [ ] Define valid time vs recorded time for assets, relationships, and evidence.
- [ ] Reconstruct historical graph from temporally versioned relationships, not only filter evidence rows.
- [ ] Add as-of, boundary, correction/backfill, and recorded-history tests.
- [ ] Integrate the intended temporal engine/provider (PyTemporal if selected) behind an adapter; temporal semantics stay independent of data format/parser.

### P2 — Field lineage and UX
- [ ] Generic field lineage for CSV/Parquet/JSON fields and database columns.
- [ ] Progressive reveal: asset-level graph first; fields only on request.
- [ ] Node/edge inspector with type, path, activity, evidence, run, valid time, recorded time, provider.
- [ ] Upstream/downstream expansion, depth limits, search, reset, keyboard access, responsive layout, export.
- [ ] Keep SQL analysis contextual under Lineage, not the primary workflow.

### P2 — Reliability and delivery
- [ ] Test file-only, Python-only, API-only, SQL-only and mixed-source graphs.
- [ ] API tests for malformed payloads, duplicate IDs, missing/unknown endpoints and attached evidence.
- [ ] Browser test import → catalog → graph → edge evidence → temporal view.
- [ ] Track import counts, skipped rows, validation failures and per-record errors.
- [ ] Confirm sharing/auth settings before wider release; never expose credentials or private metadata.

## Generic metadata graph payload v1
```json
{
  "kind": "metadata_graph",
  "payload": {
    "source_system": "python-instrumentation",
    "assets": [
      {"id":"file:customers.csv","name":"customers.csv","type":"file","uri":"data/customers.csv","format":"csv"},
      {"id":"file:features.parquet","name":"features.parquet","type":"file","uri":"out/features.parquet","format":"parquet"},
      {"id":"job:feature-build","name":"build_features","type":"python_job"}
    ],
    "relationships": [
      {"source_id":"file:customers.csv","target_id":"job:feature-build","type":"consumed_by","activity":"read"},
      {"source_id":"job:feature-build","target_id":"file:features.parquet","type":"produces","activity":"write","evidence":{"state":"OBSERVED","type":"instrumented_io","explanation":"Read/write event from the identified run.","run_id":"run-123"}}
    ]
  }
}
```

This accepts general metadata without SQL parsing. Supplied edges without attached evidence are stored as supplied relationship metadata, not automatically treated as proof of execution.