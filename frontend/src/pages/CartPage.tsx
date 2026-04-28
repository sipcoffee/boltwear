import { Minus, Plus, Trash2 } from "lucide-react";
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
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Your cart</h1>

      {empty ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border bg-muted/30 py-16">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button asChild>
            <Link to="/products">Continue shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {data.items.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex gap-4 p-4">
                  <Link
                    to={`/products/${item.product_slug}`}
                    className="aspect-square h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted"
                  >
                    {item.product_image && (
                      <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/products/${item.product_slug}`} className="font-medium hover:underline">
                        {item.product_name}
                      </Link>
                      <button
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem.mutate(item.id)}
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.variant.size} · {item.variant.color} · SKU {item.variant.sku}
                    </p>
                    <p className="text-sm">{formatCurrency(item.unit_price)} each</p>
                    <div className="mt-auto flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => changeQty(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => changeQty(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.variant.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.line_total)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(data.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(data.subtotal)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={() => navigate("/checkout")}>
                Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
