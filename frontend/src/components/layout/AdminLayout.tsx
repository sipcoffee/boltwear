import { LayoutDashboard, ListOrdered, LogOut, Package, Tags, Users } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { Wordmark } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ListOrdered },
  { to: "/admin/users", label: "Users", icon: Users },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 flex-col border-r border-border/60 bg-background md:flex">
        <div className="flex h-16 items-center border-b border-border/60 px-5">
          <Link to="/admin">
            <Wordmark showAdmin />
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t border-border/60 p-3">
          <div className="rounded-lg border bg-muted/30 px-3 py-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Signed in as</p>
            <p className="line-clamp-1 text-sm font-medium">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">View store</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border/60 bg-background px-6 md:hidden">
          <Link to="/admin">
            <Wordmark showAdmin />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">Store</Link>
          </Button>
        </header>
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
