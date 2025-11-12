import fs from "fs";
import path from "path";
import Papa from "papaparse";

// 원본 & 결과 경로
const RAW_PATH = path.resolve(process.cwd(), "data/raw_qa.csv");
const CLEAN_PATH = path.resolve(process.cwd(), "data/clean_qa_pairs.csv");

const csv = fs.readFileSync(RAW_PATH, "utf8");
const rows = Papa.parse(csv, { header: false }).data as string[][];

const cleanRows: { id: number; question: string; answer: string }[] = [];
let currentId = 0;
let currentQuestion = "";
let currentAnswer = "";

for (const row of rows) {
  const text = row[2]?.trim();
  if (!text) continue;

  // 질문행 감지 (Q.으로 시작)
  if (text.startsWith("Q.")) {
    currentId++;
    currentQuestion = text.replace(/^Q\.\s*/, "").trim();
    currentAnswer = "";
  }

  // 답변행 감지 (A.으로 시작)
  if (text.startsWith("A.")) {
    currentAnswer = text.replace(/^A\.\s*/, "").trim();
    cleanRows.push({
      id: currentId,
      question: currentQuestion,
      answer: currentAnswer,
    });
  }
}

// CSV 저장
const cleanCsv = Papa.unparse(cleanRows, { header: true });
fs.writeFileSync(CLEAN_PATH, cleanCsv, "utf8");

console.log(`✅ 변환 완료: ${cleanRows.length}개 Q&A -> ${CLEAN_PATH}`);