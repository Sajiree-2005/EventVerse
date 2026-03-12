from database.db_connection import execute_query


def get_volunteer_by_student_event(student_id: int, event_id: int):
    return execute_query(
        "SELECT * FROM volunteering WHERE student_id = %s AND event_id = %s",
        (student_id, event_id),
        fetch="one"
    )


def create_volunteer(student_id: int, event_id: int):
    return execute_query(
        "INSERT INTO volunteering (student_id, event_id, status) VALUES (%s, %s, 'pending')",
        (student_id, event_id)
    )


def cancel_volunteer(volunteer_id: int):
    execute_query(
        "UPDATE volunteering SET status = 'cancelled' WHERE volunteer_id = %s",
        (volunteer_id,)
    )


def get_student_volunteering(student_email: str):
    """Return all volunteering records for a student with event details."""
    return execute_query(
        """
        SELECT
            v.volunteer_id    AS id,
            v.event_id        AS eventId,
            v.status,
            v.registered_at   AS registeredAt,
            e.event_name      AS name,
            e.event_date      AS date,
            e.event_venue     AS venue,
            e.event_category  AS category,
            e.poster_url      AS poster
        FROM volunteering v
        JOIN events e ON v.event_id = e.event_id
        JOIN students s ON v.student_id = s.student_id
        WHERE s.student_email = %s AND v.status != 'cancelled'
        ORDER BY e.event_date ASC
        """,
        (student_email,),
        fetch="all"
    )


def get_event_volunteers(event_id: int):
    """Return all volunteers for an event."""
    return execute_query(
        """
        SELECT
            v.volunteer_id AS id,
            s.student_name AS name,
            s.student_email AS email,
            v.status,
            v.registered_at AS registeredAt
        FROM volunteering v
        JOIN students s ON v.student_id = s.student_id
        WHERE v.event_id = %s AND v.status != 'cancelled'
        ORDER BY v.registered_at ASC
        """,
        (event_id,),
        fetch="all"
    )


def count_event_volunteers(event_id: int) -> int:
    row = execute_query(
        "SELECT COUNT(*) AS cnt FROM volunteering WHERE event_id = %s AND status != 'cancelled'",
        (event_id,),
        fetch="one"
    )
    return int(row["cnt"]) if row else 0
