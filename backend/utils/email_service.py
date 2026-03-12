"""Email service for EventVerse. Set SMTP_* env vars for real sending."""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

SMTP_HOST  = os.getenv("SMTP_HOST", "")
SMTP_PORT  = int(os.getenv("SMTP_PORT", 587))
SMTP_USER  = os.getenv("SMTP_USER", "")
SMTP_PASS  = os.getenv("SMTP_PASS", "")
FROM_NAME  = os.getenv("FROM_NAME", "EventVerse MMCOE")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@eventverse.mmcoe.edu.in")


def _send(to_email: str, subject: str, html_body: str) -> bool:
    if not SMTP_HOST or not SMTP_USER:
        print(f"[EMAIL MOCK] To: {to_email} | Subject: {subject}")
        return True
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as srv:
            srv.ehlo(); srv.starttls(); srv.login(SMTP_USER, SMTP_PASS)
            srv.sendmail(FROM_EMAIL, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return False


def _wrap(content: str) -> str:
    year = datetime.now().year
    return f"""<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
body{{font-family:Inter,Arial,sans-serif;background:#f7f7f7;margin:0;padding:0}}
.w{{max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}}
.hd{{background:#A60C25;padding:28px 32px}}.hd h1{{color:#fff;margin:0;font-size:22px}}.hd p{{color:rgba(255,255,255,.8);margin:4px 0 0;font-size:13px}}
.bd{{padding:32px}}.bd h2{{color:#212529;font-size:18px;margin:0 0 8px}}.bd p{{color:#555;line-height:1.7;margin:0 0 16px;font-size:14px}}
.box{{background:#fdf1f3;border-left:4px solid #A60C25;border-radius:8px;padding:16px 20px;margin:20px 0}}
.box p{{margin:4px 0;font-size:13px;color:#333}}.box strong{{color:#A60C25}}
.btn{{display:inline-block;background:#A60C25;color:#fff!important;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin:8px 0}}
.ft{{padding:20px 32px;background:#f7f7f7;text-align:center}}.ft p{{color:#aaa;font-size:12px;margin:0}}
</style></head><body>
<div class="w">
  <div class="hd"><h1>📅 EventVerse</h1><p>MMCOE Campus Event Management Platform</p></div>
  <div class="bd">{content}</div>
  <div class="ft"><p>© {year} EventVerse – MMCOE Pune</p><p style="margin-top:4px">Automated email – do not reply.</p></div>
</div></body></html>"""


def send_registration_confirmation(student_name, student_email, event_name, event_date, event_venue, event_id):
    c = f"""<h2>🎉 Registration Confirmed!</h2>
<p>Hi <strong>{student_name}</strong>, you're registered!</p>
<div class="box"><p><strong>Event:</strong> {event_name}</p><p><strong>Date:</strong> {event_date}</p>
<p><strong>Venue:</strong> {event_venue}</p></div>
<p>A reminder will be sent 24 hours before the event.</p>
<a href="http://localhost:5173/events/{event_id}" class="btn">View Event →</a>"""
    return _send(student_email, f"✅ Registered: {event_name} – EventVerse", _wrap(c))


def send_team_registration_confirmation(lead_name, lead_email, team_name, event_name, event_date, event_venue, member_count, event_id):
    c = f"""<h2>🏆 Team Registered!</h2>
<p>Hi <strong>{lead_name}</strong>, team <strong>{team_name}</strong> is registered!</p>
<div class="box"><p><strong>Event:</strong> {event_name}</p><p><strong>Date:</strong> {event_date}</p>
<p><strong>Venue:</strong> {event_venue}</p><p><strong>Team Size:</strong> {member_count + 1} members</p></div>
<a href="http://localhost:5173/events/{event_id}" class="btn">View Event →</a>"""
    return _send(lead_email, f"✅ Team Registered: {team_name} – EventVerse", _wrap(c))


def send_volunteer_confirmation(student_name, student_email, event_name, event_date, event_venue, event_id):
    c = f"""<h2>🙌 Volunteer Application Received!</h2>
<p>Hi <strong>{student_name}</strong>, thanks for volunteering!</p>
<div class="box"><p><strong>Event:</strong> {event_name}</p><p><strong>Date:</strong> {event_date}</p>
<p><strong>Venue:</strong> {event_venue}</p><p><strong>Status:</strong> Pending Approval</p></div>
<a href="http://localhost:5173/events/{event_id}" class="btn">View Event →</a>"""
    return _send(student_email, f"🙌 Volunteer Application: {event_name} – EventVerse", _wrap(c))


def send_event_reminder(student_name, student_email, event_name, event_date, event_venue, event_id):
    c = f"""<h2>⏰ Event Tomorrow!</h2>
<p>Hi <strong>{student_name}</strong>, your event is tomorrow!</p>
<div class="box"><p><strong>Event:</strong> {event_name}</p><p><strong>Date:</strong> {event_date}</p>
<p><strong>Venue:</strong> {event_venue}</p></div>
<p>Arrive 15 min early. Bring your college ID.</p>
<a href="http://localhost:5173/events/{event_id}" class="btn">View Event →</a>"""
    return _send(student_email, f"⏰ Reminder: {event_name} is Tomorrow! – EventVerse", _wrap(c))


def send_post_event_followup(student_name, student_email, event_name, event_id):
    c = f"""<h2>🌟 How Was the Event?</h2>
<p>Hi <strong>{student_name}</strong>, hope you enjoyed <strong>{event_name}</strong>!</p>
<p>Share your feedback – it takes 30 seconds and helps us improve.</p>
<a href="http://localhost:5173/dashboard?feedback={event_id}" class="btn">Submit Feedback →</a>"""
    return _send(student_email, f"⭐ Feedback: {event_name} – EventVerse", _wrap(c))


def send_cancellation_email(student_name, student_email, event_name, event_date):
    c = f"""<h2>Registration Cancelled</h2>
<p>Hi <strong>{student_name}</strong>, your registration has been cancelled.</p>
<div class="box"><p><strong>Event:</strong> {event_name}</p><p><strong>Date:</strong> {event_date}</p></div>
<p>You can re-register from the Events page if spots are available.</p>
<a href="http://localhost:5173/events" class="btn">Browse Events →</a>"""
    return _send(student_email, f"Cancelled: {event_name} – EventVerse", _wrap(c))
