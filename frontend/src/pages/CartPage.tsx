import { ChevronLeft, Lock, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/useCart";
import { apiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export function CartPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  if (isLoading) return <div className="container py-8 text-muted-foreground">Loading...</div>;

  const empty = !data || data.items.length === 0;

  async function changeQty(id: number, qty: number) {
    if (qty < 1) return;
    try {
      await updateItem.mutateAsync({ id, quantity: qty });
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
            <Link to="/products">
              <ChevronLeft className="mr-1 h-4 w-4" /> Continue shopping
            </Link>
          </Button>
          <h1 className="font-display text-4xl font-bold tracking-tight">Your cart</h1>
          {!empty && (
            <p className="mt-1 text-sm text-muted-foreground">
              {data.items.length} {data.items.length === 1 ? "item" : "items"} ·{" "}
              {data.items.reduce((acc, i) => acc + i.quantity, 0)} units
            </p>
          )}
        </div>
      </div>

      {empty ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-muted/20 py-20 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Start shopping to fill it up.</p>
          </div>
          <Button asChild>
            <Link to="/products">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-3">
            {data.items.map((item) => (
              <Card key={item.id} className="overflow-hidden border-border/60">
                <CardContent className="flex gap-4 p-4">
                  <Link
                    to={`/products/${item.product_slug}`}
                    className="aspect-square h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-muted"
                  >
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/products/${item.product_slug}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {item.product_name}
                      </Link>
                      <button
                        className="text-muted-foreground transition hover:text-destructive"
                        onClick={() => removeItem.mutate(item.id)}
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.variant.size} · {item.variant.color}
                      <span className="ml-2 text-xs">SKU {item.variant.sku}</span>
                    </p>
                    <p className="text-sm tabular text-muted-foreground">
                      {formatCurrency(item.unit_price)} each
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                      <div className="inline-flex items-center rounded-md border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-r-none"
                          onClick={() => changeQty(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium tabular">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-l-none"
                          onClick={() => changeQty(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.variant.stock}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="font-semibold tabular">{formatCurrency(item.line_total)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit border-border/60 lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular">{formatCurrency(data.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">Calculated at checkout</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="tabular">{formatCurrency(data.subtotal)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={() => navigate("/checkout")}>
                Checkout
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" /> Secure checkout
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
