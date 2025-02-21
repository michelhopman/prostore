import CartTable from "./cart-table";
import { getMyCart } from "@/lib/actions/cart.actions";
export const metadata = {
  title: "Shopping Cart",
  description: "Cart Page",
};

const CartPage = async () => {
  const cart = await getMyCart();
  return (
    <>
      Cart Page
      <CartTable cart={cart} />
    </>
  );
};

export default CartPage;
