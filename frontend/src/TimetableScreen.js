import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import axios from 'axios';

const TimetableScreen = () => {
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/timetable/');
        setTimetable(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTimetable();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Timetable</Text>
      <FlatList
        data={timetable}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text>{item.subject.name} - {item.start_time} to {item.end_time} on {item.date}</Text>
        )}
      />
    </View>
  );
};

export default TimetableScreen;