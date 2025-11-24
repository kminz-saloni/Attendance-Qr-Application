import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Database connection parameters
DB_NAME = 'attendance_db'
DB_USER = 'postgres'
DB_PASSWORD = '12345678'
DB_HOST = 'localhost'
DB_PORT = '5432'

def reset_database():
    """Drop and recreate the PostgreSQL database"""
    try:
        # Connect to PostgreSQL server (to the default 'postgres' database)
        conn = psycopg2.connect(
            dbname='postgres',
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Terminate all connections to the database
        print(f"Terminating all connections to {DB_NAME}...")
        cursor.execute(f"""
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '{DB_NAME}'
            AND pid <> pg_backend_pid();
        """)
        
        # Drop the database if it exists
        print(f"Dropping database {DB_NAME}...")
        cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME};")
        
        # Create the database
        print(f"Creating database {DB_NAME}...")
        cursor.execute(f"CREATE DATABASE {DB_NAME};")
        
        print(f"✓ Database {DB_NAME} has been reset successfully!")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"✗ Error resetting database: {e}")
        raise

if __name__ == '__main__':
    reset_database()
