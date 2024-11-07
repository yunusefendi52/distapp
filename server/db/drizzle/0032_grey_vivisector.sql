CREATE TABLE `purgeAppArtifact` (
	`orgId` text,
	`appId` text,
	`createdAt` integer,
	`updatedAt` integer,
	PRIMARY KEY(`orgId`, `appId`)
);
