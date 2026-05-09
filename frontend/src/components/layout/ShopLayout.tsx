import { LogOut, Menu, ShoppingBag, ShoppingCart, User as UserIcon, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { BoltMark, Wordmark } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

function CartBadge() {
  const { data } = useCart();
  const distinctCount = data?.items.length ?? 0;
  if (distinctCount === 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm shadow-primary/40">
      {distinctCount}
    </span>
  );
}

function Navbar() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const navItem = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative text-sm font-medium transition-colors hover:text-foreground",
      isActive ? "text-foreground" : "text-muted-foreground",
      isActive &&
        "after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary",
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link to="/" className="shrink-0">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/" end className={navItem}>
            Home
          </NavLink>
          <NavLink to="/products" className={navItem}>
            Shop
          </NavLink>
          {user && (
            <NavLink to="/orders" className={navItem}>
              Orders
            </NavLink>
          )}
          {user?.role === "OWNER" && (
            <NavLink to="/admin" className={navItem}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/cart" className="relative" aria-label="Cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <CartBadge />
          </Link>

          {user ? (
            <div className="hidden items-center gap-2 pl-2 md:flex">
              <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary">
                  <UserIcon className="h-3.5 w-3.5" />
                </span>
                <span className="font-medium">{user.full_name.split(" ")[0]}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 pl-2 md:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="container flex flex-col gap-1 py-3">
            <NavLink
              to="/"
              end
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Shop
            </NavLink>
            {user ? (
              <>
                <NavLink
                  to="/orders"
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  <ShoppingBag className="mr-2 inline h-4 w-4" /> Orders
                </NavLink>
                {user.role === "OWNER" && (
                  <NavLink
                    to="/admin"
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                    onClick={() => setOpen(false)}
                  >
                    Admin
                  </NavLink>
                )}
                <button
                  className="rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-muted"
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate("/");
                  }}
                >
                  <LogOut className="mr-2 inline h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  onClick={() => setOpen(false)}
                >
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Wordmark />
          <p className="max-w-xs text-sm text-muted-foreground">
            Apparel built for movement. Premium fabrics, considered fits, pieces designed to last.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-3">
          <div className="space-y-2">
            <p className="font-semibold">Shop</p>
            <Link to="/products" className="block text-muted-foreground hover:text-foreground">
              All products
            </Link>
            <Link to="/products?category=t-shirts" className="block text-muted-foreground hover:text-foreground">
              T-Shirts
            </Link>
            <Link to="/products?category=hoodies" className="block text-muted-foreground hover:text-foreground">
              Hoodies
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Account</p>
            <Link to="/orders" className="block text-muted-foreground hover:text-foreground">
              Orders
            </Link>
            <Link to="/login" className="block text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Help</p>
            <span className="block text-muted-foreground">Free shipping over $75</span>
            <span className="block text-muted-foreground">30-day returns</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground md:flex-row">
          <p className="flex items-center gap-1.5">
            <BoltMark className="h-3.5 w-3.5 text-primary" />© {new Date().getFullYear()} BoltWear. All rights reserved.
          </p>
          <p>Crafted with intent.</p>
        </div>
      </div>
    </footer>
  );
}

export function ShopLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 animate-fade-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
