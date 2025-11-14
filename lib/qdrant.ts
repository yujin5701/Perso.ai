import { QdrantClient } from "@qdrant/js-client-rest";

if (!process.env.QDRANT_URL) {
  throw new Error(
    "❌ QDRANT_URL is missing. Check your .env.local file (must look like https://xxxxx.qdrant.io)"
  );
}
if (!process.env.QDRANT_API_KEY) {
  throw new Error(
    "❌ QDRANT_API_KEY is missing. Check your .env.local file (get from Qdrant Cloud Dashboard)"
  );
}
export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

export const COLLECTION = process.env.QDRANT_COLLECTION || "qa_pairs";

export type QaPointPayload = {
  id: string;
  question: string;
  answer: string;
  row?: number;
  source?: string;
};

console.log(`🌐 Connected Qdrant endpoint: ${process.env.QDRANT_URL}`);
