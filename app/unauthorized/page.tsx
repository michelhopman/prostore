import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "UnAuthorized",
};

const UnAuthorizedPage = () => {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center space-y-4 h-[calc(100vh-200px)] ">
      <h1 className="h1-bold text-4xl">Unauthorized Acces!</h1>
      <p className="text-muted-forground">
        You are not authorized to view this page. Please contact your
        administrator.
      </p>
      <Button asChild>
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  );
};

export default UnAuthorizedPage;
