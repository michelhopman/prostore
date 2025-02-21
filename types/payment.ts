import { paymentResultSchema } from "@/lib/validators";
import { z } from "zod";

export type PaymentResult = z.infer<typeof paymentResultSchema>;
