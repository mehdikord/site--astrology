-- CreateTable
CREATE TABLE `settings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(255) NOT NULL,
    `value` TEXT NULL,
    `group` VARCHAR(100) NOT NULL DEFAULT 'general',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `settings_key_key`(`key`),
    INDEX `settings_group_idx`(`group`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
