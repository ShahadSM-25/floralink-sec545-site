CREATE TABLE `customer_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`passwordHash` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastPasswordChangedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_accounts_email_unique` UNIQUE(`email`)
);
