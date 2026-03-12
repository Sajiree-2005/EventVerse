import React, { createContext, useContext, useState, useCallback } from "react";
import { Event, Registration, SAMPLE_EVENTS } from "@/data/events";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Log the API URL on load
console.log("API_BASE_URL configured as:", API_BASE_URL);
console.log("VITE_API_URL env var:", import.meta.env.VITE_API_URL);

export interface Student {
  name: string;
  email: string;
}

interface AppState {
  events: Event[];
  registrations: Registration[];
  isAdminLoggedIn: boolean;
  currentStudent: Student | null;
  notificationBanner: string | null;
}

interface AppContextType extends AppState {
  addEvent: (event: Omit<Event, "id" | "createdAt" | "registered">) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  registerForEvent: (
    eventId: string,
    studentName: string,
    studentEmail: string,
  ) => Promise<{ success: boolean; message: string }>;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  loginStudent: (name: string, email: string) => void;
  logoutStudent: () => void;
  dismissBanner: () => void;
  getEventRegistrations: (eventId: string) => Registration[];
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [events, setEvents] = useState<Event[]>(SAMPLE_EVENTS);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(
    "🔥 New Event Added: Hackathon 2026 — Register before 15 March",
  );

  const addEvent = useCallback(
    async (event: Omit<Event, "id" | "createdAt" | "registered">) => {
      try {
        const response = await fetch(`${API_BASE_URL}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        });

        if (!response.ok) {
          console.error("Failed to create event");
          return;
        }

        const data = await response.json();

        // Update local state with the new event from backend
        const newEvent: Event = {
          ...event,
          id: data.event?.id || Date.now().toString(),
          createdAt: data.event?.createdAt || new Date().toISOString(),
          registered: 0,
        };
        setEvents((prev) => [newEvent, ...prev]);
        setNotificationBanner(
          `🔥 New Event Added: ${event.name} — Register now!`,
        );
      } catch (error) {
        console.error("Add event error:", error);
      }
    },
    [],
  );

  const updateEvent = useCallback((id: string, updates: Partial<Event>) => {
    try {
      fetch(`${API_BASE_URL}/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }).catch((error) => console.error("Update event error:", error));
    } catch (error) {
      console.error("Update event error:", error);
    }

    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    );
  }, []);

  const deleteEvent = useCallback((id: string) => {
    try {
      fetch(`${API_BASE_URL}/events/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }).catch((error) => console.error("Delete event error:", error));
    } catch (error) {
      console.error("Delete event error:", error);
    }

    setEvents((prev) => prev.filter((e) => e.id !== id));
    setRegistrations((prev) => prev.filter((r) => r.eventId !== id));
  }, []);

  const registerForEvent = useCallback(
    async (eventId: string, studentName: string, studentEmail: string) => {
      try {
        console.log("Registering with API URL:", API_BASE_URL);
        console.log("Request payload:", {
          eventId: parseInt(eventId, 10),
          studentName,
          studentEmail,
        });

        const response = await fetch(`${API_BASE_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: parseInt(eventId, 10),
            studentName,
            studentEmail,
          }),
        });

        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Response data:", data);

        if (!response.ok) {
          return {
            success: false,
            message: data.message || "Registration failed",
          };
        }

        // Update local state
        const event = events.find((e) => e.id === eventId);
        if (event) {
          const reg: Registration = {
            id: Date.now().toString(),
            eventId,
            studentName,
            studentEmail,
            registeredAt: new Date().toISOString(),
          };
          setRegistrations((prev) => [...prev, reg]);
          setEvents((prev) =>
            prev.map((e) =>
              e.id === eventId ? { ...e, registered: e.registered + 1 } : e,
            ),
          );
        }

        return {
          success: true,
          message: data.message || `You are registered for ${event?.name}`,
        };
      } catch (error) {
        console.error("Registration error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Network error. Please try again.";
        console.error("Error details:", errorMessage);
        return { success: false, message: `Error: ${errorMessage}` };
      }
    },
    [events],
  );

  const loginAdmin = useCallback(async (email: string, password: string) => {
    try {
      console.log("Admin login attempt with API URL:", API_BASE_URL);
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("Login response status:", response.status);
      const data = await response.json();
      console.log("Login response data:", data);

      if (data.success) {
        setIsAdminLoggedIn(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Admin login error:", error);
      return false;
    }
  }, []);

  const logoutAdmin = useCallback(() => setIsAdminLoggedIn(false), []);

  const loginStudent = useCallback((name: string, email: string) => {
    setCurrentStudent({ name, email });
  }, []);

  const logoutStudent = useCallback(() => setCurrentStudent(null), []);

  const dismissBanner = useCallback(() => setNotificationBanner(null), []);

  const getEventRegistrations = useCallback(
    (eventId: string) => registrations.filter((r) => r.eventId === eventId),
    [registrations],
  );

  return (
    <AppContext.Provider
      value={{
        events,
        registrations,
        isAdminLoggedIn,
        currentStudent,
        notificationBanner,
        addEvent,
        updateEvent,
        deleteEvent,
        registerForEvent,
        loginAdmin,
        logoutAdmin,
        loginStudent,
        logoutStudent,
        dismissBanner,
        getEventRegistrations,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
