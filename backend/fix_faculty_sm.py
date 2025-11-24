import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_app.settings')
django.setup()

from users.models import User
from django.contrib.auth import authenticate

username = 'faculty_sm'
password = 'faculty123'

print(f"\n{'='*80}")
print(f"Fixing credentials for: {username}")
print(f"{'='*80}\n")

try:
    user = User.objects.get(username=username)
    
    # Force reset password
    user.set_password(password)
    user.is_active = True
    user.save()
    
    print(f"✓ Password reset for: {user.first_name} {user.last_name}")
    print(f"  Username: {username}")
    print(f"  Password: {password}")
    print(f"  Active: {user.is_active}")
    
    # Test authentication immediately
    print(f"\nTesting authentication...")
    auth_user = authenticate(username=username, password=password)
    
    if auth_user:
        print(f"✓ SUCCESS! Authentication works!")
        print(f"\nYou can now login with:")
        print(f"  Username: {username}")
        print(f"  Password: {password}")
    else:
        print(f"✗ FAILED! Authentication still not working")
        print(f"  This is unexpected. Checking user details...")
        print(f"  Has usable password: {user.has_usable_password()}")
        print(f"  Is active: {user.is_active}")
        print(f"  Is staff: {user.is_staff}")
        
except User.DoesNotExist:
    print(f"✗ ERROR: User '{username}' does not exist!")
    print(f"\nCreating user...")
    user = User.objects.create_user(
        username=username,
        password=password,
        email=f'{username}@example.com',
        first_name='Dr. Sunil',
        last_name='Mehta',
        role='faculty'
    )
    print(f"✓ User created successfully!")

print(f"\n{'='*80}\n")
