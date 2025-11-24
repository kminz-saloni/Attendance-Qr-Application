import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import Layout from '../shared/Layout';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const QRScannerStudent: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
    const [isInitializing, setIsInitializing] = useState(true);
    const navigate = useNavigate();
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const isMountedRef = useRef(true);

    const onScanSuccess = useCallback(async (decodedText: string) => {
        console.log('QR Code scanned:', decodedText);

        // Stop scanner immediately
        if (scannerRef.current) {
            try {
                await scannerRef.current.clear();
                scannerRef.current = null;
            } catch (err) {
                console.error('Error clearing scanner:', err);
            }
        }

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Extract session ID from QR code (format: "session_id-timestamp")
            const sessionId = decodedText.split('-')[0];

            await axios.post(
                API_ENDPOINTS.MARK_ATTENDANCE,
                {
                    qr_code: decodedText,
                    session_id: sessionId
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSuccess(true);
            setTimeout(() => {
                navigate('/student/dashboard');
            }, 2000);

        } catch (err: any) {
            console.error('Attendance marking failed:', err);

            // Parse structured error from backend
            let errorMessage = 'Failed to mark attendance. Please try again.';

            if (err.response?.data) {
                const data = err.response.data;
                // Handle structured error object
                if (data.error && typeof data.error === 'string') {
                    errorMessage = data.error;
                    if (data.details) errorMessage += `\n\n${data.details}`;
                    if (data.suggestion) errorMessage += `\n\n💡 ${data.suggestion}`;
                }
                // Handle simple error string
                else if (data.error) {
                    errorMessage = String(data.error);
                }
                // Handle detail field (common in DRF)
                else if (data.detail) {
                    errorMessage = String(data.detail);
                }
            }

            setError(errorMessage);

            // Re-initialize scanner after error (optional, maybe user wants to read error first)
            // For now, we leave it stopped so user can read the error
        }
    }, [navigate]);

    const onScanError = (errorMessage: string) => {
        // ignore scan errors, they happen when no QR code is in frame
    };

    useEffect(() => {
        isMountedRef.current = true;
        let scanner: Html5QrcodeScanner | null = null;

        const initializeScanner = async () => {
            console.log('Initializing QR scanner...');

            // Check if DOM element exists
            const element = document.getElementById('qr-reader');
            if (!element) {
                console.error('QR reader element not found');
                setError('Scanner initialization failed. Please refresh the page.');
                setIsInitializing(false);
                return;
            }

            try {
                // Request camera permission explicitly
                console.log('Requesting camera permission...');
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                console.log('Camera permission granted');
                setCameraPermission('granted');

                // Stop the test stream
                stream.getTracks().forEach(track => track.stop());

                // Initialize scanner after permission is granted
                if (!isMountedRef.current) return;

                scanner = new Html5QrcodeScanner(
                    'qr-reader',
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                        showTorchButtonIfSupported: true,
                        showZoomSliderIfSupported: true,
                        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                    },
                    /* verbose= */ true
                );

                console.log('Rendering scanner...');
                scanner.render(onScanSuccess, onScanError);
                scannerRef.current = scanner;
                setIsInitializing(false);
                console.log('Scanner initialized successfully');

            } catch (err: any) {
                console.error('Camera initialization error:', err);
                setCameraPermission('denied');
                setIsInitializing(false);

                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setError('Camera permission denied. Please allow camera access and refresh the page.');
                } else if (err.name === 'NotFoundError') {
                    setError('No camera found on this device.');
                } else if (err.name === 'NotReadableError') {
                    setError('Camera is already in use by another application.');
                } else {
                    setError(`Camera error: ${err.message || 'Unknown error'}`);
                }
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            initializeScanner();
        }, 100);

        return () => {
            isMountedRef.current = false;
            clearTimeout(timer);
            if (scannerRef.current) {
                console.log('Cleaning up scanner...');
                scannerRef.current.clear().catch((err) => {
                    console.error('Error clearing scanner:', err);
                });
                scannerRef.current = null;
            }
        };
    }, [onScanSuccess]);

    return (
        <Layout>
            <div className="max-w-md mx-auto p-4">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Scan QR Code</h1>
                    <p className="text-gray-600 mt-1">Point your camera at the QR code displayed by your teacher</p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-2xl p-6 text-center animate-bounce">
                        <div className="text-6xl mb-3">✅</div>
                        <h2 className="text-xl font-bold text-green-700 mb-2">Attendance Marked!</h2>
                        <p className="text-green-600">Redirecting to dashboard...</p>
                    </div>
                )}
                {isInitializing && !error && (
                    <div className="mb-6 bg-blue-50 border-2 border-blue-500 rounded-2xl p-4">
                        <div className="flex items-start">
                            <span className="text-2xl mr-3">📷</span>
                            <div>
                                <h3 className="font-semibold text-blue-700 mb-1">Requesting Camera Access</h3>
                                <p className="text-blue-600 text-sm">Please allow camera access when prompted...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* QR Scanner */}
                {!success && !error && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div id="qr-reader" className="w-full"></div>
                    </div>
                )}

                {/* Instructions */}
                {!success && (
                    <div className="mt-6 bg-gray-50 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">📋 Instructions</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start">
                                <span className="mr-2">1.</span>
                                <span>Allow camera access when prompted by your browser</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">2.</span>
                                <span>Make sure you're in the correct class</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">3.</span>
                                <span>Point your camera at the QR code on the teacher's screen</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">4.</span>
                                <span>Hold steady until the code is scanned</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">5.</span>
                                <span>Wait for confirmation</span>
                            </li>
                        </ul>

                        {cameraPermission === 'denied' && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs text-yellow-800">
                                    <strong>Tip:</strong> If you denied camera access, you can enable it in your browser settings:
                                    <br />• Chrome/Edge: Click the camera icon in the address bar
                                    <br />• Firefox: Click the permissions icon in the address bar
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                        <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
                        <p className="text-sm text-red-700 whitespace-pre-wrap">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default QRScannerStudent;
