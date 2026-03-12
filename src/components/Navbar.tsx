import { Link, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import { Menu, X, LogOut, User, LayoutDashboard, ChevronDown } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const { isAdminLoggedIn, logoutAdmin, currentStudent, logoutStudent } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [studentMenuOpen, setStudentMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/events", label: "Events" },
    ...(isAdminLoggedIn
      ? [
          { to: "/admin", label: "Dashboard" },
          { to: "/admin/analytics", label: "Analytics" },
          { to: "/admin/manage", label: "Manage" },
        ]
      : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/85 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30 transition-transform duration-200 group-hover:scale-105">
            {/* Calendar icon in logo */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="14" height="12" rx="2" fill="white" fillOpacity="0.2"/>
              <rect x="3" y="3" width="14" height="4" rx="1.5" fill="white"/>
              <rect x="5" y="10" width="3" height="3" rx="0.5" fill="white"/>
              <rect x="9" y="10" width="3" height="3" rx="0.5" fill="white" fillOpacity="0.6"/>
              <rect x="13" y="10" width="3" height="3" rx="0.5" fill="white" fillOpacity="0.35"/>
            </svg>
            {/* Orbit dot */}
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-card animate-pulse-soft" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            Event<span className="text-primary">Verse</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                isActive(link.to)
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Admin logout */}
          {isAdminLoggedIn && (
            <button
              onClick={logoutAdmin}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <LogOut size={14} />
              Admin Logout
            </button>
          )}

          {/* Student logged in */}
          {currentStudent ? (
            <div className="relative">
              <button
                onClick={() => setStudentMenuOpen(!studentMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-all duration-200 shadow-sm"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {currentStudent.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{currentStudent.name.split(" ")[0]}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${studentMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {studentMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-slide-down">
                  <div className="px-3 py-2 mb-1 border-b border-border/50">
                    <p className="text-xs font-semibold text-foreground truncate">{currentStudent.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentStudent.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setStudentMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <LayoutDashboard size={14} className="text-primary" />
                    My Dashboard
                  </Link>
                  <button
                    onClick={() => { logoutStudent(); setStudentMenuOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            !isAdminLoggedIn && (
              <div className="flex items-center gap-2">
                <Link
                  to="/student/login"
                  className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 border border-border"
                >
                  <User size={14} />
                  Student Login
                </Link>
                {!isAdminLoggedIn && (
                  <Link
                    to="/admin/login"
                    className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-all duration-200"
                  >
                    Admin
                  </Link>
                )}
              </div>
            )
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden rounded-lg p-2 text-foreground hover:bg-muted/50 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/50 bg-card px-4 pb-4 md:hidden animate-slide-down">
          <div className="py-2 space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                  isActive(link.to) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-border/50 pt-3 space-y-1">
            {currentStudent ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {currentStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{currentStudent.name}</p>
                    <p className="text-xs text-muted-foreground">{currentStudent.email}</p>
                  </div>
                </div>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors">My Dashboard</Link>
                <button onClick={() => { logoutStudent(); setMobileOpen(false); }} className="block w-full text-left rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">Sign Out</button>
              </>
            ) : (
              <Link to="/student/login" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">Student Login</Link>
            )}
            {isAdminLoggedIn && (
              <button onClick={() => { logoutAdmin(); setMobileOpen(false); }} className="block w-full text-left rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">Admin Logout</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
