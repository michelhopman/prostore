import { Metadata } from "next";
import { getAllUsers, deleteUser } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteDialog from "@/components/shared/delete-dialog";
import { shortenUUID } from "@/lib/utils";
import Pagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Admin Users",
  description: "Admin Users",
};

const AdinUsersPage = async (props: {
  searchParams: Promise<{ page: string; query: string }>;
}) => {
  const { page, query: searchText } = await props.searchParams;
  const users = await getAllUsers({
    page: Number(page) || 1,
    query: searchText,
  });

  return (
    <div className="space-y-2">
      <div className="flex-between">
        <div className="flex items-center justify-center gap-3">
          <h1 className="h2-bold mb-3">Users</h1>
          {searchText && (
            <div>
              <span className="mr-2">
                Filtered by <i>&quot;{searchText}&quot;</i>{" "}
              </span>
              <Link href="/admin/users">
                <Button variant="outline">Clear Filter</Button>
              </Link>
            </div>
          )}
        </div>
        <Button asChild variant="default">
          <Link href="/admin/users/create">Create User</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead>EMAIL</TableHead>
            <TableHead>ROLE</TableHead>
            <TableHead className="w-[100px]">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.data.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{shortenUUID(user.id)}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.role === "user" ? (
                  <Badge variant="secondary">User</Badge>
                ) : (
                  <Badge variant="default">Admin</Badge>
                )}
              </TableCell>
              <TableCell className="flex gap-1">
                <Button asChild variant="outline">
                  <Link href={`/admin/users/${user.id}`}>Edit</Link>
                </Button>
                <DeleteDialog id={user.id} action={deleteUser} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {users.totalPages > 1 && (
        <Pagination totalPages={users.totalPages} page={page} />
      )}
    </div>
  );
};

export default AdinUsersPage;
