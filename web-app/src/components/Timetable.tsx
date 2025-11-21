import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  date: string;
  day_of_week: number;
}

const Timetable: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const navigate = useNavigate();

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/sessions/');
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
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

  const getSessionsForDay = (day: number) => {
    return sessions
      .filter(session => session.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
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
              <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Day Selector */}
          <div className="mb-6">
            <div className="sm:hidden">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {daysOfWeek.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {daysOfWeek.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDay(index)}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                        selectedDay === index
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Sessions for Selected Day */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {daysOfWeek[selectedDay]} Schedule
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Your classes for {daysOfWeek[selectedDay].toLowerCase()}
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {getSessionsForDay(selectedDay).length === 0 ? (
                <li>
                  <div className="px-4 py-8 text-center">
                    <div className="text-gray-500 text-lg">No classes scheduled</div>
                    <div className="text-gray-400 text-sm mt-1">
                      Enjoy your {daysOfWeek[selectedDay].toLowerCase()}!
                    </div>
                  </div>
                </li>
              ) : (
                getSessionsForDay(selectedDay).map((session) => (
                  <li key={session.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {session.subject.code.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {session.subject.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {session.subject.code} • {session.class_group.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-900">
                            {formatTime(session.start_time)} - {formatTime(session.end_time)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {session.class_group.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Weekly Overview */}
          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Weekly Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {daysOfWeek.map((day, index) => {
                const daySessions = getSessionsForDay(index);
                return (
                  <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-xs font-medium">
                              {day.substring(0, 3)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              {day}
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {daySessions.length} {daySessions.length === 1 ? 'class' : 'classes'}
                            </dd>
                          </dl>
                        </div>
                      </div>
                      {daySessions.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-500">
                            Next: {formatTime(daySessions[0].start_time)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Timetable;