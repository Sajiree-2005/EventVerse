from flask import jsonify, request
from models.notification_model import (
    get_student_notifications, mark_notification_read,
    mark_all_read, get_unread_count
)


def _serialize(obj: dict) -> dict:
    result = dict(obj)
    for k, v in result.items():
        if hasattr(v, "isoformat"):
            result[k] = v.isoformat()
    return result


def list_notifications():
    """GET /api/student/notifications?email=<email>"""
    email = request.args.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "Email required"}), 400
    try:
        notifications = get_student_notifications(email)
        unread = get_unread_count(email)
        return jsonify({
            "notifications": [_serialize(n) for n in notifications],
            "unreadCount": unread
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def mark_read():
    """POST /api/notifications/read"""
    data = request.get_json()
    notif_id = int(data.get("notificationId", 0))
    email = data.get("studentEmail", "").strip().lower()
    if not notif_id or not email:
        return jsonify({"error": "notificationId and studentEmail required"}), 400
    try:
        mark_notification_read(notif_id, email)
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def mark_all_notifications_read():
    """POST /api/notifications/read-all"""
    data = request.get_json()
    email = data.get("studentEmail", "").strip().lower()
    if not email:
        return jsonify({"error": "studentEmail required"}), 400
    try:
        mark_all_read(email)
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
