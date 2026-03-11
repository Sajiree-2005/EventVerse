import mysql.connector
from mysql.connector import Error
from config import Config


def get_connection():
    """Create and return a MySQL database connection."""
    try:
        conn = mysql.connector.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            autocommit=False
        )
        return conn
    except Error as e:
        raise ConnectionError(f"Failed to connect to MySQL: {e}")


def execute_query(query: str, params: tuple = None, fetch: str = None):
    """
    Execute a query and optionally fetch results.
    fetch: 'one', 'all', or None (for INSERT/UPDATE/DELETE)
    Returns (result, lastrowid) for write ops, or result for reads.
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, params or ())
        if fetch == "one":
            result = cursor.fetchone()
            conn.commit()
            return result
        elif fetch == "all":
            result = cursor.fetchall()
            conn.commit()
            return result
        else:
            conn.commit()
            return cursor.lastrowid
    except Error as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()
