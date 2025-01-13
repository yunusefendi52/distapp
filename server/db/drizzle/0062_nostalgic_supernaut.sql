CREATE TABLE `users_app_subs` (
	`subsription_id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`user_id` text NOT NULL,
	`p_user_id` text,
	`currentPlan` text,
	`status` text,
	`status_formatted` text,
	`ends_at` integer,
	`renews_at` integer,
	`hook_event_name` text,
	`createdAt` integer,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_app_subs_subsription_id_unique` ON `users_app_subs` (`subsription_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_app_subs_customer_id_unique` ON `users_app_subs` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_user_app_subs_userId` ON `users_app_subs` (`user_id`);--> statement-breakpoint
DROP TABLE if exists `users_subs`;