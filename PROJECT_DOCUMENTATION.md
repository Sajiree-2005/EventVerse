# EventVerse — Complete Project Documentation

> **Version:** 2.0 | **Stack:** React 18 + TypeScript + Flask + MySQL | **Last Updated:** March 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Folder Structure](#3-folder-structure)
4. [File-by-File Explanation](#4-file-by-file-explanation)
   - [Frontend Files](#41-frontend-files)
   - [Backend Files](#42-backend-files)
5. [Backend Deep Dive](#5-backend-deep-dive)
6. [Database Schema](#6-database-schema)
7. [Feature Explanations](#7-feature-explanations)
8. [Code Flow Walkthroughs](#8-code-flow-walkthroughs)
9. [Deployment Guide](#9-deployment-guide)

---

## 1. Project Overview

### What is EventVerse?

EventVerse is a full-stack **campus event management platform** designed to solve a common problem in academic institutions: the fragmented, manual process of organizing, discovering, and registering for campus events.

Before platforms like EventVerse, students typically learned about events through physical notice boards, group chats, or word of mouth — leading to missed events, overbooking, and no data-driven insights for organizers. EventVerse centralizes all of this into a single, beautiful web application.

### Problems It Solves

| Problem | EventVerse Solution |
|---|---|
| Students miss events | Centralized discovery with search and filters |
| Manual registration via forms | One-click digital registration with capacity control |
| No registration history | Personalized student dashboard |
| Admin has no data insights | Analytics dashboard with charts |
| Overbooking | Real-time capacity tracking with seat counters |
| Scattered event info | Rich event detail pages with venue, date, countdown |

### Who Uses It?

- **Students** — browse events, register, track registrations via a personal dashboard
- **Admins** — create and manage events, view participant lists, export CSVs, analyze data

### Technology Summary

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite 5 |
| Styling | Tailwind CSS, shadcn/ui component library |
| Charts | Chart.js via react-chartjs-2 |
| Routing | React Router DOM v6 |
| State Management | React Context API |
| Backend | Python Flask (REST API) |
| Database | MySQL 8 |
| DB Driver | mysql-connector-python |
| CSV Export | pandas |
| CORS | Flask-CORS |

---

## 2. System Architecture

EventVerse uses a **decoupled three-tier architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                        │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │           FRONTEND  (React + TypeScript)          │  │
│  │                                                   │  │
│  │  Pages → Components → Context (State) → Router   │  │
│  │                                                   │  │
│  │  Vite Dev Server: http://localhost:5173           │  │
│  └────────────────────────┬──────────────────────────┘  │
└───────────────────────────│─────────────────────────────┘
                            │  HTTP/JSON  (REST API)
                            │  axios / fetch calls
                            │  Cross-Origin (CORS enabled)
┌───────────────────────────▼─────────────────────────────┐
│                  BACKEND  (Flask / Python)               │
│                                                         │
│  app.py → Blueprints → Controllers → Models → DB        │
│                                                         │
│  API Server: http://localhost:5000/api/...             │
└───────────────────────────┬─────────────────────────────┘
                            │  mysql-connector-python
                            │  SQL queries
┌───────────────────────────▼─────────────────────────────┐
│                  DATABASE  (MySQL 8)                     │
│                                                         │
│   students  ──< registrations >──  events               │
│                                                         │
│   eventverse_db @ localhost:3306                        │
└─────────────────────────────────────────────────────────┘
```

### Architecture Decisions

**Why React + Flask (not full-stack Next.js or Django)?**
The decoupled approach keeps the frontend and backend independently deployable and testable. Flask is lightweight and ideal for academic projects where the focus is on demonstrating REST API design principles.

**Why React Context instead of Redux?**
The application state (events list, registration list, admin login status) is relatively simple and doesn't require the overhead of Redux. Context API provides sufficient reactivity with less boilerplate.

**Why MySQL over SQLite or MongoDB?**
MySQL enforces relational integrity through foreign keys and UNIQUE constraints, which is critical for preventing duplicate registrations. It also mirrors real-world production database environments commonly used in enterprise systems.

### API Communication Pattern

All frontend-to-backend communication follows this pattern:

```
Frontend Component
       │
       ▼
  AppContext (useApp hook)
       │  calls registerForEvent(), addEvent(), etc.
       ▼
  (In demo mode) In-memory state update
       │  OR in production:
       ▼
  fetch("http://localhost:5000/api/...")
       │  JSON request body
       ▼
  Flask Route → Controller → Model → MySQL
       │  JSON response
       ▼
  State update → React re-render
```

> **Note:** The current frontend operates in **demo mode** using an in-memory React Context store (no actual HTTP calls). The Flask backend is fully functional and ready for production integration. Connecting them requires replacing the Context methods with fetch/axios calls to the API endpoints.

---

## 3. Folder Structure

```
EventVerse/
│
├── index.html                    # Vite HTML entry point
├── package.json                  # Frontend dependencies
├── vite.config.ts                # Vite bundler configuration
├── tailwind.config.ts            # Tailwind CSS theme configuration
├── tsconfig.json                 # TypeScript compiler settings
├── components.json               # shadcn/ui component registry
│
├── public/                       # Static assets served directly
│   ├── favicon.svg               # SVG favicon (crimson calendar icon)
│   ├── logo.svg                  # EventVerse wordmark logo
│   └── robots.txt                # Search engine crawling rules
│
├── src/                          # All frontend source code
│   ├── App.tsx                   # Root component + route definitions
│   ├── App.css                   # Global base styles
│   ├── index.css                 # Tailwind directives + CSS variables
│   ├── main.tsx                  # React DOM entry point
│   │
│   ├── context/
│   │   └── AppContext.tsx        # Global state management
│   │
│   ├── data/
│   │   └── events.ts             # TypeScript interfaces + seed data
│   │
│   ├── components/               # Reusable UI components
│   │   ├── AdminLayout.tsx       # Admin sidebar layout wrapper
│   │   ├── CapacityBar.tsx       # Reusable progress bar
│   │   ├── CountdownTimer.tsx    # Live event countdown
│   │   ├── EventCard.tsx         # Event grid card
│   │   ├── EventFilters.tsx      # Search + category filter bar
│   │   ├── NavLink.tsx           # Styled navigation link
│   │   ├── Navbar.tsx            # Top navigation bar
│   │   ├── NotificationBanner.tsx # Top announcement strip
│   │   ├── RegistrationModal.tsx # Event registration dialog
│   │   ├── StatCard.tsx          # KPI metric card
│   │   └── ui/                   # shadcn/ui primitives (40+ components)
│   │
│   └── pages/                    # Full-page route components
│       ├── Index.tsx             # Homepage / event listing
│       ├── Events.tsx            # All events with filters
│       ├── EventDetail.tsx       # Single event detail page
│       ├── StudentLogin.tsx      # Student login page
│       ├── StudentDashboard.tsx  # Student's registered events
│       ├── AdminLogin.tsx        # Admin login page
│       ├── AdminDashboard.tsx    # Admin overview dashboard
│       ├── EventAnalytics.tsx    # Full analytics dashboard
│       ├── CreateEvent.tsx       # Create new event form
│       ├── ManageEvents.tsx      # List/delete/manage events
│       ├── Participants.tsx      # Per-event participant list
│       └── NotFound.tsx          # 404 error page
│
└── backend/                      # Python Flask backend
    ├── app.py                    # Flask app factory + server entry
    ├── config.py                 # Environment configuration
    ├── requirements.txt          # Python dependencies
    ├── .env.example              # Environment variable template
    │
    ├── database/
    │   ├── db_connection.py      # MySQL connection + query executor
    │   └── schema.sql            # Database DDL + seed data
    │
    ├── routes/                   # Flask Blueprint route definitions
    │   ├── event_routes.py       # Event CRUD routes
    │   ├── registration_routes.py # Registration routes
    │   └── admin_routes.py       # Admin analytics + login routes
    │
    ├── controllers/              # Request handling + business logic
    │   ├── event_controller.py   # Event request handlers
    │   ├── registration_controller.py # Registration handlers
    │   └── admin_controller.py   # Analytics + admin handlers
    │
    ├── models/                   # Database query functions
    │   ├── event_model.py        # Events table queries
    │   ├── student_model.py      # Students table queries
    │   └── registration_model.py # Registrations table queries
    │
    └── utils/
        └── export_csv.py         # CSV file generation utility
```

---

## 4. File-by-File Explanation

### 4.1 Frontend Files

---

#### FILE: `src/main.tsx`

**Purpose:** The React application entry point. This is the first JavaScript file executed when the browser loads the app.

**What the code does:**
- Imports `ReactDOM` and the root `App` component
- Calls `ReactDOM.createRoot()` to mount the React tree into the `<div id="root">` element defined in `index.html`
- Imports global CSS from `index.css`

**Key Logic:**
React 18's `createRoot` API enables concurrent rendering features. The entire component tree (`<App />`) is nested inside `<React.StrictMode>` which activates additional development warnings and double-invokes certain lifecycle methods to help detect side effects.

---

#### FILE: `src/App.tsx`

**Purpose:** The application root — defines the complete routing structure, wraps the app in all providers, and renders the global UI shell.

**What the code does:**
- Creates a `QueryClient` instance for React Query (data fetching library)
- Wraps the app in `QueryClientProvider`, `TooltipProvider`, `AppProvider` (global state)
- Renders `<Navbar />` and `<NotificationBanner />` on every page
- Defines all route mappings using `react-router-dom` `<Routes>` and `<Route>`

**Route Table:**

| Path | Component | Access |
|---|---|---|
| `/` | `Index` | Public |
| `/events` | `Events` | Public |
| `/events/:id` | `EventDetail` | Public |
| `/dashboard` | `StudentDashboard` | Student |
| `/student/login` | `StudentLogin` | Public |
| `/admin/login` | `AdminLogin` | Public |
| `/admin` | `AdminDashboard` | Admin |
| `/admin/create` | `CreateEvent` | Admin |
| `/admin/manage` | `ManageEvents` | Admin |
| `/admin/participants/:id` | `Participants` | Admin |
| `/admin/analytics` | `EventAnalytics` | Admin |
| `*` | `NotFound` | Public |

**Key Logic:**
Route protection is handled inside each admin page component via `<AdminLayout>`, which reads `isAdminLoggedIn` from context and redirects to `/admin/login` if false.

---

#### FILE: `src/index.css`

**Purpose:** The global stylesheet. Defines CSS custom properties (design tokens), Tailwind base directives, and all custom utility classes used throughout the application.

**What the code does:**
- Declares CSS variables for the color system (`--primary`, `--background`, `--card`, `--success`, etc.) in `hsl()` format
- Defines reusable component classes: `.card-elevated`, `.stat-card`, `.glass-input`, `.btn-primary-brighten`
- Sets up smooth scrollbar, custom animations (`animate-fade-in-up`, `animate-slide-down`, `animate-pulse-soft`)
- Configures typography: system font stack with Inter for UI, Georgia for body copy via `.font-serif`

**Key CSS Variables:**

```css
--primary: 350 90% 35%;      /* Deep crimson/maroon */
--background: 0 0% 97%;      /* Off-white page background */
--card: 0 0% 100%;           /* Pure white card background */
--success: 152 56% 45%;      /* Green for positive states */
--destructive: 0 75% 45%;    /* Red for errors/full events */
```

---

#### FILE: `src/data/events.ts`

**Purpose:** Defines TypeScript interfaces for all data models and provides sample data used by the frontend demo mode.

**What the code does:**
- Exports the `Event` interface with all required fields (id, name, description, category, date, venue, capacity, registered, registrationDeadline, poster, createdAt)
- Exports the `Registration` interface (id, eventId, studentName, studentEmail, registeredAt)
- Exports `EVENT_CATEGORIES` array — the canonical list of valid event types
- Exports `SAMPLE_EVENTS` — six pre-populated events used to demonstrate the platform without a live database

**Key Logic:**
The `Event` interface mirrors the JSON shape returned by the Flask API, ensuring type safety. When backend integration is enabled, the same TypeScript interfaces validate API responses. The `registered` field is computed on the backend via SQL `COUNT()` but stored directly in the interface for frontend use.

---

#### FILE: `src/context/AppContext.tsx`

**Purpose:** The central state management system for the entire frontend application. It acts as a "store" that all components can read from and write to.

**What the code does:**
- Creates `AppContext` using React's `createContext`
- `AppProvider` component wraps the entire app and exposes all state and actions
- Manages: events list, registrations list, admin login status, current student, notification banner
- Exports the `useApp()` custom hook for convenient context consumption

**State Shape:**
```typescript
{
  events: Event[]              // All events (mutable by admin)
  registrations: Registration[] // All registrations (in-memory)
  isAdminLoggedIn: boolean     // Admin session flag
  currentStudent: Student | null // Logged-in student session
  notificationBanner: string | null // Top banner message
}
```

**Key Functions:**

| Function | What It Does |
|---|---|
| `addEvent(event)` | Prepends new event to state, fires notification banner |
| `updateEvent(id, updates)` | Finds event by ID and merges updates |
| `deleteEvent(id)` | Removes event and all its registrations |
| `registerForEvent(eventId, name, email)` | Validates + creates registration, increments `registered` count |
| `loginAdmin(email, password)` | Checks hardcoded credentials, sets `isAdminLoggedIn` |
| `loginStudent(name, email)` | Sets `currentStudent` object |
| `getEventRegistrations(eventId)` | Filters registrations array by eventId |

**Key Logic:**
All mutations use React's `useState` setter with functional updates (`prev => ...`) to prevent stale closure bugs. The `registerForEvent` function performs three validation checks: (1) duplicate registration check, (2) event existence check, (3) capacity check — mirroring the same validations in the Flask backend.

---

#### FILE: `src/components/Navbar.tsx`

**Purpose:** The persistent top navigation bar rendered on every page.

**What the code does:**
- Renders the EventVerse logo (SVG calendar icon + wordmark) as a home link
- Shows public navigation links (Home, Events) always
- Shows "Admin" link when `isAdminLoggedIn` is true
- Shows student dropdown with avatar, name, email, dashboard link, and sign-out when `currentStudent` is set
- Shows Student Login and Admin links when neither is logged in
- Implements a mobile hamburger menu with full mobile menu panel

**Key Logic:**
Uses `useLocation()` from react-router-dom to highlight the active navigation link. The student dropdown uses local `useState` for open/closed toggling. The navbar is `sticky top-0 z-50` with `backdrop-blur-xl` to create a frosted glass effect when scrolling.

---

#### FILE: `src/components/AdminLayout.tsx`

**Purpose:** A layout wrapper component that renders a persistent left sidebar and main content area for all admin pages.

**What the code does:**
- Checks `isAdminLoggedIn` from context — redirects to `/admin/login` if false (acts as a route guard)
- Renders a collapsible left sidebar (desktop: 224px fixed width, mobile: hidden)
- Sidebar contains grouped navigation links: Overview (Dashboard, Analytics) and Management (Events, Create Event)
- Bottom of sidebar shows live mini-stats (event count, registration count)
- On mobile, renders a bottom tab bar with icon + label for admin navigation

**Key Logic:**
The active sidebar link is detected by comparing `location.pathname` with each nav item's `to` path. The primary active link gets `bg-primary text-primary-foreground` styling with a right-pointing chevron indicator. The sidebar bottom stat panel reads directly from context to show live counts.

---

#### FILE: `src/components/EventCard.tsx`

**Purpose:** Displays a single event as a rich card in the events grid.

**What the code does:**
- Renders event poster image with hover zoom effect (CSS `group-hover:scale-110`)
- Overlays category badge, "Hot" badge (≤10 seats), or "Full" badge on the image
- Shows countdown timer via `<CountdownTimer>` component overlaid on the image
- Renders event name, description excerpt, date, and venue
- Shows capacity progress bar with dynamic color: green → amber (≤10 seats) → red (full)
- "Register Now" button links to the event detail page; disabled style if full

**CATEGORY_COLORS Map:**
Each category gets a distinct color scheme applied to the badge:

```typescript
Technology: "bg-blue-500/15 text-blue-700"
Cultural:   "bg-orange-500/15 text-orange-700"
Sports:     "bg-green-500/15 text-green-700"
Academic:   "bg-purple-500/15 text-purple-700"
Workshop:   "bg-yellow-500/15 text-yellow-700"
Hackathon:  "bg-primary/15 text-primary"
```

**Key Logic:**
The component is entirely props-driven — it receives a single `event: Event` prop and derives all display states from it. No API calls or side effects occur inside this component. The capacity bar width is calculated as `(registered / capacity) * 100` and clamped to a maximum of 100%.

---

#### FILE: `src/components/RegistrationModal.tsx`

**Purpose:** A modal dialog for event registration. Handles both logged-in and guest student flows.

**What the code does:**
- Renders as a full-screen overlay with backdrop blur when `open` prop is true
- If `currentStudent` is null (no student logged in): shows a "Login Required" gate with a link to `/student/login`
- If student is logged in: pre-fills name and email fields as read-only, shows confirmation UI
- On submit: calls `registerForEvent()` from context and displays success or error state

**Key Logic:**
The component uses local `useState` for the form result. It reads `currentStudent` from global context to determine login status. When a result is shown, clicking away (backdrop click) resets the modal to its initial state. The login-gating prevents anonymous registrations while keeping the modal reusable.

---

#### FILE: `src/components/StatCard.tsx`

**Purpose:** A reusable KPI (Key Performance Indicator) metric display card used in dashboards.

**What the code does:**
- Accepts: label, value, icon component, icon color classes, subtext, trend direction, trend value
- Renders an icon box, large metric value, label, and optional subtext
- Shows a trend badge (TrendingUp / TrendingDown / Minus) in green, red, or gray

**Key Logic:**
The icon component is passed as a prop (`icon: LucideIcon`) and rendered dynamically using `<Icon size={18} />`. A subtle background glow (`bg-primary/4 blur-2xl`) is positioned absolutely behind the card content to add visual depth without affecting layout.

---

#### FILE: `src/components/CapacityBar.tsx`

**Purpose:** A reusable progress bar specifically for event capacity display, used consistently across the analytics and management pages.

**What the code does:**
- Computes fill percentage: `Math.min(registered / capacity * 100, 100)`
- Applies three-tier color coding: green (normal) → amber (≥80%) → red (100%)
- Supports `size` prop (`"sm"` / `"md"`) for height variants
- `showNumbers` prop toggles the display of percentage and `registered/capacity` text

**Key Logic:**
The component is stateless and purely presentational. All values are computed from the `registered` and `capacity` props on each render. It is used in: `EventAnalytics.tsx`, `AdminDashboard.tsx`, `ManageEvents.tsx`, and `Participants.tsx`.

---

#### FILE: `src/components/EventFilters.tsx`

**Purpose:** The search and category filter UI used on the Events listing page.

**What the code does:**
- Renders a search text input with a Search icon prefix and clear (X) button suffix
- Renders a horizontal scrollable row of category filter chips, including "All Events"
- Emits filter values upward via `onSearchChange` and `onCategoryChange` callback props

**Key Logic:**
This is a controlled component — it holds no internal state. All values flow down from the parent page (Events or Index) via props. Filtering logic is performed in the parent using `useMemo` so re-computation only occurs when the events list or filter values change.

---

#### FILE: `src/components/CountdownTimer.tsx`

**Purpose:** A live countdown display showing time remaining until an event starts.

**What the code does:**
- Accepts a `targetDate` (ISO string) and a `variant` prop (`"overlay"` or `"inline"`)
- Uses `setInterval` to update the countdown every second
- Displays days, hours, minutes, and seconds remaining
- Shows "Event Started" when the target date is in the past

**Key Logic:**
`useEffect` sets up the interval and returns a cleanup function to prevent memory leaks. The timer calculates the difference between `Date.now()` and the target timestamp using arithmetic on milliseconds. The `overlay` variant uses dark/blur background for display on image cards.

---

#### FILE: `src/components/NotificationBanner.tsx`

**Purpose:** A dismissible announcement strip displayed at the very top of the page.

**What the code does:**
- Reads `notificationBanner` string from AppContext
- Returns null if banner is null (hidden)
- Renders a full-width crimson banner with the message and an X dismiss button
- Calls `dismissBanner()` from context when the X is clicked

**Key Logic:**
The banner message is automatically set when a new event is created via `addEvent()`. The dismissed state persists only for the current session (no localStorage).

---

#### FILE: `src/pages/Index.tsx` (Homepage)

**Purpose:** The landing page of EventVerse — the first thing users see.

**What the code does:**
- Renders a hero section with headline, stats row (total events, categories, registrations, upcoming events), and CTA buttons
- Renders featured event card (most recently added event)
- Shows the event grid with `<EventFilters>` for search/filter
- Includes a "How It Works" section explaining the three-step process
- Responsive: single-column mobile, multi-column desktop

**Key Logic:**
Uses `useMemo` to compute filtered events only when `events`, `search`, or `category` state changes — preventing unnecessary re-renders. Hero stats are derived directly from the events and registrations arrays in context.

---

#### FILE: `src/pages/Events.tsx`

**Purpose:** A dedicated full-event listing page with search and category filtering.

**What the code does:**
- Renders `<EventFilters>` for search and category
- Applies filters using `useMemo` on the events array
- Shows a grid of `<EventCard>` components
- Shows "No Events Found" empty state with a "Clear Filters" prompt

**Key Logic:**
Almost identical to Index.tsx's grid section but without the hero. Filter state (`search`, `category`) is managed locally inside this component.

---

#### FILE: `src/pages/EventDetail.tsx`

**Purpose:** A full-detail page for a single event.

**What the code does:**
- Reads `:id` param from the URL with `useParams()`
- Finds the event in context by ID; redirects to `/events` if not found
- Renders: hero image, title, status badges, countdown timer, venue + date info blocks
- Shows a share button, bookmark button, and capacity visualization
- Renders event description, a schedule/agenda section
- Includes a "Register Now" CTA that opens `<RegistrationModal>`

**Key Logic:**
The registration button's text and disabled state dynamically change based on capacity (`isFull`) and deadline (`isPastDeadline`). Clicking "Register Now" sets local state `modalOpen = true` which mounts the `<RegistrationModal>`.

---

#### FILE: `src/pages/StudentLogin.tsx`

**Purpose:** The student authentication page.

**What the code does:**
- Renders a login form with Name and Email fields (no password — matches the no-password Students table design)
- On submit: calls `loginStudent(name, email)` from context to set the current student session
- Redirects to `/dashboard` after successful login
- Shows informational note explaining that no registration/password is needed

**Key Logic:**
Student identity is established by name + email combination only. There is no password because the Students table has no password column — the system trusts the student to provide their correct email. In a production version, email verification would be added.

---

#### FILE: `src/pages/StudentDashboard.tsx`

**Purpose:** A personalized dashboard showing the currently logged-in student's registered events.

**What the code does:**
- If no student is logged in: shows an email lookup field allowing any student to find their registrations
- If logged in: shows a stats row (total registered, upcoming, attended), then a grid of event cards with status badges

**Key Logic:**
When logged in, the component filters `registrations` from context by `currentStudent.email`. When using email lookup (not logged in), it also filters by email. Each event card shows a "Upcoming," "Today," or "Attended" badge based on comparing `event.date` with the current date.

---

#### FILE: `src/pages/AdminLogin.tsx`

**Purpose:** The admin authentication form.

**What the code does:**
- Renders email and password inputs with leading icon decorators
- Password field has a show/hide toggle button
- On submit: calls `loginAdmin(email, password)` — returns true/false
- Shows loading spinner for 400ms to simulate async authentication
- Redirects to `/admin` on success; shows error message on failure

**Default Credentials:**
```
Email:    admin@eventverse.com
Password: admin123
```

---

#### FILE: `src/pages/AdminDashboard.tsx`

**Purpose:** The main admin overview page — a premium analytics dashboard.

**What the code does:**
- Renders inside `<AdminLayout>` (sidebar included)
- Four KPI StatCards: Total Events, Registrations, Avg. Fill Rate, Top Event
- Quick action buttons: Create Event, Manage, Analytics
- Bar chart showing registrations per event
- Doughnut chart showing event distribution by category
- Capacity utilisation progress bars (sorted by fill rate)
- Recent registrations feed with student avatars
- Events summary table with mini progress bars

**Key Logic:**
Both charts use Chart.js via `react-chartjs-2`. The doughnut chart's centre stat is positioned absolutely using CSS (`absolute inset-0 flex items-center justify-center`). Recent registrations are sorted by `registeredAt` date in descending order and limited to 5.

---

#### FILE: `src/pages/EventAnalytics.tsx`

**Purpose:** A dedicated full analytics dashboard — the most data-rich page in the application.

**What the code does:**
- Renders inside `<AdminLayout>` (sidebar included)
- Four KPI cards: Events, Registrations, Avg Fill Rate, Most Popular
- Bar chart: Registrations vs Capacity per event (side-by-side)
- Line chart: Cumulative registrations over time (based on event creation dates)
- Two Pie charts: Events by Category, and Registrations by Category
- Full capacity utilisation section with sorted progress bars (all events)
- Per-event breakdown cards ranked by popularity with image headers
- Upcoming events table with venue, date countdown, and capacity

**Key Logic:**
The line chart computes cumulative data by sorting events by `createdAt` date and accumulating `registered` counts. This approximates "registrations over time" without requiring a time-series database table. All four Chart.js chart types (Bar, Line, Pie, Doughnut) are registered via `ChartJS.register()` at the top of the file.

---

#### FILE: `src/pages/CreateEvent.tsx`

**Purpose:** Admin form for creating a new event.

**What the code does:**
- Renders inside `<AdminLayout>`
- Two-column form grid (date/venue, capacity/deadline/category)
- Image URL field with live preview thumbnail
- On submit: calls `addEvent()` from context
- Shows a success animation (green check circle) for 2.2 seconds, then navigates to `/admin`

**Key Logic:**
The form uses React controlled inputs with a single `form` state object and an `update(key, value)` helper function that merges changes. No third-party form library is used; validation is minimal (HTML5 `required` attributes).

---

#### FILE: `src/pages/ManageEvents.tsx`

**Purpose:** Admin event management table — list, delete, and navigate to all events.

**What the code does:**
- Renders inside `<AdminLayout>`
- Lists all events with poster thumbnail, name, category, date, fill rate progress bar
- Shows AlertTriangle badge for near-full events (≥80%), "FULL" badge for 100%
- Eye icon → event public page, Users icon → participants, Edit icon → placeholder, Trash icon → delete
- Delete requires a two-step confirmation (click trash → confirm/cancel buttons appear inline)

**Key Logic:**
The confirm-delete UX uses local `useState<string | null>` to track which event has a pending delete. When the user clicks "Confirm", `deleteEvent(event.id)` is called from context and `confirmDelete` is reset to null.

---

#### FILE: `src/pages/Participants.tsx`

**Purpose:** Shows all participants registered for a specific event and allows CSV export.

**What the code does:**
- Reads `:id` from URL params, looks up event from context
- Renders event hero image, name, and three stat boxes (Registered, Seats Left, Fill Rate)
- Full participant table: index, avatar initials, name, email, registration date
- "Export CSV" button triggers browser download of a CSV file

**Key Logic:**
CSV export is done client-side: the component generates a CSV string from the registrations array and creates a Blob URL using `URL.createObjectURL()`. A temporary `<a>` tag is programmatically clicked to trigger the download, then the URL is revoked.

---

### 4.2 Backend Files

---

#### FILE: `backend/app.py`

**Purpose:** The Flask application factory and server entry point.

**What the code does:**
- `create_app()` function instantiates the Flask app, sets config, enables CORS, and registers blueprints
- CORS is configured to allow requests only from `localhost:5173` and `localhost:3000` (React dev servers)
- Three blueprints registered under the `/api` URL prefix: `event_bp`, `registration_bp`, `admin_bp`
- Defines `/api/health` endpoint for uptime checks
- `if __name__ == "__main__":` block prints all available endpoints and starts the dev server

**Key Logic:**
The factory pattern (`create_app()`) makes the app testable — tests can call `create_app()` to get a fresh instance without global state contamination. CORS restriction to specific origins is a security measure preventing other websites from making API calls.

---

#### FILE: `backend/config.py`

**Purpose:** Centralized configuration management using environment variables.

**What the code does:**
- Loads `.env` file using `python-dotenv`'s `load_dotenv()`
- `Config` class exposes all settings as class-level attributes with default fallback values
- Covers: DB connection details (host, port, user, password, name), Flask secret key, debug mode, admin credentials

**Environment Variables:**

| Variable | Default | Purpose |
|---|---|---|
| `DB_HOST` | localhost | MySQL server host |
| `DB_PORT` | 3306 | MySQL server port |
| `DB_USER` | root | MySQL username |
| `DB_PASSWORD` | (empty) | MySQL password |
| `DB_NAME` | eventverse_db | Target database name |
| `SECRET_KEY` | dev-secret-key | Flask session signing key |
| `FLASK_DEBUG` | True | Enable/disable debug mode |
| `ADMIN_EMAIL` | admin@eventverse.com | Admin login email |
| `ADMIN_PASSWORD` | admin123 | Admin login password |

---

#### FILE: `backend/database/db_connection.py`

**Purpose:** The database connection layer — provides a reusable query execution interface.

**What the code does:**
- `get_connection()`: creates a new `mysql.connector` connection from `Config` values with `autocommit=False`
- `execute_query(query, params, fetch)`: the single unified function for all database operations
  - `fetch="all"` → returns list of dictionaries
  - `fetch="one"` → returns single dictionary or None
  - `fetch=None` → for INSERT/UPDATE/DELETE, returns `cursor.lastrowid`
- Handles transactions: commits on success, rolls back on exception
- Always closes cursor and connection in the `finally` block

**Key Logic:**
Using `dictionary=True` in the cursor means MySQL column names become dictionary keys — so `SELECT event_name AS name` can be accessed as `result["name"]`. The `params` tuple approach (parameterized queries) prevents SQL injection.

---

#### FILE: `backend/database/schema.sql`

**Purpose:** The complete database definition script. Run this once to set up the database.

**What the code does:**
- Creates `eventverse_db` database with `utf8mb4` charset (supports emoji and special characters)
- Creates the three core tables: `events`, `students`, `registrations`
- Defines all indexes for query performance
- Sets up foreign key constraints with `ON DELETE CASCADE`
- Inserts sample seed data for 6 events, 3 students, and 4 registrations

---

#### FILE: `backend/routes/event_routes.py`

**Purpose:** Defines URL-to-handler mappings for all event-related endpoints.

**What the code does:**
Creates a Flask `Blueprint` named `events` and maps 5 routes to controller functions:

| Method | URL | Controller Function |
|---|---|---|
| GET | `/api/events` | `list_events` |
| GET | `/api/events/<int:event_id>` | `get_event` |
| POST | `/api/events` | `add_event` |
| PUT | `/api/events/<int:event_id>` | `edit_event` |
| DELETE | `/api/events/<int:event_id>` | `remove_event` |

---

#### FILE: `backend/routes/registration_routes.py`

**Purpose:** Defines routes for student registration and participant management.

| Method | URL | Controller Function |
|---|---|---|
| POST | `/api/register` | `register_student` |
| GET | `/api/events/<id>/participants` | `list_participants` |
| GET | `/api/events/<id>/export` | `export_participants_csv` |
| GET | `/api/student/registrations` | `student_dashboard` |

---

#### FILE: `backend/routes/admin_routes.py`

**Purpose:** Defines admin-only routes.

| Method | URL | Controller Function |
|---|---|---|
| GET | `/api/admin/analytics` | `get_analytics` |
| POST | `/api/admin/login` | `admin_login` |

---

#### FILE: `backend/controllers/event_controller.py`

**Purpose:** Request handlers for event operations — validates input, calls model functions, returns JSON.

**Key Functions:**

`_serialize_event(event)` — internal helper that converts Python `datetime` objects to ISO string format for JSON serialization. Also computes `seats_remaining` field.

`list_events()` — GET /api/events. Calls `get_all_events()` model function and returns serialized list.

`get_event(event_id)` — GET /api/events/:id. Returns 404 if event not found.

`add_event()` — POST /api/events. Validates required fields, creates event, returns the newly created event object.

`edit_event(event_id)` — PUT /api/events/:id. Checks event existence, calls `update_event()`, returns updated record.

`remove_event(event_id)` — DELETE /api/events/:id. Checks event existence, calls `delete_event()`, returns success message.

---

#### FILE: `backend/controllers/registration_controller.py`

**Purpose:** Handles student registration with multi-step validation.

**`register_student()` — the most complex controller function:**

```
Step 1: Validate required fields (eventId, studentName, studentEmail)
Step 2: Confirm event exists in database
Step 3: Check if registration deadline has passed (datetime comparison)
Step 4: Check if event is at capacity (registered >= capacity)
Step 5: get_or_create_student() — upsert student by email
Step 6: check_duplicate() — prevent double-registration
Step 7: create_registration() — insert registration record
Step 8: Return success JSON
```

`list_participants(event_id)` — Returns all registered students for an event with their registration timestamps.

`student_dashboard()` — Accepts `?email=` query param and returns all events a student is registered for.

---

#### FILE: `backend/controllers/admin_controller.py`

**Purpose:** Admin-specific handlers for analytics and authentication.

**`get_analytics()`** — Aggregates data from all events and registrations to return:
- Total events count
- Total participants count
- Upcoming events count
- Most popular event (by registration count)
- Category distribution dictionary
- Per-event fill percentage array

**`admin_login()`** — Compares submitted email/password against `Config.ADMIN_EMAIL` / `Config.ADMIN_PASSWORD`. Returns `{"success": true}` on match, `{"success": false}` with 401 on mismatch. No JWT tokens or sessions — stateless authentication suitable for demo purposes.

---

#### FILE: `backend/models/event_model.py`

**Purpose:** All SQL queries related to the events table.

**`get_all_events()`** — Uses a LEFT JOIN with registrations to count registrations per event in a single query. Ordered by `created_at DESC` (newest first).

```sql
SELECT e.*, COUNT(r.registration_id) AS registered
FROM events e
LEFT JOIN registrations r ON e.event_id = r.event_id
GROUP BY e.event_id
ORDER BY e.created_at DESC
```

**`create_event(data)`** — Parameterized INSERT returning the new `event_id` via `lastrowid`.

**`update_event(event_id, data)`** — Dynamically builds a `SET` clause from only the fields present in the `data` dict, preventing unnecessary column updates.

**`delete_event(event_id)`** — Explicitly deletes registrations first, then the event (even though CASCADE would handle it — this is explicit for clarity).

---

#### FILE: `backend/models/student_model.py`

**Purpose:** Student upsert and registration lookup queries.

**`get_or_create_student(name, email)`** — First attempts a SELECT by email. If found, returns existing `student_id`. If not found, INSERTs a new student and returns the new `student_id`. This "upsert" pattern ensures students are never duplicated in the database.

**`get_student_registrations(email)`** — Complex JOIN query across three tables to return all events a student has registered for, including the registration date.

---

#### FILE: `backend/models/registration_model.py`

**Purpose:** Registration CRUD and duplicate detection.

**`check_duplicate(student_id, event_id)`** — SELECT query checking for existing registration. Returns boolean. This enforces the business rule that a student can only register once per event.

**`get_all_registrations()`** — Full JOIN across registrations, students, and events — used for admin analytics to provide a denormalized view of all registration data.

---

#### FILE: `backend/utils/export_csv.py`

**Purpose:** Generates and streams a CSV file download for event participants.

**What the code does:**
- Calls `get_event_participants()` to fetch all registrants
- Builds a list of dictionaries with "Student Name", "Student Email", "Registration Date" keys
- Uses `pandas` `DataFrame.to_csv()` to generate CSV content
- Writes to an in-memory `io.BytesIO` buffer (no temp file created)
- Uses Flask's `send_file()` to stream the buffer as a downloadable attachment

**Key Logic:**
The filename is sanitized by replacing spaces with underscores in the event name. The BytesIO approach is memory-efficient for moderate participant counts.

---

## 5. Backend Deep Dive

### Flask Application Structure

The backend uses the **Application Factory Pattern** combined with **Flask Blueprints** to organize code:

```
app.py (factory)
    │
    ├── event_bp (Blueprint)
    │       └── event_routes.py ──► event_controller.py ──► event_model.py
    │
    ├── registration_bp (Blueprint)
    │       └── registration_routes.py ──► registration_controller.py ──► student_model.py
    │                                                                  └──► registration_model.py
    │
    └── admin_bp (Blueprint)
            └── admin_routes.py ──► admin_controller.py ──► event_model.py
                                                        └──► registration_model.py
```

### Complete API Reference

**Events**

```
GET    /api/events                  → List all events (with registration count)
GET    /api/events/<id>             → Get single event (with seats_remaining)
POST   /api/events                  → Create event
PUT    /api/events/<id>             → Update event fields
DELETE /api/events/<id>             → Delete event and registrations
```

**Registrations**

```
POST   /api/register                → Register student for event
GET    /api/events/<id>/participants → List registered students
GET    /api/events/<id>/export      → Download participants as CSV
GET    /api/student/registrations?email=... → Student's registered events
```

**Admin**

```
POST   /api/admin/login             → Authenticate admin
GET    /api/admin/analytics         → Platform analytics summary
```

**System**

```
GET    /api/health                  → Health check
```

### Request/Response Examples

**POST /api/register**
```json
// Request
{
  "eventId": 1,
  "studentName": "Alice Johnson",
  "studentEmail": "alice@college.edu"
}

// Success response (201)
{
  "success": true,
  "message": "You are registered for AI Workshop 2026"
}

// Error response (400/409)
{
  "success": false,
  "message": "Event is at full capacity"
}
```

**GET /api/events/1**
```json
{
  "id": 1,
  "name": "AI Workshop 2026",
  "category": "Workshop",
  "date": "2026-03-25T10:00:00",
  "venue": "Seminar Hall A",
  "capacity": 50,
  "registered": 38,
  "seats_remaining": 12,
  "registrationDeadline": "2026-03-22T23:59:59",
  "poster": "https://...",
  "createdAt": "2026-03-01T00:00:00"
}
```

---

## 6. Database Schema

### Entity-Relationship Overview

```
students                registrations              events
─────────────           ──────────────             ──────────────
student_id (PK) ◄──── student_id (FK)          ►── event_id (FK)
student_name          registration_id (PK)     │   event_id (PK)
student_email         event_id (FK) ───────────┘   event_name
created_at            registration_date             event_description
                                                    event_date
                                                    event_venue
                                                    event_category
                                                    max_participants
                                                    poster_url
                                                    registration_deadline
                                                    created_at
```

### Table: `events`

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `event_id` | INT | PK, AUTO_INCREMENT | Unique event identifier |
| `event_name` | VARCHAR(255) | NOT NULL | Display name of the event |
| `event_description` | TEXT | NOT NULL | Full description for detail page |
| `event_date` | DATETIME | NOT NULL | When the event takes place |
| `event_venue` | VARCHAR(255) | NOT NULL | Physical location of the event |
| `event_category` | VARCHAR(100) | NOT NULL | Category (Workshop, Hackathon, etc.) |
| `max_participants` | INT | NOT NULL, DEFAULT 50 | Maximum registration capacity |
| `poster_url` | VARCHAR(512) | DEFAULT '' | URL of event poster image |
| `registration_deadline` | DATETIME | NOT NULL | Cutoff for new registrations |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | When the event record was created |

**Indexes:** `idx_event_category` on `event_category`, `idx_event_date` on `event_date` — for fast filtering.

### Table: `students`

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `student_id` | INT | PK, AUTO_INCREMENT | Unique student identifier |
| `student_name` | VARCHAR(255) | NOT NULL | Student's full name |
| `student_email` | VARCHAR(255) | NOT NULL, UNIQUE | Email used as the unique identity key |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | When the student first used the platform |

**Indexes:** `idx_student_email` on `student_email` — for fast upsert lookups.
**Business Rule:** Email is UNIQUE — one account per email address. The `get_or_create_student` pattern uses this to safely upsert students.

### Table: `registrations`

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `registration_id` | INT | PK, AUTO_INCREMENT | Unique registration record identifier |
| `student_id` | INT | FK → students, NOT NULL | Which student registered |
| `event_id` | INT | FK → events, NOT NULL | Which event they registered for |
| `registration_date` | DATETIME | DEFAULT CURRENT_TIMESTAMP | When registration occurred |

**Constraints:**
- `UNIQUE KEY uq_student_event (student_id, event_id)` — database-level enforcement of one registration per student per event. Even if application-level checks are bypassed, the database rejects duplicates.
- `ON DELETE CASCADE` on both foreign keys — deleting a student or event automatically cleans up their registrations.

**Indexes:** `idx_reg_event`, `idx_reg_student` — for fast JOIN queries.

### Key Relationship Rules

1. **One student ↔ Many registrations** — A student can register for multiple events
2. **One event ↔ Many registrations** — An event can have many registered students
3. **One student ↔ One event** — A student cannot register for the same event twice (enforced at both application and database level)
4. **Capacity is not stored in registrations** — It lives on the `events.max_participants` column; the current fill count is computed on-the-fly via `COUNT(registration_id)`

---

## 7. Feature Explanations

### Student Features

#### View Events

1. Browser loads `/events` or `/` (homepage)
2. `Index.tsx` or `Events.tsx` reads `events` array from `AppContext`
3. `useMemo` applies search and category filters to the events array
4. Filtered array is mapped to `<EventCard>` components
5. Each card shows poster, name, category badge, countdown, capacity bar, and Register button

#### View Event Details

1. Student clicks "Register Now" or an event card
2. Router navigates to `/events/:id`
3. `EventDetail.tsx` reads `:id` from `useParams()` and finds the event in context
4. Renders full detail layout: hero image, description, venue/date info, countdown, capacity bar
5. "Register Now" button opens `<RegistrationModal>`

#### Register for Event

1. Student clicks "Register Now" on the detail page
2. `<RegistrationModal>` opens — checks `currentStudent` in context
3. If no student logged in: shows login gate with link to `/student/login`
4. If logged in: shows pre-filled form with name + email (read-only)
5. Student confirms → `registerForEvent(eventId, name, email)` called
6. Context function validates (no duplicate, event exists, has capacity)
7. On success: new `Registration` object added to state, event's `registered` count incremented
8. Modal shows success animation with "You're In! 🎉" message

#### Student Login

1. Student navigates to `/student/login`
2. Fills in name and email form
3. On submit: `loginStudent(name, email)` called from context
4. `currentStudent` state set to `{ name, email }`
5. Redirects to `/dashboard`

#### View Registered Events

1. Student navigates to `/dashboard`
2. `StudentDashboard.tsx` reads `registrations` and `currentStudent` from context
3. Filters registrations by `currentStudent.email`
4. Finds matching events from the `events` array
5. Renders event cards with status badges (Upcoming / Today / Attended based on date comparison)

---

### Admin Features

#### Admin Login

1. Admin navigates to `/admin/login`
2. Fills email and password, clicks Login
3. Button shows loading spinner for 400ms
4. `loginAdmin(email, password)` called — checks against hardcoded credentials
5. If correct: `isAdminLoggedIn` set to `true`, redirect to `/admin`
6. If wrong: error message displayed inline

#### Create Event

1. Admin navigates to `/admin/create` (or clicks "Create Event")
2. Fills form: name, description, date, venue, capacity, deadline, category, poster URL
3. Live image preview shown as URL is typed
4. On submit: `addEvent(eventData)` called — generates ID and timestamp
5. New event prepended to events array in context
6. Notification banner fires: "New Event Added: [name]"
7. Success animation shown, then redirect to `/admin`

#### Update Event

Currently the Edit button in `ManageEvents.tsx` is a placeholder (UI exists, handler not implemented). In backend integration, this would call `PUT /api/events/:id` with the updated fields.

#### Delete Event

1. Admin clicks trash icon on an event in `ManageEvents.tsx`
2. Confirm/Cancel buttons appear inline (two-step confirmation UX)
3. Admin clicks "Confirm"
4. `deleteEvent(id)` called — removes event from events array and all matching registrations

#### View Participants

1. Admin navigates to `/admin/participants/:id`
2. `Participants.tsx` reads event from context by URL param
3. `getEventRegistrations(eventId)` returns filtered registrations
4. Renders event hero card with stats and full participant table

#### Export Participants CSV

1. Admin clicks "Export CSV" on the Participants page
2. JavaScript generates CSV string from registrations array
3. Blob is created with `text/csv` MIME type
4. Temporary link clicked programmatically to trigger browser download
5. File downloaded as `[EventName]-participants.csv`

#### Analytics Dashboard

1. Admin navigates to `/admin/analytics`
2. `EventAnalytics.tsx` computes all metrics from context state
3. Chart.js renders: Bar chart (registrations vs capacity), Line chart (cumulative over time), two Pie charts (by category)
4. Progress bars show per-event capacity utilisation sorted by fill rate
5. Per-event breakdown cards ranked by registration count
6. Upcoming events table with days-until countdown

---

## 8. Code Flow Walkthroughs

### Flow 1: User Opens Homepage

```
1. Browser navigates to http://localhost:5173/
2. Vite serves index.html
3. main.tsx: ReactDOM.createRoot().render(<App />)
4. App.tsx renders:
   a. <QueryClientProvider>
   b. <AppProvider>  → initializes state with SAMPLE_EVENTS
   c. <NotificationBanner /> → renders "🔥 New Event Added: Hackathon 2026..."
   d. <Navbar /> → reads isAdminLoggedIn=false, currentStudent=null
   e. <Routes> matches path "/" → renders <Index />
5. Index.tsx:
   a. const { events, registrations } = useApp()  → gets 6 events
   b. useMemo filters with search="" category="" → all 6 events
   c. Renders hero section with animated stats
   d. Renders EventFilters (empty state)
   e. Maps events to <EventCard> components
6. EventCard renders for each event:
   a. Reads capacity/registered → computes seatsLeft, fill%, isFull
   b. Renders poster image with lazy loading
   c. Renders CountdownTimer (setInterval every 1s)
   d. Renders capacity bar
```

### Flow 2: User Views Event Detail

```
1. User clicks "Register Now" on EventCard for event id="2"
2. react-router Link navigates to /events/2
3. App.tsx Routes matches /events/:id → renders <EventDetail />
4. EventDetail.tsx:
   a. const { id } = useParams()  → id = "2"
   b. const event = events.find(e => e.id === "2")
   c. if (!event) → Navigate to /events (not this case)
   d. Computes: isPastDeadline, isFull, capacityPercent
   e. Renders full hero, description, venue, countdown
   f. Render: <RegistrationModal open={modalOpen} event={event} />
              (modalOpen = false initially)
5. User clicks "Register Now" button
6. setModalOpen(true) → RegistrationModal renders
7. Modal checks: currentStudent === null → shows login gate
```

### Flow 3: User Registers for an Event

```
1. User is on /student/login (logged in as "Bob", "bob@college.edu")
2. Navigates to /events/1 → EventDetail
3. Clicks "Register Now" → modal opens
4. Modal reads currentStudent = {name:"Bob", email:"bob@college.edu"}
5. Shows pre-filled form (read-only fields)
6. User clicks "Confirm Registration"
7. handleSubmit() called:
   a. e.preventDefault()
   b. registerForEvent("1", "Bob", "bob@college.edu") called
8. registerForEvent() in AppContext:
   a. existing = registrations.find(r => r.eventId==="1" && r.studentEmail==="bob@college.edu")
      → undefined (first registration)
   b. event = events.find(e => e.id === "1") → found
   c. event.registered (38) < event.capacity (50) → ok
   d. new Registration: { id: "timestamp", eventId:"1", studentName:"Bob",
                          studentEmail:"bob@college.edu", registeredAt: "..." }
   e. setRegistrations(prev => [...prev, reg]) → adds to list
   f. setEvents(prev => prev.map(e => e.id==="1" ? {...e, registered: 39} : e))
      → increments registered count
   g. return { success: true, message: "You are registered for AI Workshop 2026" }
9. Modal receives success result → shows "You're In! 🎉" screen
10. EventCard for event 1 now shows "39/50" on next render
```

### Flow 4: Admin Creates an Event

```
1. Admin logged in (isAdminLoggedIn = true)
2. Navigates to /admin/create
3. AdminLayout renders: sidebar nav + CreateEvent page content
4. Admin fills form:
   name: "Python Bootcamp"
   description: "..."
   date: "2026-05-10T10:00"
   venue: "Lab 4"
   capacity: 30
   deadline: "2026-05-08T23:59"
   category: "Technology"
   poster: "https://images.unsplash.com/..."
5. Clicks "Publish Event"
6. handleSubmit(e):
   a. e.preventDefault()
   b. addEvent({ name, description, date, venue, capacity,
                 registrationDeadline, category, poster }) called
7. addEvent() in AppContext:
   a. const newEvent = {
        ...data,
        id: "1746870000000",  (Date.now())
        createdAt: "2026-05-10T...",
        registered: 0
      }
   b. setEvents(prev => [newEvent, ...prev])  → prepended to list
   c. setNotificationBanner("🔥 New Event Added: Python Bootcamp — Register now!")
8. setSuccess(true) → renders success animation
9. setTimeout 2200ms → navigate("/admin")
10. AdminDashboard now shows 7 events in stats and charts
11. NotificationBanner shows new announcement across all pages
```

---

## 9. Deployment Guide

### Prerequisites

- Node.js ≥ 18 and npm ≥ 9 (or Bun)
- Python ≥ 3.10 and pip
- MySQL 8.0 server
- Git

### Local Development Setup

**Step 1: Clone the repository**
```bash
git clone https://github.com/your-org/eventverse.git
cd eventverse
```

**Step 2: Set up the database**
```bash
mysql -u root -p < backend/database/schema.sql
```

**Step 3: Configure backend environment**
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials:
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=eventverse_db
# SECRET_KEY=your-random-secret-key
# ADMIN_EMAIL=admin@eventverse.com
# ADMIN_PASSWORD=admin123
```

**Step 4: Install Python dependencies and run backend**
```bash
cd backend
pip install -r requirements.txt
python app.py
# API running at: http://localhost:5000
```

**Step 5: Install Node dependencies and run frontend**
```bash
cd ..  # back to project root
npm install
npm run dev
# Frontend running at: http://localhost:5173
```

### Python Dependencies (`requirements.txt`)

```
Flask==3.0.2
Flask-CORS==4.0.0
mysql-connector-python==8.3.0
python-dotenv==1.0.1
pandas==2.2.1
```

### Production Deployment

**Option A: VPS / Cloud VM (Ubuntu)**

Frontend build:
```bash
npm run build          # outputs to /dist
# Serve with Nginx pointing to /dist/index.html
```

Backend with Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
# Use Nginx as reverse proxy to gunicorn
```

Sample Nginx configuration:
```nginx
server {
    listen 80;
    server_name eventverse.yourdomain.com;

    # Frontend (static files)
    location / {
        root /var/www/eventverse/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Option B: Platform-as-a-Service**

| Layer | Service | Notes |
|---|---|---|
| Frontend | Vercel / Netlify | Connect GitHub repo, set build command `npm run build` |
| Backend | Railway / Render | Set Python environment, start command `python app.py` |
| Database | PlanetScale / Railway MySQL | Update `.env` with production connection string |

**Environment Variables for Production**

```
FLASK_DEBUG=False
SECRET_KEY=<cryptographically-random-64-char-string>
DB_HOST=<production-mysql-host>
DB_PASSWORD=<strong-production-password>
ADMIN_PASSWORD=<strong-admin-password>
```

### Important Production Considerations

1. **Authentication:** Replace the hardcoded admin credentials with a proper JWT-based authentication system. Never store plaintext passwords — use `bcrypt` for password hashing.

2. **CORS:** Update `CORS` origins in `app.py` to your production frontend domain only.

3. **Rate Limiting:** Add Flask-Limiter to prevent API abuse on registration endpoints.

4. **Logging:** Replace `print()` statements with Python's `logging` module, and configure log rotation.

5. **Frontend API Integration:** Replace all direct Context state mutations in `AppContext.tsx` with `fetch()` calls to the Flask API. Update `VITE_API_URL` environment variable for different environments.

6. **Database Connection Pooling:** Replace the per-query `get_connection()` pattern with SQLAlchemy's connection pool for better performance under load.

---

*This documentation covers EventVerse v2.0 with the analytics-enhanced UI. For contribution guidelines and changelog, see `README.md`.*
