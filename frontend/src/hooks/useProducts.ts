import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Category, ProductDetail, ProductListResponse } from "@/types/api";

export interface ProductsQuery {
  category?: string;
  q?: string;
  page?: number;
  page_size?: number;
  include_inactive?: boolean;
}

export function useProducts(params: ProductsQuery = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () =>
      (await api.get<ProductListResponse>("/products", { params })).data,
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => (await api.get<ProductDetail>(`/products/${slug}`)).data,
    enabled: Boolean(slug),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get<Category[]>("/categories")).data,
  });
}
