PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_grouptester` (
	`id` text PRIMARY KEY NOT NULL,
	`testerId` text NOT NULL,
	`organizationId` text NOT NULL,
	`appsId` text NOT NULL,
	`artifactGroupId` text NOT NULL,
	FOREIGN KEY (`testerId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`appsId`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`artifactGroupId`) REFERENCES `artifactsGroups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_grouptester`("id", "testerId", "organizationId", "appsId", "artifactGroupId") SELECT "id", "testerId", "organizationId", "appsId", "artifactGroupId" FROM `grouptester`;--> statement-breakpoint
DROP TABLE `grouptester`;--> statement-breakpoint
ALTER TABLE `__new_grouptester` RENAME TO `grouptester`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `grouptester_id_unique` ON `grouptester` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `testerId_orgId_appId_groupId` ON `grouptester` (`testerId`,`organizationId`,`appsId`,`artifactGroupId`);--> statement-breakpoint
ALTER TABLE `artifacts` ADD `file_object_apk_key` text;