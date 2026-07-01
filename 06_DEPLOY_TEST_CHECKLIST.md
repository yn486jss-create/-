# 06_DEPLOY_TEST_CHECKLIST.md

# 배포 및 검증 체크리스트

## 1. 문서 목적

이 문서는 `Sentiment Forest / 감정의 숲` 프로젝트를 로컬에서 실행하고, Vercel에 배포하고, 기능이 정상 동작하는지 확인하기 위한 체크리스트이다.

---

## 2. 로컬 실행 전 준비

### 2.1 필수 준비물

- Node.js 설치
- OpenAI API Key
- Supabase 프로젝트
- Vercel 계정

### 2.2 환경 변수 파일

`.env.example`을 참고하여 로컬 환경 변수 파일을 만든다.

```env
OPENAI_API_KEY=여기에_OpenAI_API_Key_입력
OPENAI_MODEL=gpt-4o-mini
SUPABASE_URL=여기에_Supabase_URL_입력
SUPABASE_SERVICE_ROLE_KEY=여기에_Supabase_Service_Role_Key_입력
```

주의:

- `.env` 파일은 Git에 올리지 않는다.
- 실제 키 값은 문서나 README에 적지 않는다.

---

## 3. 설치 및 실행

### 3.1 패키지 설치

```bash
npm install
```

### 3.2 로컬 실행

```bash
npm run dev
```

또는

```bash
npx vercel dev
```

### 3.3 접속 확인

브라우저에서 아래 주소로 접속한다.

```text
http://localhost:3000
```

---

## 4. Supabase 설정 확인

### 4.1 SQL 실행

Supabase SQL Editor에서 `docs/05_SUPABASE_DB_SPEC.md`의 SQL을 실행한다.

### 4.2 테이블 확인

아래 테이블이 존재해야 한다.

```text
sentiment_analysis_logs
```

### 4.3 RLS 확인

- RLS 활성화: Yes
- 공개 select policy: 없음
- 공개 insert policy: 없음

---

## 5. 기능 테스트 체크리스트

### 5.1 입력 검증 테스트

| 테스트 | 입력값 | 기대 결과 | 통과 |
|---|---|---|---|
| 빈 입력 | 빈칸 | `분석할 텍스트를 입력해주세요.` 표시 | [ ] |
| 공백 입력 | `     ` | `분석할 텍스트를 입력해주세요.` 표시 | [ ] |
| 1,000자 초과 | 1,001자 이상 | `입력 글자는 최대 1,000자까지 가능합니다.` 표시 | [ ] |
| 정상 입력 | `오늘은 기분이 좋아요.` | API 요청 진행 | [ ] |

### 5.2 감성 분석 테스트

| 테스트 | 입력값 | 기대 결과 | 통과 |
|---|---|---|---|
| 긍정 문장 | `오늘은 정말 행복하고 만족스러워요.` | 긍정 | [ ] |
| 부정 문장 | `너무 실망스럽고 화가 납니다.` | 부정 | [ ] |
| 중립 문장 | `오늘 회의는 오후 3시에 시작합니다.` | 중립 | [ ] |
| 복합 문장 | `좋은 점도 있지만 아쉬운 부분도 있어요.` | 중립 또는 문맥상 적절한 결과 | [ ] |

### 5.3 결과 표시 테스트

| 항목 | 기대 결과 | 통과 |
|---|---|---|
| 감성 라벨 | 긍정 / 부정 / 중립 중 하나 표시 | [ ] |
| 신뢰도 | 0~100 사이 숫자와 `%` 표시 | [ ] |
| 신뢰도 바 | 백분율에 맞게 너비 변경 | [ ] |
| 분석 이유 | 한국어 1~2문장 표시 | [ ] |
| 결과 카드 | 성공 시 표시 | [ ] |

### 5.4 오류 처리 테스트

| 상황 | 기대 결과 | 통과 |
|---|---|---|
| OpenAI API Key 없음 | 서버 설정 오류 또는 분석 실패 메시지 | [ ] |
| Supabase Key 없음 | 분석 결과는 표시, `saved: false` 가능 | [ ] |
| 네트워크 오류 | 서버 연결 실패 메시지 | [ ] |
| GET `/api/analyze` | 405 JSON 응답 | [ ] |

---

## 6. API 직접 테스트

로컬 실행 후 터미널에서 테스트한다.

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"오늘은 정말 기분이 좋아요."}'
```

기대 응답:

```json
{
  "ok": true,
  "result": {
    "sentiment": "positive",
    "labelKo": "긍정",
    "confidence": 90,
    "reason": "..."
  },
  "saved": true
}
```

---

## 7. 보안 검증

### 7.1 프론트엔드 코드 검색

아래 파일에서 API Key가 보이면 실패이다.

```text
public/index.html
public/styles.css
public/app.js
```

검색어:

```text
OPENAI_API_KEY
SUPABASE_SERVICE_ROLE_KEY
sk-
```

기대 결과:

```text
검색 결과 없음
```

### 7.2 브라우저 개발자 도구 확인

Network 탭에서 프론트엔드가 호출하는 주소는 아래 하나여야 한다.

```text
/api/analyze
```

브라우저에서 OpenAI API 또는 Supabase REST API를 직접 호출하면 실패이다.

---

## 8. Vercel 배포 체크리스트

### 8.1 배포 전 확인

| 항목 | 통과 |
|---|---|
| Git 저장소에 `.env` 파일이 없다 | [ ] |
| `.env.example`만 포함되어 있다 | [ ] |
| `package.json`에 `dev` 스크립트가 있다 | [ ] |
| `/api/analyze` 파일이 있다 | [ ] |
| `/public` 폴더가 있다 | [ ] |

### 8.2 Vercel 환경 변수 설정

Vercel 프로젝트 Settings에서 아래 환경 변수를 등록한다.

```text
OPENAI_API_KEY
OPENAI_MODEL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

환경 변수는 Production, Preview, Development에 필요한 범위로 설정한다.

### 8.3 배포 후 확인

| 항목 | 기대 결과 | 통과 |
|---|---|---|
| 메인 페이지 접속 | 숲 배경 UI 표시 | [ ] |
| 정상 분석 | 결과 표시 | [ ] |
| Supabase 저장 | DB에 행 추가 | [ ] |
| 빈 입력 | 오류 메시지 표시 | [ ] |
| API 직접 접속 | JSON 응답 | [ ] |

---

## 9. 완료 보고 형식

구현 완료 후 아래 형식으로 결과를 정리한다.

```text
## 완료 요약
- 구현한 기능:
- 생성한 파일:
- 환경 변수 필요 항목:
- 테스트 결과:
- 남은 작업:
```

---

## 10. 최종 완료 기준

아래 항목이 모두 체크되면 프로젝트 완료로 판단한다.

- [ ] 사용자가 텍스트를 입력할 수 있다.
- [ ] 감성 분석 버튼이 동작한다.
- [ ] OpenAI API 분석 결과가 표시된다.
- [ ] 긍정 / 부정 / 중립 중 하나로 표시된다.
- [ ] 신뢰도 백분율이 표시된다.
- [ ] 분석 이유가 표시된다.
- [ ] 오류 메시지가 표시된다.
- [ ] Supabase에 로그가 저장된다.
- [ ] OpenAI API Key가 프론트엔드에 노출되지 않는다.
- [ ] Supabase Service Role Key가 프론트엔드에 노출되지 않는다.
- [ ] Vercel 배포 URL에서 동작한다.
