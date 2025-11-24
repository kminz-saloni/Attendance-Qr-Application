import os
import django
from django.contrib.auth import authenticate

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_app.settings')
django.setup()

from users.models import User

def verify():
    print("Verifying login...")
    user = authenticate(username='test_faculty', password='testpass123')
    if user:
        print(f"Login successful for user: {user.username} (Role: {user.role})")
    else:
        print("Login failed via authenticate()")
        try:
            u = User.objects.get(username='test_faculty')
            print(f"User exists. Active: {u.is_active}")
            print(f"Check password: {u.check_password('testpass123')}")
        except User.DoesNotExist:
            print("User does not exist")

if __name__ == '__main__':
    verify()
