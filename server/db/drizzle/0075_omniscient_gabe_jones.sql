ALTER TABLE `organizations` ADD `retentionEnabled` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `organizations` ADD `retentionMode` text DEFAULT 'both';--> statement-breakpoint
ALTER TABLE `organizations` ADD `retentionKeepLatest` integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE `organizations` ADD `retentionKeepDays` integer DEFAULT 30;--> statement-breakpoint
UPDATE `apps` SET `retentionMode` = 'inherit' WHERE `retentionEnabled` IS NOT 1;
