import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../shared/Layout';
import axios from 'axios';
import QRCode from 'qrcode';
import { API_ENDPOINTS } from '../../config/api';

interface Session {
    id: number;
    subject: { name: string; code: string };
    class_group: { name: string };
    start_time: string;
    end_time: string;
    date: string;
    active: boolean;
    qr_code: string;
}

interface AttendanceRecord {
    id: number;
    student: {
        user: {
            first_name: string;
            last_name: string;
            username: string;
        };
    };
    marked_at: string;
}

const ClassSession: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [session, setSession] = useState<Session | null>(null);
    const [qrImage, setQrImage] = useState<string>('');
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const generateQRImage = async (qrData: string) => {
        try {
            const url = await QRCode.toDataURL(qrData, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
            setQrImage(url);
        } catch (error) {
            console.error('Failed to generate QR:', error);
        }
    };

    const fetchSessionData = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const response = await axios.get(`${API_ENDPOINTS.SESSIONS}${sessionId}/`, config);
            setSession(response.data);

            if (response.data.active && response.data.qr_code) {
                generateQRImage(response.data.qr_code);
            }

            // Fetch attendance
            const attendanceRes = await axios.get(`${API_ENDPOINTS.ATTENDANCE}?session=${sessionId}`, config);
            setAttendance(attendanceRes.data);
        } catch (error: any) {
            console.error('Failed to fetch session:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, navigate]);

    const refreshQR = useCallback(async () => {
        if (!session?.active) return;

        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const response = await axios.post(API_ENDPOINTS.GENERATE_QR, {
                session_id: sessionId
            }, config);

            if (response.data.qr_code) {
                generateQRImage(response.data.qr_code);
            }
        } catch (error) {
            console.error('Failed to refresh QR:', error);
        }
    }, [sessionId, session?.active]);

    useEffect(() => {
        fetchSessionData();
        const interval = setInterval(refreshQR, 30000); // Refresh QR every 30 seconds
        return () => clearInterval(interval);
    }, [fetchSessionData, refreshQR]);

    const startSession = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const response = await axios.post(
                API_ENDPOINTS.GENERATE_QR,
                { session_id: sessionId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSession({ ...session!, active: true, qr_code: response.data.qr_code });
            generateQRImage(response.data.qr_code);
        } catch (error) {
            console.error('Failed to start session:', error);
        }
    };

    const stopSession = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            await axios.post(
                API_ENDPOINTS.STOP_ATTENDANCE,
                { session_id: sessionId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSession({ ...session!, active: false });
            setQrImage('');
        } catch (error) {
            console.error('Failed to stop session:', error);
        }
    };

    if (isLoading || !session) {
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
                {/* Header */}
                <div>
                    <button
                        onClick={() => navigate('/faculty/dashboard')}
                        className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center"
                    >
                        ← Back to Dashboard
                    </button>
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{session.subject.name}</h1>
                                <p className="text-gray-600 mt-1">{session.class_group.name} • {session.subject.code}</p>
                            </div>
                            {session.active ? (
                                <button
                                    onClick={stopSession}
                                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    Stop Session
                                </button>
                            ) : (
                                <button
                                    onClick={startSession}
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                                >
                                    Start Session
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* QR Code Display */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">QR Code</h2>

                        {session.active && qrImage ? (
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-xl p-6 flex items-center justify-center">
                                    <img src={qrImage} alt="Attendance QR Code" className="w-64 h-64" />
                                </div>
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-700 text-center">
                                        ✨ QR code refreshes every 30 seconds for security
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-500">
                                <p className="text-5xl mb-3">📱</p>
                                <p className="font-medium">Session not started</p>
                                <p className="text-sm mt-1">Click "Start Session" to generate QR code</p>
                            </div>
                        )}
                    </div>

                    {/* Live Attendance */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Live Attendance</h2>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                {attendance.length} Present
                            </span>
                        </div>

                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {attendance.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p className="text-4xl mb-2">👥</p>
                                    <p>No attendance marked yet</p>
                                </div>
                            ) : (
                                attendance.map((record) => (
                                    <div
                                        key={record.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                                {record.student.user.first_name[0]}{record.student.user.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {record.student.user.first_name} {record.student.user.last_name}
                                                </p>
                                                <p className="text-xs text-gray-500">{record.student.user.username}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">
                                                {new Date(record.marked_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Session Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">{attendance.length}</p>
                        <p className="text-sm text-gray-600 mt-1">Students Present</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 text-center">
                        <p className="text-3xl font-bold text-gray-600">--</p>
                        <p className="text-sm text-gray-600 mt-1">Total Students</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">
                            {attendance.length > 0 ? '100%' : '0%'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Attendance Rate</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ClassSession;
