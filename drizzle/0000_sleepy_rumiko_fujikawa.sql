CREATE TABLE `Activity` (
	`id` text PRIMARY KEY NOT NULL,
	`syncId` text NOT NULL,
	`event` text NOT NULL,
	`source` text NOT NULL,
	`objectType` text NOT NULL,
	`receivedAt` integer NOT NULL,
	`data` text NOT NULL,
	`userId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `SyncedObject` (
	`id` text PRIMARY KEY NOT NULL,
	`externalId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`source` text NOT NULL,
	`objectType` text NOT NULL,
	`data` text NOT NULL,
	`userId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL
);
