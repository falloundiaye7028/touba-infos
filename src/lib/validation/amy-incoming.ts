import { z } from "zod";

import { INTEGRATION_CATEGORIES } from "@/lib/integrations/categories";

const shortText = (max: number) => z.string().trim().max(max);

/** URL http(s) uniquement : refuse javascript:, data:, file:… */
const webUrl = z
  .string()
  .url()
  .max(2_000)
  .refine((value) => /^https?:\/\//i.test(value), "URL http(s) requise.");

// Les champs inconnus (ex. « statut », « publish ») sont ignorés par Zod :
// ils ne peuvent en aucun cas influencer le statut du brouillon créé.
export const amyIncomingSchema = z.object({
  title: z.string().trim().min(1).max(500),
  body: z.string().trim().min(1).max(200_000),
  meta: z
    .object({
      description: shortText(2_000).optional(),
      keywords: z.array(shortText(100).min(1)).max(50).optional(),
    })
    .optional(),
  socialPosts: z
    .object({
      whatsapp: shortText(5_000).optional(),
      facebook: shortText(5_000).optional(),
      twitter: shortText(1_000).optional(),
    })
    .optional(),
  categorie: z.enum(INTEGRATION_CATEGORIES).default("Touba"),
  imageUrl: webUrl.optional(),
  sourceUrl: webUrl.optional(),
});

export type AmyIncomingInput = z.infer<typeof amyIncomingSchema>;
