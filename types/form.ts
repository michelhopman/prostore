import { insertProductSchema, updateUserSchema } from "@/lib/validators";
import { ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { Product } from "./product";

export type ProductFormProps = {
  type: "Create" | "Update";
  product?: Product;
  productId?: string;
};

export type FormFieldRenderProps<
  T extends keyof z.infer<typeof insertProductSchema>
> = {
  field: ControllerRenderProps<z.infer<typeof insertProductSchema>, T>;
};
export type UpdateUserFormFieldRenderProps<
  T extends keyof z.infer<typeof updateUserSchema>
> = {
  field: ControllerRenderProps<z.infer<typeof updateUserSchema>, T>;
};
