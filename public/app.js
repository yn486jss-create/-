const MAX_TEXT_LENGTH = 1000;

// DOM Elements
let sentimentText;
let charCount;
let analyzeButton;
let errorMessage;
let resultCard;
let resultLabel;
let confidenceText;
let confidenceBar;
let reasonText;

/**
 * 입력창의 텍스트를 읽고 앞뒤 공백을 제거하여 반환합니다.
 */
function getInputText() {
  return sentimentText.value.trim();
}

/**
 * 텍스트 값의 유효성을 검사합니다.
 * @param {string} text 
 * @returns {string|null} 에러 메시지 또는 정상 시 null
 */
function validateText(text) {
  if (!text) {
    return '분석할 텍스트를 입력해주세요.';
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return '입력 글자는 최대 1,000자까지 가능합니다.';
  }
  return null;
}

/**
 * 글자 수를 실시간으로 계산하여 화면에 표시하고, 버튼 활성화 상태를 업데이트합니다.
 */
function updateCharCount() {
  const currentLength = sentimentText.value.length;
  charCount.textContent = `${currentLength} / ${MAX_TEXT_LENGTH}`;

  if (currentLength > MAX_TEXT_LENGTH) {
    charCount.style.color = '#A14A3B'; // 1,000자 초과 시 붉은색 표시
    analyzeButton.disabled = true;
  } else {
    charCount.style.color = '';
    // 입력창이 비어있지 않으면 버튼 활성화 (로딩 중이 아닐 때만)
    analyzeButton.disabled = false;
  }
}

/**
 * 로딩 상태를 설정하여 중복 요청을 방지합니다.
 * @param {boolean} isLoading 
 */
function setLoading(isLoading) {
  if (isLoading) {
    analyzeButton.disabled = true;
    analyzeButton.textContent = '분석 중...';
  } else {
    analyzeButton.disabled = false;
    analyzeButton.textContent = '감성 분석하기';
  }
}

/**
 * 에러 메시지를 표시합니다.
 * @param {string} message 
 */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('is-hidden');
}

/**
 * 에러 메시지를 숨깁니다.
 */
function clearError() {
  errorMessage.textContent = '';
  errorMessage.classList.add('is-hidden');
}

/**
 * 결과 카드를 숨깁니다.
 */
function hideResult() {
  resultCard.classList.add('is-hidden');
}

/**
 * 결과를 화면에 렌더링하고 결과 카드를 표시합니다.
 * @param {object} result - { sentiment, labelKo, confidence, reason }
 */
function showResult(result) {
  const { sentiment, confidence, reason } = result;

  // 감성별 매핑 텍스트 및 클래스 지정
  let labelText = '';
  let badgeClass = '';

  if (sentiment === 'positive') {
    labelText = '긍정적인 감정이 느껴져요';
    badgeClass = 'is-positive';
  } else if (sentiment === 'negative') {
    labelText = '부정적인 감정이 느껴져요';
    badgeClass = 'is-negative';
  } else {
    labelText = '중립적인 문장으로 보여요';
    badgeClass = 'is-neutral';
  }

  // 1. 결과 배지 세팅
  resultLabel.textContent = labelText;
  resultLabel.className = 'result-badge'; // 클래스 초기화 후 재추가
  resultLabel.classList.add(badgeClass);

  // 2. 신뢰도 보정 및 텍스트 세팅
  const safeConfidence = Math.min(100, Math.max(0, Number(confidence)));
  confidenceText.textContent = safeConfidence;

  // 3. 신뢰도 바 세팅 및 색상 적용
  confidenceBar.style.width = `${safeConfidence}%`;
  confidenceBar.className = 'confidence-bar'; // 클래스 초기화 후 재추가
  confidenceBar.classList.add(badgeClass);

  // 4. 분석 이유 세팅 (XSS 방지를 위해 textContent 사용)
  reasonText.textContent = reason;

  // 5. 결과 카드 표시
  resultCard.classList.remove('is-hidden');
}

/**
 * 백엔드 API를 호출하여 감성 분석을 진행합니다.
 */
async function analyzeSentiment() {
  clearError();
  hideResult();

  const text = getInputText();
  const error = validateText(text);

  if (error) {
    showError(error);
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (response.ok && data.ok) {
      showResult(data.result);
    } else {
      // 서버에서 전달한 에러 메시지 표시
      const serverMessage = data.error?.message || '예상하지 못한 문제가 발생했습니다. 다시 시도해주세요.';
      showError(serverMessage);
    }
  } catch (err) {
    console.error('API 호출 중 네트워크 에러 발생:', err);
    showError('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
  } finally {
    setLoading(false);
  }
}

/**
 * 초기화 함수 - DOM 요소를 바인딩하고 이벤트를 등록합니다.
 */
function init() {
  sentimentText = document.getElementById('sentimentText');
  charCount = document.getElementById('charCount');
  analyzeButton = document.getElementById('analyzeButton');
  errorMessage = document.getElementById('errorMessage');
  resultCard = document.getElementById('resultCard');
  resultLabel = document.getElementById('resultLabel');
  confidenceText = document.getElementById('confidenceText');
  confidenceBar = document.getElementById('confidenceBar');
  reasonText = document.getElementById('reasonText');

  // 이벤트 연결
  sentimentText.addEventListener('input', updateCharCount);
  analyzeButton.addEventListener('click', analyzeSentiment);

  // 초기 상태 로드 시 글자 수 세팅
  updateCharCount();
}

// DOM 콘텐츠가 모두 로드되면 초기화 실행
document.addEventListener('DOMContentLoaded', init);
