CREATE TABLE `artifacts` (
	`id` text PRIMARY KEY NOT NULL,
	`fileObjectKey` text DEFAULT '' NOT NULL,
	`releaseNotes` text,
	`createdAt` integer,
	`updatedAt` integer,
	`releaseId` integer NOT NULL,
	`appsId` integer,
	FOREIGN KEY (`appsId`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `artifactsGroups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`appsId` integer,
	FOREIGN KEY (`appsId`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `artifactsGroupsManager` (
	`artifactsId` text NOT NULL,
	`artifactsGroupsId` text NOT NULL,
	FOREIGN KEY (`artifactsId`) REFERENCES `artifacts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`artifactsGroupsId`) REFERENCES `artifactsGroups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `artifacts_id_unique` ON `artifacts` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifacts_appsId_releaseId_unique` ON `artifacts` (`appsId`,`releaseId`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifactsGroups_id_unique` ON `artifactsGroups` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifactsGroups_appsId_name_unique` ON `artifactsGroups` (`appsId`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifactsGroupsManager_artifactsId_artifactsGroupsId_unique` ON `artifactsGroupsManager` (`artifactsId`,`artifactsGroupsId`);