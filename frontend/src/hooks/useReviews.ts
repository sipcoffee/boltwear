import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import type { Review, ReviewSummary } from "@/types/api";

export type ReviewSort = "recent" | "highest" | "lowest";

export interface ReviewInput {
  rating: number;
  title: string;
  body: string;
}

export function useReviews(slug: string | undefined, sort: ReviewSort = "recent") {
  return useQuery({
    queryKey: ["reviews", slug, sort],
    queryFn: async () =>
      (await api.get<Review[]>(`/products/${slug}/reviews`, { params: { sort } })).data,
    enabled: Boolean(slug),
  });
}

export function useReviewSummary(slug: string | undefined) {
  return useQuery({
    queryKey: ["reviews", slug, "summary"],
    queryFn: async () =>
      (await api.get<ReviewSummary>(`/products/${slug}/reviews/summary`)).data,
    enabled: Boolean(slug),
  });
}

export function useMyReview(slug: string | undefined) {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["reviews", slug, "mine", user?.id],
    queryFn: async () => {
      try {
        const res = await api.get<Review>(`/products/${slug}/reviews/mine`);
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: Boolean(slug && user),
  });
}

function invalidateProduct(qc: ReturnType<typeof useQueryClient>, slug: string | undefined) {
  qc.invalidateQueries({ queryKey: ["reviews", slug] });
  qc.invalidateQueries({ queryKey: ["product", slug] });
  qc.invalidateQueries({ queryKey: ["products"] });
}

export function useCreateReview(slug: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ReviewInput) =>
      (await api.post<Review>(`/products/${slug}/reviews`, data)).data,
    onSuccess: () => invalidateProduct(qc, slug),
  });
}

export function useUpdateReview(slug: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; data: Partial<ReviewInput> }) =>
      (await api.put<Review>(`/reviews/${vars.id}`, vars.data)).data,
    onSuccess: () => invalidateProduct(qc, slug),
  });
}

export function useDeleteReview(slug: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => api.delete(`/reviews/${id}`),
    onSuccess: () => invalidateProduct(qc, slug),
  });
}
