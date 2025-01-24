import { z } from "zod";

export const AvstemmingRequestSchema = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export type AvstemmingRequest = z.infer<typeof AvstemmingRequestSchema>;
