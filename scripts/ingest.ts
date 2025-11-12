import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import Papa from "papaparse";
import { qdrant, COLLECTION } from "../lib/qdrant";
import { embedText } from "../lib/embed";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const CSV_PATH = path.resolve(process.cwd(), "data/clean_qa_pairs.csv");
const VECTOR_SIZE = 1536;

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?.!]/g, "")
    .replace(/[\r\n]/g, "")
    .trim();
}

async function ensureCollection() {
  try {
    await qdrant.getCollection(COLLECTION);
    console.log(`ℹ️ Collection '${COLLECTION}' already exists.`);
  } catch {
    console.log(`⚙️ Creating collection '${COLLECTION}'...`);
    await qdrant.createCollection(COLLECTION, {
      vectors: { size: VECTOR_SIZE, distance: "Cosine" },
    });
    console.log(`✅ Collection '${COLLECTION}' created.`);
  }
}

async function main() {
  await ensureCollection();

  const csv = fs.readFileSync(CSV_PATH, "utf8");
  const rows = Papa.parse(csv, { header: true }).data as any[];

  for (const row of rows) {
    const id = Number(row.id);
    const question = row.question ? normalizeText(row.question) : "";
    const answer = row.answer?.trim();

    if (!id || !question || !answer) continue;

    const emb = await embedText(`${question}\n${answer}`);

    await qdrant.upsert(COLLECTION, {
      points: [
        {
          id,
          vector: emb,
          payload: { id, question, answer },
        },
      ],
    });

    console.log(`✅ Uploaded: ${id} (${question.slice(0, 30)}...)`);
  }

  console.log("🎉 Ingestion complete.");
}

main().catch((err) => {
  console.error("❌ Ingestion failed:", err);
});
