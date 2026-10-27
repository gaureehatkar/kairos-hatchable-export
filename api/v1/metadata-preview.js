import { db } from "hatchable";

export const access = "admin";
export const methods = ["POST"];

const SECRET_KEY = /(token|secret|password|credential|private.?key|api.?key)/i;
const COLLECTION_KEYS = ["records","items","data","results","rows","files","images","documents","assets","nodes","objects","entries"];
const ID_KEYS = ["id","uuid","uid","key","path","uri","url","name","title","filename","file_name"];
const TYPE_KEYS = ["asset_type","type","kind","resource_type"];

function safeCopy(value, depth=0) {
  if (depth > 8) return "[nested value omitted]";
  if (Array.isArray(value)) return value.slice(0,500).map(v=>safeCopy(v,depth+1));
  if (value && typeof value === "object") {
    const out = {};
    for (const [key,item] of Object.entries(value)) if (!SECRET_KEY.test(key)) out[key] = safeCopy(item,depth+1);
    return out;
  }
  if (value === null || ["string","number","boolean"].includes(typeof value)) return value;
  return String(value);
}
function recordsFrom(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [{value:payload}];
  for (const key of COLLECTION_KEYS) {
    const list=payload[key];
    if (Array.isArray(list) && list.every(item=>item && typeof item==="object" && !Array.isArray(item))) return list;
  }
  const candidates=Object.values(payload).filter(v=>Array.isArray(v)&&v.length&&v.every(item=>item&&typeof item==="object"&&!Array.isArray(item)));
  return candidates.length ? candidates.sort((a,b)=>b.length-a.length)[0] : [payload];
}
function identity(record,index) {
  for (const key of ID_KEYS) if (record[key] != null && String(record[key]).trim()) return String(record[key]).trim().slice(0,700);
  return "record-"+String(index+1).padStart(5,"0");
}
function assetType(record) {
  for (const key of TYPE_KEYS) if (record[key] != null && String(record[key]).trim()) return String(record[key]).trim().slice(0,120);
  const mime=record.mime_type||record.content_type;
  if (typeof mime==="string" && mime.includes("/")) {
    const prefix=mime.split("/")[0].trim().toLowerCase();
    if (["image","audio","video","text","font","model"].includes(prefix)) return prefix;
  }
  return "json_record";
}

export default async function(req,res) {
  const payload=req.body?.payload ?? req.body;
  const sourceName=String(req.body?.source_name||req.body?.source_system||"json_import").slice(0,120);
  if (!payload || typeof payload!=="object") return res.status(400).json({ok:false,error:"invalid_json_payload",message:"Send a JSON object or array of records."});
  const raw=recordsFrom(payload);
  if (raw.length>1000) return res.status(413).json({ok:false,error:"metadata_preview_too_large",message:"Preview supports up to 1,000 records per request."});
  const used=new Set(), fields=new Set(), types={}, assets=[];
  for (let i=0;i<raw.length;i++) {
    const original=raw[i] && typeof raw[i]==="object" && !Array.isArray(raw[i]) ? raw[i] : {value:raw[i]};
    const base=identity(original,i); let id=base, suffix=1;
    while(used.has(id)){suffix++;id=base+"#"+suffix;} used.add(id);
    const metadata=safeCopy(original);
    Object.keys(metadata).forEach(k=>fields.add(k));
    if (metadata.metadata && typeof metadata.metadata==="object" && !Array.isArray(metadata.metadata)) Object.keys(metadata.metadata).forEach(k=>fields.add(k));
    const name=String(original.name||original.title||original.path||original.filename||original.file_name||original.uri||original.url||id).slice(0,700);
    const type=assetType(original); types[type]=(types[type]||0)+1;
    assets.push({
      id:"json:"+id,
      name,
      qualified_name:sourceName+"/"+id,
      namespace:sourceName,
      source_system:sourceName,
      type,
      metadata:{...metadata,source_record_index:i,import_mode:"server_generic_json_preview"}
    });
  }
  const explicit=payload && !Array.isArray(payload) && Array.isArray(payload.relationships) ? payload.relationships : [];
  const relationships=explicit.slice(0,500).filter(r=>r&&typeof r==="object"&&!Array.isArray(r)).map(r=>safeCopy(r));
  const capabilities={
    asset_discovery:true,
    metadata_inspection:assets.length>0,
    relationships:relationships.length>0,
    schema_exploration:raw.some(r=>r&&typeof r==="object"&&["columns","schema","fields"].some(k=>k in r)),
    sql_analysis:raw.some(r=>r&&typeof r==="object"&&["sql","query_text","compiled_sql"].some(k=>k in r)),
    execution_history:raw.some(r=>r&&typeof r==="object"&&["run_id","run","execution_id"].some(k=>k in r))
  };
  return res.status(200).json({
    ok:true,source_system:sourceName,is_persistent:false,
    assets,relationships,
    summary:{asset_count:assets.length,relationship_count:relationships.length,discovered_fields:[...fields].sort(),asset_type_counts:types},
    capabilities,
    warnings:["PREVIEW_ONLY_NOT_PERSISTED","RELATIONSHIPS_ARE_PASSED_THROUGH_ONLY_NOT_INFERRED","SOURCE_FRESHNESS_NOT_VERIFIED"],
    next_step:"Review this preview, then submit a validated metadata_graph to /api/v1/ingest to persist assets and explicitly supplied relationships."
  });
}