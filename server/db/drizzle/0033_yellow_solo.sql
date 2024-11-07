DROP INDEX IF EXISTS "apiKeys_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "apps_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "apps_organizationsId_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "artifacts_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "artifacts_appsId_releaseId_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "artifactsGroups_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "artifactsGroups_publicId_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "artifactsGroups_appsId_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "artifactsGroupsManager_artifactsId_artifactsGroupsId_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "organizations_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "organizations_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "organizationsPeople_userId_organizationId_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_providerUserId_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "providerUserId";--> statement-breakpoint
ALTER TABLE `purgeAppArtifact` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL DEFAULT (unixepoch('subsecond') * 1000);--> statement-breakpoint
CREATE UNIQUE INDEX `apiKeys_id_unique` ON `apiKeys` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `apps_id_unique` ON `apps` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `apps_organizationsId_name_unique` ON `apps` (`organizationsId`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifacts_id_unique` ON `artifacts` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifacts_appsId_releaseId_unique` ON `artifacts` (`appsId`,`releaseId`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifactsGroups_id_unique` ON `artifactsGroups` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifactsGroups_publicId_unique` ON `artifactsGroups` (`publicId`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifactsGroups_appsId_name_unique` ON `artifactsGroups` (`appsId`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifactsGroupsManager_artifactsId_artifactsGroupsId_unique` ON `artifactsGroupsManager` (`artifactsId`,`artifactsGroupsId`);--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_id_unique` ON `organizations` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_name_unique` ON `organizations` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `organizationsPeople_userId_organizationId_unique` ON `organizationsPeople` (`userId`,`organizationId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_providerUserId_unique` ON `users` (`providerUserId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `providerUserId` ON `users` (`providerUserId`);--> statement-breakpoint
ALTER TABLE `purgeAppArtifact` ALTER COLUMN "updatedAt" TO "updatedAt" integer NOT NULL DEFAULT (unixepoch('subsecond') * 1000);