import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_app.settings')
django.setup()

from users.models import Faculty, Subject

# Search for Vedic Maths subject
vedic_maths = Subject.objects.filter(name__icontains='vedic').first()

if vedic_maths:
    print(f"\n{'='*80}")
    print(f"Subject: {vedic_maths.code} - {vedic_maths.name}")
    print(f"Year: {vedic_maths.year}")
    print(f"{'='*80}\n")
    
    # Find faculty teaching this subject
    faculty_list = Faculty.objects.filter(subjects=vedic_maths)
    
    if faculty_list.exists():
        print("Faculty teaching this subject:\n")
        print(f"{'Username':<20} {'Name':<30} {'Login Password':<15}")
        print("-"*80)
        for faculty in faculty_list:
            name = f"{faculty.user.first_name} {faculty.user.last_name}"
            print(f"{faculty.user.username:<20} {name:<30} {'faculty123':<15}")
        print("-"*80)
    else:
        print("No faculty assigned to this subject yet.")
else:
    print("\nVedic Maths subject not found in database.")
    print("\nSearching for subjects with 'math' in the name:")
    math_subjects = Subject.objects.filter(name__icontains='math')
    for subject in math_subjects:
        print(f"  - {subject.code}: {subject.name} (Year {subject.year})")

print("\n")
