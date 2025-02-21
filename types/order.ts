import { z } from "zod";
import { insertOrderSchema, insertOrderItemSchema } from "@/lib/validators";

export type OrderItem = z.infer<typeof insertOrderItemSchema> & {};
export type Order = z.infer<typeof insertOrderSchema> & {
  id: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  orderitems: OrderItem[];
  user: { name: string; email: string };
};
