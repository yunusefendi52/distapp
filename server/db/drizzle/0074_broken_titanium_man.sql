ALTER TABLE `apps` ADD `retentionEnabled` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `apps` ADD `retentionMode` text DEFAULT 'both';--> statement-breakpoint
ALTER TABLE `apps` ADD `retentionKeepLatest` integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE `apps` ADD `retentionKeepDays` integer DEFAULT 30;--> statement-breakpoint
ALTER TABLE `artifactsGroups` ADD `retentionEnabled` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `artifactsGroups` ADD `retentionMode` text DEFAULT 'inherit';--> statement-breakpoint
ALTER TABLE `artifactsGroups` ADD `retentionKeepLatest` integer;--> statement-breakpoint
ALTER TABLE `artifactsGroups` ADD `retentionKeepDays` integer;