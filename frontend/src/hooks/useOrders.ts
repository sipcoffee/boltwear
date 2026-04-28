import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Order, OrderListItem, OrderStatus } from "@/types/api";

export interface CheckoutPayload {
  shipping_name: string;
  shipping_address_line1: string;
  shipping_address_line2?: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal: string;
  shipping_country: string;
  notes?: string | null;
}

export function useOrders(allUsers = false) {
  return useQuery({
    queryKey: ["orders", { allUsers }],
    queryFn: async () =>
      (await api.get<OrderListItem[]>("/orders", { params: { all_users: allUsers } })).data,
  });
}

export function useOrder(id: number | undefined) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => (await api.get<Order>(`/orders/${id}`)).data,
    enabled: Boolean(id),
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CheckoutPayload) => (await api.post<Order>("/orders", payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; status: OrderStatus }) =>
      (await api.patch<Order>(`/orders/${vars.id}/status`, { status: vars.status })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order"] });
    },
  });
}
