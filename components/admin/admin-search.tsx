"use client";
import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";

const AdminSearch = () => {
  const pathname = usePathname();
  const formActionUrl = pathname.includes("/admin/orders")
    ? "/admin/orders"
    : pathname.includes("/admin/products")
    ? "/admin/products"
    : "/admin/users";

  const searchparams = useSearchParams();
  const [queryValue, setQueryValue] = useState(searchparams.get("query") || "");

  useEffect(() => {
    setQueryValue(searchparams.get("query") || "");
  }, [searchparams]);

  return (
    <form action={formActionUrl} method="GET">
      <Input
        type="search"
        placeholder="Search..."
        name="query"
        value={queryValue}
        onChange={(e) => setQueryValue(e.target.value)}
        className="md:w-[100px] lg:w-[300px]"
      />
      <Button className="sr-only" type="submit">
        Search
      </Button>
    </form>
  );
};

export default AdminSearch;
