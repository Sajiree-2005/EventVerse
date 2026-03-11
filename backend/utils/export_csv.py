import io
import pandas as pd
from flask import send_file, jsonify
from models.registration_model import get_event_participants
from models.event_model import get_event_by_id


def export_participants_csv(event_id: int):
    """
    GET /api/events/<id>/export
    Download a CSV file of all registered participants for an event.
    """
    try:
        event = get_event_by_id(event_id)
        if not event:
            return jsonify({"error": "Event not found"}), 404

        participants = get_event_participants(event_id)

        if not participants:
            # Return empty CSV with headers
            rows = []
        else:
            rows = [
                {
                    "Student Name": p["studentName"],
                    "Student Email": p["studentEmail"],
                    "Registration Date": (
                        p["registeredAt"].strftime("%Y-%m-%d %H:%M:%S")
                        if hasattr(p["registeredAt"], "strftime")
                        else str(p["registeredAt"])
                    )
                }
                for p in participants
            ]

        df = pd.DataFrame(rows) if rows else pd.DataFrame(
            columns=["Student Name", "Student Email", "Registration Date"]
        )

        output = io.BytesIO()
        df.to_csv(output, index=False, encoding="utf-8")
        output.seek(0)

        # Sanitize filename
        safe_name = event["name"].replace(" ", "_").replace("/", "-")
        filename = f"{safe_name}_participants.csv"

        return send_file(
            output,
            mimetype="text/csv",
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
