import os
import django
from datetime import datetime, timedelta, time

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_app.settings')
django.setup()

from users.models import User, Faculty, Student, Subject, ClassGroup, Session
from django.utils import timezone

def setup_data():
    print("Setting up test data...")

    # 1. Create Faculty
    print("Creating Faculty...")
    faculty_user, created = User.objects.get_or_create(
        username='test_faculty',
        defaults={
            'email': 'faculty@test.com',
            'first_name': 'Test',
            'last_name': 'Faculty',
            'role': 'faculty'
        }
    )
    if created:
        print("  Faculty user created")
    else:
        print("  Faculty user already exists")
    
    faculty_user.set_password('testpass123')
    faculty_user.save()

    # Create Faculty profile
    subject_math, _ = Subject.objects.get_or_create(name='Mathematics')
    
    faculty_profile, created = Faculty.objects.get_or_create(
        user=faculty_user,
        defaults={'role': 'assistant_professor'}
    )
    faculty_profile.subjects.add(subject_math)
    print("  Faculty profile ready")

    # 2. Create ClassGroup
    print("Creating ClassGroup...")
    class_group, created = ClassGroup.objects.get_or_create(
        year=2,
        department='CSE',
        section='A'
    )
    class_group.subjects.add(subject_math)
    print(f"  ClassGroup: {class_group.department} {class_group.year}-{class_group.section}")

    # 3. Create Session
    print("Creating Session...")
    # Create a session for today
    now = timezone.now()
    start_time = now.time()
    end_time = (now + timedelta(hours=1)).time()
    
    session, created = Session.objects.get_or_create(
        teacher=faculty_profile,
        subject=subject_math,
        class_group=class_group,
        date=now.date(),
        defaults={
            'start_time': start_time,
            'end_time': end_time,
            'active': True
        }
    )
    print(f"  Session ID: {session.id}")
    print(f"  Active: {session.active}")

    # 4. Ensure Student is in the right class
    print("Verifying Student...")
    try:
        student_user = User.objects.get(username='test_student')
        student = Student.objects.get(user=student_user)
        student.year = 2
        student.department = 'CSE'
        student.section = 'A'
        student.save()
        print("  Student class info verified")
    except User.DoesNotExist:
        print("  Student 'test_student' not found! Run the previous test script first.")

    print("\nData setup complete!")
    return session.id

if __name__ == '__main__':
    setup_data()
