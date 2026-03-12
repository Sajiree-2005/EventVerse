import { useApp } from "@/context/AppContext";
import { useState, useEffect } from "react";
import {
  Calendar, MapPin, CheckCircle2, Clock, Play, Search, LogIn,
  LayoutDashboard, Tag, X, Users, Bell, Star, BarChart3,
  Heart, TrendingUp, Award, Loader2, AlertCircle,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getStudentRegistrations,
  cancelRegistration as apiCancelRegistration,
  getStudentAnalytics,
  getStudentVolunteering,
  cancelVolunteering,
  getNotifications,
  markNotificationRead,
  markAllRead,
  submitFeedback,
} from "@/services/api";

type Tab = "events" | "teams" | "volunteering" | "analytics" | "notifications";

const StudentDashboard = () => {
  const { currentStudent } = useApp();
  const [searchParams] = useSearchParams();
  const feedbackEventIdParam = searchParams.get("feedback");

  const [activeTab, setActiveTab]       = useState<Tab>("events");
  const [emailFilter, setEmailFilter]   = useState(currentStudent?.email || "");
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [teams, setTeams]               = useState<any[]>([]);
  const [volunteering, setVolunteering] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [analytics, setAnalytics]       = useState<any>(null);
  const [loading, setLoading]           = useState(false);
  const [loadError, setLoadError]       = useState<string | null>(null);

  const [cancelDialogOpen, setCancelDialogOpen]     = useState(false);
  const [registrationToCancel, setRegistrationToCancel] = useState<{ id: any; eventName: string } | null>(null);
  const [volunteerToCancel, setVolunteerToCancel]   = useState<{ id: any; eventName: string } | null>(null);

  const [feedbackData, setFeedbackData] = useState<{
    eventId: any; eventName: string; rating: number; comments: string;
  } | null>(
    feedbackEventIdParam
      ? { eventId: feedbackEventIdParam, eventName: "", rating: 0, comments: "" }
      : null
  );
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const activeEmail = currentStudent?.email || emailFilter;

  const loadData = async (email: string) => {
    if (!email) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [regData, volData, notifData, analyticsData] = await Promise.all([
        getStudentRegistrations(email).catch(() => ({ registrations: [], teams: [] })),
        getStudentVolunteering(email).catch(() => ({ volunteering: [] })),
        getNotifications(email).catch(() => ({ notifications: [], unreadCount: 0 })),
        getStudentAnalytics(email).catch(() => null),
      ]);

      setRegistrations(Array.isArray(regData?.registrations) ? regData.registrations : []);
      setTeams(Array.isArray(regData?.teams) ? regData.teams : []);
      setVolunteering(Array.isArray(volData?.volunteering) ? volData.volunteering : []);
      setNotifications(Array.isArray(notifData?.notifications) ? notifData.notifications : []);
      setUnreadCount(notifData?.unreadCount ?? 0);
      setAnalytics(analyticsData);
    } catch (err: any) {
      setLoadError(err?.message ?? "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeEmail) loadData(activeEmail);
  }, [activeEmail]);

  const getStatus = (eventDate: string) => {
    if (!eventDate) return "upcoming";
    const now  = new Date();
    const d    = new Date(eventDate);
    if (isNaN(d.getTime())) return "upcoming";
    const diff = d.getTime() - now.getTime();
    if (diff > 24 * 60 * 60 * 1000) return "upcoming";
    if (diff > 0) return "ongoing";
    return "completed";
  };

  const statusConfig = {
    upcoming:  { label: "Upcoming",  icon: Clock,        className: "bg-primary/10 text-primary border-primary/20" },
    ongoing:   { label: "Ongoing",   icon: Play,         className: "bg-success/10 text-success border-success/20" },
    completed: { label: "Completed", icon: CheckCircle2, className: "bg-muted text-muted-foreground border-border" },
  };

  const handleConfirmCancel = async () => {
    if (!registrationToCancel || !currentStudent) return;
    try {
      await apiCancelRegistration({
        registrationId: registrationToCancel.id,
        studentEmail: currentStudent.email,
      });
      await loadData(activeEmail);
    } catch {}
    setCancelDialogOpen(false);
    setRegistrationToCancel(null);
  };

  const handleVolunteerCancel = async () => {
    if (!volunteerToCancel || !currentStudent) return;
    try {
      await cancelVolunteering({
        volunteerId: volunteerToCancel.id,
        studentEmail: currentStudent.email,
      });
      await loadData(activeEmail);
    } catch {}
    setVolunteerToCancel(null);
  };

  const handleMarkRead = async (id: number) => {
    if (!activeEmail) return;
    try {
      await markNotificationRead({ notificationId: id, studentEmail: activeEmail });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    if (!activeEmail) return;
    try {
      await markAllRead(activeEmail);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackData || !currentStudent || feedbackData.rating === 0) return;
    setFeedbackSubmitting(true);
    try {
      await submitFeedback({
        eventId: feedbackData.eventId,
        studentName: currentStudent.name,
        studentEmail: currentStudent.email,
        rating: feedbackData.rating,
        comments: feedbackData.comments,
      });
      setFeedbackData(null);
      await loadData(activeEmail);
    } catch {}
    setFeedbackSubmitting(false);
  };

  const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: "events",        label: "My Events",    icon: Calendar, badge: registrations.length || undefined },
    { id: "teams",         label: "Teams",        icon: Users,    badge: teams.length || undefined },
    { id: "volunteering",  label: "Volunteering", icon: Heart,    badge: volunteering.length || undefined },
    { id: "analytics",     label: "Analytics",    icon: BarChart3 },
    { id: "notifications", label: "Notifications",icon: Bell,     badge: unreadCount || undefined },
  ];

  // Use analytics for stat cards; fall back to array lengths
  const totalRegistered   = analytics?.totalRegistered   ?? registrations.length;
  const upcomingCount     = analytics?.upcoming          ?? registrations.filter(r => getStatus(r.date) === "upcoming").length;
  const attendedCount     = analytics?.attended          ?? registrations.filter(r => getStatus(r.date) === "completed").length;
  const feedbackCount     = analytics?.feedbackSubmitted ?? 0;
  const volunteeringCount = analytics?.volunteeringCount ?? volunteering.length;

  const statsCards = activeEmail ? [
    { label: "Registered",   value: totalRegistered,   icon: Calendar,    color: "text-foreground" },
    { label: "Upcoming",     value: upcomingCount,     icon: Clock,       color: "text-primary" },
    { label: "Attended",     value: attendedCount,     icon: CheckCircle2,color: "text-success" },
    { label: "Feedback",     value: feedbackCount,     icon: Star,        color: "text-amber-500" },
    { label: "Volunteering", value: volunteeringCount, icon: Heart,       color: "text-rose-500" },
  ] : [];

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <LayoutDashboard size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">
              {currentStudent ? `Welcome, ${currentStudent.name.split(" ")[0]}!` : "Student Dashboard"}
            </h1>
            <p className="mt-0.5 text-sm font-serif text-muted-foreground">
              {currentStudent ? currentStudent.email : "View your registered events"}
            </p>
          </div>
        </div>
        {!currentStudent && (
          <Link to="/student/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground btn-primary-brighten self-start">
            <LogIn size={14} /> Sign In
          </Link>
        )}
      </div>

      {/* Email lookup (not logged in) */}
      {!currentStudent && (
        <div className="max-w-md mb-8">
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Enter your email to view dashboard
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="email" value={emailFilter}
              onChange={e => setEmailFilter(e.target.value)}
              onKeyDown={e => e.key === "Enter" && loadData(emailFilter)}
              placeholder="you@college.edu" className="glass-input pl-10" />
          </div>
          <button onClick={() => loadData(emailFilter)}
            className="mt-2 text-xs font-semibold text-primary hover:underline">
            Search →
          </button>
        </div>
      )}

      {/* Load error banner */}
      {loadError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
          <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{loadError}</p>
        </div>
      )}

      {/* Stats row */}
      {activeEmail && statsCards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {statsCards.map(s => (
            <div key={s.label} className="stat-card text-center py-4">
              <s.icon size={18} className={`mx-auto mb-1.5 ${s.color}`} />
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Feedback modal */}
      {feedbackData && currentStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-[var(--modal-shadow)] p-6 max-w-md w-full">
            <h3 className="text-lg font-extrabold text-foreground mb-1">Rate this Event</h3>
            <p className="text-sm text-muted-foreground font-serif mb-4">
              Share your experience to help us improve
            </p>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star}
                  onClick={() => setFeedbackData(fd => fd ? { ...fd, rating: star } : fd)}
                  className={`text-2xl transition-transform hover:scale-110 ${feedbackData.rating >= star ? "text-amber-400" : "text-muted"}`}>
                  ★
                </button>
              ))}
            </div>
            <textarea value={feedbackData.comments}
              onChange={e => setFeedbackData(fd => fd ? { ...fd, comments: e.target.value } : fd)}
              placeholder="Any comments? (optional)" rows={3}
              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setFeedbackData(null)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted/50">
                Skip
              </button>
              <button onClick={handleFeedbackSubmit}
                disabled={feedbackData.rating === 0 || feedbackSubmitting}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {feedbackSubmitting
                  ? <Loader2 size={14} className="inline animate-spin" />
                  : "Submit Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeEmail && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 mb-8 border-b border-border/50">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl whitespace-nowrap transition-colors
                  ${activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}>
                <tab.icon size={14} />
                {tab.label}
                {tab.badge != null && (
                  <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold
                    ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          )}

          {/* ── My Events Tab ── */}
          {!loading && activeTab === "events" && (
            <div>
              {registrations.length === 0 ? (
                <EmptyState icon={Calendar} title="No registrations yet"
                  description="Browse events and register to see them here">
                  <Link to="/events"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
                    Browse Events →
                  </Link>
                </EmptyState>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {registrations.map((reg: any) => {
                    const status = getStatus(reg.date);
                    const config = statusConfig[status];
                    const StatusIcon = config.icon;
                    const regId = reg.registration_id ?? reg.id;
                    return (
                      <div key={regId} className="card-elevated overflow-hidden group">
                        <div className="relative h-28 overflow-hidden">
                          <img src={reg.poster} alt={reg.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-2 left-2">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm bg-white/90 ${config.className}`}>
                              <StatusIcon size={9} /> {config.label}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-extrabold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {reg.name}
                          </h3>
                          <div className="mt-3 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar size={12} className="text-primary shrink-0" />
                              <span>{new Date(reg.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin size={12} className="text-primary shrink-0" />
                              <span className="truncate">{reg.venue}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Tag size={12} className="text-primary shrink-0" />
                              <span>{reg.category}</span>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                            <p className="text-[11px] text-muted-foreground">
                              Registered {reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString() : "—"}
                            </p>
                            <div className="flex items-center gap-2">
                              <Link to={`/events/${reg.id}`}
                                className="text-xs font-bold text-primary hover:underline">View →</Link>
                              {status === "completed" && (
                                <button
                                  onClick={() => setFeedbackData({ eventId: reg.id, eventName: reg.name, rating: 0, comments: "" })}
                                  className="text-xs font-semibold text-amber-500 hover:text-amber-600 flex items-center gap-1">
                                  <Star size={10} /> Rate
                                </button>
                              )}
                              {status !== "completed" && currentStudent && (
                                <button
                                  onClick={() => { setRegistrationToCancel({ id: regId, eventName: reg.name }); setCancelDialogOpen(true); }}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:text-destructive/80 px-2 py-1 rounded transition-colors">
                                  <X size={12} /> Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Teams Tab ── */}
          {!loading && activeTab === "teams" && (
            <div>
              {teams.length === 0 ? (
                <EmptyState icon={Users} title="No team registrations"
                  description="Register as a team for eligible events" />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {teams.map((team: any) => (
                    <div key={team.id} className="card-elevated p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-extrabold text-foreground">{team.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5 font-serif">{team.eventName}</p>
                        </div>
                        <span className="rounded-full bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1">Team</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        {team.eventDate && (
                          <div className="flex items-center gap-2">
                            <Calendar size={11} className="text-primary" />
                            {new Date(team.eventDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        )}
                        {team.eventVenue && (
                          <div className="flex items-center gap-2"><MapPin size={11} className="text-primary" />{team.eventVenue}</div>
                        )}
                        <div className="flex items-center gap-2"><Users size={11} className="text-primary" />Lead: {team.leadName}</div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <Link to={`/events/${team.eventId}`} className="text-xs font-bold text-primary hover:underline">View Event →</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Volunteering Tab ── */}
          {!loading && activeTab === "volunteering" && (
            <div>
              {volunteering.length === 0 ? (
                <EmptyState icon={Heart} title="No volunteering applications"
                  description="Look for events with volunteering opportunities">
                  <Link to="/events"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
                    Browse Events →
                  </Link>
                </EmptyState>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {volunteering.map((v: any) => {
                    const statusColor =
                      v.status === "approved"  ? "text-green-600 bg-green-50 border-green-200" :
                      v.status === "cancelled" ? "text-muted-foreground bg-muted border-border" :
                                                 "text-amber-600 bg-amber-50 border-amber-200";
                    return (
                      <div key={v.id} className="card-elevated overflow-hidden group">
                        <div className="relative h-28 overflow-hidden">
                          <img src={v.poster} alt={v.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-2 left-2">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold bg-white/90 ${statusColor}`}>
                              <Heart size={9} /> {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-extrabold text-sm text-foreground line-clamp-1">{v.name}</h3>
                          <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar size={11} className="text-primary" />
                              {new Date(v.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                            <div className="flex items-center gap-2"><MapPin size={11} className="text-primary" />{v.venue}</div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                            <Link to={`/events/${v.eventId}`} className="text-xs font-bold text-primary hover:underline">View →</Link>
                            {currentStudent && v.status !== "cancelled" && (
                              <button onClick={() => setVolunteerToCancel({ id: v.id, eventName: v.name })}
                                className="text-xs font-semibold text-destructive flex items-center gap-1">
                                <X size={11} /> Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Analytics Tab ── */}
          {!loading && activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="card-elevated p-6">
                <h3 className="font-extrabold text-foreground mb-5 flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" /> Participation Overview
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Events Registered",  value: totalRegistered,   max: Math.max(totalRegistered, 1),  color: "bg-primary" },
                    { label: "Events Attended",    value: attendedCount,     max: Math.max(totalRegistered, 1),  color: "bg-green-500" },
                    { label: "Feedback Submitted", value: feedbackCount,     max: Math.max(attendedCount, 1),    color: "bg-amber-500" },
                    { label: "Volunteering",       value: volunteeringCount, max: Math.max(totalRegistered, 1),  color: "bg-rose-500" },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm font-semibold mb-1.5">
                        <span className="text-foreground">{item.label}</span>
                        <span className="text-muted-foreground">{item.value}</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-700`}
                          style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {analytics?.categoryDistribution?.length > 0 && (
                <div className="card-elevated p-6">
                  <h3 className="font-extrabold text-foreground mb-5 flex items-center gap-2">
                    <Award size={16} className="text-primary" /> Events by Category
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {analytics.categoryDistribution.map((cat: any) => (
                      <div key={cat.category} className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-center">
                        <p className="text-xl font-extrabold text-primary">{cat.count}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-semibold">{cat.category}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analytics?.upcomingEvents?.length > 0 && (
                <div className="card-elevated p-6">
                  <h3 className="font-extrabold text-foreground mb-4 flex items-center gap-2">
                    <Clock size={16} className="text-primary" /> Upcoming Events
                  </h3>
                  <div className="space-y-3">
                    {analytics.upcomingEvents.map((ev: any) => (
                      <Link key={ev.eventId} to={`/events/${ev.eventId}`}
                        className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3 hover:bg-primary/5 transition-colors group">
                        <div>
                          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{ev.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {ev.venue} · {new Date(ev.date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {!analytics && !loading && (
                <EmptyState icon={BarChart3} title="Analytics unavailable"
                  description="Analytics will appear here once the backend is connected" />
              )}
            </div>
          )}

          {/* ── Notifications Tab ── */}
          {!loading && activeTab === "notifications" && (
            <div>
              {notifications.length > 0 && (
                <div className="flex justify-end mb-4">
                  <button onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-primary hover:underline">
                    Mark all read
                  </button>
                </div>
              )}
              {notifications.length === 0 ? (
                <EmptyState icon={Bell} title="No notifications"
                  description="Notifications appear here after you register for events" />
              ) : (
                <div className="space-y-2">
                  {notifications.map((n: any) => (
                    <div key={n.id}
                      onClick={() => !n.isRead && handleMarkRead(n.id)}
                      className={`rounded-xl border p-4 cursor-pointer transition-all
                        ${n.isRead ? "bg-card border-border/50" : "bg-primary/5 border-primary/20 shadow-sm"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${n.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-serif leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Cancel Registration Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Cancel registration for{" "}
              <span className="font-semibold text-foreground">{registrationToCancel?.eventName}</span>?
              Your seat will be freed for others.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Keep Registration</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancel Registration
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Volunteering Dialog */}
      <AlertDialog open={!!volunteerToCancel} onOpenChange={() => setVolunteerToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Volunteering</AlertDialogTitle>
            <AlertDialogDescription>
              Cancel volunteer application for{" "}
              <span className="font-semibold text-foreground">{volunteerToCancel?.eventName}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Keep Application</AlertDialogCancel>
            <AlertDialogAction onClick={handleVolunteerCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancel Volunteering
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, description, children }: {
  icon: any; title: string; description: string; children?: React.ReactNode;
}) => (
  <div className="mt-4 text-center py-16 rounded-2xl border border-border/50 bg-muted/20">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
      <Icon size={24} className="text-muted-foreground" />
    </div>
    <p className="text-base font-bold text-foreground">{title}</p>
    <p className="mt-1 text-sm font-serif text-muted-foreground">{description}</p>
    {children}
  </div>
);

export default StudentDashboard;
