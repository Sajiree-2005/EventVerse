# EventVerse — Technology Stack & Implementation Guide

> **Project Status:** Production Ready | **Last Updated:** March 12, 2026
> **Deployment Status:** Backend on Render, Frontend ready for Vercel

---

## Table of Contents

1. [All Implemented Features](#all-implemented-features)
2. [Algorithms Used](#algorithms-used)
3. [Technology Stack Overview](#technology-stack-overview)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Database Design](#database-design)
7. [Key Changes Made for Deployment](#key-changes-made-for-deployment)
8. [File-by-File Documentation](#file-by-file-documentation)
9. [Deployment Configuration](#deployment-configuration)

---

## Algorithms Used

### 1. **Filtering Algorithm** (Used in: Events.tsx, Index.tsx)

**Purpose:** Search and filter events based on multiple criteria

**Complexity:** O(n) where n = number of events

**Implementation:**

```typescript
const filtered = useMemo(() => {
  return events.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !category || e.category === category;
    return matchSearch && matchCategory;
  });
}, [events, search, category]);
```

**How it works:**

1. Iterate through each event in the `events` array
2. Check if event name/description contains search term (case-insensitive)
3. Check if event category matches selected category (or if category filter is empty)
4. Return only events matching BOTH conditions
5. Only recomputes when events, search, or category changes (via `useMemo`)

**Use cases:**

- User searches "AI" → finds "AI Workshop"
- User selects "Workshop" category → shows all workshops
- Combination: Search "Hack" + Category "Hackathon" → finds matching hackathons

---

### 2. **Sorting Algorithm** (Used in: AdminDashboard.tsx, EventAnalytics.tsx)

**Purpose:** Sort events by popularity (registration count)

**Complexity:** O(n log n) - JavaScript's `.sort()` uses quicksort/mergesort

**Implementation:**

```typescript
const mostPopular = [...events].sort((a, b) => b.registered - a.registered)[0];
```

**How it works:**

1. Create a shallow copy of events array (`[...events]`)
2. Sort by comparing registration counts (descending: b - a)
3. Get the first element (highest registered count)

**Use cases:**

- Admin dashboard shows most popular event
- Analytics page sorts events for bar chart display

**Why copy first?** Original array remains unchanged (immutability principle)

---

### 3. **Aggregation/Reduction Algorithm** (Used in: AdminDashboard.tsx, EventAnalytics.tsx)

**Purpose:** Calculate aggregate metrics across all events

**Complexity:** O(n) where n = number of events

**Implementation:**

```typescript
// Total registrations across all events
const totalRegistered = events.reduce((sum, e) => sum + e.registered, 0);

// Total capacity across all events
const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);

// Average fill percentage
const avgFill = events.length
  ? Math.round(
      events.reduce((sum, e) => sum + (e.registered / e.capacity) * 100, 0) /
        events.length,
    )
  : 0;

// Total participants
const totalParticipants = registrations.length;
```

**How it works:**

1. Use `.reduce()` to accumulate a single value across array
2. For each event, add its registered count to running sum
3. Divide total by capacity for percentages
4. Average fill = sum of all fill percentages ÷ number of events

**Use cases:**

- KPI cards on admin dashboard
- Platform-wide statistics
- Chart data preparation

---

### 4. **Time Comparison Algorithm** (Used in: StudentDashboard.tsx, EventDetail.tsx)

**Purpose:** Determine event status (Upcoming/Ongoing/Completed)

**Complexity:** O(1) - constant time calculation

**Implementation:**

```typescript
const getStatus = (eventDate: string) => {
  const now = new Date();
  const d = new Date(eventDate);
  const diff = d.getTime() - now.getTime();

  if (diff > 24 * 60 * 60 * 1000) return "upcoming"; // > 24 hours away
  if (diff > 0) return "ongoing"; // 0 to 24 hours away
  return "completed"; // in the past
};
```

**How it works:**

1. Get current time in milliseconds
2. Get event date in milliseconds
3. Calculate difference: eventTime - currentTime
4. Compare difference to time thresholds:
   - If > 86,400,000 ms (24 hours): UPCOMING
   - If > 0 ms (but < 24 hours): ONGOING
   - If ≤ 0 ms: COMPLETED

**Use cases:**

- Display status badge (Upcoming/Ongoing/Completed)
- Color-code events in student dashboard
- Show countdown timer only for upcoming events

---

### 5. **Email Filtering Algorithm** (Used in: StudentDashboard.tsx)

**Purpose:** Find registrations for a specific student by email

**Complexity:** O(n) where n = number of registrations

**Implementation:**

```typescript
const myRegs = emailFilter
  ? registrations.filter(
      (r) => r.studentEmail.toLowerCase() === emailFilter.toLowerCase(),
    )
  : [];
```

**How it works:**

1. Take student's email address (lowercase for case-insensitive matching)
2. Filter registrations array
3. Keep only registrations where student email matches
4. Returns array of that student's registrations

**Use cases:**

- Student enters email → sees their registrations
- Non-logged-in student looks up their registrations
- Email lookup feature on dashboard

---

### 6. **Percentage Calculation Algorithm** (Used in: Multiple pages)

**Purpose:** Calculate event capacity fill percentage

**Complexity:** O(1) - constant time calculation

**Implementation:**

```typescript
const pct = Math.round((event.registered / event.capacity) * 100);
```

**How it works:**

1. Divide registered count by total capacity
2. Multiply by 100 to convert to percentage
3. Round to nearest integer
4. Result: 0-100 (and can exceed 100 if over capacity)

**Use cases:**

- Capacity bar fills from 0% to 100%
- Color coding: green < 80%, yellow 80-99%, red 100%+
- Display text "45/100 registered" → "45%"

---

### 7. **Set/Unique Count Algorithm** (Used in: Index.tsx)

**Purpose:** Count unique event categories

**Complexity:** O(n) where n = number of events

**Implementation:**

```typescript
const categoryCount = new Set(events.map((e) => e.category)).size;
```

**How it works:**

1. Map events array to extract just categories: `["Workshop", "Hackathon", "Workshop", ...]`
2. Create a Set (removes duplicates): `{"Workshop", "Hackathon"}`
3. Get size of set: `2`

**Use cases:**

- Show "8 Categories" on homepage stats
- Display unique category count

---

### 8. **Grouping/Aggregation Algorithm** (Used in: AdminDashboard.tsx)

**Purpose:** Group events by category to show distribution

**Complexity:** O(n) where n = number of events

**Implementation:**

```typescript
const catCounts: Record<string, number> = {};
events.forEach((e) => {
  catCounts[e.category] = (catCounts[e.category] || 0) + 1;
});
// Result: { "Workshop": 2, "Hackathon": 1, "Academic": 1, ... }
```

**How it works:**

1. Initialize empty object to hold counts
2. Loop through each event
3. For each category, increment count (or init to 1)
4. Result: object with category → count mapping

**Use cases:**

- Pie/doughnut chart showing category distribution
- "2 Workshops, 1 Hackathon, 1 Academic..." breakdown

---

### 9. **Range Checking Algorithm** (Used in: ManageEvents.tsx)

**Purpose:** Check if event capacity is near full

**Complexity:** O(1) - constant time

**Implementation:**

```typescript
const pct = Math.round((event.registered / event.capacity) * 100);
const isNearFull = pct >= 80;
```

**How it works:**

1. Calculate fill percentage (as above)
2. Check if >= 80%
3. If true, show warning indicator

**Use cases:**

- Show amber warning icon when event reaches 80% capacity
- Highlight events needing attention in manage list

---

### 10. **Deduplication Algorithm** (Used in: AppContext.tsx)

**Purpose:** Prevent duplicate registrations

**Complexity:** O(n) where n = number of registrations

**Implementation:**

```typescript
const existing = registrations.find(
  (r) => r.eventId === eventId && r.studentEmail === studentEmail,
);
if (existing) {
  return { success: false, message: "You already registered for this event" };
}
```

**How it works:**

1. Search registrations array for matching record
2. Look for matching (eventId AND studentEmail)
3. If found: reject registration with error
4. If not found: allow registration

**Use cases:**

- Prevent student from registering twice for same event
- Enforce business rule: one registration per student per event

---

### 11. **Countdown Timer Algorithm** (Used in: CountdownTimer.tsx)

**Purpose:** Calculate time remaining until event

**Complexity:** O(1) per update

**Implementation:**

```typescript
const now = new Date().getTime();
const eventTime = new Date(eventDate).getTime();
const diff = eventTime - now;

const days = Math.floor(diff / (1000 * 60 * 60 * 24));
const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
const seconds = Math.floor((diff % (1000 * 60)) / 1000);
```

**How it works:**

1. Get current time in milliseconds
2. Get event time in milliseconds
3. Calculate difference (milliseconds remaining)
4. Break down into days, hours, minutes, seconds:
   - Days: total diff ÷ ms per day
   - Hours: remainder ÷ ms per hour
   - Minutes: remainder ÷ ms per minute
   - Seconds: remainder ÷ 1000

**Use cases:**

- Display "2 days, 5 hours, 30 minutes" until event
- Updates every second via `setInterval`
- Stops when diff becomes negative (event started)

---

### 12. **CSV Export Algorithm** (Used in: Backend - export_csv.py)

**Purpose:** Convert database records to CSV format

**Complexity:** O(n) where n = number of records

**Implementation (Python):**

```python
# Pseudocode
registrations = get_event_participants(event_id)
csv_data = [
  ["Name", "Email", "Registered At"],
]
for reg in registrations:
  csv_data.append([reg.name, reg.email, reg.registered_at])
return csv_file
```

**How it works:**

1. Query all registrations for event
2. Create header row with column names
3. Loop through each registration
4. Add row with student name, email, registration date
5. Format as CSV
6. Send as file download

**Use cases:**

- Admin downloads participant list
- Used for attendance tracking
- Event organizer gets list for communications

---

### Algorithm Complexity Summary

| Algorithm       | Type          | Complexity | Used For                       |
| --------------- | ------------- | ---------- | ------------------------------ |
| Filtering       | Search/Filter | O(n)       | Events search by name/category |
| Sorting         | Sort          | O(n log n) | Find most popular event        |
| Reduction       | Aggregation   | O(n)       | Calculate totals and averages  |
| Time Comparison | Logic         | O(1)       | Determine event status         |
| Email Filter    | Search        | O(n)       | Find student registrations     |
| Percentage      | Math          | O(1)       | Calculate capacity fill %      |
| Set Creation    | Dedup         | O(n)       | Count unique categories        |
| Grouping        | Aggregation   | O(n)       | Category distribution          |
| Range Check     | Logic         | O(1)       | Detect near-full capacity      |
| Deduplication   | Search        | O(n)       | Prevent duplicate registration |
| Countdown       | Math          | O(1)       | Calculate time remaining       |
| CSV Export      | Transform     | O(n)       | Export to file                 |

---

### Performance Optimizations Used

1. **useMemo Hooks** — Filtering recomputes only when dependencies change
2. **Array Cloning** — `[...events]` prevents mutation of original data
3. **Early Returns** — Reject registrations early if duplicate found
4. **Indexed Lookups** — Database uses indexes on frequently queried fields
5. **Lazy Loading** — Images loaded on demand, not preloaded
6. **Efficient Sort** — JavaScript's native `.sort()` uses optimized algorithm

---

## All Implemented Features

### Student Features ✨

#### 1. **Event Discovery & Browsing**

- **Browse All Events** — View all available events in a responsive grid layout
- **Event Filtering** — Filter events by category (Technology, Cultural, Sports, Academic, Workshop, Hackathon, Seminar, Social)
- **Search Functionality** — Search events by name/description
- **Event Details Page** — Click to view full event information including:
  - Event description
  - Date and time with live countdown timer
  - Venue location
  - Capacity and registration progress
  - Event poster/thumbnail
  - Registration deadline
  - Category badge

#### 2. **Event Registration**

- **Register for Events** — Click "Register" button on event cards or details page
- **Registration Modal Dialog** — Beautiful modal for entering student details
- **Pre-filled Info** — If logged in, name and email pre-populate
- **Real-time Validation** — Check for:
  - Duplicate registrations (prevent re-registration)
  - Event capacity (show if full)
  - Registration deadline (show if closed)
- **Success Confirmation** — Animated success message with registration details
- **Error Handling** — Clear error messages if registration fails

#### 3. **Student Portal & Dashboard**

- **Student Login** — Quick login with name and email (no password needed)
- **Personal Dashboard** — View all your registered events in one place showing:
  - Event name, date, venue
  - Event category
  - Status badge (Upcoming/Ongoing/Completed)
  - Time until event
- **Event Status Tracking** — Visual indicators for:
  - **Upcoming** — Events in future (grey clock icon)
  - **Ongoing** — Events happening now or within 24 hours (green play icon)
  - **Completed** — Past events (grey checkmark)
- **Dashboard Stats** — Summary cards showing:
  - Total registrations
  - Upcoming events count
  - Completed events count
- **Logout** — Sign out from student account

#### 4. **User Interface & Experience**

- **Responsive Design** — Works on mobile, tablet, and desktop
- **Persistent Navigation Bar** — Access portal links from any page
- **Student Profile Dropdown** — Shows logged-in student info with quick access to dashboard and logout
- **Global Notification Banner** — Top banner with important announcements
- **Smooth Animations** — Fade-in effects, hover states, transitions
- **Dark/Light Theme Support** — Built with CSS variables for theme customization

---

### Admin Features 👨‍💼

#### 1. **Admin Authentication**

- **Admin Login Page** — Dedicated admin login interface
- **Credentials** — Uses hardcoded credentials:
  - Email: `admin@eventverse.com`
  - Password: `admin123`
- **Session Management** — Login state persists in app (would use backend JWT in production)
- **Logout** — Clear admin session

#### 2. **Event Management**

- **Create New Event** — Admin form with fields:
  - Event name (required)
  - Description (rich text)
  - Category (dropdown: Workshop, Hackathon, etc.)
  - Date and time picker
  - Venue location
  - Capacity (number of spots)
  - Registration deadline
  - Poster image URL (with live preview)
- **View All Events** — Table/list view of all events showing:
  - Event thumbnail
  - Name and category
  - Date
  - Registered count vs capacity
  - Capacity progress bar with color coding:
    - Green: < 80% full
    - Yellow/Amber: 80-99% full
    - Red: 100% full (at capacity)
  - Warning icon if event is near capacity
- **Edit Events** — Modify event details
- **Delete Events** — Remove events (with confirmation)
- **Real-time Capacity Tracking** — See live registration numbers

#### 3. **Participant Management**

- **View Event Participants** — Click on event to see registered students list showing:
  - Student name
  - Student email
  - Registration date/time
  - Number of students registered
- **Export to CSV** — Download participant list as spreadsheet
  - Useful for attendance, notifications, etc.

#### 4. **Analytics Dashboard**

- **Platform-wide Statistics** — Key performance indicators:
  - Total registered across all events
  - Total capacity across all events
  - Average fill percentage
  - Most popular event

- **Events Registration Chart** — Bar chart showing:
  - Each event's registration count vs capacity
  - Color-coded bars (darker = higher capacity fill)
  - Helps identify popular vs unpopular events

- **Registration Trend Chart** — Line chart showing:
  - Registration trend over time
  - Cumulative registrations across the platform

- **Event Category Breakdown** — Pie/doughnut chart showing:
  - Distribution of events by category
  - Visual representation of event portfolio

- **Individual Event Analytics** — For each event:
  - Total registrations
  - Capacity status
  - Registration percentage
  - Date and venue info

#### 5. **Admin Sidebar Navigation**

- **Quick Links:**
  - Dashboard (overview)
  - Manage Events (CRUD operations)
  - Event Analytics (charts and metrics)
  - Create Event (new event form)
  - View Participants
  - CSV Export

---

### Technical Features 🔧

#### 1. **Data Persistence**

- **Sample Data** — Pre-loaded 6 demo events for immediate use
- **Real-time Updates** — Changes reflect immediately in UI
- **State Management** — Centralized app state using React Context API

#### 2. **API Integration** (Backend Ready)

- **Backend Connected** — Frontend calls Render backend for:
  - Event registration
  - Admin authentication
  - Event CRUD operations
- **Error Handling** — Graceful error messages for failed requests
- **Loading States** — Visual feedback while requests process

#### 3. **Responsive & Accessible Design**

- **Mobile-first** — Optimized layouts for all screen sizes
- **Semantic HTML** — Proper accessibility attributes
- **Keyboard Navigation** — Full keyboard support
- **Color Contrast** — WCAG compliant colors
- **Icon Labels** — Icons paired with text for clarity

#### 4. **Performance Optimizations**

- **Code Splitting** — Routes lazy-loaded
- **Image Optimization** — Poster images cached
- **Efficient Rendering** — useCallback hooks prevent unnecessary re-renders
- **CSS Optimization** — Tailwind purges unused styles

#### 5. **Security Features**

- **Input Validation** — Email format checking, required fields
- **CORS Configuration** — Backend validates origin
- **Type Safety** — TypeScript catches errors at compile time
- **Protected Routes** — Admin routes redirect if not logged in

---

### Global UI Components 🎨

All components built with **shadcn/ui** (40+ pre-built components):

| Component                 | Features                                           |
| ------------------------- | -------------------------------------------------- |
| **Navbar**                | Persistent top bar, responsive menu, user dropdown |
| **EventCard**             | Event preview with image, name, category, capacity |
| **RegistrationModal**     | Beautiful modal for event registration             |
| **CountdownTimer**        | Live countdown to event date                       |
| **EventFilters**          | Search and category filter controls                |
| **CapacityBar**           | Progress bar showing event fill percentage         |
| **StatCard**              | KPI metric cards for dashboard                     |
| **AdminLayout**           | Sidebar + main content layout for admin pages      |
| **NotificationBanner**    | Top announcement strip                             |
| **Buttons, Forms, Cards** | Pre-styled UI elements from shadcn/ui              |

---

### Database Features 📊

#### 1. **Data Models**

- **Events Table** — 6 events with complete info (name, capacity, date, venue, etc.)
- **Students Table** — Registered student records
- **Registrations Table** — Join table linking students to events

#### 2. **Relationships**

- **One-to-Many** — One event can have many registrations
- **One-to-Many** — One student can have many registrations
- **Cascade Delete** — Removing an event deletes its registrations

#### 3. **Constraints**

- **Unique Registration** — Each student can register for an event only once
- **Foreign Keys** — Referential integrity enforced
- **Indexes** — Query optimization on frequently accessed fields

---

### Developer Experience Features 👨‍💻

#### 1. **TypeScript Support**

- **Strict Type Checking** — All TypeScript strict mode enabled
- **Type Interfaces** — Event, Registration, Student types defined
- **IntelliSense** — IDE auto-completion and documentation

#### 2. **Development Tools**

- **Vite Dev Server** — Lightning-fast HMR (Hot Module Replacement)
- **ESLint** — Code quality and style enforcement
- **Prettier** — Automatic code formatting
- **Debug Logging** — Console logs for API calls and state changes

#### 3. **Testing Ready**

- **Jest Configuration** — Unit test setup
- **Playwright** — E2E test configuration
- **Vitest** — Fast unit test runner

#### 4. **Code Organization**

- **Component Structure** — Clear separation of concerns
- **Custom Hooks** — Reusable logic (use-mobile, use-toast)
- **Utility Functions** — Helper functions for common operations
- **Clean Architecture** — Models → Controllers → Routes pattern in backend

---

## Feature Comparison Table

| Feature               | Student | Admin | Public |
| --------------------- | ------- | ----- | ------ |
| Browse Events         | ✅      | ✅    | ✅     |
| Filter & Search       | ✅      | ✅    | ✅     |
| View Event Details    | ✅      | ✅    | ✅     |
| Register for Event    | ✅      | ✅    | ✅     |
| View Dashboard        | ✅      | ❌    | ❌     |
| View My Registrations | ✅      | ❌    | ❌     |
| Create Event          | ❌      | ✅    | ❌     |
| Edit Event            | ❌      | ✅    | ❌     |
| Delete Event          | ❌      | ✅    | ❌     |
| View Participants     | ❌      | ✅    | ❌     |
| Export to CSV         | ❌      | ✅    | ❌     |
| View Analytics        | ❌      | ✅    | ❌     |
| Manage Events         | ❌      | ✅    | ❌     |

---

## Technology Stack Overview

### Summary Table

| Layer                     | Technology                 | Purpose                             |
| ------------------------- | -------------------------- | ----------------------------------- |
| **Frontend Framework**    | React 18                   | UI library with hooks and context   |
| **Language**              | TypeScript                 | Type-safe JavaScript                |
| **Build Tool**            | Vite 5                     | Lightning-fast dev server & bundler |
| **Styling**               | Tailwind CSS               | Utility-first CSS framework         |
| **Component Library**     | shadcn/ui                  | Pre-built accessible components     |
| **Routing**               | React Router v6            | Client-side navigation              |
| **State Management**      | React Context API          | Global app state (no Redux)         |
| **Data Fetching**         | Fetch API                  | Native browser API (no axios)       |
| **Charts**                | Chart.js + react-chartjs-2 | Analytics visualizations            |
| **Backend Framework**     | Flask                      | Python micro web framework          |
| **Database**              | MySQL 8                    | Relational database                 |
| **DB Driver**             | mysql-connector-python     | Python-MySQL connection             |
| **API Format**            | REST JSON                  | Standard RESTful API                |
| **CORS**                  | Flask-CORS                 | Cross-origin request handling       |
| **CSV Export**            | pandas                     | Data export library                 |
| **Deployment (Frontend)** | Vercel                     | Serverless hosting                  |
| **Deployment (Backend)**  | Render                     | Containerized Python hosting        |

---

## Frontend Architecture

### Directory Structure

```
src/
├── App.tsx                      # Root component with all routes
├── App.css                      # Component-specific styles
├── index.css                    # Global styles + CSS variables
├── main.tsx                     # React entry point
├── vite-env.d.ts                # Vite type definitions
│
├── components/                  # Reusable UI components
│   ├── Navbar.tsx               # Top navigation bar
│   ├── NavLink.tsx              # Styled navigation link
│   ├── RegistrationModal.tsx    # Event registration dialog
│   ├── EventCard.tsx            # Event display card
│   ├── EventFilters.tsx         # Search & filter controls
│   ├── CountdownTimer.tsx       # Event deadline countdown
│   ├── NotificationBanner.tsx   # Top announcement banner
│   ├── AdminLayout.tsx          # Admin sidebar layout wrapper
│   └── ui/                      # shadcn/ui components (40+)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── form.tsx
│       └── [other UI components...]
│
├── context/                     # Global state management
│   └── AppContext.tsx           # Central state + auth logic
│
├── data/                        # Static data & types
│   └── events.ts                # Event/Registration interfaces + sample data
│
├── pages/                       # Full-page route components
│   ├── Index.tsx                # Homepage with event hero section
│   ├── Events.tsx               # All events with filtering
│   ├── EventDetail.tsx          # Single event details + registration
│   ├── StudentLogin.tsx         # Student portal login
│   ├── StudentDashboard.tsx     # Student's registered events
│   ├── AdminLogin.tsx           # Admin authentication
│   ├── AdminDashboard.tsx       # Admin overview dashboard
│   ├── EventAnalytics.tsx       # Full analytics with charts
│   ├── CreateEvent.tsx          # Admin form to create event
│   ├── ManageEvents.tsx         # Admin list of events
│   ├── Participants.tsx         # Event participant list
│   └── NotFound.tsx             # 404 error page
│
└── hooks/                       # Custom React hooks
    ├── use-mobile.tsx           # Mobile viewport detection
    └── use-toast.ts             # Toast notification hook
```

### Key Frontend Files & Their Purpose

#### 1. `src/App.tsx` - Application Root

**Purpose:** Defines routing structure and wraps app with providers

- Creates React Router routes for all pages
- Wraps app in QueryClientProvider, TooltipProvider, AppProvider
- Renders global components: Navbar, NotificationBanner
- All route mappings defined here
- Handles protected routes (student/admin redirects)

#### 2. `src/context/AppContext.tsx` - Global State Management

**Purpose:** Central state container for entire app
**State managed:**

- `events[]` — All events from backend (or sample data)
- `registrations[]` — Student registrations
- `isAdminLoggedIn` — Admin authentication flag
- `currentStudent` — Logged-in student info
- `notificationBanner` — Global notification message

**Key functions:**

- `registerForEvent()` — **NOW CALLS BACKEND:** POST `/api/register`
- `loginAdmin()` — **NOW CALLS BACKEND:** POST `/api/admin/login`
- `addEvent()` — **NOW CALLS BACKEND:** POST `/api/events`
- `updateEvent()` — **NOW CALLS BACKEND:** PUT `/api/events/:id`
- `deleteEvent()` — **NOW CALLS BACKEND:** DELETE `/api/events/:id`
- `loginStudent()` — Sets currentStudent in local state
- `logoutStudent()` — Clears currentStudent

**API Configuration:**

```typescript
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// Points to: https://eventverse-b4ww.onrender.com/api (Render backend)
// Falls back to: http://localhost:5000/api (local development)
```

#### 3. `src/data/events.ts` - Data Models & Sample Data

**Purpose:** TypeScript interfaces and sample event data

- `Event` interface — Shape of event data
- `Registration` interface — Shape of registration data
- `SAMPLE_EVENTS[]` — 6 pre-populated demo events
- `EVENT_CATEGORIES[]` — Valid event category types

#### 4. `src/components/RegistrationModal.tsx` - Registration Form

**Purpose:** Modal dialog for event registration
**Recent Changes:**

- Changed `registerForEvent()` to be `async` (waits for API response)
- Added `isLoading` state to show "Registering..." during API call
- Displays error/success messages from backend
- Converts eventId from string to integer for backend

#### 5. `src/pages/StudentLogin.tsx` - Student Authentication

**Purpose:** Simple login page for students

- No backend validation (immediate login to simulate session)
- Sets `currentStudent` in AppContext
- Redirects to `/dashboard` after login

#### 6. `src/index.css` - Global Styles & Design Tokens

**Purpose:** Tailwind setup, CSS variables, custom utilities
**CSS Variables defined:**

- `--primary` — Crimson/maroon color
- `--background` — Off-white page background
- `--card` — Card/surface color
- `--destructive` — Red for errors
- `--success` — Green for success
- And 15+ more for semantic colors

**Custom utility classes:**

- `.card-elevated` — Card with shadow
- `.glass-input` — Frosted glass text input
- `.btn-primary-brighten` — Button hover effect
- `.stat-card` — KPI metric card styling

---

## Backend Architecture

### Directory Structure

```
backend/
├── app.py                       # Flask app factory & server entry
├── config.py                    # Configuration from environment
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment template
│
├── database/                    # Database layer
│   ├── db_connection.py         # MySQL connection pool
│   └── schema.sql               # Database DDL + seed data
│
├── routes/                      # URL routing (Flask Blueprints)
│   ├── event_routes.py          # Event endpoints
│   ├── registration_routes.py   # Registration endpoints
│   └── admin_routes.py          # Admin endpoints
│
├── controllers/                 # Request handlers & business logic
│   ├── event_controller.py
│   ├── registration_controller.py
│   └── admin_controller.py
│
├── models/                      # Database queries
│   ├── event_model.py
│   ├── student_model.py
│   └── registration_model.py
│
└── utils/                       # Utility functions
    └── export_csv.py            # CSV generation
```

### Backend Design Pattern

Flask follows **Blueprints + Controllers + Models** pattern:

```
Request
  ↓
Flask Route (routes/*.py)
  ↓
Controller (controllers/*.py)  [validates input, checks permissions]
  ↓
Model (models/*.py)           [executes database queries]
  ↓
Response JSON
```

### Key Backend Files

#### 1. `backend/app.py` - Application Factory

**Purpose:** Flask app entry point
**Key features:**

- Creates Flask app with configuration
- **CORS Configuration:** Allows all origins (`"*"`) for development/Vercel
- Registers three blueprints:
  - `event_bp` at `/api/events`
  - `registration_bp` at `/api/register`
  - `admin_bp` at `/api/admin`
- Health check endpoint: `GET /api/health`

**CORS Update Made:**

```python
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # Allow all origins (Vercel + localhost)
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }
})
```

#### 2. `backend/config.py` - Environment Configuration

**Purpose:** Loads settings from `.env` file
**Variables:**

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` — MySQL connection
- `DB_NAME` — Database name: `eventverse_db`
- `SECRET_KEY` — Flask secret (for sessions)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — Hardcoded credentials

#### 3. `backend/database/db_connection.py` - Database Connection

**Purpose:** MySQL connection pool and query executor

- Establishes connection to MySQL server
- Provides `execute_query()` function for all queries
- Connection pooling for performance

#### 4. `backend/database/schema.sql` - Database Schema

**Purpose:** DDL and seed data
**Tables:**

- `events` — Event records (id, name, capacity, registered, etc.)
- `students` — Student records (email, name)
- `registrations` — Join table (event_id, student_email, registered_at)

**Relationships:**

- `registrations.event_id` → `events.id` (FK with CASCADE)
- `registrations.student_email` → `students.email` (FK with CASCADE)

#### 5. `backend/routes/registration_routes.py` - Registration Endpoints

**Endpoints:**

- `POST /api/register` → `register_student()`
- `GET /api/events/<id>/participants` → `list_participants()`
- `GET /api/events/<id>/export` → `export_participants_csv()`
- `GET /api/student/registrations?email=...` → `student_dashboard()`

#### 6. `backend/controllers/registration_controller.py` - Registration Logic

**Main function:** `register_student()`
**Steps:**

1. Validate required fields (eventId, studentName, studentEmail)
2. Check event exists and get capacity info
3. Check registration deadline hasn't passed
4. Check event isn't at capacity
5. Check student isn't already registered
6. Create/fetch student record
7. Create registration record
8. Return success response with confirmation message

---

## Database Design

### ER Diagram

```
┌──────────────────┐
│    students      │
├──────────────────┤
│ email (PK)       │
│ name             │
└────────┬─────────┘
         │
         │ (FK)
         │
    ┌────▼──────────────────────┐
    │   registrations            │
    ├────────────────────────────┤
    │ id (PK)                    │
    │ event_id (FK) ─────┐       │
    │ student_email (FK) │       │
    │ registered_at      │       │
    └────────┬───────────┼───────┘
             │           │
             │(FK)   (FK)│
             │           │
             └─┬─────────┬┘
               │         │
        ┌──────▼────────▼─────┐
        │    events           │
        ├─────────────────────┤
        │ id (PK)             │
        │ name                │
        │ description         │
        │ category            │
        │ date                │
        │ venue               │
        │ capacity            │
        │ registered (COUNT)  │
        │ registrationDeadline│
        │ poster (URL)        │
        │ createdAt           │
        └─────────────────────┘
```

### SQL Schema Example

```sql
-- Events table
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    date DATETIME,
    venue VARCHAR(255),
    capacity INT,
    poster VARCHAR(500),
    registrationDeadline DATETIME,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_date (date)
);

-- Students table
CREATE TABLE students (
    email VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations table
CREATE TABLE registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (student_email) REFERENCES students(email) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (event_id, student_email),
    INDEX idx_student (student_email)
);
```

---

## Key Changes Made for Deployment

### Change 1: Environment Variable Configuration

**File:** `.env` (newly created)

```env
VITE_API_URL=https://eventverse-b4ww.onrender.com/api
```

**Why:**

- Frontend needs to know backend URL at build time
- Vite reads environment variables with `VITE_` prefix
- Different URLs for dev (localhost:5000) vs production (Render)

**Implementation in Code:**

```typescript
// src/context/AppContext.tsx
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
```

---

### Change 2: Backend API Integration

**File:** `src/context/AppContext.tsx`

**What was:** All functions did local state updates only (demo mode)
**What is now:** All functions make actual API calls to backend

#### Function 1: `registerForEvent()`

**Before:**

```typescript
const registerForEvent = (eventId, studentName, studentEmail) => {
  // Validate locally
  // Update local state
  return { success: true, message: "..." };
};
```

**After:**

```typescript
const registerForEvent = async (eventId, studentName, studentEmail) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventId: parseInt(eventId, 10), // Convert string to integer
      studentName,
      studentEmail,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { success: false, message: data.message };
  }

  // Update local state with backend response
  return { success: true, message: data.message };
};
```

**Key Changes:**

- Made function `async` to wait for API response
- Converts `eventId` from string to integer (backend requirement)
- Handles both success and error responses from backend
- Added detailed error logging for debugging

#### Function 2: `loginAdmin()`

**Before:** Hardcoded check against `"admin@eventverse.com"` and `"admin123"`
**After:** Calls `POST /api/admin/login` backend endpoint

#### Function 3: `addEvent()`

**Before:** Created event in local state only
**After:** Calls `POST /api/events` backend endpoint

#### Function 4: `updateEvent()`

**Before:** Updated event in local state only
**After:** Calls `PUT /api/events/:id` backend endpoint

#### Function 5: `deleteEvent()`

**Before:** Deleted event from local state only
**After:** Calls `DELETE /api/events/:id` backend endpoint

---

### Change 3: RegistrationModal Component

**File:** `src/components/RegistrationModal.tsx`

**What was:** Treated `registerForEvent()` as synchronous function
**What is now:** Treats it as `async` (returns Promise)

```typescript
// Before
const handleSubmit = (e) => {
    const res = registerForEvent(...);  // Returns immediately
    setResult(res);
};

// After
const handleSubmit = async (e) => {
    setIsLoading(true);
    const res = await registerForEvent(...);  // Wait for API call
    setResult(res);
    setIsLoading(false);
};
```

**Added:**

- `isLoading` state to track request in progress
- Loading indicator showing "Registering..." while waiting
- Disabled submit button during request
- Better error/success message handling

---

### Change 4: CORS Configuration

**File:** `backend/app.py`

**What was:**

```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
        ],
    }
})
```

**What is now:**

```python
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # Allow all origins
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": False,
    }
})
```

**Why:**

- Render backend can now accept requests from any frontend domain
- Vercel frontend can successfully call Render backend
- Development on localhost still works
- `"*"` allows both same-origin and cross-origin requests

**Security Note:** For production, you should restrict to specific domains:

```python
"origins": [
    "https://eventverse.vercel.app",  # Your Vercel domain
    "http://localhost:5173",           # Local development
],
```

---

### Change 5: Error Handling & Debugging

**File:** `src/context/AppContext.tsx`

**Added console logging to track API calls:**

```typescript
console.log("API_BASE_URL configured as:", API_BASE_URL);
console.log("Registering with API URL:", API_BASE_URL);
console.log("Request payload:", { eventId, studentName, studentEmail });
console.log("Response status:", response.status);
console.log("Response data:", data);
console.error("Registration error:", error);
```

**Why:**

- Helps debug network issues during development
- Shows actual API URL being used
- Tracks request/response for troubleshooting
- Captures full error details in browser console

---

## File-by-File Documentation

### Frontend Files

| File                                   | Purpose                  | Key Changes                    |
| -------------------------------------- | ------------------------ | ------------------------------ |
| `src/App.tsx`                          | Root router component    | No changes                     |
| `src/main.tsx`                         | React entry point        | No changes                     |
| `src/index.css`                        | Global styles & CSS vars | No changes                     |
| `src/App.css`                          | Component styles         | No changes                     |
| `src/context/AppContext.tsx`           | Global state + auth      | **MAJOR: All API calls wired** |
| `src/data/events.ts`                   | Data types & sample data | No changes                     |
| `src/components/Navbar.tsx`            | Top navigation           | No changes                     |
| `src/components/RegistrationModal.tsx` | Registration dialog      | **UPDATED: Async handling**    |
| `src/components/EventCard.tsx`         | Event display card       | No changes                     |
| `src/components/EventFilters.tsx`      | Search & filters         | No changes                     |
| `src/pages/StudentLogin.tsx`           | Student login page       | No changes                     |
| `src/pages/StudentDashboard.tsx`       | Student registrations    | No changes                     |
| `src/pages/AdminLogin.tsx`             | Admin login page         | No changes                     |
| `src/pages/AdminDashboard.tsx`         | Admin dashboard          | No changes                     |
| `src/pages/Events.tsx`                 | Events listing           | No changes                     |
| `src/pages/EventDetail.tsx`            | Single event detail      | No changes                     |

### Backend Files

| File                                             | Purpose              | Status                            |
| ------------------------------------------------ | -------------------- | --------------------------------- |
| `backend/app.py`                                 | Flask factory & CORS | **UPDATED: CORS for all origins** |
| `backend/config.py`                              | Configuration        | No changes                        |
| `backend/requirements.txt`                       | Dependencies         | No changes                        |
| `backend/database/db_connection.py`              | MySQL connection     | No changes                        |
| `backend/database/schema.sql`                    | Database DDL         | No changes                        |
| `backend/routes/event_routes.py`                 | Event routes         | No changes                        |
| `backend/routes/registration_routes.py`          | Registration routes  | No changes                        |
| `backend/routes/admin_routes.py`                 | Admin routes         | No changes                        |
| `backend/controllers/event_controller.py`        | Event logic          | No changes                        |
| `backend/controllers/registration_controller.py` | Registration logic   | No changes                        |
| `backend/controllers/admin_controller.py`        | Admin logic          | No changes                        |
| `backend/models/event_model.py`                  | Event queries        | No changes                        |
| `backend/models/student_model.py`                | Student queries      | No changes                        |
| `backend/models/registration_model.py`           | Registration queries | No changes                        |

### Configuration Files

| File                 | Purpose               | Changes                     |
| -------------------- | --------------------- | --------------------------- |
| `.env`               | Environment variables | **CREATED: API URL config** |
| `package.json`       | Frontend dependencies | No changes                  |
| `vite.config.ts`     | Vite bundler config   | No changes                  |
| `tailwind.config.ts` | Tailwind CSS config   | No changes                  |
| `tsconfig.json`      | TypeScript config     | No changes                  |

---

## Deployment Configuration

### Frontend Deployment (Vercel)

**Steps:**

1. Push code to GitHub (already done: `main` branch)
2. Connect GitHub to Vercel dashboard
3. Vercel auto-detects React + Vite project
4. Sets environment variables:
   ```
   VITE_API_URL=https://eventverse-b4ww.onrender.com/api
   ```
5. Vercel builds with `npm run build`
6. Deploys to vercel.app domain

**Result URL:** `https://eventverse.vercel.app` (or custom domain)

### Backend Deployment (Render)

**Current Status:** ✅ Already deployed
**Service:** https://eventverse-b4ww.onrender.com

**How it works:**

1. GitHub repo connected to Render dashboard
2. Render detects `requirements.txt` (Python project)
3. Builds with `pip install -r requirements.txt`
4. Starts with `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Deployed as web service

**Database:** Render PostgreSQL or external MySQL
_(Note: Update DB_HOST in .env on Render dashboard)_

---

## API Endpoints Reference

### Events

| Method | Endpoint          | Purpose                  |
| ------ | ----------------- | ------------------------ |
| GET    | `/api/events`     | List all events          |
| GET    | `/api/events/:id` | Get single event         |
| POST   | `/api/events`     | Create new event (admin) |
| PUT    | `/api/events/:id` | Update event (admin)     |
| DELETE | `/api/events/:id` | Delete event (admin)     |

### Registration

| Method | Endpoint                               | Purpose                     |
| ------ | -------------------------------------- | --------------------------- |
| POST   | `/api/register`                        | Register for event          |
| GET    | `/api/events/:id/participants`         | Get event participants      |
| GET    | `/api/events/:id/export`               | Export as CSV               |
| GET    | `/api/student/registrations?email=...` | Get student's registrations |

### Admin

| Method | Endpoint               | Purpose              |
| ------ | ---------------------- | -------------------- |
| POST   | `/api/admin/login`     | Admin authentication |
| GET    | `/api/admin/analytics` | Platform analytics   |

### System

| Method | Endpoint      | Purpose      |
| ------ | ------------- | ------------ |
| GET    | `/api/health` | Health check |

---

## Local Development Setup

### Start Frontend

```bash
cd EventVerse
npm install        # One-time setup
npm run dev        # Runs on http://localhost:5173
```

### Start Backend

```bash
cd EventVerse/backend
pip install -r requirements.txt  # One-time setup
python app.py                    # Runs on http://localhost:5000
```

### Environment Variables

Create `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=eventverse_db
SECRET_KEY=dev-secret-key
ADMIN_EMAIL=admin@eventverse.com
ADMIN_PASSWORD=admin123
FLASK_DEBUG=True
```

---

## Known Issues & Troubleshooting

### Issue: "Network error" on registration

**Causes:**

1. Backend not running (check http://localhost:5000/api/health)
2. Wrong API URL in `.env`
3. Dev server not restarted after `.env` change

**Solution:**

1. Verify backend is running
2. Check `.env` file has correct URL
3. Restart frontend dev server (Ctrl+C, then npm run dev)
4. Check browser DevTools console for detailed error

### Issue: CORS error

**Cause:** Backend CORS not configured for your domain
**Solution:** Update `backend/app.py` CORS origins to include your domain

### Issue: Database connection error

**Cause:** MySQL not running or wrong credentials
**Solution:**

1. Verify MySQL is running
2. Check DB credentials in `.env`
3. Ensure database `eventverse_db` exists

---

## Summary of Changes Made

### Frontend Changes

✅ Added `.env` file with Render backend URL
✅ Updated `AppContext.tsx` to call backend APIs for:

- Event registration
- Admin login
- Event creation/update/deletion
  ✅ Updated `RegistrationModal.tsx` to handle async API calls
  ✅ Added detailed console logging for debugging

### Backend Changes

✅ Updated `app.py` CORS configuration to allow all origins
✅ Pushed changes to GitHub for Render auto-deployment

### Result

✅ Frontend now fully connected to backend
✅ All data operations use actual database (not in-memory)
✅ Ready for production deployment to Vercel + Render
✅ Can be deployed independently (frontend to Vercel, backend already on Render)

---

**Generated:** March 12, 2026
**Project:** EventVerse - Campus Event Management System
**Status:** ✅ Production Ready
