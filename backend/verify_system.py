import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_app.settings')
django.setup()

from users.models import User, Student, Faculty, Subject, ClassGroup, Session, Attendance

def verify_system():
    """Verify all business rules and constraints"""
    print("\n" + "="*80)
    print("SYSTEM VERIFICATION REPORT")
    print("="*80)
    
    # 1. Verify Subject-Year Mapping
    print("\n1. SUBJECT-YEAR MAPPING")
    print("-" * 80)
    subjects_by_year = {}
    for year in [1, 2, 3, 4]:
        count = Subject.objects.filter(year=year).count()
        subjects_by_year[year] = count
        print(f"   Year {year}: {count} subjects")
    print(f"   ✓ Total: {Subject.objects.count()} subjects")
    
    # 2. Verify Faculty Subject Assignments
    print("\n2. FACULTY SUBJECT ASSIGNMENTS")
    print("-" * 80)
    faculty_count = Faculty.objects.count()
    print(f"   Total Faculty: {faculty_count}")
    
    unassigned_subjects = []
    for subject in Subject.objects.all():
        if not Faculty.objects.filter(subjects=subject).exists():
            unassigned_subjects.append(subject)
    
    if unassigned_subjects:
        print(f"   ✗ WARNING: {len(unassigned_subjects)} subjects have no faculty assigned")
        for s in unassigned_subjects[:5]:
            print(f"      - {s.code}: {s.name}")
    else:
        print(f"   ✓ All {Subject.objects.count()} subjects have at least one faculty assigned")
    
    # 3. Verify Student Registration (7 subjects)
    print("\n3. STUDENT REGISTRATION (7-SUBJECT RULE)")
    print("-" * 80)
    students = Student.objects.all()
    print(f"   Total Students: {students.count()}")
    
    invalid_students = []
    for student in students:
        subject_count = student.subjects.count()
        if subject_count != 7:
            invalid_students.append((student, subject_count))
    
    if invalid_students:
        print(f"   ✗ ERROR: {len(invalid_students)} students don't have exactly 7 subjects")
        for s, count in invalid_students[:3]:
            print(f"      - {s.user.username}: {count} subjects")
    else:
        print(f"   ✓ All students have exactly 7 subjects")
    
    # 4. Verify Subject-Year Matching for Students
    print("\n4. SUBJECT-YEAR MATCHING")
    print("-" * 80)
    year_mismatch = []
    for student in students:
        for subject in student.subjects.all():
            if subject.year != student.year:
                year_mismatch.append((student, subject))
    
    if year_mismatch:
        print(f"   ✗ ERROR: {len(year_mismatch)} subject-year mismatches found")
        for s, subj in year_mismatch[:3]:
            print(f"      - {s.user.username} (Year {s.year}) has {subj.name} (Year {subj.year})")
    else:
        print(f"   ✓ All student subjects match their year")
    
    # 5. Verify Class Group Uniqueness
    print("\n5. CLASS GROUP UNIQUENESS")
    print("-" * 80)
    class_groups = ClassGroup.objects.all()
    print(f"   Total Class Groups: {class_groups.count()}")
    
    # Check for duplicate subjects_hash within same dept/section/year
    duplicates = []
    for group in class_groups:
        similar = ClassGroup.objects.filter(
            department=group.department,
            section=group.section,
            year=group.year,
            subjects_hash=group.subjects_hash
        ).exclude(id=group.id)
        if similar.exists():
            duplicates.append(group)
    
    if duplicates:
        print(f"   ✗ ERROR: {len(duplicates)} duplicate class groups found")
    else:
        print(f"   ✓ No duplicate class groups (unique_together constraint working)")
    
    # 6. Verify Class Group Auto-Assignment
    print("\n6. CLASS GROUP AUTO-ASSIGNMENT & REUSE")
    print("-" * 80)
    for group in class_groups.order_by('year', 'department', 'section'):
        student_count = Student.objects.filter(class_group=group).count()
        subject_codes = ', '.join([s.code for s in group.subjects.all()[:3]]) + '...'
        print(f"   {group.name}: {student_count} students ({subject_codes})")
    
    students_without_group = Student.objects.filter(class_group__isnull=True).count()
    if students_without_group > 0:
        print(f"   ✗ WARNING: {students_without_group} students not assigned to any class group")
    else:
        print(f"   ✓ All students assigned to class groups")
    
    # 7. Verify Sessions
    print("\n7. SESSIONS")
    print("-" * 80)
    sessions = Session.objects.all()
    print(f"   Total Sessions: {sessions.count()}")
    
    if sessions.count() > 0:
        for session in sessions[:5]:
            print(f"   - {session.subject.code}: {session.class_group.name} on {session.date}")
    else:
        print(f"   (No sessions created yet)")
    
    # 8. Verify Attendance Duplicate Prevention
    print("\n8. ATTENDANCE DUPLICATE PREVENTION")
    print("-" * 80)
    attendance_records = Attendance.objects.all()
    print(f"   Total Attendance Records: {attendance_records.count()}")
    
    # Check for duplicates (should be prevented by unique_together)
    duplicate_attendance = []
    for record in attendance_records:
        duplicates = Attendance.objects.filter(
            student=record.student,
            session=record.session
        ).exclude(id=record.id)
        if duplicates.exists():
            duplicate_attendance.append(record)
    
    if duplicate_attendance:
        print(f"   ✗ ERROR: {len(duplicate_attendance)} duplicate attendance records found")
    else:
        if attendance_records.count() > 0:
            print(f"   ✓ No duplicate attendance records")
        else:
            print(f"   (No attendance records yet)")
    
    # 9. Test Credentials Summary
    print("\n9. TEST CREDENTIALS")
    print("-" * 80)
    print("   Faculty Accounts (password: faculty123):")
    for faculty in Faculty.objects.all()[:3]:
        print(f"      - {faculty.user.username} ({faculty.user.first_name} {faculty.user.last_name})")
    
    print("\n   Student Accounts (password: student123):")
    for student in Student.objects.all()[:5]:
        print(f"      - {student.user.username} ({student.user.first_name} {student.user.last_name}) - {student.class_group.name if student.class_group else 'No Group'}")
    
    # Final Summary
    print("\n" + "="*80)
    print("VERIFICATION SUMMARY")
    print("="*80)
    
    issues = []
    if unassigned_subjects:
        issues.append(f"{len(unassigned_subjects)} subjects without faculty")
    if invalid_students:
        issues.append(f"{len(invalid_students)} students with wrong subject count")
    if year_mismatch:
        issues.append(f"{len(year_mismatch)} subject-year mismatches")
    if duplicates:
        issues.append(f"{len(duplicates)} duplicate class groups")
    if students_without_group > 0:
        issues.append(f"{students_without_group} students without class group")
    if duplicate_attendance:
        issues.append(f"{len(duplicate_attendance)} duplicate attendance records")
    
    if issues:
        print("   ✗ ISSUES FOUND:")
        for issue in issues:
            print(f"      - {issue}")
    else:
        print("   ✓ ALL CHECKS PASSED!")
        print("   System is ready for testing")
    
    print("="*80 + "\n")

if __name__ == '__main__':
    verify_system()
