import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Picker } from 'react-native';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [branch, setBranch] = useState('CSE');
  const [section, setSection] = useState('A');
  const [year, setYear] = useState(1);

  const handleRegister = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/register/student/', {
        username, email, password, first_name: firstName, last_name: lastName,
        department, branch, section, year
      });
      Alert.alert('Success', 'Registered successfully');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Registration failed');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text>Register</Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <TextInput placeholder="Last Name" value={lastName} onChangeText={setLastName} />
      <Picker selectedValue={department} onValueChange={setDepartment}>
        <Picker.Item label="CSE" value="CSE" />
        <Picker.Item label="ECE" value="ECE" />
        <Picker.Item label="EE" value="EE" />
      </Picker>
      <Picker selectedValue={section} onValueChange={setSection}>
        <Picker.Item label="A" value="A" />
        <Picker.Item label="B" value="B" />
      </Picker>
      <Picker selectedValue={year} onValueChange={(itemValue) => setYear(itemValue)}>
        <Picker.Item label="1st Year" value={1} />
        <Picker.Item label="2nd Year" value={2} />
        <Picker.Item label="3rd Year" value={3} />
        <Picker.Item label="4th Year" value={4} />
      </Picker>
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
};

export default RegisterScreen;