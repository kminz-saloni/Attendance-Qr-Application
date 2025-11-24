import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../shared/Layout';
import axios from 'axios';

interface Session {
    id: number;
    subject: { name: string; code: string };
    class_group: { name: string };
    start_time: string;
    end_time: string;
    date: string;
    active: boolean;
}

const FacultyDashboard: React.FC = () => {
    const { user } = useAuth();
    const [todaySessions, setTodaySessions] = useState<Session[]>([]);
    const [activeSessions, setActiveSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            // navigate('/login'); // Optional: redirect if not logged in, or just show empty
            setIsLoading(false);
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const response = await axios.get('http://localhost:8000/api/sessions/', config);
            const today = new Date().toISOString().split('T')[0];

            const todayOnly = response.data.filter((s: Session) => s.date === today);
            const active = response.data.filter((s: Session) => s.active);

            setTodaySessions(todayOnly);
            setActiveSessions(active);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
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
            <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                        Welcome, Prof. {user?.last_name}! 👨‍🏫
                    </h1>
                    <p className="text-purple-100">Manage your classes and track attendance</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Today's Classes</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{todaySessions.length}</p>
                            </div>
                            <div className="text-4xl">📅</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Active Sessions</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">{activeSessions.length}</p>
                            </div>
                            <div className="text-4xl">✅</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Sessions</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">{todaySessions.length}</p>
                            </div>
                            <div className="text-4xl">📊</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        to="/faculty/sessions"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-1">Create Session</h3>
                                <p className="text-blue-100 text-sm">Schedule a new class session</p>
                            </div>
                            <div className="text-5xl">📅</div>
                        </div>
                    </Link>
                    <Link
                        to="/faculty/reports"
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-1">View Reports</h3>
                                <p className="text-green-100 text-sm">Generate and export attendance reports</p>
                            </div>
                            <div className="text-5xl">📈</div>
                        </div>
                    </Link>
                </div>

                {/* Today's Schedule */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Schedule</h2>

                    {todaySessions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-5xl mb-3">📅</p>
                            <p className="text-lg font-medium">No classes scheduled for today</p>
                            <p className="text-sm mt-1">Enjoy your day off!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {todaySessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`border-2 rounded-xl p-4 transition-all ${session.active
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-bold text-gray-900">{session.subject.name}</h3>
                                                {session.active && (
                                                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                                                        LIVE
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {session.class_group.name} • {session.subject.code}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                🕐 {formatTime(session.start_time)} - {formatTime(session.end_time)}
                                            </p>
                                        </div>
                                        <Link
                                            to={`/faculty/session/${session.id}`}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${session.active
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                        >
                                            {session.active ? 'Manage' : 'Start'}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-bold text-gray-900 mb-3">Quick Links</h3>
                        <div className="space-y-2">
                            <Link to="/faculty/sessions" className="block p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                <p className="font-medium text-gray-900">📋 All Sessions</p>
                                <p className="text-sm text-gray-500">View and manage all your sessions</p>
                            </Link>
                            <Link to="/faculty/reports" className="block p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                <p className="font-medium text-gray-900">📊 Attendance Reports</p>
                                <p className="text-sm text-gray-500">Generate detailed reports</p>
                            </Link>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-bold text-gray-900 mb-3">Tips</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p>💡 Start your session 5 minutes before class begins</p>
                            <p>💡 QR codes refresh every 30 seconds for security</p>
                            <p>💡 You can manually add/remove attendance if needed</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FacultyDashboard;
