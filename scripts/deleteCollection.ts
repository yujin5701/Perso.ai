// scripts/deleteCollection.ts
import { qdrant } from "../lib/qdrant";

async function main() {
  try {
    const COLLECTION = "qa_pairs_gemini"; // 삭제할 컬렉션 이름
    await qdrant.deleteCollection(COLLECTION);
    console.log(`🗑️ Collection '${COLLECTION}' deleted successfully.`);
  } catch (err) {
    console.error("❌ Failed to delete collection:", err);
  }
}

main();
