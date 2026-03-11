# EventVerse 🎓

A full-stack campus event management platform.

| Layer    | Stack                                                     |
| -------- | --------------------------------------------------------- |
| Frontend | React 18 · Vite 5 · TypeScript · Tailwind CSS · shadcn/ui |
| Backend  | Python 3 · Flask 3 · Flask-CORS · MySQL 8                 |
| Charts   | Chart.js 4 · react-chartjs-2                              |
| HTTP     | Fetch API (proxied by Vite — no CORS in dev)              |

---

## Features

| Feature                  | How it works                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------- |
| **Event listing**        | `GET /api/events` — cards with search + category filter                                 |
| **Event detail**         | `GET /api/events/:id` — countdown timer, capacity bar, poster                           |
| **Student registration** | `POST /api/register` — name + email; async modal with spinner                           |
| **Duplicate prevention** | Checked in Python + enforced by `UNIQUE KEY uq_student_event` in MySQL                  |
| **Capacity tracking**    | `registered / capacity` bar on every card and detail page                               |
| **Student dashboard**    | `GET /api/student/registrations?email=` — look up your events                           |
| **Admin login**          | `POST /api/admin/login` — credentials from `.env`                                       |
| **Create event**         | `POST /api/events` — form with validation, stores in MySQL                              |
| **Manage events**        | `DELETE /api/events/:id` — confirmed delete with spinner                                |
| **Participant list**     | `GET /api/events/:id/participants` — paginated table                                    |
| **CSV export**           | `GET /api/events/:id/export` — pandas CSV download (filename via `Content-Disposition`) |
| **Admin analytics**      | `GET /api/admin/analytics` — bar chart, pie chart, stat cards                           |

---

## Project structure

```
EventVerse-main/
│
├── backend/                        Flask API
│   ├── app.py                      App factory, CORS, blueprints, error handlers
│   ├── config.py                   Reads .env via python-dotenv
│   ├── requirements.txt
│   ├── .env.example                Copy → .env, fill in DB_PASSWORD
│   │
│   ├── controllers/
│   │   ├── admin_controller.py     GET /admin/analytics · POST /admin/login
│   │   ├── event_controller.py     CRUD /events
│   │   └── registration_controller.py  POST /register · GET /participants · GET /student/registrations
│   │
│   ├── database/
│   │   ├── db_connection.py        MySQL connection pool (size 5) + execute_query helper
│   │   └── schema.sql              Tables + idempotent seed data (INSERT IGNORE)
│   │
│   ├── models/
│   │   ├── event_model.py          SQL queries for events table
│   │   ├── registration_model.py   SQL queries for registrations table
│   │   └── student_model.py        get_or_create_student · get_student_registrations
│   │
│   ├── routes/
│   │   ├── admin_routes.py
│   │   ├── event_routes.py
│   │   └── registration_routes.py
│   │
│   └── utils/
│       └── export_csv.py           pandas → BytesIO → send_file (CSV)
│
├── src/                            React frontend
│   ├── lib/
│   │   └── api.ts                  Typed fetch wrappers for every endpoint
│   │
│   ├── context/
│   │   └── AppContext.tsx          Global state; loads events on mount via API
│   │
│   ├── pages/
│   │   ├── Index.tsx               Hero + event grid (loading + error states)
│   │   ├── Events.tsx              Full event list with search/filter
│   │   ├── EventDetail.tsx         Single event + RegistrationModal
│   │   ├── StudentDashboard.tsx    Email search → registered events
│   │   ├── AdminLogin.tsx          Async login → /api/admin/login
│   │   ├── AdminDashboard.tsx      Stat cards + bar/pie charts from /api/admin/analytics
│   │   ├── CreateEvent.tsx         Form → POST /api/events
│   │   ├── ManageEvents.tsx        List + async delete
│   │   ├── Participants.tsx        GET /api/events/:id/participants + CSV export
│   │   └── EventAnalytics.tsx      Per-event analytics from API
│   │
│   └── components/
│       ├── Navbar.tsx
│       ├── EventCard.tsx           Card with countdown timer + capacity bar
│       ├── EventFilters.tsx        Search input + category pill buttons
│       ├── CountdownTimer.tsx      Live countdown (1-second interval)
│       └── RegistrationModal.tsx   Async submit with loading spinner
│
├── vite.config.ts                  port 5173 · proxy /api → localhost:5000
├── package.json                    includes chart.js ^4.4.0 (peer dep)
└── .gitignore                      excludes .env, __pycache__, venv
```

---

## Prerequisites

| Tool    | Minimum |
| ------- | ------- |
| Node.js | 18      |
| npm     | 9       |
| Python  | 3.10    |
| MySQL   | 8.0     |

---

## 1 · Database setup

### Start MySQL

```bash
# macOS (Homebrew)
brew services start mysql

# Linux (systemd)
sudo systemctl start mysql

# Windows
net start MySQL80
```

### Run the schema (safe to run multiple times)

```bash
mysql -u root -p < backend/database/schema.sql
```

This creates `eventverse_db` with three tables and seeds six sample events plus three demo students.

Verify:

```sql
mysql -u root -p eventverse_db
SELECT event_name, event_category, max_participants FROM events;
```

---

## 2 · Backend

### Environment variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
# ── Database ──────────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=eventverse_db

# ── Flask ─────────────────────────────────────────────────────
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=change-me-in-production

# ── Admin account ─────────────────────────────────────────────
ADMIN_EMAIL=admin@eventverse.com
ADMIN_PASSWORD=admin123
```

### Install & run

```bash
cd backend

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

python app.py
```

**Flask listens on `http://localhost:5000`**

Quick smoke test:

```bash
curl http://localhost:5000/api/health
# {"message":"EventVerse API is running","status":"ok"}

curl http://localhost:5000/api/events | python3 -m json.tool | head -20
```

---

## 3 · Frontend

Open a **second terminal** (keep Flask running):

```bash
# From the project root (EventVerse-main/)
npm install
npm run dev
```

**App available at `http://localhost:5173`**

Vite proxies every `/api/*` request to `http://localhost:5000`, so no CORS configuration is needed during development.

---

## API reference

| Method   | Path                                | Description                                                                                        |
| -------- | ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/health`                       | Health check                                                                                       |
| `GET`    | `/api/events`                       | List all events (with registration count)                                                          |
| `GET`    | `/api/events/:id`                   | Single event detail                                                                                |
| `POST`   | `/api/events`                       | Create event `{name, description, date, venue, category, capacity, registrationDeadline, poster?}` |
| `PUT`    | `/api/events/:id`                   | Update event (partial)                                                                             |
| `DELETE` | `/api/events/:id`                   | Delete event (cascades registrations)                                                              |
| `POST`   | `/api/register`                     | Register `{eventId, studentName, studentEmail}`                                                    |
| `GET`    | `/api/events/:id/participants`      | Participant list for event                                                                         |
| `GET`    | `/api/events/:id/export`            | Download participants CSV                                                                          |
| `GET`    | `/api/student/registrations?email=` | Events registered by a student                                                                     |
| `POST`   | `/api/admin/login`                  | Admin login `{email, password}`                                                                    |
| `GET`    | `/api/admin/analytics`              | Aggregate stats + per-event participation                                                          |

### Registration validation order

1. Body present + required fields non-empty
2. `eventId` is a valid integer
3. Event exists in DB
4. Registration deadline not passed
5. `registered < capacity`
6. Student not already registered _(application check + DB `UNIQUE KEY` backup)_
7. `get_or_create_student` → insert `registrations` row

---

## Admin access

Navigate to **`http://localhost:5173/admin/login`**

```
Email:    admin@eventverse.com
Password: admin123
```

(Override via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env`)

---

## Troubleshooting

| Symptom                                             | Fix                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| "Failed to fetch events" on homepage                | Flask is not running. Run `python app.py` inside `backend/`               |
| `ConnectionError: Failed to get DB connection`      | MySQL is stopped, or `DB_PASSWORD` in `.env` is wrong                     |
| `ModuleNotFoundError: No module named 'flask_cors'` | Run `pip install -r requirements.txt` with venv active                    |
| Charts blank / `Chart is not defined`               | `npm install` to get `chart.js ^4.4.0` (now explicit in `package.json`)   |
| CSV download filename wrong                         | Fixed: `expose_headers: ["Content-Disposition"]` now set in CORS config   |
| Port 5000 in use on macOS                           | Disable AirPlay Receiver in System Settings → General → AirDrop & Handoff |
| Port 5173 in use                                    | `lsof -ti:5173 \| xargs kill` (macOS/Linux)                               |

---

## Quick start (TL;DR)

```bash
# ── Terminal 1: database + backend ───────────────────────────
mysql -u root -p < backend/database/schema.sql
cp backend/.env.example backend/.env   # fill in DB_PASSWORD

cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py

# ── Terminal 2: frontend (project root) ──────────────────────
npm install
npm run dev
```

Open **http://localhost:5173** · Admin at `/admin/login`
