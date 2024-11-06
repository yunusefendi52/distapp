PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_organizationsPeople` (
	`userId` text,
	`organizationId` text,
	`createdAt` integer,
	`role` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_organizationsPeople`("userId", "organizationId", "createdAt", "role") SELECT "userId", "organizationId", "createdAt", "role" FROM `organizationsPeople`;--> statement-breakpoint
DROP TABLE `organizationsPeople`;--> statement-breakpoint
ALTER TABLE `__new_organizationsPeople` RENAME TO `organizationsPeople`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `organizationsPeople_userId_organizationId_unique` ON `organizationsPeople` (`userId`,`organizationId`);