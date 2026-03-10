import { useApp } from "@/context/AppContext";
import { Link, Navigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
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
import { Calendar, Users, TrendingUp, Award, BarChart3, PieChart } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const { events, registrations, isAdminLoggedIn } = useApp();

  if (!isAdminLoggedIn) return <Navigate to="/admin/login" />;

  const totalParticipants = registrations.length;
  const mostPopular = [...events].sort((a, b) => b.registered - a.registered)[0];
  const upcomingCount = events.filter(e => new Date(e.date) > new Date()).length;

  const catCounts: Record<string, number> = {};
  events.forEach((e) => { catCounts[e.category] = (catCounts[e.category] || 0) + 1; });

  const primaryColor = "hsl(350, 90%, 35%)";
  const primaryLight = "hsl(350, 90%, 45%)";

  const barData = {
    labels: events.map((e) => e.name.length > 15 ? e.name.slice(0, 15) + "…" : e.name),
    datasets: [
      {
        label: "Registrations",
        data: events.map((e) => e.registered),
        backgroundColor: primaryColor,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const pieData = {
    labels: Object.keys(catCounts),
    datasets: [
      {
        data: Object.values(catCounts),
        backgroundColor: [
          primaryColor,
          primaryLight,
          "hsl(350, 60%, 55%)",
          "hsl(350, 40%, 65%)",
          "hsl(0, 0%, 75%)",
          "hsl(0, 0%, 85%)",
          "hsl(210, 10%, 70%)",
          "hsl(210, 10%, 80%)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: "Inter", size: 11 } } },
      y: { grid: { color: "hsl(0, 0%, 91%)" }, ticks: { font: { family: "Inter", size: 11 } } },
    },
  };

  const stats = [
    { label: "Total Events", value: events.length, icon: Calendar, accent: "bg-primary/10 text-primary" },
    { label: "Total Participants", value: totalParticipants, icon: Users, accent: "bg-success/10 text-success" },
    { label: "Most Popular", value: mostPopular?.name || "—", icon: Award, accent: "bg-primary/10 text-primary" },
    { label: "Upcoming Events", value: upcomingCount, icon: TrendingUp, accent: "bg-success/10 text-success" },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-sm font-serif text-muted-foreground">Overview of EventVerse analytics</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/create" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground btn-primary-brighten">
            Create Event
          </Link>
          <Link to="/admin/manage" className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors">
            Manage Events
          </Link>
          <Link to="/admin/analytics" className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors">
            Analytics
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${stat.accent}`}>
                  <Icon size={18} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground truncate">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-primary" />
            <h3 className="section-title">Event Participation</h3>
          </div>
          <Bar data={barData} options={chartOptions} />
        </div>
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={16} className="text-primary" />
            <h3 className="section-title">Category Distribution</h3>
          </div>
          <div className="mx-auto max-w-[280px]">
            <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: "bottom", labels: { font: { family: "Inter", size: 12 }, padding: 16 } } } }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
