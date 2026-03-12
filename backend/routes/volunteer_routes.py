from flask import Blueprint
from controllers.volunteer_controller import (
    volunteer_for_event, cancel_volunteering,
    get_student_volunteer_list, get_event_volunteer_list
)

volunteer_bp = Blueprint("volunteer", __name__)

volunteer_bp.route("/volunteer", methods=["POST"])(volunteer_for_event)
volunteer_bp.route("/volunteer/cancel", methods=["POST"])(cancel_volunteering)
volunteer_bp.route("/student/volunteering", methods=["GET"])(get_student_volunteer_list)
volunteer_bp.route("/events/<int:event_id>/volunteers", methods=["GET"])(get_event_volunteer_list)
