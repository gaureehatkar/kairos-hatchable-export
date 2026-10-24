import { db } from "hatchable";
export const access = "admin";
export const methods = ["POST"];
const safe = (v, max=500) => String(v ?? "").slice(0,max);
const jsonText = v => JSON.stringify(v ?? {});
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
  if (kind === "openlineage_event") {
    const events = Array.isArray(payload) ? payload : [payload];
    const invalidIndex = events.findIndex(event => !event || typeof event !== "object" || Array.isArray(event) || !event.job || typeof event.job.name !== "string" || !event.job.name.trim() || !event.run || typeof event.run.runId !== "string" || !event.run.runId.trim());
    if (invalidIndex !== -1) return res.status(400).json({ok:false,error:"invalid_openlineage_event",message:"Every event must include job.name and run.runId. Invalid event at index "+invalidIndex+"."});
    if (!events.length) return res.status(400).json({ok:false,error:"empty_event_batch",message:"Choose a non-empty array of OpenLineage events."});
  }
  if (kind !== "dbt_manifest" && kind !== "openlineage_event") return res.status(400).json({ok:false,error:"unsupported_kind",message:"kind must be dbt_manifest or openlineage_event."});
  try {
    if (kind === "dbt_manifest") {
      const nodes = payload.nodes || {}, sources = payload.sources || {}, exposures = payload.exposures || {};
      const all = {...sources,...nodes,...exposures};
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
        const started=event.eventTime && !Number.isNaN(Date.parse(event.eventTime)) ? new Date(event.eventTime).toISOString() : null;
        await db.query("INSERT INTO kairos_pipeline_runs (id,pipeline_name,status,started_at,duration_ms,environment_name,asset_count,event_count,metadata) VALUES ($1,$2,$3,$4,NULL,$5,$6,$7,$8::jsonb) ON CONFLICT (id) DO UPDATE SET pipeline_name=EXCLUDED.pipeline_name,status=EXCLUDED.status,started_at=COALESCE(EXCLUDED.started_at,kairos_pipeline_runs.started_at),asset_count=GREATEST(kairos_pipeline_runs.asset_count,EXCLUDED.asset_count),event_count=kairos_pipeline_runs.event_count+EXCLUDED.event_count,metadata=kairos_pipeline_runs.metadata || EXCLUDED.metadata", [runId||("ol-event:"+Date.now()),jobName,status,started,event.environment||null,datasetMap.size,1,jsonText({source_system:"openlineage",job_namespace:namespace,event_type:eventType,producer:event.producer||null,inputs:inputs.map(x=>({namespace:x.namespace,name:x.name})),outputs:outputs.map(x=>({namespace:x.namespace,name:x.name})),event_time:event.eventTime||null})]);
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