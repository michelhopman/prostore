import { requireAdmin } from "@/lib/auth-guard";
import { Metadata } from "next";
import { getProductByID } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Product Details",
  description: "Product Details",
};

const ProductDetailsPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  await requireAdmin();
  const { id } = await props.params;
  const product = await getProductByID(id);
  if (!product) return notFound();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="h2-bold">Update Product Details</h1>
      <ProductForm type="Update" product={product} productId={product.id} />
    </div>
  );
};

export default ProductDetailsPage;
