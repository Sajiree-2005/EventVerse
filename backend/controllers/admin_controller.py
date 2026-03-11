from flask import jsonify, request
from models.event_model import get_all_events
from models.registration_model import get_all_registrations
from config import Config


def get_analytics():
    """
    GET /api/admin/analytics
    Returns:
    - total_events
    - total_participants
    - most_popular_event
    - category_distribution
    - event_participation (per event)
    - upcoming_events_count
    """
    try:
        events = get_all_events()
        registrations = get_all_registrations()

        total_events = len(events)
        total_participants = len(registrations)

        # Most popular event
        most_popular = None
        if events:
            sorted_events = sorted(events, key=lambda e: int(e.get("registered") or 0), reverse=True)
            top = sorted_events[0]
            most_popular = {
                "id": top["id"],
                "name": top["name"],
                "registered": int(top.get("registered") or 0)
            }

        # Category distribution
        cat_counts: dict[str, int] = {}
        for e in events:
            cat = e.get("category", "Uncategorized")
            cat_counts[cat] = cat_counts.get(cat, 0) + 1

        # Per-event participation
        from datetime import datetime
        event_participation = []
        upcoming_count = 0
        for e in events:
            registered = int(e.get("registered") or 0)
            capacity = int(e.get("capacity") or 0)
            event_date = e.get("date")
            is_upcoming = False
            if event_date:
                if hasattr(event_date, "timestamp"):
                    is_upcoming = event_date > datetime.now()
                else:
                    try:
                        is_upcoming = datetime.fromisoformat(str(event_date)) > datetime.now()
                    except Exception:
                        pass
            if is_upcoming:
                upcoming_count += 1
            event_participation.append({
                "id": e["id"],
                "name": e["name"],
                "category": e.get("category"),
                "registered": registered,
                "capacity": capacity,
                "fill_percentage": round((registered / capacity * 100) if capacity else 0, 1)
            })

        return jsonify({
            "total_events": total_events,
            "total_participants": total_participants,
            "upcoming_events": upcoming_count,
            "most_popular_event": most_popular,
            "category_distribution": cat_counts,
            "event_participation": event_participation
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def admin_login():
    """
    POST /api/admin/login
    Body: { email, password }
    """
    data = request.get_json()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if email == Config.ADMIN_EMAIL and password == Config.ADMIN_PASSWORD:
        return jsonify({
            "success": True,
            "message": "Login successful",
            "admin": {"email": email}
        }), 200
    return jsonify({"success": False, "message": "Invalid credentials"}), 401
