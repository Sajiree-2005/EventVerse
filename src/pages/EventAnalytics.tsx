import { useApp } from "@/context/AppContext";
import { Navigate, Link } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { BarChart3, Users, Calendar, TrendingUp, ArrowRight } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EventAnalytics = () => {
  const { events, registrations, isAdminLoggedIn, getEventRegistrations } = useApp();

  if (!isAdminLoggedIn) return <Navigate to="/admin/login" />;

  const primaryColor = "hsl(350, 90%, 35%)";

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <BarChart3 size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Event Analytics</h1>
          <p className="text-sm font-serif text-muted-foreground">Per-event registration data and insights</p>
        </div>
      </div>

      {/* Overview bar chart */}
      <div className="card-elevated p-6 mb-8">
        <h3 className="section-title mb-4">Registration Overview</h3>
        <Bar
          data={{
            labels: events.map((e) => e.name.length > 18 ? e.name.slice(0, 18) + "…" : e.name),
            datasets: [{
              label: "Registrations",
              data: events.map((e) => e.registered),
              backgroundColor: primaryColor,
              borderRadius: 8,
              borderSkipped: false,
            }],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { font: { family: "Inter", size: 11 } } },
              y: { grid: { color: "hsl(0, 0%, 91%)" }, ticks: { font: { family: "Inter", size: 11 } } },
            },
          }}
        />
      </div>

      {/* Per-event cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const regs = getEventRegistrations(event.id);
          const seatsLeft = event.capacity - event.registered;
          const percent = Math.round((event.registered / event.capacity) * 100);

          return (
            <div key={event.id} className="card-elevated p-5">
              <div className="flex items-start gap-3 mb-4">
                <img src={event.poster} alt={event.name} className="h-12 w-16 rounded-lg object-cover shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground text-sm truncate">{event.name}</h3>
                  <span className="text-xs text-muted-foreground font-sans">{event.category}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-background p-3 border border-border/50 text-center">
                  <p className="text-lg font-bold text-primary">{event.registered}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Registered</p>
                </div>
                <div className="rounded-xl bg-background p-3 border border-border/50 text-center">
                  <p className="text-lg font-bold text-foreground">{seatsLeft}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Seats Left</p>
                </div>
              </div>

              {/* Capacity bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs font-sans text-muted-foreground mb-1.5">
                  <span>Capacity</span>
                  <span>{percent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
                </div>
              </div>

              {/* Recent participants */}
              {regs.length > 0 && (
                <div className="border-t border-border/50 pt-3 mt-3">
                  <p className="section-title mb-2">Recent Participants</p>
                  {regs.slice(0, 3).map((r) => (
                    <p key={r.id} className="text-xs text-muted-foreground font-sans truncate">{r.studentName} — {r.studentEmail}</p>
                  ))}
                  {regs.length > 3 && <p className="text-xs text-primary font-semibold mt-1">+{regs.length - 3} more</p>}
                </div>
              )}

              <Link to={`/admin/participants/${event.id}`} className="mt-4 flex items-center justify-center gap-1.5 w-full rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors">
                View All Participants <ArrowRight size={12} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventAnalytics;
