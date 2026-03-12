from flask import Blueprint
from controllers.feedback_controller import (
    submit_feedback_handler, get_event_feedback_handler
)

feedback_bp = Blueprint("feedback", __name__)

feedback_bp.route("/feedback", methods=["POST"])(submit_feedback_handler)
feedback_bp.route("/events/<int:event_id>/feedback", methods=["GET"])(get_event_feedback_handler)
