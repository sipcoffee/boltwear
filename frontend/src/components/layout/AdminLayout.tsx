import { LayoutDashboard, ListOrdered, LogOut, Package, Tags, Users, Zap } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

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
      <aside className="hidden w-60 flex-col border-r bg-background md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6 font-bold">
          <Zap className="h-5 w-5 text-primary" />
          <span>BoltWear</span>
          <span className="ml-auto rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">Admin</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t p-3">
          <p className="px-3 text-xs text-muted-foreground">{user?.email}</p>
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
        <header className="flex h-16 items-center justify-between border-b bg-background px-6 md:hidden">
          <Link to="/admin" className="flex items-center gap-2 font-bold">
            <Zap className="h-5 w-5 text-primary" /> BoltWear Admin
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">Store</Link>
          </Button>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
