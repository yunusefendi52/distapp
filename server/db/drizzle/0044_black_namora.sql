ALTER TABLE `grouptester` RENAME COLUMN "userId" TO "testerId";--> statement-breakpoint
DROP INDEX IF EXISTS `userId_orgId_appId_groupId`;--> statement-breakpoint
CREATE UNIQUE INDEX `testerId_orgId_appId_groupId` ON `grouptester` (`testerId`,`organizationId`,`appsId`,`artifactGroupId`);--> statement-breakpoint
ALTER TABLE `grouptester` ALTER COLUMN "testerId" TO "testerId" text NOT NULL REFERENCES users(id) ON DELETE cascade ON UPDATE no action;