// Tries the Vite proxy (/api) first.
// If that fails (e.g. proxy not configured), falls back to direct localhost:5000.
const PROXY_BASE  = "/api";
const DIRECT_BASE = "http://localhost:5000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const init: RequestInit = {
    headers: { "Content-Type": "application/json" },
    ...options,
  };

  // Try proxy first
  try {
    const res = await fetch(`${PROXY_BASE}${path}`, init);
    if (res.ok || res.status < 500) {
      const json = await res.json();
      return json as T;
    }
  } catch {
    // proxy failed — fall through to direct
  }

  // Fallback: direct to Flask on port 5000
  try {
    const res = await fetch(`${DIRECT_BASE}${path}`, init);
    const json = await res.json();
    return json as T;
  } catch (err: any) {
    throw new Error(
      "❌ Cannot reach Flask backend.\n\n" +
      "Please start it:\n" +
      "  cd backend\n" +
      "  pip install -r requirements.txt\n" +
      "  python app.py\n\n" +
      "Then try again."
    );
  }
}

// ─── Events ────────────────────────────────────────────────
export const getEvents = () => request<any[]>("/events");
export const getEvent  = (id: string | number) => request<any>(`/events/${id}`);

// ─── Registration ───────────────────────────────────────────
export const registerStudent = (data: {
  eventId: string | number;
  studentName: string;
  studentEmail: string;
}) =>
  request<{ success: boolean; message: string }>("/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const registerTeam = (data: {
  eventId: string | number;
  teamName: string;
  leadName: string;
  leadEmail: string;
  teamMembers: { name: string; email: string }[];
}) =>
  request<{ success: boolean; message: string; team?: any }>("/register_team", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const cancelRegistration = (data: {
  registrationId: string | number;
  studentEmail: string;
}) =>
  request<{ success: boolean; message: string }>("/cancel_registration", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getStudentRegistrations = (email: string) =>
  request<{ registrations: any[]; teams: any[] }>(
    `/student/registrations?email=${encodeURIComponent(email)}`
  );

// ─── Volunteering ───────────────────────────────────────────
export const volunteerForEvent = (data: {
  eventId: string | number;
  studentName: string;
  studentEmail: string;
}) =>
  request<{ success: boolean; message: string }>("/volunteer", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const cancelVolunteering = (data: {
  volunteerId: string | number;
  studentEmail: string;
}) =>
  request<{ success: boolean; message: string }>("/volunteer/cancel", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getStudentVolunteering = (email: string) =>
  request<{ volunteering: any[] }>(
    `/student/volunteering?email=${encodeURIComponent(email)}`
  );

// ─── Notifications ──────────────────────────────────────────
export const getNotifications = (email: string) =>
  request<{ notifications: any[]; unreadCount: number }>(
    `/student/notifications?email=${encodeURIComponent(email)}`
  );

export const markNotificationRead = (data: {
  notificationId: number;
  studentEmail: string;
}) =>
  request<{ success: boolean }>("/notifications/read", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const markAllRead = (studentEmail: string) =>
  request<{ success: boolean }>("/notifications/read-all", {
    method: "POST",
    body: JSON.stringify({ studentEmail }),
  });

// ─── Feedback ───────────────────────────────────────────────
export const submitFeedback = (data: {
  eventId: string | number;
  studentName: string;
  studentEmail: string;
  rating: number;
  comments?: string;
}) =>
  request<{ success: boolean; message: string }>("/feedback", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getEventFeedback = (eventId: string | number) =>
  request<{ feedback: any[]; avgRating: number; total: number }>(
    `/events/${eventId}/feedback`
  );

// ─── Analytics ──────────────────────────────────────────────
export const getStudentAnalytics = (email: string) =>
  request<{
    totalRegistered: number;
    upcoming: number;
    attended: number;
    feedbackSubmitted: number;
    volunteeringCount: number;
    categoryDistribution: { category: string; count: number }[];
    upcomingEvents: any[];
  }>(`/student/analytics?email=${encodeURIComponent(email)}`);

export const getAdminAnalytics = () => request<any>("/admin/analytics");

// ─── Health check ───────────────────────────────────────────
export const checkHealth = async (): Promise<boolean> => {
  try {
    await fetch(`${DIRECT_BASE.replace("/api", "")}/api/health`);
    return true;
  } catch {
    return false;
  }
};
