import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategories, useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  const q = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(q);

  const params = useMemo(() => ({ category, q: q || undefined, page_size: 24 }), [category, q]);
  const { data: products, isLoading } = useProducts(params);
  const { data: categories } = useCategories();

  function setCategory(slug?: string) {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set("category", slug);
    else next.delete("category");
    setSearchParams(next);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) next.set("q", searchInput.trim());
    else next.delete("q");
    setSearchParams(next);
  }

  function clearAll() {
    setSearchParams(new URLSearchParams());
    setSearchInput("");
  }

  const activeCategoryName = categories?.find((c) => c.slug === category)?.name;
  const total = products?.total ?? 0;
  const hasFilters = Boolean(category || q);

  return (
    <div>
      {/* Page header */}
      <section className="border-b border-border/60 bg-muted/20">
        <div className="container py-10 md:py-12">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            {activeCategoryName ?? "Shop"}
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight md:text-5xl">
            {activeCategoryName ?? "All products"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse the full BoltWear collection — premium pieces, considered fits.
          </p>
        </div>
      </section>

      <div className="container py-8">
        {/* Filters bar */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form onSubmit={submitSearch} className="flex w-full gap-2 md:max-w-sm">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="tabular">{total} {total === 1 ? "product" : "products"}</span>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="ml-2 inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs hover:bg-muted"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Category chips */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory(undefined)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              !category
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            All
          </button>
          {categories?.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                category === c.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse rounded-xl border border-border/60 bg-muted/40"
              />
            ))}
          </div>
        ) : !products?.items.length ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed bg-muted/20 py-20 text-center">
            <Search className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">No products found</p>
              <p className="text-sm text-muted-foreground">Try a different search or category.</p>
            </div>
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
