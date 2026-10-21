ALTER TABLE `apps` ADD `retentionMode2` text;--> statement-breakpoint
ALTER TABLE `apps` DROP COLUMN `retentionMode`;--> statement-breakpoint
ALTER TABLE `organizations` ADD `retentionMode2` text;--> statement-breakpoint
ALTER TABLE `organizations` DROP COLUMN `retentionMode`;