from flask import jsonify, request
from models.event_model import (
    get_all_events, get_event_by_id,
    create_event, update_event, delete_event
)
from datetime import datetime


def _serialize_event(event: dict) -> dict:
    """Convert datetime objects to ISO strings for JSON serialization."""
    if not event:
        return event
    result = dict(event)
    for key in ["date", "registrationDeadline", "createdAt", "registeredAt"]:
        if key in result and result[key] and hasattr(result[key], "isoformat"):
            result[key] = result[key].isoformat()
    # Ensure numeric fields
    result["capacity"] = int(result.get("capacity") or 0)
    result["registered"] = int(result.get("registered") or 0)
    result["seats_remaining"] = result["capacity"] - result["registered"]
    return result


def list_events():
    """GET /api/events — return all events."""
    try:
        events = get_all_events()
        return jsonify([_serialize_event(e) for e in events]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_event(event_id: int):
    """GET /api/events/<id> — return a single event with capacity info."""
    try:
        event = get_event_by_id(event_id)
        if not event:
            return jsonify({"error": "Event not found"}), 404
        return jsonify(_serialize_event(event)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def add_event():
    """POST /api/events — create a new event."""
    data = request.get_json()
    required = ["name", "description", "date", "venue", "category", "capacity", "registrationDeadline"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
    try:
        event_id = create_event(data)
        event = get_event_by_id(event_id)
        return jsonify({"message": "Event created successfully", "event": _serialize_event(event)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def edit_event(event_id: int):
    """PUT /api/events/<id> — update an event."""
    data = request.get_json()
    try:
        existing = get_event_by_id(event_id)
        if not existing:
            return jsonify({"error": "Event not found"}), 404
        update_event(event_id, data)
        updated = get_event_by_id(event_id)
        return jsonify({"message": "Event updated successfully", "event": _serialize_event(updated)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def remove_event(event_id: int):
    """DELETE /api/events/<id> — delete an event."""
    try:
        existing = get_event_by_id(event_id)
        if not existing:
            return jsonify({"error": "Event not found"}), 404
        delete_event(event_id)
        return jsonify({"message": "Event deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
