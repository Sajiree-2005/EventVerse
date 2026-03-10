import { useApp } from "@/context/AppContext";
import { useParams, Navigate, Link } from "react-router-dom";
import { ArrowLeft, Download, Users } from "lucide-react";

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
        <Link to="/admin/manage" className="mt-4 inline-block text-sm text-primary hover:underline">Back to Manage</Link>
      </div>
    );
  }

  const exportCSV = () => {
    const headers = "Student Name,Student Email,Registration Date\n";
    const rows = regs.map((r) => `${r.studentName},${r.studentEmail},${new Date(r.registeredAt).toLocaleDateString()}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.name}-participants.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/admin/manage" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to Manage Events
      </Link>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Users size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Participants</h1>
            <p className="text-sm font-serif text-muted-foreground">{event.name} · {regs.length} registered</p>
          </div>
        </div>
        <button
          onClick={exportCSV}
          disabled={regs.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground btn-primary-brighten disabled:opacity-50"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {regs.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground">No participants yet</p>
        </div>
      ) : (
        <div className="mt-8 card-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student Name</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student Email</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {regs.map((r, i) => (
                <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4 text-muted-foreground">{i + 1}</td>
                  <td className="px-5 py-4 font-medium text-foreground">{r.studentName}</td>
                  <td className="px-5 py-4 text-muted-foreground">{r.studentEmail}</td>
                  <td className="px-5 py-4 text-muted-foreground">{new Date(r.registeredAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Participants;
