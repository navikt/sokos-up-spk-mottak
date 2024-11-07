import { z } from "zod";

export const JobTaskInfoSchema = z.object({
  taskId: z.string(),
  taskName: z.string(),
  executionTime: z.string(),
  isPicked: z.boolean(),
  lastFailure: z.string(),
  lastSuccess: z.string(),
});
