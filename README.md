<div align="center">
  <img src="public/logo.svg" alt="EventVerse Logo" width="200" />
  
  # EventVerse
  
  **A modern campus event management and registration platform**
  
  [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
  [![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
  [![Flask](https://img.shields.io/badge/Flask-3-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com)
  [![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](https://mysql.com)

</div>

---

## Overview

EventVerse is a full-stack campus event management platform that enables students to discover, register for, and track campus events — while giving administrators a comprehensive dashboard to create, manage, and analyze events in real time.

Built with a React/TypeScript frontend and a Flask/MySQL backend, EventVerse is designed to be fast, modern, and extensible.

---

## Features

### 🎓 Student Features
- **Browse Events** — Discover upcoming events with search and category filtering
- **Event Details** — View full event info, schedule, rewards, and countdown timer
- **Student Portal** — Personalized login using name + institutional email
- **Register for Events** — One-click registration with real-time seat tracking
- **Dashboard** — View all registered events with status (Upcoming / Ongoing / Completed)

### 🛠️ Admin Features
- **Secure Admin Login** — Protected admin portal with credential authentication
- **Create Events** — Full event creation form with image preview
- **Manage Events** — Edit, view, and delete events with fill rate indicators
- **Participants** — View per-event participant lists with avatars
- **Export CSV** — Download participant lists as `.csv` files
- **Analytics Dashboard** — Bar charts, doughnut charts, fill rate trends, and key metrics

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite 5, Tailwind CSS, shadcn/ui |
| **State** | React Context API, TanStack Query |
| **Charts** | Chart.js, react-chartjs-2 |
| **Routing** | React Router v6 |
| **Backend** | Flask (Python), Flask-CORS |
| **Database** | MySQL 8 |
| **Icons** | Lucide React |

---

## Architecture

```
EventVerse/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventFilters.tsx
│   │   │   ├── RegistrationModal.tsx
│   │   │   ├── CountdownTimer.tsx
│   │   │   └── ui/           # shadcn/ui primitives
│   │   ├── context/
│   │   │   └── AppContext.tsx # Global state + student/admin auth
│   │   ├── pages/
│   │   │   ├── Index.tsx
│   │   │   ├── Events.tsx
│   │   │   ├── EventDetail.tsx
│   │   │   ├── StudentLogin.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── CreateEvent.tsx
│   │   │   ├── ManageEvents.tsx
│   │   │   ├── Participants.tsx
│   │   │   └── EventAnalytics.tsx
│   │   ├── data/
│   │   │   └── events.ts     # Types + sample data
│   │   └── index.css         # Global styles + design tokens
│   └── public/
│       ├── logo.svg
│       └── favicon.svg
│
└── backend/                  # Flask API
    ├── app.py                # Application entry point
    ├── config.py             # Configuration
    ├── controllers/          # Business logic
    ├── models/               # Database models
    ├── routes/               # API route definitions
    ├── database/
    │   ├── db_connection.py
    │   └── schema.sql        # Database schema
    └── utils/
        └── export_csv.py
```

---

## Database Schema

```sql
-- Students table
CREATE TABLE Students (
  student_id    INT PRIMARY KEY AUTO_INCREMENT,
  student_name  VARCHAR(255) NOT NULL,
  student_email VARCHAR(255) UNIQUE NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE Events (
  id                   INT PRIMARY KEY AUTO_INCREMENT,
  name                 VARCHAR(255) NOT NULL,
  description          TEXT,
  category             VARCHAR(100),
  date                 DATETIME NOT NULL,
  venue                VARCHAR(255),
  capacity             INT NOT NULL,
  registrationDeadline DATETIME,
  poster               TEXT,
  createdAt            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations table
CREATE TABLE Registrations (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  student_id    INT REFERENCES Students(student_id),
  event_id      INT REFERENCES Events(id),
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Installation Guide

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- MySQL 8+

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/eventverse.git
cd eventverse
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate       # macOS/Linux
# or: venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
# Edit .env with your database credentials

# Set up the database
mysql -u root -p < database/schema.sql

# Start the backend
python app.py
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
# From project root
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:8080`

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=eventverse
SECRET_KEY=your-secret-key-here
```

---

## API Endpoints

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | List all events |
| `GET` | `/api/events/:id` | Get event details |
| `POST` | `/api/events` | Create new event (admin) |
| `PUT` | `/api/events/:id` | Update event (admin) |
| `DELETE` | `/api/events/:id` | Delete event (admin) |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/students` | List all students |
| `POST` | `/api/students` | Register/create student |
| `GET` | `/api/students/:id` | Get student details |

### Registrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/register` | Register for an event |
| `GET` | `/api/registrations/:event_id` | Get event registrations |
| `GET` | `/api/registrations/export/:event_id` | Export as CSV |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/login` | Admin authentication |

---

## Deployment Guide

### Frontend (Vercel / Netlify)

```bash
npm run build
# Deploy the `dist/` folder
```

For Vercel, add a `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Backend (Railway / Render)

1. Set environment variables in your deployment dashboard
2. Use `gunicorn` as the production WSGI server:

```bash
pip install gunicorn
gunicorn app:app --bind 0.0.0.0:$PORT
```

Add a `Procfile`:
```
web: gunicorn app:app
```

### Database (PlanetScale / Railway MySQL)

Update `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in your production environment variables.

---

## Admin Access

For demo/development purposes:

```
Email:    admin@eventverse.com
Password: admin123
```

> ⚠️ Change these credentials before deploying to production.

---

## Contribution Guide

We welcome contributions! Here's how to get started:

1. **Fork** the repository on GitHub
2. **Clone** your fork: `git clone https://github.com/your-fork/eventverse.git`
3. **Create a branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes** and commit: `git commit -m "feat: add your feature"`
5. **Push** to your branch: `git push origin feature/your-feature-name`
6. Open a **Pull Request** with a clear description of your changes

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation update
- `style:` — UI/styling changes
- `refactor:` — Code refactoring
- `chore:` — Build/config changes

---

## License

MIT © EventVerse. Feel free to use this project for educational and campus purposes.

---

<div align="center">
  Built with ❤️ for campus communities
</div>


# EventVerse – Batch 1 Feature Release
### MMCOE Campus Event Management Platform

---

## ✨ Batch 1 Features

| Feature | Description |
|---|---|
| **Team Registration on Dashboard** | Student dashboard shows team registrations with event details, lead name, date & venue |
| **Student Analytics Dashboard** | Charts & progress bars for events registered, attended, feedback submitted, volunteering, upcoming events |
| **Volunteering Feature** | Admin enables volunteering per event; students can register OR volunteer; dashboard shows volunteer status; cancellation supported |
| **Email & Notification System** | Auto confirmation emails on register/volunteer; 1-day reminder; post-event follow-up; in-app notification bell & dashboard tab |

---

## 🗂 Project Structure

```
EventVerse-batch1/
├── backend/
│   ├── app.py                          # Flask app factory
│   ├── config.py                       # DB & env config
│   ├── requirements.txt
│   ├── .env.example                    # Copy to .env
│   ├── database/
│   │   ├── schema.sql                  # Run this first!
│   │   └── db_connection.py
│   ├── models/
│   │   ├── event_model.py              # + volunteeringEnabled, volunteerSlots
│   │   ├── student_model.py            # + get_student_by_email, get_student_analytics
│   │   ├── registration_model.py
│   │   ├── team_model.py               # + get_student_teams
│   │   ├── volunteer_model.py          # NEW: volunteering CRUD
│   │   ├── notification_model.py       # NEW: notifications CRUD
│   │   └── feedback_model.py           # NEW: feedback CRUD
│   ├── controllers/
│   │   ├── registration_controller.py  # + email & notification calls
│   │   ├── volunteer_controller.py     # NEW
│   │   ├── notification_controller.py  # NEW
│   │   ├── feedback_controller.py      # NEW
│   │   ├── admin_controller.py         # + student analytics endpoint
│   │   └── event_controller.py
│   ├── routes/
│   │   ├── registration_routes.py
│   │   ├── volunteer_routes.py         # NEW
│   │   ├── notification_routes.py      # NEW
│   │   ├── feedback_routes.py          # NEW
│   │   ├── admin_routes.py             # + /student/analytics
│   │   └── event_routes.py
│   └── utils/
│       └── email_service.py            # SMTP + HTML templates
│
└── src/
    ├── services/
    │   └── api.ts                      # NEW: typed API client
    ├── pages/
    │   ├── StudentDashboard.tsx        # REWRITTEN: tabs, analytics, volunteering, notifications
    │   ├── CreateEvent.tsx             # + volunteering toggle
    │   └── EventDetail.tsx             # + volunteering badge
    └── components/
        ├── RegistrationModal.tsx       # REWRITTEN: register/volunteer mode, API calls
        ├── NotificationBell.tsx        # NEW: real-time notification dropdown
        ├── Navbar.tsx                  # + NotificationBell
        └── TeamRegistrationForm.tsx    # + defaultLeadName/Email props
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ / Bun
- Python 3.11+
- MySQL 8.0+

---

### Step 1 – Database Setup

```bash
# Log into MySQL
mysql -u root -p

# Run the schema
source /path/to/EventVerse-batch1/backend/database/schema.sql

# Verify
USE eventverse_db;
SHOW TABLES;
```

Tables created:
- `events` (+ `volunteering_enabled`, `volunteer_slots`)
- `students`
- `registrations` (+ `attended`, `registration_type`)
- `teams` / `team_members`
- `volunteering` ← NEW
- `feedback` ← NEW
- `notifications` ← NEW
- `email_log` ← NEW

---

### Step 2 – Backend Setup

```bash
cd backend

# Copy env file
cp .env.example .env
# Open .env and fill in your MySQL password

# Install dependencies (use your existing Python, no venv required)
pip install -r requirements.txt

# Run the server
python app.py
# → API running at http://localhost:5000
```

> **Windows note:** If `python -m venv` fails, just run `pip install -r requirements.txt` directly.
> The key packages are `flask`, `flask-cors`, `pymysql`, `python-dotenv`, `cryptography`.

**API health check:**
```bash
curl http://localhost:5000/api/health
```

---

### Step 3 – Frontend Setup

```bash
# From project root
npm install    # or: bun install

# Start dev server
npm run dev    # or: bun dev
# → http://localhost:5173
```

---

### Step 4 – Email (Optional)

To enable real email sending, add SMTP credentials to `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_app_password    # Gmail: use App Password, not account password
FROM_NAME=EventVerse MMCOE
FROM_EMAIL=your_gmail@gmail.com
```

Without SMTP configured, emails print to console (mock mode) — perfect for development.

---

## 📡 API Endpoints

### Registration
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/register` | Individual registration → sends confirmation email + notification |
| `POST` | `/api/register_team` | Team registration → sends email to lead |
| `POST` | `/api/cancel_registration` | Cancel individual registration |
| `GET` | `/api/student/registrations?email=` | Get all registrations + teams for student |

### Volunteering
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/volunteer` | Apply to volunteer → email + notification |
| `POST` | `/api/volunteer/cancel` | Cancel volunteer application |
| `GET` | `/api/student/volunteering?email=` | Get student volunteering records |
| `GET` | `/api/events/<id>/volunteers` | Admin: list event volunteers |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/student/notifications?email=` | Get notifications + unread count |
| `POST` | `/api/notifications/read` | Mark single notification read |
| `POST` | `/api/notifications/read-all` | Mark all read |

### Feedback
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/feedback` | Submit rating + comments |
| `GET` | `/api/events/<id>/feedback` | Get event feedback + avg rating |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/student/analytics?email=` | Student stats: registered, attended, feedback, volunteering |
| `GET` | `/api/admin/analytics` | Admin: platform-wide analytics |

---

## 🔄 Data Flow

### Registration Flow
```
Student fills form → POST /api/register
  → DB: students (upsert) + registrations (insert)
  → Notification: create "registration_confirm" record
  → Email: send HTML confirmation via SMTP
  → Response: { success, message }
```

### Volunteering Flow
```
Student clicks Volunteer → POST /api/volunteer
  → DB: volunteering (insert, status=pending)
  → Notification: "volunteer_confirm"
  → Email: volunteer confirmation HTML
  → Dashboard: shows in Volunteering tab with status badge
  → Cancel: POST /api/volunteer/cancel → status=cancelled
```

### Notification Flow
```
Any action (register/volunteer/cancel) → create_notification()
  → Stored in DB: notifications table
  → NotificationBell in Navbar polls every 30s
  → Unread count badge shown in real-time
  → Dashboard "Notifications" tab for full history
  → Click to mark read; "Mark all read" button
```

### Analytics Flow
```
GET /api/student/analytics?email=
  → MySQL aggregate queries:
    - COUNT registrations
    - COUNT where event_date > NOW() (upcoming)
    - COUNT where event_date <= NOW() (attended)
    - COUNT feedback submissions
    - COUNT volunteering (non-cancelled)
    - GROUP BY category
  → Frontend: progress bars + category grid + upcoming list
```

---

## 👤 Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@eventverse.com | admin123 |
| Demo Student | alice@college.edu | (email only, no password) |

---

## 🎨 Color Theme

EventVerse uses the MMCOE brand:
- **Primary**: `#A60C25` (deep crimson)
- **Background**: `#F7F7F7`
- **Cards**: `#FFFFFF`
- **Success**: `hsl(152, 56%, 45%)`

---

## 🛠 Troubleshooting

| Issue | Fix |
|---|---|
| `Access denied for user 'root'@'localhost'` | Update `DB_PASSWORD` in `.env` |
| `ModuleNotFoundError: flask_cors` | Run `pip install -r requirements.txt` |
| `CORS error in browser` | Ensure backend runs on port 5000 |
| Emails not sending | Check SMTP credentials or use mock mode (leave SMTP_HOST blank) |
| `Table doesn't exist` | Re-run `schema.sql` in MySQL |
