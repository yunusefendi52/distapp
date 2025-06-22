ALTER TABLE `users` ADD `idv4` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_idv4_unique` ON `users` (`idv4`);