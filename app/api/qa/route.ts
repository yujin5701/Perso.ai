import { NextResponse } from "next/server";
import { qdrant } from "@/lib/qdrant";
import { embedText } from "@/lib/embed";

const SIM_THRESHOLD = Number(process.env.SIM_THRESHOLD ?? 0.6);
const GAP_THRESHOLD = Number(process.env.GAP_THRESHOLD ?? 0.02);
const COLLECTION = process.env.QDRANT_COLLECTION!;

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?.!]/g, "") 
    .replace(/[\r\n]/g, "")
    .trim();
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ answer: "❌ 질문이 비어 있습니다." });
    }

    const rawQuery = query;
    const normalizedQuery = normalizeText(rawQuery);

    console.log("───────────────────────────────────────────────");
    console.log("🔍 User query:", rawQuery);
    console.log("🔍 Normalized:", normalizedQuery);

    const vector = await embedText(normalizedQuery);
    console.log("🧠 Embedding length:", vector.length);

    // 🔎 2️⃣ Qdrant 검색
    const results = await qdrant.search(COLLECTION, {
      vector,
      limit: 3,
      with_payload: true,
    });

    if (!results || results.length === 0) {
      console.log("⚠️ Qdrant returned no results.");
      return NextResponse.json({
        answer: "데이터베이스에서 관련 정보를 찾지 못했습니다 😢",
        score: 0,
      });
    }

    const [best, second] = results;
    const bestScore = best?.score ?? 0;
    const secondScore = second?.score ?? 0;
    const gap = bestScore - secondScore;
    const payload = best?.payload as any;

    console.log("🧠 Best match:", JSON.stringify(payload, null, 2));
    console.log("🧮 Score:", bestScore.toFixed(4));
    console.log("⚖️ Gap:", gap.toFixed(4));

    if (bestScore < SIM_THRESHOLD) {
      console.log(`⚠️ Low similarity (${bestScore} < ${SIM_THRESHOLD})`);
      return NextResponse.json({
        answer: "질문이 데이터와 일치하지 않습니다 😢\n좀 더 구체적으로 물어보세요!",
        score: bestScore,
      });
    }

    if (gap < GAP_THRESHOLD) {
      console.log(`⚠️ Ambiguous match (gap ${gap} < ${GAP_THRESHOLD})`);
      return NextResponse.json({
        answer: "비슷한 질문이 여러 개 있습니다 😅\n조금 더 구체적으로 물어보세요.",
        score: bestScore,
      });
    }

    console.log("✅ Returning best match answer.");
    return NextResponse.json({
      answer: payload.answer ?? "답변이 누락되었습니다 😢",
      score: bestScore,
    });
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json({
      answer: "서버 오류가 발생했습니다 😢",
      score: 0,
    });
  }
}
