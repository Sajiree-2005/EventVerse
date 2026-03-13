/**
 * api.ts – EventVerse API service
 *
 * In development:  Vite proxies /api → http://localhost:5000
 * When hosted:     Set VITE_API_URL=https://your-server.com  (no trailing slash)
 *                  All requests go to https://your-server.com/api/...
 *
 * DO NOT hardcode localhost here — it breaks for remote users.
 */

const BASE = (import.meta.env.VITE_API_URL ?? "") + "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let msg = `Server error ${res.status}`;
    try {
      const body = await res.json();
      msg = body.message || body.error || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

// ─── Events ────────────────────────────────────────────────
export const getEvents = () => request<any[]>("/events");
export const getEvent = (id: string | number) => request<any>(`/events/${id}`);

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
    `/student/registrations?email=${encodeURIComponent(email)}`,
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
    `/student/volunteering?email=${encodeURIComponent(email)}`,
  );

// ─── Notifications ──────────────────────────────────────────
export const getNotifications = (email: string) =>
  request<{ notifications: any[]; unreadCount: number }>(
    `/student/notifications?email=${encodeURIComponent(email)}`,
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
    `/events/${eventId}/feedback`,
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
    const res = await fetch(`${BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
};
