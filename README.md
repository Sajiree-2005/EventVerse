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
