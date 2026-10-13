-- CreateTable
CREATE TABLE `verification_codes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `mobile` VARCHAR(20) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `attempts` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `expires_at` TIMESTAMP(0) NOT NULL,
    `used_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `verification_codes_mobile_idx`(`mobile`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
