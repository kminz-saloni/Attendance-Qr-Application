import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { AuthContext } from './AuthContext';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text>Welcome, {user?.role}</Text>
      <Button title="Timetable" onPress={() => navigation.navigate('Timetable')} />
      <Button title="Attendance" onPress={() => navigation.navigate('Attendance')} />
      {user?.role === 'student' && <Button title="Scan QR" onPress={() => navigation.navigate('QRScanner')} />}
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

export default DashboardScreen;