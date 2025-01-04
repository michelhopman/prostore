import { cn } from "@/lib/utils";

const ProductPrice = ({
  price,
  className,
}: {
  price: number;
  className?: string;
}) => {
  const formattedPrice = price.toFixed(2);
  const [whole, decimal] = formattedPrice.split(".");
  return (
    <span className={cn("text-2xl", className)}>
      <span className="text-xs align-super">$</span>
      {whole}
      <span className="text-xs align-super">.{decimal}</span>
    </span>
  );
};

export default ProductPrice;
