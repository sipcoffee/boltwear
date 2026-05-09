import { Check, ChevronLeft, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
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

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
          <div className="space-y-4">
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }
  if (!product) return <div className="container py-12">Product not found.</div>;

  const onSale = product.compare_at_price && Number(product.compare_at_price) > Number(product.base_price);
  const price = selectedVariant?.price_override ?? product.base_price;
  const isOutOfStock = selectedVariant?.stock === 0;
  const canAdd = selectedVariant && !isOutOfStock;

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
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-foreground">
          Shop
        </Link>
        <span>/</span>
        <Link to={`/products?category=${product.category.slug}`} className="hover:text-foreground">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/products">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to shop
        </Link>
      </Button>

      <div className="grid gap-12 md:grid-cols-2">
        {/* Image */}
        <div className="space-y-3">
          <div className="aspect-[4/5] overflow-hidden rounded-2xl border bg-muted">
            {product.images[0] ? (
              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((img, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg border bg-muted">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary">{product.category.name}</p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">{product.name}</h1>
            {product.review_count > 0 && product.average_rating != null ? (
              <a
                href="#reviews"
                className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Stars value={product.average_rating} size="sm" />
                <span>
                  {product.average_rating.toFixed(1)} · {product.review_count}{" "}
                  {product.review_count === 1 ? "review" : "reviews"}
                </span>
              </a>
            ) : (
              <a href="#reviews" className="mt-3 inline-block text-sm text-muted-foreground hover:text-foreground">
                Be the first to review
              </a>
            )}
            <div className="mt-4 flex items-baseline gap-3 tabular">
              <span className="text-3xl font-bold">{formatCurrency(price)}</span>
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

          <p className="leading-relaxed text-muted-foreground">{product.description || "No description."}</p>

          <Separator />

          {/* Size */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Size</p>
              {size && <p className="text-xs text-muted-foreground">Selected: {size}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setColor(null);
                    setQty(1);
                  }}
                  className={cn(
                    "min-w-[3rem] rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                    size === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Color</p>
              {color && <p className="text-xs text-muted-foreground">Selected: {color}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  disabled={!size}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
                    color === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="mb-2 text-sm font-medium">Quantity</p>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-md border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-r-none"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-medium tabular">{qty}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-l-none"
                  onClick={() => setQty((q) => q + 1)}
                  disabled={Boolean(selectedVariant && qty >= selectedVariant.stock)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {selectedVariant ? (
                isOutOfStock ? (
                  <span className="text-sm font-medium text-destructive">Out of stock</span>
                ) : selectedVariant.stock <= 5 ? (
                  <span className="text-sm font-medium text-amber-600">
                    Only {selectedVariant.stock} left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary" /> {selectedVariant.stock} in stock
                  </span>
                )
              ) : (
                <span className="text-sm text-muted-foreground">Select size & color</span>
              )}
            </div>
          </div>

          <Button size="lg" onClick={handleAdd} disabled={addToCart.isPending || (Boolean(selectedVariant) && !canAdd)}>
            {addToCart.isPending ? "Adding..." : isOutOfStock ? "Out of stock" : "Add to cart"}
          </Button>

          {/* Trust row */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/30 p-4 text-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <span>Free shipping over $75</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>30-day returns</span>
            </div>
          </div>
        </div>
      </div>

      <div id="reviews" className="mt-16">
        <ProductReviews slug={product.slug} />
      </div>
    </div>
  );
}
