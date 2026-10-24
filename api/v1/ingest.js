import { db } from "hatchable";
export const access = "admin";
export const methods = ["POST"];
const safe = (v, max=500) => String(v ?? "").slice(0,max);
const jsonText = v => JSON.stringify(v ?? {});
async function stableFingerprint(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}
async function upsertAsset({id,qualifiedName,schemaName,kind,type,owner,description,columnCount,metadata}) {
  const result = await db.query(
    "INSERT INTO kairos_assets (id, qualified_name, schema_name, asset_kind, asset_type, owner_name, description, column_count, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb) ON CONFLICT (qualified_name) DO UPDATE SET schema_name=EXCLUDED.schema_name, asset_kind=EXCLUDED.asset_kind, asset_type=EXCLUDED.asset_type, owner_name=EXCLUDED.owner_name, description=EXCLUDED.description, column_count=EXCLUDED.column_count, metadata=EXCLUDED.metadata, updated_at=now() RETURNING id, qualified_name",
    [id,qualifiedName,schemaName,kind,type,owner||null,description||null,columnCount||0,jsonText(metadata)]
  );
  return result.rows?.[0] || {id, qualified_name:qualifiedName};
}
export default async function (req, res) {
  const body = req.body || {};
  const kind = body.kind;
  const payload = body.payload;
  if (!payload || typeof payload !== "object" || (Array.isArray(payload) && kind !== "openlineage_event")) return res.status(400).json({ok:false,error:"invalid_payload",message:kind === "openlineage_event" ? "Provide one OpenLineage event object or an array of event objects." : "Provide a JSON object in payload."});
  if (kind === "dbt_manifest") {
    const hasManifestSections = ["nodes","sources","exposures"].some(key => payload[key] && typeof payload[key] === "object" && !Array.isArray(payload[key]));
    if (!hasManifestSections) return res.status(400).json({ok:false,error:"invalid_dbt_manifest",message:"This does not look like a dbt manifest. Expected at least one object section: nodes, sources, or exposures."});
  }
  if (kind === "metadata_graph") {
    if (!Array.isArray(payload.assets) || !Array.isArray(payload.relationships || [])) return res.status(400).json({ok:false,error:"invalid_metadata_graph",message:"Provide assets: [] and relationships: [] arrays. Each asset needs a stable id and name; each relationship needs source and target asset IDs."});
    const relationships = payload.relationships || [];
    if (payload.assets.length > 1000 || relationships.length > 5000) return res.status(413).json({ok:false,error:"metadata_graph_too_large",message:"A generic metadata import is limited to 1,000 assets and 5,000 relationships per request. Split larger imports into smaller batches."});
    const invalidAsset = payload.assets.findIndex(a => !a || typeof a !== "object" || Array.isArray(a) || !String(a.id||"").trim() || !String(a.name||a.qualified_name||"").trim());
    if (invalidAsset !== -1) return res.status(400).json({ok:false,error:"invalid_metadata_asset",message:"Each asset must have id and name (or qualified_name). Invalid asset at index "+invalidAsset+"."});
    const ids = new Set(payload.assets.map(a=>String(a.id).trim()));
    if (ids.size !== payload.assets.length) return res.status(400).json({ok:false,error:"duplicate_metadata_asset_id",message:"Each asset id must be unique within the import batch."});
    const qualifiedNames = payload.assets.map(a=>String(a.qualified_name||((String(a.namespace||a.domain||a.provider||"general").trim()?String(a.namespace||a.domain||a.provider||"general").trim()+"/":"")+String(a.name||a.qualified_name||"").trim())).trim());
    if (new Set(qualifiedNames).size !== qualifiedNames.length) return res.status(400).json({ok:false,error:"duplicate_metadata_qualified_name",message:"Each asset must resolve to a unique qualified_name within the import batch. Duplicate names would otherwise merge distinct assets."});
    const invalidRelationship = relationships.findIndex(e => !e || typeof e !== "object" || Array.isArray(e) || !String(e.source_id||"").trim() || !String(e.target_id||"").trim());
    if (invalidRelationship !== -1) return res.status(400).json({ok:false,error:"invalid_metadata_relationship",message:"Each relationship must have source_id and target_id. Invalid relationship at index "+invalidRelationship+"."});
    const missingEndpoint = relationships.findIndex(e => !ids.has(String(e.source_id).trim()) || !ids.has(String(e.target_id).trim()));
    if (missingEndpoint !== -1) return res.status(400).json({ok:false,error:"unknown_metadata_relationship_endpoint",message:"Every relationship endpoint must reference an asset included in this import batch. Invalid relationship at index "+missingEndpoint+"."});
    const invalidEvidence = relationships.findIndex(e => e.evidence != null && (typeof e.evidence !== "object" || Array.isArray(e.evidence)));
    if (invalidEvidence !== -1) return res.status(400).json({ok:false,error:"invalid_relationship_evidence",message:"Attached relationship evidence must be a JSON object. Invalid relationship at index "+invalidEvidence+"."});
    const allowedEvidenceStates = new Set(["OBSERVED","REFUTED_FOR_RUN","POSSIBLE","UNKNOWN"]);
    const invalidEvidenceState = relationships.findIndex(e => e.evidence?.state != null && !allowedEvidenceStates.has(String(e.evidence.state).toUpperCase()));
    if (invalidEvidenceState !== -1) return res.status(400).json({ok:false,error:"invalid_evidence_state",message:"Evidence state must be one of OBSERVED, REFUTED_FOR_RUN, POSSIBLE, or UNKNOWN. Invalid evidence at relationship index "+invalidEvidenceState+"."});
    const invalidRefutation = relationships.findIndex(e => String(e.evidence?.state||"").toUpperCase()==="REFUTED_FOR_RUN" && (!String(e.evidence.run_id||"").trim() || !String(e.evidence.coverage||"").trim() || e.evidence.metadata?.complete_negative_evaluation !== true));
    if (invalidRefutation !== -1) return res.status(400).json({ok:false,error:"incomplete_refutation_scope",message:"REFUTED_FOR_RUN requires a run_id, explicit coverage, and evidence.metadata.complete_negative_evaluation=true. Missing events alone are not a refutation."});
  }
  if (kind === "openlineage_event") {
    const events = Array.isArray(payload) ? payload : [payload];
    if (!events.length) return res.status(400).json({ok:false,error:"empty_event_batch",message:"Choose a non-empty array of OpenLineage events."});
    if (events.length > 100) return res.status(413).json({ok:false,error:"openlineage_batch_too_large",message:"An OpenLineage import is limited to 100 events per request. Split larger imports into smaller batches."});
    const invalidIndex = events.findIndex(event => !event || typeof event !== "object" || Array.isArray(event) || !event.job || typeof event.job.name !== "string" || !event.job.name.trim() || !event.run || typeof event.run.runId !== "string" || !event.run.runId.trim());
    if (invalidIndex !== -1) return res.status(400).json({ok:false,error:"invalid_openlineage_event",message:"Every event must include job.name and run.runId. Invalid event at index "+invalidIndex+"."});
  }
  if (kind !== "dbt_manifest" && kind !== "openlineage_event" && kind !== "metadata_graph") return res.status(400).json({ok:false,error:"unsupported_kind",message:"kind must be dbt_manifest, openlineage_event, or metadata_graph."});
  try {
    if (kind === "metadata_graph") {
      const assets = payload.assets || [], relationships = payload.relationships || [], idMap = new Map();
      let assetsUpserted=0, edgesUpserted=0, evidenceUpserted=0, skipped=0;
      for (const a of assets) {
        const externalId=safe(String(a.id).trim(),900), name=safe(String(a.name||a.qualified_name).trim(),900), namespace=safe(a.namespace||a.domain||a.provider||"general",300);
        const qualifiedName=safe(a.qualified_name||((namespace?namespace+"/":"")+name),1200);
        const type=safe(a.type||a.asset_type||a.kind||"asset",120), kindValue=safe(a.kind||"asset",80);
        const metadata={...(a.metadata&&typeof a.metadata==="object"?a.metadata:{}),source_system:safe(a.source_system||payload.source_system||"generic_metadata",100),external_id:externalId,namespace,resource_type:type,format:a.format||null,uri:a.uri||a.path||null,columns:Array.isArray(a.columns)?a.columns:undefined};
        const persisted=await upsertAsset({id:safe("generic:"+externalId,1200),qualifiedName,schemaName:namespace,kind:kindValue,type,owner:a.owner||null,description:a.description||null,columnCount:Array.isArray(a.columns)?a.columns.length:Number(a.column_count||0),metadata});
        idMap.set(externalId,{id:persisted.id,qualifiedName}); assetsUpserted++;
      }
      for (const rel of relationships) {
        const source=idMap.get(String(rel.source_id).trim()), target=idMap.get(String(rel.target_id).trim());
        if (!source || !target) { skipped++; continue; }
        const edgeType=safe(rel.type||rel.relationship_type||"dependency",100), edgeId=safe("generic-edge:"+source.id+"->"+target.id+":"+edgeType,1800);
        const evidenceRef=rel.evidence_id?safe(rel.evidence_id,500):null;
        const metadata={source_system:safe(rel.source_system||payload.source_system||"generic_metadata",100),relationship_type:edgeType,activity:rel.activity||null,confidence:rel.confidence??null,description:rel.description||null,provenance:rel.provenance||"Supplied relationship metadata; not independently verified execution proof",external_metadata:rel.metadata||{}};
        await db.query("INSERT INTO kairos_lineage_edges (id,source_asset_id,target_asset_id,edge_type,evidence_ref,metadata) VALUES ($1,$2,$3,$4,$5,$6::jsonb) ON CONFLICT (source_asset_id,target_asset_id,edge_type) DO UPDATE SET evidence_ref=EXCLUDED.evidence_ref,metadata=EXCLUDED.metadata",[edgeId,source.id,target.id,edgeType,evidenceRef,jsonText(metadata)]);
        edgesUpserted++;
        if (rel.evidence && typeof rel.evidence==="object") {
          const ev=rel.evidence, evId=safe(ev.id||"generic-evidence:"+edgeId,1800);
          await db.query("INSERT INTO kairos_evidence (id,source_name,target_name,state,evidence_type,run_id,coverage,rule_name,explanation,valid_from,valid_to,recorded_from,metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now(),$12::jsonb) ON CONFLICT (id) DO UPDATE SET state=EXCLUDED.state,evidence_type=EXCLUDED.evidence_type,explanation=EXCLUDED.explanation,metadata=EXCLUDED.metadata",[evId,source.qualifiedName,target.qualifiedName,safe(ev.state||"UNKNOWN",40),safe(ev.type||rel.source_system||payload.source_system||"supplied_metadata",120),ev.run_id||null,ev.coverage||null,ev.rule_name||null,safe(ev.explanation||"Evidence supplied with generic metadata; inspect its scope before drawing conclusions.",2000),ev.valid_from||null,ev.valid_to||null,jsonText({source_system:payload.source_system||"generic_metadata",relationship_id:edgeId,details:ev.metadata||{}})]);
          evidenceUpserted++;
        }
      }
      return res.status(200).json({ok:true,kind,source:payload.source_system||"generic_metadata",assets_upserted:assetsUpserted,relationships_upserted:edgesUpserted,evidence_upserted:evidenceUpserted,relationships_skipped:skipped,disclosure:"Generic assets and supplied relationships were stored without SQL parsing. Relationship records are not automatically proof of runtime execution; inspect attached evidence and scope."});
    }
    if (kind === "dbt_manifest") {
      const nodes = payload.nodes || {}, sources = payload.sources || {}, exposures = payload.exposures || {};
      const all = {...sources,...nodes,...exposures};
      const sourceRecordId=safe([payload.metadata?.generated_at||crypto.randomUUID(),payload.metadata?.project_name||payload.metadata?.project_id||"unknown"].join(":"),1000);
      await db.query("INSERT INTO kairos_raw_events (id,source_system,source_record_id,event_type,event_time,payload) VALUES ($1,'dbt_manifest',$2,'MANIFEST',$3,$4::jsonb) ON CONFLICT (source_system,source_record_id) DO NOTHING", [safe("raw:dbt:"+sourceRecordId,1200),sourceRecordId,payload.metadata?.generated_at && !Number.isNaN(Date.parse(payload.metadata.generated_at)) ? new Date(payload.metadata.generated_at).toISOString() : null,jsonText(payload)]);
      const uidToAsset = new Map();
      let assetsCreated = 0, edgesCreated = 0, skipped = 0;
      for (const [uid,n] of Object.entries(all)) {
        if (!n || !n.name) { skipped++; continue; }
        const resource = safe(n.resource_type || (sources[uid] ? "source" : exposures[uid] ? "exposure" : "model"),80);
        const schema = safe(n.schema || n.package_name || "dbt",200);
        const database = safe(n.database || "",200);
        const relation = safe(n.alias || n.name,300);
        const qualifiedName = safe([database,schema,relation].filter(Boolean).join("."),900);
        const assetId = safe("dbt:"+uid,900);
        const cols = n.columns && typeof n.columns === "object" ? Object.keys(n.columns) : [];
        const kindValue = resource === "source" ? "source" : (resource === "exposure" || resource === "semantic_model" ? "output" : "transform");
        const metadata = {source_system:"dbt",unique_id:uid,resource_type:resource,package_name:n.package_name||null,original_file_path:n.original_file_path||null,raw_code_hash:n.raw_code_hash||null,columns:n.columns||{},tags:n.tags||[],depends_on:n.depends_on?.nodes||[],manifest_metadata:{dbt_version:payload.metadata?.dbt_version||null,generated_at:payload.metadata?.generated_at||null,manifest_version:payload.metadata?.manifest_version||null}};
        const persistedAsset=await upsertAsset({id:assetId,qualifiedName,schemaName:schema,kind:kindValue,type:"dbt "+resource,owner:n.meta?.owner||n.owner||null,description:n.description||null,columnCount:cols.length,metadata});
        uidToAsset.set(uid,{id:persistedAsset.id,qualifiedName,uid});
        assetsCreated++;
      }
      for (const [uid,n] of Object.entries(all)) {
        const target=uidToAsset.get(uid);
        if (!target) continue;
        for (const depUid of (n.depends_on?.nodes||[])) {
          const source=uidToAsset.get(depUid);
          if (!source) { skipped++; continue; }
          const edgeId=safe("dbt-edge:"+depUid+"->"+uid,1800);
          await db.query("INSERT INTO kairos_lineage_edges (id,source_asset_id,target_asset_id,edge_type,evidence_ref,metadata) VALUES ($1,$2,$3,'static_candidate',$4,$5::jsonb) ON CONFLICT (source_asset_id,target_asset_id,edge_type) DO UPDATE SET evidence_ref=EXCLUDED.evidence_ref,metadata=EXCLUDED.metadata", [edgeId,source.id,target.id,"dbt:"+uid,jsonText({source_system:"dbt_manifest",source_unique_id:depUid,target_unique_id:uid,provenance:"declared dependency; not run-specific execution proof"})]);
          edgesCreated++;
        }
      }
      return res.status(200).json({ok:true,kind,source:"dbt_manifest",assets_upserted:assetsCreated,edges_upserted:edgesCreated,skipped,disclosure:"dbt manifest dependencies are declared/static lineage, not proof that a dependency executed in a specific run."});
    }
    if (kind === "openlineage_event") {
      const events = Array.isArray(payload) ? payload : [payload];
      let assetsUpserted=0, runsUpserted=0, explicitEdges=0, skipped=0;
      for (const event of events) {
        if (!event || typeof event !== "object" || !event.job || !event.run) { skipped++; continue; }
        const runId=safe(event.run.runId,300), jobName=safe(event.job.name,500), namespace=safe(event.job.namespace||"unknown",500);
        const eventType=safe(event.eventType||"OTHER",40).toUpperCase();
        const inputs=Array.isArray(event.inputs)?event.inputs:[], outputs=Array.isArray(event.outputs)?event.outputs:[];
        const eventTime=event.eventTime && !Number.isNaN(Date.parse(event.eventTime)) ? new Date(event.eventTime).toISOString() : null;
        const fingerprint=await stableFingerprint(event);
        const sourceRecordId=safe("event:"+fingerprint,1000);
        const rawInsert=await db.query("INSERT INTO kairos_raw_events (id,source_system,source_record_id,event_type,event_time,payload) VALUES ($1,'openlineage',$2,$3,$4,$5::jsonb) ON CONFLICT (source_system,source_record_id) DO NOTHING RETURNING id", [safe("raw:openlineage:"+fingerprint,1200),sourceRecordId,eventType,eventTime,jsonText(event)]);
        if (!rawInsert.rows?.length) { skipped++; continue; }
        const datasetMap=new Map();
        for (const [direction,list] of [["input",inputs],["output",outputs]]) {
          for (const d of list) {
            if (!d || !d.name) { skipped++; continue; }
            const ns=safe(d.namespace||"unknown",500), name=safe(d.name,700), qn=safe("openlineage://"+ns+"/"+name,1200);
            const id=safe("ol:"+ns+":"+name,1200), schema=safe(ns,500);
            const persistedAsset=await upsertAsset({id,qualifiedName:qn,schemaName:schema,kind:direction==="input"?"source":"output",type:"OpenLineage dataset",owner:null,description:null,columnCount:Array.isArray(d.facets?.schema?.fields)?d.facets.schema.fields.length:0,metadata:{source_system:"openlineage",namespace:ns,dataset_name:name,direction,facets:d.facets||{},last_run_id:runId,job_namespace:namespace,job_name:jobName}});
            datasetMap.set(ns+"/"+name,{id:persistedAsset.id,qualifiedName:qn}); assetsUpserted++;
          }
        }
        const status=eventType==="COMPLETE"?"SUCCESS":eventType==="FAIL"?"FAILED":eventType==="START"?"RUNNING":"WARNING";
        const started=eventType==="START" && event.eventTime && !Number.isNaN(Date.parse(event.eventTime)) ? new Date(event.eventTime).toISOString() : null;
        await db.query("INSERT INTO kairos_pipeline_runs (id,pipeline_name,status,started_at,duration_ms,environment_name,asset_count,event_count,metadata) VALUES ($1,$2,$3,$4,NULL,$5,$6,$7,$8::jsonb) ON CONFLICT (id) DO UPDATE SET pipeline_name=EXCLUDED.pipeline_name,status=CASE WHEN EXCLUDED.metadata->>'event_time' IS NOT NULL AND (kairos_pipeline_runs.metadata->>'event_time' IS NULL OR EXCLUDED.metadata->>'event_time'>=kairos_pipeline_runs.metadata->>'event_time') THEN EXCLUDED.status ELSE kairos_pipeline_runs.status END,started_at=COALESCE(kairos_pipeline_runs.started_at,EXCLUDED.started_at),asset_count=GREATEST(kairos_pipeline_runs.asset_count,EXCLUDED.asset_count),event_count=kairos_pipeline_runs.event_count+EXCLUDED.event_count,metadata=CASE WHEN EXCLUDED.metadata->>'event_time' IS NOT NULL AND (kairos_pipeline_runs.metadata->>'event_time' IS NULL OR EXCLUDED.metadata->>'event_time'>=kairos_pipeline_runs.metadata->>'event_time') THEN kairos_pipeline_runs.metadata || EXCLUDED.metadata ELSE kairos_pipeline_runs.metadata END", [runId||("ol-event:"+Date.now()),jobName,status,started,event.environment||null,datasetMap.size,1,jsonText({source_system:"openlineage",job_namespace:namespace,event_type:eventType,producer:event.producer||null,inputs:inputs.map(x=>({namespace:x.namespace,name:x.name})),outputs:outputs.map(x=>({namespace:x.namespace,name:x.name})),event_time:eventTime})]);
        runsUpserted++;
        // Do not connect every input to every output. OpenLineage event boundaries alone do not prove pairwise dependencies.
        // Explicit job lineage facets can be added once their version-specific schema is validated.
      }
      return res.status(200).json({ok:true,kind,source:"openlineage",events_received:events.length,assets_upserted:assetsUpserted,runs_upserted:runsUpserted,explicit_edges_created:explicitEdges,skipped,disclosure:"Run events and dataset boundary metadata were stored. No pairwise lineage edges were invented from an event's input/output lists."});
    }
    return res.status(400).json({ok:false,error:"unsupported_kind",message:"kind must be dbt_manifest or openlineage_event."});
  } catch (error) {
    return res.status(500).json({ok:false,error:"ingestion_failed",message:"Import failed before a reliable result could be returned."});
  }
}