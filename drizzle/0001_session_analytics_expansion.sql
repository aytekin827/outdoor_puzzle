ALTER TABLE `games` ADD `epilogue_type` text;
--> statement-breakpoint
ALTER TABLE `games` ADD `epilogue_content` text;
--> statement-breakpoint
ALTER TABLE `games` ADD `epilogue_slides_json` text;
--> statement-breakpoint
ALTER TABLE `missions` ADD `image_asset_key` text;
--> statement-breakpoint
ALTER TABLE `missions` ADD `image_url` text;
--> statement-breakpoint
ALTER TABLE `missions` ADD `image_alt` text;
--> statement-breakpoint
ALTER TABLE `missions` ADD `image_caption` text;
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
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`qr_token_id`) REFERENCES `qr_tokens`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`last_mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE no action
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
	FOREIGN KEY (`play_session_id`) REFERENCES `play_sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `submissions` ADD `play_session_id` text REFERENCES `play_sessions`(`id`);
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
	FOREIGN KEY (`play_session_id`) REFERENCES `play_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `post_game_surveys_play_session_id_unique` ON `post_game_surveys` (`play_session_id`);
--> statement-breakpoint
CREATE TABLE `completion_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`play_session_id` text NOT NULL,
	`asset_key` text NOT NULL,
	`asset_url` text NOT NULL,
	`mime_type` text,
	`file_size` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`uploaded_at` integer NOT NULL,
	FOREIGN KEY (`play_session_id`) REFERENCES `play_sessions`(`id`) ON UPDATE no action ON DELETE no action
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
	FOREIGN KEY (`play_session_id`) REFERENCES `play_sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`mission_session_id`) REFERENCES `mission_sessions`(`id`) ON UPDATE no action ON DELETE no action
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
	FOREIGN KEY (`play_session_id`) REFERENCES `play_sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`mission_session_id`) REFERENCES `mission_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `play_sessions_player_id_idx` ON `play_sessions` (`player_id`);
--> statement-breakpoint
CREATE INDEX `play_sessions_game_id_idx` ON `play_sessions` (`game_id`);
--> statement-breakpoint
CREATE INDEX `mission_sessions_play_session_id_idx` ON `mission_sessions` (`play_session_id`);
--> statement-breakpoint
CREATE INDEX `mission_sessions_mission_id_idx` ON `mission_sessions` (`mission_id`);
--> statement-breakpoint
CREATE INDEX `submissions_play_session_id_idx` ON `submissions` (`play_session_id`);
--> statement-breakpoint
CREATE INDEX `completion_photos_play_session_id_idx` ON `completion_photos` (`play_session_id`);
--> statement-breakpoint
CREATE INDEX `location_logs_play_session_id_idx` ON `location_logs` (`play_session_id`);
--> statement-breakpoint
CREATE INDEX `location_logs_mission_id_idx` ON `location_logs` (`mission_id`);
--> statement-breakpoint
CREATE INDEX `event_logs_play_session_id_idx` ON `event_logs` (`play_session_id`);
