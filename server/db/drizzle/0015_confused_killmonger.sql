CREATE TABLE `uploadTemp` (
	`id` text PRIMARY KEY NOT NULL,
	`fileKey` text NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uploadTemp_id_unique` ON `uploadTemp` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uploadTemp_fileKey_unique` ON `uploadTemp` (`fileKey`);--> statement-breakpoint
CREATE UNIQUE INDEX `uploadTemp_id_userId_unique` ON `uploadTemp` (`id`,`userId`);