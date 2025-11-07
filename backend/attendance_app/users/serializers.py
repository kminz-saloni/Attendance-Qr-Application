from rest_framework import serializers
from .models import User, Student, Faculty, Subject, ClassGroup, Session, Attendance

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'user_id', 'first_name', 'last_name']

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Student
        fields = ['user', 'department', 'branch', 'section', 'year']

class FacultySerializer(serializers.ModelSerializer):
    user = UserSerializer()
    subjects = serializers.StringRelatedField(many=True)

    class Meta:
        model = Faculty
        fields = ['user', 'role', 'subjects']

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class ClassGroupSerializer(serializers.ModelSerializer):
    subjects = SubjectSerializer(many=True)

    class Meta:
        model = ClassGroup
        fields = '__all__'

class SessionSerializer(serializers.ModelSerializer):
    teacher = FacultySerializer()
    subject = SubjectSerializer()
    class_group = ClassGroupSerializer()

    class Meta:
        model = Session
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    student = StudentSerializer()
    session = SessionSerializer()

    class Meta:
        model = Attendance
        fields = '__all__'