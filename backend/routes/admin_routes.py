from flask import Blueprint
from controllers.admin_controller import get_analytics, admin_login, get_student_analytics

admin_bp = Blueprint("admin", __name__)

admin_bp.route("/admin/analytics", methods=["GET"])(get_analytics)
admin_bp.route("/admin/login", methods=["POST"])(admin_login)
admin_bp.route("/student/analytics", methods=["GET"])(get_student_analytics)
