CREATE TABLE `apiKeys` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`organizationId` text,
	`appsId` text,
	FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`appsId`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `apiKeys_id_unique` ON `apiKeys` (`id`);