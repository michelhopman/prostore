"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime, shortenUUID } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/types";
import Link from "next/link";
import Image from "next/image";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import {
  createPayPalOrder,
  approvePayPalOrder,
  updateOrderToPaidCod,
  deliverOrder,
} from "@/lib/actions/order.actions";

import { useTransition } from "react";

type OrderDetailsTableProps = {
  order: Order;
  payPalClientId: string;
  isAdmin: boolean;
};

const OrderDetailsTable = ({
  order,
  payPalClientId,
  isAdmin,
}: OrderDetailsTableProps) => {
  const {
    id,
    shippingAddress,
    orderitems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isDelivered,
    isPaid,
    paidAt,
    deliveredAt,
  } = order;

  const { toast } = useToast();

  const PrintLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();
    let status = "";
    if (isPending) {
      status = "Loading...";
    } else if (isRejected) {
      status = "Error loading PayPal script";
    }
    return status;
  };

  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order.id);

    if (!res.success) {
      toast({
        variant: "destructive",
        description: res.message,
      });
    }

    return res.data;
  };

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, data);

    toast({
      variant: res.success ? "default" : "destructive",
      description: res.message,
    });
  };
  // Mark as Paid Button
  const MarkAsPaidButton = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const res = await updateOrderToPaidCod(id);
            toast({
              variant: res.success ? "default" : "destructive",
              description: res.message,
            });
          });
        }}
      >
        {isPending ? "processing..." : "Mark as Paid"}
      </Button>
    );
  };
  // Mark as Devivered Button
  const MarkAsDeliveredButton = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const res = await deliverOrder(id);
            toast({
              variant: res.success ? "default" : "destructive",
              description: res.message,
            });
          });
        }}
      >
        {isPending ? "processing..." : "Mark as delivered"}
      </Button>
    );
  };
  return (
    <>
      <h1 className="py-4 text-2xl">Order {shortenUUID(id)}</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-y-4 overflow-x-auto">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p>{paymentMethod}</p>
              {isPaid ? (
                <Badge variant="secondary">
                  Paid At {formatDateTime(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive" className="mt-3">
                  Not Paid
                </Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p>
                {shippingAddress.streetAddress}, {shippingAddress.city}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
              {isDelivered ? (
                <Badge variant="secondary">
                  Delivered At {formatDateTime(deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive" className="mt-3">
                  Not Delivered
                </Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderitems.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center space-x-2 gap-2"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={40}
                            height={40}
                            objectFit="cover"
                          />{" "}
                          <span>{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell className="text-right">
                        ${item.price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className="flex justify-between font-bold">
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>
              {/* PayPal Payment */}
              {!isPaid && paymentMethod === "PayPal" && (
                <div>
                  <PayPalScriptProvider options={{ clientId: payPalClientId }}>
                    <PrintLoadingState />
                    <PayPalButtons
                      createOrder={handleCreatePayPalOrder}
                      onApprove={handleApprovePayPalOrder}
                    />
                  </PayPalScriptProvider>
                </div>
              )}
              {/* Chash on delivery */}
              {isAdmin && !isPaid && paymentMethod === "CashOnDelivery" && (
                <MarkAsPaidButton />
              )}
              {isAdmin && isPaid && !isDelivered && <MarkAsDeliveredButton />}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;
