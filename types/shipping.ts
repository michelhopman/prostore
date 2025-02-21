import { z } from "zod";
import { shippingAddressSchema } from "@/lib/validators";

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
