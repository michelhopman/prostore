"use client";

import { useToast } from "@/hooks/use-toast";
import { insertProductSchema, updateProductSchema } from "@/lib/validators";
import { FormFieldRenderProps, ProductFormProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { defaultProductValues } from "@/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import slugify from "slugify";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { UploadButton } from "@/lib/uploadthing";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { Checkbox } from "../ui/checkbox";

const ProductForm = ({ type, product, productId }: ProductFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof insertProductSchema>>({
    resolver:
      type === "Update"
        ? zodResolver(updateProductSchema)
        : zodResolver(insertProductSchema),
    defaultValues:
      product && type === "Update" ? product : defaultProductValues,
  });

  const onSubmit: SubmitHandler<z.infer<typeof insertProductSchema>> = async (
    values: z.infer<typeof insertProductSchema>
  ) => {
    if (type === "Create") {
      const { success, message } = await createProduct(values);
      if (success) {
        toast({
          variant: "default",
          description: message,
        });
        router.push("/admin/products");
      } else {
        toast({
          variant: "destructive",
          description: message,
        });
      }
    }

    if (type === "Update") {
      if (!productId) {
        router.push("/admin/products");
        return;
      }

      const { success, message } = await updateProduct({
        ...values,
        id: productId,
      });
      if (success) {
        toast({
          variant: "default",
          description: message,
        });
        router.push("/admin/products");
      } else {
        toast({
          variant: "destructive",
          description: message,
        });
      }
    }
  };

  const images = form.watch("images");
  const isFeatured = form.watch("isFeatured");
  const banner = form.watch("banner");
  return (
    <Form {...form}>
      <form
        method="POST"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row gap-5">
          {/* name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }: FormFieldRenderProps<"name">) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }: FormFieldRenderProps<"slug">) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Enter slug" {...field} />
                    <Button
                      type="button"
                      variant="default"
                      className="mt-2 bg-gray-500 hover:bg-gray-600 text-white py-1 px-4"
                      onClick={() => {
                        form.setValue(
                          "slug",
                          slugify(form.getValues("name"), { lower: true })
                        );
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-5">
          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }: FormFieldRenderProps<"category">) => (
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Brand */}
          <FormField
            control={form.control}
            name="brand"
            render={({ field }: FormFieldRenderProps<"brand">) => (
              <FormItem className="w-full">
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-5">
          {/* price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }: FormFieldRenderProps<"price">) => (
              <FormItem className="w-full">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input placeholder="Enter price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* stock */}
          <FormField
            control={form.control}
            name="stock"
            render={({ field }: FormFieldRenderProps<"stock">) => (
              <FormItem className="w-full">
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input placeholder="Enter stock" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="upload-field flex flex-col md:flex-row gap-5">
          {/* images */}
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>Images</FormLabel>
                <Card>
                  <CardContent className="space-y-2 mt-2 min-h-48">
                    <div className="flex-start space-x-2">
                      {images.map((image, index) => (
                        <Image
                          key={index}
                          src={image}
                          alt="Product Image"
                          width={100}
                          height={100}
                          className="w-20 h-20 object-cover object-center rounded-sm"
                        />
                      ))}
                    </div>
                    <FormControl>
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res: { url: string }[]) => {
                          form.setValue("images", [...images, res[0].url]);
                        }}
                        onUploadError={(error: Error) => {
                          toast({
                            variant: "destructive",
                            description: `ERROR! ${error.message}`,
                          });
                        }}
                      />
                    </FormControl>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="upload-field">
          {/* is featured */}
          <FormLabel>Featured Product</FormLabel>
          <Card>
            <CardContent className="space-y-2 mt-2">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }: FormFieldRenderProps<"isFeatured">) => (
                  <FormItem>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="ml-2">Is Featured ?</FormLabel>
                  </FormItem>
                )}
              />
              {isFeatured && banner && (
                <Image
                  src={banner}
                  alt="featured image"
                  className="w-full object-cover object-center rounded-sm"
                  width={1920}
                  height={680}
                />
              )}
              {isFeatured && !banner && (
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res: { url: string }[]) => {
                    form.setValue("banner", res[0].url);
                  }}
                  onUploadError={(error: Error) => {
                    toast({
                      variant: "destructive",
                      description: `ERROR! ${error.message}`,
                    });
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
        <div className="">
          {/* description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }: FormFieldRenderProps<"description">) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="resize-none"
                    placeholder="Enter description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="">
          {/* button */}
          <Button
            type="submit"
            variant="default"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="button col-span-2 w-full"
          >
            {form.formState.isSubmitting
              ? `${type === "Update" ? "Updating" : "Creating"}...`
              : `${type} Product`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
