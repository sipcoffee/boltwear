import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/api";

const VARIANT: Record<OrderStatus, "default" | "secondary" | "warning" | "success" | "destructive"> = {
  PENDING: "warning",
  PAID: "secondary",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANT[status]}>{status}</Badge>;
}
