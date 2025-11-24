import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const QRScanner: React.FC = () => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [scanResult, setScanResult] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (scannerRef.current && !isScanning) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      const handleQRCodeScanned = async (decodedText: string) => {
        setScanResult(decodedText);
        try {
          setError('');
          setSuccess('');

          // Parse QR data (assuming it's a session ID)
          const sessionId = parseInt(decodedText);
          if (isNaN(sessionId)) {
            setError('Invalid QR code format');
            return;
          }

          // Mark attendance
          await axios.post(`${API_ENDPOINTS.ATTENDANCE}mark/${sessionId}/`);

          setSuccess('Attendance marked successfully!');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } catch (err: any) {
          setError(err.response?.data?.error || 'Failed to mark attendance');
        }
      };

      scanner.render(
        handleQRCodeScanned,
        (errorMessage: string) => {
          console.log('QR scan error:', errorMessage);
        }
      );

      setIsScanning(true);

      return () => {
        scanner.clear();
      };
    }
  }, [isScanning, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-md mx-auto">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Scan Instructions
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Point your camera at the QR code</li>
                      <li>Ensure good lighting</li>
                      <li>Hold steady until scanning completes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            {/* QR Scanner */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4">
                <div
                  id="qr-reader"
                  ref={scannerRef}
                  className="w-full"
                  style={{ minHeight: '300px' }}
                ></div>
              </div>
            </div>

            {/* Manual Entry (fallback) */}
            <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Manual Entry (if scanning fails)
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter session code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={scanResult}
                    onChange={(e) => setScanResult(e.target.value)}
                  />
                  <button
                    onClick={async () => {
                      try {
                        setError('');
                        setSuccess('');

                        const sessionId = parseInt(scanResult);
                        if (isNaN(sessionId)) {
                          setError('Invalid QR code format');
                          return;
                        }

                        await axios.post(`${API_ENDPOINTS.ATTENDANCE}mark/${sessionId}/`);;
                        setSuccess('Attendance marked successfully!');
                        setTimeout(() => navigate('/'), 2000);
                      } catch (err: any) {
                        setError(err.response?.data?.error || 'Failed to mark attendance');
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
                  >
                    Mark Attendance
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRScanner;