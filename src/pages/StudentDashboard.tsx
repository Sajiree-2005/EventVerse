import { useApp } from "@/context/AppContext";
import { useState } from "react";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Play,
  Search,
  LogIn,
  LayoutDashboard,
  Tag,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const StudentDashboard = () => {
  const { registrations, events, currentStudent, cancelRegistration } =
    useApp();
  const [emailFilter, setEmailFilter] = useState(currentStudent?.email || "");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [registrationToCancel, setRegistrationToCancel] = useState<{
    id: string;
    eventName: string;
  } | null>(null);

  const myRegs = emailFilter
    ? registrations.filter(
        (r) => r.studentEmail.toLowerCase() === emailFilter.toLowerCase(),
      )
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
    upcoming: {
      label: "Upcoming",
      icon: Clock,
      className: "bg-primary/10 text-primary border-primary/20",
    },
    ongoing: {
      label: "Ongoing",
      icon: Play,
      className: "bg-success/10 text-success border-success/20",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      className: "bg-muted text-muted-foreground border-border",
    },
  };

  // Stats
  const upcomingCount = myRegs.filter((r) => {
    const e = events.find((ev) => ev.id === r.eventId);
    return e && getStatus(e.date) === "upcoming";
  }).length;
  const completedCount = myRegs.filter((r) => {
    const e = events.find((ev) => ev.id === r.eventId);
    return e && getStatus(e.date) === "completed";
  }).length;

  const handleCancelClick = (regId: string, eventName: string) => {
    setRegistrationToCancel({ id: regId, eventName });
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (registrationToCancel && currentStudent) {
      cancelRegistration(registrationToCancel.id, currentStudent.email);
      setCancelDialogOpen(false);
      setRegistrationToCancel(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <LayoutDashboard size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">
              {currentStudent
                ? `Welcome, ${currentStudent.name.split(" ")[0]}!`
                : "Student Dashboard"}
            </h1>
            <p className="mt-0.5 text-sm font-serif text-muted-foreground">
              {currentStudent
                ? currentStudent.email
                : "View your registered events"}
            </p>
          </div>
        </div>
        {!currentStudent && (
          <Link
            to="/student/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground btn-primary-brighten self-start"
          >
            <LogIn size={14} />
            Sign In
          </Link>
        )}
      </div>

      {/* Stats row (only if logged in and has regs) */}
      {currentStudent && myRegs.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Registered",
              value: myRegs.length,
              color: "text-foreground",
            },
            { label: "Upcoming", value: upcomingCount, color: "text-primary" },
            { label: "Attended", value: completedCount, color: "text-success" },
          ].map((s) => (
            <div key={s.label} className="stat-card text-center py-5">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Email lookup (for non-logged in users) */}
      {!currentStudent && (
        <div className="mt-8 max-w-md mb-10">
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Enter your email to view registrations
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="email"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              placeholder="you@college.edu"
              className="glass-input pl-10"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground font-serif">
            Or{" "}
            <Link
              to="/student/login"
              className="text-primary font-semibold hover:underline"
            >
              sign in
            </Link>{" "}
            to your student portal for a better experience.
          </p>
        </div>
      )}

      {/* No registrations state */}
      {(currentStudent || emailFilter) && myRegs.length === 0 && (
        <div className="mt-10 text-center py-16 rounded-2xl border border-border/50 bg-muted/20">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Calendar size={24} className="text-muted-foreground" />
          </div>
          <p className="text-base font-bold text-foreground">
            No registrations yet
          </p>
          <p className="mt-1 text-sm font-serif text-muted-foreground">
            {emailFilter && !currentStudent
              ? `No registrations found for ${emailFilter}`
              : "Browse events and register to see them here"}
          </p>
          <Link
            to="/events"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground btn-primary-brighten"
          >
            Browse Events →
          </Link>
        </div>
      )}

      {/* Registrations grid */}
      {myRegs.length > 0 && (
        <div>
          <h2 className="text-lg font-extrabold text-foreground mb-5">
            My Events{" "}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              ({myRegs.length})
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myRegs.map((reg) => {
              const event = events.find((e) => e.id === reg.eventId);
              if (!event) return null;
              const status = getStatus(event.date);
              const config = statusConfig[status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={reg.id}
                  className="card-elevated overflow-hidden group"
                >
                  {/* Image strip */}
                  <div className="relative h-28 overflow-hidden">
                    <img
                      src={event.poster}
                      alt={event.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm bg-white/90 ${config.className}`}
                      >
                        <StatusIcon size={9} />
                        {config.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-extrabold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {event.name}
                    </h3>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar size={12} className="text-primary shrink-0" />
                        <span className="font-sans">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin size={12} className="text-primary shrink-0" />
                        <span className="font-sans truncate">
                          {event.venue}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Tag size={12} className="text-primary shrink-0" />
                        <span className="font-sans">{event.category}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                      <p className="text-[11px] text-muted-foreground font-sans">
                        Registered{" "}
                        {new Date(reg.registeredAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/events/${event.id}`}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          View →
                        </Link>
                        {status !== "completed" && (
                          <button
                            onClick={() =>
                              handleCancelClick(reg.id, event.name)
                            }
                            className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:text-destructive/80 hover:bg-destructive/5 px-2 py-1 rounded transition-colors"
                            title="Cancel registration"
                          >
                            <X size={12} />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancel Registration Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your registration for{" "}
              <span className="font-semibold text-foreground">
                {registrationToCancel?.eventName}
              </span>
              ? This action cannot be undone and your seat will become available
              for other students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Keep Registration</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Registration
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentDashboard;
