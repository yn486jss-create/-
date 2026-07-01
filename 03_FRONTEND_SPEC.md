# 03_FRONTEND_SPEC.md

# 프론트엔드 구현 명세서

## 1. 문서 목적

이 문서는 HTML, CSS, JavaScript로 만드는 프론트엔드 구현 기준을 정의한다.  
프론트엔드는 사용자의 입력을 받고, Node.js API에 요청하고, 결과를 화면에 보여주는 역할만 한다.

---

## 2. 프론트엔드 파일

```text
public/
├─ index.html
├─ styles.css
└─ app.js
```

| 파일 | 역할 |
|---|---|
| `index.html` | 화면 구조 |
| `styles.css` | 디자인 |
| `app.js` | 사용자 입력, API 요청, 결과 표시 |

---

## 3. HTML 구조 요구사항

`index.html`에는 다음 주요 영역이 있어야 한다.

```text
<header class="hero">
  타이틀과 서브타이틀
</header>

<main class="page">
  <section class="analyzer-card">
    입력창, 글자 수, 버튼, 오류 메시지
  </section>

  <section class="result-card">
    감성 결과, 신뢰도, 분석 이유
  </section>
</main>
```

---

## 4. 필수 HTML 요소 ID

JavaScript에서 요소를 찾기 위해 아래 ID를 고정한다.

| 요소 | ID |
|---|---|
| 입력창 | `sentimentText` |
| 글자 수 | `charCount` |
| 분석 버튼 | `analyzeButton` |
| 오류 메시지 | `errorMessage` |
| 결과 카드 | `resultCard` |
| 결과 라벨 | `resultLabel` |
| 결과 설명 메시지 | `resultMessage` |
| 신뢰도 텍스트 | `confidenceText` |
| 신뢰도 바 | `confidenceBar` |
| 분석 이유 | `reasonText` |

ID 이름은 변경하지 않는다.

---

## 5. 입력값 검증

### 5.1 프론트엔드 검증 규칙

| 조건 | 처리 |
|---|---|
| 빈 문자열 | 오류 메시지 표시, API 요청 금지 |
| 공백만 입력 | 오류 메시지 표시, API 요청 금지 |
| 1,000자 초과 | 오류 메시지 표시, API 요청 금지 |
| 정상 입력 | API 요청 가능 |

### 5.2 글자 수 표시

입력 중 실시간으로 표시한다.

```text
25 / 1000
```

1,000자 초과 시:

```text
1005 / 1000
```

오류 메시지:

```text
입력 글자는 최대 1,000자까지 가능합니다.
```

---

## 6. API 호출 명세

프론트엔드는 아래 API만 호출한다.

```text
POST /api/analyze
```

요청 예시:

```js
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ text })
});
```

프론트엔드는 OpenAI API와 Supabase API를 직접 호출하지 않는다.

---

## 7. 프론트엔드 상태 관리

별도 상태 관리 라이브러리를 사용하지 않는다.  
아래와 같이 단순한 상태만 사용한다.

```js
let isLoading = false;
```

### 7.1 상태별 처리

| 상태 | 처리 |
|---|---|
| 초기 | 결과 카드 숨김, 오류 숨김 |
| 입력 중 | 글자 수 업데이트 |
| 로딩 | 버튼 비활성화, 버튼 문구 변경 |
| 성공 | 결과 카드 표시 |
| 실패 | 오류 메시지 표시 |

---

## 8. JavaScript 함수 설계

`app.js`는 아래 함수 구조를 권장한다.

```js
const MAX_TEXT_LENGTH = 1000;

function getInputText() {}
function validateText(text) {}
function updateCharCount() {}
function setLoading(isLoading) {}
function showError(message) {}
function clearError() {}
function hideResult() {}
function showResult(result) {}
async function analyzeSentiment() {}
function init() {}
```

### 8.1 함수별 역할

| 함수 | 역할 |
|---|---|
| `getInputText` | textarea 값을 읽고 앞뒤 공백 제거 |
| `validateText` | 빈 값과 길이 제한 검사 |
| `updateCharCount` | 글자 수 표시 업데이트 |
| `setLoading` | 버튼 상태 변경 |
| `showError` | 오류 메시지 표시 |
| `clearError` | 오류 메시지 초기화 |
| `hideResult` | 결과 카드 숨김 |
| `showResult` | 결과 카드 표시 |
| `analyzeSentiment` | API 호출 전체 흐름 처리 |
| `init` | 이벤트 연결 |

---

## 9. 결과 표시 규칙

서버에서 받은 `result.sentiment` 값에 따라 표시한다.

| sentiment | 한국어 라벨 | CSS 클래스 | 배지/신뢰도 바 색상 |
|---|---|---|---|
| `positive` | 긍정 | `is-positive` | `#3D8B5A` |
| `negative` | 부정 | `is-negative` | `#A14A3B` |
| `neutral` | 중립 | `is-neutral` | `#6E7781` |


### 9.1 결과 색상 매핑 코드

`showResult(result)`에서는 아래 매핑을 사용한다. 서버 응답에 색상 값을 추가하지 않는다. 색상은 프론트엔드에서 고정된 규칙으로 처리한다.

```js
const SENTIMENT_UI = {
  positive: {
    labelKo: '긍정',
    message: '긍정적인 감정이 느껴져요',
    className: 'is-positive'
  },
  negative: {
    labelKo: '부정',
    message: '부정적인 감정이 느껴져요',
    className: 'is-negative'
  },
  neutral: {
    labelKo: '중립',
    message: '중립적인 문장으로 보여요',
    className: 'is-neutral'
  }
};
```

결과 표시 함수 예시:

```js
function showResult(result) {
  const ui = SENTIMENT_UI[result.sentiment] || SENTIMENT_UI.neutral;
  const safeConfidence = Math.min(100, Math.max(0, Number(result.confidence)));

  resultCard.classList.remove('is-hidden', 'is-positive', 'is-negative', 'is-neutral');
  resultCard.classList.add(ui.className);

  resultLabel.textContent = ui.labelKo;
  resultMessage.textContent = ui.message;
  confidenceText.textContent = `신뢰도 ${safeConfidence}%`;
  confidenceBar.style.width = `${safeConfidence}%`;
  reasonText.textContent = result.reason || '분석 이유가 제공되지 않았습니다.';
}
```

### 9.2 결과 카드 예시

```text
[초록색 배지] 긍정
긍정적인 감정이 느껴져요
신뢰도 87%
문장 안에 만족과 기대를 나타내는 표현이 포함되어 있습니다.
```

부정 결과는 붉은색 배지, 중립 결과는 회색 배지를 사용한다. 색상만으로 의미를 전달하지 않고 `긍정`, `부정`, `중립` 텍스트를 반드시 함께 보여준다.

### 9.3 신뢰도 바

`confidence`가 87이면 아래처럼 처리한다.

```js
confidenceBar.style.width = `${confidence}%`;
```

`confidence`는 서버에서 0~100 사이 숫자로 온다고 가정하되, 화면 표시 전에도 한 번 보정한다.

```js
const safeConfidence = Math.min(100, Math.max(0, Number(confidence)));
```

---

## 10. 오류 표시 규칙

서버 오류 응답:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "분석할 텍스트를 입력해주세요."
  }
}
```

화면에는 `error.message`를 표시한다.

네트워크 오류처럼 서버 응답을 받지 못한 경우:

```text
서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.
```

---

## 11. XSS 방지 규칙

사용자가 입력한 값이나 서버에서 받은 문자열을 화면에 넣을 때는 `innerHTML`을 사용하지 않는다.

사용 가능:

```js
reasonText.textContent = result.reason;
```

사용 금지:

```js
reasonText.innerHTML = result.reason;
```

---

## 12. 버튼 중복 클릭 방지

분석 중에는 버튼을 비활성화한다.

```js
button.disabled = true;
button.textContent = '분석 중...';
```

분석 완료 또는 실패 후에는 다시 활성화한다.

```js
button.disabled = false;
button.textContent = '감성 분석하기';
```

---

## 13. CSS 구현 기준

필수 클래스:

```text
.hero
.hero__content
.hero__title
.hero__subtitle
.page
.analyzer-card
.form-group
.textarea
.meta-row
.char-count
.primary-button
.error-message
.result-card
.result-badge
.result-message
.confidence-track
.confidence-bar
.reason-box
.is-hidden
.is-positive
.is-negative
.is-neutral
```

`is-hidden`은 요소를 숨길 때 사용한다.

```css
.is-hidden {
  display: none;
}
```

결과 색상 클래스는 아래처럼 구현한다.

```css
:root {
  --sentiment-positive: #3D8B5A;
  --sentiment-negative: #A14A3B;
  --sentiment-neutral: #6E7781;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 8px 14px;
  color: #ffffff;
  font-weight: 700;
}

.result-card.is-positive .result-badge,
.result-card.is-positive .confidence-bar {
  background-color: var(--sentiment-positive);
}

.result-card.is-negative .result-badge,
.result-card.is-negative .confidence-bar {
  background-color: var(--sentiment-negative);
}

.result-card.is-neutral .result-badge,
.result-card.is-neutral .confidence-bar {
  background-color: var(--sentiment-neutral);
}
```


---

## 14. 완료 기준

- HTML 요소 ID가 문서와 일치한다.
- 빈 입력은 서버 요청 없이 차단된다.
- 1,000자 초과 입력은 서버 요청 없이 차단된다.
- 정상 입력은 `/api/analyze`로 요청된다.
- 로딩 상태가 표시된다.
- 결과 카드에 감성, 신뢰도, 이유가 표시된다.
- 감성 결과는 `긍정`, `부정`, `중립` 텍스트 라벨과 지정 색상 배지로 함께 표시된다.
- 신뢰도 바 색상은 감성 결과 배지 색상과 일치한다.
- 오류 메시지가 표시된다.
- `innerHTML`을 사용하지 않는다.
- 모바일 화면에서도 입력과 결과 확인이 가능하다.
