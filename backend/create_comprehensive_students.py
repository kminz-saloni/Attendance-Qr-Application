import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_app.settings')
django.setup()

from users.models import User, Student, Subject, ClassGroup
import random

def create_comprehensive_students():
    """Create students for years 1-3 ensuring all subjects are covered"""
    print("\n" + "="*80)
    print("CREATING COMPREHENSIVE STUDENT DATA")
    print("="*80)
    
    # Get subjects by year
    subjects_by_year = {
        1: list(Subject.objects.filter(year=1).order_by('code')),
        2: list(Subject.objects.filter(year=2).order_by('code')),
        3: list(Subject.objects.filter(year=3).order_by('code')),
    }
    
    print(f"\nSubjects available:")
    for year, subjects in subjects_by_year.items():
        print(f"  Year {year}: {len(subjects)} subjects")
    
    students_created = []
    
    # For each year, create enough students to cover all subjects
    for year in [1, 2, 3]:
        year_subjects = subjects_by_year[year]
        num_subjects = len(year_subjects)
        
        # Calculate how many students needed (each takes 7 subjects)
        num_students = (num_subjects + 6) // 7  # Round up
        
        print(f"\n{'='*80}")
        print(f"YEAR {year} - Creating {num_students} students to cover {num_subjects} subjects")
        print(f"{'='*80}")
        
        subject_index = 0
        
        for i in range(num_students):
            # Create unique username
            username = f"student_y{year}_{chr(65+i)}"  # student_y1_A, student_y1_B, etc.
            
            # Select 7 subjects (cycling through all subjects)
            selected_subjects = []
            for j in range(7):
                if subject_index < len(year_subjects):
                    selected_subjects.append(year_subjects[subject_index])
                    subject_index += 1
                else:
                    # Wrap around if we run out
                    subject_index = 0
                    selected_subjects.append(year_subjects[subject_index])
                    subject_index += 1
            
            # Determine department based on subjects
            dept = 'CSE' if i % 3 == 0 else ('ECE' if i % 3 == 1 else 'EE')
            section = 'A' if i % 2 == 0 else 'B'
            
            # Create user
            try:
                user = User.objects.create_user(
                    username=username,
                    password='student123',
                    first_name=f'Student{year}{chr(65+i)}',
                    last_name=f'Year{year}',
                    email=f'{username}@example.com',
                    role='student'
                )
                
                # Create student
                student = Student.objects.create(
                    user=user,
                    department=dept,
                    section=section,
                    year=year
                )
                
                # Add subjects
                student.subjects.set(selected_subjects)
                student.save()
                
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
                
                student.class_group = class_group
                student.save()
                
                subject_codes = ', '.join([s.code for s in selected_subjects])
                print(f"\n✓ Created: {username}")
                print(f"  Name: {user.first_name} {user.last_name}")
                print(f"  Password: student123")
                print(f"  Department: {dept}, Section: {section}, Year: {year}")
                print(f"  Class Group: {class_group.name} {'(NEW)' if created else '(REUSED)'}")
                print(f"  Subjects: {subject_codes}")
                
                students_created.append(student)
                
            except Exception as e:
                print(f"\n✗ Error creating {username}: {str(e)}")
    
    # Summary
    print(f"\n{'='*80}")
    print(f"SUMMARY")
    print(f"{'='*80}")
    print(f"Total students created: {len(students_created)}")
    
    # Check subject coverage
    print(f"\nSubject Coverage Check:")
    for year in [1, 2, 3]:
        year_subjects = subjects_by_year[year]
        covered_subjects = set()
        
        for student in Student.objects.filter(year=year):
            for subject in student.subjects.all():
                covered_subjects.add(subject.id)
        
        coverage = len(covered_subjects) / len(year_subjects) * 100
        print(f"  Year {year}: {len(covered_subjects)}/{len(year_subjects)} subjects covered ({coverage:.1f}%)")
    
    print(f"\nClass Groups Created:")
    for group in ClassGroup.objects.all().order_by('year', 'department', 'section'):
        student_count = Student.objects.filter(class_group=group).count()
        print(f"  {group.name}: {student_count} students")
    
    print(f"\n{'='*80}\n")

if __name__ == '__main__':
    create_comprehensive_students()
