import { z } from "zod";
import { cartItemSchema, insertCartSchema } from "@/lib/validators";

export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
