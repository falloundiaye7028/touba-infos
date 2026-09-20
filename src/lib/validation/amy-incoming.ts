import { z } from "zod";

export const amyIncomingSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  meta: z
    .object({
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  socialPosts: z
    .object({
      whatsapp: z.string().optional(),
      facebook: z.string().optional(),
      twitter: z.string().optional(),
    })
    .optional(),
  categorie: z
    .enum([
      "Touba",
      "Politique",
      "Société",
      "Économie",
      "Religion",
      "Sport",
      "Culture",
      "International",
      "Technologies",
      "Santé",
      "Éducation",
    ])
    .default("Touba"),
  imageUrl: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
});

export type AmyIncomingInput = z.infer<typeof amyIncomingSchema>;
