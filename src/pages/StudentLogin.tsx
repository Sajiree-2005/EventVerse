import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, AlertCircle, Sparkles, ArrowRight, BookOpen } from "lucide-react";

const StudentLogin = () => {
  const { loginStudent, currentStudent } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  if (currentStudent) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    loginStudent(name.trim(), email.trim().toLowerCase());
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div
          className="card-elevated p-8 sm:p-10"
          style={{ boxShadow: "var(--modal-shadow)" }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-5 relative w-fit">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
                <User size={28} className="text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 rounded-full bg-card p-1">
                <Sparkles size={12} className="text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Student Portal</h1>
            <p className="mt-2 text-sm font-serif text-muted-foreground max-w-[260px] mx-auto">
              Sign in to register for events and track your campus activities
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-3.5">
              <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  required
                  className="glass-input pl-10"
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Student Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  required
                  className="glass-input pl-10"
                  placeholder="you@college.edu"
                  autoComplete="email"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">Use your institutional email address</p>
            </div>

            <button
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground btn-primary-brighten"
            >
              Access Portal
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Info note */}
          <div className="mt-6 rounded-xl bg-muted/50 border border-border/50 p-4">
            <div className="flex items-start gap-2.5">
              <BookOpen size={14} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground mb-0.5">First time here?</p>
                <p className="text-xs font-serif text-muted-foreground">
                  No registration needed. Simply enter your name and email to access the student portal and start registering for events.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom link */}
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Want to explore first?{" "}
          <Link to="/events" className="font-semibold text-primary hover:underline">
            Browse Events →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;
