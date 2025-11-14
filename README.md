# 🧠 Perso.ai Q&A Chatbot (VibeCoding Internship Task)

> ** 벡터 데이터베이스(Vector DB)를 활용한 지식기반 챗봇 시스템 구축  
> **목표:** 제공된 Q&A 데이터셋을 기반으로 *할루시네이션 없이* 정확한 응답을 반환하는 AI 챗봇 구현

---

## 🚀 프로젝트 개요

Perso.ai Q&A 챗봇은  
**Qdrant 벡터 데이터베이스 + Google Gemini 임베딩 API**를 기반으로,  
제공된 Q&A 데이터에서만 답변을 반환하도록 설계된 **지식기반 검색형 챗봇**입니다.  

사용자가 질문을 입력하면 다음 단계를 거칩니다   
1️⃣ **질문 문장 정규화(normalization)**  
2️⃣ **임베딩 생성 (Gemini text-embedding-004)**  
3️⃣ **Qdrant에서 Top-k 유사 문장 검색**  
4️⃣ **유사도 기준으로 최적 답변 반환 및 신뢰도(score) 계산**

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
- 원본 `Q&A.xlsx` → `clean_qa_pairs.csv` 로 전처리  
- `id`, `question`, `answer` 컬럼 유지  

### 🔹 임베딩 로직 (`scripts/ingest.ts`)
- 각 질문·답변 쌍을 **정규화(normalize)** 처리  
  - 소문자 변환, 문장부호/개행 제거, 공백 통일  
- 정규화된 텍스트를 `${question}\n${answer}` 형태로 결합하여 임베딩 생성  
- Qdrant 컬렉션(`qa_pairs_gemini`)에 `id`, `vector`, `payload`(Q/A 저장) 업로드  
- 임베딩 크기: **1536 (Gemini text-embedding-004)**

### 🔹 검색 로직 (`app/api/qa/route.ts`)
- 사용자 입력을 동일한 규칙으로 정규화 후 임베딩 생성  
- Qdrant `search()`로 상위 3개 후보 검색  
- **Cosine 유사도 기반**으로 1위 후보 선택  
- `SIM_THRESHOLD=0.6`, `GAP_THRESHOLD=0.02` 로 신뢰도 필터링  
- 조건 불충족 시 “질문이 데이터와 일치하지 않습니다 😢” 안내

---

## 🎯 정확도 향상 전략

| 전략 | 설명 |
|------|------|
| **1. 정규화(Normalization)** | 띄어쓰기, 문장부호, 개행 등의 미세한 차이를 제거하여 일치율 향상 |
| **2. Threshold 튜닝** | `SIM_THRESHOLD=0.6`으로 유사도 임계값을 조정해 오탐 방지 |
| **3. Gap 기반 판별** | 1·2위 후보 간 점수차(`GAP_THRESHOLD=0.02`)로 모호한 질의 필터링 |
| **4. 질문+답변 동시 임베딩** | 문맥 정보 포함으로 의미 기반 매칭 강화 |
| **5. 자동 평가 스크립트** | `evaluate.ts`로 `Exact Match@1` 정확도 및 모호 비율 자동 측정 |
| **6. 로깅 기반 디버깅** | Qdrant 검색 결과 및 Score 로그로 세밀한 튜닝 가능 |

---

## 💬 UI/UX 구성

| 항목 | 설명 |
|------|------|
| **채팅 인터페이스** | ChatGPT 스타일의 **양방향 대화형 UI** |
| **자동 스크롤** | 새 메시지 도착 시 하단으로 부드럽게 이동 |
| **시간 표시** | 각 메시지에 전송 시각 표시 |
| **전송 방식** | Enter 입력 / 전송 버튼 모두 지원 |
| **버튼 인터랙션** | Hover 시 컬러 그라데이션 변화 |
| **로딩 애니메이션** | ‘Perso.ai ●●●’ 형태의 **3점 깜빡임 애니메이션**으로 자연스러운 “입력 중” 표현 |

---

## 🪄 애니메이션 상세

- `app/page.tsx`의 `dotStyle()` 함수에서 **각 점(●)** 에 `animation-delay` 적용  
- `app/globals.css`의 `@keyframes blink` 정의로 **점 순차 점멸 애니메이션 구현**
- 답변 생성 동안 `"Perso.ai ●●●"` 형태로 자연스럽게 깜빡이는 로딩 표시

**💡 효과:** 자연스러운 대기 UI 제공 → 사용자 경험(UX) 대폭 개선

---

## 🧭 디렉토리 구조
```
Perso.ai/
├── app/
│   ├── api/
│   │   └── qa/
│   │       └── route.ts              # Qdrant 검색 API
│   ├── globals.css                   # 애니메이션 정의
│   ├── layout.tsx                    # 전역 레이아웃 (globals.css import)
│   └── page.tsx                      # 채팅 UI + 타이핑 애니메이션
│
├── data/
│   └── clean_qa_pairs.csv            # 전처리된 Q&A 데이터
│
├── lib/
│   ├── embed.ts                      # 임베딩 생성 로직 (OpenAI API)
│   └── qdrant.ts                     # Qdrant 클라이언트 및 설정
│
├── scripts/
│   ├── ingest.ts                     # 벡터 업로드 스크립트
│   └── evaluate.ts                   # 정확도 평가 자동화 스크립트
│
├── .env.local                        # 환경 변수 (커밋 제외)
└── README.md                         # 프로젝트 설명 문서
```

---

## 🌟 핵심 성과 요약

- ✅ **Qdrant + Gemini 기반** 지식검색형 챗봇 완성  
- ✅ **정확도 중심 설계** (Exact Match@1 기준 평가)  
- ✅ **직관적 대화형 UI** + 자연스러운 타이핑 애니메이션  
- ✅ **정확도 측정 자동화** 및 로깅으로 높은 재현성 확보  

> **“할루시네이션 없는 신뢰 가능한 Q&A 챗봇”**  
> 데이터 중심 AI 서비스 개발 역량을 입증한 프로젝트입니다.

---
