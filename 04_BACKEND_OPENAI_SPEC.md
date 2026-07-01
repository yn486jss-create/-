# 04_BACKEND_OPENAI_SPEC.md

# 백엔드 및 OpenAI 연동 명세서

## 1. 문서 목적

이 문서는 Node.js 백엔드 API와 OpenAI API 연동 방식을 정의한다.  
백엔드는 프론트엔드 대신 외부 API를 안전하게 호출하고, 감성 분석 결과를 정해진 JSON 형태로 반환한다.

---

## 2. 백엔드 책임

백엔드는 다음 일을 담당한다.

1. 프론트엔드에서 받은 텍스트 검증
2. OpenAI API 호출
3. OpenAI 결과를 정해진 형식으로 변환
4. Supabase에 로그 저장
5. 프론트엔드에 JSON 응답 반환

백엔드는 화면 HTML을 반환하지 않는다.

---

## 3. API 엔드포인트

```text
POST /api/analyze
```

파일 위치:

```text
api/analyze.js
```

---

## 4. 요청 형식

### 4.1 Headers

```http
Content-Type: application/json
```

### 4.2 Body

```json
{
  "text": "오늘은 기분이 좋아요."
}
```

### 4.3 검증 규칙

| 조건 | 처리 |
|---|---|
| `text`가 없음 | 400 응답 |
| `text`가 문자열이 아님 | 400 응답 |
| `trim()` 후 빈 문자열 | 400 응답 |
| 1,000자 초과 | 400 응답 |
| 정상 문자열 | OpenAI 분석 진행 |

---

## 5. 성공 응답 형식

```json
{
  "ok": true,
  "result": {
    "sentiment": "positive",
    "labelKo": "긍정",
    "confidence": 87,
    "reason": "문장 안에 만족과 기대를 나타내는 표현이 포함되어 있습니다."
  },
  "saved": true
}
```

### 5.1 필드 설명

| 필드 | 타입 | 설명 |
|---|---|---|
| `ok` | boolean | 성공 여부 |
| `result.sentiment` | string | `positive`, `negative`, `neutral` 중 하나 |
| `result.labelKo` | string | 한국어 라벨 |
| `result.confidence` | number | 0~100 백분율 |
| `result.reason` | string | 분석 이유 |
| `saved` | boolean | Supabase 저장 성공 여부 |

---

## 6. 실패 응답 형식

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "분석할 텍스트를 입력해주세요."
  }
}
```

### 6.1 오류 코드

| 코드 | HTTP Status | 메시지 |
|---|---:|---|
| `METHOD_NOT_ALLOWED` | 405 | 허용되지 않은 요청 방식입니다. |
| `VALIDATION_ERROR` | 400 | 분석할 텍스트를 입력해주세요. |
| `TEXT_TOO_LONG` | 400 | 입력 글자는 최대 1,000자까지 가능합니다. |
| `OPENAI_CONFIG_ERROR` | 500 | 서버 설정이 올바르지 않습니다. |
| `AI_ANALYSIS_FAILED` | 502 | 감성 분석 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요. |
| `UNKNOWN_ERROR` | 500 | 예상하지 못한 문제가 발생했습니다. 다시 시도해주세요. |

---

## 7. OpenAI 호출 방식

OpenAI 호출은 서버에서만 수행한다.

사용 패키지:

```text
openai
```

환경 변수:

```text
OPENAI_API_KEY
OPENAI_MODEL
```

권장 기본 모델:

```text
gpt-4o-mini
```

`OPENAI_MODEL`이 비어 있으면 서버 시작 또는 요청 처리 시 설정 오류로 처리한다.

---

## 8. OpenAI 분석 지시문

### 8.1 System Instruction

아래 의미를 유지한다.

```text
You are a sentiment analysis engine.
Analyze the user's text and classify the overall sentiment.
Return only structured data that matches the required schema.
Classify as:
- positive: mainly favorable, happy, satisfied, hopeful, thankful, or approving
- negative: mainly unhappy, angry, disappointed, worried, critical, or rejecting
- neutral: factual, mixed, unclear, balanced, or no strong emotion
The reason must be written in Korean in 1-2 short sentences.
The confidence must be a number from 0 to 100.
```

### 8.2 사용자 입력

사용자 입력은 그대로 분석 대상 텍스트로 전달한다.

---

## 9. Structured Output Schema

OpenAI 응답은 JSON Schema 기반의 구조화된 출력으로 받는다.  
서버는 OpenAI가 반환한 값을 다시 한 번 검증한다.

필수 스키마 의미:

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "sentiment": {
      "type": "string",
      "enum": ["positive", "negative", "neutral"]
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "reason": {
      "type": "string"
    }
  },
  "required": ["sentiment", "confidence", "reason"]
}
```

### 9.1 서버 보정 규칙

OpenAI 응답 후 서버에서 아래를 보정한다.

| 항목 | 보정 규칙 |
|---|---|
| `sentiment` | 허용값이 아니면 오류 처리 |
| `confidence` | 숫자가 아니면 오류 처리 |
| `confidence` 범위 | 0 미만은 0, 100 초과는 100으로 보정 가능 |
| `reason` | 문자열이 아니거나 빈 값이면 기본 문구 사용 금지, 오류 처리 |

기본 문구로 임의 대체하지 않는다. 분석 결과 신뢰성을 위해 오류 처리한다.

---

## 10. labelKo 변환 규칙

OpenAI에는 `labelKo` 생성을 맡기지 않는다.  
서버가 아래 규칙으로 직접 변환한다.

```js
const LABELS = {
  positive: '긍정',
  negative: '부정',
  neutral: '중립'
};
```

---

## 11. Supabase 저장 흐름

분석 성공 시 Supabase에 다음 정보를 저장한다.

```js
{
  input_text: text,
  sentiment,
  confidence,
  reason,
  request_status: 'success',
  openai_model: process.env.OPENAI_MODEL
}
```

OpenAI 분석 실패 시 가능한 경우 실패 로그를 저장한다.

```js
{
  input_text: text,
  request_status: 'failed',
  error_code: 'AI_ANALYSIS_FAILED',
  error_message: '감성 분석 중 문제가 발생했습니다.',
  openai_model: process.env.OPENAI_MODEL
}
```

Supabase 저장 실패는 사용자 분석 실패로 처리하지 않는다.  
이 경우 분석 결과는 반환하고 `saved: false`로 표시한다.

---

## 12. 백엔드 의사 코드

```js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json(errorResponse('METHOD_NOT_ALLOWED'));
  }

  try {
    const text = validateRequestBody(req.body);
    const analysis = await analyzeWithOpenAI(text);
    const normalized = normalizeAnalysis(analysis);
    const saved = await saveAnalysisLog(text, normalized);

    return res.status(200).json({
      ok: true,
      result: normalized,
      saved
    });
  } catch (error) {
    return handleApiError(error, res);
  }
}
```

---

## 13. 시간 제한

OpenAI API 요청은 무한정 기다리지 않는다.

권장 기준:

```text
20초 이내 응답 목표
```

Vercel 함수 실행 제한을 고려하여 복잡한 재시도 로직은 넣지 않는다.

---

## 14. 로그 정책

개발 중 서버 로그에 남겨도 되는 것:

- 오류 코드
- 오류 발생 위치
- 저장 성공 여부

서버 로그에 남기면 안 되는 것:

- OpenAI API Key
- Supabase Service Role Key
- 사용자가 입력한 전체 텍스트

개발 편의를 위해 입력 텍스트를 로그로 찍지 않는다.

---

## 15. 완료 기준

- `POST /api/analyze`가 정상 동작한다.
- `GET /api/analyze` 요청은 405를 반환한다.
- 빈 입력은 400을 반환한다.
- 1,000자 초과 입력은 400을 반환한다.
- OpenAI 응답은 `positive`, `negative`, `neutral` 중 하나로 제한된다.
- 응답에는 `labelKo`, `confidence`, `reason`이 포함된다.
- Supabase 저장 실패 시에도 분석 결과를 반환한다.
- API Key가 브라우저에 노출되지 않는다.
