import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CustomError } from "@/types";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

//Format number with decimal places
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}

//Format error message
export function formatErrors(error: CustomError) {
  if (error instanceof ZodError) {
    const fieldErrors = Object.keys(error.errors).map(
      (field, index) => error.errors[index].message
    );
    return fieldErrors.join(".\n");
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const field = error.meta?.target ? error.meta.target[0] : "Field";
      return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }
  } else {
    return typeof error.message === "string"
      ? error.message
      : JSON.stringify(error.message);
  }
}
