-- CreateTable
CREATE TABLE `testimonials` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL,
    `service_id` BIGINT UNSIGNED NULL,
    `course_id` BIGINT UNSIGNED NULL,
    `name` VARCHAR(255) NOT NULL,
    `subtitle` VARCHAR(255) NULL,
    `avatar` VARCHAR(255) NULL,
    `content` TEXT NOT NULL,
    `rating` TINYINT UNSIGNED NOT NULL DEFAULT 5,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `testimonials_user_id_idx`(`user_id`),
    INDEX `testimonials_service_id_idx`(`service_id`),
    INDEX `testimonials_course_id_idx`(`course_id`),
    INDEX `testimonials_is_active_sort_order_idx`(`is_active`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
