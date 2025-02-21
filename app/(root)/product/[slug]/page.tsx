import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import ProductPrice from "@/components/shared/product/product-price";
import ProductImages from "@/components/shared/product/product-images";
import AddToCart from "@/components/shared/product/add-to-cart";
import { getMyCart } from "@/lib/actions/cart.actions";

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  const cart = await getMyCart();

  return (
    <>
      <section className="">
        <div className="grid grid-cols-1 md:grid-cols-5">
          {/* Product Image */}
          <div className="col-span-2">
            {/* Image Component*/}
            <ProductImages images={product.images} />
          </div>
          {/* Product Details */}
          <div className="col-span-2 p-5">
            <div className="flex flex-col gap-6">
              <p>
                {product.brand} {product.category}
              </p>
              <h1 className="h3-bold">{product.name}</h1>
              <p>
                {product.rating.toString()} of {product.numReviews} Reviews
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <ProductPrice
                  price={Number(product.price)}
                  className="w-24 rounded-full bg-green-100 text-green-700 px-5 py2"
                />
                {/* <Badge variant="success">In Stock</Badge> */}
              </div>
            </div>
            <div className="mt-10">
              <p className="font-semibold">Description</p>
              <p>{product.description}</p>
            </div>
          </div>
          {/* Product Actions */}
          <div className="col-span-1 p-5">
            <Card>
              <CardContent className="p-4">
                <div className="mb-4 flex justify-between">
                  <div>Price</div>
                  <div>
                    <ProductPrice price={Number(product.price)} />
                  </div>
                </div>
                <div className="mb-4 flex justify-between">
                  <div>Stock</div>
                  <div>
                    {product.stock > 0 ? (
                      <Badge variant="outline">In Stock</Badge>
                    ) : (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                  </div>
                </div>
                {product.stock > 0 && (
                  <div className="flex-center">
                    <AddToCart
                      cart={cart}
                      item={{
                        name: product.name,
                        image: product.images[0],
                        price: product.price,
                        qty: 1,
                        slug: product.slug,
                        productId: product.id,
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetailsPage;
