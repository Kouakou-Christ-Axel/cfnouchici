import { z } from "zod";

export const voteMotSchema = z.object({
  connaissance: z.enum(["OUI_UTILISE", "CONNAIS", "JAMAIS_ENTENDU"]),
  exactitude: z.enum(["EXACTE", "APPROXIMATIVE", "FAUSSE"]),
});

export type VoteMotInput = z.infer<typeof voteMotSchema>;
