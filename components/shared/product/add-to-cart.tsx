"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Cart, CartItem } from "@/types";
import { ToastAction } from "@/components/ui/toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { useTransition } from "react";

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const handleAddToCart = async () => {
    startTransition(async () => {
      const response = await addItemToCart(item);
      if (!response.success) {
        toast({
          variant: "destructive",
          description: response.message,
        });
        return;
      }

      // handle success add to cart
      toast({
        description: response.message,
        action: (
          <ToastAction
            className="bg-primary text-white hover:bg-gray-800"
            altText="Go To Cart"
            onClick={() => router.push("/cart")}
          >
            Go To Cart
          </ToastAction>
        ),
      });
    });
  };

  //check if item already exits in cart
  const existsItem =
    cart && cart.items.find((i) => i.productId === item.productId);

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const response = await removeItemFromCart(item.productId);

      toast({
        variant: response.success ? "default" : "destructive",
        description: response.message,
      });

      return;
    });
  };

  return existsItem ? (
    <div>
      {isPending ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveFromCart}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="px-2">{existsItem.qty}</span>
          <Button type="button" variant="outline" onClick={handleAddToCart}>
            <Plus className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  ) : (
    <div>
      {isPending ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <Button className="w-full" type="button" onClick={handleAddToCart}>
          <Plus /> Add to Cart
        </Button>
      )}
    </div>
  );
};

export default AddToCart;
