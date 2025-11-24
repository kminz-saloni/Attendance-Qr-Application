import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../shared/Layout';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

interface Session {
    id: number;
    subject: { name: string; code: string };
    class_group: { name: string };
    start_time: string;
    end_time: string;
    date: string;
}

interface AttendanceStats {
    total_classes: number;
    attended: number;
    percentage: number;
}

interface StudentProfile {
    department: string;
    section: string;
    year: number;
    class_group: string | null;
    subject_count: number;
    subjects: Array<{ id: number; code: string; name: string }>;
}

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
    const [stats, setStats] = useState<AttendanceStats>({ total_classes: 0, attended: 0, percentage: 0 });
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [sessionsRes, profileRes, attendanceRes] = await Promise.all([
                axios.get(API_ENDPOINTS.UPCOMING_SESSIONS).catch(() => ({ data: [] })),
                axios.get(API_ENDPOINTS.PROFILE).catch(() => ({ data: {} })),
                axios.get(API_ENDPOINTS.MY_ATTENDANCE).catch(() => ({ data: [] }))
            ]);

            setUpcomingSessions(sessionsRes.data.slice(0, 3));

            // Extract student info from profile
            if (profileRes.data.student_info) {
                setProfile(profileRes.data.student_info);
            }

            // Calculate stats from attendance data
            const attendanceData = attendanceRes.data;
            const attended = attendanceData.length;
            // For now, assume total classes = attended (will be improved with backend)
            const total = attended > 0 ? attended : 0;
            const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

            setStats({ total_classes: total, attended, percentage });
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (timeString: string) => {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
                    <h1 className="text-2xl font-bold mb-2">
                        Welcome back, {user?.first_name}! 👋
                    </h1>
                    {profile && (
                        <p className="text-blue-100">
                            {profile.department} • Year {profile.year} • Section {profile.section}
                        </p>
                    )}
                </div>

                {/* Student Info Card */}
                {profile && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Details</h2>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-sm text-gray-500">Department</p>
                                <p className="font-semibold text-gray-900">{profile.department}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Year</p>
                                <p className="font-semibold text-gray-900">{profile.year}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Section</p>
                                <p className="font-semibold text-gray-900">{profile.section}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Class Group</p>
                                <p className="font-semibold text-gray-900">{profile.class_group || 'Not assigned'}</p>
                            </div>
                        </div>

                        {/* Enrolled Subjects */}
                        <div className="border-t pt-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Enrolled Subjects ({profile.subject_count})</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {profile.subjects && profile.subjects.map((subject) => (
                                    <div key={subject.id} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                                        <div>
                                            <p className="font-medium text-gray-900">{subject.name}</p>
                                            <p className="text-xs text-gray-500">{subject.code}</p>
                                        </div>
                                        <span className="text-blue-600 text-xl">📚</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Attendance Stats Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Attendance</h2>
                    <div className="flex items-center justify-center">
                        {/* Circular Progress */}
                        <div className="relative w-40 h-40">
                            <svg className="transform -rotate-90 w-40 h-40">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="#e5e7eb"
                                    strokeWidth="12"
                                    fill="none"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="#3b82f6"
                                    strokeWidth="12"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 70}`}
                                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - stats.percentage / 100)}`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-blue-600">{stats.percentage}%</span>
                                <span className="text-sm text-gray-500">Attendance</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                        <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-2xl font-bold text-green-600">{stats.attended}</p>
                            <p className="text-sm text-gray-600">Classes Attended</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-2xl font-bold text-blue-600">{stats.total_classes}</p>
                            <p className="text-sm text-gray-600">Total Classes</p>
                        </div>
                    </div>
                </div>

                {/* Quick Scan Button */}
                <Link
                    to="/student/scan"
                    className="block bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Scan QR Code</h3>
                            <p className="text-green-100 text-sm">Mark your attendance now</p>
                        </div>
                        <div className="text-5xl">📱</div>
                    </div>
                </Link>

                {/* Upcoming Classes */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Upcoming Classes</h2>
                        <Link to="/student/timetable" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            View All →
                        </Link>
                    </div>

                    {upcomingSessions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-4xl mb-2">📅</p>
                            <p>No upcoming classes</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{session.subject.name}</h3>
                                            <p className="text-sm text-gray-500">{session.subject.code}</p>
                                            <p className="text-xs text-blue-600 mt-1">📚 {session.class_group.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-blue-600">
                                                {formatTime(session.start_time)} - {formatTime(session.end_time)}
                                            </p>
                                            <p className="text-xs text-gray-500">{formatDate(session.date)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 gap-4">
                    <Link
                        to="/student/attendance"
                        className="bg-white rounded-xl p-4 shadow hover:shadow-md transition-shadow text-center"
                    >
                        <div className="text-3xl mb-2">📊</div>
                        <p className="text-sm font-medium text-gray-900">Attendance History</p>
                    </Link>
                    <Link
                        to="/student/timetable"
                        className="bg-white rounded-xl p-4 shadow hover:shadow-md transition-shadow text-center"
                    >
                        <div className="text-3xl mb-2">📅</div>
                        <p className="text-sm font-medium text-gray-900">Timetable</p>
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default StudentDashboard;
