import { getAllOrders } from "@/lib/actions/order.actions";
import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime, shortenUUID } from "@/lib/utils";
import Link from "next/link";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { deleteOrder } from "@/lib/actions/order.actions";
import DeleteDialog from "@/components/shared/delete-dialog";

export const metadata: Metadata = {
  title: "Admin Orders",
};

const AdminOrdersPage = async (props: {
  searchParams: Promise<{ page: string; query: string }>;
}) => {
  await requireAdmin();
  const { page, query: searchText } = await props.searchParams;
  const orders = await getAllOrders({
    page: Number(page) || 1,
    query: searchText,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-start gap-3">
        <h1 className="h2-bold mb-3">Orders</h1>
        {searchText && (
          <div>
            <span className="mr-2">
              Filtered by <i>&quot;{searchText}&quot;</i>{" "}
            </span>
            <Link href="/admin/orders">
              <Button variant="outline">Clear Filter</Button>
            </Link>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>BUYER</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead>PAID</TableHead>
              <TableHead>DELIVERED</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{shortenUUID(order.id)}</TableCell>
                <TableCell>
                  {formatDateTime(order.createdAt).dateTime}
                </TableCell>
                <TableCell>{order.user.name}</TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>
                  {order.isPaid && order.paidAt
                    ? formatDateTime(order.paidAt).dateTime
                    : "pay now"}
                </TableCell>
                <TableCell>
                  {order.isDelivered && order.deliveredAt
                    ? formatDateTime(order.deliveredAt).dateTime
                    : "deliver now"}
                </TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/order/${order.id}`}>Details</Link>
                  </Button>
                  <DeleteDialog id={order.id} action={deleteOrder} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.totalPages > 1 && (
          <Pagination page={Number(page) || 1} totalPages={orders.totalPages} />
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
