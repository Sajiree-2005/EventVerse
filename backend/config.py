import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", 3306))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "eventverse_db")

    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    DEBUG = os.getenv("FLASK_DEBUG", "True") == "True"

    # Admin
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@eventverse.com")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
