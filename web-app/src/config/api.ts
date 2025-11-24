// API Configuration
// Uses environment variable if available, falls back to localhost
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: `${API_BASE_URL}/api/token/`,
    REFRESH: `${API_BASE_URL}/api/token/refresh/`,

    // User
    PROFILE: `${API_BASE_URL}/api/user/profile/`,
    USERS: `${API_BASE_URL}/api/users/`,

    // Sessions
    SESSIONS: `${API_BASE_URL}/api/sessions/`,
    UPCOMING_SESSIONS: `${API_BASE_URL}/api/upcoming-sessions/`,
    TIMETABLE: `${API_BASE_URL}/api/timetable/`,

    // Attendance
    MARK_ATTENDANCE: `${API_BASE_URL}/api/mark-attendance/`,
    MY_ATTENDANCE: `${API_BASE_URL}/api/attendance/my-attendance/`,
    ATTENDANCE: `${API_BASE_URL}/api/attendance/`,

    // QR Code
    GENERATE_QR: `${API_BASE_URL}/api/generate-qr/`,
    STOP_ATTENDANCE: `${API_BASE_URL}/api/stop-attendance/`,

    // Admin
    ADMIN_PANEL: `${API_BASE_URL}/admin`,

    // Subjects
    SUBJECTS: `${API_BASE_URL}/api/subjects/`,

    // Faculty
    FACULTY_SUBJECTS: `${API_BASE_URL}/api/faculty/subjects/`,
    FACULTY_CLASS_GROUPS: `${API_BASE_URL}/api/faculty/class-groups/`,
};

export default API_BASE_URL;
