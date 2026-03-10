import { useApp } from "@/context/AppContext";
import { Navigate, Link } from "react-router-dom";
import { Trash2, Users, Eye, Plus, Calendar } from "lucide-react";
import { useState } from "react";

const ManageEvents = () => {
  const { events, isAdminLoggedIn, deleteEvent } = useApp();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!isAdminLoggedIn) return <Navigate to="/admin/login" />;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Events</h1>
          <p className="mt-1 text-sm font-serif text-muted-foreground">{events.length} events</p>
        </div>
        <Link to="/admin/create" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground btn-primary-brighten">
          <Plus size={14} /> Create Event
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {events.map((event) => (
          <div key={event.id} className="card-elevated flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img src={event.poster} alt={event.name} className="h-14 w-20 rounded-xl object-cover shrink-0" />
              <div>
                <h3 className="font-bold text-foreground">{event.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-sans">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-semibold">{event.category}</span>
                  <span>{event.registered}/{event.capacity} registered</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link to={`/events/${event.id}`} className="rounded-xl p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all" title="View">
                <Eye size={16} />
              </Link>
              <Link to={`/admin/participants/${event.id}`} className="rounded-xl p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all" title="Participants">
                <Users size={16} />
              </Link>
              {confirmDelete === event.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => { deleteEvent(event.id); setConfirmDelete(null); }} className="rounded-xl bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground">
                    Confirm
                  </button>
                  <button onClick={() => setConfirmDelete(null)} className="rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(event.id)} className="rounded-xl p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all" title="Delete">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageEvents;
