import dotenv from "dotenv";
import path from "path";
import OpenAI from "openai";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function embedText(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("❌ OPENAI_API_KEY is missing in .env.local");
  }

  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  const embedding = response.data[0].embedding;
  console.log("🧠 Embedding length:", embedding.length);

  return embedding;
}
