-- CreateTable
CREATE TABLE `lesson_progress` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `course_lesson_id` BIGINT UNSIGNED NOT NULL,
    `watched_seconds` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `completed_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `lesson_progress_course_lesson_id_idx`(`course_lesson_id`),
    UNIQUE INDEX `lesson_progress_user_id_course_lesson_id_key`(`user_id`, `course_lesson_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lesson_progress` ADD CONSTRAINT `lesson_progress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lesson_progress` ADD CONSTRAINT `lesson_progress_course_lesson_id_fkey` FOREIGN KEY (`course_lesson_id`) REFERENCES `course_lessons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
