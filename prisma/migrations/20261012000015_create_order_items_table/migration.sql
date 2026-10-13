-- CreateTable
CREATE TABLE `order_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `item_type` ENUM('course', 'service') NOT NULL,
    `course_id` BIGINT UNSIGNED NULL,
    `service_id` BIGINT UNSIGNED NULL,
    `title` VARCHAR(255) NOT NULL,
    `unit_price` INTEGER UNSIGNED NOT NULL,
    `quantity` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    `discount` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `total` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `order_items_order_id_idx`(`order_id`),
    INDEX `order_items_course_id_idx`(`course_id`),
    INDEX `order_items_service_id_idx`(`service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
