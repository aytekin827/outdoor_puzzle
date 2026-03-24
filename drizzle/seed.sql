-- D1 Remote Seeding Script
-- 명령어: npx wrangler d1 execute outdoor_puzzle --remote --file=./drizzle/seed.sql

-- 1. 더미 게임 데이터 삽입
INSERT OR IGNORE INTO games (
  id, title, description, prologue_type, prologue_slides_json, is_active, created_at
) VALUES (
  'game-uuid-1111', 
  '한밤의 야외 방탈출: 비밀정원 (D1 버전)', 
  '공원 곳곳에 숨겨진 단서를 찾아 비밀을 풀고 탈출하세요.', 
  'slide', 
  '["https://images.unsplash.com/photo-1542461019-da41de2aaff3?w=800&q=80","https://images.unsplash.com/photo-1506744626753-339833cb9e45?w=800&q=80","https://images.unsplash.com/photo-1444464666168-49b626428e8f?w=800&q=80"]', 
  1, 
  1711200000000
);

-- 2. 미션 3개 생성
INSERT OR IGNORE INTO missions (
  id, game_id, order_index, title, checkpoint_instruction, riddle_question, answer, hint, created_at
) VALUES 
  ('mission-uuid-1111', 'game-uuid-1111', 1, '첫 번째 단서', '입구의 큰 참나무 아래로 가보세요.', '나무 기둥에 새겨진 4자리 숫자는 무엇인가요? (정답: 1234)', '1234', '나무의 남쪽 부분을 잘 보세요.', 1711200000000),
  ('mission-uuid-2222', 'game-uuid-1111', 2, '두 번째 단서', '공원 중앙의 분수대로 이동하세요.', '분수대 바닥에 그려진 동물의 이름은? (정답: 사자)', '사자', '갈기가 있는 짐승입니다.', 1711200000000),
  ('mission-uuid-3333', 'game-uuid-1111', 3, '마지막 문', '공원 북쪽의 작은 정자로 가세요.', '이 정자가 지어진 연도는 언제인가요? (정답: 2026)', '2026', '간판을 확인하세요.', 1711200000000);

-- 3. 테스트용 QR 토큰 3개 생성
INSERT OR IGNORE INTO qr_tokens (
  id, token, game_id, is_used, created_at
) VALUES 
  ('token-uuid-1111', 'mock-token-1', 'game-uuid-1111', 0, 1711200000000),
  ('token-uuid-2222', 'mock-token-2', 'game-uuid-1111', 0, 1711200000000),
  ('token-uuid-3333', 'mock-token-3', 'game-uuid-1111', 0, 1711200000000);
