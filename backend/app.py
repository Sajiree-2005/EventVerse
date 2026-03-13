from flask import Flask, jsonify, request
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

    @app.route("/api/test-email", methods=["GET"])
    def test_email():
        """
        Diagnostic — visit in browser to test your email config.
        Usage: http://localhost:5000/api/test-email?to=youremail@gmail.com
        """
        import os, smtplib
        from dotenv import load_dotenv
        from email.mime.text import MIMEText
        load_dotenv(override=True)   # force re-read .env right now

        to_addr   = request.args.get("to", "").strip()
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER", "").strip()
        smtp_pass = os.getenv("SMTP_PASS", "").strip()

        diag = {
            "SMTP_HOST": smtp_host,
            "SMTP_PORT": smtp_port,
            "SMTP_USER": smtp_user if smtp_user else "NOT SET",
            "SMTP_PASS": ("set (" + str(len(smtp_pass)) + " chars)") if smtp_pass else "NOT SET",
            "send_to":   to_addr or "not provided",
        }

        if not smtp_user or not smtp_pass:
            return jsonify({
                "status": "error",
                "message": "SMTP_USER or SMTP_PASS not set in backend/.env",
                "config": diag
            }), 500

        if not to_addr:
            return jsonify({
                "status": "error",
                "message": "Add ?to=your@email.com to the URL",
                "config": diag
            }), 400

        try:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as srv:
                srv.ehlo()
                srv.starttls()
                srv.ehlo()
                srv.login(smtp_user, smtp_pass)
                msg = MIMEText(
                    "<h2 style='color:#A60C25'>EventVerse email is working!</h2>"
                    "<p>Your SMTP config is correct. Registration emails will now be delivered.</p>",
                    "html"
                )
                msg["Subject"] = "EventVerse Email Test - It works!"
                msg["From"]    = f"EventVerse MMCOE <{smtp_user}>"
                msg["To"]      = to_addr
                srv.sendmail(smtp_user, [to_addr], msg.as_string())

            return jsonify({
                "status": "EMAIL SENT - check your inbox",
                "to": to_addr,
                "from": smtp_user,
                "config": diag
            }), 200

        except smtplib.SMTPAuthenticationError as e:
            return jsonify({
                "status": "AUTH FAILED",
                "error": str(e),
                "fix": "Use a Gmail App Password (not your regular password). Generate one at https://myaccount.google.com/apppasswords",
                "config": diag
            }), 500
        except Exception as e:
            return jsonify({
                "status": "FAILED",
                "error": str(e),
                "config": diag
            }), 500

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Route not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    print("EventVerse API running at http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=Config.DEBUG)
