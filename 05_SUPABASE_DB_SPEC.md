# 05_SUPABASE_DB_SPEC.md

# Supabase 데이터베이스 명세서

## 1. 문서 목적

이 문서는 감성 분석 결과를 저장하기 위한 Supabase Postgres 테이블 구조를 정의한다.  
이번 MVP에서는 분석 기록을 사용자에게 보여주지 않지만, 향후 분석 기록 조회나 통계 기능을 확장할 수 있도록 기본 로그를 저장한다.

---

## 2. DB 사용 목적

Supabase는 다음 정보를 저장한다.

- 사용자가 입력한 텍스트
- 감성 분석 결과
- 신뢰도
- 분석 이유
- 분석 성공 / 실패 여부
- 오류 코드와 오류 메시지
- 사용한 OpenAI 모델
- 생성 시각

---

## 3. 테이블명

```text
sentiment_analysis_logs
```

테이블명은 변경하지 않는다.

---

## 4. 컬럼 정의

| 컬럼명 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | uuid | Yes | 기본 키 |
| `input_text` | text | Yes | 사용자가 입력한 텍스트 |
| `sentiment` | text | No | `positive`, `negative`, `neutral` 중 하나 |
| `confidence` | numeric(5,2) | No | 0~100 신뢰도 |
| `reason` | text | No | 분석 이유 |
| `request_status` | text | Yes | `success` 또는 `failed` |
| `error_code` | text | No | 오류 코드 |
| `error_message` | text | No | 오류 메시지 |
| `openai_model` | text | No | 사용한 OpenAI 모델명 |
| `raw_response` | jsonb | No | 디버깅용 원본 응답 일부 |
| `created_at` | timestamptz | Yes | 생성 시각 |

---

## 5. SQL 스키마

Supabase SQL Editor에서 아래 SQL을 실행한다.

```sql
create extension if not exists pgcrypto;

create table if not exists public.sentiment_analysis_logs (
  id uuid primary key default gen_random_uuid(),
  input_text text not null check (char_length(input_text) between 1 and 1000),
  sentiment text check (sentiment in ('positive', 'negative', 'neutral')),
  confidence numeric(5, 2) check (confidence >= 0 and confidence <= 100),
  reason text,
  request_status text not null check (request_status in ('success', 'failed')),
  error_code text,
  error_message text,
  openai_model text,
  raw_response jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_sentiment_analysis_logs_created_at
on public.sentiment_analysis_logs (created_at desc);

create index if not exists idx_sentiment_analysis_logs_sentiment
on public.sentiment_analysis_logs (sentiment);

alter table public.sentiment_analysis_logs enable row level security;
```

---

## 6. RLS 정책

이번 MVP에서는 브라우저에서 Supabase를 직접 호출하지 않는다.  
서버에서 `SUPABASE_SERVICE_ROLE_KEY`로만 저장한다.

따라서 공개 읽기 / 공개 쓰기 정책을 만들지 않는다.

```text
No public select policy
No public insert policy
No public update policy
No public delete policy
```

중요:

- `SUPABASE_SERVICE_ROLE_KEY`는 서버 환경 변수에만 저장한다.
- 프론트엔드에서 Supabase 클라이언트를 만들지 않는다.
- 익명 사용자가 직접 DB에 insert하지 못하게 한다.

---

## 7. 저장 데이터 예시

### 7.1 성공 로그

```json
{
  "input_text": "오늘은 날씨가 좋아서 기분이 좋아요.",
  "sentiment": "positive",
  "confidence": 92,
  "reason": "날씨가 좋고 기분이 좋다는 표현이 포함되어 있어 긍정으로 판단됩니다.",
  "request_status": "success",
  "openai_model": "gpt-4o-mini"
}
```

### 7.2 실패 로그

```json
{
  "input_text": "분석 요청 텍스트",
  "request_status": "failed",
  "error_code": "AI_ANALYSIS_FAILED",
  "error_message": "감성 분석 중 문제가 발생했습니다.",
  "openai_model": "gpt-4o-mini"
}
```

---

## 8. Supabase 클라이언트 사용 위치

Supabase 클라이언트는 아래 파일에서만 만든다.

```text
lib/supabase.js
```

권장 구조:

```js
import { createClient } from '@supabase/supabase-js';

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_CONFIG_ERROR');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}
```

---

## 9. 저장 함수 설계

권장 함수명:

```js
saveAnalysisLog(payload)
```

성공 시:

```js
return true;
```

실패 시:

```js
return false;
```

주의:

- Supabase 저장 실패가 전체 분석 실패가 되면 안 된다.
- 저장 실패는 서버 로그로만 남기고, 프론트엔드에는 `saved: false`를 전달한다.

---

## 10. 데이터 보관 주의사항

MVP에서는 사용자가 입력한 원문을 저장한다.  
따라서 안내 문구에 민감한 개인정보 입력을 피하라는 문장을 넣는다.

권장 안내 문구:

```text
개인정보나 민감한 정보는 입력하지 않는 것을 권장합니다.
```

---

## 11. 향후 확장 가능 기능

이번 버전에서는 구현하지 않는다.

- 분석 기록 목록 보기
- 날짜별 감성 통계
- 긍정 / 부정 / 중립 비율 차트
- 사용자별 기록 관리
- 로그인 기반 개인 기록
- 입력 텍스트 익명화 저장

---

## 12. 완료 기준

- `sentiment_analysis_logs` 테이블이 생성되어 있다.
- `id`가 자동 생성된다.
- `created_at`이 자동 저장된다.
- `sentiment`는 세 값 중 하나만 저장된다.
- `confidence`는 0~100 사이만 저장된다.
- RLS가 활성화되어 있다.
- 공개 정책이 없다.
- 서버에서 Service Role Key로 insert 가능하다.
- 프론트엔드에는 Supabase 키가 없다.
