"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";

const ProductCarousel = ({ data }: { data: Product[] }) => {
  return (
    <Carousel
      className="w-full mt-4 mb-12"
      opts={{
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 7000,
          stopOnInteraction: true,
          stopOnMouseEnter: true,
        }),
      ]}
    >
      <CarouselContent>
        {data.map((product: Product) => (
          <CarouselItem key={product.id}>
            <Link href={`/product/${product.slug}`}>
              <div className="relative mx-auto">
                <Image
                  src={product.banner!}
                  alt={product.name}
                  className="w-full h-auto"
                  height={0}
                  width={0}
                  sizes="100vw"
                />
                <div className="absolute inset-0 flex items-end justify-center">
                  <h2 className="bg-gray-900 bg-opacity-50 text-2xl font-bold px-2 text-white">
                    {product.name}
                  </h2>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default ProductCarousel;
