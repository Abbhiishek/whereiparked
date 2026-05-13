CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`parked_at` integer NOT NULL,
	`ended_at` integer,
	`expires_at` integer,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`accuracy_m` real,
	`note` text,
	`photo_local_uri` text,
	`voice_local_uri` text,
	`voice_duration_sec` integer,
	`reminder_notification_id` text,
	`client_updated_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_parked_at` ON `sessions` (`parked_at`);--> statement-breakpoint
CREATE INDEX `idx_sessions_active` ON `sessions` (`ended_at`);