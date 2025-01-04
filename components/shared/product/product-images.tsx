"use client";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const ProductImages = ({ images }: { images: string[] }) => {
  const [currentImage, setCurrentImage] = useState(0);
  return (
    <div className="space-y-4">
      <Image
        src={images[currentImage]}
        alt="Product Image"
        width={1000}
        height={1000}
        className="min-h-[300px] object-cover object-center"
        priority={true}
      />
      <div className="flex">
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              "border mr-2 cursor-pointer hover:border-orange-600",
              index === currentImage && "border-orange-300"
            )}
            onClick={() => setCurrentImage(index)}
          >
            <Image
              src={image}
              alt="Product Image"
              width={100}
              height={100}
              className="object-cover object-center"
              priority={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
