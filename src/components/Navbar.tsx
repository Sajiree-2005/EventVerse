import { Link, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const { isAdminLoggedIn, logoutAdmin } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/events", label: "Events" },
    { to: "/dashboard", label: "Dashboard" },
    ...(isAdminLoggedIn
      ? [
          { to: "/admin", label: "Admin" },
          { to: "/admin/analytics", label: "Analytics" },
        ]
      : [{ to: "/admin/login", label: "Admin Login" }]),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <span className="text-sm font-bold text-primary-foreground">EV</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Event<span className="text-primary">Verse</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                isActive(link.to)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdminLoggedIn && (
            <button
              onClick={logoutAdmin}
              className="ml-2 flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <LogOut size={14} />
              Logout
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden rounded-lg p-2 text-foreground hover:bg-muted/50 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/50 bg-card px-4 pb-4 md:hidden animate-slide-down">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                isActive(link.to) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdminLoggedIn && (
            <button
              onClick={() => { logoutAdmin(); setMobileOpen(false); }}
              className="block w-full text-left rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
