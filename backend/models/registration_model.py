from database.db_connection import execute_query


def check_duplicate(student_id: int, event_id: int) -> bool:
    """Return True if the student already registered for this event."""
    result = execute_query(
        "SELECT registration_id FROM registrations WHERE student_id = %s AND event_id = %s",
        (student_id, event_id),
        fetch="one"
    )
    return result is not None


def create_registration(student_id: int, event_id: int) -> int:
    """Insert a registration record and return its ID."""
    return execute_query(
        "INSERT INTO registrations (student_id, event_id) VALUES (%s, %s)",
        (student_id, event_id)
    )


def get_event_participants(event_id: int):
    """Return all participants for a given event."""
    query = """
        SELECT 
            s.student_name AS studentName,
            s.student_email AS studentEmail,
            r.registration_date AS registeredAt,
            r.registration_id AS id
        FROM registrations r
        JOIN students s ON r.student_id = s.student_id
        WHERE r.event_id = %s
        ORDER BY r.registration_date ASC
    """
    return execute_query(query, (event_id,), fetch="all")


def get_all_registrations():
    """Return all registration records (for admin analytics)."""
    query = """
        SELECT 
            r.registration_id,
            r.event_id,
            r.student_id,
            r.registration_date,
            s.student_name,
            s.student_email,
            e.event_name
        FROM registrations r
        JOIN students s ON r.student_id = s.student_id
        JOIN events e ON r.event_id = e.event_id
        ORDER BY r.registration_date DESC
    """
    return execute_query(query, fetch="all")
