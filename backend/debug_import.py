import os
import django
import sys

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_app.settings')
django.setup()

try:
    from users.views import UpcomingSessionsView
    print("Successfully imported UpcomingSessionsView")
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Other Error: {e}")
