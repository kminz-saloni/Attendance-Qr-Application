from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import datetime, timedelta
import qrcode
import io
import base64
from .models import User, Student, Faculty, Session, Attendance, Subject, ClassGroup, ClassGroup
from .serializers import UserSerializer, StudentSerializer, FacultySerializer, SessionSerializer, AttendanceSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            response = super().post(request, *args, **kwargs)
            response.data['role'] = user.role
            response.data['user_id'] = user.user_id
            return response
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class StudentRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role='student',
            first_name=data.get('first_name'),
            last_name=data.get('last_name')
        )
        Student.objects.create(
            user=user,
            department=data['department'],
            branch=data['branch'],
            section=data['section'],
            year=data['year']
        )
        return Response({'message': 'Student registered', 'user_id': user.user_id}, status=status.HTTP_201_CREATED)

class FacultyListView(generics.ListCreateAPIView):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Faculty.objects.all()
        return Faculty.objects.none()

class SessionListView(generics.ListCreateAPIView):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'faculty':
            return Session.objects.filter(teacher__user=user)
        elif user.role == 'student':
            student = Student.objects.get(user=user)
            return Session.objects.filter(class_group__year=student.year, class_group__department=student.department, class_group__section=student.section)
        return Session.objects.none()

class AttendanceListView(generics.ListCreateAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            student = Student.objects.get(user=user)
            return Attendance.objects.filter(student=student)
        elif user.role == 'faculty':
            faculty = Faculty.objects.get(user=user)
            return Attendance.objects.filter(session__teacher=faculty)
        return Attendance.objects.none()

class UpcomingSessionsView(generics.ListAPIView):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            student = Student.objects.get(user=user)
            now = timezone.now()
            return Session.objects.filter(
                class_group__year=student.year,
                class_group__department=student.department,
                class_group__section=student.section,
                date__gte=now.date(),
                start_time__gte=now.time()
            ).order_by('date', 'start_time')
        return Session.objects.none()

class TimetableView(generics.ListAPIView):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            student = Student.objects.get(user=user)
            # For simplicity, return all sessions for the class_group
            return Session.objects.filter(
                class_group__year=student.year,
                class_group__department=student.department,
                class_group__section=student.section
            ).order_by('date', 'start_time')
        return Session.objects.none()

class FacultyForClassView(generics.ListAPIView):
    serializer_class = FacultySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            student = Student.objects.get(user=user)
            # Get faculty teaching subjects in student's class_group
            class_group = ClassGroup.objects.get(year=student.year, department=student.department, section=student.section)
            subjects = class_group.subjects.all()
            return Faculty.objects.filter(subjects__in=subjects).distinct()
        return Faculty.objects.none()

class MarkAttendanceView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        if user.role != 'student':
            return Response({'error': 'Only students can mark attendance'}, status=status.HTTP_403_FORBIDDEN)
        
        session_id = request.data.get('session_id')
        qr_code = request.data.get('qr_code')
        
        try:
            session = Session.objects.get(id=session_id, active=True)
            student = Student.objects.get(user=user)
            # Check if student is in the class_group
            student_class_group = ClassGroup.objects.get(year=student.year, department=student.department, section=student.section)
            if session.class_group != student_class_group:
                return Response({'error': 'Session not for your class'}, status=status.HTTP_400_BAD_REQUEST)
            # Verify QR code (simple check, in real app use secure method)
            if session.qr_code != qr_code:
                return Response({'error': 'Invalid QR code'}, status=status.HTTP_400_BAD_REQUEST)
            # Check if already marked
            if Attendance.objects.filter(student=student, session=session).exists():
                return Response({'error': 'Attendance already marked'}, status=status.HTTP_400_BAD_REQUEST)
            # Mark attendance
            Attendance.objects.create(student=student, session=session)
            return Response({'message': 'Attendance marked'}, status=status.HTTP_201_CREATED)
        except Session.DoesNotExist:
            return Response({'error': 'Session not found or not active'}, status=status.HTTP_404_NOT_FOUND)
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

class GenerateQRView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        if user.role != 'faculty':
            return Response({'error': 'Only faculty can generate QR'}, status=status.HTTP_403_FORBIDDEN)
        
        session_id = request.data.get('session_id')
        try:
            session = Session.objects.get(id=session_id, teacher__user=user)
            # Generate QR code data (e.g., session_id + timestamp)
            qr_data = f"{session.id}-{timezone.now().timestamp()}"
            session.qr_code = qr_data
            session.active = True
            session.save()
            
            # Generate QR image
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(qr_data)
            qr.make(fit=True)
            img = qr.make_image(fill='black', back_color='white')
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            return Response({'qr_code': qr_data, 'qr_image': img_str}, status=status.HTTP_200_OK)
        except Session.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

class StopAttendanceView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        if user.role != 'faculty':
            return Response({'error': 'Only faculty can stop attendance'}, status=status.HTTP_403_FORBIDDEN)
        
        session_id = request.data.get('session_id')
        try:
            session = Session.objects.get(id=session_id, teacher__user=user)
            session.active = False
            session.save()
            return Response({'message': 'Attendance stopped'}, status=status.HTTP_200_OK)
        except Session.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

class FacultyRegistrationView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'error': 'Only admin can register faculty'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role='faculty',
            first_name=data.get('first_name'),
            last_name=data.get('last_name')
        )
        faculty = Faculty.objects.create(
            user=user,
            role=data['faculty_role']
        )
        # Add subjects
        subjects = data.get('subjects', [])
        for subj_name in subjects:
            subject, _ = Subject.objects.get_or_create(name=subj_name)
            faculty.subjects.add(subject)
        
        return Response({'message': 'Faculty registered', 'user_id': user.user_id}, status=status.HTTP_201_CREATED)

class UserManagementView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return User.objects.all()
        return User.objects.none()

class SessionCreateView(generics.CreateAPIView):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != 'faculty':
            return Response({'error': 'Only faculty can create sessions'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        faculty = Faculty.objects.get(user=request.user)
        subject = Subject.objects.get(id=data['subject_id'])
        class_group = ClassGroup.objects.get(id=data['class_group_id'])
        
        session = Session.objects.create(
            teacher=faculty,
            subject=subject,
            class_group=class_group,
            start_time=data['start_time'],
            end_time=data['end_time'],
            date=data['date'],
            recurring=data.get('recurring', False)
        )
        return Response(SessionSerializer(session).data, status=status.HTTP_201_CREATED)

class SessionDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        if request.user.role != 'faculty':
            return Response({'error': 'Only faculty can delete sessions'}, status=status.HTTP_403_FORBIDDEN)
        
        session_id = kwargs['pk']
        try:
            session = Session.objects.get(id=session_id, teacher__user=request.user)
            session.delete()
            return Response({'message': 'Session deleted'}, status=status.HTTP_204_NO_CONTENT)
        except Session.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

class AttendanceReportView(generics.ListAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'faculty':
            faculty = Faculty.objects.get(user=user)
            return Attendance.objects.filter(session__teacher=faculty)
        elif user.role == 'admin':
            return Attendance.objects.all()
        return Attendance.objects.none()
