# Attendance QR Web App

A responsive web application for attendance management using QR codes. Works on both mobile devices (for QR scanning) and desktop computers (for dashboards and reports).

## Features

### Mobile Experience (Phones/Tablets)
- **QR Code Scanning**: Scan QR codes to mark attendance
- **Responsive Dashboard**: Touch-friendly interface
- **Quick Actions**: Easy access to scan, view attendance, and timetable

### Desktop Experience (Laptops/Computers)
- **Full Dashboard**: Comprehensive view of attendance data
- **Admin Panel**: User and session management
- **Detailed Reports**: Attendance statistics and analytics
- **Timetable Management**: Weekly schedule overview

### Core Features
- **JWT Authentication**: Secure login with role-based access
- **Real-time QR Scanning**: HTML5 camera API integration
- **Responsive Design**: Adapts to screen size automatically
- **Role-based Access**: Student, Faculty, and Admin roles
- **Attendance Tracking**: Mark and view attendance records
- **Timetable Display**: Weekly class schedule

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **QR Scanning**: html5-qrcode library
- **Backend**: Django REST API (separate repository)

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Running Django backend server at \http://localhost:8000\

### Installation

1. **Clone and navigate to the web app directory:**
   \\\ash
   cd web-app
   \\\

2. **Install dependencies:**
   \\\ash
   npm install
   \\\

3. **Start the development server:**
   \\\ash
   npm start
   \\\

4. **Open your browser:**
   - Visit \http://localhost:3000\
   - The app will automatically detect mobile vs desktop

### Build for Production

\\\ash
npm run build
\\\

This creates an optimized production build in the \uild\ folder.

## Usage

### For Students
1. **Login** with your student credentials
2. **Scan QR Codes** during class sessions
3. **View Attendance** records and statistics
4. **Check Timetable** for class schedules

### For Faculty
1. **Login** with faculty credentials
2. **Generate QR Codes** for class sessions
3. **Monitor Attendance** in real-time
4. **View Reports** and analytics

### For Admins
1. **Login** with admin credentials
2. **Manage Users** (students, faculty, admins)
3. **View System Overview** and statistics
4. **Monitor All Sessions** and attendance data

## Browser Compatibility

- **Chrome/Edge**: Full support including camera access
- **Firefox**: Full support
- **Safari**: Full support (iOS 11.3+)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet

## Camera Permissions

The app requests camera access only when scanning QR codes. Make sure to:
- Allow camera permissions when prompted
- Use HTTPS in production (required for camera access)
- Test on actual mobile devices for best experience

## API Integration

The app connects to a Django REST API with the following endpoints:

- \POST /api/token/\ - User authentication
- \GET /api/sessions/\ - List sessions
- \POST /api/attendance/mark/{session_id}/\ - Mark attendance
- \GET /api/attendance/my-attendance/\ - View attendance records
- \GET /api/timetable/\ - Get timetable
- \GET /api/admin/users/\ - Admin user management

## Development

### Project Structure
\\\
src/
 components/          # React components
    Login.tsx       # Authentication
    Dashboard.tsx   # Main dashboard
    QRScanner.tsx   # QR code scanning
    Attendance.tsx  # Attendance records
    Timetable.tsx   # Class schedule
    AdminDashboard.tsx # Admin panel
 contexts/           # React contexts
    AuthContext.tsx # Authentication state
 App.tsx            # Main app component
 index.tsx          # App entry point
\\\

### Adding New Features

1. Create components in \src/components/\
2. Add routes in \App.tsx\
3. Update authentication logic in \AuthContext.tsx\
4. Test on both mobile and desktop viewports

## Troubleshooting

### QR Scanning Issues
- Ensure camera permissions are granted
- Check that you're using HTTPS in production
- Try manual entry if scanning fails

### Authentication Issues
- Verify Django backend is running
- Check JWT token expiration
- Clear browser localStorage if needed

### Mobile Responsiveness
- Test on actual devices, not just browser dev tools
- Check viewport meta tags are set correctly
- Ensure touch targets are at least 44px

## Contributing

1. Follow the existing code style
2. Test on multiple devices and browsers
3. Update documentation for new features
4. Ensure responsive design works on all screen sizes

## License

This project is part of the Attendance QR Application system.
