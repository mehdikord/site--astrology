-- CreateTable
CREATE TABLE `service_faqs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `service_id` BIGINT UNSIGNED NOT NULL,
    `question` VARCHAR(500) NOT NULL,
    `answer` TEXT NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `service_faqs_service_id_idx`(`service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `service_faqs` ADD CONSTRAINT `service_faqs_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
