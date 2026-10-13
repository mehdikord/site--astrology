-- CreateTable
CREATE TABLE `course_enrollments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `course_id` BIGINT UNSIGNED NOT NULL,
    `order_id` BIGINT UNSIGNED NULL,
    `source` ENUM('purchase', 'admin', 'gift') NOT NULL DEFAULT 'purchase',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `expires_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `course_enrollments_course_id_idx`(`course_id`),
    INDEX `course_enrollments_order_id_idx`(`order_id`),
    UNIQUE INDEX `course_enrollments_user_id_course_id_key`(`user_id`, `course_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_enrollments` ADD CONSTRAINT `course_enrollments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_enrollments` ADD CONSTRAINT `course_enrollments_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_enrollments` ADD CONSTRAINT `course_enrollments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
