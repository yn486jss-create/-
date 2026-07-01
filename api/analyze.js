import { analyzeWithOpenAI } from '../lib/openai.js';
import { saveAnalysisLog } from '../lib/supabase.js';

const LABELS = {
  positive: '긍정',
  negative: '부정',
  neutral: '중립'
};

/**
 * Vercel Serverless Function Handler
 * POST /api/analyze
 */
export default async function handler(req, res) {
  // 항상 JSON으로 응답하기 위해 Header 설정
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: '허용되지 않은 요청 방식입니다.'
      }
    });
  }

  const { text } = req.body || {};

  // 1. 유효성 검사 (존재 및 타입 체크)
  if (text === undefined || text === null || typeof text !== 'string') {
    return res.status(400).json({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '분석할 텍스트를 입력해주세요.'
      }
    });
  }

  const trimmedText = text.trim();

  // 2. 빈 문자열 체크
  if (trimmedText === '') {
    return res.status(400).json({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '분석할 텍스트를 입력해주세요.'
      }
    });
  }

  // 3. 1,000자 초과 체크
  if (trimmedText.length > 1000) {
    return res.status(400).json({
      ok: false,
      error: {
        code: 'TEXT_TOO_LONG',
        message: '입력 글자는 최대 1,000자까지 가능합니다.'
      }
    });
  }

  // 4. 환경 변수 설정 점검
  const model = 'gpt-4o-mini';
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      ok: false,
      error: {
        code: 'OPENAI_CONFIG_ERROR',
        message: '서버 설정이 올바르지 않습니다.'
      }
    });
  }

  try {
    // 5. OpenAI API 호출
    const aiResult = await analyzeWithOpenAI(trimmedText);

    // 6. labelKo 변환 (서버에서 수행)
    const normalizedResult = {
      sentiment: aiResult.sentiment,
      labelKo: LABELS[aiResult.sentiment] || '중립',
      confidence: aiResult.confidence,
      reason: aiResult.reason
    };

    // 7. Supabase DB에 성공 로그 저장
    const dbPayload = {
      input_text: trimmedText,
      sentiment: normalizedResult.sentiment,
      confidence: normalizedResult.confidence,
      reason: normalizedResult.reason,
      request_status: 'success',
      openai_model: model
    };
    
    // DB 저장 실패가 전체 요청 실패로 이어지지 않음
    const saved = await saveAnalysisLog(dbPayload);

    // 8. 성공 응답
    return res.status(200).json({
      ok: true,
      result: normalizedResult,
      saved: saved
    });

  } catch (error) {
    // OpenAI 분석 에러 또는 처리 과정의 에러 핸들링
    const errorCode = error.code || 'UNKNOWN_ERROR';
    let httpStatus = 500;
    let userMessage = '예상하지 못한 문제가 발생했습니다. 다시 시도해주세요.';

    if (errorCode === 'AI_ANALYSIS_FAILED') {
      httpStatus = 502;
      userMessage = '감성 분석 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    } else if (errorCode === 'OPENAI_CONFIG_ERROR') {
      httpStatus = 500;
      userMessage = '서버 설정이 올바르지 않습니다.';
    }

    // Supabase DB에 실패 로그 저장 시도
    const dbPayload = {
      input_text: trimmedText,
      request_status: 'failed',
      error_code: errorCode,
      error_message: userMessage,
      openai_model: model
    };
    await saveAnalysisLog(dbPayload);

    return res.status(httpStatus).json({
      ok: false,
      error: {
        code: errorCode,
        message: userMessage
      }
    });
  }
}
