import dotenv from "dotenv";
import path from "path";
import { qdrant, COLLECTION } from "../lib/qdrant";


async function main() {
  console.log("🌐 Connected to Qdrant");
  console.log(`📦 Checking collection: ${COLLECTION}`);

  const scroll = await qdrant.scroll(COLLECTION, { limit: 3, with_payload: true });

  console.log("🧩 Sample points from Qdrant:");
  scroll.points.forEach((p) => {
    console.log(JSON.stringify(p.payload, null, 2));
  });
}

main().catch(console.error);
