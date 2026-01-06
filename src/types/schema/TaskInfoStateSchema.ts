import { z } from "zod";

export const TaskInfoStateSchema = z.object({
	disabled: z.boolean(),
	timestamp: z.number(),
});
