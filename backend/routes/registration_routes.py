from flask import Blueprint
from controllers.registration_controller import register_student, list_participants, student_dashboard, cancel_registration_handler, register_team
from utils.export_csv import export_participants_csv

registration_bp = Blueprint("registrations", __name__)

registration_bp.route("/register", methods=["POST"])(register_student)
registration_bp.route("/register_team", methods=["POST"])(register_team)
registration_bp.route("/events/<int:event_id>/participants", methods=["GET"])(list_participants)
registration_bp.route("/events/<int:event_id>/export", methods=["GET"])(export_participants_csv)
registration_bp.route("/student/registrations", methods=["GET"])(student_dashboard)
registration_bp.route("/cancel_registration", methods=["POST"])(cancel_registration_handler)
