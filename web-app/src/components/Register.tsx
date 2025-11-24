import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Subject {
  id: number;
  name: string;
  code: string;
  year: number;
  display_name: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    role: 'student' as 'student' | 'faculty',
    // Student-specific fields
    department: '',
    section: '',
    year: '',
    subjects: [] as number[],
  });

  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch subjects when year changes
  useEffect(() => {
    if (formData.role === 'student' && formData.year) {
      fetchSubjects(parseInt(formData.year));
    } else {
      setAvailableSubjects([]);
      setFormData(prev => ({ ...prev, subjects: [] }));
    }
  }, [formData.year, formData.role]);

  const fetchSubjects = async (year: number) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/subjects/?year=${year}`);
      setAvailableSubjects(response.data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubjectToggle = (subjectId: number) => {
    setFormData(prev => {
      const isSelected = prev.subjects.includes(subjectId);
      let newSubjects: number[];

      if (isSelected) {
        newSubjects = prev.subjects.filter(id => id !== subjectId);
      } else {
        if (prev.subjects.length >= 7) {
          setError('You can only select exactly 7 subjects');
          return prev;
        }
        newSubjects = [...prev.subjects, subjectId];
      }

      setError('');
      return { ...prev, subjects: newSubjects };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return;
    }

    // Validate student fields if role is student
    if (formData.role === 'student') {
      if (!formData.department || !formData.section || !formData.year) {
        setError('Please fill in all student information fields');
        return;
      }

      if (formData.subjects.length !== 7) {
        setError(`You must select exactly 7 subjects. Currently selected: ${formData.subjects.length}`);
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = formData.role === 'student'
        ? 'http://127.0.0.1:8000/api/register/student/'
        : 'http://127.0.0.1:8000/api/register/faculty/';

      await axios.post(endpoint, formData);

      if (formData.role === 'faculty') {
        setError('Faculty registration submitted. Please wait for admin approval.');
        setIsLoading(false);
        return;
      }

      navigate('/login');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Registration failed';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`${error.includes('submitted') ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded`}>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <select
                id="role"
                name="role"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty (Requires Admin Approval)</option>
              </select>
            </div>

            {/* Conditional Student Fields */}
            {formData.role === 'student' && (
              <>
                <div>
                  <select
                    id="department"
                    name="department"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">Computer Science Engineering</option>
                    <option value="ECE">Electronics and Communication Engineering</option>
                    <option value="EE">Electrical Engineering</option>
                  </select>
                </div>
                <div>
                  <select
                    id="section"
                    name="section"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.section}
                    onChange={handleChange}
                  >
                    <option value="">Select Section</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <select
                    id="year"
                    name="year"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.year}
                    onChange={handleChange}
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                {/* Subject Selection */}
                {formData.year && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Exactly 7 Subjects ({formData.subjects.length}/7 selected)
                    </label>
                    <div className="border border-gray-300 rounded-md p-4 max-h-64 overflow-y-auto bg-white">
                      {availableSubjects.length === 0 ? (
                        <p className="text-gray-500 text-sm">Loading subjects...</p>
                      ) : (
                        <div className="space-y-2">
                          {availableSubjects.map(subject => (
                            <label
                              key={subject.id}
                              className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-50 ${formData.subjects.includes(subject.id) ? 'bg-blue-50 border border-blue-300' : ''
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.subjects.includes(subject.id)}
                                onChange={() => handleSubjectToggle(subject.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-3 text-sm text-gray-900">
                                <span className="font-semibold">{subject.code}</span> - {subject.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                id="password2"
                name="password2"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm Password"
                value={formData.password2}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || (formData.role === 'student' && formData.subjects.length !== 7)}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;