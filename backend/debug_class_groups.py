import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_app.settings')
django.setup()

from users.models import Student, Session, ClassGroup

print("\n" + "="*80)
print("CLASS GROUP MISMATCH DEBUGGER")
print("="*80)

# Show all class groups
print("\n📚 ALL CLASS GROUPS:")
print("-"*80)
for cg in ClassGroup.objects.all().order_by('id'):
    student_count = Student.objects.filter(class_group=cg).count()
    subject_codes = ', '.join([s.code for s in cg.subjects.all()[:5]])
    if cg.subjects.count() > 5:
        subject_codes += f" (+{cg.subjects.count()-5} more)"
    print(f"ID {cg.id}: {cg.name} - {student_count} students - Subjects: {subject_codes}")

# Show class group 7 details
print("\n" + "="*80)
print("🎯 CLASS GROUP 7 (Session's group):")
print("="*80)
cg7 = ClassGroup.objects.filter(id=7).first()
if cg7:
    print(f"Name: {cg7.name}")
    print(f"Year: {cg7.year}, Dept: {cg7.department}, Section: {cg7.section}")
    print(f"\nSubjects ({cg7.subjects.count()}):")
    for subj in cg7.subjects.all():
        print(f"  - {subj.code}: {subj.name}")
    print(f"\nStudents in this group:")
    for student in Student.objects.filter(class_group=cg7):
        print(f"  - {student.user.username} ({student.user.first_name} {student.user.last_name})")
else:
    print("Class group 7 not found!")

# Show class group 14 details
print("\n" + "="*80)
print("👤 CLASS GROUP 14 (Student's group):")
print("="*80)
cg14 = ClassGroup.objects.filter(id=14).first()
if cg14:
    print(f"Name: {cg14.name}")
    print(f"Year: {cg14.year}, Dept: {cg14.department}, Section: {cg14.section}")
    print(f"\nSubjects ({cg14.subjects.count()}):")
    for subj in cg14.subjects.all():
        print(f"  - {subj.code}: {subj.name}")
    print(f"\nStudents in this group:")
    for student in Student.objects.filter(class_group=cg14):
        print(f"  - {student.user.username} ({student.user.first_name} {student.user.last_name})")
else:
    print("Class group 14 not found!")

# Show active sessions
print("\n" + "="*80)
print("📅 ACTIVE SESSIONS:")
print("="*80)
for session in Session.objects.filter(active=True):
    print(f"\nSession ID {session.id}:")
    print(f"  Subject: {session.subject.code} - {session.subject.name}")
    print(f"  Class Group: {session.class_group.name} (ID: {session.class_group.id})")
    print(f"  Teacher: {session.teacher.user.first_name} {session.teacher.user.last_name}")
    print(f"  Date: {session.date}, Time: {session.start_time} - {session.end_time}")

print("\n" + "="*80)
print("💡 SOLUTION:")
print("="*80)
print("The student needs to either:")
print("1. Be in the same class group as the session (class group 7)")
print("2. OR the faculty needs to create a session for class group 14")
print("\nTo find the right student, look for students in class group 7 above.")
print("="*80 + "\n")
