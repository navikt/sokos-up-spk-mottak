import type { z } from "zod";
import type { TaskInfoStateSchema } from "./schema/TaskInfoStateSchema";

export type TaskInfoState = z.infer<typeof TaskInfoStateSchema>;
export type TaskInfoStateRecord = Record<string, TaskInfoState>;
