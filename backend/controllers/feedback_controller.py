from flask import jsonify, request
from models.student_model import get_or_create_student
from models.event_model import get_event_by_id
from models.feedback_model import (
    submit_feedback, get_feedback_by_student_event,
    get_event_feedback, get_event_avg_rating
)
from models.notification_model import create_notification
from datetime import datetime


def _serialize(obj: dict) -> dict:
    result = dict(obj)
    for k, v in result.items():
        if hasattr(v, "isoformat"):
            result[k] = v.isoformat()
    return result


def submit_feedback_handler():
    """
    POST /api/feedback
    Body: { eventId, studentName, studentEmail, rating, comments }
    """
    data = request.get_json()
    required = ["eventId", "studentName", "studentEmail", "rating"]
    missing = [f for f in required if not data.get(f) and data.get(f) != 0]
    if missing:
        return jsonify({"success": False, "message": f"Missing: {', '.join(missing)}"}), 400

    event_id = int(data["eventId"])
    student_name = data["studentName"].strip()
    student_email = data["studentEmail"].strip().lower()
    rating = int(data["rating"])
    comments = data.get("comments", "").strip()

    if rating < 1 or rating > 5:
        return jsonify({"success": False, "message": "Rating must be 1-5"}), 400

    try:
        event = get_event_by_id(event_id)
        if not event:
            return jsonify({"success": False, "message": "Event not found"}), 404

        student_id = get_or_create_student(student_name, student_email)
        submit_feedback(student_id, event_id, rating, comments)

        create_notification(
            student_id, event_id, "feedback_submitted",
            f"Feedback Submitted: {event['name']}",
            f"Thank you for rating {event['name']} {rating}/5!"
        )

        return jsonify({"success": True, "message": "Feedback submitted successfully"}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


def get_event_feedback_handler(event_id: int):
    """GET /api/events/<id>/feedback"""
    try:
        feedback_list = get_event_feedback(event_id)
        avg = get_event_avg_rating(event_id)
        return jsonify({
            "feedback": [_serialize(f) for f in feedback_list],
            "avgRating": float(avg["avg_rating"]) if avg and avg["avg_rating"] else 0,
            "total": int(avg["total"]) if avg else 0
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
