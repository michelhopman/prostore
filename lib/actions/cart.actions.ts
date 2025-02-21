"use server";
import { cookies } from "next/headers";
import { CartItem, CustomError } from "@/types";
import { convertToPlainObject, formatErrors, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

//calculate cart prices
const calcPrices = (items: CartItem[]) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
  );
  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10);
  const taxPrice = round2(0.15 * itemsPrice);
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

// export const addItemToCart = async (data: CartItem) => {
//   try {
//     const sessionCartId = (await cookies()).get("sessionCartId")?.value;
//     if (!sessionCartId) throw new Error("Session Cart Id not found");

//     //get session and user id
//     const session = await auth();
//     const userId = session?.user?.id ? (session.user.id as string) : undefined;

//     //get user cart
//     const cart = await getMyCart();
//     const item = cartItemSchema.parse(data);

//     //find product in database
//     const product = await prisma.product.findFirst({
//       where: { id: item.productId },
//     });
//     if (!product) throw new Error("Product not found");

//     if (!cart) {
//       const newCart = insertCartSchema.parse({
//         userId: userId,
//         sessionCartId: sessionCartId,
//         items: [item],
//         ...calcPrices([item]),
//       });
//       //add new cart to db
//       await prisma.cart.create({ data: newCart });

//       // revalidate product page
//       revalidatePath(`/product/${product.slug}`);
//       return { success: true, message: `${product.name} added to cart` };
//     } else {
//       //check if item already in cart
//       const itemIndex = cart.items.findIndex(
//         (i) => i.productId === item.productId
//       );
//       if (itemIndex !== -1) {
//         if (product.stock < cart.items[itemIndex].qty + 1) {
//           throw new Error("Not enough stock");
//         }
//         cart.items[itemIndex].qty += item.qty;
//       } else {
//         if (product.stock < 1) throw new Error("Not enough stock");
//         cart.items.push(item);
//       }

//       //update cart in db
//       await prisma.cart.update({
//         where: { id: cart.id },
//         data: {
//           items: cart.items as Prisma.CartUpdateitemsInput[],
//           ...calcPrices(cart.items as CartItem[]),
//         },
//       });

//       // revalidate product page
//       revalidatePath(`/product/${product.slug}`);
//       return {
//         success: true,
//         message: `${product.name} ${
//           cart.items[itemIndex] ? "updated in" : "addeted to"
//         } cart`,
//       };
//     }
//   } catch (error) {
//     return { success: false, message: formatErrors(error as CustomError) };
//   }
// };

export async function addItemToCart(data: CartItem) {
  try {
    // Check for cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found");

    // Get session and user ID
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // Get cart
    const cart = await getMyCart();

    // Parse and validate item
    const item = cartItemSchema.parse(data);

    // Find product in database
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });
    if (!product) throw new Error("Product not found");

    if (!cart) {
      // Create new cart object
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrices([item]),
      });

      // Add to database
      await prisma.cart.create({
        data: newCart,
      });

      // Revalidate product page
      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} added to cart`,
      };
    } else {
      // Check if item is already in cart
      const existItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      );

      if (existItem) {
        // Check stock
        if (product.stock < existItem.qty + 1) {
          throw new Error("Not enough stock");
        }

        // Increase the quantity
        (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        )!.qty = existItem.qty + 1;
      } else {
        // If item does not exist in cart
        // Check stock
        if (product.stock < 1) throw new Error("Not enough stock");

        // Add item to the cart.items
        cart.items.push(item);
      }

      // Save to database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrices(cart.items as CartItem[]),
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${
          existItem ? "updated in" : "added to"
        } cart`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error! as CustomError),
    };
  }
}

export async function getMyCart() {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("Session Cart Id not found");

  //get session and user id
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  //get user cart from db
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) return undefined;

  //convert decimals and return
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}

//remove item from cart
export async function removeItemFromCart(productId: string) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Session Cart Id not found");

    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    const exists = (cart.items as CartItem[]).find(
      (i) => i.productId === productId
    );
    if (!exists) throw new Error("Item not found in cart");

    if (exists.qty === 1) {
      //remove item from cart
      cart.items = (cart.items as CartItem[]).filter(
        (i) => i.productId !== exists.productId
      );
    } else {
      //decrese item quantity in card
      (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty =
        exists.qty - 1;
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrices(cart.items as CartItem[]),
      },
    });

    revalidatePath(`/product/${product.slug}`);

    return { success: true, message: `${product.name} was removed from cart` };
  } catch (error) {
    return { success: false, message: formatErrors(error as CustomError) };
  }
}
