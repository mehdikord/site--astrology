-- CreateTable
CREATE TABLE `orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `discount_code_id` BIGINT UNSIGNED NULL,
    `order_number` VARCHAR(50) NOT NULL,
    `subtotal` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `discount_amount` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `total` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `status` ENUM('pending', 'paid', 'failed', 'canceled', 'refunded') NOT NULL DEFAULT 'pending',
    `paid_at` TIMESTAMP(0) NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `orders_order_number_key`(`order_number`),
    INDEX `orders_user_id_idx`(`user_id`),
    INDEX `orders_discount_code_id_idx`(`discount_code_id`),
    INDEX `orders_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_discount_code_id_fkey` FOREIGN KEY (`discount_code_id`) REFERENCES `discount_codes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
