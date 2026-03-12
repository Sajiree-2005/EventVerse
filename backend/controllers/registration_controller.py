from flask import jsonify, request
from models.event_model import get_event_by_id
from models.student_model import get_or_create_student, get_student_registrations
from models.registration_model import (
    check_duplicate, create_registration, get_event_participants,
    get_registration_by_id, cancel_registration
)
from models.team_model import (
    create_team, add_team_member, check_team_duplicate,
    check_student_in_event_teams, get_team_by_id, get_student_teams
)
from models.notification_model import create_notification
from utils.email_service import (
    send_registration_confirmation, send_team_registration_confirmation,
    send_cancellation_email
)
from datetime import datetime


def _fmt_date(dt):
    if not dt: return ""
    if hasattr(dt, "strftime"):
        return dt.strftime("%d %b %Y, %I:%M %p")
    return str(dt)


def _serialize(obj: dict) -> dict:
    result = dict(obj)
    for k in ["registeredAt", "date", "registrationDeadline", "createdAt"]:
        if k in result and result[k] and hasattr(result[k], "isoformat"):
            result[k] = result[k].isoformat()
    if "capacity" in result:
        result["capacity"] = int(result["capacity"] or 0)
    if "registered" in result:
        result["registered"] = int(result["registered"] or 0)
        result["seats_remaining"] = result["capacity"] - result["registered"]
    return result


def register_student():
    """POST /api/register"""
    data = request.get_json()
    required = ["eventId", "studentName", "studentEmail"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing)}"}), 400

    event_id = int(data["eventId"])
    student_name = data["studentName"].strip()
    student_email = data["studentEmail"].strip().lower()

    try:
        event = get_event_by_id(event_id)
        if not event:
            return jsonify({"success": False, "message": "Event not found"}), 404

        deadline = event.get("registrationDeadline")
        if deadline and datetime.now() > deadline:
            return jsonify({"success": False, "message": "Registration deadline has passed"}), 400

        registered = int(event.get("registered") or 0)
        capacity = int(event.get("capacity") or 0)
        if registered >= capacity:
            return jsonify({"success": False, "message": "Event is at full capacity"}), 400

        student_id = get_or_create_student(student_name, student_email)

        if check_duplicate(student_id, event_id):
            return jsonify({"success": False, "message": "You already registered for this event"}), 409

        create_registration(student_id, event_id)

        # Notification
        create_notification(
            student_id, event_id, "registration_confirm",
            f"Registered: {event['name']}",
            f"Your registration for {event['name']} on {_fmt_date(event.get('date'))} is confirmed!"
        )

        # Email
        send_registration_confirmation(
            student_name, student_email,
            event["name"], _fmt_date(event.get("date")),
            event.get("venue", ""), event_id
        )

        return jsonify({"success": True, "message": f"You are registered for {event['name']}"}), 201

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


def list_participants(event_id: int):
    """GET /api/events/<id>/participants"""
    try:
        event = get_event_by_id(event_id)
        if not event:
            return jsonify({"error": "Event not found"}), 404
        participants = get_event_participants(event_id)
        return jsonify({
            "event_id": event_id,
            "event_name": event["name"],
            "total": len(participants),
            "participants": [_serialize(p) for p in participants]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def student_dashboard():
    """GET /api/student/registrations?email=<email>"""
    email = request.args.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400
    try:
        registrations = get_student_registrations(email)
        teams = get_student_teams(email)
        return jsonify({
            "email": email,
            "total": len(registrations),
            "registrations": [_serialize(r) for r in registrations],
            "teams": [_serialize(t) for t in teams]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def cancel_registration_handler():
    """POST /api/cancel_registration"""
    data = request.get_json()
    required = ["registrationId", "studentEmail"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing)}"}), 400

    registration_id = int(data["registrationId"])
    student_email = data["studentEmail"].strip().lower()

    try:
        registration = get_registration_by_id(registration_id)
        if not registration:
            return jsonify({"success": False, "message": "Registration not found"}), 404

        if registration.get("student_email", "").lower() != student_email:
            return jsonify({"success": False, "message": "Unauthorized"}), 403

        event = get_event_by_id(registration["event_id"])
        cancel_registration(registration_id)

        # Notification
        from models.student_model import get_student_by_email
        student = get_student_by_email(student_email)
        if student and event:
            create_notification(
                student["student_id"], event["id"] if event else None,
                "cancellation",
                f"Registration Cancelled: {event['name'] if event else ''}",
                f"Your registration for {event['name'] if event else 'the event'} has been cancelled."
            )
            send_cancellation_email(
                student["student_name"], student_email,
                event["name"], _fmt_date(event.get("date"))
            )

        return jsonify({"success": True, "message": "Registration cancelled successfully"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


def register_team():
    """POST /api/register_team"""
    data = request.get_json()
    required = ["eventId", "teamName", "leadName", "leadEmail", "teamMembers"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing)}"}), 400

    event_id = int(data["eventId"])
    team_name = data["teamName"].strip()
    lead_name = data["leadName"].strip()
    lead_email = data["leadEmail"].strip().lower()
    team_members_data = data.get("teamMembers", [])

    try:
        event = get_event_by_id(event_id)
        if not event:
            return jsonify({"success": False, "message": "Event not found"}), 404

        deadline = event.get("registrationDeadline")
        if deadline and datetime.now() > deadline:
            return jsonify({"success": False, "message": "Registration deadline has passed"}), 400

        lead_id = get_or_create_student(lead_name, lead_email)

        if check_team_duplicate(event_id, lead_id):
            return jsonify({"success": False, "message": "You already have a team for this event"}), 409

        if not team_members_data or len(team_members_data) == 0:
            return jsonify({"success": False, "message": "Team must have at least one member"}), 400

        if len(team_members_data) > 10:
            return jsonify({"success": False, "message": "Team cannot exceed 10 members"}), 400

        total_team_size = len(team_members_data) + 1
        registered = int(event.get("registered") or 0)
        capacity = int(event.get("capacity") or 0)
        if registered + total_team_size > capacity:
            return jsonify({"success": False, "message": f"Capacity exceeded. Available: {capacity - registered}, required: {total_team_size}"}), 400

        team_member_ids = []
        seen_emails = {lead_email}
        for member_data in team_members_data:
            member_name = member_data.get("name", "").strip()
            member_email = member_data.get("email", "").strip().lower()
            if not member_name or not member_email:
                return jsonify({"success": False, "message": "All members need name and email"}), 400
            if member_email in seen_emails:
                return jsonify({"success": False, "message": f"Duplicate member: {member_email}"}), 400
            seen_emails.add(member_email)
            member_id = get_or_create_student(member_name, member_email)
            if check_student_in_event_teams(event_id, member_id):
                return jsonify({"success": False, "message": f"{member_email} already in a team for this event"}), 409
            team_member_ids.append((member_id, member_email))

        team_id = create_team(event_id, team_name, lead_id)
        for member_id, member_email in team_member_ids:
            try:
                add_team_member(team_id, member_id)
            except Exception as e:
                return jsonify({"success": False, "message": f"Failed to add {member_email}: {str(e)}"}), 500

        team = get_team_by_id(team_id)

        # Notification for lead
        create_notification(
            lead_id, event_id, "team_registration",
            f"Team Registered: {team_name}",
            f"Team '{team_name}' registered for {event['name']} with {len(team_member_ids)} members."
        )

        # Email confirmation
        send_team_registration_confirmation(
            lead_name, lead_email, team_name,
            event["name"], _fmt_date(event.get("date")),
            event.get("venue", ""), len(team_member_ids), event_id
        )

        return jsonify({
            "success": True,
            "message": f"Team '{team_name}' registered with {len(team_member_ids)} members",
            "team": team
        }), 201

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
