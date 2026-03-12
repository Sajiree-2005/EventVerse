import { useApp } from "@/context/AppContext";
import { Link, Navigate } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Calendar, Users, TrendingUp, Award, BarChart3, PieChart, Plus, Settings, ArrowRight, Percent } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const { events, registrations, isAdminLoggedIn } = useApp();

  if (!isAdminLoggedIn) return <Navigate to="/admin/login" />;

  const totalParticipants = registrations.length;
  const mostPopular = [...events].sort((a, b) => b.registered - a.registered)[0];
  const upcomingCount = events.filter((e) => new Date(e.date) > new Date()).length;
  const avgFill = events.length
    ? Math.round(events.reduce((sum, e) => sum + (e.registered / e.capacity) * 100, 0) / events.length)
    : 0;

  const catCounts: Record<string, number> = {};
  events.forEach((e) => {
    catCounts[e.category] = (catCounts[e.category] || 0) + 1;
  });

  const primaryColor = "hsl(350, 90%, 35%)";
  const primaryColors = [
    "hsl(350, 90%, 35%)",
    "hsl(350, 80%, 45%)",
    "hsl(350, 60%, 55%)",
    "hsl(350, 50%, 65%)",
    "hsl(210, 15%, 65%)",
    "hsl(210, 10%, 75%)",
    "hsl(30, 60%, 60%)",
    "hsl(200, 60%, 60%)",
  ];

  const barData = {
    labels: events.map((e) => (e.name.length > 14 ? e.name.slice(0, 14) + "…" : e.name)),
    datasets: [
      {
        label: "Registered",
        data: events.map((e) => e.registered),
        backgroundColor: events.map((e) =>
          e.registered / e.capacity > 0.8 ? "hsl(350, 90%, 35%)" : "hsl(350, 70%, 55%)"
        ),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const doughnutData = {
    labels: Object.keys(catCounts),
    datasets: [
      {
        data: Object.values(catCounts),
        backgroundColor: primaryColors.slice(0, Object.keys(catCounts).length),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "Inter", size: 11 }, color: "hsl(210, 10%, 46%)" },
      },
      y: {
        grid: { color: "hsl(0, 0%, 93%)" },
        ticks: { font: { family: "Inter", size: 11 }, color: "hsl(210, 10%, 46%)" },
      },
    },
  };

  const stats = [
    { label: "Total Events", value: events.length, icon: Calendar, color: "bg-primary/10 text-primary", change: "+2 this week" },
    { label: "Participants", value: totalParticipants, icon: Users, color: "bg-success/10 text-success", change: `${registrations.length} total` },
    { label: "Avg. Fill Rate", value: `${avgFill}%`, icon: Percent, color: "bg-primary/10 text-primary", change: "across all events" },
    { label: "Upcoming", value: upcomingCount, icon: TrendingUp, color: "bg-success/10 text-success", change: "events scheduled" },
  ];

  const quickActions = [
    { to: "/admin/create", label: "Create Event", icon: Plus, primary: true },
    { to: "/admin/manage", label: "Manage Events", icon: Settings, primary: false },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3, primary: false },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-sm font-serif text-muted-foreground">
            EventVerse — {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                  action.primary
                    ? "bg-primary text-primary-foreground btn-primary-brighten shadow-md shadow-primary/25"
                    : "border border-border bg-card text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon size={14} />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card group">
              <div className="flex items-center justify-between mb-4">
                <div className={`rounded-xl p-2.5 ${stat.color} transition-transform group-hover:scale-110`}>
                  <Icon size={18} />
                </div>
                <span className="text-xs text-muted-foreground font-sans">{stat.change}</span>
              </div>
              <p className="text-3xl font-extrabold text-foreground tabular-nums">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="card-elevated p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-primary" />
              <h3 className="text-sm font-bold text-foreground">Event Registrations</h3>
            </div>
            <Link to="/admin/analytics" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Full report <ArrowRight size={11} />
            </Link>
          </div>
          <Bar data={barData} options={chartOptions} />
        </div>
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-5">
            <PieChart size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">By Category</h3>
          </div>
          <div className="mx-auto max-w-[220px]">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                cutout: "65%",
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { font: { family: "Inter", size: 11 }, padding: 12, usePointStyle: true, pointStyleWidth: 8 },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent events table */}
      <div className="card-elevated overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <h3 className="text-sm font-bold text-foreground">Recent Events</h3>
          <Link to="/admin/manage" className="text-xs font-semibold text-primary hover:underline">
            Manage all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fill</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 5).map((event) => {
                const pct = Math.round((event.registered / event.capacity) * 100);
                return (
                  <tr key={event.id} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={event.poster} alt="" className="h-9 w-12 rounded-lg object-cover shrink-0" />
                        <span className="font-semibold text-foreground truncate max-w-[150px]">{event.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{event.category}</span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs font-sans">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 80 ? "bg-destructive" : "bg-primary"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-foreground tabular-nums w-8">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        to={`/admin/participants/${event.id}`}
                        className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
