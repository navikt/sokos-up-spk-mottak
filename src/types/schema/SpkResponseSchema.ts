import { z } from "zod";

export const SpkResponseSchema = z.object({
  status: z.string(),
});
