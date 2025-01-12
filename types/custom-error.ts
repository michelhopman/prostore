import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

interface PrismaErrorMeta {
  target: string[];
}

export interface CustomError extends Error {
  meta?: PrismaErrorMeta;
  ZodError: ZodError;
  PrismaClientKnownRequestError: Prisma.PrismaClientKnownRequestError;
}
