from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid

class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('faculty', 'Faculty'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    user_id = models.CharField(max_length=20, unique=True, blank=True)  # For login, generated on registration

    def save(self, *args, **kwargs):
        if not self.user_id:
            self.user_id = str(uuid.uuid4())[:8].upper()  # Simple unique ID
        super().save(*args, **kwargs)

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    department = models.CharField(max_length=50)  # e.g., CSE, ECE, EE
    branch = models.CharField(max_length=50)  # Same as department?
    section = models.CharField(max_length=10)  # A or B
    year = models.IntegerField(choices=[(1, '1st Year'), (2, '2nd Year'), (3, '3rd Year'), (4, '4th Year')])

class Faculty(models.Model):
    ROLE_CHOICES = [
        ('assistant_professor', 'Assistant Professor'),
        ('professor', 'Professor'),
        ('lab_assistant', 'Lab Assistant'),
        ('adjunct_faculty', 'Adjunct Faculty'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    subjects = models.ManyToManyField('Subject')  # Subjects they teach

class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)

class ClassGroup(models.Model):  # e.g., 1st Year CSE A
    year = models.IntegerField(choices=[(1, '1st Year'), (2, '2nd Year'), (3, '3rd Year'), (4, '4th Year')])
    department = models.CharField(max_length=50)
    section = models.CharField(max_length=10)
    subjects = models.ManyToManyField(Subject)  # Subjects for this class

class Session(models.Model):
    teacher = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    class_group = models.ForeignKey(ClassGroup, on_delete=models.CASCADE)
    start_time = models.TimeField()
    end_time = models.TimeField()
    date = models.DateField()  # For one-time or start date
    recurring = models.BooleanField(default=False)  # If weekly recurring
    qr_code = models.CharField(max_length=255, blank=True)  # Generated QR data
    active = models.BooleanField(default=False)  # For attendance marking

class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    marked_at = models.DateTimeField(default=timezone.now)
