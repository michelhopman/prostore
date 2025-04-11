"use server";
import { prisma } from "@/db/prisma";
import { convertToPlainObject, formatErrors } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { CustomError } from "@/types";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { insertProductSchema, updateProductSchema } from "../validators";
import { Prisma } from "@prisma/client";

//Get latest products
export async function getLatestProducts() {
  const products = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: "desc",
    },
  });
  return convertToPlainObject(products);
}

//Get single product by slug
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
  });
  return convertToPlainObject(product);
}
//Get single product by ID
export async function getProductByID(productId: string) {
  const data = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });
  return convertToPlainObject(data);
}

//get all products
export async function getAllProducts({
  page = 1,
  query = "",
  category = "",
  price = "",
  sort = "",
  rating = "",
  limit = PAGE_SIZE,
}: {
  page: number;
  query: string;
  category?: string;
  limit?: number;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  // Query filter
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};
  const categoryFilter: Prisma.ProductWhereInput =
    category && category !== "all"
      ? {
          category,
        }
      : {};
  const priceFilter: Prisma.ProductWhereInput =
    price && price !== "all"
      ? {
          price: {
            gte: Number(price.split("-")[0]),
            lte: Number(price.split("-")[1]),
          } as Prisma.IntFilter,
        }
      : {};
  const ratingFilter =
    rating && rating !== "all"
      ? {
          rating: {
            gte: Number(rating),
          },
        }
      : {};
  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
    orderBy:
      sort === "lowest"
        ? {
            price: "asc",
          }
        : sort === "highest"
        ? {
            price: "desc",
          }
        : sort === "rating"
        ? {
            rating: "desc",
          }
        : {
            createdAt: "desc",
          },
    skip: (page - 1) * limit,
    take: limit,
  });

  const totalProducts = await prisma.product.count();
  return {
    data,
    totalPages: Math.ceil(totalProducts / limit),
  };
}

//Delete product
export async function deleteProduct(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const productExists = await prisma.product.findFirst({
      where: {
        id,
      },
    });

    if (!productExists) {
      throw new Error("Product not found");
    }

    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/products");
    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error as CustomError) || "Something went wrong",
    };
  }
}

//Create product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data);
    await prisma.product.create({
      data: product,
    });

    revalidatePath(`/admin/products`);
    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message:
        formatErrors(error as CustomError) ||
        "Something went wrong inserting product",
    };
  }
}
//Update product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);
    const productExists = await prisma.product.findFirst({
      where: {
        id: product.id,
      },
    });

    if (!productExists) {
      throw new Error("Product not found");
    }

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: product,
    });

    revalidatePath(`/admin/products`);
    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message:
        formatErrors(error as CustomError) ||
        "Something went wrong updating product",
    };
  }
}

//get all categories
export async function getAllCategories() {
  const data = await prisma.product.groupBy({
    by: ["category"],
    _count: true,
  });
  return data;
}

//get featured products
export async function getFeaturedProducts() {
  const data = await prisma.product.findMany({
    where: {
      isFeatured: true,
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  return convertToPlainObject(data);
}
