import path from "path";
import fs from "fs";
import Papa from "papaparse";
import { embedText } from "../lib/embed";
import { qdrant, COLLECTION } from "../lib/qdrant";


const CSV_PATH = path.resolve(process.cwd(), "data/clean_qa_pairs.csv");
const SIM_THRESHOLD = Number(process.env.SIM_THRESHOLD ?? 0.75);
const GAP_THRESHOLD = Number(process.env.GAP_THRESHOLD ?? 0.02);

function cosineSim(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

async function evaluate() {
  const csv = fs.readFileSync(CSV_PATH, "utf8");
  const data = Papa.parse(csv, { header: true }).data as any[];
  const testSet = data.slice(Math.floor(data.length * 0.8));

  let correct = 0;
  let uncertain = 0;

  for (const row of testSet) {
    const query = row.question?.trim();
    const trueAnswer = row.answer?.trim();
    if (!query || !trueAnswer) continue;

    const qEmb = await embedText(`${query}`);

    const results = await qdrant.search(COLLECTION, {
      vector: qEmb,
      limit: 3,
      with_payload: true,
    });

    if (!results || results.length === 0) continue;

    const [best, second] = results;
    const bestScore = best.score ?? 0;
    const secondScore = second?.score ?? 0;
    const gap = bestScore - secondScore;
    const payload = best.payload as any;
    const predAnswer = payload?.answer ?? "";

    const trueEmb = await embedText(trueAnswer);
    const predEmb = await embedText(predAnswer);
    const sim = cosineSim(trueEmb, predEmb);

    if (bestScore >= SIM_THRESHOLD && gap >= GAP_THRESHOLD && sim > 0.9) {
      correct++;
    } else if (gap < GAP_THRESHOLD) {
      uncertain++;
    }
  }

  const acc = correct / testSet.length;
  console.log(`✅ 의미기반 정확도(Semantic@1): ${(acc * 100).toFixed(1)}%`);
  console.log(`⚖️ 모호한 결과 비율: ${((uncertain / testSet.length) * 100).toFixed(1)}%`);
}

evaluate().catch(console.error);
