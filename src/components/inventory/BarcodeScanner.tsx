import React, { useState, useRef } from 'react';
import { Camera, X, Scan, AlertCircle, CheckCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onScanResult: (barcode: string, productData?: any) => void;
  onClose: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanResult, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError('');
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions or enter barcode manually.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualEntry = () => {
    if (manualBarcode.trim()) {
      // Simulate product lookup
      const mockProductData = {
        name: 'Product from Barcode',
        category: 'other',
        brand: 'Unknown Brand'
      };
      onScanResult(manualBarcode.trim(), mockProductData);
    }
  };

  const simulateScan = () => {
    // Simulate a successful barcode scan for demo purposes
    const mockBarcode = '1234567890123';
    const mockProductData = {
      name: 'Organic Bananas',
      category: 'fruits',
      brand: 'Fresh Farm',
      description: 'Fresh organic bananas'
    };
    onScanResult(mockBarcode, mockProductData);
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Scan Barcode</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Camera Section */}
          <div className="text-center">
            {!isScanning ? (
              <div className="space-y-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
                <button
                  onClick={startCamera}
                  className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Start Camera
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-32 border-2 border-emerald-400 rounded-lg">
                      <div className="w-full h-full border border-emerald-400 border-dashed rounded-lg flex items-center justify-center">
                        <Scan className="h-8 w-8 text-emerald-400 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={stopCamera}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Stop Camera
                  </button>
                  <button
                    onClick={simulateScan}
                    className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Demo Scan
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Manual Entry Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Or Enter Manually</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter barcode number..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                onClick={handleManualEntry}
                disabled={!manualBarcode.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lookup Product
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Scanning Tips:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Hold the barcode steady within the frame</li>
                  <li>• Ensure good lighting</li>
                  <li>• Keep the camera 6-8 inches from the barcode</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};