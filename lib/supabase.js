import { createClient } from '@supabase/supabase-js';

/**
 * Supabase 서버 사이드용 클라이언트를 생성합니다.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    const error = new Error('Supabase URL 또는 Service Role Key가 설정되지 않았습니다.');
    error.code = 'SUPABASE_CONFIG_ERROR';
    throw error;
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

/**
 * 분석 로그를 Supabase 데이터베이스에 저장합니다.
 * @param {object} payload - 저장할 분석 결과 데이터 또는 실패 정보
 * @returns {Promise<boolean>} 저장 성공 여부
 */
export async function saveAnalysisLog(payload) {
  try {
    const supabase = createSupabaseServerClient();
    
    const { error } = await supabase
      .from('sentiment_analysis_logs')
      .insert([payload]);

    if (error) {
      console.error('Supabase DB 저장 실패:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Supabase DB 연결 실패 또는 설정 오류:', error.message);
    return false;
  }
}
