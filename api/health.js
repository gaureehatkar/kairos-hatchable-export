import { db } from "hatchable";
export const access = "public";
export const methods = ["GET"];
export default async function (req, res) {
  try {
    const result = await db.query("SELECT current_timestamp AS server_time");
    res.json({ok:true,service:"kairos-metadata-dashboard",database:"reachable",server_time:result.rows?.[0]?.server_time??null,mode:"prototype"});
  } catch (error) {
    res.status(503).json({ok:false,service:"kairos-metadata-dashboard",database:"unavailable",mode:"prototype"});
  }
}