import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Shield } from "lucide-react";

const AdminLogin = () => {
  const { loginAdmin } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(email, password)) {
      navigate("/admin");
    } else {
      setError("Invalid credentials. Try admin@eventverse.com / admin123");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="card-elevated p-8" style={{ boxShadow: "var(--modal-shadow)" }}>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
              <Shield size={24} className="text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Admin Login</h1>
            <p className="mt-1 text-sm font-serif text-muted-foreground">Sign in to manage EventVerse</p>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3">
              <AlertCircle size={16} className="text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Admin Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="glass-input" placeholder="admin@eventverse.com" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="glass-input" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground btn-primary-brighten">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
