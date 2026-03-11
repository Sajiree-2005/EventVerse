from flask import jsonify, request
from models.event_model import get_event_by_id
from models.student_model import get_or_create_student, get_student_registrations
from models.registration_model import (
    check_duplicate, create_registration, get_event_participants
)
from datetime import datetime


def _serialize(obj: dict) -> dict:
    """Convert datetime fields to ISO strings."""
    result = dict(obj)
    for key in ["registeredAt", "date", "registrationDeadline", "createdAt"]:
        if key in result and result[key] and hasattr(result[key], "isoformat"):
            result[key] = result[key].isoformat()
    if "capacity" in result:
        result["capacity"] = int(result["capacity"] or 0)
    if "registered" in result:
        result["registered"] = int(result["registered"] or 0)
        result["seats_remaining"] = result["capacity"] - result["registered"]
    return result


def register_student():
    """
    POST /api/register
    Body: { eventId, studentName, studentEmail }

    Steps:
    1. Validate input
    2. Check event exists
    3. Check registration deadline
    4. Check capacity
    5. Check duplicate registration
    6. Create student (or fetch existing) + create registration
    """
    data = request.get_json()
    required = ["eventId", "studentName", "studentEmail"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing)}"}), 400

    event_id = int(data["eventId"])
    student_name = data["studentName"].strip()
    student_email = data["studentEmail"].strip().lower()

    try:
        # 1. Validate event exists
        event = get_event_by_id(event_id)
        if not event:
            return jsonify({"success": False, "message": "Event not found"}), 404

        # 2. Check registration deadline
        deadline = event.get("registrationDeadline")
        if deadline and datetime.now() > deadline:
            return jsonify({
                "success": False,
                "message": "Registration deadline has passed"
            }), 400

        # 3. Check capacity
        registered = int(event.get("registered") or 0)
        capacity = int(event.get("capacity") or 0)
        if registered >= capacity:
            return jsonify({
                "success": False,
                "message": "Event is at full capacity"
            }), 400

        # 4. Get or create student
        student_id = get_or_create_student(student_name, student_email)

        # 5. Check duplicate
        if check_duplicate(student_id, event_id):
            return jsonify({
                "success": False,
                "message": "You already registered for this event"
            }), 409

        # 6. Create registration
        create_registration(student_id, event_id)

        return jsonify({
            "success": True,
            "message": f"You are registered for {event['name']}"
        }), 201

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


def list_participants(event_id: int):
    """GET /api/events/<id>/participants — list all registered students."""
    try:
        event = get_event_by_id(event_id)
        if not event:
            return jsonify({"error": "Event not found"}), 404
        participants = get_event_participants(event_id)
        serialized = [_serialize(p) for p in participants]
        return jsonify({
            "event_id": event_id,
            "event_name": event["name"],
            "total": len(serialized),
            "participants": serialized
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def student_dashboard():
    """
    GET /api/student/registrations?email=<email>
    Returns all events a student has registered for.
    """
    email = request.args.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400
    try:
        registrations = get_student_registrations(email)
        return jsonify({
            "email": email,
            "total": len(registrations),
            "registrations": [_serialize(r) for r in registrations]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
