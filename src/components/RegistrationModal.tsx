import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Event } from "@/data/events";
import { X, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface RegistrationModalProps {
  event: Event;
  open: boolean;
  onClose: () => void;
}

const RegistrationModal = ({ event, open, onClose }: RegistrationModalProps) => {
  const { registerForEvent } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
    setName("");
    setEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-md" onClick={handleClose}>
      <div
        className="relative mx-4 w-full max-w-md rounded-2xl bg-card p-8 animate-fade-in-up border border-border/50"
        style={{ boxShadow: "var(--modal-shadow)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
          <X size={18} />
        </button>

        {result ? (
          <div className="flex flex-col items-center py-6 text-center">
            {result.success ? (
              <>
                <div className="relative">
                  <div className="rounded-full bg-success/10 p-4">
                    <CheckCircle2 size={40} className="text-success" />
                  </div>
                  <Sparkles size={16} className="absolute -top-1 -right-1 text-success animate-pulse-soft" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-foreground">Registration Successful!</h3>
              </>
            ) : (
              <>
                <div className="rounded-full bg-destructive/10 p-4">
                  <AlertCircle size={40} className="text-destructive" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-foreground">Registration Failed</h3>
              </>
            )}
            <p className="mt-2 text-sm font-serif text-muted-foreground">{result.message}</p>
            <button
              onClick={handleClose}
              className="mt-6 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground btn-primary-brighten"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <Sparkles size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Register for Event</h3>
                <p className="text-sm font-serif text-muted-foreground">{event.name}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Student Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="glass-input" placeholder="Enter your name" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Student Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="glass-input" placeholder="you@college.edu" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Selected Event</label>
                <input type="text" value={event.name} disabled className="glass-input bg-muted text-muted-foreground" />
              </div>
              <button type="submit" className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground btn-primary-brighten">
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
