from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, StudentRegistrationView, FacultyListView, 
    SessionListView, SessionDetailView, AttendanceListView, UpcomingSessionsView, TimetableView, 
    FacultyForClassView, MarkAttendanceView, GenerateQRView, StopAttendanceView, 
    FacultyRegistrationView, UserManagementView, SessionCreateView, SessionDeleteView, 
    AttendanceReportView, UserProfileView, MyAttendanceView, AttendanceStatsView,
    SubjectListView, FacultySubjectsView, FacultyClassGroupsView
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/student/', StudentRegistrationView.as_view(), name='student_register'),
    path('register/faculty/', FacultyRegistrationView.as_view(), name='faculty_register'),
    path('user/profile/', UserProfileView.as_view(), name='user_profile'),
    path('users/', UserManagementView.as_view(), name='user_management'),
    path('faculty/', FacultyListView.as_view(), name='faculty_list'),
    path('sessions/', SessionListView.as_view(), name='session_list'),
    path('sessions/<int:pk>/', SessionDetailView.as_view(), name='session_detail'),
    path('sessions/create/', SessionCreateView.as_view(), name='session_create'),
    path('sessions/<int:pk>/delete/', SessionDeleteView.as_view(), name='session_delete'),
    path('attendance/', AttendanceListView.as_view(), name='attendance_list'),
    path('attendance/my-attendance/', MyAttendanceView.as_view(), name='my_attendance'),
    path('attendance/stats/', AttendanceStatsView.as_view(), name='attendance_stats'),
    path('attendance/report/', AttendanceReportView.as_view(), name='attendance_report'),
    path('upcoming-sessions/', UpcomingSessionsView.as_view(), name='upcoming_sessions'),
    path('timetable/', TimetableView.as_view(), name='timetable'),
    path('faculty-for-class/', FacultyForClassView.as_view(), name='faculty_for_class'),
    path('mark-attendance/', MarkAttendanceView.as_view(), name='mark_attendance'),
    path('generate-qr/', GenerateQRView.as_view(), name='generate_qr'),
    path('stop-attendance/', StopAttendanceView.as_view(), name='stop_attendance'),
    path('subjects/', SubjectListView.as_view(), name='subject_list'),
    path('faculty/my-subjects/', FacultySubjectsView.as_view(), name='faculty_subjects'),
    path('faculty/my-class-groups/', FacultyClassGroupsView.as_view(), name='faculty_class_groups'),
]