import { Link } from "react-router-dom";

import { Stars } from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { ProductListItem } from "@/types/api";

export function ProductCard({ product }: { product: ProductListItem }) {
  const onSale =
    product.compare_at_price && Number(product.compare_at_price) > Number(product.base_price);
  const discount =
    onSale && product.compare_at_price
      ? Math.round(
          ((Number(product.compare_at_price) - Number(product.base_price)) /
            Number(product.compare_at_price)) *
            100,
        )
      : 0;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
        )}
        {onSale && (
          <Badge variant="destructive" className="absolute left-3 top-3 shadow-sm">
            −{discount}%
          </Badge>
        )}
        {!product.is_active && (
          <Badge variant="secondary" className="absolute right-3 top-3">
            Hidden
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {product.category.name}
        </p>
        <h3 className="line-clamp-1 font-medium leading-tight transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        {product.review_count > 0 && product.average_rating != null ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Stars value={product.average_rating} size="sm" />
            <span>({product.review_count})</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No reviews yet</span>
        )}
        <div className="mt-auto flex items-baseline gap-2 pt-2 tabular">
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
