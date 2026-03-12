from flask import Blueprint
from controllers.notification_controller import (
    list_notifications, mark_read, mark_all_notifications_read
)

notification_bp = Blueprint("notification", __name__)

notification_bp.route("/student/notifications", methods=["GET"])(list_notifications)
notification_bp.route("/notifications/read", methods=["POST"])(mark_read)
notification_bp.route("/notifications/read-all", methods=["POST"])(mark_all_notifications_read)
