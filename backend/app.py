from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

from routes.event_routes import event_bp
from routes.registration_routes import registration_bp
from routes.admin_routes import admin_bp


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = Config.SECRET_KEY
    app.config["DEBUG"] = Config.DEBUG

    # Enable CORS for all origins (can be restricted in production with environment variables)
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": False,
        }
    })

    # Register blueprints under /api prefix
    app.register_blueprint(event_bp, url_prefix="/api")
    app.register_blueprint(registration_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")

    # Health check
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "message": "EventVerse API is running"}), 200

    # 404 handler
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Route not found"}), 404

    # 500 handler
    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    print("🚀 EventVerse API running at http://localhost:5000")
    print("📋 Available endpoints:")
    print("   GET    /api/health")
    print("   GET    /api/events")
    print("   GET    /api/events/<id>")
    print("   POST   /api/events")
    print("   PUT    /api/events/<id>")
    print("   DELETE /api/events/<id>")
    print("   POST   /api/register")
    print("   GET    /api/events/<id>/participants")
    print("   GET    /api/events/<id>/export")
    print("   GET    /api/student/registrations?email=<email>")
    print("   GET    /api/admin/analytics")
    print("   POST   /api/admin/login")
    app.run(host="0.0.0.0", port=5000, debug=Config.DEBUG)
