import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, AuthContext } from './AuthContext';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import DashboardScreen from './DashboardScreen';
import TimetableScreen from './TimetableScreen';
import AttendanceScreen from './AttendanceScreen';
import QRScannerScreen from './QRScannerScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Timetable" component={TimetableScreen} />
    <Tab.Screen name="Attendance" component={AttendanceScreen} />
  </Tab.Navigator>
);

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AuthContext.Consumer>
          {({ user, loading }) => {
            if (loading) return <Text>Loading...</Text>;
            return (
              <Stack.Navigator>
                {!user ? (
                  <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                  </>
                ) : (
                  <>
                    <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
                    <Stack.Screen name="QRScanner" component={QRScannerScreen} />
                  </>
                )}
              </Stack.Navigator>
            );
          }}
        </AuthContext.Consumer>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;