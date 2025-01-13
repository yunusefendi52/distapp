ALTER TABLE `users_subs` RENAME COLUMN "user_id_v4" TO "customer_id";--> statement-breakpoint
DROP INDEX IF EXISTS `users_subs_user_id_v4_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_subs_customer_id_unique` ON `users_subs` (`customer_id`);