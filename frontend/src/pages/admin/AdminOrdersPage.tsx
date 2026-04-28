import { useState } from "react";
import { toast } from "sonner";

import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrder, useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { apiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/types/api";

const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export function AdminOrdersPage() {
  const { data: orders, isLoading } = useOrders(true);
  const [selected, setSelected] = useState<number | null>(null);
  const { data: order } = useOrder(selected ?? undefined);
  const updateStatus = useUpdateOrderStatus();

  async function changeStatus(value: OrderStatus) {
    if (!order) return;
    try {
      await updateStatus.mutateAsync({ id: order.id, status: value });
      toast.success("Status updated");
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders?.length ?? 0} total</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <p className="p-6 text-muted-foreground">Loading...</p>
            ) : !orders?.length ? (
              <p className="p-6 text-muted-foreground">No orders yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow
                      key={o.id}
                      data-active={selected === o.id}
                      onClick={() => setSelected(o.id)}
                      className="cursor-pointer data-[active=true]:bg-muted"
                    >
                      <TableCell className="font-medium">{o.order_number}</TableCell>
                      <TableCell>{formatDate(o.created_at)}</TableCell>
                      <TableCell>{o.item_count}</TableCell>
                      <TableCell>
                        <OrderStatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(o.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{order ? order.order_number : "Order details"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {!order ? (
              <p className="text-muted-foreground">Select an order to view details.</p>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Update status</p>
                  <Select value={order.status} onValueChange={(v) => changeStatus(v as OrderStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <p className="font-medium">Ship to</p>
                  <p>{order.shipping_name}</p>
                  <p>{order.shipping_address_line1}</p>
                  {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                  <p>
                    {order.shipping_city}, {order.shipping_state} {order.shipping_postal}
                  </p>
                  <p>{order.shipping_country}</p>
                </div>

                <Separator />

                <div>
                  <p className="mb-2 font-medium">Items</p>
                  <ul className="space-y-1">
                    {order.items.map((it) => (
                      <li key={it.id} className="flex justify-between gap-2">
                        <span>
                          {it.quantity} × {it.product_name}{" "}
                          <span className="text-muted-foreground">
                            ({it.variant_size}, {it.variant_color})
                          </span>
                        </span>
                        <span>{formatCurrency(Number(it.unit_price) * it.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>

                {order.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-medium">Notes</p>
                      <p className="text-muted-foreground">{order.notes}</p>
                    </div>
                  </>
                )}

                <Button variant="outline" size="sm" className="w-full" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
