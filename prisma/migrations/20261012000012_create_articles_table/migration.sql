-- CreateTable
CREATE TABLE `articles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `article_category_id` BIGINT UNSIGNED NULL,
    `admin_id` BIGINT UNSIGNED NULL,
    `slug` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `excerpt` TEXT NULL,
    `image` VARCHAR(255) NULL,
    `content` LONGTEXT NOT NULL,
    `read_time` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `views` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `published_at` TIMESTAMP(0) NULL,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `articles_slug_key`(`slug`),
    INDEX `articles_article_category_id_idx`(`article_category_id`),
    INDEX `articles_admin_id_idx`(`admin_id`),
    INDEX `articles_status_published_at_idx`(`status`, `published_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_article_category_id_fkey` FOREIGN KEY (`article_category_id`) REFERENCES `article_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
