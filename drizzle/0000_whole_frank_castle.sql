CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`prologue_type` text NOT NULL,
	`prologue_video_url` text,
	`prologue_slides_json` text,
	`is_active` integer DEFAULT true,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `missions` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`order_index` integer NOT NULL,
	`title` text NOT NULL,
	`checkpoint_instruction` text NOT NULL,
	`riddle_question` text NOT NULL,
	`answer` text NOT NULL,
	`hint` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
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
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`qr_token_id`) REFERENCES `qr_tokens`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `qr_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`game_id` text NOT NULL,
	`is_used` integer DEFAULT false,
	`used_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `qr_tokens_token_unique` ON `qr_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`mission_id` text NOT NULL,
	`submitted_answer` text NOT NULL,
	`is_correct` integer NOT NULL,
	`submitted_at` integer NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE no action
);
