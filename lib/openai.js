import OpenAI from 'openai';

/**
 * OpenAI API를 사용해 텍스트의 감성을 분석합니다.
 * @param {string} text - 분석할 원본 텍스트
 * @returns {Promise<{sentiment: string, confidence: number, reason: string}>}
 */
export async function analyzeWithOpenAI(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = 'gpt-4o-mini';

  if (!apiKey) {
    const error = new Error('OpenAI API Key가 설정되지 않았습니다.');
    error.code = 'OPENAI_CONFIG_ERROR';
    throw error;
  }

  const openai = new OpenAI({ apiKey });

  const systemInstruction = `You are a sentiment analysis engine.
Analyze the user's text and classify the overall sentiment.
Return only structured data that matches the required schema.
Classify as:
- positive: mainly favorable, happy, satisfied, hopeful, thankful, or approving
- negative: mainly unhappy, angry, disappointed, worried, critical, or rejecting
- neutral: factual, mixed, unclear, balanced, or no strong emotion
The reason must be written in Korean in 1-2 short sentences.
The confidence must be a number from 0 to 100.`;

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: text }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'sentiment_analysis',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              sentiment: {
                type: 'string',
                enum: ['positive', 'negative', 'neutral']
              },
              confidence: {
                type: 'number',
                minimum: 0,
                maximum: 100
              },
              reason: {
                type: 'string'
              }
            },
            required: ['sentiment', 'confidence', 'reason']
          }
        }
      },
      temperature: 0,
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(content);

    // 반환 데이터 유효성 검증 및 보정
    if (!['positive', 'negative', 'neutral'].includes(result.sentiment)) {
      throw new Error('올바르지 않은 감성 분석 결과값입니다.');
    }

    if (typeof result.confidence !== 'number' || isNaN(result.confidence)) {
      throw new Error('신뢰도 점수가 올바르지 않습니다.');
    }

    result.confidence = Math.min(100, Math.max(0, result.confidence));

    if (typeof result.reason !== 'string' || result.reason.trim() === '') {
      throw new Error('분석 이유가 올바르지 않습니다.');
    }

    return result;
  } catch (error) {
    // 이미 에러 코드가 정의된 경우는 그대로 던짐
    if (error.code === 'OPENAI_CONFIG_ERROR') {
      throw error;
    }
    const apiError = new Error(error.message || 'OpenAI API 호출 실패');
    apiError.code = 'AI_ANALYSIS_FAILED';
    apiError.originalError = error;
    throw apiError;
  }
}
