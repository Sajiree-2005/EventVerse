import { useApp } from "@/context/AppContext";
import { useParams, Navigate, Link } from "react-router-dom";
import { ArrowLeft, Download, Users, Mail, Calendar, Hash } from "lucide-react";

const Participants = () => {
  const { id } = useParams();
  const { events, isAdminLoggedIn, getEventRegistrations } = useApp();

  if (!isAdminLoggedIn) return <Navigate to="/admin/login" />;

  const event = events.find((e) => e.id === id);
  const regs = id ? getEventRegistrations(id) : [];

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground">Event not found</p>
        <Link to="/admin/manage" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Back to Manage
        </Link>
      </div>
    );
  }

  const exportCSV = () => {
    const headers = "Student Name,Student Email,Registration Date\n";
    const rows = regs
      .map((r) => `${r.studentName},${r.studentEmail},${new Date(r.registeredAt).toLocaleDateString()}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.name.replace(/\s+/g, "-")}-participants.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pct = Math.round((event.registered / event.capacity) * 100);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back */}
      <Link
        to="/admin/manage"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Manage Events
      </Link>

      {/* Event summary card */}
      <div className="card-elevated overflow-hidden mb-8">
        <div className="relative h-28 sm:h-36 overflow-hidden">
          <img src={event.poster} alt={event.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
            <div>
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">{event.category}</span>
              <h1 className="text-xl font-extrabold text-white">{event.name}</h1>
            </div>
          </div>
        </div>
        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-primary">{regs.length}</p>
              <p className="text-xs text-muted-foreground">Registered</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-foreground">{event.capacity - regs.length}</p>
              <p className="text-xs text-muted-foreground">Seats Left</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-foreground">{pct}%</p>
              <p className="text-xs text-muted-foreground">Fill Rate</p>
            </div>
          </div>
          <button
            onClick={exportCSV}
            disabled={regs.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground btn-primary-brighten disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/25"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Participants table */}
      {regs.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-border/50 bg-muted/20">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Users size={24} className="text-muted-foreground" />
          </div>
          <p className="text-base font-bold text-foreground">No participants yet</p>
          <p className="mt-1 text-sm font-serif text-muted-foreground">
            Share the event link to start getting registrations
          </p>
        </div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/40">
                  <th className="px-5 py-3.5 text-left">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Hash size={11} />
                      #
                    </div>
                  </th>
                  <th className="px-5 py-3.5 text-left">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Users size={11} />
                      Student Name
                    </div>
                  </th>
                  <th className="px-5 py-3.5 text-left">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Mail size={11} />
                      Email
                    </div>
                  </th>
                  <th className="px-5 py-3.5 text-left">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Calendar size={11} />
                      Registered On
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {regs.map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-t border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {r.studentName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-foreground">{r.studentName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-sans text-sm">{r.studentEmail}</td>
                    <td className="px-5 py-4 text-muted-foreground text-xs font-sans">
                      {new Date(r.registeredAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border/50 bg-muted/20 px-5 py-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-sans">{regs.length} participant{regs.length !== 1 ? "s" : ""}</p>
            <button
              onClick={exportCSV}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <Download size={11} />
              Export CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Participants;
