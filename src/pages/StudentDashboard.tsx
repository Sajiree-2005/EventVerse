import { useApp } from "@/context/AppContext";
import { useState } from "react";
import { Calendar, MapPin, CheckCircle2, Clock, Play, Search } from "lucide-react";

const StudentDashboard = () => {
  const { registrations, events } = useApp();
  const [emailFilter, setEmailFilter] = useState("");

  const myRegs = emailFilter
    ? registrations.filter((r) => r.studentEmail.toLowerCase() === emailFilter.toLowerCase())
    : [];

  const getStatus = (eventDate: string) => {
    const now = new Date();
    const d = new Date(eventDate);
    const diff = d.getTime() - now.getTime();
    if (diff > 24 * 60 * 60 * 1000) return "upcoming";
    if (diff > 0) return "ongoing";
    return "completed";
  };

  const statusConfig = {
    upcoming: { label: "Upcoming", icon: Clock, className: "bg-primary/10 text-primary" },
    ongoing: { label: "Ongoing", icon: Play, className: "bg-success/10 text-success" },
    completed: { label: "Completed", icon: CheckCircle2, className: "bg-muted text-muted-foreground" },
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
      <p className="mt-1 text-sm font-serif text-muted-foreground">View your registered events and participation status</p>

      <div className="mt-8 max-w-md">
        <label className="mb-2 block text-sm font-medium text-foreground">Enter your email to view registrations</label>
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            placeholder="you@college.edu"
            className="glass-input pl-10"
          />
        </div>
      </div>

      {emailFilter && myRegs.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">No registrations found</p>
          <p className="mt-1 text-sm font-serif text-muted-foreground">Register for events from the Events page</p>
        </div>
      )}

      {myRegs.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-foreground">My Registered Events ({myRegs.length})</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {myRegs.map((reg) => {
              const event = events.find((e) => e.id === reg.eventId);
              if (!event) return null;
              const status = getStatus(event.date);
              const config = statusConfig[status];
              const StatusIcon = config.icon;

              return (
                <div key={reg.id} className="card-elevated p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="text-base font-bold text-foreground">{event.name}</h3>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}>
                      <StatusIcon size={12} />
                      {config.label}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar size={14} className="text-primary" />
                      <span className="font-sans">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin size={14} className="text-primary" />
                      <span className="font-sans">{event.venue}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground font-sans border-t border-border/50 pt-3">
                    Registered on {new Date(reg.registeredAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
