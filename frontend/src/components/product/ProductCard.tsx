import { Link } from "react-router-dom";

import { Stars } from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { ProductListItem } from "@/types/api";

export function ProductCard({ product }: { product: ProductListItem }) {
  const onSale =
    product.compare_at_price && Number(product.compare_at_price) > Number(product.base_price);

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition hover:shadow-md"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
        )}
        {onSale && (
          <Badge variant="destructive" className="absolute left-3 top-3">
            Sale
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.category.name}</p>
        <h3 className="line-clamp-1 font-medium">{product.name}</h3>
        {product.review_count > 0 && product.average_rating != null ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Stars value={product.average_rating} size="sm" />
            <span>({product.review_count})</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No reviews yet</span>
        )}
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-semibold">{formatCurrency(product.base_price)}</span>
          {onSale && product.compare_at_price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
