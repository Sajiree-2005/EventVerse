from database.db_connection import execute_query


def submit_feedback(student_id: int, event_id: int, rating: int, comments: str):
    return execute_query(
        """
        INSERT INTO feedback (student_id, event_id, rating, comments)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE rating = VALUES(rating), comments = VALUES(comments), submitted_at = NOW()
        """,
        (student_id, event_id, rating, comments)
    )


def get_feedback_by_student_event(student_id: int, event_id: int):
    return execute_query(
        "SELECT * FROM feedback WHERE student_id = %s AND event_id = %s",
        (student_id, event_id),
        fetch="one"
    )


def get_student_feedback_count(student_email: str) -> int:
    row = execute_query(
        """
        SELECT COUNT(*) AS cnt FROM feedback f
        JOIN students s ON f.student_id = s.student_id
        WHERE s.student_email = %s
        """,
        (student_email,),
        fetch="one"
    )
    return int(row["cnt"]) if row else 0


def get_event_feedback(event_id: int):
    return execute_query(
        """
        SELECT
            f.feedback_id AS id,
            s.student_name AS name,
            f.rating,
            f.comments,
            f.submitted_at AS submittedAt
        FROM feedback f
        JOIN students s ON f.student_id = s.student_id
        WHERE f.event_id = %s
        ORDER BY f.submitted_at DESC
        """,
        (event_id,),
        fetch="all"
    )


def get_event_avg_rating(event_id: int):
    row = execute_query(
        "SELECT AVG(rating) AS avg_rating, COUNT(*) AS total FROM feedback WHERE event_id = %s",
        (event_id,),
        fetch="one"
    )
    return row
