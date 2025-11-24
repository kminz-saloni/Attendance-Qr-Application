from rest_framework import generics, status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import datetime, timedelta
import qrcode
import io
import base64
from .models import User, Student, Faculty, Session, Attendance, Subject, ClassGroup
from .serializers import (
    UserSerializer, StudentSerializer, FacultySerializer, 
    SessionSerializer, AttendanceSerializer, 
    SubjectSerializer, ClassGroupSerializer
)

@method_decorator(csrf_exempt, name='dispatch')
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

@method_decorator(csrf_exempt, name='dispatch')
class StudentRegistrationView(generics.CreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            student = serializer.save()
            return Response({
                'message': 'Student registered successfully',
                'user_id': student.user.user_id,
                'class_group': student.class_group.name if student.class_group else None
            }, status=status.HTTP_201_CREATED)
        except serializers.ValidationError as e:
            return Response({'error': e.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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
            return Session.objects.filter(teacher__user=user).order_by('-date', '-start_time')
        elif user.role == 'student':
            try:
                student = Student.objects.get(user=user)
                # Filter by student's assigned class_group
                if student.class_group:
                    return Session.objects.filter(class_group=student.class_group).order_by('-date', '-start_time')
                return Session.objects.none()
            except Student.DoesNotExist:
                return Session.objects.none()
        return Session.objects.none()

class SessionDetailView(generics.RetrieveAPIView):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]
    queryset = Session.objects.all()

class AttendanceListView(generics.ListCreateAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            try:
                student = Student.objects.get(user=user)
                return Attendance.objects.filter(student=student)
            except Student.DoesNotExist:
                return Attendance.objects.none()
        elif user.role == 'faculty':
            try:
                faculty = Faculty.objects.get(user=user)
                return Attendance.objects.filter(session__teacher=faculty)
            except Faculty.DoesNotExist:
                return Attendance.objects.none()
        return Attendance.objects.none()

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
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if request.user.role != 'student':
            return Response({'error': 'Only students can mark attendance'}, status=status.HTTP_403_FORBIDDEN)
        
        qr_code = request.data.get('qr_code')
        session_id = request.data.get('session_id')
        
        try:
            # Verify session is active
            session = Session.objects.get(id=session_id, active=True)
            
            # Verify QR code
            if session.qr_code != qr_code:
                return Response({'error': 'Invalid QR code'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Use serializer for validation and creation
            serializer = self.get_serializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            attendance = serializer.save()
            
            return Response({
                'message': 'Attendance marked successfully',
                'session': attendance.session.id,
                'marked_at': attendance.marked_at
            }, status=status.HTTP_201_CREATED)
            
        except Session.DoesNotExist:
            return Response({'error': 'Session not found or not active'}, status=status.HTTP_404_NOT_FOUND)
        except serializers.ValidationError as e:
            return Response({'error': e.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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

class UserProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        profile_data = {
            'user_id': user.user_id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
        }
        
        # Add role-specific data
        if user.role == 'student':
            try:
                student = Student.objects.get(user=user)
                profile_data['student_info'] = {
                    'department': student.department,
                    'section': student.section,
                    'year': student.year,
                    'class_group': student.class_group.name if student.class_group else None,
                    'subject_count': student.subjects.count(),
                    'subjects': [
                        {'id': s.id, 'code': s.code, 'name': s.name} 
                        for s in student.subjects.all().order_by('code')
                    ],
                }
            except Student.DoesNotExist:
                pass
        elif user.role == 'faculty':
            try:
                faculty = Faculty.objects.get(user=user)
                profile_data['faculty_info'] = {
                    'role': faculty.role,
                    'subjects': [subject.name for subject in faculty.subjects.all()],
                }
            except Faculty.DoesNotExist:
                pass
        
        return Response(profile_data, status=status.HTTP_200_OK)

class MyAttendanceView(generics.ListAPIView):
    """View for students to see their own attendance records"""
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            try:
                student = Student.objects.get(user=user)
                return Attendance.objects.filter(student=student).order_by('-session__date', '-session__start_time')
            except Student.DoesNotExist:
                return Attendance.objects.none()
        return Attendance.objects.none()

class AttendanceStatsView(APIView):
    """View to get attendance statistics for a student"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'student':
            return Response({'error': 'Only students can view attendance stats'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            student = Student.objects.get(user=user)
            # Get all attendance records for this student
            attended = Attendance.objects.filter(student=student).count()
            
            # Get total sessions for student's class group
            try:
                class_group = ClassGroup.objects.get(
                    year=student.year,
                    department=student.department,
                    section=student.section
                )
                total_classes = Session.objects.filter(class_group=class_group).count()
            except ClassGroup.DoesNotExist:
                total_classes = attended  # If no class group, use attended as total
            
            # Calculate percentage
            percentage = round((attended / total_classes * 100)) if total_classes > 0 else 0
            
            return Response({
                'total_classes': total_classes,
                'attended': attended,
                'percentage': percentage
            }, status=status.HTTP_200_OK)
            
        except Student.DoesNotExist:
            return Response({
                'total_classes': 0,
                'attended': 0,
                'percentage': 0
            }, status=status.HTTP_200_OK)

class UpcomingSessionsView(generics.ListAPIView):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        now = timezone.now()
        if user.role == 'student':
            try:
                student = Student.objects.get(user=user)
                # CRITICAL FIX: Show sessions for ANY subject the student is enrolled in
                return Session.objects.filter(
                    subject__in=student.subjects.all(),
                    date__gte=now.date()
                ).order_by('date', 'start_time')
            except Student.DoesNotExist:
                return Session.objects.none()
        elif user.role == 'faculty':
            return Session.objects.filter(
                teacher__user=user,
                date__gte=now.date()
            ).order_by('date', 'start_time')
        return Session.objects.none()

class TimetableView(generics.ListAPIView):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # For now, return all sessions as timetable (not just upcoming)
        if user.role == 'student':
            try:
                student = Student.objects.get(user=user)
                # CRITICAL FIX: Show sessions for ANY subject the student is enrolled in
                return Session.objects.filter(
                    subject__in=student.subjects.all()
                ).order_by('date', 'start_time')
            except Student.DoesNotExist:
                return Session.objects.none()
        elif user.role == 'faculty':
            return Session.objects.filter(teacher__user=user).order_by('date', 'start_time')
        return Session.objects.none()

class SubjectListView(generics.ListAPIView):
    """List all subjects, optionally filtered by year"""
    serializer_class = SubjectSerializer
    permission_classes = []  # Allow unauthenticated access for registration
    
    def get_queryset(self):
        queryset = Subject.objects.all().order_by('year', 'code')
        year = self.request.query_params.get('year', None)
        if year is not None:
            queryset = queryset.filter(year=year)
        return queryset

class FacultySubjectsView(generics.ListAPIView):
    """Get subjects assigned to the logged-in faculty"""
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'faculty':
            return Subject.objects.none()
        
        try:
            faculty = Faculty.objects.get(user=self.request.user)
            return faculty.subjects.all().order_by('year', 'code')
        except Faculty.DoesNotExist:
            return Subject.objects.none()

class FacultyClassGroupsView(generics.ListAPIView):
    """Get class groups where faculty teaches at least one subject"""
    serializer_class = ClassGroupSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'faculty':
            return ClassGroup.objects.none()
        
        try:
            faculty = Faculty.objects.get(user=self.request.user)
            faculty_subjects = faculty.subjects.all()
            
            # Get class groups that have at least one subject the faculty teaches
            class_groups = ClassGroup.objects.filter(
                subjects__in=faculty_subjects
            ).distinct()
            
            # Filter by subject if provided
            subject_id = self.request.query_params.get('subject_id', None)
            if subject_id:
                class_groups = class_groups.filter(subjects__id=subject_id)
            
            return class_groups.order_by('year', 'department', 'section')
        except Faculty.DoesNotExist:
            return ClassGroup.objects.none()
