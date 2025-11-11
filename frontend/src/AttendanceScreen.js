import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import axios from 'axios';

const AttendanceScreen = () => {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/attendance/');
        setAttendance(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Attendance</Text>
      <FlatList
        data={attendance}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text>{item.session.subject.name} - {item.marked_at}</Text>
        )}
      />
    </View>
  );
};

export default AttendanceScreen;