import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { EVENT_CATEGORIES } from "@/data/events";
import { CheckCircle2, Plus, ArrowLeft, ImageIcon } from "lucide-react";

const CreateEvent = () => {
  const { isAdminLoggedIn, addEvent } = useApp();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    venue: "",
    capacity: "",
    registrationDeadline: "",
    category: EVENT_CATEGORIES[0],
    poster: "",
  });

  if (!isAdminLoggedIn) return <Navigate to="/admin/login" />;

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent({
      name: form.name,
      description: form.description,
      date: new Date(form.date).toISOString(),
      venue: form.venue,
      capacity: parseInt(form.capacity) || 50,
      registrationDeadline: new Date(form.registrationDeadline).toISOString(),
      category: form.category,
      poster:
        form.poster ||
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    });
    setSuccess(true);
    setTimeout(() => navigate("/admin"), 2200);
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="mx-auto rounded-full bg-success/10 border-2 border-success/20 p-5 w-fit">
            <CheckCircle2 size={48} className="text-success" />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold text-foreground">Event Created!</h2>
          <p className="mt-2 text-sm font-serif text-muted-foreground">Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  const textFields = [
    { key: "name", label: "Event Name", type: "text", placeholder: "AI Workshop 2026", required: true },
    { key: "date", label: "Event Date & Time", type: "datetime-local", required: true },
    { key: "venue", label: "Venue", type: "text", placeholder: "Seminar Hall A", required: true },
    { key: "capacity", label: "Max Participants", type: "number", placeholder: "50", required: true },
    { key: "registrationDeadline", label: "Registration Deadline", type: "datetime-local", required: true },
    { key: "poster", label: "Poster Image URL", type: "url", placeholder: "https://images.unsplash.com/…", required: false },
  ];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/admin/manage"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Manage
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <Plus size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Create New Event</h1>
            <p className="text-sm font-serif text-muted-foreground">Fill in the details to add a new event</p>
          </div>
        </div>
      </div>

      <div className="card-elevated p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Description (full width at top) */}
          <div className="grid sm:grid-cols-2 gap-5">
            {textFields.slice(0, 2).map((f) => (
              <div key={f.key} className={f.key === "name" ? "sm:col-span-2" : ""}>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  {f.label}
                  {f.required && <span className="text-primary ml-0.5">*</span>}
                </label>
                <input
                  type={f.type}
                  value={(form as any)[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  required={f.required}
                  className="glass-input"
                  placeholder={f.placeholder}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Description<span className="text-primary ml-0.5">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
              rows={4}
              className="glass-input resize-none font-serif"
              placeholder="Describe what attendees can expect from this event…"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {textFields.slice(2, 5).map((f) => (
              <div key={f.key}>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  {f.label}
                  {f.required && <span className="text-primary ml-0.5">*</span>}
                </label>
                <input
                  type={f.type}
                  value={(form as any)[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  required={f.required}
                  className="glass-input"
                  placeholder={f.placeholder}
                />
              </div>
            ))}
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Category<span className="text-primary ml-0.5">*</span></label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="glass-input"
              >
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Poster URL */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground flex items-center gap-1.5">
              <ImageIcon size={13} />
              Poster Image URL
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              type="url"
              value={form.poster}
              onChange={(e) => update("poster", e.target.value)}
              className="glass-input"
              placeholder="https://images.unsplash.com/…"
            />
            {form.poster && (
              <img
                src={form.poster}
                alt="Preview"
                className="mt-3 h-24 w-full rounded-xl object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground btn-primary-brighten shadow-lg shadow-primary/25"
            >
              Create Event
            </button>
            <Link
              to="/admin/manage"
              className="rounded-xl border border-border px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
