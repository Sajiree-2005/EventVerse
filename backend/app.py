from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

from routes.event_routes import event_bp
from routes.registration_routes import registration_bp
from routes.admin_routes import admin_bp
from routes.volunteer_routes import volunteer_bp
from routes.notification_routes import notification_bp
from routes.feedback_routes import feedback_bp


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = Config.SECRET_KEY
    app.config["DEBUG"] = Config.DEBUG

    CORS(app, resources={
        r"/api/*": {
            "origins": ["*"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    app.register_blueprint(event_bp,        url_prefix="/api")
    app.register_blueprint(registration_bp, url_prefix="/api")
    app.register_blueprint(admin_bp,        url_prefix="/api")
    app.register_blueprint(volunteer_bp,    url_prefix="/api")
    app.register_blueprint(notification_bp, url_prefix="/api")
    app.register_blueprint(feedback_bp,     url_prefix="/api")

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Route not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    print("🚀 EventVerse API running at http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=Config.DEBUG)
