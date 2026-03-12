from database.db_connection import execute_query


def get_all_events():
    """Fetch all events with current registration count."""
    query = """
        SELECT 
            e.event_id AS id,
            e.event_name AS name,
            e.event_description AS description,
            e.event_date AS date,
            e.event_venue AS venue,
            e.event_category AS category,
            e.max_participants AS capacity,
            e.poster_url AS poster,
            e.registration_deadline AS registrationDeadline,
            e.volunteering_enabled AS volunteeringEnabled,
            e.volunteer_slots AS volunteerSlots,
            e.created_at AS createdAt,
            COUNT(r.registration_id) AS registered
        FROM events e
        LEFT JOIN registrations r ON e.event_id = r.event_id
        GROUP BY e.event_id
        ORDER BY e.created_at DESC
    """
    return execute_query(query, fetch="all")


def get_event_by_id(event_id: int):
    """Fetch a single event with registration count and seats remaining."""
    query = """
        SELECT 
            e.event_id AS id,
            e.event_name AS name,
            e.event_description AS description,
            e.event_date AS date,
            e.event_venue AS venue,
            e.event_category AS category,
            e.max_participants AS capacity,
            e.poster_url AS poster,
            e.registration_deadline AS registrationDeadline,
            e.volunteering_enabled AS volunteeringEnabled,
            e.volunteer_slots AS volunteerSlots,
            e.created_at AS createdAt,
            COUNT(r.registration_id) AS registered,
            (e.max_participants - COUNT(r.registration_id)) AS seats_remaining
        FROM events e
        LEFT JOIN registrations r ON e.event_id = r.event_id
        WHERE e.event_id = %s
        GROUP BY e.event_id
    """
    return execute_query(query, (event_id,), fetch="one")


def create_event(data: dict):
    """Insert a new event into the database."""
    query = """
        INSERT INTO events 
            (event_name, event_description, event_date, event_venue, 
             event_category, max_participants, poster_url, registration_deadline,
             volunteering_enabled, volunteer_slots)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        data["name"], data["description"], data["date"],
        data["venue"], data["category"], data["capacity"],
        data.get("poster", ""), data["registrationDeadline"],
        1 if data.get("volunteeringEnabled") else 0,
        int(data.get("volunteerSlots", 0))
    )
    return execute_query(query, params)


def update_event(event_id: int, data: dict):
    """Update an existing event."""
    fields = []
    params = []
    field_map = {
        "name": "event_name",
        "description": "event_description",
        "date": "event_date",
        "venue": "event_venue",
        "category": "event_category",
        "capacity": "max_participants",
        "poster": "poster_url",
        "registrationDeadline": "registration_deadline"
    }
    for key, col in field_map.items():
        if key in data:
            fields.append(f"{col} = %s")
            params.append(data[key])
    if not fields:
        return 0
    params.append(event_id)
    query = f"UPDATE events SET {', '.join(fields)} WHERE event_id = %s"
    execute_query(query, tuple(params))
    return event_id


def delete_event(event_id: int):
    """Delete an event and cascade registrations."""
    execute_query("DELETE FROM registrations WHERE event_id = %s", (event_id,))
    execute_query("DELETE FROM events WHERE event_id = %s", (event_id,))
    return event_id
