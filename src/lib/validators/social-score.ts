import { z } from "zod";

export const updateSocialScoreSchema = z.object({
  socialScore: z.number().int().min(0).max(10),
  socialNotes: z.string().max(500).optional().nullable(),
});

export type UpdateSocialScoreInput = z.infer<typeof updateSocialScoreSchema>;
