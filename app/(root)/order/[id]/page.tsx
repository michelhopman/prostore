import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import { ShippingAddress } from "@/types";
import OrderDetailsTable from "./order-details-table";

export const metadata: Metadata = {
  title: "Order Details Page",
  description: "Order Details Page",
};

const OrderDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;
  const order = await getOrderById(id);

  if (!order) notFound();

  console.log(order);

  return (
    <>
      <OrderDetailsTable
        order={{
          ...order,
          shippingAddress: order.shippingAddress as ShippingAddress,
          itemsPrice: order.itemsPrice.toString(),
        }}
        payPalClientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID! || "sb"}
      />
    </>
  );
};

export default OrderDetailsPage;
