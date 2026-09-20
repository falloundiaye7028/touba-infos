-- Additive : ajoute un champ de métadonnées (ex. sourceUrl) aux articles.
ALTER TABLE "info_articles" ADD COLUMN "metadata" JSONB;
