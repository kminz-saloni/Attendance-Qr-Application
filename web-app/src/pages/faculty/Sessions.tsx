import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import { useAuth } from '../../contexts/AuthContext'; // eslint-disable-line @typescript-eslint/no-unused-vars
import Layout from '../../components/shared/Layout';

interface Subject {
    id: number;
    name: string;
    code: string;
    year: number;
    display_name: string;
}

interface ClassGroup {
    id: number;
    name: string;
    year: number;
    department: string;
    section: string;
}

interface Session {
    id: number;
    subject: { name: string; code: string };
    class_group: { name: string };
    date: string;
    start_time: string;
    end_time: string;
    active: boolean;
}

const Sessions: React.FC = () => {
    // const { user } = useAuth(); // eslint-disable-line @typescript-eslint/no-unused-vars
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mySubjects, setMySubjects] = useState<Subject[]>([]);
    const [availableClassGroups, setAvailableClassGroups] = useState<ClassGroup[]>([]);
    const [form, setForm] = useState({
        subject_id: '',
        class_group_id: '',
        date: '',
        start_time: '',
        end_time: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchData = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch sessions, subjects, and class groups in parallel
            const [sessionsRes, subjectsRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/sessions/', config),
                axios.get('http://127.0.0.1:8000/api/faculty/my-subjects/', config),
            ]);

            setSessions(sessionsRes.data);
            setMySubjects(subjectsRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch class groups when subject is selected
    useEffect(() => {
        if (form.subject_id) {
            fetchClassGroups(form.subject_id);
        } else {
            setAvailableClassGroups([]);
            setForm(prev => ({ ...prev, class_group_id: '' }));
        }
    }, [form.subject_id]);

    const fetchClassGroups = async (subjectId: string) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(
                `http://127.0.0.1:8000/api/faculty/my-class-groups/?subject_id=${subjectId}`,
                config
            );
            setAvailableClassGroups(response.data);

            if (response.data.length === 0) {
                setError('No class groups found for this subject. Students need to register first.');
            } else {
                setError('');
            }
        } catch (err) {
            console.error('Failed to fetch class groups:', err);
            setError('Failed to load class groups');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(
                'http://127.0.0.1:8000/api/sessions/',
                form,
                config
            );

            setSuccess('Session created successfully!');
            // Refresh list after creation
            fetchData();
            // Reset form
            setForm({
                subject_id: '',
                class_group_id: '',
                date: '',
                start_time: '',
                end_time: '',
            });
        } catch (err: any) {
            console.error('Failed to create session:', err);
            const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to create session';
            setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
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
            <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Manage Sessions 📅</h1>
                    <p className="text-purple-100">Create and manage your class sessions</p>
                </div>

                {/* Create Session Form */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule New Session</h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subject *
                            </label>
                            <select
                                name="subject_id"
                                value={form.subject_id}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select a subject</option>
                                {mySubjects.map(subject => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.code} - {subject.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Class Group *
                            </label>
                            <select
                                name="class_group_id"
                                value={form.class_group_id}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={!form.subject_id}
                            >
                                <option value="">
                                    {!form.subject_id ? 'Select a subject first' : 'Select a class group'}
                                </option>
                                {availableClassGroups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                            {form.subject_id && availableClassGroups.length === 0 && (
                                <p className="text-sm text-amber-600 mt-1">
                                    ⚠️ No class groups available for this subject
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time *
                            </label>
                            <input
                                type="time"
                                name="start_time"
                                value={form.start_time}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time *
                            </label>
                            <input
                                type="time"
                                name="end_time"
                                value={form.end_time}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={!form.subject_id || !form.class_group_id}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create Session
                            </button>
                        </div>
                    </form>
                </div>

                {/* Existing Sessions */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Your Sessions</h3>
                    {sessions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-5xl mb-3">📚</p>
                            <p className="text-lg font-medium">No sessions yet</p>
                            <p className="text-sm mt-1">Create your first session above</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sessions.map((s) => (
                                <div
                                    key={s.id}
                                    className={`border-2 rounded-xl p-4 transition-all ${s.active
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-bold text-gray-900">
                                                    {s.subject.code} - {s.subject.name}
                                                </h3>
                                                {s.active && (
                                                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                                                        LIVE
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {s.class_group.name} • {s.date}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                🕐 {s.start_time} - {s.end_time}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/faculty/session/${s.id}`)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${s.active
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                        >
                                            {s.active ? 'Manage' : 'Start'}
                                        </button>
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

export default Sessions;
