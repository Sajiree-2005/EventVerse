from flask import jsonify, request
from models.event_model import get_event_by_id
from models.student_model import get_or_create_student, get_student_registrations
from models.registration_model import (
    check_duplicate, create_registration, get_event_participants,
    get_registration_by_id, cancel_registration
)
from models.team_model import (
    create_team, add_team_member, check_team_duplicate,
    check_member_in_team, check_student_in_event_teams, get_team_by_id
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


def cancel_registration_handler():
    """
    POST /api/cancel_registration
    Body: { registrationId, studentEmail }

    Steps:
    1. Validate input
    2. Get registration record
    3. Verify registration belongs to the student
    4. Delete registration
    5. Return success
    """
    data = request.get_json()
    required = ["registrationId", "studentEmail"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing)}"}), 400

    registration_id = int(data["registrationId"])
    student_email = data["studentEmail"].strip().lower()

    try:
        # 1. Get registration record
        registration = get_registration_by_id(registration_id)
        if not registration:
            return jsonify({
                "success": False,
                "message": "Registration not found"
            }), 404

        # 2. Verify registration belongs to the student
        if registration.get("student_email", "").lower() != student_email:
            return jsonify({
                "success": False,
                "message": "Unauthorized: This registration does not belong to you"
            }), 403

        # 3. Delete registration
        cancel_registration(registration_id)

        return jsonify({
            "success": True,
            "message": "Registration cancelled successfully"
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


def register_team():
    """
    POST /api/register_team
    Body: { 
        eventId, 
        teamName,
        leadName,
        leadEmail,
        teamMembers: [{ name, email }, ...]
    }

    Steps:
    1. Validate input
    2. Check event exists and capacity
    3. Check no duplicate team from lead
    4. Check team members count
    5. Create/get students
    6. Validate no member conflicts
    7. Create team and add members
    """
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
        # 1. Validate event exists
        event = get_event_by_id(event_id)
        if not event:
            return jsonify({"success": False, "message": "Event not found"}), 404

        # 2. Check deadline
        deadline = event.get("registrationDeadline")
        if deadline and datetime.now() > deadline:
            return jsonify({
                "success": False,
                "message": "Registration deadline has passed"
            }), 400

        # 3. Get or create team lead
        lead_id = get_or_create_student(lead_name, lead_email)

        # 4. Check team lead duplicate
        if check_team_duplicate(event_id, lead_id):
            return jsonify({
                "success": False,
                "message": "You already have a team registered for this event"
            }), 409

        # 5. Validate team members
        if not team_members_data or len(team_members_data) == 0:
            return jsonify({
                "success": False,
                "message": "Team must have at least one member"
            }), 400

        if len(team_members_data) > 10:
            return jsonify({
                "success": False,
                "message": "Team cannot exceed 10 members"
            }), 400

        # 6. Check capacity (team size + lead)
        total_team_size = len(team_members_data) + 1  # +1 for lead
        registered = int(event.get("registered") or 0)
        capacity = int(event.get("capacity") or 0)
        
        if registered + total_team_size > capacity:
            return jsonify({
                "success": False,
                "message": f"Event capacity exceeded. Available seats: {capacity - registered}, required: {total_team_size}"
            }), 400

        # 7. Create/get students and check for duplicates
        team_member_ids = []
        seen_emails = {lead_email}  # Prevent lead from being in team again
        
        for member_data in team_members_data:
            member_name = member_data.get("name", "").strip()
            member_email = member_data.get("email", "").strip().lower()
            
            if not member_name or not member_email:
                return jsonify({
                    "success": False,
                    "message": "All team members must have name and email"
                }), 400
            
            # Check for duplicate members in team
            if member_email in seen_emails:
                return jsonify({
                    "success": False,
                    "message": f"Duplicate member: {member_email}"
                }), 400
            
            seen_emails.add(member_email)
            
            # Create/get student
            member_id = get_or_create_student(member_name, member_email)
            
            # Check if already in another team for this event
            if check_student_in_event_teams(event_id, member_id):
                return jsonify({
                    "success": False,
                    "message": f"{member_email} is already in a team for this event"
                }), 409
            
            team_member_ids.append((member_id, member_email))

        # 8. Create team
        team_id = create_team(event_id, team_name, lead_id)

        # 9. Add team members
        for member_id, member_email in team_member_ids:
            try:
                add_team_member(team_id, member_id)
            except Exception as e:
                # Rollback is automatic due to transaction
                return jsonify({
                    "success": False,
                    "message": f"Failed to add member {member_email}: {str(e)}"
                }), 500

        # 10. Get team details
        team = get_team_by_id(team_id)

        return jsonify({
            "success": True,
            "message": f"Team '{team_name}' registered successfully with {len(team_member_ids)} members",
            "team": team
        }), 201

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
