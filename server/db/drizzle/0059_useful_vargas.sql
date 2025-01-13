DROP INDEX IF EXISTS "apiKeys_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "apps_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "apps_organizationsId_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "artifacts_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "artifacts_appsId_releaseId_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "artifactsGroups_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "artifactsGroups_appsId_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "artifactsGroups_appsId_name_publicId_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "artifactsGroupsManager_artifactsId_artifactsGroupsId_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "grouptester_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "testerId_orgId_appId_groupId";--> statement-breakpoint
DROP INDEX IF EXISTS "key_value_key_group_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "organizations_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "organizations_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "organizationsPeople_userId_organizationId_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_createdAt";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_hasArtifact";--> statement-breakpoint
DROP INDEX IF EXISTS "users_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_providerUserId_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "providerUserId";--> statement-breakpoint
DROP INDEX IF EXISTS "users_subs_user_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_subs_customer_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_userId";--> statement-breakpoint
ALTER TABLE `users_subs` ALTER COLUMN "customer_id" TO "customer_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX `apiKeys_id_unique` ON `apiKeys` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `apps_id_unique` ON `apps` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `apps_organizationsId_name_unique` ON `apps` (`organizationsId`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifacts_id_unique` ON `artifacts` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifacts_appsId_releaseId_unique` ON `artifacts` (`appsId`,`releaseId`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifactsGroups_id_unique` ON `artifactsGroups` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifactsGroups_appsId_name_unique` ON `artifactsGroups` (`appsId`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifactsGroups_appsId_name_publicId_unique` ON `artifactsGroups` (`appsId`,`name`,`publicId`);--> statement-breakpoint
CREATE UNIQUE INDEX `artifactsGroupsManager_artifactsId_artifactsGroupsId_unique` ON `artifactsGroupsManager` (`artifactsId`,`artifactsGroupsId`);--> statement-breakpoint
CREATE UNIQUE INDEX `grouptester_id_unique` ON `grouptester` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `testerId_orgId_appId_groupId` ON `grouptester` (`testerId`,`organizationId`,`appsId`,`artifactGroupId`);--> statement-breakpoint
CREATE UNIQUE INDEX `key_value_key_group_unique` ON `key_value` (`key`,`group`);--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_id_unique` ON `organizations` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_name_unique` ON `organizations` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `organizationsPeople_userId_organizationId_unique` ON `organizationsPeople` (`userId`,`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_createdAt` ON `purgeAppArtifact` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_hasArtifact` ON `purgeAppArtifact` (`hasArtifact`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_providerUserId_unique` ON `users` (`providerUserId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `providerUserId` ON `users` (`providerUserId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_subs_user_id_unique` ON `users_subs` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_subs_customer_id_unique` ON `users_subs` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_userId` ON `users_subs` (`user_id`);--> statement-breakpoint
ALTER TABLE `users_subs` ADD `status` text;--> statement-breakpoint
ALTER TABLE `users_subs` ADD `current_period_start` integer;--> statement-breakpoint
ALTER TABLE `users_subs` ADD `current_period_end` integer;--> statement-breakpoint
ALTER TABLE `users_subs` ADD `started_at` integer;--> statement-breakpoint
ALTER TABLE `users_subs` ADD `cancelled_at` integer;--> statement-breakpoint
ALTER TABLE `users_subs` ADD `ended_at` integer;