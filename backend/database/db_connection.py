import pymysql
import pymysql.cursors
from config import Config


def get_connection():
    """Create and return a PyMySQL database connection."""
    try:
        conn = pymysql.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=False,
            charset="utf8mb4",
        )
        return conn
    except pymysql.Error as e:
        raise ConnectionError(f"Failed to connect to MySQL: {e}")


def execute_query(query: str, params: tuple = None, fetch: str = None):
    """
    Execute a query and optionally fetch results.
    fetch: 'one', 'all', or None (INSERT/UPDATE/DELETE)
    Returns lastrowid for write ops, or result for reads.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params or ())
            if fetch == "one":
                result = cursor.fetchone()
            elif fetch == "all":
                result = cursor.fetchall()
            else:
                result = cursor.lastrowid
        conn.commit()
        return result
    except pymysql.Error as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
