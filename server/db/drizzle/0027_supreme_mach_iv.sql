ALTER TABLE `users` ADD `providerUserId` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_providerUserId_unique` ON `users` (`providerUserId`);--> statement-breakpoint
CREATE INDEX `providerUserId` ON `users` (`providerUserId`);