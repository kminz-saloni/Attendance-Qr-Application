import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_app.settings')
django.setup()

from users.models import User, Student, Faculty, Subject, ClassGroup
import random

def create_test_students():
    """Create test students with 7 subjects each"""
    print("Creating test students...")
    print("="*60)
    
    # Delete existing students
    print("\nDeleting existing students...")
    Student.objects.all().delete()
    User.objects.filter(role='student').delete()
    
    # Get all subjects by year
    subjects_by_year = {
        1: list(Subject.objects.filter(year=1)),
        2: list(Subject.objects.filter(year=2)),
        3: list(Subject.objects.filter(year=3)),
    }
    
    # Test data: students with different combinations
    test_students = [
        # CSE 2nd Year Section A - Group 1 (same 7 subjects)
        {
            'username': 'student_cse_2a_1',
            'password': 'student123',
            'first_name': 'Rahul',
            'last_name': 'Sharma',
            'email': 'rahul@example.com',
            'department': 'CSE',
            'section': 'A',
            'year': 2,
            'subject_indices': [0, 1, 2, 3, 4, 5, 6]  # First 7 subjects
        },
        {
            'username': 'student_cse_2a_2',
            'password': 'student123',
            'first_name': 'Priya',
            'last_name': 'Kumar',
            'email': 'priya@example.com',
            'department': 'CSE',
            'section': 'A',
            'year': 2,
            'subject_indices': [0, 1, 2, 3, 4, 5, 6]  # Same 7 subjects - should reuse class group
        },
        {
            'username': 'student_cse_2a_3',
            'password': 'student123',
            'first_name': 'Amit',
            'last_name': 'Patel',
            'email': 'amit@example.com',
            'department': 'CSE',
            'section': 'A',
            'year': 2,
            'subject_indices': [0, 1, 2, 3, 4, 5, 6]  # Same 7 subjects - should reuse class group
        },
        
        # CSE 2nd Year Section A - Group 2 (different 7 subjects)
        {
            'username': 'student_cse_2a_4',
            'password': 'student123',
            'first_name': 'Sneha',
            'last_name': 'Gupta',
            'email': 'sneha@example.com',
            'department': 'CSE',
            'section': 'A',
            'year': 2,
            'subject_indices': [1, 2, 3, 4, 5, 6, 7]  # Different combination - new class group
        },
        
        # CSE 2nd Year Section B
        {
            'username': 'student_cse_2b_1',
            'password': 'student123',
            'first_name': 'Vikram',
            'last_name': 'Singh',
            'email': 'vikram@example.com',
            'department': 'CSE',
            'section': 'B',
            'year': 2,
            'subject_indices': [0, 1, 2, 3, 4, 5, 6]
        },
        
        # ECE 2nd Year Section A
        {
            'username': 'student_ece_2a_1',
            'password': 'student123',
            'first_name': 'Anjali',
            'last_name': 'Verma',
            'email': 'anjali@example.com',
            'department': 'ECE',
            'section': 'A',
            'year': 2,
            'subject_indices': [0, 1, 2, 3, 4, 5, 6]
        },
        
        # EE 2nd Year Section A
        {
            'username': 'student_ee_2a_1',
            'password': 'student123',
            'first_name': 'Rohan',
            'last_name': 'Mehta',
            'email': 'rohan@example.com',
            'department': 'EE',
            'section': 'A',
            'year': 2,
            'subject_indices': [0, 1, 2, 3, 4, 5, 6]
        },
        
        # 3rd Year students
        {
            'username': 'student_cse_3a_1',
            'password': 'student123',
            'first_name': 'Neha',
            'last_name': 'Reddy',
            'email': 'neha@example.com',
            'department': 'CSE',
            'section': 'A',
            'year': 3,
            'subject_indices': [0, 1, 2, 3, 4, 5, 6]
        },
    ]
    
    created_students = []
    class_groups_created = set()
    
    for student_data in test_students:
        # Create user
        user = User.objects.create_user(
            username=student_data['username'],
            password=student_data['password'],
            first_name=student_data['first_name'],
            last_name=student_data['last_name'],
            email=student_data['email'],
            role='student'
        )
        
        # Create student
        student = Student.objects.create(
            user=user,
            department=student_data['department'],
            section=student_data['section'],
            year=student_data['year']
        )
        
        # Get 7 subjects for this student's year
        year_subjects = subjects_by_year[student_data['year']]
        selected_subjects = [year_subjects[i] for i in student_data['subject_indices']]
        
        # Add subjects
        student.subjects.set(selected_subjects)
        student.save()  # This generates subjects_hash
        
        # Find or create class group
        class_group, created = ClassGroup.objects.get_or_create(
            department=student.department,
            section=student.section,
            year=student.year,
            subjects_hash=student.subjects_hash
        )
        
        if created:
            class_group.subjects.set(selected_subjects)
            class_group.save()
            class_groups_created.add(class_group.name)
        
        student.class_group = class_group
        student.save()
        
        subject_codes = ', '.join([s.code for s in selected_subjects])
        print(f"\n✓ Created: {student_data['first_name']} {student_data['last_name']}")
        print(f"  Username: {student_data['username']}")
        print(f"  Password: {student_data['password']}")
        print(f"  Class Group: {class_group.name} {'(NEW)' if created else '(REUSED)'}")
        print(f"  Subjects: {subject_codes}")
        
        created_students.append(student)
    
    print("\n" + "="*60)
    print(f"Summary:")
    print(f"  Created: {len(created_students)} students")
    print(f"  Class Groups Created: {len(class_groups_created)}")
    print(f"  Total Class Groups in DB: {ClassGroup.objects.count()}")
    print(f"\nClass Groups:")
    for group in ClassGroup.objects.all().order_by('year', 'department', 'section'):
        student_count = Student.objects.filter(class_group=group).count()
        print(f"  - {group.name}: {student_count} students")
    print("="*60)

if __name__ == '__main__':
    create_test_students()
