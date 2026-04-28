import { ChevronLeft, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { ProductReviews } from "@/components/product/ProductReviews";
import { Stars } from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAddToCart } from "@/hooks/useCart";
import { useProduct } from "@/hooks/useProducts";
import { apiError } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(slug);
  const addToCart = useAddToCart();
  const user = useAuthStore((s) => s.user);

  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const sizes = useMemo(() => Array.from(new Set(product?.variants.map((v) => v.size) ?? [])), [product]);
  const colors = useMemo(
    () => Array.from(new Set(product?.variants.filter((v) => !size || v.size === size).map((v) => v.color) ?? [])),
    [product, size],
  );
  const selectedVariant = useMemo(
    () => product?.variants.find((v) => v.size === size && v.color === color) ?? null,
    [product, size, color],
  );

  if (isLoading) return <div className="container py-8 text-muted-foreground">Loading...</div>;
  if (!product) return <div className="container py-8">Product not found.</div>;

  const onSale = product.compare_at_price && Number(product.compare_at_price) > Number(product.base_price);
  const price = selectedVariant?.price_override ?? product.base_price;

  async function handleAdd() {
    if (!user) {
      navigate("/login", { state: { from: `/products/${slug}` } });
      return;
    }
    if (!selectedVariant) {
      toast.error("Pick a size and color first");
      return;
    }
    try {
      await addToCart.mutateAsync({ variant_id: selectedVariant.id, quantity: qty });
      toast.success("Added to cart");
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/products">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Link>
      </Button>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-[4/5] overflow-hidden rounded-xl bg-muted">
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">{product.category.name}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>
            {product.review_count > 0 && product.average_rating != null ? (
              <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <Stars value={product.average_rating} size="sm" />
                <span>
                  {product.average_rating.toFixed(1)} · {product.review_count}{" "}
                  {product.review_count === 1 ? "review" : "reviews"}
                </span>
              </a>
            ) : (
              <a href="#reviews" className="mt-2 inline-block text-sm text-muted-foreground hover:text-foreground">
                Be the first to review
              </a>
            )}
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-2xl font-semibold">{formatCurrency(price)}</span>
              {onSale && product.compare_at_price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(product.compare_at_price)}
                  </span>
                  <Badge variant="destructive">Sale</Badge>
                </>
              )}
            </div>
          </div>

          <p className="text-muted-foreground">{product.description || "No description."}</p>

          <Separator />

          <div>
            <p className="mb-2 text-sm font-medium">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setColor(null);
                  }}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm transition",
                    size === s ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  disabled={!size}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm transition disabled:opacity-50",
                    color === c ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Quantity</p>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{qty}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQty((q) => q + 1)}
                disabled={Boolean(selectedVariant && qty >= selectedVariant.stock)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              {selectedVariant && (
                <span className="text-xs text-muted-foreground">
                  {selectedVariant.stock} in stock
                </span>
              )}
            </div>
          </div>

          <Button size="lg" onClick={handleAdd} disabled={addToCart.isPending}>
            {addToCart.isPending ? "Adding..." : "Add to cart"}
          </Button>
        </div>
      </div>

      <div id="reviews">
        <ProductReviews slug={product.slug} />
      </div>
    </div>
  );
}
