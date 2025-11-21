import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Session {
  id: number;
  subject: {
    name: string;
    code: string;
  };
  class_group: {
    name: string;
  };
  start_time: string;
  end_time: string;
  qr_code: string;
  date: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    fetchSessions();

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/sessions/');
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
              <h1 className="text-2xl font-bold text-gray-900">Attendance System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.first_name} {user?.last_name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Mobile Layout */}
          {isMobile ? (
            <div className="space-y-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Role
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 capitalize">
                          {user?.role}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions for Mobile */}
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/scan"
                  className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center"
                >
                  <div className="text-2xl mb-2">📱</div>
                  <div className="text-sm font-medium">Scan QR</div>
                </Link>
                <Link
                  to="/attendance"
                  className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center"
                >
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm font-medium">My Attendance</div>
                </Link>
                <Link
                  to="/timetable"
                  className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center"
                >
                  <div className="text-2xl mb-2">📅</div>
                  <div className="text-sm font-medium">Timetable</div>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg text-center"
                  >
                    <div className="text-2xl mb-2">⚙️</div>
                    <div className="text-sm font-medium">Admin</div>
                  </Link>
                )}
              </div>

              {/* Today's Sessions */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Today's Sessions
                  </h3>
                </div>
                <ul className="divide-y divide-gray-200">
                  {sessions.slice(0, 3).map((session) => (
                    <li key={session.id}>
                      <div className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">
                            {session.subject.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(session.start_time)} - {formatTime(session.end_time)}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          {session.class_group.name}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            /* Desktop Layout */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User Info Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-medium">
                          {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Full name
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {user?.first_name} {user?.last_name}
                        </dd>
                        <dt className="text-sm font-medium text-gray-500 truncate mt-2">
                          Role
                        </dt>
                        <dd className="text-sm text-gray-900 capitalize">
                          {user?.role}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      to="/scan"
                      className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition duration-200"
                    >
                      <div className="text-2xl mb-2">📱</div>
                      <div className="text-sm font-medium">Scan QR Code</div>
                    </Link>
                    <Link
                      to="/attendance"
                      className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition duration-200"
                    >
                      <div className="text-2xl mb-2">📊</div>
                      <div className="text-sm font-medium">View Attendance</div>
                    </Link>
                    <Link
                      to="/timetable"
                      className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition duration-200"
                    >
                      <div className="text-2xl mb-2">📅</div>
                      <div className="text-sm font-medium">Timetable</div>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg text-center transition duration-200"
                      >
                        <div className="text-2xl mb-2">⚙️</div>
                        <div className="text-sm font-medium">Admin Panel</div>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Today's Sessions */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Today's Sessions
                  </h3>
                </div>
                <ul className="divide-y divide-gray-200">
                  {sessions.slice(0, 5).map((session) => (
                    <li key={session.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">
                            {session.subject.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(session.start_time)} - {formatTime(session.end_time)}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          {session.class_group.name}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;