import React, { useState, useRef, useEffect } from 'react';

/**
 * Mock QR payment modal.
 * Shows the device camera (HTML5 getUserMedia) and a "Capture" button.
 * In a real app the captured image would be sent to a QR‑reading service.
 * Here we simulate a successful scan after the user clicks Capture.
 */
export default function QRPaymentModal({ onClose, onSuccess, requestId }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Request camera access when modal opens
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => setError('Camera access denied'));
    // Cleanup on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    // Mock transaction reference – in real life this would be read from the QR code
    const mockTransactionRef = `QR-${Date.now()}`;
    // Call backend to mark payment as paid
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/rent-requests/${requestId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: 'qr', transaction_ref: mockTransactionRef }),
      });
      if (res.ok) onSuccess();
      else throw new Error('Payment API error');
    } catch (e) {
      setError('Payment failed');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>QR Scan to Pay</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <video ref={videoRef} autoPlay style={{ width: '100%', maxHeight: '300px' }} />
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <button className="req-btn" onClick={handleCapture}>Capture & Pay</button>
          <button className="req-btn req-btn-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
