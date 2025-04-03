import { z } from "zod";
import {
  JobTaskInfoListSchema,
  JobTaskInfoSchema,
} from "./schema/JobTaskInfoSchema";

export type JobTaskInfo = z.infer<typeof JobTaskInfoSchema>;

export type JobTaskInfoList = z.infer<typeof JobTaskInfoListSchema>;
