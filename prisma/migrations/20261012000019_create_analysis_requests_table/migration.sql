-- CreateTable
CREATE TABLE `analysis_requests` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `service_id` BIGINT UNSIGNED NOT NULL,
    `order_id` BIGINT UNSIGNED NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `gender` ENUM('male', 'female') NULL,
    `birth_date` DATE NOT NULL,
    `birth_time` TIME(0) NULL,
    `birth_time_accuracy` ENUM('exact', 'approximate', 'unknown') NOT NULL DEFAULT 'exact',
    `birth_city` VARCHAR(255) NULL,
    `birth_country` VARCHAR(255) NULL,
    `questions` TEXT NULL,
    `extra_info` JSON NULL,
    `status` ENUM('pending_payment', 'pending', 'in_progress', 'completed', 'canceled') NOT NULL DEFAULT 'pending_payment',
    `admin_note` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `analysis_requests_user_id_idx`(`user_id`),
    INDEX `analysis_requests_service_id_idx`(`service_id`),
    INDEX `analysis_requests_order_id_idx`(`order_id`),
    INDEX `analysis_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `analysis_requests` ADD CONSTRAINT `analysis_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analysis_requests` ADD CONSTRAINT `analysis_requests_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analysis_requests` ADD CONSTRAINT `analysis_requests_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
