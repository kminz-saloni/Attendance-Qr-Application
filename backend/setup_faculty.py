import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_app.settings')
django.setup()

from users.models import User, Faculty, Subject

# Faculty data with their initials and full names
FACULTY_DATA = [
    ('KS', 'Mr. Khushwant Sehra', 'assistant_professor'),
    ('DP', 'Dr. Deepika', 'professor'),
    ('JS', 'Mr. Jatin Sharma', 'assistant_professor'),
    ('US', 'Mr. Unmesh Shukla', 'assistant_professor'),
    ('AKG', 'Dr. Ajay Kumar Gupta', 'professor'),
    ('UK', 'Dr. Utkarsh', 'professor'),
    ('SK', 'Dr. Sunil Kumar', 'professor'),
    ('PRT', 'Dr. Praveen Thakur', 'professor'),
    ('GS', 'Dr. Gurinder Singh', 'professor'),
    ('GB', 'Dr. Geetanjali Bhola', 'professor'),
    ('JJ', 'Dr. Juhi Jain', 'assistant_professor'),
    ('AS', 'Dr. Amit Sanyal', 'professor'),
]

def setup_faculty():
    """Create faculty members and assign subjects"""
    print("Setting up faculty members...")
    print("="*60)
    
    # Delete all existing faculty and their users
    print("\nDeleting existing faculty...")
    Faculty.objects.all().delete()
    User.objects.filter(role='faculty').delete()
    
    # Get all subjects
    all_subjects = list(Subject.objects.all().order_by('year', 'code'))
    total_subjects = len(all_subjects)
    
    if total_subjects == 0:
        print("ERROR: No subjects found in database. Please run populate_subjects.py first.")
        return
    
    print(f"Found {total_subjects} subjects to distribute among {len(FACULTY_DATA)} faculty members")
    
    # Calculate subjects per faculty (ensure all subjects are covered)
    subjects_per_faculty = total_subjects // len(FACULTY_DATA)
    extra_subjects = total_subjects % len(FACULTY_DATA)
    
    created_faculty = []
    subject_index = 0
    
    for idx, (initials, full_name, role) in enumerate(FACULTY_DATA):
        # Create user account
        username = f"faculty_{initials.lower()}"
        password = "faculty123"  # Default password
        
        # Extract first and last name
        name_parts = full_name.replace('Mr. ', '').replace('Dr. ', '').split()
        first_name = name_parts[0]
        last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'role': 'faculty',
                'email': f'{username}@university.edu'
            }
        )
        
        if created:
            user.set_password(password)
            user.save()
        
        # Create faculty profile
        faculty, created = Faculty.objects.get_or_create(
            user=user,
            defaults={'role': role}
        )
        
        # Assign subjects
        num_subjects = subjects_per_faculty + (1 if idx < extra_subjects else 0)
        assigned_subjects = all_subjects[subject_index:subject_index + num_subjects]
        subject_index += num_subjects
        
        faculty.subjects.set(assigned_subjects)
        
        print(f"\n✓ Created: {full_name} ({initials})")
        print(f"  Username: {username}")
        print(f"  Password: {password}")
        print(f"  Role: {role}")
        print(f"  Assigned {len(assigned_subjects)} subjects:")
        for subj in assigned_subjects:
            print(f"    - {subj.code}: {subj.name} (Year {subj.year})")
        
        created_faculty.append(faculty)
    
    print("\n" + "="*60)
    print(f"Summary:")
    print(f"  Created: {len(created_faculty)} faculty members")
    print(f"  Total subjects assigned: {sum(f.subjects.count() for f in created_faculty)}")
    print(f"  All subjects covered: {'✓ Yes' if subject_index == total_subjects else '✗ No'}")
    
    # Verify all subjects have at least one faculty
    unassigned_subjects = []
    for subject in all_subjects:
        if not Faculty.objects.filter(subjects=subject).exists():
            unassigned_subjects.append(subject)
    
    if unassigned_subjects:
        print(f"\n⚠ WARNING: {len(unassigned_subjects)} subjects have no faculty assigned:")
        for subj in unassigned_subjects:
            print(f"    - {subj.code}: {subj.name}")
    else:
        print(f"\n✓ All subjects have at least one faculty member assigned")
    
    print("="*60)

if __name__ == '__main__':
    setup_faculty()
