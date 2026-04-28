import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import type { Cart } from "@/types/api";

const CART_KEY = ["cart"];

export function useCart() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: CART_KEY,
    queryFn: async () => (await api.get<Cart>("/cart")).data,
    enabled: Boolean(user),
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { variant_id: number; quantity: number }) =>
      (await api.post<Cart>("/cart/items", vars)).data,
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; quantity: number }) =>
      (await api.put<Cart>(`/cart/items/${vars.id}`, { quantity: vars.quantity })).data,
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await api.delete<Cart>(`/cart/items/${id}`)).data,
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  });
}
