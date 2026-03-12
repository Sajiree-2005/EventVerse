import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Shield, Lock, Mail, Eye, EyeOff } from "lucide-react";

const AdminLogin = () => {
  const { loginAdmin } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 400)); // brief delay for UX
    if (loginAdmin(email, password)) {
      navigate("/admin");
    } else {
      setError("Invalid credentials. Try admin@eventverse.com / admin123");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="card-elevated p-8 sm:p-10" style={{ boxShadow: "var(--modal-shadow)" }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-5 relative w-fit">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/30">
                <Shield size={28} className="text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-success border-2 border-card">
                <div className="h-1.5 w-1.5 rounded-full bg-success-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Admin Portal</h1>
            <p className="mt-2 text-sm font-serif text-muted-foreground">
              Sign in to manage EventVerse
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-3.5">
              <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="glass-input pl-10"
                  placeholder="admin@eventverse.com"
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="glass-input pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground btn-primary-brighten disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 rounded-xl bg-muted/50 border border-border/50 p-4">
            <p className="text-xs font-semibold text-foreground mb-1.5">Demo Credentials</p>
            <p className="text-xs font-mono text-muted-foreground">admin@eventverse.com</p>
            <p className="text-xs font-mono text-muted-foreground">admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
