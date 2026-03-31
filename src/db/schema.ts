import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const games = sqliteTable("games", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  prologueType: text("prologue_type").notNull(), // 'video' | 'slide'
  prologueVideoUrl: text("prologue_video_url"),
  prologueSlidesJson: text("prologue_slides_json"), // JSON stringified array of URLs
  epilogueType: text("epilogue_type"), // 'text' | 'slide'
  epilogueContent: text("epilogue_content"),
  epilogueSlidesJson: text("epilogue_slides_json"), // JSON stringified array of URLs
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at").notNull(),
});

export const qrTokens = sqliteTable("qr_tokens", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  gameId: text("game_id").notNull().references(() => games.id, { onDelete: 'cascade' }),
  isUsed: integer("is_used", { mode: 'boolean' }).default(false),
  usedAt: integer("used_at"),
  createdAt: integer("created_at").notNull(),
});

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  gameId: text("game_id").notNull().references(() => games.id, { onDelete: 'cascade' }),
  qrTokenId: text("qr_token_id").notNull().references(() => qrTokens.id, { onDelete: 'cascade' }),
  nickname: text("nickname").notNull(),
  startedAt: integer("started_at"),
  completedAt: integer("completed_at"),
  status: text("status").notNull(), // 'ready' | 'playing' | 'completed'
});

export const missions = sqliteTable("missions", {
  id: text("id").primaryKey(),
  gameId: text("game_id").notNull().references(() => games.id, { onDelete: 'cascade' }),
  orderIndex: integer("order_index").notNull(),
  title: text("title").notNull(),
  checkpointInstruction: text("checkpoint_instruction").notNull(),
  riddleQuestion: text("riddle_question").notNull(),
  answer: text("answer").notNull(),
  hint: text("hint"),
  imageAssetKey: text("image_asset_key"),
  imageUrl: text("image_url"),
  imageAlt: text("image_alt"),
  imageCaption: text("image_caption"),
  createdAt: integer("created_at").notNull(),
});

export const playSessions = sqliteTable("play_sessions", {
  id: text("id").primaryKey(),
  playerId: text("player_id").notNull().references(() => players.id, { onDelete: 'cascade' }),
  gameId: text("game_id").notNull().references(() => games.id, { onDelete: 'cascade' }),
  qrTokenId: text("qr_token_id").notNull().references(() => qrTokens.id, { onDelete: 'cascade' }),
  status: text("status").notNull().default("ready"), // 'ready' | 'playing' | 'completed' | 'abandoned'
  startedAt: integer("started_at"),
  endedAt: integer("ended_at"),
  totalDurationMs: integer("total_duration_ms"),
  lastMissionId: text("last_mission_id").references(() => missions.id, { onDelete: 'set null' }),
  hintCount: integer("hint_count").notNull().default(0),
  submissionCount: integer("submission_count").notNull().default(0),
  wrongSubmissionCount: integer("wrong_submission_count").notNull().default(0),
  completionPhotoUploaded: integer("completion_photo_uploaded", { mode: 'boolean' }).notNull().default(false),
  locationPermissionState: text("location_permission_state"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const missionSessions = sqliteTable("mission_sessions", {
  id: text("id").primaryKey(),
  playSessionId: text("play_session_id").notNull().references(() => playSessions.id, { onDelete: 'cascade' }),
  missionId: text("mission_id").notNull().references(() => missions.id, { onDelete: 'cascade' }),
  orderIndex: integer("order_index").notNull(),
  startedAt: integer("started_at"),
  endedAt: integer("ended_at"),
  durationMs: integer("duration_ms"),
  hintCount: integer("hint_count").notNull().default(0),
  submissionCount: integer("submission_count").notNull().default(0),
  wrongSubmissionCount: integer("wrong_submission_count").notNull().default(0),
  isCompleted: integer("is_completed", { mode: 'boolean' }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  playerId: text("player_id").notNull().references(() => players.id, { onDelete: 'cascade' }),
  playSessionId: text("play_session_id").references(() => playSessions.id, { onDelete: 'cascade' }),
  missionId: text("mission_id").notNull().references(() => missions.id, { onDelete: 'cascade' }),
  submittedAnswer: text("submitted_answer").notNull(),
  isCorrect: integer("is_correct", { mode: 'boolean' }).notNull(),
  submittedAt: integer("submitted_at").notNull(),
});

export const postGameSurveys = sqliteTable("post_game_surveys", {
  id: text("id").primaryKey(),
  playSessionId: text("play_session_id").notNull().unique().references(() => playSessions.id, { onDelete: 'cascade' }),
  ageRange: text("age_range").notNull(),
  groupType: text("group_type").notNull(),
  groupTypeOther: text("group_type_other"),
  gender: text("gender").notNull(),
  satisfactionScore: integer("satisfaction_score").notNull(),
  difficultyScore: integer("difficulty_score").notNull(),
  comment: text("comment"),
  submittedAt: integer("submitted_at").notNull(),
});

export const completionPhotos = sqliteTable("completion_photos", {
  id: text("id").primaryKey(),
  playSessionId: text("play_session_id").notNull().references(() => playSessions.id, { onDelete: 'cascade' }),
  assetKey: text("asset_key").notNull(),
  assetUrl: text("asset_url").notNull(),
  mimeType: text("mime_type"),
  fileSize: integer("file_size"),
  status: text("status").notNull().default("active"),
  uploadedAt: integer("uploaded_at").notNull(),
});

export const locationLogs = sqliteTable("location_logs", {
  id: text("id").primaryKey(),
  playSessionId: text("play_session_id").notNull().references(() => playSessions.id, { onDelete: 'cascade' }),
  missionId: text("mission_id").references(() => missions.id, { onDelete: 'cascade' }),
  missionSessionId: text("mission_session_id").references(() => missionSessions.id, { onDelete: 'cascade' }),
  eventType: text("event_type").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  accuracyM: real("accuracy_m"),
  capturedAt: integer("captured_at").notNull(),
});

export const eventLogs = sqliteTable("event_logs", {
  id: text("id").primaryKey(),
  playSessionId: text("play_session_id").notNull().references(() => playSessions.id, { onDelete: 'cascade' }),
  missionId: text("mission_id").references(() => missions.id, { onDelete: 'cascade' }),
  missionSessionId: text("mission_session_id").references(() => missionSessions.id, { onDelete: 'cascade' }),
  eventType: text("event_type").notNull(),
  payloadJson: text("payload_json"),
  createdAt: integer("created_at").notNull(),
});
