import { z } from "zod";

export const updateUserSchema = z.object({
  role: z.enum(["USER", "MODERATEUR", "ADMIN"]).optional(),
  banned: z.boolean().optional(),
}).refine((d) => Object.keys(d).length > 0, {
  message: "At least one field must be provided",
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
