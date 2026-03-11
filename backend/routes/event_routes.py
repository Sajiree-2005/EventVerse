from flask import Blueprint
from controllers.event_controller import list_events, get_event, add_event, edit_event, remove_event

event_bp = Blueprint("events", __name__)

event_bp.route("/events", methods=["GET"])(list_events)
event_bp.route("/events/<int:event_id>", methods=["GET"])(get_event)
event_bp.route("/events", methods=["POST"])(add_event)
event_bp.route("/events/<int:event_id>", methods=["PUT"])(edit_event)
event_bp.route("/events/<int:event_id>", methods=["DELETE"])(remove_event)
