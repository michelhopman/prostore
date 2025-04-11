// import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import Menu from "@/components/shared/header/menu";
import logo from "@/public/images/logo.svg";
import MainNav from "./main-nav";
import AdminSearch from "@/components/admin/admin-search";

import { requireAdmin } from "@/lib/auth-guard";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();
  return (
    <>
      <div className="flex flex-col">
        <div className="border-bottom container mx-auto">
          <div className="flex items-center h-16 px-4">
            <Link href="/" className="w-22">
              <Image src={logo} alt="company logo" width={48} height={48} />
            </Link>
            <MainNav className="mx-6" />
            <div className="flex ml-auto items-center space-x-4">
              <div>
                <AdminSearch />
              </div>
              <Menu />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6 container mx-auto">
          {children}
        </div>
      </div>
    </>
  );
}
