-- Additive and safe for existing Touba Infos content. Defaults retain centered crops.
ALTER TABLE "info_articles" ADD COLUMN IF NOT EXISTS "imageFocalX" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "info_articles" ADD COLUMN IF NOT EXISTS "imageFocalY" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "info_ebooks" ADD COLUMN IF NOT EXISTS "coverFocalX" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "info_ebooks" ADD COLUMN IF NOT EXISTS "coverFocalY" INTEGER NOT NULL DEFAULT 50;
