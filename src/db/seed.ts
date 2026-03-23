import { db } from './index';
import { games, qrTokens, players, missions, submissions } from './schema';
import * as crypto from 'crypto';

// Use crypto.randomUUID for environments that support it, else fallback
const generateId = () => crypto.randomUUID();

async function main() {
  console.log("Seeding Database...");

  // 1. Create a dummy Game
  const gameId = generateId();
  db.insert(games).values({
    id: gameId,
    title: "한밤의 야외 방탈출: 비밀정원",
    description: "공원 곳곳에 숨겨진 단서를 찾아 비밀을 풀고 탈출하세요.",
    prologueType: "slide",
    prologueSlidesJson: JSON.stringify([
      "https://images.unsplash.com/photo-1542461019-da41de2aaff3?w=800&q=80",
      "https://images.unsplash.com/photo-1506744626753-339833cb9e45?w=800&q=80",
      "https://images.unsplash.com/photo-1444464666168-49b626428e8f?w=800&q=80"
    ]),
    isActive: true,
    createdAt: Date.now()
  }).run();

  // 2. Create Missions
  const mission1Id = generateId();
  const mission2Id = generateId();
  const mission3Id = generateId();

  db.insert(missions).values([
    {
      id: mission1Id,
      gameId: gameId,
      orderIndex: 1,
      title: "첫 번째 단서",
      checkpointInstruction: "입구의 큰 참나무 아래로 가보세요.",
      riddleQuestion: "나무 기둥에 새겨진 4자리 숫자는 무엇인가요? (정답: 1234)",
      answer: "1234",
      hint: "나무의 남쪽 부분을 잘 보세요.",
      createdAt: Date.now()
    },
    {
      id: mission2Id,
      gameId: gameId,
      orderIndex: 2,
      title: "두 번째 단서",
      checkpointInstruction: "공원 중앙의 분수대로 이동하세요.",
      riddleQuestion: "분수대 바닥에 그려진 동물의 이름은? (정답: 사자)",
      answer: "사자",
      hint: "갈기가 있는 짐승입니다.",
      createdAt: Date.now()
    },
    {
      id: mission3Id,
      gameId: gameId,
      orderIndex: 3,
      title: "마지막 문",
      checkpointInstruction: "공원 북쪽의 작은 정자로 가세요.",
      riddleQuestion: "이 정자가 지어진 연도는 언제인가요? 힌트와 첫 번째 단서를 조합해보세요. (정답: 2026)",
      answer: "2026",
      hint: "간판을 확인하세요.",
      createdAt: Date.now()
    }
  ]).run();

  // 3. Create QR Tokens
  const tokenList = ["mock-token-1", "mock-token-2", "mock-token-3"];
  for (const token of tokenList) {
    db.insert(qrTokens).values({
      id: generateId(),
      token: token,
      gameId: gameId,
      isUsed: false,
      createdAt: Date.now()
    }).run();
  }

  console.log("Seeding complete. Use 'mock-token-1' to start testing.");
}

main().catch(err => {
  console.error("Failed to seed db", err);
  process.exit(1);
});
