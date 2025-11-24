from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.core.exceptions import ValidationError
import uuid
import hashlib

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

class Subject(models.Model):
    YEAR_CHOICES = [
        (1, '1st Year'),
        (2, '2nd Year'),
        (3, '3rd Year'),
        (4, '4th Year'),
    ]
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    year = models.IntegerField(choices=YEAR_CHOICES)  # Which year this subject belongs to
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    class Meta:
        ordering = ['year', 'code']

class Faculty(models.Model):
    ROLE_CHOICES = [
        ('assistant_professor', 'Assistant Professor'),
        ('professor', 'Professor'),
        ('lab_assistant', 'Lab Assistant'),
        ('adjunct_faculty', 'Adjunct Faculty'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    subjects = models.ManyToManyField(Subject, blank=True)  # Subjects they teach

class ClassGroup(models.Model):  # e.g., CSE 2-A with specific 7 subjects
    DEPARTMENT_CHOICES = [
        ('CSE', 'Computer Science Engineering'),
        ('ECE', 'Electronics and Communication Engineering'),
        ('EE', 'Electrical Engineering'),
    ]
    YEAR_CHOICES = [
        (1, '1st Year'),
        (2, '2nd Year'),
        (3, '3rd Year'),
        (4, '4th Year'),
    ]
    SECTION_CHOICES = [
        ('A', 'Section A'),
        ('B', 'Section B'),
    ]
    
    year = models.IntegerField(choices=YEAR_CHOICES)
    department = models.CharField(max_length=3, choices=DEPARTMENT_CHOICES)
    section = models.CharField(max_length=1, choices=SECTION_CHOICES)
    subjects = models.ManyToManyField(Subject)  # Exactly 7 subjects
    subjects_hash = models.CharField(max_length=64, editable=False)  # Hash of sorted subject IDs
    
    class Meta:
        unique_together = [['department', 'section', 'year', 'subjects_hash']]
    
    def clean(self):
        # Validate exactly 7 subjects
        if self.pk and self.subjects.count() != 7:
            raise ValidationError('ClassGroup must have exactly 7 subjects')
    
    def generate_subjects_hash(self):
        """Generate deterministic hash from sorted subject IDs"""
        subject_ids = sorted([str(s.id) for s in self.subjects.all()])
        hash_input = '-'.join(subject_ids)
        return hashlib.sha256(hash_input.encode()).hexdigest()
    
    def save(self, *args, **kwargs):
        # For new instances, save first then update hash
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Update hash if subjects exist
        if not is_new and self.subjects.exists():
            new_hash = self.generate_subjects_hash()
            if self.subjects_hash != new_hash:
                self.subjects_hash = new_hash
                super().save(update_fields=['subjects_hash'])
    
    @property
    def name(self):
        return f"{self.department} {self.year}-{self.section}"
    
    def __str__(self):
        return self.name

class Student(models.Model):
    DEPARTMENT_CHOICES = [
        ('CSE', 'Computer Science Engineering'),
        ('ECE', 'Electronics and Communication Engineering'),
        ('EE', 'Electrical Engineering'),
    ]
    SECTION_CHOICES = [
        ('A', 'Section A'),
        ('B', 'Section B'),
    ]
    YEAR_CHOICES = [
        (1, '1st Year'),
        (2, '2nd Year'),
        (3, '3rd Year'),
        (4, '4th Year'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    department = models.CharField(max_length=3, choices=DEPARTMENT_CHOICES)
    section = models.CharField(max_length=1, choices=SECTION_CHOICES)
    year = models.IntegerField(choices=YEAR_CHOICES)
    subjects = models.ManyToManyField(Subject)  # Exactly 7 subjects
    subjects_hash = models.CharField(max_length=64, editable=False, blank=True)  # Hash of sorted subject IDs
    class_group = models.ForeignKey(ClassGroup, on_delete=models.SET_NULL, null=True, blank=True)
    
    def clean(self):
        # Validate exactly 7 subjects
        if self.pk and self.subjects.count() != 7:
            raise ValidationError('Student must select exactly 7 subjects')
        
        # Validate subjects belong to student's year
        if self.pk:
            for subject in self.subjects.all():
                if subject.year != self.year:
                    raise ValidationError(f'Subject {subject.name} does not belong to year {self.year}')
    
    def generate_subjects_hash(self):
        """Generate deterministic hash from sorted subject IDs"""
        subject_ids = sorted([str(s.id) for s in self.subjects.all()])
        hash_input = '-'.join(subject_ids)
        return hashlib.sha256(hash_input.encode()).hexdigest()
    
    def save(self, *args, **kwargs):
        # For new instances, save first then update hash
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Update hash if subjects exist
        if not is_new and self.subjects.exists():
            new_hash = self.generate_subjects_hash()
            if self.subjects_hash != new_hash:
                self.subjects_hash = new_hash
                super().save(update_fields=['subjects_hash'])

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
    
    class Meta:
        unique_together = [['student', 'session']]  # Prevent duplicate attendance
