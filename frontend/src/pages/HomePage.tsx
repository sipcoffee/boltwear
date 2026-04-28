import { ArrowRight, Sparkles, Truck, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { useCategories, useProducts } from "@/hooks/useProducts";

export function HomePage() {
  const { data: products } = useProducts({ page_size: 8 });
  const { data: categories } = useCategories();

  return (
    <div>
      <section className="border-b bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="container grid gap-8 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs">
              <Sparkles className="h-3 w-3" /> New season drop
            </span>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Apparel built for movement.
            </h1>
            <p className="max-w-md text-muted-foreground">
              Premium materials, considered fits, and pieces designed to last. Shop the BoltWear collection.
            </p>
            <div className="flex gap-3">
              <Button size="lg" asChild>
                <Link to="/products">
                  Shop now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/products?category=hoodies">Hoodies</Link>
              </Button>
            </div>
          </div>
          <div className="hidden aspect-square overflow-hidden rounded-2xl bg-muted md:block">
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900"
              alt="BoltWear apparel"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3 rounded-lg border p-6">
            <Truck className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Free shipping</h3>
              <p className="text-sm text-muted-foreground">On orders over $75</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-6">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">30-day returns</h3>
              <p className="text-sm text-muted-foreground">No-hassle exchanges</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Premium fabrics</h3>
              <p className="text-sm text-muted-foreground">Sourced responsibly</p>
            </div>
          </div>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="container pb-12">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">Shop by category</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.slug}`}
                className="group flex aspect-[4/3] items-end overflow-hidden rounded-lg border bg-muted p-4 transition hover:shadow"
              >
                <div>
                  <p className="text-lg font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">Shop {c.name.toLowerCase()}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container pb-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Featured</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/products">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products?.items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
