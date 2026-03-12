from flask import jsonify, request
from models.student_model import get_or_create_student
from models.event_model import get_event_by_id
from models.volunteer_model import (
    get_volunteer_by_student_event, create_volunteer,
    cancel_volunteer, get_student_volunteering,
    get_event_volunteers, count_event_volunteers
)
from models.notification_model import create_notification
from utils.email_service import send_volunteer_confirmation
from datetime import datetime


def _fmt_date(dt):
    if not dt:
        return ""
    if hasattr(dt, "strftime"):
        return dt.strftime("%d %b %Y, %I:%M %p")
    return str(dt)


def _serialize(obj: dict) -> dict:
    result = dict(obj)
    for k, v in result.items():
        if hasattr(v, "isoformat"):
            result[k] = v.isoformat()
    return result


def volunteer_for_event():
    """
    POST /api/volunteer
    Body: { eventId, studentName, studentEmail }
    """
    data = request.get_json()
    required = ["eventId", "studentName", "studentEmail"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"success": False, "message": f"Missing: {', '.join(missing)}"}), 400

    event_id = int(data["eventId"])
    student_name = data["studentName"].strip()
    student_email = data["studentEmail"].strip().lower()

    try:
        event = get_event_by_id(event_id)
        if not event:
            return jsonify({"success": False, "message": "Event not found"}), 404

        if not event.get("volunteeringEnabled"):
            return jsonify({"success": False, "message": "Volunteering is not enabled for this event"}), 400

        # Check deadline
        deadline = event.get("registrationDeadline")
        if deadline and datetime.now() > deadline:
            return jsonify({"success": False, "message": "Registration deadline has passed"}), 400

        # Check volunteer slots
        volunteer_slots = int(event.get("volunteerSlots") or 0)
        filled = count_event_volunteers(event_id)
        if volunteer_slots > 0 and filled >= volunteer_slots:
            return jsonify({"success": False, "message": "Volunteer slots are full"}), 400

        student_id = get_or_create_student(student_name, student_email)

        existing = get_volunteer_by_student_event(student_id, event_id)
        if existing and existing.get("status") != "cancelled":
            return jsonify({"success": False, "message": "You are already volunteering for this event"}), 409

        create_volunteer(student_id, event_id)

        # Notification
        create_notification(
            student_id, event_id, "volunteer_confirm",
            f"Volunteer Application: {event['name']}",
            f"Your volunteer application for {event['name']} has been received. Status: Pending Approval."
        )

        # Email
        send_volunteer_confirmation(
            student_name, student_email,
            event["name"], _fmt_date(event.get("date")),
            event.get("venue", ""), event_id
        )

        return jsonify({"success": True, "message": f"Volunteer application submitted for {event['name']}"}), 201

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


def cancel_volunteering():
    """
    POST /api/volunteer/cancel
    Body: { volunteerId, studentEmail }
    """
    data = request.get_json()
    required = ["volunteerId", "studentEmail"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"success": False, "message": f"Missing: {', '.join(missing)}"}), 400

    volunteer_id = int(data["volunteerId"])
    student_email = data["studentEmail"].strip().lower()

    try:
        cancel_volunteer(volunteer_id)

        # Notification
        from models.student_model import get_student_by_email
        student = get_student_by_email(student_email)
        if student:
            create_notification(
                student["student_id"], None, "volunteer_cancel",
                "Volunteer Application Cancelled",
                "Your volunteer application has been cancelled."
            )

        return jsonify({"success": True, "message": "Volunteer application cancelled"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


def get_student_volunteer_list():
    """GET /api/student/volunteering?email=<email>"""
    email = request.args.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "Email required"}), 400
    try:
        records = get_student_volunteering(email)
        return jsonify({"volunteering": [_serialize(r) for r in records]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_event_volunteer_list(event_id: int):
    """GET /api/events/<id>/volunteers"""
    try:
        volunteers = get_event_volunteers(event_id)
        return jsonify({"total": len(volunteers), "volunteers": [_serialize(v) for v in volunteers]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
