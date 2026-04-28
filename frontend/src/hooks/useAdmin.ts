import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  AdminStats,
  Category,
  ProductDetail,
  ProductListResponse,
  ProductVariant,
  User,
} from "@/types/api";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => (await api.get<AdminStats>("/admin/stats")).data,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => (await api.get<User[]>("/admin/users")).data,
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () =>
      (await api.get<ProductListResponse>("/products", { params: { include_inactive: true, page_size: 100 } }))
        .data,
  });
}

export function useAdminProduct(id: number | undefined) {
  return useQuery({
    queryKey: ["admin", "product", id],
    queryFn: async () => (await api.get<ProductDetail>(`/admin/products/${id}`)).data,
    enabled: Boolean(id),
  });
}

export interface CategoryInput {
  name: string;
  description?: string | null;
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CategoryInput) => (await api.post<Category>("/categories", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; data: CategoryInput }) =>
      (await api.put<Category>(`/categories/${vars.id}`, vars.data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => api.delete(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export interface VariantInput {
  size: string;
  color: string;
  sku: string;
  stock: number;
  price_override?: string | null;
}

export interface ProductInput {
  name: string;
  description?: string;
  base_price: string;
  compare_at_price?: string | null;
  category_id: number;
  images: string[];
  is_active: boolean;
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProductInput & { variants: VariantInput[] }) =>
      (await api.post<ProductDetail>("/products", payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; data: Partial<ProductInput> }) =>
      (await api.put<ProductDetail>(`/products/${vars.id}`, vars.data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => api.delete(`/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useAddVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { product_id: number; data: VariantInput }) =>
      (await api.post<ProductVariant>(`/products/${vars.product_id}/variants`, vars.data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product"] }),
  });
}

export function useUpdateVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { product_id: number; variant_id: number; data: Partial<VariantInput> }) =>
      (await api.put<ProductVariant>(`/products/${vars.product_id}/variants/${vars.variant_id}`, vars.data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product"] }),
  });
}

export function useDeleteVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { product_id: number; variant_id: number }) =>
      api.delete(`/products/${vars.product_id}/variants/${vars.variant_id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product"] }),
  });
}
