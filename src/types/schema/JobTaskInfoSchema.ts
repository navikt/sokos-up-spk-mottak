import { z } from "zod";

export const JobTaskInfoSchema = z.object({
  taskId: z.string(),
  taskName: z.string(),
  executionTime: z.string(),
  isPicked: z.boolean(),
  lastFailure: z.optional(z.string()),
  lastSuccess: z.optional(z.string()),
});
