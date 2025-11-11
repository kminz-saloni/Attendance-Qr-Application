import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem('access_token');
      const role = await AsyncStorage.getItem('role');
      const userId = await AsyncStorage.getItem('user_id');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser({ token, role, userId });
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', { username, password });
      const { access, role, user_id } = response.data;
      await AsyncStorage.setItem('access_token', access);
      await AsyncStorage.setItem('role', role);
      await AsyncStorage.setItem('user_id', user_id);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      setUser({ token: access, role, userId: user_id });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('role');
    await AsyncStorage.removeItem('user_id');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};