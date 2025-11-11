import React from 'react';
import { View, Text, Alert } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import axios from 'axios';

const QRScannerScreen = ({ navigation }) => {
  const onSuccess = async (e) => {
    const qrData = e.data;
    const [sessionId, timestamp] = qrData.split('-');
    try {
      await axios.post('http://127.0.0.1:8000/api/mark-attendance/', {
        session_id: sessionId,
        qr_code: qrData
      });
      Alert.alert('Success', 'Attendance marked');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark attendance');
    }
  };

  return (
    <QRCodeScanner
      onRead={onSuccess}
      topContent={<Text>Scan QR Code for Attendance</Text>}
      bottomContent={<Text>Align QR code within the frame</Text>}
    />
  );
};

export default QRScannerScreen;