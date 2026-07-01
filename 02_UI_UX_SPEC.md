# 02_UI_UX_SPEC.md

# UI / UX 디자인 명세서

## 1. 문서 목적

이 문서는 `Sentiment Forest / 감정의 숲`의 화면 디자인과 사용자 경험 규칙을 정의한다.  
첨부된 숲 이미지의 분위기를 참고하여 차분하고 신뢰감 있는 감성 분석 서비스 UI를 만든다.

---

## 2. 참고 이미지 해석

첨부 이미지는 다음 특징을 가진다.

- 화면 전체를 채우는 깊은 숲 배경
- 어두운 녹색 계열의 자연스러운 색감
- 중앙에 배치된 흰색 세리프 타이틀
- 얇고 고급스러운 텍스트 스타일
- 복잡한 요소 없이 조용한 분위기

이 프로젝트에서는 같은 방향을 유지하되, 실제 서비스 사용성을 위해 입력 카드와 결과 카드를 추가한다.

---

## 3. 전체 디자인 콘셉트

```text
깊은 숲 속에서 문장의 감정을 조용히 읽어주는 서비스
```

키워드:

- 차분함
- 신뢰감
- 자연스러움
- 여백
- 부드러운 집중감

---

## 4. 화면 구성

### 4.1 전체 레이아웃

```text
[Hero Section]
- 숲 배경 또는 숲 느낌 그라데이션
- 중앙 타이틀
- 중앙 서브타이틀

[Analyzer Section]
- 반투명 입력 카드
- 텍스트 입력창
- 글자 수
- 분석 버튼
- 오류 메시지

[Result Section]
- 결과 카드
- 감성 라벨
- 신뢰도
- 신뢰도 바
- 분석 이유
```

### 4.2 화면 높이

- Hero 영역은 최소 `360px` 이상으로 한다.
- 전체 첫 화면에서 입력 카드가 보이도록 과도하게 큰 Hero는 사용하지 않는다.
- 모바일에서는 Hero 높이를 줄여 입력 영역 접근성을 높인다.

---

## 5. 컬러 시스템

첨부 이미지에서 추출한 숲 계열 색상을 기준으로 한다.

| 용도 | 색상명 | HEX | 설명 |
|---|---|---|---|
| 가장 어두운 배경 | Forest 900 | `#14291A` | 깊은 숲 그림자 |
| 주요 배경 | Forest 700 | `#254E2A` | 어두운 녹색 |
| 보조 강조 | Moss 500 | `#4E6526` | 이끼색 강조 |
| 부드러운 카드 | Mist White | `#F4F1E8` | 밝은 안개색 |
| 본문 텍스트 | Ink Green | `#1C241D` | 어두운 녹색 텍스트 |
| 보조 텍스트 | Sage Gray | `#7D8F82` | 차분한 회녹색 |

감성 결과 색상:

| 결과 | sentiment 값 | 배지 배경색 | 배지 글자색 | 설명 |
|---|---|---|---|---|
| 긍정 | `positive` | `#3D8B5A` | `#FFFFFF` | 안정적인 녹색 |
| 부정 | `negative` | `#A14A3B` | `#FFFFFF` | 과하지 않은 벽돌색 |
| 중립 | `neutral` | `#6E7781` | `#FFFFFF` | 회색 계열 |

결과 색상 적용 규칙:

- 감성 결과는 반드시 `텍스트 라벨 + 색상 배지`로 함께 표시한다.
- 색상만 표시하고 텍스트를 생략하는 방식은 금지한다.
- 신뢰도 바의 채움 색상은 현재 감성 결과 색상과 동일하게 사용한다.
- 배지의 글자 대비를 위해 배경색은 위 HEX 값을 사용하고 글자는 흰색을 사용한다.

CSS 변수 권장값:

```css
:root {
  --sentiment-positive: #3D8B5A;
  --sentiment-negative: #A14A3B;
  --sentiment-neutral: #6E7781;
}
```

---

## 6. 타이포그래피

### 6.1 Hero 타이틀

```css
font-family: Georgia, "Times New Roman", serif;
font-weight: 400;
letter-spacing: -0.02em;
```

권장 문구:

```text
Forest of Words, Reading the Emotion
```

### 6.2 Hero 서브타이틀

```css
font-family: Georgia, "Times New Roman", serif;
font-size: 16px;
opacity: 0.9;
```

권장 문구:

```text
문장 속 감정의 결을 조용히 분석합니다.
```

### 6.3 본문 폰트

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Pretendard", "Noto Sans KR", sans-serif;
```

---

## 7. 컴포넌트 명세

### 7.1 Hero Section

필수 요소:

- 배경 이미지 또는 그라데이션
- 어두운 오버레이
- 중앙 정렬 타이틀
- 중앙 정렬 서브타이틀

CSS 방향:

```css
.hero {
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(rgba(20,41,26,.45), rgba(20,41,26,.65)), url("...");
  background-size: cover;
  background-position: center;
}
```

### 7.2 입력 카드

필수 요소:

- 카드 제목: `분석할 문장을 입력하세요`
- 안내 문장: `짧은 후기, 메모, 문장 속 감정을 분석할 수 있습니다.`
- textarea
- 글자 수 표시: `0 / 1000`
- 버튼: `감성 분석하기`
- 오류 메시지 영역

스타일 방향:

- 흰색 또는 안개색 반투명 배경
- 둥근 모서리
- 부드러운 그림자
- 넉넉한 패딩

### 7.3 버튼

기본 상태:

```text
감성 분석하기
```

로딩 상태:

```text
분석 중...
```

비활성화 상태:

- 버튼 클릭 불가
- 투명도 낮춤
- 커서 기본값

### 7.4 결과 카드

결과별 라벨:

| sentiment | labelKo | 표시 문구 |
|---|---|---|
| `positive` | 긍정 | 긍정적인 감정이 느껴져요 |
| `negative` | 부정 | 부정적인 감정이 느껴져요 |
| `neutral` | 중립 | 중립적인 문장으로 보여요 |

표시 요소:

```text
[초록색 배지] 긍정
긍정적인 감정이 느껴져요
신뢰도 87%
[초록색 신뢰도 바 ████████░░]
분석 이유: 문장 안에 만족과 기대를 나타내는 표현이 포함되어 있습니다.
```

결과별 표시 예시:

| sentiment | 화면 표시 | 배지/바 색상 |
|---|---|---|
| `positive` | `긍정` | `#3D8B5A` |
| `negative` | `부정` | `#A14A3B` |
| `neutral` | `중립` | `#6E7781` |


### 7.5 결과 색상 CSS 예시

```css
.result-badge {
  display: inline-flex;
  align-items: center;
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

## 8. 상태별 화면 정의

### 8.1 초기 상태

- 입력창은 비어 있다.
- 결과 카드는 숨긴다.
- 오류 메시지는 숨긴다.
- 버튼은 활성화한다.

### 8.2 입력 중 상태

- 글자 수가 실시간으로 변경된다.
- 1,000자를 초과하면 오류 메시지를 표시한다.
- 초과 시 분석 버튼을 비활성화한다.

### 8.3 로딩 상태

- 버튼 문구를 `분석 중...`으로 변경한다.
- 버튼을 비활성화한다.
- 결과 카드는 잠시 숨긴다.
- 오류 메시지는 초기화한다.

### 8.4 성공 상태

- 결과 카드를 표시한다.
- 감성 라벨, 신뢰도, 이유를 표시한다.
- 버튼을 다시 활성화한다.

### 8.5 실패 상태

- 오류 메시지를 표시한다.
- 결과 카드는 숨긴다.
- 버튼을 다시 활성화한다.

---

## 9. 반응형 기준

### 9.1 데스크톱

- 최대 콘텐츠 너비: `960px`
- 입력 카드 최대 너비: `720px`
- Hero 타이틀 크기: `36px ~ 48px`

### 9.2 태블릿

- 좌우 여백: `24px`
- 입력 카드 너비: `100%`
- Hero 타이틀 크기: `30px ~ 36px`

### 9.3 모바일

- 좌우 여백: `16px`
- Hero 높이: `300px` 내외
- Hero 타이틀 크기: `26px ~ 32px`
- textarea 높이: 최소 `160px`

---

## 10. 접근성 규칙

- textarea에는 반드시 label을 연결한다.
- 버튼에는 명확한 텍스트가 있어야 한다.
- 오류 메시지 영역에는 `role="alert"`를 사용할 수 있다.
- 결과 영역에는 `aria-live="polite"`를 사용할 수 있다.
- 색상만으로 결과를 구분하지 않는다. 반드시 텍스트 라벨도 함께 표시한다.
- 배경 이미지 위 텍스트는 오버레이를 사용해 대비를 확보한다.

---

## 11. 금지 사항

- 배경이 너무 밝아 흰색 타이틀이 보이지 않는 디자인 금지
- 과도한 애니메이션 금지
- 버튼이 여러 개처럼 보이는 복잡한 UI 금지
- 결과 색상만 보여주고 텍스트 라벨을 생략하는 방식 금지
- 모바일에서 입력창이 너무 작아지는 디자인 금지

---

## 12. 완료 기준

- 첨부 이미지와 유사한 숲 분위기가 반영되어 있다.
- 입력 카드와 결과 카드가 명확히 구분된다.
- 모바일에서도 입력과 분석이 가능하다.
- 오류 메시지가 눈에 잘 보인다.
- 결과 라벨, 신뢰도, 이유가 한눈에 들어온다.
- 텍스트 대비가 충분하다.
