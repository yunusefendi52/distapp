CREATE TABLE `users_subs` (
	`user_id` text PRIMARY KEY NOT NULL,
	`user_id_v4` text NOT NULL,
	`createdAt` integer,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_subs_user_id_unique` ON `users_subs` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_subs_user_id_v4_unique` ON `users_subs` (`user_id_v4`);--> statement-breakpoint
CREATE INDEX `idx_userId` ON `users_subs` (`user_id`);