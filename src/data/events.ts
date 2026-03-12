export interface Event {
  id: string;
  name: string;
  description: string;
  category: string;
  date: string; // ISO string
  venue: string;
  capacity: number;
  registered: number;
  registrationDeadline: string;
  poster: string;
  createdAt: string;
  volunteeringEnabled?: boolean;
  volunteerSlots?: number;
}

export interface Registration {
  id: string;
  eventId: string;
  studentName: string;
  studentEmail: string;
  registeredAt: string;
}

export const EVENT_CATEGORIES = [
  "Technology",
  "Cultural",
  "Sports",
  "Academic",
  "Workshop",
  "Hackathon",
  "Seminar",
  "Social",
];

export const SAMPLE_EVENTS: Event[] = [
  {
    id: "1",
    name: "AI Workshop 2026",
    description:
      "Explore the latest trends in artificial intelligence with hands-on coding sessions and expert talks on machine learning, neural networks, and generative AI applications.",
    category: "Workshop",
    date: "2026-03-25T10:00:00",
    venue: "Seminar Hall A",
    capacity: 50,
    registered: 38,
    registrationDeadline: "2026-03-22T23:59:59",
    poster:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop",
    createdAt: "2026-03-01T00:00:00",
    volunteeringEnabled: true,
    volunteerSlots: 10,
  },
  {
    id: "2",
    name: "Hackathon 2026",
    description:
      "A 36-hour coding marathon where teams compete to build innovative solutions. Prizes worth $5,000 for the top three teams. Open to all departments.",
    category: "Hackathon",
    date: "2026-04-05T09:00:00",
    venue: "Innovation Lab",
    capacity: 120,
    registered: 87,
    registrationDeadline: "2026-03-15T23:59:59",
    poster:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop",
    createdAt: "2026-03-05T00:00:00",
    volunteeringEnabled: true,
    volunteerSlots: 20,
  },
  {
    id: "3",
    name: "Cultural Fest: Rhythm & Hues",
    description:
      "Annual cultural festival featuring music, dance, art exhibitions, and theatrical performances from students across all departments.",
    category: "Cultural",
    date: "2026-04-12T16:00:00",
    venue: "Open Air Theatre",
    capacity: 300,
    registered: 156,
    registrationDeadline: "2026-04-10T23:59:59",
    poster:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop",
    createdAt: "2026-03-08T00:00:00",
    volunteeringEnabled: true,
    volunteerSlots: 30,
  },
  {
    id: "4",
    name: "Inter-College Basketball Tournament",
    description:
      "Compete against the best college teams in the region. Three-day tournament with knockout rounds and grand finale.",
    category: "Sports",
    date: "2026-04-18T08:00:00",
    venue: "Sports Complex",
    capacity: 80,
    registered: 64,
    registrationDeadline: "2026-04-15T23:59:59",
    poster:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop",
    createdAt: "2026-03-02T00:00:00",
  },
  {
    id: "5",
    name: "Research Symposium",
    description:
      "Present your research papers and get feedback from industry experts and academic reviewers. Best paper awards in three categories.",
    category: "Academic",
    date: "2026-03-30T09:30:00",
    venue: "Conference Hall B",
    capacity: 60,
    registered: 42,
    registrationDeadline: "2026-03-28T23:59:59",
    poster:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop",
    createdAt: "2026-03-04T00:00:00",
  },
  {
    id: "6",
    name: "Web Development Bootcamp",
    description:
      "Intensive 2-day bootcamp covering React, Node.js, and cloud deployment. Build a full-stack project by the end of day two.",
    category: "Technology",
    date: "2026-04-22T10:00:00",
    venue: "Computer Lab 3",
    capacity: 40,
    registered: 29,
    registrationDeadline: "2026-04-20T23:59:59",
    poster:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
    createdAt: "2026-03-06T00:00:00",
    volunteeringEnabled: true,
    volunteerSlots: 8,
  },
];
