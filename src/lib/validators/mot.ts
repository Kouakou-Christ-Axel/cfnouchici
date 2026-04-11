import { z } from "zod";

const categorieEnum = z.enum(["NOM", "VERBE", "ADJECTIF", "EXPRESSION", "ADVERBE"]);

export const createMotSchema = z.object({
  mot: z.string().min(1),
  definition: z.string().min(1),
  categorie: categorieEnum.optional(),
  exemples: z.array(z.string().min(1)).optional().default([]),
});

export const updateMotSchema = z
  .object({
    mot: z.string().min(1).optional(),
    definition: z.string().min(1).optional(),
    categorie: categorieEnum.optional(),
    exemples: z.array(z.string().min(1)).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateMotInput = z.infer<typeof createMotSchema>;
export type UpdateMotInput = z.infer<typeof updateMotSchema>;
