from database.db_connection import execute_query


def create_notification(student_id: int, event_id, notif_type: str, title: str, message: str):
    return execute_query(
        "INSERT INTO notifications (student_id, event_id, type, title, message) VALUES (%s, %s, %s, %s, %s)",
        (student_id, event_id, notif_type, title, message)
    )


def get_student_notifications(student_email: str, limit: int = 20):
    return execute_query(
        """
        SELECT n.notification_id AS id, n.event_id AS eventId, n.type,
               n.title, n.message, n.is_read AS isRead, n.created_at AS createdAt,
               e.event_name AS eventName
        FROM notifications n
        JOIN students s ON n.student_id = s.student_id
        LEFT JOIN events e ON n.event_id = e.event_id
        WHERE s.student_email = %s
        ORDER BY n.created_at DESC
        LIMIT %s
        """,
        (student_email, limit),
        fetch="all"
    )


def mark_notification_read(notification_id: int, student_email: str):
    execute_query(
        """
        UPDATE notifications n
        JOIN students s ON n.student_id = s.student_id
        SET n.is_read = 1
        WHERE n.notification_id = %s AND s.student_email = %s
        """,
        (notification_id, student_email)
    )


def mark_all_read(student_email: str):
    execute_query(
        """
        UPDATE notifications n
        JOIN students s ON n.student_id = s.student_id
        SET n.is_read = 1
        WHERE s.student_email = %s
        """,
        (student_email,)
    )


def get_unread_count(student_email: str) -> int:
    row = execute_query(
        """
        SELECT COUNT(*) AS cnt FROM notifications n
        JOIN students s ON n.student_id = s.student_id
        WHERE s.student_email = %s AND n.is_read = 0
        """,
        (student_email,),
        fetch="one"
    )
    return int(row["cnt"]) if row else 0
