import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_app.settings')
django.setup()

from users.models import Student, ClassGroup

print("\n" + "="*80)
print("CLASS GROUP ANALYSIS")
print("="*80)

# Get class groups 7 and 14
cg7 = ClassGroup.objects.get(id=7)
cg14 = ClassGroup.objects.get(id=14)

print(f"\nClass Group 7: {cg7.name}")
print(f"  Subjects: {[s.code for s in cg7.subjects.all().order_by('code')]}")
print(f"  Hash: {cg7.subjects_hash}")

print(f"\nClass Group 14: {cg14.name}")
print(f"  Subjects: {[s.code for s in cg14.subjects.all().order_by('code')]}")
print(f"  Hash: {cg14.subjects_hash}")

print(f"\n{'='*80}")
print("ISSUE: Different subject combinations = Different class groups")
print("SOLUTION: Students must select the SAME 7 subjects to be in the same group")
print(f"{'='*80}\n")
