-- CreateTable
CREATE TABLE `transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `order_id` BIGINT UNSIGNED NULL,
    `amount` INTEGER UNSIGNED NOT NULL,
    `gateway` VARCHAR(50) NOT NULL,
    `authority` VARCHAR(255) NULL,
    `reference_id` VARCHAR(255) NULL,
    `card_number` VARCHAR(30) NULL,
    `status` ENUM('pending', 'success', 'failed', 'canceled') NOT NULL DEFAULT 'pending',
    `description` TEXT NULL,
    `gateway_response` JSON NULL,
    `paid_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `transactions_authority_key`(`authority`),
    INDEX `transactions_user_id_idx`(`user_id`),
    INDEX `transactions_order_id_idx`(`order_id`),
    INDEX `transactions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
