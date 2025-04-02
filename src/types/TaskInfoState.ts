import { z } from "zod";
import { TaskInfoStateSchema } from "./schema/TaskInfoStateSchema";

export type TaskInfoState = z.infer<typeof TaskInfoStateSchema>;
export type TaskInfoStateRecord = Record<string, TaskInfoState>;
