import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const games = sqliteTable("games", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  prologueType: text("prologue_type").notNull(), // 'video' | 'slide'
  prologueVideoUrl: text("prologue_video_url"),
  prologueSlidesJson: text("prologue_slides_json"), // JSON stringified array of URLs
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at").notNull(),
});

export const qrTokens = sqliteTable("qr_tokens", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  gameId: text("game_id").notNull().references(() => games.id),
  isUsed: integer("is_used", { mode: 'boolean' }).default(false),
  usedAt: integer("used_at"),
  createdAt: integer("created_at").notNull(),
});

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  gameId: text("game_id").notNull().references(() => games.id),
  qrTokenId: text("qr_token_id").notNull().references(() => qrTokens.id),
  nickname: text("nickname").notNull(),
  startedAt: integer("started_at"),
  completedAt: integer("completed_at"),
  status: text("status").notNull(), // 'ready' | 'playing' | 'completed'
});

export const missions = sqliteTable("missions", {
  id: text("id").primaryKey(),
  gameId: text("game_id").notNull().references(() => games.id),
  orderIndex: integer("order_index").notNull(),
  title: text("title").notNull(),
  checkpointInstruction: text("checkpoint_instruction").notNull(),
  riddleQuestion: text("riddle_question").notNull(),
  answer: text("answer").notNull(),
  hint: text("hint"),
  createdAt: integer("created_at").notNull(),
});

export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  playerId: text("player_id").notNull().references(() => players.id),
  missionId: text("mission_id").notNull().references(() => missions.id),
  submittedAnswer: text("submitted_answer").notNull(),
  isCorrect: integer("is_correct", { mode: 'boolean' }).notNull(),
  submittedAt: integer("submitted_at").notNull(),
});
