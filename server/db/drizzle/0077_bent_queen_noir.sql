ALTER TABLE `apps` ADD `retentionKeepLatest2` integer;--> statement-breakpoint
ALTER TABLE `apps` ADD `retentionKeepDays2` integer;--> statement-breakpoint
ALTER TABLE `apps` DROP COLUMN `retentionKeepLatest`;--> statement-breakpoint
ALTER TABLE `apps` DROP COLUMN `retentionKeepDays`;--> statement-breakpoint
ALTER TABLE `artifactsGroups` ADD `retentionKeepLatest2` integer;--> statement-breakpoint
ALTER TABLE `artifactsGroups` ADD `retentionKeepDays2` integer;--> statement-breakpoint
ALTER TABLE `artifactsGroups` DROP COLUMN `retentionKeepLatest`;--> statement-breakpoint
ALTER TABLE `artifactsGroups` DROP COLUMN `retentionKeepDays`;--> statement-breakpoint
ALTER TABLE `organizations` ADD `retentionKeepLatest2` integer;--> statement-breakpoint
ALTER TABLE `organizations` ADD `retentionKeepDays2` integer;--> statement-breakpoint
ALTER TABLE `organizations` DROP COLUMN `retentionKeepLatest`;--> statement-breakpoint
ALTER TABLE `organizations` DROP COLUMN `retentionKeepDays`;