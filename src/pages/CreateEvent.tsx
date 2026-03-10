import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Navigate, useNavigate } from "react-router-dom";
import { EVENT_CATEGORIES } from "@/data/events";
import { CheckCircle2, Plus } from "lucide-react";

const CreateEvent = () => {
  const { isAdminLoggedIn, addEvent } = useApp();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "", description: "", date: "", venue: "",
    capacity: "", registrationDeadline: "", category: EVENT_CATEGORIES[0], poster: "",
  });

  if (!isAdminLoggedIn) return <Navigate to="/admin/login" />;

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent({
      name: form.name, description: form.description,
      date: new Date(form.date).toISOString(), venue: form.venue,
      capacity: parseInt(form.capacity) || 50,
      registrationDeadline: new Date(form.registrationDeadline).toISOString(),
      category: form.category,
      poster: form.poster || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    });
    setSuccess(true);
    setTimeout(() => navigate("/admin"), 2000);
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="mx-auto rounded-full bg-success/10 p-4 w-fit">
            <CheckCircle2 size={48} className="text-success" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">Event Created Successfully</h2>
          <p className="mt-1 text-sm font-serif text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const fields = [
    { key: "name", label: "Event Name", type: "text", placeholder: "AI Workshop 2026" },
    { key: "description", label: "Event Description", type: "textarea", placeholder: "Describe the event..." },
    { key: "date", label: "Event Date", type: "datetime-local" },
    { key: "venue", label: "Event Venue", type: "text", placeholder: "Seminar Hall A" },
    { key: "capacity", label: "Maximum Participants", type: "number", placeholder: "50" },
    { key: "registrationDeadline", label: "Registration Deadline", type: "datetime-local" },
    { key: "poster", label: "Event Poster URL", type: "url", placeholder: "https://..." },
  ];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <Plus size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Event</h1>
          <p className="text-sm font-serif text-muted-foreground">Add a new event to EventVerse</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-2 block text-sm font-medium text-foreground">{f.label}</label>
            {f.type === "textarea" ? (
              <textarea
                value={(form as any)[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                required rows={4}
                className="glass-input resize-none font-serif"
                placeholder={f.placeholder}
              />
            ) : (
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                required={f.key !== "poster"}
                className="glass-input"
                placeholder={f.placeholder}
              />
            )}
          </div>
        ))}

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Event Category</label>
          <select value={form.category} onChange={(e) => update("category", e.target.value)} className="glass-input">
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground btn-primary-brighten">
          Create Event
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
