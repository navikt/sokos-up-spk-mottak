import { z } from "zod";
import { SpkResponseSchema } from "./schema/SpkResponseSchema";

export type SpkResponse = z.infer<typeof SpkResponseSchema>;
