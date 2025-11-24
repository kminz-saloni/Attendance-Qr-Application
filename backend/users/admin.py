from django.contrib import admin
from .models import User, Student, Faculty, Subject, ClassGroup, Session, Attendance

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'user_id')

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'department', 'year', 'section')

@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(ClassGroup)
class ClassGroupAdmin(admin.ModelAdmin):
    list_display = ('year', 'department', 'section')

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'subject', 'class_group', 'date', 'start_time', 'end_time', 'active')

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'session', 'marked_at')
