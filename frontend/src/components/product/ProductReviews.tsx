import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { StarInput, Stars } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  type ReviewSort,
  useCreateReview,
  useDeleteReview,
  useMyReview,
  useReviewSummary,
  useReviews,
  useUpdateReview,
} from "@/hooks/useReviews";
import { apiError } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

interface Props {
  slug: string;
}

const SORTS: { value: ReviewSort; label: string }[] = [
  { value: "recent", label: "Most recent" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
];

export function ProductReviews({ slug }: Props) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [sort, setSort] = useState<ReviewSort>("recent");
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const { data: summary } = useReviewSummary(slug);
  const { data: reviews, isLoading } = useReviews(slug, sort);
  const { data: myReview } = useMyReview(slug);
  const createReview = useCreateReview(slug);
  const updateReview = useUpdateReview(slug);
  const deleteReview = useDeleteReview(slug);

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setTitle(myReview.title);
      setBody(myReview.body);
    }
  }, [myReview]);

  function resetForm() {
    setShowForm(false);
    if (!myReview) {
      setRating(5);
      setTitle("");
      setBody("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error("Pick a rating");
      return;
    }
    try {
      if (myReview) {
        await updateReview.mutateAsync({ id: myReview.id, data: { rating, title, body } });
        toast.success("Review updated");
      } else {
        await createReview.mutateAsync({ rating, title, body });
        toast.success("Review posted");
      }
      setShowForm(false);
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  async function handleDelete() {
    if (!myReview) return;
    if (!window.confirm("Delete your review?")) return;
    try {
      await deleteReview.mutateAsync(myReview.id);
      toast.success("Review deleted");
      setRating(5);
      setTitle("");
      setBody("");
      setShowForm(false);
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  const totalReviews = summary?.review_count ?? 0;
  const distribution = summary?.distribution ?? {};

  return (
    <section className="mt-16 border-t pt-10">
      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Customer reviews</h2>
          {totalReviews > 0 && summary?.average_rating != null ? (
            <>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-3xl font-bold">{summary.average_rating.toFixed(1)}</span>
                <Stars value={summary.average_rating} size="lg" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </p>
              <div className="mt-4 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = Number(distribution[star] ?? 0);
                  const pct = totalReviews ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-6 text-muted-foreground">{star}★</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No reviews yet — be the first.</p>
          )}

          <div className="mt-6 space-y-2">
            {!user ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login", { state: { from: `/products/${slug}` } })}
              >
                Sign in to write a review
              </Button>
            ) : myReview && !showForm ? (
              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={() => setShowForm(true)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit your review
                </Button>
                <Button variant="ghost" className="w-full text-destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete review
                </Button>
              </div>
            ) : !showForm ? (
              <Button className="w-full" onClick={() => setShowForm(true)}>
                Write a review
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          {showForm && user && (
            <Card>
              <CardContent className="p-6">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <Label className="mb-2 inline-block">Your rating</Label>
                    <StarInput value={rating} onChange={setRating} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-title">Title</Label>
                    <Input
                      id="review-title"
                      maxLength={160}
                      placeholder="Sums up your experience"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-body">Review</Label>
                    <Textarea
                      id="review-body"
                      rows={5}
                      maxLength={4000}
                      placeholder="Fit, quality, anything else worth sharing?"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createReview.isPending || updateReview.isPending}>
                      {myReview ? "Save changes" : "Post review"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-2">
            {SORTS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSort(s.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition",
                  sort === s.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Loading reviews...</p>
          ) : !reviews || reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Stars value={r.rating} size="sm" />
                    <span className="font-medium">{r.title || "Review"}</span>
                    {r.is_verified_purchase && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Verified purchase
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {r.user.full_name} · {formatDate(r.created_at)}
                  </p>
                  {r.body && <p className="mt-3 whitespace-pre-line text-sm">{r.body}</p>}
                </li>
              ))}
            </ul>
          )}

          {totalReviews === 0 && !showForm && (
            <p className="text-sm text-muted-foreground">
              Have you tried this piece?{" "}
              {user ? (
                <button className="font-medium text-primary hover:underline" onClick={() => setShowForm(true)}>
                  Share your thoughts.
                </button>
              ) : (
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              )}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
