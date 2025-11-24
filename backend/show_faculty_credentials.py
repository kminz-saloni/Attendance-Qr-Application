import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_app.settings')
django.setup()

from users.models import Faculty

print("\n" + "="*80)
print("FACULTY LOGIN CREDENTIALS")
print("="*80)
print("\nAll faculty accounts use the password: faculty123\n")
print("-"*80)
print(f"{'Username':<20} {'Name':<30} {'Subjects Assigned':<10}")
print("-"*80)

for faculty in Faculty.objects.all().order_by('user__username'):
    name = f"{faculty.user.first_name} {faculty.user.last_name}"
    subject_count = faculty.subjects.count()
    print(f"{faculty.user.username:<20} {name:<30} {subject_count:<10}")

print("-"*80)
print(f"\nTotal Faculty: {Faculty.objects.count()}")
print("\nPassword for all: faculty123")
print("="*80 + "\n")
