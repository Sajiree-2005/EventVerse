import React, { createContext, useContext, useState, useCallback } from "react";
import { Event, Registration, SAMPLE_EVENTS } from "@/data/events";

interface AppState {
  events: Event[];
  registrations: Registration[];
  isAdminLoggedIn: boolean;
  notificationBanner: string | null;
}

interface AppContextType extends AppState {
  addEvent: (event: Omit<Event, "id" | "createdAt" | "registered">) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  registerForEvent: (eventId: string, studentName: string, studentEmail: string) => { success: boolean; message: string };
  loginAdmin: (email: string, password: string) => boolean;
  logoutAdmin: () => void;
  dismissBanner: () => void;
  getEventRegistrations: (eventId: string) => Registration[];
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>(SAMPLE_EVENTS);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(
    "🔥 New Event Added: Hackathon 2026 — Register before 15 March"
  );

  const addEvent = useCallback((event: Omit<Event, "id" | "createdAt" | "registered">) => {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      registered: 0,
    };
    setEvents((prev) => [newEvent, ...prev]);
    setNotificationBanner(`🔥 New Event Added: ${event.name} — Register now!`);
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<Event>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setRegistrations((prev) => prev.filter((r) => r.eventId !== id));
  }, []);

  const registerForEvent = useCallback(
    (eventId: string, studentName: string, studentEmail: string) => {
      const existing = registrations.find(
        (r) => r.eventId === eventId && r.studentEmail === studentEmail
      );
      if (existing) {
        return { success: false, message: "You already registered for this event" };
      }
      const event = events.find((e) => e.id === eventId);
      if (!event) return { success: false, message: "Event not found" };
      if (event.registered >= event.capacity) {
        return { success: false, message: "Event is at full capacity" };
      }

      const reg: Registration = {
        id: Date.now().toString(),
        eventId,
        studentName,
        studentEmail,
        registeredAt: new Date().toISOString(),
      };
      setRegistrations((prev) => [...prev, reg]);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, registered: e.registered + 1 } : e))
      );
      return { success: true, message: `You are registered for ${event.name}` };
    },
    [registrations, events]
  );

  const loginAdmin = useCallback((email: string, password: string) => {
    if (email === "admin@eventverse.com" && password === "admin123") {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => setIsAdminLoggedIn(false), []);
  const dismissBanner = useCallback(() => setNotificationBanner(null), []);

  const getEventRegistrations = useCallback(
    (eventId: string) => registrations.filter((r) => r.eventId === eventId),
    [registrations]
  );

  return (
    <AppContext.Provider
      value={{
        events,
        registrations,
        isAdminLoggedIn,
        notificationBanner,
        addEvent,
        updateEvent,
        deleteEvent,
        registerForEvent,
        loginAdmin,
        logoutAdmin,
        dismissBanner,
        getEventRegistrations,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
