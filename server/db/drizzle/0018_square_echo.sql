PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_apiKeys` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`organizationId` text,
	`appsId` text,
	FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`appsId`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_apiKeys`("id", "createdAt", "organizationId", "appsId") SELECT "id", "createdAt", "organizationId", "appsId" FROM `apiKeys`;--> statement-breakpoint
DROP TABLE `apiKeys`;--> statement-breakpoint
ALTER TABLE `__new_apiKeys` RENAME TO `apiKeys`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `apiKeys_id_unique` ON `apiKeys` (`id`);--> statement-breakpoint
CREATE TABLE `__new_apps` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`displayName` text NOT NULL,
	`osType` text,
	`organizationsId` text,
	FOREIGN KEY (`organizationsId`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_apps`("id", "name", "displayName", "osType", "organizationsId") SELECT "id", "name", "displayName", "osType", "organizationsId" FROM `apps`;--> statement-breakpoint
DROP TABLE `apps`;--> statement-breakpoint
ALTER TABLE `__new_apps` RENAME TO `apps`;--> statement-breakpoint
CREATE UNIQUE INDEX `apps_id_unique` ON `apps` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `apps_organizationsId_name_unique` ON `apps` (`organizationsId`,`name`);--> statement-breakpoint
CREATE TABLE `__new_artifacts` (
	`id` text PRIMARY KEY NOT NULL,
	`fileObjectKey` text NOT NULL,
	`versionName2` text NOT NULL,
	`versionCode2` text NOT NULL,
	`releaseNotes` text,
	`createdAt` integer,
	`updatedAt` integer,
	`releaseId` integer NOT NULL,
	`extension` text,
	`packageName` text,
	`appsId` text,
	FOREIGN KEY (`appsId`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_artifacts`("id", "fileObjectKey", "versionName2", "versionCode2", "releaseNotes", "createdAt", "updatedAt", "releaseId", "extension", "packageName", "appsId") SELECT "id", "fileObjectKey", "versionName2", "versionCode2", "releaseNotes", "createdAt", "updatedAt", "releaseId", "extension", "packageName", "appsId" FROM `artifacts`;--> statement-breakpoint
DROP TABLE `artifacts`;--> statement-breakpoint
ALTER TABLE `__new_artifacts` RENAME TO `artifacts`;--> statement-breakpoint
CREATE UNIQUE INDEX `artifacts_id_unique` ON `artifacts` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifacts_appsId_releaseId_unique` ON `artifacts` (`appsId`,`releaseId`);--> statement-breakpoint
CREATE TABLE `__new_artifactsGroups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`appsId` text,
	`publicId` text,
	FOREIGN KEY (`appsId`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_artifactsGroups`("id", "name", "appsId", "publicId") SELECT "id", "name", "appsId", "publicId" FROM `artifactsGroups`;--> statement-breakpoint
DROP TABLE `artifactsGroups`;--> statement-breakpoint
ALTER TABLE `__new_artifactsGroups` RENAME TO `artifactsGroups`;--> statement-breakpoint
CREATE UNIQUE INDEX `artifactsGroups_id_unique` ON `artifactsGroups` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifactsGroups_publicId_unique` ON `artifactsGroups` (`publicId`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifactsGroups_appsId_name_unique` ON `artifactsGroups` (`appsId`,`name`);--> statement-breakpoint
CREATE TABLE `__new_artifactsGroupsManager` (
	`artifactsId` text NOT NULL,
	`artifactsGroupsId` text NOT NULL,
	FOREIGN KEY (`artifactsId`) REFERENCES `artifacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`artifactsGroupsId`) REFERENCES `artifactsGroups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_artifactsGroupsManager`("artifactsId", "artifactsGroupsId") SELECT "artifactsId", "artifactsGroupsId" FROM `artifactsGroupsManager`;--> statement-breakpoint
DROP TABLE `artifactsGroupsManager`;--> statement-breakpoint
ALTER TABLE `__new_artifactsGroupsManager` RENAME TO `artifactsGroupsManager`;--> statement-breakpoint
CREATE UNIQUE INDEX `artifactsGroupsManager_artifactsId_artifactsGroupsId_unique` ON `artifactsGroupsManager` (`artifactsId`,`artifactsGroupsId`);--> statement-breakpoint
CREATE TABLE `__new_organizationsPeople` (
	`userId` text,
	`organizationId` text,
	`createdAt` integer,
	`role` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_organizationsPeople`("userId", "organizationId", "createdAt", "role") SELECT "userId", "organizationId", "createdAt", "role" FROM `organizationsPeople`;--> statement-breakpoint
DROP TABLE `organizationsPeople`;--> statement-breakpoint
ALTER TABLE `__new_organizationsPeople` RENAME TO `organizationsPeople`;--> statement-breakpoint
CREATE UNIQUE INDEX `organizationsPeople_userId_organizationId_unique` ON `organizationsPeople` (`userId`,`organizationId`);