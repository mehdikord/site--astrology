-- CreateTable
CREATE TABLE `analyses` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `analysis_request_id` BIGINT UNSIGNED NOT NULL,
    `admin_id` BIGINT UNSIGNED NULL,
    `title` VARCHAR(255) NULL,
    `summary` LONGTEXT NULL,
    `report_file` VARCHAR(255) NULL,
    `session_at` TIMESTAMP(0) NULL,
    `session_link` VARCHAR(500) NULL,
    `session_duration` SMALLINT UNSIGNED NULL,
    `delivered_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `analyses_analysis_request_id_key`(`analysis_request_id`),
    INDEX `analyses_admin_id_idx`(`admin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `analyses` ADD CONSTRAINT `analyses_analysis_request_id_fkey` FOREIGN KEY (`analysis_request_id`) REFERENCES `analysis_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analyses` ADD CONSTRAINT `analyses_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
