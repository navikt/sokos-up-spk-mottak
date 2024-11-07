import { z } from "zod";
import { JobTaskInfoSchema } from "./schema/JobTaskInfoSchema";

export type JobTaskInfo = z.infer<typeof JobTaskInfoSchema>;
