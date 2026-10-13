-- CreateTable
CREATE TABLE `course_lessons` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `course_chapter_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `video_url` VARCHAR(500) NULL,
    `attachment` VARCHAR(500) NULL,
    `duration` INTEGER UNSIGNED NULL,
    `is_free` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `course_lessons_course_chapter_id_idx`(`course_chapter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_lessons` ADD CONSTRAINT `course_lessons_course_chapter_id_fkey` FOREIGN KEY (`course_chapter_id`) REFERENCES `course_chapters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
