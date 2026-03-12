import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Event } from "@/data/events";
import { X, CheckCircle2, AlertCircle, Sparkles, User, Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";

interface RegistrationModalProps {
  event: Event;
  open: boolean;
  onClose: () => void;
}

const RegistrationModal = ({ event, open, onClose }: RegistrationModalProps) => {
  const { registerForEvent, currentStudent } = useApp();
  const [name, setName] = useState(currentStudent?.name || "");
  const [email, setEmail] = useState(currentStudent?.email || "");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const res = registerForEvent(event.id, name.trim(), email.trim());
    setResult(res);
  };

  const handleClose = () => {
    setResult(null);
    setName(currentStudent?.name || "");
    setEmail(currentStudent?.email || "");
    onClose();
  };

  const requiresLogin = !currentStudent;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-md p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-card p-8 animate-fade-in-up border border-border/50"
        style={{ boxShadow: "var(--modal-shadow)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {result ? (
          /* Result state */
          <div className="flex flex-col items-center py-6 text-center">
            {result.success ? (
              <>
                <div className="relative">
                  <div className="rounded-full bg-success/10 p-5 border-2 border-success/20">
                    <CheckCircle2 size={40} className="text-success" />
                  </div>
                  <Sparkles size={16} className="absolute -top-1 -right-1 text-success animate-pulse-soft" />
                </div>
                <h3 className="mt-4 text-xl font-extrabold text-foreground">You're In! 🎉</h3>
                <p className="mt-2 text-sm font-serif text-muted-foreground max-w-[240px]">{result.message}</p>
                <div className="mt-3 rounded-xl bg-success/10 border border-success/20 px-4 py-2.5 text-xs font-medium text-success">
                  Check your dashboard for event details
                </div>
              </>
            ) : (
              <>
                <div className="rounded-full bg-destructive/10 p-5 border-2 border-destructive/20">
                  <AlertCircle size={40} className="text-destructive" />
                </div>
                <h3 className="mt-4 text-xl font-extrabold text-foreground">Couldn't Register</h3>
                <p className="mt-2 text-sm font-serif text-muted-foreground">{result.message}</p>
              </>
            )}
            <button
              onClick={handleClose}
              className="mt-6 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground btn-primary-brighten"
            >
              Done
            </button>
          </div>
        ) : requiresLogin ? (
          /* Login required state */
          <div className="flex flex-col items-center py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <Lock size={28} className="text-primary" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground">Login Required</h3>
            <p className="mt-2 text-sm font-serif text-muted-foreground max-w-[260px]">
              Please sign in to your student portal to register for <strong>{event.name}</strong>
            </p>
            <div className="mt-6 flex flex-col w-full gap-2.5">
              <Link
                to="/student/login"
                onClick={handleClose}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground btn-primary-brighten text-center"
              >
                Sign In to Register
              </Link>
              <button
                onClick={handleClose}
                className="w-full rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          /* Registration form */
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-2.5">
                <Sparkles size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-foreground">Register for Event</h3>
                <p className="text-xs font-serif text-muted-foreground mt-0.5 line-clamp-1">{event.name}</p>
              </div>
            </div>

            {/* Pre-filled notice */}
            {currentStudent && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-success/10 border border-success/20 px-3.5 py-2.5">
                <CheckCircle2 size={14} className="text-success shrink-0" />
                <p className="text-xs font-medium text-success">Logged in as {currentStudent.name}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Student Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    readOnly={!!currentStudent}
                    className={`glass-input pl-9 ${currentStudent ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}`}
                    placeholder="Enter your name"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Student Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    readOnly={!!currentStudent}
                    className={`glass-input pl-9 ${currentStudent ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}`}
                    placeholder="you@college.edu"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Event</label>
                <input
                  type="text"
                  value={event.name}
                  disabled
                  className="glass-input bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground btn-primary-brighten"
              >
                Confirm Registration
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RegistrationModal;
