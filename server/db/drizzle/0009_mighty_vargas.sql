ALTER TABLE artifactsGroups ADD `publicId` text;--> statement-breakpoint
CREATE UNIQUE INDEX `artifactsGroups_publicId_unique` ON `artifactsGroups` (`publicId`);