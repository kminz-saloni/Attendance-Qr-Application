import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface AttendanceRecord {
  id: number;
  session: {
    id: number;
    subject: {
      name: string;
      code: string;
    };
    class_group: {
      name: string;
    };
    date: string;
    start_time: string;
    end_time: string;
  };
  marked_at: string;
  status: string;
}

const Attendance: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.MY_ATTENDANCE);
      setAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAttendance = attendance.filter(record => {
    if (filter === 'all') return true;
    return record.status.toLowerCase() === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Filter Buttons */}
          <div className="mb-6">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h2 className="text-xl font-semibold text-gray-900">Attendance Records</h2>
                <p className="mt-2 text-sm text-gray-700">
                  View your attendance history and status
                </p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      filter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('present')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      filter === 'present'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => setFilter('absent')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      filter === 'absent'
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {filteredAttendance.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No attendance records found</div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredAttendance.map((record) => (
                  <li key={record.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                record.status.toLowerCase() === 'present'
                                  ? 'bg-green-400'
                                  : 'bg-red-400'
                              }`}
                            ></div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {record.session.subject.name} ({record.session.subject.code})
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.session.class_group.name} • {formatDate(record.session.date)}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-sm text-gray-900">
                            {formatTime(record.session.start_time)} - {formatTime(record.session.end_time)}
                          </div>
                          <div
                            className={`text-xs px-2 py-1 rounded-full mt-1 ${
                              record.status.toLowerCase() === 'present'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {record.status}
                          </div>
                        </div>
                      </div>
                      {record.marked_at && (
                        <div className="mt-2 text-xs text-gray-500">
                          Marked at: {new Date(record.marked_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📊</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Sessions
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {attendance.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">✅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Present
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {attendance.filter(r => r.status.toLowerCase() === 'present').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">❌</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Absent
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {attendance.filter(r => r.status.toLowerCase() === 'absent').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Attendance;