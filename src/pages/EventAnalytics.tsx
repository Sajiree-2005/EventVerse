import { useApp } from "@/context/AppContext";
import { Navigate, Link } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { BarChart3, Users, TrendingUp, ArrowRight, Activity } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const EventAnalytics = () => {
  const { events, isAdminLoggedIn, getEventRegistrations } = useApp();

  if (!isAdminLoggedIn) return <Navigate to="/admin/login" />;

  const primaryColor = "hsl(350, 90%, 35%)";
  const primaryAlpha = "hsla(350, 90%, 35%, 0.12)";

  const totalRegistered = events.reduce((sum, e) => sum + e.registered, 0);
  const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
  const avgFill = totalCapacity ? Math.round((totalRegistered / totalCapacity) * 100) : 0;
  const mostPopular = [...events].sort((a, b) => b.registered - a.registered)[0];

  const barChartData = {
    labels: events.map((e) => (e.name.length > 16 ? e.name.slice(0, 16) + "…" : e.name)),
    datasets: [
      {
        label: "Registered",
        data: events.map((e) => e.registered),
        backgroundColor: events.map((e) =>
          e.registered / e.capacity >= 0.8 ? "hsl(350, 90%, 35%)" : "hsl(350, 70%, 55%)"
        ),
        borderRadius: 10,
        borderSkipped: false,
      },
      {
        label: "Capacity",
        data: events.map((e) => e.capacity),
        backgroundColor: "hsl(0, 0%, 91%)",
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  const lineData = {
    labels: events.map((e) => e.name.length > 12 ? e.name.slice(0, 12) + "…" : e.name),
    datasets: [
      {
        label: "Fill Rate %",
        data: events.map((e) => Math.round((e.registered / e.capacity) * 100)),
        borderColor: primaryColor,
        backgroundColor: primaryAlpha,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: primaryColor,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: { font: { family: "Inter", size: 11 }, padding: 16, usePointStyle: true },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "Inter", size: 11 }, color: "hsl(210, 10%, 50%)" },
      },
      y: {
        grid: { color: "hsl(0, 0%, 93%)" },
        ticks: { font: { family: "Inter", size: 11 }, color: "hsl(210, 10%, 50%)" },
      },
    },
  };

  const topStats = [
    { label: "Total Registrations", value: totalRegistered, icon: Users, color: "text-primary bg-primary/10" },
    { label: "Average Fill Rate", value: `${avgFill}%`, icon: TrendingUp, color: "text-success bg-success/10" },
    { label: "Most Popular", value: mostPopular?.name || "—", icon: Activity, color: "text-primary bg-primary/10", small: true },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
          <BarChart3 size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Analytics</h1>
          <p className="text-sm font-serif text-muted-foreground">Registration insights across all events</p>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {topStats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div className={`inline-flex items-center justify-center rounded-xl p-2.5 mb-3 ${s.color}`}>
                <Icon size={16} />
              </div>
              <p className={`font-extrabold text-foreground ${s.small ? "text-base truncate" : "text-2xl"}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <div className="card-elevated p-6">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 size={14} className="text-primary" />
            Registrations vs Capacity
          </h3>
          <Bar data={barChartData} options={chartOptions} />
        </div>
        <div className="card-elevated p-6">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" />
            Fill Rate Trend
          </h3>
          <Line
            data={lineData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: { display: false },
              },
            }}
          />
        </div>
      </div>

      {/* Per-event cards */}
      <h2 className="text-base font-extrabold text-foreground mb-4">Per-Event Breakdown</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const regs = getEventRegistrations(event.id);
          const seatsLeft = event.capacity - event.registered;
          const percent = Math.round((event.registered / event.capacity) * 100);
          const isFull = percent >= 100;
          const isHot = percent >= 80 && !isFull;

          return (
            <div key={event.id} className="card-elevated p-5 group">
              <div className="flex items-start gap-3 mb-4">
                <img
                  src={event.poster}
                  alt={event.name}
                  className="h-12 w-16 rounded-lg object-cover shrink-0 group-hover:opacity-90 transition-opacity"
                />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-foreground text-sm truncate">{event.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] rounded-full bg-primary/10 text-primary px-2 py-0.5 font-bold">
                      {event.category}
                    </span>
                    {isFull && <span className="text-[10px] rounded-full bg-destructive/10 text-destructive px-2 py-0.5 font-bold">Full</span>}
                    {isHot && <span className="text-[10px] rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 font-bold">Hot</span>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="rounded-xl bg-muted/50 border border-border/50 p-3 text-center">
                  <p className="text-lg font-extrabold text-primary">{event.registered}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Registered</p>
                </div>
                <div className="rounded-xl bg-muted/50 border border-border/50 p-3 text-center">
                  <p className="text-lg font-extrabold text-foreground">{seatsLeft}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Available</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-sans">
                  <span>Capacity</span>
                  <span className="font-semibold">{percent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isFull ? "bg-destructive" : isHot ? "bg-amber-500" : "bg-primary"}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {regs.length > 0 && (
                <div className="border-t border-border/50 pt-3 mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Recent Registrants</p>
                  {regs.slice(0, 2).map((r) => (
                    <div key={r.id} className="flex items-center gap-2 mb-1">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary shrink-0">
                        {r.studentName.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-xs text-muted-foreground font-sans truncate">{r.studentName}</p>
                    </div>
                  ))}
                  {regs.length > 2 && (
                    <p className="text-xs text-primary font-semibold">+{regs.length - 2} more</p>
                  )}
                </div>
              )}

              <Link
                to={`/admin/participants/${event.id}`}
                className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground hover:bg-muted/60 hover:border-primary/30 transition-all"
              >
                View Participants <ArrowRight size={11} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventAnalytics;
