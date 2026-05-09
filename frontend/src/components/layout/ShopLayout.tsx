import { LogOut, Menu, ShoppingBag, ShoppingCart, User as UserIcon, Zap } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

function CartBadge() {
  const { data } = useCart();
  const distinctCount = data?.items.length ?? 0;
  if (distinctCount === 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
      {distinctCount}
    </span>
  );
}

function Navbar() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const navItem = ({ isActive }: { isActive: boolean }) =>
    cn("text-sm font-medium transition-colors hover:text-primary", isActive ? "text-primary" : "text-muted-foreground");

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-lg tracking-tight">BoltWear</span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          <NavLink to="/" end className={navItem}>
            Home
          </NavLink>
          <NavLink to="/products" className={navItem}>
            Shop
          </NavLink>
          {user?.role === "OWNER" && (
            <NavLink to="/admin" className={navItem}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <CartBadge />
          </Link>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/orders">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Orders
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {user.full_name.split(" ")[0]}
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">
                  <UserIcon className="mr-2 h-4 w-4" /> Sign in
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t md:hidden">
          <div className="container flex flex-col gap-2 py-3">
            <NavLink to="/" end className={navItem} onClick={() => setOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/products" className={navItem} onClick={() => setOpen(false)}>
              Shop
            </NavLink>
            {user ? (
              <>
                <NavLink to="/orders" className={navItem} onClick={() => setOpen(false)}>
                  Orders
                </NavLink>
                {user.role === "OWNER" && (
                  <NavLink to="/admin" className={navItem} onClick={() => setOpen(false)}>
                    Admin
                  </NavLink>
                )}
                <button
                  className="text-left text-sm font-medium text-muted-foreground hover:text-primary"
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate("/");
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navItem} onClick={() => setOpen(false)}>
                  Sign in
                </NavLink>
                <NavLink to="/register" className={navItem} onClick={() => setOpen(false)}>
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
    <footer className="border-t py-8">
      <div className="container flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground md:flex-row">
        <p>© {new Date().getFullYear()} BoltWear. All rights reserved.</p>
        <p>Apparel built for movement.</p>
      </div>
    </footer>
  );
}

export function ShopLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
