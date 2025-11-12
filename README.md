# 🧠 Perso.ai Q&A Chatbot (VibeCoding Internship Task)

> **과제 주제:** 벡터 데이터베이스(Vector DB)를 활용한 지식기반 챗봇 시스템 구축  
> **목표:** 제공된 Q&A 데이터셋을 기반으로 *할루시네이션 없이* 정확한 응답을 반환하는 AI 챗봇 구현

---

## 🚀 프로젝트 개요

Perso.ai Q&A 챗봇은  
**Qdrant 벡터 데이터베이스 + Google Gemini 임베딩 API**를 기반으로,  
제공된 Q&A 데이터에서만 답변을 반환하도록 설계된 **지식기반 검색형 챗봇**입니다.  

사용자가 질문을 입력하면 다음 단계를 거칩니다 👇  
1️⃣ **질문 문장 정규화(normalization)**  
2️⃣ **임베딩 생성 (Gemini text-embedding-004)**  
3️⃣ **Qdrant에서 Top-k 유사 문장 검색**  
4️⃣ **유사도 기준으로 최적 답변 반환**

---

## 🧩 기술 스택

| 구분 | 사용 기술 |
|------|------------|
| **Frontend** | Next.js 14 (App Router), React, TypeScript |
| **Backend** | Next.js API Routes (Edge Runtime) |
| **Vector DB** | Qdrant (Managed Cloud) |
| **Embedding Model** | Google Gemini API – `text-embedding-004` (1536차원) |
| **Infra & Deploy** | Vercel |
| **ETL/Embedding Script** | Node.js + Papaparse + dotenv + TSX |
| **Language** | TypeScript / JavaScript (ESM 기반) |

---

## 🧠 벡터 DB 및 임베딩 방식

### 🔹 데이터 준비
- 원본 `Q&A.xlsx` → `clean_qa_pairs.csv` 로 변환  
- `id`, `question`, `answer` 컬럼 유지  

### 🔹 임베딩 로직 (`scripts/ingest.ts`)
- 각 질문·답변 쌍을 **정규화(normalize)**  
  - 소문자 변환, 문장부호 제거, 개행 제거, 공백 통일  
- 정규화된 텍스트를 `${question}\n${answer}` 형태로 결합하여 임베딩 생성  
- Qdrant 컬렉션(`qa_pairs_gemini`)에 `id`, `vector`, `payload`(Q/A 저장) 업로드  
- 임베딩 크기: **1536 (Gemini text-embedding-004)**

### 🔹 검색 로직 (`/app/api/qa/route.ts`)
- 사용자 입력을 동일한 정규화 규칙으로 처리 후 임베딩 생성  
- Qdrant `search()`로 상위 3개 후보 검색  
- **Cosine 유사도 기반**으로 가장 높은 score 선택  
- `SIM_THRESHOLD=0.6`, `GAP_THRESHOLD=0.02` 로 정확도·안정성 균형 유지  

---

## 🎯 정확도 향상 전략

| 전략 | 설명 |
|------|------|
| **1. 정규화(Normalization)** | 질문 내 띄어쓰기, 문장부호, 개행 등의 미세한 차이를 제거하여 동일 질의 일치율 개선 |
| **2. Threshold 튜닝** | 유사도 임계값(`SIM_THRESHOLD=0.6`) 조정으로 동일문장 오탐 방지 |
| **3. Gap 기반 판별** | 1위와 2위 후보 점수차(`GAP_THRESHOLD=0.02`)로 모호한 질의 필터링 |
| **4. 질문+답변 동시 임베딩** | 문맥 정보 포함으로 의미 기반 매칭 강화 |
| **5. 로깅 기반 평가 자동화** | API 응답 로그로 정확도(`Exact Match@1`) 실시간 측정 및 튜닝 |

---

## 💻 UI/UX 구성

- ChatGPT 스타일의 **대화형 인터페이스**
- 메시지 자동 스크롤, 입력창 Enter 전송, 전송 버튼 hover 효과
- 신뢰도(`score`)를 백분율로 표시  
- 예시 메시지:

```text
사용자: Perso.ai는 어떤 서비스인가요?
챗봇: Perso.ai는 이스트소프트가 개발한 다국어 AI 영상 더빙 플랫폼으로...