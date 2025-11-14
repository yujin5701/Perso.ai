import { qdrant, COLLECTION } from "../lib/qdrant";

const VECTOR_SIZE = Number(process.env.VECTOR_SIZE || 1536);

async function resetQdrant() {
  console.log(`🗑️ Deleting '${COLLECTION}'...`);
  try {
    await qdrant.deleteCollection(COLLECTION);
  } catch {}
  console.log(`⚙️ Creating '${COLLECTION}' (${VECTOR_SIZE}-dim)...`);
  await qdrant.createCollection(COLLECTION, {
    vectors: { size: VECTOR_SIZE, distance: "Cosine" },
  });
  console.log(`✅ Ready for ingestion.`);
}

resetQdrant();
