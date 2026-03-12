from database.db_connection import execute_query


def get_or_create_student(name: str, email: str) -> int:
    email = email.strip().lower()
    existing = execute_query(
        "SELECT student_id FROM students WHERE LOWER(student_email) = LOWER(%s)",
        (email,), fetch="one"
    )
    if existing:
        return existing["student_id"]
    return execute_query(
        "INSERT INTO students (student_name, student_email) VALUES (%s, %s)",
        (name, email)
    )


def get_student_registrations(email: str):
    """Get all events a student is registered for. No GROUP BY — avoids ONLY_FULL_GROUP_BY."""
    return execute_query(
        """
        SELECT
            e.event_id          AS id,
            e.event_name        AS name,
            e.event_description AS description,
            e.event_date        AS date,
            e.event_venue       AS venue,
            e.event_category    AS category,
            e.max_participants  AS capacity,
            e.poster_url        AS poster,
            e.registration_deadline AS registrationDeadline,
            e.created_at        AS createdAt,
            r.registration_date AS registeredAt,
            r.registration_id   AS registration_id,
            (SELECT COUNT(*) FROM registrations r2
             WHERE r2.event_id = e.event_id) AS registered
        FROM registrations r
        JOIN events e   ON r.event_id   = e.event_id
        JOIN students s ON r.student_id = s.student_id
        WHERE LOWER(s.student_email) = LOWER(%s)
        ORDER BY r.registration_date DESC
        """,
        (email,), fetch="all"
    )


def get_student_by_email(email: str):
    return execute_query(
        "SELECT * FROM students WHERE LOWER(student_email) = LOWER(%s)",
        (email,), fetch="one"
    )


def get_student_analytics(email: str):
    return execute_query(
        """
        SELECT
            (SELECT COUNT(*) FROM registrations r
             JOIN students s ON r.student_id = s.student_id
             WHERE LOWER(s.student_email) = LOWER(%s)) AS totalRegistered,

            (SELECT COUNT(*) FROM registrations r
             JOIN students s ON r.student_id = s.student_id
             JOIN events e   ON r.event_id   = e.event_id
             WHERE LOWER(s.student_email) = LOWER(%s)
               AND e.event_date > NOW()) AS upcoming,

            (SELECT COUNT(*) FROM registrations r
             JOIN students s ON r.student_id = s.student_id
             JOIN events e   ON r.event_id   = e.event_id
             WHERE LOWER(s.student_email) = LOWER(%s)
               AND e.event_date <= NOW()) AS attended,

            (SELECT COUNT(*) FROM feedback f
             JOIN students s ON f.student_id = s.student_id
             WHERE LOWER(s.student_email) = LOWER(%s)) AS feedbackSubmitted,

            (SELECT COUNT(*) FROM volunteering v
             JOIN students s ON v.student_id = s.student_id
             WHERE LOWER(s.student_email) = LOWER(%s)
               AND v.status != 'cancelled') AS volunteeringCount
        """,
        (email, email, email, email, email), fetch="one"
    )
