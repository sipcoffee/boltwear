import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useOrders";
import { apiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const schema = z.object({
  shipping_name: z.string().min(1, "Required"),
  shipping_address_line1: z.string().min(1, "Required"),
  shipping_address_line2: z.string().optional(),
  shipping_city: z.string().min(1, "Required"),
  shipping_state: z.string().min(1, "Required"),
  shipping_postal: z.string().min(1, "Required"),
  shipping_country: z.string().length(2, "2-letter country code"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart } = useCart();
  const checkout = useCheckout();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { shipping_country: "US" },
  });

  async function onSubmit(values: FormValues) {
    try {
      const order = await checkout.mutateAsync(values);
      toast.success(`Order ${order.order_number} placed`);
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Checkout</h1>

      <form className="grid gap-6 lg:grid-cols-[1fr_360px]" onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Shipping address</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="shipping_name">Full name</Label>
              <Input id="shipping_name" {...register("shipping_name")} />
              {errors.shipping_name && <p className="text-xs text-destructive">{errors.shipping_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_address_line1">Address</Label>
              <Input id="shipping_address_line1" {...register("shipping_address_line1")} />
              {errors.shipping_address_line1 && (
                <p className="text-xs text-destructive">{errors.shipping_address_line1.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_address_line2">Apartment / Suite</Label>
              <Input id="shipping_address_line2" {...register("shipping_address_line2")} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shipping_city">City</Label>
                <Input id="shipping_city" {...register("shipping_city")} />
                {errors.shipping_city && <p className="text-xs text-destructive">{errors.shipping_city.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping_state">State / Region</Label>
                <Input id="shipping_state" {...register("shipping_state")} />
                {errors.shipping_state && <p className="text-xs text-destructive">{errors.shipping_state.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping_postal">Postal code</Label>
                <Input id="shipping_postal" {...register("shipping_postal")} />
                {errors.shipping_postal && (
                  <p className="text-xs text-destructive">{errors.shipping_postal.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping_country">Country (2-letter)</Label>
                <Input id="shipping_country" maxLength={2} {...register("shipping_country")} />
                {errors.shipping_country && (
                  <p className="text-xs text-destructive">{errors.shipping_country.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Order notes (optional)</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span className="line-clamp-1">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span>{formatCurrency(item.line_total)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>Free</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Placing order..." : "Place order"}
            </Button>
            <p className="text-xs text-muted-foreground">
              No real charge — checkout creates a pending order in the demo.
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
