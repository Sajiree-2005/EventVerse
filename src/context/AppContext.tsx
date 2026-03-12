import React, { createContext, useContext, useState, useCallback } from "react";
import { Event, Registration, SAMPLE_EVENTS } from "@/data/events";

export interface Student {
  name: string;
  email: string;
}

export interface TeamMember {
  id?: string;
  name: string;
  email: string;
  joinedAt?: string;
}

export interface Team {
  id: string;
  eventId: string;
  name: string;
  leadId?: string;
  leadName?: string;
  leadEmail?: string;
  createdAt?: string;
  members: TeamMember[];
}

interface AppState {
  events: Event[];
  registrations: Registration[];
  teams: Team[];
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
  ) => { success: boolean; message: string };
  registerTeam: (
    eventId: string,
    teamName: string,
    teamMembers: TeamMember[],
  ) => { success: boolean; message: string };
  cancelRegistration: (
    registrationId: string,
    studentEmail: string,
  ) => { success: boolean; message: string };
  loginAdmin: (email: string, password: string) => boolean;
  logoutAdmin: () => void;
  loginStudent: (name: string, email: string) => void;
  logoutStudent: () => void;
  dismissBanner: () => void;
  getEventRegistrations: (eventId: string) => Registration[];
  getEventTeams: (eventId: string) => Team[];
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
  const [teams, setTeams] = useState<Team[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(
    "🔥 New Event Added: Hackathon 2026 — Register before 15 March"
  );

  const addEvent = useCallback(
    (event: Omit<Event, "id" | "createdAt" | "registered">) => {
      const newEvent: Event = {
        ...event,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        registered: 0,
      };
      setEvents((prev) => [newEvent, ...prev]);
      setNotificationBanner(
        `🔥 New Event Added: ${event.name} — Register now!`,
      );
    },
    [],
  );

  const updateEvent = useCallback((id: string, updates: Partial<Event>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    );
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setRegistrations((prev) => prev.filter((r) => r.eventId !== id));
  }, []);

  const registerForEvent = useCallback(
    (eventId: string, studentName: string, studentEmail: string) => {
      const existing = registrations.find(
        (r) => r.eventId === eventId && r.studentEmail === studentEmail,
      );
      if (existing) {
        return {
          success: false,
          message: "You already registered for this event",
        };
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
        prev.map((e) =>
          e.id === eventId ? { ...e, registered: e.registered + 1 } : e,
        ),
      );
      return { success: true, message: `You are registered for ${event.name}` };
    },
    [registrations, events],
  );

  const cancelRegistration = useCallback(
    (registrationId: string, studentEmail: string) => {
      const reg = registrations.find((r) => r.id === registrationId);
      if (!reg) {
        return { success: false, message: "Registration not found" };
      }
      if (reg.studentEmail.toLowerCase() !== studentEmail.toLowerCase()) {
        return {
          success: false,
          message: "Unauthorized: This registration does not belong to you",
        };
      }
      const event = events.find((e) => e.id === reg.eventId);
      if (!event) {
        return { success: false, message: "Event not found" };
      }

      setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
      setEvents((prev) =>
        prev.map((e) =>
          e.id === reg.eventId
            ? { ...e, registered: Math.max(0, e.registered - 1) }
            : e,
        ),
      );
      return {
        success: true,
        message: `Cancelled registration for ${event.name}`,
      };
    },
    [registrations, events],
  );

  const registerTeam = useCallback(
    (eventId: string, teamName: string, teamMembers: TeamMember[]) => {
      const event = events.find((e) => e.id === eventId);
      if (!event) {
        return { success: false, message: "Event not found" };
      }

      if (!teamMembers || teamMembers.length === 0) {
        return {
          success: false,
          message: "Team must have at least one member",
        };
      }

      if (teamMembers.length > 10) {
        return { success: false, message: "Team cannot exceed 10 members" };
      }

      // Check for duplicate team from same lead
      const eventTeams = teams.filter((t) => t.eventId === eventId);
      if (eventTeams.length > 0) {
        return {
          success: false,
          message: "You already have a team registered for this event",
        };
      }

      // Check for duplicate team members
      const seenEmails = new Set<string>();
      for (const member of teamMembers) {
        const email = member.email.toLowerCase();
        if (seenEmails.has(email)) {
          return {
            success: false,
            message: `Duplicate member: ${member.email}`,
          };
        }
        seenEmails.add(email);

        // Check if member is already in another team
        const existingTeam = teams.find(
          (t) =>
            t.eventId === eventId &&
            t.members.some((m) => m.email.toLowerCase() === email),
        );
        if (existingTeam) {
          return {
            success: false,
            message: `${member.email} is already in a team for this event`,
          };
        }
      }

      // Check capacity
      const totalTeamSize = teamMembers.length + 1; // +1 for lead
      const seatsRemaining = event.capacity - event.registered;
      if (seatsRemaining < totalTeamSize) {
        return {
          success: false,
          message: `Event capacity exceeded. Available: ${seatsRemaining}, Required: ${totalTeamSize}`,
        };
      }

      // Create team
      const team: Team = {
        id: Date.now().toString(),
        eventId,
        name: teamName,
        createdAt: new Date().toISOString(),
        members: teamMembers,
      };

      setTeams((prev) => [...prev, team]);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, registered: e.registered + totalTeamSize }
            : e,
        ),
      );

      return {
        success: true,
        message: `Team '${teamName}' registered with ${teamMembers.length} members`,
      };
    },
    [teams, events],
  );

  const loginAdmin = useCallback((email: string, password: string) => {
    if (email === "admin@eventverse.com" && password === "admin123") {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => setIsAdminLoggedIn(false), []);

  const loginStudent = useCallback((name: string, email: string) => {
    setCurrentStudent({ name, email });
  }, []);

  const logoutStudent = useCallback(() => setCurrentStudent(null), []);

  const dismissBanner = useCallback(() => setNotificationBanner(null), []);

  const getEventRegistrations = useCallback(
    (eventId: string) => registrations.filter((r) => r.eventId === eventId),
    [registrations]
  );

  const getEventTeams = useCallback(
    (eventId: string) => teams.filter((t) => t.eventId === eventId),
    [teams],
  );

  return (
    <AppContext.Provider
      value={{
        events,
        registrations,
        teams,
        isAdminLoggedIn,
        currentStudent,
        notificationBanner,
        addEvent,
        updateEvent,
        deleteEvent,
        registerForEvent,
        registerTeam,
        cancelRegistration,
        loginAdmin,
        logoutAdmin,
        loginStudent,
        logoutStudent,
        dismissBanner,
        getEventRegistrations,
        getEventTeams,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
