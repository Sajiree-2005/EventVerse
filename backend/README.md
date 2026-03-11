# EventVerse Backend API

Flask + MySQL REST API backend for the EventVerse College Event Management System.

---

## Project Structure

```
backend/
├── app.py                        # Flask app entry point
├── config.py                     # Environment config
├── requirements.txt              # Python dependencies
├── .env.example                  # Environment variable template
│
├── database/
│   ├── db_connection.py          # MySQL connection + query helper
│   └── schema.sql                # Database schema + seed data
│
├── models/
│   ├── event_model.py            # Event DB queries
│   ├── student_model.py          # Student DB queries
│   └── registration_model.py    # Registration DB queries
│
├── routes/
│   ├── event_routes.py           # Event URL routes
│   ├── registration_routes.py    # Registration URL routes
│   └── admin_routes.py          # Admin URL routes
│
├── controllers/
│   ├── event_controller.py       # Event request handlers
│   ├── registration_controller.py
│   └── admin_controller.py
│
└── utils/
    └── export_csv.py             # CSV export utility
```

---

## Setup Instructions

### 1. Prerequisites

- Python 3.10+
- MySQL 8.0+
- pip

### 2. Clone & Install

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=eventverse_db

ADMIN_EMAIL=admin@eventverse.com
ADMIN_PASSWORD=admin123
SECRET_KEY=change-this-in-production
```

### 4. Create Database

Open MySQL and run:
```bash
mysql -u root -p < database/schema.sql
```

Or manually in MySQL client:
```sql
SOURCE /path/to/backend/database/schema.sql;
```

### 5. Run the Server

```bash
cd backend
python app.py
```

Server starts at: **http://localhost:5000**

### 6. Connect Frontend

In your React frontend, set the API base URL to `http://localhost:5000/api`.

If using Vite, add to `vite.config.ts`:
```ts
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

---

## API Reference

### Health Check

| Method | Endpoint      | Description        |
|--------|---------------|--------------------|
| GET    | /api/health   | Server status check |

**Response:**
```json
{ "status": "ok", "message": "EventVerse API is running" }
```

---

### Events

#### GET /api/events
Returns all events with registration counts.

**Response:**
```json
[
  {
    "id": 1,
    "name": "AI Workshop 2026",
    "description": "Explore the latest trends...",
    "date": "2026-03-25T10:00:00",
    "venue": "Seminar Hall A",
    "category": "Workshop",
    "capacity": 50,
    "registered": 12,
    "seats_remaining": 38,
    "poster": "https://...",
    "registrationDeadline": "2026-03-22T23:59:59",
    "createdAt": "2026-03-01T00:00:00"
  }
]
```

---

#### GET /api/events/:id
Returns a single event with capacity tracker fields.

**Response:**
```json
{
  "id": 1,
  "name": "AI Workshop 2026",
  "capacity": 50,
  "registered": 12,
  "seats_remaining": 38,
  ...
}
```

---

#### POST /api/events
Create a new event. (Admin only in production)

**Request Body:**
```json
{
  "name": "New Event",
  "description": "Event details here",
  "date": "2026-05-01T10:00:00",
  "venue": "Hall A",
  "category": "Workshop",
  "capacity": 100,
  "poster": "https://image-url.com",
  "registrationDeadline": "2026-04-28T23:59:59"
}
```

**Response:** `201 Created`
```json
{ "message": "Event created successfully", "event": { ... } }
```

---

#### PUT /api/events/:id
Update event fields. Send only fields you want to change.

**Response:** `200 OK`
```json
{ "message": "Event updated successfully", "event": { ... } }
```

---

#### DELETE /api/events/:id
Delete event and all its registrations.

**Response:** `200 OK`
```json
{ "message": "Event deleted successfully" }
```

---

### Registration

#### POST /api/register
Register a student for an event.

**Request Body:**
```json
{
  "eventId": 1,
  "studentName": "Alice Johnson",
  "studentEmail": "alice@college.edu"
}
```

**Success Response:** `201 Created`
```json
{ "success": true, "message": "You are registered for AI Workshop 2026" }
```

**Duplicate Response:** `409 Conflict`
```json
{ "success": false, "message": "You already registered for this event" }
```

**Full Capacity Response:** `400 Bad Request`
```json
{ "success": false, "message": "Event is at full capacity" }
```

**Deadline Passed Response:** `400 Bad Request`
```json
{ "success": false, "message": "Registration deadline has passed" }
```

---

#### GET /api/events/:id/participants
List all registered participants for an event.

**Response:**
```json
{
  "event_id": 1,
  "event_name": "AI Workshop 2026",
  "total": 12,
  "participants": [
    {
      "id": 1,
      "studentName": "Alice Johnson",
      "studentEmail": "alice@college.edu",
      "registeredAt": "2026-03-10T14:30:00"
    }
  ]
}
```

---

#### GET /api/events/:id/export
Download participant list as CSV file.

**Response:** CSV file download
```
Student Name,Student Email,Registration Date
Alice Johnson,alice@college.edu,2026-03-10 14:30:00
Bob Smith,bob@college.edu,2026-03-11 09:00:00
```

---

#### GET /api/student/registrations?email=alice@college.edu
Get all events a student is registered for (Student Dashboard).

**Response:**
```json
{
  "email": "alice@college.edu",
  "total": 2,
  "registrations": [
    {
      "id": 1,
      "name": "AI Workshop 2026",
      "registeredAt": "2026-03-10T14:30:00",
      ...
    }
  ]
}
```

---

### Admin

#### POST /api/admin/login
Authenticate as admin.

**Request Body:**
```json
{ "email": "admin@eventverse.com", "password": "admin123" }
```

**Response:**
```json
{ "success": true, "message": "Login successful", "admin": { "email": "admin@eventverse.com" } }
```

---

#### GET /api/admin/analytics
Returns dashboard analytics data.

**Response:**
```json
{
  "total_events": 6,
  "total_participants": 4,
  "upcoming_events": 5,
  "most_popular_event": {
    "id": 2,
    "name": "Hackathon 2026",
    "registered": 87
  },
  "category_distribution": {
    "Workshop": 2,
    "Hackathon": 1,
    "Cultural": 1,
    "Sports": 1,
    "Academic": 1
  },
  "event_participation": [
    {
      "id": 1,
      "name": "AI Workshop 2026",
      "registered": 12,
      "capacity": 50,
      "fill_percentage": 24.0
    }
  ]
}
```

---

## Database Schema

```
events
  event_id PK | event_name | event_description | event_date
  event_venue  | event_category | max_participants
  poster_url   | registration_deadline | created_at

students
  student_id PK | student_name | student_email UNIQUE | created_at

registrations
  registration_id PK | student_id FK | event_id FK
  registration_date  | UNIQUE(student_id, event_id)
```

---

## Error Codes

| Code | Meaning                                    |
|------|--------------------------------------------|
| 200  | Success                                    |
| 201  | Created                                    |
| 400  | Bad Request (missing fields, deadline past)|
| 401  | Unauthorized (wrong admin credentials)     |
| 404  | Not Found                                  |
| 409  | Conflict (duplicate registration)          |
| 500  | Internal Server Error                      |

---

## Connecting the Frontend

The frontend currently uses `AppContext` with in-memory state. To connect it to this backend:

1. Replace `registerForEvent` in `AppContext.tsx` with a `fetch` call to `POST /api/register`
2. Replace `SAMPLE_EVENTS` loading with `fetch('/api/events')`
3. Replace CSV export button with a link to `GET /api/events/<id>/export`
4. Replace admin analytics with `fetch('/api/admin/analytics')`
5. Replace student dashboard with `fetch('/api/student/registrations?email=...')`
