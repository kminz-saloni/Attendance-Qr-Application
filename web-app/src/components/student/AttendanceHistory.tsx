import React, { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import axios from 'axios';

interface AttendanceRecord {
    id: number;
    session: {
        subject: { name: string; code: string };
        date: string;
        start_time: string;
        end_time: string;
    };
    marked_at: string;
}

const AttendanceHistory: React.FC = () => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/attendance/my-attendance/');
            setRecords(response.data);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterRecords = () => {
        const now = new Date();
        return records.filter((record) => {
            const recordDate = new Date(record.session.date);
            if (filter === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return recordDate >= weekAgo;
            } else if (filter === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return recordDate >= monthAgo;
            }
            return true;
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredRecords = filterRecords();

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
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
                    <p className="text-gray-600 mt-1">View your attendance records</p>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-xl shadow p-2 flex space-x-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        All Time
                    </button>
                    <button
                        onClick={() => setFilter('week')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${filter === 'week'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        This Week
                    </button>
                    <button
                        onClick={() => setFilter('month')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${filter === 'month'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        This Month
                    </button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center">
                        <p className="text-3xl font-bold">{filteredRecords.length}</p>
                        <p className="text-sm text-blue-100 mt-1">Total Classes</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white text-center">
                        <p className="text-3xl font-bold">{filteredRecords.length}</p>
                        <p className="text-sm text-green-100 mt-1">Present</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white text-center">
                        <p className="text-3xl font-bold">100%</p>
                        <p className="text-sm text-purple-100 mt-1">Rate</p>
                    </div>
                </div>

                {/* Records List */}
                <div className="bg-white rounded-xl shadow">
                    {filteredRecords.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-5xl mb-3">📋</p>
                            <p className="text-lg font-medium">No attendance records</p>
                            <p className="text-sm mt-1">Start scanning QR codes to mark attendance</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredRecords.map((record) => (
                                <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {record.session.subject.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">{record.session.subject.code}</p>
                                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600">
                                                <span className="flex items-center">
                                                    📅 {formatDate(record.session.date)}
                                                </span>
                                                <span className="flex items-center">
                                                    🕐 {formatTime(record.session.start_time)} - {formatTime(record.session.end_time)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                ✓ Present
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AttendanceHistory;
