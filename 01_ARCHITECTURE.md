# 01_ARCHITECTURE.md

# 시스템 구조 및 기술 스택 문서

## 1. 문서 목적

이 문서는 `Sentiment Forest / 감정의 숲` 프로젝트의 전체 구조를 설명한다.  
비전공자도 이해할 수 있도록 사용자의 입력이 어떤 경로로 이동하고, 어떤 기술이 어떤 역할을 하는지 단계별로 정리한다.

---

## 2. 전체 구조 요약

사용자가 브라우저에서 텍스트를 입력하면, 프론트엔드는 Node.js 백엔드 API로 요청을 보낸다.  
백엔드 API는 OpenAI API에 감성 분석을 요청하고, 결과를 Supabase에 저장한 뒤 브라우저에 JSON으로 돌려준다.

```text
사용자 브라우저
   ↓
HTML / CSS / JS 화면
   ↓ POST /api/analyze
Node.js API on Vercel
   ↓
OpenAI API 감성 분석
   ↓
Supabase DB 저장
   ↓
브라우저에 결과 표시
```

---

## 3. 기술별 역할

| 기술 | 역할 | 쉬운 설명 |
|---|---|---|
| HTML | 화면 구조 | 입력창, 버튼, 결과 영역을 만든다. |
| CSS | 화면 디자인 | 숲 배경, 카드, 색상, 간격을 꾸민다. |
| JavaScript | 화면 동작 | 버튼 클릭, API 요청, 결과 표시를 처리한다. |
| Node.js | 서버 기능 | OpenAI와 Supabase를 안전하게 호출한다. |
| OpenAI API | 감성 분석 | 입력 문장을 긍정 / 부정 / 중립으로 분석한다. |
| Supabase | 데이터 저장 | 입력값과 분석 결과를 DB에 저장한다. |
| Vercel | 배포 | 만든 서비스를 인터넷에서 접속 가능하게 한다. |

---

## 4. 권장 폴더 구조

아래 구조를 기준으로 구현한다.

```text
sentiment-forest/
├─ AGENTS.md
├─ PRD.md
├─ package.json
├─ .env.example
├─ public/
│  ├─ index.html
│  ├─ styles.css
│  └─ app.js
├─ api/
│  └─ analyze.js
├─ lib/
│  ├─ openai.js
│  └─ supabase.js
├─ supabase/
│  └─ schema.sql
└─ docs/
   ├─ 01_ARCHITECTURE.md
   ├─ 02_UI_UX_SPEC.md
   ├─ 03_FRONTEND_SPEC.md
   ├─ 04_BACKEND_OPENAI_SPEC.md
   ├─ 05_SUPABASE_DB_SPEC.md
   └─ 06_DEPLOY_TEST_CHECKLIST.md
```

---

## 5. 런타임 구조

### 5.1 프론트엔드

프론트엔드는 `public` 폴더에 둔다.

- `index.html`: 화면 뼈대
- `styles.css`: 디자인
- `app.js`: 사용자의 버튼 클릭과 결과 표시 처리

프론트엔드는 OpenAI API를 직접 호출하지 않는다.

### 5.2 백엔드

백엔드는 Vercel Serverless Function 구조를 사용한다.

- API 경로: `/api/analyze`
- 파일 위치: `api/analyze.js`
- 역할:
  1. 요청 Body에서 `text`를 읽는다.
  2. 입력값을 검증한다.
  3. OpenAI API에 감성 분석을 요청한다.
  4. 결과를 정해진 JSON 형식으로 정리한다.
  5. Supabase에 로그를 저장한다.
  6. 브라우저에 JSON 응답을 보낸다.

### 5.3 데이터베이스

Supabase Postgres를 사용한다.

- 테이블명: `sentiment_analysis_logs`
- 목적: 분석 요청과 결과 저장
- 사용자에게 분석 기록 목록을 보여주는 기능은 이번 버전에 포함하지 않는다.

---

## 6. 환경 변수

`.env.example`에는 아래 이름만 작성한다.

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

### 6.1 변수 설명

| 변수명 | 설명 | 노출 위치 |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI API 호출용 키 | 서버에서만 사용 |
| `OPENAI_MODEL` | 감성 분석에 사용할 모델명 | 서버에서만 사용 |
| `SUPABASE_URL` | Supabase 프로젝트 URL | 서버에서만 사용 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서버 저장용 키 | 서버에서만 사용 |

---

## 7. 요청 흐름 상세

### 7.1 정상 흐름

```text
1. 사용자가 텍스트 입력
2. 프론트엔드가 빈 값과 글자 수 검사
3. POST /api/analyze 호출
4. 서버가 다시 입력값 검사
5. 서버가 OpenAI API 호출
6. OpenAI가 JSON 형식 결과 반환
7. 서버가 결과를 검증하고 정리
8. 서버가 Supabase에 로그 저장
9. 서버가 브라우저에 결과 반환
10. 프론트엔드가 결과 카드 표시
```

### 7.2 오류 흐름

```text
1. 사용자가 잘못된 입력 전송
2. 프론트엔드 또는 서버가 오류 감지
3. 오류 코드를 JSON으로 반환
4. 화면에 사용자 친화적인 메시지 표시
```

OpenAI API 오류와 Supabase 오류는 구분한다.

- OpenAI 오류: 분석 결과를 만들 수 없으므로 실패 응답
- Supabase 오류: 분석 결과는 보여주되 `saved: false`로 반환

---

## 8. 의존성 패키지

권장 최소 패키지:

```text
openai
@supabase/supabase-js
vercel
```

사용 금지 패키지:

```text
@openai/openai
```

정확한 `package.json` 예시:

```json
{
  "name": "sentiment-forest",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vercel dev",
    "start": "vercel dev"
  },
  "dependencies": {
    "@supabase/supabase-js": "latest",
    "openai": "latest"
  },
  "devDependencies": {
    "vercel": "latest"
  }
}
```

주의:

- `@openai/openai`라는 패키지는 사용하지 않는다.
- OpenAI 공식 Node SDK 패키지명은 `openai`를 사용한다.
- 프론트엔드 전용 빌드 도구는 추가하지 않는다.

---

## 9. 제약 조건

- 프론트엔드 프레임워크를 사용하지 않는다.
- 서버 API는 `/api/analyze` 하나만 만든다.
- DB 저장은 서버에서만 수행한다.
- 환경 변수 이름을 바꾸지 않는다.
- 입력 글자 수 제한은 1,000자로 고정한다.
- 분석 결과 값은 아래 세 가지 중 하나만 허용한다.

```text
positive
negative
neutral
```

---

## 10. 완료 기준

- 권장 폴더 구조대로 파일이 생성되어 있다.
- `npm run dev` 또는 `vercel dev`로 로컬 실행이 가능하다.
- 브라우저에서 입력 → 분석 → 결과 표시가 가능하다.
- OpenAI API 키가 프론트엔드 코드에 없다.
- Supabase Service Role Key가 프론트엔드 코드에 없다.
- Supabase 테이블에 로그가 저장된다.
- Vercel 배포 후 `/api/analyze`가 JSON 응답을 반환한다.
