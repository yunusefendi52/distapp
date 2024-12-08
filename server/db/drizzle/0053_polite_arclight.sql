PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_artifacts` (
	`id` text PRIMARY KEY NOT NULL,
	`fileObjectKey` text NOT NULL,
	`file_object_apk_key` text,
	`versionName2` text NOT NULL,
	`versionCode2` text NOT NULL,
	`releaseNotes` text,
	`createdAt` integer,
	`updatedAt` integer,
	`releaseId` integer NOT NULL,
	`extension` text,
	`packageName` text,
	`appsId` text,
	`organizationId` text
);
--> statement-breakpoint
INSERT INTO `__new_artifacts`("id", "fileObjectKey", "file_object_apk_key", "versionName2", "versionCode2", "releaseNotes", "createdAt", "updatedAt", "releaseId", "extension", "packageName", "appsId", "organizationId") SELECT "id", "fileObjectKey", "file_object_apk_key", "versionName2", "versionCode2", "releaseNotes", "createdAt", "updatedAt", "releaseId", "extension", "packageName", "appsId", "organizationId" FROM `artifacts`;--> statement-breakpoint
DROP TABLE `artifacts`;--> statement-breakpoint
ALTER TABLE `__new_artifacts` RENAME TO `artifacts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `artifacts_id_unique` ON `artifacts` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifacts_appsId_releaseId_unique` ON `artifacts` (`appsId`,`releaseId`);