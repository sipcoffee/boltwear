import { ArrowRight, Leaf, RotateCcw, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Link } from "react-router-dom";

import { BoltMark } from "@/components/Logo";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { useCategories, useProducts } from "@/hooks/useProducts";

const CATEGORY_IMAGES: Record<string, string> = {
  "t-shirts": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900",
  hoodies: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900",
  jeans: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900",
  jackets: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900",
};

export function HomePage() {
  const { data: products } = useProducts({ page_size: 8 });
  const { data: categories } = useCategories();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 gradient-bolt" aria-hidden />
        <div
          className="absolute inset-0 -z-10 grid-fade-mask opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden
        />
        <div className="container grid items-center gap-10 py-16 md:grid-cols-[1.1fr_1fr] md:py-24 lg:gap-14 lg:py-28">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" /> New season drop
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Apparel built for{" "}
              <span className="relative inline-block text-primary">
                movement
                <BoltMark className="absolute -right-7 -top-3 h-7 w-7 rotate-12 text-primary md:-right-10 md:-top-4 md:h-10 md:w-10" />
              </span>
              .
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Premium materials, considered fits, and pieces designed to last. Shop the BoltWear collection.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/products">
                  Shop now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/products?category=hoodies">Browse hoodies</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> Free shipping $75+
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <RotateCcw className="h-4 w-4 text-primary" /> 30-day returns
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-card">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200"
                alt="BoltWear apparel"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-4 -left-4 hidden rounded-xl border bg-background/95 p-4 shadow-card backdrop-blur md:block">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <BoltMark className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Featured</p>
                  <p className="text-sm font-semibold">Storm Hoodie · From $68</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-b border-border/60 bg-muted/20">
        <div className="container grid gap-px overflow-hidden rounded-none md:grid-cols-4">
          {[
            { icon: Truck, title: "Free shipping", body: "On orders over $75" },
            { icon: ShieldCheck, title: "30-day returns", body: "No-hassle exchanges" },
            { icon: Sparkles, title: "Premium fabrics", body: "Sourced responsibly" },
            { icon: Leaf, title: "Made to last", body: "Built to outlive trends" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3 bg-background px-6 py-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="container py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-primary">Categories</p>
              <h2 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">Shop the collection</h2>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
              <Link to="/products">
                All categories <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl border bg-muted"
              >
                {CATEGORY_IMAGES[c.slug] && (
                  <img
                    src={CATEGORY_IMAGES[c.slug]}
                    alt={c.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white">
                  <div>
                    <p className="font-display text-xl font-semibold">{c.name}</p>
                    <p className="text-xs text-white/80">Shop {c.name.toLowerCase()}</p>
                  </div>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="container pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">Featured</p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">Just landed</h2>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/products">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products?.items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-foreground text-background">
        <div className="container flex flex-col items-center gap-4 py-16 text-center md:py-20">
          <BoltMark className="h-8 w-8 text-primary" />
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">Move with us.</h2>
          <p className="max-w-xl text-background/70">
            Built for runners, riders, lifters, and everyone in between. Free shipping over $75.
          </p>
          <Button size="lg" variant="default" asChild className="mt-2">
            <Link to="/products">
              Shop the collection <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
