import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_app.settings')
django.setup()

from users.models import User, Faculty
from django.contrib.auth import authenticate

# Check if faculty_sm exists
username = 'faculty_sm'
print(f"\n{'='*80}")
print(f"Checking credentials for: {username}")
print(f"{'='*80}\n")

try:
    user = User.objects.get(username=username)
    print(f"✓ User found:")
    print(f"  Username: {user.username}")
    print(f"  Email: {user.email}")
    print(f"  First Name: {user.first_name}")
    print(f"  Last Name: {user.last_name}")
    print(f"  Role: {user.role}")
    print(f"  Is Active: {user.is_active}")
    print(f"  Has Usable Password: {user.has_usable_password()}")
    
    # Try to authenticate
    print(f"\nTesting authentication with password 'faculty123':")
    auth_user = authenticate(username=username, password='faculty123')
    if auth_user:
        print(f"✓ Authentication SUCCESSFUL")
    else:
        print(f"✗ Authentication FAILED")
        print(f"\nResetting password to 'faculty123'...")
        user.set_password('faculty123')
        user.save()
        print(f"✓ Password reset complete. Try logging in again.")
    
    # Check if faculty profile exists
    try:
        faculty = Faculty.objects.get(user=user)
        print(f"\n✓ Faculty profile found:")
        print(f"  Subjects assigned: {faculty.subjects.count()}")
    except Faculty.DoesNotExist:
        print(f"\n✗ Faculty profile NOT found")
        
except User.DoesNotExist:
    print(f"✗ User '{username}' does NOT exist in database")
    print(f"\nAvailable faculty usernames:")
    for user in User.objects.filter(role='faculty'):
        print(f"  - {user.username}")

print(f"\n{'='*80}\n")
