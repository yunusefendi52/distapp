CREATE TABLE `grouptester` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`organizationId` text,
	`appsId` text,
	`artifactGroupId` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`appsId`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`artifactGroupId`) REFERENCES `artifactsGroups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `grouptester_id_unique` ON `grouptester` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `userId_orgId_appId_groupId` ON `grouptester` (`userId`,`organizationId`,`userId`,`artifactGroupId`);