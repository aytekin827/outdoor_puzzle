CREATE TABLE `completion_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`play_session_id` text NOT NULL,
	`asset_key` text NOT NULL,
	`asset_url` text NOT NULL,
	`mime_type` text,
	`file_size` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`uploaded_at` integer NOT NULL,
	FOREIGN KEY (`play_session_id`) REFERENCES `play_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `event_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`play_session_id` text NOT NULL,
	`mission_id` text,
	`mission_session_id` text,
	`event_type` text NOT NULL,
	`payload_json` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`play_session_id`) REFERENCES `play_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mission_session_id`) REFERENCES `mission_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`prologue_type` text NOT NULL,
	`prologue_video_url` text,
	`prologue_slides_json` text,
	`epilogue_type` text,
	`epilogue_content` text,
	`epilogue_slides_json` text,
	`is_active` integer DEFAULT true,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `location_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`play_session_id` text NOT NULL,
	`mission_id` text,
	`mission_session_id` text,
	`event_type` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`accuracy_m` real,
	`captured_at` integer NOT NULL,
	FOREIGN KEY (`play_session_id`) REFERENCES `play_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mission_session_id`) REFERENCES `mission_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `mission_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`play_session_id` text NOT NULL,
	`mission_id` text NOT NULL,
	`order_index` integer NOT NULL,
	`started_at` integer,
	`ended_at` integer,
	`duration_ms` integer,
	`hint_count` integer DEFAULT 0 NOT NULL,
	`submission_count` integer DEFAULT 0 NOT NULL,
	`wrong_submission_count` integer DEFAULT 0 NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`play_session_id`) REFERENCES `play_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `missions` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`order_index` integer NOT NULL,
	`title` text NOT NULL,
	`checkpoint_instruction` text NOT NULL,
	`riddle_question` text NOT NULL,
	`mission_type` text DEFAULT 'text',
	`mission_video_url` text,
	`mission_slides_json` text,
	`answer` text NOT NULL,
	`hint` text,
	`image_asset_key` text,
	`image_url` text,
	`image_alt` text,
	`image_caption` text,
	`closing_instruction` text,
	`closing_instruction_type` text DEFAULT 'text',
	`closing_instruction_video_url` text,
	`closing_instruction_slides_json` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `play_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`game_id` text NOT NULL,
	`qr_token_id` text NOT NULL,
	`status` text DEFAULT 'ready' NOT NULL,
	`started_at` integer,
	`ended_at` integer,
	`total_duration_ms` integer,
	`last_mission_id` text,
	`hint_count` integer DEFAULT 0 NOT NULL,
	`submission_count` integer DEFAULT 0 NOT NULL,
	`wrong_submission_count` integer DEFAULT 0 NOT NULL,
	`completion_photo_uploaded` integer DEFAULT false NOT NULL,
	`location_permission_state` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`qr_token_id`) REFERENCES `qr_tokens`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`last_mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`qr_token_id` text NOT NULL,
	`nickname` text NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	`status` text NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`qr_token_id`) REFERENCES `qr_tokens`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `post_game_surveys` (
	`id` text PRIMARY KEY NOT NULL,
	`play_session_id` text NOT NULL,
	`age_range` text NOT NULL,
	`group_type` text NOT NULL,
	`group_type_other` text,
	`gender` text NOT NULL,
	`satisfaction_score` integer NOT NULL,
	`difficulty_score` integer NOT NULL,
	`comment` text,
	`submitted_at` integer NOT NULL,
	FOREIGN KEY (`play_session_id`) REFERENCES `play_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `post_game_surveys_play_session_id_unique` ON `post_game_surveys` (`play_session_id`);--> statement-breakpoint
CREATE TABLE `qr_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`game_id` text NOT NULL,
	`is_used` integer DEFAULT false,
	`used_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `qr_tokens_token_unique` ON `qr_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`play_session_id` text,
	`mission_id` text NOT NULL,
	`submitted_answer` text NOT NULL,
	`is_correct` integer NOT NULL,
	`submitted_at` integer NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`play_session_id`) REFERENCES `play_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE cascade
);
