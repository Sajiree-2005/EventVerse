import { useApp } from "@/context/AppContext";
import { Navigate, Link } from "react-router-dom";
import { Trash2, Users, Eye, Plus, Calendar, Edit3, AlertTriangle } from "lucide-react";
import { useState } from "react";

const ManageEvents = () => {
  const { events, isAdminLoggedIn, deleteEvent } = useApp();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!isAdminLoggedIn) return <Navigate to="/admin/login" />;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Manage Events</h1>
          <p className="mt-1 text-sm font-serif text-muted-foreground">{events.length} total events</p>
        </div>
        <Link
          to="/admin/create"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground btn-primary-brighten shadow-md shadow-primary/25"
        >
          <Plus size={14} />
          Create Event
        </Link>
      </div>

      {/* Events list */}
      <div className="space-y-3">
        {events.map((event) => {
          const pct = Math.round((event.registered / event.capacity) * 100);
          const isNearFull = pct >= 80;

          return (
            <div
              key={event.id}
              className="card-elevated flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={event.poster}
                    alt={event.name}
                    className="h-14 w-20 rounded-xl object-cover group-hover:opacity-90 transition-opacity"
                  />
                  {isNearFull && (
                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500">
                      <AlertTriangle size={9} className="text-white fill-white" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-foreground truncate">{event.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-[11px] rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-bold">
                      {event.category}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-sans flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span className={`text-[11px] font-semibold font-sans ${isNearFull ? "text-amber-600" : "text-muted-foreground"}`}>
                      {event.registered}/{event.capacity} registered
                    </span>
                  </div>
                  {/* Capacity bar */}
                  <div className="mt-2 w-40 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 100 ? "bg-destructive" : isNearFull ? "bg-amber-500" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  to={`/events/${event.id}`}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  title="View event"
                >
                  <Eye size={15} />
                </Link>
                <Link
                  to={`/admin/participants/${event.id}`}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  title="View participants"
                >
                  <Users size={15} />
                </Link>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  title="Edit event"
                >
                  <Edit3 size={15} />
                </button>

                {confirmDelete === event.id ? (
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      onClick={() => { deleteEvent(event.id); setConfirmDelete(null); }}
                      className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground hover:opacity-90 transition-opacity"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(event.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all ml-1"
                    title="Delete event"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-lg font-bold text-foreground">No events yet</p>
          <Link to="/admin/create" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
            Create your first event →
          </Link>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
