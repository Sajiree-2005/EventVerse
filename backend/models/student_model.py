from database.db_connection import execute_query


def get_or_create_student(name: str, email: str) -> int:
    """
    Find existing student by email or create a new one.
    Returns the student_id.
    """
    existing = execute_query(
        "SELECT student_id FROM students WHERE student_email = %s",
        (email,),
        fetch="one"
    )
    if existing:
        return existing["student_id"]

    student_id = execute_query(
        "INSERT INTO students (student_name, student_email) VALUES (%s, %s)",
        (name, email)
    )
    return student_id


def get_student_registrations(email: str):
    """Get all events a student is registered for."""
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
            e.created_at AS createdAt,
            r.registration_date AS registeredAt,
            r.registration_id,
            COUNT(r2.registration_id) AS registered
        FROM registrations r
        JOIN events e ON r.event_id = e.event_id
        JOIN students s ON r.student_id = s.student_id
        LEFT JOIN registrations r2 ON e.event_id = r2.event_id
        WHERE s.student_email = %s
        GROUP BY r.registration_id, e.event_id
        ORDER BY r.registration_date DESC
    """
    return execute_query(query, (email,), fetch="all")
