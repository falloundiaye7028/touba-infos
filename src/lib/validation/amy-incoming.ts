import { z } from "zod";

import { INTEGRATION_CATEGORIES } from "@/lib/integrations/categories";

const shortText = (max: number) => z.string().trim().max(max);

// Les champs inconnus (ex. « statut », « publish ») sont ignorés par Zod :
// ils ne peuvent en aucun cas influencer le statut du brouillon créé.
export const amyIncomingSchema = z.object({
  title: z.string().trim().min(1).max(300),
  body: z.string().trim().min(1).max(100_000),
  meta: z
    .object({
      description: shortText(1_000).optional(),
      keywords: z.array(shortText(60).min(1)).max(20).optional(),
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
  imageUrl: z.string().url().max(2_000).optional(),
  sourceUrl: z.string().url().max(2_000).optional(),
});

export type AmyIncomingInput = z.infer<typeof amyIncomingSchema>;
