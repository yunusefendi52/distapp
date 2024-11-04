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
DROP INDEX IF EXISTS "uploadtemp_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "uploadtemp_fileKey_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "uploadtemp_id_createdBy_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
ALTER TABLE `apps` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL;--> statement-breakpoint
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
CREATE UNIQUE INDEX `uploadtemp_id_unique` ON `uploadtemp` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uploadtemp_fileKey_unique` ON `uploadtemp` (`fileKey`);--> statement-breakpoint
CREATE UNIQUE INDEX `uploadtemp_id_createdBy_unique` ON `uploadtemp` (`id`,`createdBy`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `apps` ALTER COLUMN "updatedAt" TO "updatedAt" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `artifactsGroups` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `artifactsGroups` ALTER COLUMN "updatedAt" TO "updatedAt" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ALTER COLUMN "updatedAt" TO "updatedAt" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "updatedAt" TO "updatedAt" integer NOT NULL;