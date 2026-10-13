-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `mobile` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NULL,
    `bio` TEXT NULL,
    `avatar` VARCHAR(255) NULL,
    `birth_date` DATE NULL,
    `gender` ENUM('male', 'female') NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `users_mobile_key`(`mobile`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
