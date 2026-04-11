import { z } from "zod";

export const rejeterMotSchema = z.object({
  motif: z.string().min(1),
});

export const validerMotSchema = z.object({});

export type RejeterMotInput = z.infer<typeof rejeterMotSchema>;
export type ValiderMotInput = z.infer<typeof validerMotSchema>;
