import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { X, CheckCircle2, AlertCircle, User, Mail, Users, Heart, Loader2, Wifi, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import TeamRegistrationForm, { TeamFormData } from "./TeamRegistrationForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { registerStudent, registerTeam, volunteerForEvent, checkHealth } from "@/services/api";

interface Props {
  event: {
    id: string | number;
    name: string;
    capacity: number;
    registered: number;
    volunteeringEnabled?: boolean;
    volunteerSlots?: number;
  };
  open: boolean;
  onClose: () => void;
}

type Mode = "register" | "volunteer";

const RegistrationModal = ({ event, open, onClose }: Props) => {
  const { currentStudent } = useApp();
  const [mode, setMode]       = useState<Mode>("register");
  const [regType, setRegType] = useState<"individual" | "team">("individual");
  const [name, setName]       = useState(currentStudent?.name || "");
  const [email, setEmail]     = useState(currentStudent?.email || "");
  const [result, setResult]   = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendUp, setBackendUp] = useState<boolean | null>(null); // null = checking

  // Check backend when modal opens
  useEffect(() => {
    if (!open) return;
    setBackendUp(null);
    checkHealth().then(setBackendUp);
  }, [open]);

  if (!open) return null;

  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    try {
      const res = await registerStudent({
        eventId: event.id,
        studentName: name.trim(),
        studentEmail: email.trim(),
      });
      setResult(res);
    } catch (err: any) {
      setResult({ success: false, message: err?.message ?? String(err) });
    } finally {
      setLoading(false);
    }
  };

  const doVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    try {
      const res = await volunteerForEvent({
        eventId: event.id,
        studentName: name.trim(),
        studentEmail: email.trim(),
      });
      setResult(res);
    } catch (err: any) {
      setResult({ success: false, message: err?.message ?? String(err) });
    } finally {
      setLoading(false);
    }
  };

  const doTeam = async (formData: TeamFormData) => {
    setLoading(true);
    try {
      const res = await registerTeam({
        eventId: event.id,
        teamName: formData.teamName,
        leadName: formData.leadName,
        leadEmail: formData.leadEmail,
        teamMembers: formData.members,
      });
      setResult(res);
    } catch (err: any) {
      setResult({ success: false, message: err?.message ?? String(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setMode("register");
    setRegType("individual");
    setName(currentStudent?.name || "");
    setEmail(currentStudent?.email || "");
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-[var(--modal-shadow)] overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-5">
          <button onClick={handleClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
            <X size={16} />
          </button>
          <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">
            {mode === "volunteer" ? "Volunteer" : "Register"}
          </p>
          <h2 className="text-lg font-extrabold text-white pr-10 leading-tight">{event.name}</h2>
        </div>

        <div className="p-6">

          {/* Backend status banner */}
          {backendUp === null && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-3 py-2.5 text-xs text-muted-foreground">
              <Loader2 size={13} className="animate-spin shrink-0" />
              Checking server connection…
            </div>
          )}
          {backendUp === false && (
            <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-3 text-xs text-destructive">
              <div className="flex items-center gap-2 font-bold mb-1.5">
                <WifiOff size={13} /> Flask backend is not running
              </div>
              <p className="font-mono leading-relaxed">
                Open a new terminal and run:<br />
                <span className="font-bold">cd backend</span><br />
                <span className="font-bold">pip install -r requirements.txt</span><br />
                <span className="font-bold">python app.py</span>
              </p>
              <p className="mt-1.5 text-muted-foreground">Then close and reopen this form.</p>
            </div>
          )}
          {backendUp === true && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-success/10 border border-success/20 px-3 py-2 text-xs text-success font-semibold">
              <Wifi size={13} /> Server connected ✓
            </div>
          )}

          {/* Mode selector */}
          {event.volunteeringEnabled && !result && (
            <div className="flex gap-2 mb-5">
              <button onClick={() => setMode("register")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all
                  ${mode === "register" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                <User size={14} /> Register
              </button>
              <button onClick={() => setMode("volunteer")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all
                  ${mode === "volunteer" ? "bg-rose-500 text-white border-rose-500" : "border-border text-muted-foreground hover:border-rose-300"}`}>
                <Heart size={14} /> Volunteer
              </button>
            </div>
          )}

          {/* Result screen */}
          {result ? (
            <div className="text-center py-4">
              <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl
                ${result.success ? "bg-success/10" : "bg-destructive/10"}`}>
                {result.success
                  ? <CheckCircle2 size={28} className="text-success" />
                  : <AlertCircle   size={28} className="text-destructive" />}
              </div>
              <p className={`text-base font-extrabold ${result.success ? "text-foreground" : "text-destructive"}`}>
                {result.success ? "Success!" : "Error"}
              </p>
              <p className="mt-2 text-sm font-serif text-muted-foreground whitespace-pre-line leading-relaxed">
                {result.message}
              </p>
              {result.success && (
                <p className="mt-2 text-xs text-muted-foreground">
                  📧 A confirmation email has been sent to {email}
                </p>
              )}
              <div className="mt-5 flex gap-3">
                <button onClick={handleClose}
                  className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted/50 transition-colors">
                  Close
                </button>
                {result.success && (
                  <Link to="/dashboard" onClick={handleClose}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground text-center hover:bg-primary/90">
                    Dashboard →
                  </Link>
                )}
              </div>
            </div>

          ) : mode === "volunteer" ? (
            <form onSubmit={doVolunteer} className="space-y-4">
              <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-rose-700 font-medium">
                🙌 Volunteer slots: {event.volunteerSlots || "Limited"}. Your application will be reviewed.
              </div>
              <Field icon={User} placeholder="Your full name"   value={name}  onChange={setName} />
              <Field icon={Mail} placeholder="College email"    value={email} onChange={setEmail} type="email" />
              <SubmitBtn loading={loading} disabled={!name || !email} color="rose">
                Apply to Volunteer
              </SubmitBtn>
            </form>

          ) : (
            <Tabs value={regType} onValueChange={(v) => setRegType(v as any)}>
              <TabsList className="w-full mb-5">
                <TabsTrigger value="individual" className="flex-1 gap-1.5"><User size={13} /> Individual</TabsTrigger>
                <TabsTrigger value="team"       className="flex-1 gap-1.5"><Users size={13} /> Team</TabsTrigger>
              </TabsList>
              <TabsContent value="individual">
                <form onSubmit={doRegister} className="space-y-4">
                  <Field icon={User} placeholder="Your full name" value={name}  onChange={setName} />
                  <Field icon={Mail} placeholder="College email"  value={email} onChange={setEmail} type="email" />
                  <SubmitBtn loading={loading} disabled={!name || !email} color="primary">
                    Confirm Registration
                  </SubmitBtn>
                </form>
              </TabsContent>
              <TabsContent value="team">
                <TeamRegistrationForm
                  defaultLeadName={currentStudent?.name || ""}
                  defaultLeadEmail={currentStudent?.email || ""}
                  onSubmit={doTeam}
                  loading={loading}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Small helpers ── */
const Field = ({
  icon: Icon, placeholder, value, onChange, type = "text",
}: { icon: any; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div className="relative">
    <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <input type={type} placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)} required
      className="glass-input pl-9 text-sm w-full" />
  </div>
);

const SubmitBtn = ({
  loading, disabled, color, children,
}: { loading: boolean; disabled: boolean; color: "primary" | "rose"; children: React.ReactNode }) => (
  <button type="submit" disabled={loading || disabled}
    className={`w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50
      flex items-center justify-center gap-2 transition-all
      ${color === "primary" ? "bg-primary hover:bg-primary/90" : "bg-rose-500 hover:bg-rose-600"}`}>
    {loading && <Loader2 size={15} className="animate-spin" />}
    {loading ? "Please wait…" : children}
  </button>
);

export default RegistrationModal;
