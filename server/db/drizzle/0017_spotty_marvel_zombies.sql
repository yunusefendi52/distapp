CREATE TABLE `uploadtemp` (
	`id` text PRIMARY KEY NOT NULL,
	`fileKey` text NOT NULL,
	`createdBy` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uploadtemp_id_unique` ON `uploadtemp` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uploadtemp_fileKey_unique` ON `uploadtemp` (`fileKey`);--> statement-breakpoint
CREATE UNIQUE INDEX `uploadtemp_id_createdBy_unique` ON `uploadtemp` (`id`,`createdBy`);