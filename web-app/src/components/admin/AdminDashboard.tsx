import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // eslint-disable-line @typescript-eslint/no-unused-vars
import Layout from '../shared/Layout';
import axios from 'axios';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
}

const AdminDashboard: React.FC = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [faculty, setFaculty] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/users/');
            const users = response.data;
            setStudents(users.filter((u: User) => u.role === 'student'));
            setFaculty(users.filter((u: User) => u.role === 'faculty'));
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
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
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                        Admin Dashboard 🎯
                    </h1>
                    <p className="text-indigo-100">Manage users and monitor the system</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow">
                        <div className="text-center">
                            <p className="text-4xl mb-2">👨‍🎓</p>
                            <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                            <p className="text-sm text-gray-600 mt-1">Total Students</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow">
                        <div className="text-center">
                            <p className="text-4xl mb-2">👨‍🏫</p>
                            <p className="text-3xl font-bold text-gray-900">{faculty.length}</p>
                            <p className="text-sm text-gray-600 mt-1">Faculty Members</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow">
                        <div className="text-center">
                            <p className="text-4xl mb-2">✅</p>
                            <p className="text-3xl font-bold text-green-600">Active</p>
                            <p className="text-sm text-gray-600 mt-1">System Status</p>
                        </div>
                    </div>
                </div>

                {/* Students List */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Students ({students.length})</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.slice(0, 10).map((student) => (
                                    <tr key={student.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {student.first_name} {student.last_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{student.username}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{student.email}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Faculty List */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Faculty ({faculty.length})</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {faculty.map((fac) => (
                                    <tr key={fac.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {fac.first_name} {fac.last_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{fac.username}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{fac.email}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a
                            href="http://localhost:8000/admin"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Django Admin</h3>
                                    <p className="text-blue-100 text-sm">Manage database directly</p>
                                </div>
                                <div className="text-5xl">⚙️</div>
                            </div>
                        </a>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">System Info</h3>
                                    <p className="text-purple-100 text-sm">All systems operational</p>
                                </div>
                                <div className="text-5xl">✅</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
