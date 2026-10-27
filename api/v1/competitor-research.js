export const access = "admin";
export const methods = ["GET"];

const findings = [
  {
    name:"DataHub",
    category:"Metadata platform / direct competitor",
    pattern:"Entity identity plus extensible metadata aspects; ingestion supports source adapters and metadata proposals.",
    kairos_implication:"Keep stable asset identity separate from source-specific metadata. Add connectors incrementally and preserve unfamiliar safe fields.",
    official_sources:["https://docs.datahub.com/docs/metadata-modeling/metadata-model","https://docs.datahub.com/docs/architecture/metadata-ingestion"]
  },
  {
    name:"OpenMetadata",
    category:"Metadata platform / direct competitor",
    pattern:"Asset detail pages and tabs vary according to the asset type and the information available.",
    kairos_implication:"Use a shared inspector shell with capability-gated schema, lineage, quality, execution, and governance sections.",
    official_sources:["https://docs.open-metadata.org/v1.12.x/how-to-guides/guide-for-data-users/data-asset-tabs","https://docs.open-metadata.org/how-to-guides/data-discovery/preview"]
  },
  {
    name:"OpenLineage / Marquez",
    category:"Lineage event model / adjacent project",
    pattern:"Standard job, run, and dataset concepts with extensible facets for additional metadata.",
    kairos_implication:"Preserve event provenance and separate declared relationships from execution evidence. Missing events are not negative proof.",
    official_sources:["https://openlineage.io/docs/spec/facets/","https://marquezproject.ai/"]
  },
  {
    name:"Open Data Hub",
    category:"Open data discovery platform / adjacent pattern",
    pattern:"Dataset discovery and data-access APIs separate catalog metadata from access paths.",
    kairos_implication:"Keep discovery/retrieval adapters separate from UI rendering; normalize API records before display.",
    official_sources:["https://docs.opendatahub.com/"]
  },
  {
    name:"OpenMeter",
    category:"Usage metering and billing / not a like-for-like catalog competitor",
    pattern:"Focuses on usage metering and billing rather than universal asset discovery and lineage.",
    kairos_implication:"Borrow usage-metering patterns only where relevant; do not benchmark it as a direct metadata catalog equivalent.",
    official_sources:["https://openmeter.io/docs/get-started/overview"]
  }
];

export default async function(req,res) {
  return res.status(200).json({
    ok:true,
    title:"Competitor architecture research: universal metadata and asset-adaptive workspaces",
    prepared_at:"2026-10-27",
    status:"research_and_design_guidance_not_implementation_claim",
    core_recommendation:"Use a source-neutral asset contract, preserve safe source-specific metadata, accept only explicit or independently supported relationships, and render features according to actual capabilities.",
    principles:[
      "Stable asset identity with source, qualified name, type, and timestamps when available.",
      "Extensible metadata preserves unfamiliar source fields instead of requiring a new fixed schema.",
      "Relationships must be source-supplied or produced by a supported analyzer; never infer lineage from names alone.",
      "Capability-driven UI: hide or disable unsupported schema, lineage, quality, run, evidence, and history views.",
      "Keep synthetic fixtures visibly separate from connected-source records.",
      "An empty source must remain empty; do not fill it with demo data.",
      "Filter obvious credential-like fields from previews and UI payloads.",
      "Separate source discovery from rendering and persistence."
    ],
    current_kairos_boundary:{
      generic_json_preview:true,
      generic_metadata_graph_import:true,
      persistent_catalog:true,
      arbitrary_authenticated_live_connectors:false,
      scheduled_scans_for_arbitrary_systems:false,
      universal_sql_or_lineage_inference:false,
      relationships_inferred_from_names:false
    },
    roadmap:[
      "Define and version a common asset/relationship contract.",
      "Maintain a connector capability registry and per-adapter acceptance tests.",
      "Add real adapters incrementally (for example dbt and OpenLineage first, then explicitly selected sources).",
      "Test structurally different datasets such as image/file inventory, workflow/job metadata, and SQL catalog metadata.",
      "Verify provenance, secret filtering, empty states, duplicate IDs, and no fabricated relationships."
    ],
    findings
  });
}